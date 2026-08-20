"""
Analysis router - Vocal performance analysis results and progress tracking.
"""
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from uuid import uuid4

from app.models.user import User
from app.models.schemas import AnalysisResult, ProgressMetrics
from app.services.auth_service import get_current_user
from app.db.mongodb import get_database

router = APIRouter()


@router.post("/analyze/{audio_id}", response_model=AnalysisResult)
async def analyze_audio(
    audio_id: str,
    current_user: User = Depends(get_current_user),
):
    """Trigger analysis pipeline for an uploaded audio file."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    # Check audio file exists
    audio_file = await db.audio_files.find_one(
        {"id": audio_id, "user_id": str(current_user.id)}
    )
    if not audio_file:
        raise HTTPException(status_code=404, detail="Audio file not found")

    analysis_id = str(uuid4())
    now = datetime.now(timezone.utc)

    # Run analysis pipeline (will be fully implemented with AI modules)
    try:
        from app.ai.pitch_detector import detect_pitch
        from app.ai.swara_detector import detect_swaras
        from app.ai.raga_recognizer import recognize_raga
        from app.ai.feedback_engine import generate_feedback

        file_path = audio_file["file_path"]

        # Step 1: Pitch Detection
        pitch_data = await detect_pitch(file_path)

        # Step 2: Swara Detection
        swara_data = await detect_swaras(file_path, pitch_data)

        # Step 3: Raga Recognition
        raga_data = await recognize_raga(file_path, swara_data)

        # Step 4: Generate AI Feedback
        feedback = await generate_feedback(pitch_data, swara_data, raga_data)

        # Store analysis result
        result_doc = {
            "id": analysis_id,
            "user_id": str(current_user.id),
            "audio_id": audio_id,
            "pitch_analysis": pitch_data,
            "detected_swaras": swara_data,
            "raga_predictions": raga_data,
            "shruti_deviation": pitch_data.get("shruti_deviation", 0.0),
            "overall_score": feedback.get("overall_score", 0.0),
            "ai_feedback": feedback.get("feedback_text", ""),
            "practice_recommendations": feedback.get("recommendations", []),
            "status": "completed",
            "created_at": now,
        }
        await db.analysis_results.insert_one(result_doc)

        # Update audio file status
        await db.audio_files.update_one(
            {"id": audio_id},
            {"$set": {"status": "analyzed", "analysis_id": analysis_id}},
        )

        return AnalysisResult(**result_doc)

    except Exception as e:
        print(f"Analysis error: {e}")
        # Store failed analysis
        result_doc = {
            "id": analysis_id,
            "user_id": str(current_user.id),
            "audio_id": audio_id,
            "status": "error",
            "error_message": str(e),
            "created_at": now,
        }
        await db.analysis_results.insert_one(result_doc)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/{analysis_id}", response_model=AnalysisResult)
async def get_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get a specific analysis result."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    result = await db.analysis_results.find_one(
        {"id": analysis_id, "user_id": str(current_user.id)}
    )
    if not result:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return AnalysisResult(**result)


@router.get("/history/all")
async def get_analysis_history(
    current_user: User = Depends(get_current_user),
):
    """Get all analysis results for the current user."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    results = await db.analysis_results.find(
        {"user_id": str(current_user.id)}
    ).sort("created_at", -1).to_list(length=50)

    return [AnalysisResult(**r) for r in results]


@router.get("/progress/overview", response_model=ProgressMetrics)
async def get_progress(
    current_user: User = Depends(get_current_user),
):
    """Get aggregated progress metrics for the current user."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    results = await db.analysis_results.find(
        {"user_id": str(current_user.id), "status": "completed"}
    ).sort("created_at", -1).to_list(length=100)

    if not results:
        return ProgressMetrics()

    scores = [r.get("overall_score", 0) for r in results if r.get("overall_score")]
    pitch_scores = [
        r.get("pitch_analysis", {}).get("pitch_stability", 0) 
        for r in results 
        if r.get("pitch_analysis")
    ]

    # Find the most commonly recognized raga
    raga_counts = {}
    for r in results:
        for pred in r.get("raga_predictions", []):
            raga_name = pred.get("raga_name", "")
            if raga_name:
                raga_counts[raga_name] = raga_counts.get(raga_name, 0) + 1
    best_raga = max(raga_counts, key=raga_counts.get) if raga_counts else None

    return ProgressMetrics(
        total_sessions=len(results),
        average_pitch_accuracy=sum(pitch_scores) / len(pitch_scores) if pitch_scores else 0,
        average_swara_accuracy=sum(scores) / len(scores) if scores else 0,
        best_raga=best_raga,
        recent_scores=scores[:10],
        skill_breakdown={
            "pitch_accuracy": sum(pitch_scores) / len(pitch_scores) if pitch_scores else 0,
            "swara_identification": sum(scores) / len(scores) if scores else 0,
        },
    )
