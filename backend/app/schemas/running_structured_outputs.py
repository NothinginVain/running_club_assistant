from pydantic import BaseModel, Field
from typing import Literal

SupportTiming = Literal["before_run", "after_run", "separate", "rest_day"]

class RunningBlock(BaseModel):
    type: str
    distance_km: float = Field(gt=0)
    intensity_level: Literal[
        "recovery",
        "very_easy",
        "easy",
        "steady",
        "tempo",
        "threshold",
        "interval",
        "race",
    ]
    details: str


class SupportBlock(BaseModel):
    focus: str
    timing: SupportTiming
    duration_minutes: int
    details: str


class WalkingBlock(BaseModel):
    type: Literal["walk", "walk_run"]
    distance_km: float = Field(gt=0)
    duration_minutes: int = Field(ge=1)
    intensity_level: Literal[
        "gentle",
        "very_easy",
        "comfortable",
        "easy",
        "brisk",
    ]
    details: str


class TrainingDay(BaseModel):
    week_number: int = Field(ge=1)
    date: str
    day: str
    running: RunningBlock | None = None
    walking: WalkingBlock | None = None
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
    safety_notes: list[str]


class PlanExplanation(BaseModel):
    why_this_plan_fits: list[str]


class RunningPlanOutput(BaseModel):
    content: PlanContent
    explanation: PlanExplanation


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatSummaryOutput(BaseModel):
    current_goal: str | None = None
    preferences: list[str] = Field(default_factory=list)
    topics_of_interest: list[str] = Field(default_factory=list)
    progress: str | None = None


class ChatMemory(ChatSummaryOutput):
    current_conversation: list[ChatMessage] = Field(
        default_factory=list
    )


class CoachMemorySummary(BaseModel):
    chat: ChatMemory = Field(default_factory=ChatMemory)


class ChatReplyOutput(BaseModel):
    reply: str
