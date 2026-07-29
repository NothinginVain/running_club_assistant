from pydantic import BaseModel, Field
from typing import Literal
from uuid import UUID
from datetime import datetime

SupportTiming = Literal["before_run", "after_run", "separate", "rest_day"]

class RunningBlock(BaseModel):
    type: str
    distance_km: float
    intensity_level: str
    details: str


class SupportBlock(BaseModel):
    focus: str
    timing: SupportTiming
    duration_minutes: int
    details: str


class TrainingDay(BaseModel):
    week_number: int = Field(ge=1)
    date: str
    day: str
    running: RunningBlock | None = None
    strength: SupportBlock | None = None
    mobility: SupportBlock | None = None
    notes: str | None = None


class WeeklyDistance(BaseModel):
    week_number: int = Field(ge=1)
    start_date: str
    end_date: str
    distance_km: float


class PlanContent(BaseModel):
    summary: str
    weekly_distance: list[WeeklyDistance]
    training_days: list[TrainingDay]
    nutrition: list[str]
    safety_notes: list[str]


class PlanExplanation(BaseModel):
    why_this_plan_fits: list[str]
    important_assumptions: list[str]


class RunningPlanOutput(BaseModel):
    title: str
    content: PlanContent
    explanation: PlanExplanation


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatSummaryOutput(BaseModel):
    current_goal: str | None = None
    preferences: list[str] = Field(default_factory=list)
    progress: str | None = None


class ChatMemory(ChatSummaryOutput):
    current_conversation: list[ChatMessage] = Field(
        default_factory=list
    )


class RecommendationMemory(BaseModel):
    recommendation_id: UUID
    title: str
    summary: str | None = None
    created_at: datetime


class FeedbackMemory(BaseModel):
    recommendation_id: UUID
    title: str | None = None
    rating: int = Field(ge=1, le=5)
    comment: str | None = None
    created_at: datetime


class CoachMemorySummary(BaseModel):
    recommendations: list[RecommendationMemory] = Field(
        default_factory=list
    )
    feedback: list[FeedbackMemory] = Field(default_factory=list)
    chat: ChatMemory = Field(default_factory=ChatMemory)


class ChatReplyOutput(BaseModel):
    reply: str
