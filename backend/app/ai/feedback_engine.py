"""
Feedback Engine - Generates personalized AI feedback using LLM.
Aggregates pitch, swara, and raga analysis into actionable advice.
"""
from typing import Optional
from app.config import settings


async def generate_feedback(
    pitch_data: dict,
    swara_data: list[dict],
    raga_data: list[dict],
) -> dict:
    """
    Generate comprehensive AI feedback from analysis results.
    Uses OpenAI GPT if available, otherwise generates structured feedback.
    """
    # Calculate overall score
    pitch_stability = pitch_data.get("pitch_stability", 0)
    swara_accuracies = [s.get("accuracy", 0) for s in swara_data]
    avg_swara_accuracy = sum(swara_accuracies) / len(swara_accuracies) if swara_accuracies else 0
    raga_confidence = raga_data[0].get("confidence", 0) * 100 if raga_data else 0

    overall_score = round((pitch_stability * 0.3 + avg_swara_accuracy * 0.4 + raga_confidence * 0.3), 1)

    # Try OpenAI for feedback
    if settings.OPENAI_API_KEY:
        try:
            feedback_text = await _generate_llm_feedback(pitch_data, swara_data, raga_data, overall_score)
        except Exception as e:
            print(f"LLM feedback error: {e}")
            feedback_text = _generate_rule_based_feedback(pitch_data, swara_data, raga_data, overall_score)
    else:
        feedback_text = _generate_rule_based_feedback(pitch_data, swara_data, raga_data, overall_score)

    # Generate practice recommendations
    recommendations = _generate_recommendations(pitch_data, swara_data, raga_data, overall_score)

    return {
        "overall_score": overall_score,
        "feedback_text": feedback_text,
        "recommendations": recommendations,
    }


async def _generate_llm_feedback(
    pitch_data: dict,
    swara_data: list[dict],
    raga_data: list[dict],
    overall_score: float,
) -> str:
    """Generate feedback using OpenAI GPT."""
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    # Construct analysis summary for the LLM
    swara_seq = " → ".join([s["swara"] for s in swara_data[:15]])
    weak_swaras = [s["swara"] for s in swara_data if s.get("accuracy", 100) < 70]
    top_raga = raga_data[0]["raga_name"] if raga_data else "Unknown"

    prompt = f"""As SwaraGPT Virtual Guru, provide detailed, personalized singing feedback.

ANALYSIS RESULTS:
- Overall Score: {overall_score}/100
- Pitch Stability: {pitch_data.get('pitch_stability', 0)}%
- Mean Pitch: {pitch_data.get('mean_pitch', 0)} Hz
- Detected Swara Sequence: {swara_seq}
- Weak Swaras (accuracy < 70%): {', '.join(weak_swaras) if weak_swaras else 'None'}
- Most Likely Raga: {top_raga} (confidence: {raga_data[0].get('confidence', 0)*100:.0f}%)
- Shruti Deviation: {pitch_data.get('shruti_deviation', 0):.1f} cents

Provide:
1. A warm greeting and overall assessment
2. What the student did well (be specific)
3. Areas for improvement with specific swara/pitch issues
4. 2-3 targeted practice exercises
5. Encouraging closing words

Use Hindi/Sanskrit musical terms with brief English explanations."""

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": "You are SwaraGPT, an expert Indian Classical Music guru."},
            {"role": "user", "content": prompt},
        ],
        max_tokens=800,
        temperature=0.7,
    )

    return response.choices[0].message.content


def _generate_rule_based_feedback(
    pitch_data: dict,
    swara_data: list[dict],
    raga_data: list[dict],
    overall_score: float,
) -> str:
    """Generate structured feedback without LLM."""
    pitch_stability = pitch_data.get("pitch_stability", 0)
    weak_swaras = [s["swara"] for s in swara_data if s.get("accuracy", 100) < 70]
    strong_swaras = [s["swara"] for s in swara_data if s.get("accuracy", 0) >= 85]
    top_raga = raga_data[0]["raga_name"] if raga_data else "Unknown"
    raga_confidence = raga_data[0].get("confidence", 0) * 100 if raga_data else 0

    feedback = f"""🙏 **Namaste, Shishya (Student)!**

Here is your detailed vocal performance analysis:

### 📊 Overall Score: **{overall_score:.0f}/100**

### ✅ What You Did Well:
"""
    if strong_swaras:
        feedback += f"- Your rendering of **{', '.join(set(strong_swaras))}** was excellent with high pitch accuracy.\n"
    if pitch_stability > 70:
        feedback += f"- Good pitch stability ({pitch_stability:.0f}%) — your voice control shows promise!\n"
    if raga_confidence > 60:
        feedback += f"- The swara pattern clearly suggests **Raga {top_raga}** ({raga_confidence:.0f}% match).\n"

    feedback += "\n### ⚠️ Areas for Improvement:\n"
    if weak_swaras:
        feedback += f"- **{', '.join(set(weak_swaras))}** need more practice — the pitch was slightly off.\n"
    if pitch_stability < 70:
        feedback += f"- Pitch stability ({pitch_stability:.0f}%) can be improved with sustained note (alankar) practice.\n"
    
    shruti_dev = pitch_data.get("shruti_deviation", 0)
    if shruti_dev > 15:
        feedback += f"- Shruti accuracy needs attention (deviation: {shruti_dev:.1f} cents). Practice with tanpura.\n"

    feedback += f"""
### 🎯 Practice Recommendations:
1. Practice Sa-Pa-Sa alankar for 10 minutes daily to improve pitch stability
2. Focus on {', '.join(set(weak_swaras)[:3]) if weak_swaras else 'all swaras'} with slow, sustained notes
3. Sing along with a tanpura drone to improve shruti alignment

Keep practicing with dedication! 🎶 *"Riyaz hi safalta ki kunji hai"* (Practice is the key to success!)
"""
    return feedback


def _generate_recommendations(
    pitch_data: dict,
    swara_data: list[dict],
    raga_data: list[dict],
    overall_score: float,
) -> list[str]:
    """Generate targeted practice recommendations."""
    recommendations = []
    
    pitch_stability = pitch_data.get("pitch_stability", 0)
    weak_swaras = [s["swara"] for s in swara_data if s.get("accuracy", 100) < 70]

    if pitch_stability < 60:
        recommendations.append("Practice long sustained notes (kharaj) for 15 minutes daily")
    
    if weak_swaras:
        recommendations.append(f"Focus on {', '.join(set(weak_swaras)[:3])} — practice them in isolation with tanpura")
    
    recommendations.append("Sing basic alankar patterns (Sa Re Ga Ma Pa Dha Ni Sa) at slow tempo")
    
    if overall_score < 50:
        recommendations.append("Start with Raga Yaman — it's the best beginner raga for practice")
    elif overall_score < 75:
        recommendations.append("Try singing bandish compositions to improve melodic phrasing")
    else:
        recommendations.append("Excellent progress! Try exploring meend and gamak ornamentations")

    recommendations.append("Record yourself daily and compare with reference recordings")

    return recommendations[:5]
