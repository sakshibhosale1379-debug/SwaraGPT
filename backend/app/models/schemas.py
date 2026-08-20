"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


# ─── Auth Schemas ───────────────────────────────────────────

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    role: str = Field(default="student", pattern="^(student|teacher)$")


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    id: UUID
    name: str
    email: str
    role: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Chat Schemas ───────────────────────────────────────────

class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[str] = None


class ChatMessageResponse(BaseModel):
    id: str
    role: str  # "user" or "assistant"
    content: str
    conversation_id: str
    created_at: datetime


class ConversationResponse(BaseModel):
    id: str
    title: str
    last_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ─── Audio Schemas ──────────────────────────────────────────

class AudioUploadResponse(BaseModel):
    id: str
    filename: str
    file_path: str
    duration_seconds: Optional[float] = None
    status: str = "uploaded"
    created_at: datetime


# ─── Analysis Schemas ───────────────────────────────────────

class SwaraResult(BaseModel):
    swara: str
    timestamp: float
    frequency: float
    accuracy: float
    is_correct: bool


class RagaPrediction(BaseModel):
    raga_name: str
    confidence: float
    thaat: Optional[str] = None


class PitchAnalysis(BaseModel):
    mean_pitch: float
    pitch_stability: float
    pitch_range_low: float
    pitch_range_high: float
    pitch_contour: list[float] = []
    timestamps: list[float] = []


class AnalysisResult(BaseModel):
    id: str
    user_id: str
    audio_id: str
    pitch_analysis: Optional[PitchAnalysis] = None
    detected_swaras: list[SwaraResult] = []
    raga_predictions: list[RagaPrediction] = []
    shruti_deviation: Optional[float] = None
    overall_score: Optional[float] = None
    ai_feedback: Optional[str] = None
    practice_recommendations: list[str] = []
    created_at: datetime
    status: str = "pending"


# ─── Progress Schemas ──────────────────────────────────────

class ProgressMetrics(BaseModel):
    total_sessions: int = 0
    average_pitch_accuracy: float = 0.0
    average_swara_accuracy: float = 0.0
    best_raga: Optional[str] = None
    practice_streak: int = 0
    total_practice_minutes: float = 0.0
    recent_scores: list[float] = []
    skill_breakdown: dict = {}
