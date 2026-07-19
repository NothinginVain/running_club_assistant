from pydantic import BaseModel, Field
from typing import Literal


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
    day: str
    running: RunningBlock | None = None
    strength: SupportBlock | None = None
    mobility: SupportBlock | None = None
    notes: str | None = None


class WeeklyDistance(BaseModel):
    week_number: int = Field(ge=1)
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
