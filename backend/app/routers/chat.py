"""
Chat router - AI Virtual Guru conversational interface.
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from app.models.user import User
from app.models.schemas import ChatMessageRequest, ChatMessageResponse, ConversationResponse
from app.services.auth_service import get_current_user
from app.db.mongodb import get_database

router = APIRouter()


# ─── Indian Classical Music system prompt for the AI Guru ───
GURU_SYSTEM_PROMPT = """You are SwaraGPT, an AI-powered Virtual Guru (teacher) specializing in Indian Classical Music education.

Your expertise covers:
- **Swaras**: Sa, Re, Ga, Ma, Pa, Dha, Ni (Shuddha, Komal, and Tivra variants)
- **Ragas**: All major Hindustani and Carnatic ragas, their aroha/avaroha, vadi/samvadi, pakad phrases
- **Thaats**: All 10 Hindustani thaats (Bilawal, Khamaj, Kafi, Asavari, Bhairavi, Bhairav, Kalyan, Marwa, Poorvi, Todi)
- **Taals**: Teentaal, Ektaal, Jhaptaal, Rupak, and others
- **Singing Techniques**: Alankar, meend, gamak, taan, murki, kan-swar
- **Music Theory**: Shruti, pitch, octaves, saptak (Mandra, Madhya, Taar)
- **Compositions**: Bandish, Khyal, Dhrupad, Thumri styles
- **Practice Guidance**: Personalized exercises for pitch accuracy, voice training

Guidelines:
1. Be warm, encouraging, and patient like a traditional Guru
2. Use Hindi/Sanskrit musical terms with English explanations
3. When explaining ragas, always mention the thaat, aroha/avaroha, vadi, samvadi
4. Provide practical singing exercises when relevant
5. Reference the student's past performance when available
6. Keep responses concise but thorough
"""


@router.post("/message", response_model=ChatMessageResponse)
async def send_message(
    request: ChatMessageRequest,
    current_user: User = Depends(get_current_user),
):
    """Send a message to the AI Virtual Guru and get a response."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    conversation_id = request.conversation_id or str(uuid4())
    now = datetime.now(timezone.utc)

    # Store user message
    user_msg = {
        "id": str(uuid4()),
        "conversation_id": conversation_id,
        "user_id": str(current_user.id),
        "role": "user",
        "content": request.message,
        "created_at": now,
    }
    await db.chat_messages.insert_one(user_msg)

    # Generate AI response (placeholder - will integrate OpenAI)
    ai_response_content = await generate_guru_response(
        message=request.message,
        conversation_id=conversation_id,
        user_id=str(current_user.id),
    )

    # Store assistant message
    assistant_msg = {
        "id": str(uuid4()),
        "conversation_id": conversation_id,
        "user_id": str(current_user.id),
        "role": "assistant",
        "content": ai_response_content,
        "created_at": datetime.now(timezone.utc),
    }
    await db.chat_messages.insert_one(assistant_msg)

    # Update or create conversation
    await db.conversations.update_one(
        {"id": conversation_id, "user_id": str(current_user.id)},
        {
            "$set": {
                "title": request.message[:50],
                "last_message": ai_response_content[:100],
                "updated_at": datetime.now(timezone.utc),
            },
            "$setOnInsert": {
                "id": conversation_id,
                "user_id": str(current_user.id),
                "created_at": now,
            },
        },
        upsert=True,
    )

    return ChatMessageResponse(
        id=assistant_msg["id"],
        role="assistant",
        content=ai_response_content,
        conversation_id=conversation_id,
        created_at=assistant_msg["created_at"],
    )


@router.get("/history/{conversation_id}", response_model=list[ChatMessageResponse])
async def get_chat_history(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get chat history for a specific conversation."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    messages = await db.chat_messages.find(
        {"conversation_id": conversation_id, "user_id": str(current_user.id)}
    ).sort("created_at", 1).to_list(length=100)

    return [
        ChatMessageResponse(
            id=msg["id"],
            role=msg["role"],
            content=msg["content"],
            conversation_id=msg["conversation_id"],
            created_at=msg["created_at"],
        )
        for msg in messages
    ]


@router.get("/conversations", response_model=list[ConversationResponse])
async def get_conversations(
    current_user: User = Depends(get_current_user),
):
    """Get all conversations for the current user."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    conversations = await db.conversations.find(
        {"user_id": str(current_user.id)}
    ).sort("updated_at", -1).to_list(length=50)

    return [
        ConversationResponse(
            id=conv["id"],
            title=conv.get("title", "New Conversation"),
            last_message=conv.get("last_message"),
            created_at=conv["created_at"],
            updated_at=conv["updated_at"],
        )
        for conv in conversations
    ]


async def generate_guru_response(message: str, conversation_id: str, user_id: str) -> str:
    """
    Generate AI Guru response. Uses OpenAI if configured, 
    otherwise falls back to a knowledgeable rule-based response.
    """
    from app.config import settings

    if settings.OPENAI_API_KEY:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

            # Get recent conversation context
            db = get_database()
            recent_messages = await db.chat_messages.find(
                {"conversation_id": conversation_id}
            ).sort("created_at", -1).to_list(length=10)

            messages = [{"role": "system", "content": GURU_SYSTEM_PROMPT}]
            for msg in reversed(recent_messages):
                messages.append({"role": msg["role"], "content": msg["content"]})

            response = await client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=messages,
                max_tokens=1000,
                temperature=0.7,
            )
            return response.choices[0].message.content

        except Exception as e:
            print(f"OpenAI API error: {e}")
            return _get_fallback_response(message)
    else:
        return _get_fallback_response(message)


def _get_fallback_response(message: str) -> str:
    """Rule-based fallback when OpenAI is not configured."""
    message_lower = message.lower()

    if any(word in message_lower for word in ["raga", "raag"]):
        return (
            "🎵 **Raga** is the melodic framework in Indian Classical Music. "
            "Each raga has a specific set of swaras (notes) arranged in ascending (aroha) "
            "and descending (avaroha) patterns.\n\n"
            "For example, **Raga Yaman** (Thaat: Kalyan):\n"
            "- Aroha: Ni Re Ga Ma(tivra) Dha Ni Sā\n"
            "- Avaroha: Sā Ni Dha Pa Ma(tivra) Ga Re Sa\n"
            "- Vadi: Ga | Samvadi: Ni\n\n"
            "Would you like me to explain a specific raga in detail? 🎶"
        )
    elif any(word in message_lower for word in ["swara", "swar", "note"]):
        return (
            "🎵 The **seven swaras** (Saptaswar) are the foundation of Indian Classical Music:\n\n"
            "| Swara | Full Name | Western Equivalent |\n"
            "|-------|-----------|-------------------|\n"
            "| Sa | Shadja | C |\n"
            "| Re | Rishabh | D |\n"
            "| Ga | Gandhar | E |\n"
            "| Ma | Madhyam | F |\n"
            "| Pa | Pancham | G |\n"
            "| Dha | Dhaivat | A |\n"
            "| Ni | Nishad | B |\n\n"
            "Each swara (except Sa and Pa) has **Komal** (flat) and **Tivra** (sharp) variants. "
            "Would you like to practice any specific swara? 🎶"
        )
    elif any(word in message_lower for word in ["thaat", "that"]):
        return (
            "🎵 **Thaats** are the parent scales in Hindustani Classical Music. "
            "There are **10 thaats** defined by Pt. Vishnu Narayan Bhatkhande:\n\n"
            "1. **Bilawal** - All Shuddha swaras\n"
            "2. **Khamaj** - Ni Komal\n"
            "3. **Kafi** - Ga Komal, Ni Komal\n"
            "4. **Asavari** - Ga, Dha, Ni Komal\n"
            "5. **Bhairavi** - Re, Ga, Dha, Ni Komal\n"
            "6. **Bhairav** - Re Komal, Dha Komal\n"
            "7. **Kalyan** - Ma Tivra\n"
            "8. **Marwa** - Re Komal, Ma Tivra\n"
            "9. **Poorvi** - Re Komal, Ma Tivra, Dha Komal\n"
            "10. **Todi** - Re, Ga, Dha Komal, Ma Tivra\n\n"
            "Each thaat serves as the parent scale for multiple ragas. 🎶"
        )
    elif any(word in message_lower for word in ["practice", "exercise", "alankar"]):
        return (
            "🎵 Here's a great **Alankar** (vocal exercise) for beginners:\n\n"
            "**Basic Alankar 1 (Ascending-Descending):**\n"
            "```\n"
            "Sa Re Ga Ma Pa Dha Ni Sā\n"
            "Sā Ni Dha Pa Ma Ga Re Sa\n"
            "```\n\n"
            "**Alankar 2 (Pattern-based):**\n"
            "```\n"
            "Sa Re Ga | Re Ga Ma | Ga Ma Pa | Ma Pa Dha | Pa Dha Ni | Dha Ni Sā\n"
            "Sā Ni Dha | Ni Dha Pa | Dha Pa Ma | Pa Ma Ga | Ma Ga Re | Ga Re Sa\n"
            "```\n\n"
            "🎯 **Tips:**\n"
            "- Practice with tanpura drone in the background\n"
            "- Start slow and gradually increase speed\n"
            "- Focus on pitch accuracy over speed\n"
            "- Record yourself and compare!\n\n"
            "Would you like more advanced exercises? 🎶"
        )
    else:
        return (
            "🙏 **Namaste!** I am SwaraGPT, your AI Virtual Guru for Indian Classical Music.\n\n"
            "I can help you with:\n"
            "- 🎵 **Raga** explanations and characteristics\n"
            "- 🎤 **Swara** (notes) theory and practice\n"
            "- 📝 **Thaat** (scale) structures\n"
            "- 🎯 **Practice exercises** and alankars\n"
            "- 📊 **Vocal analysis** of your singing recordings\n"
            "- 💡 **Personalized feedback** and improvement tips\n\n"
            "Feel free to ask me anything about Indian Classical Music, "
            "or upload a recording for analysis! 🎶"
        )
