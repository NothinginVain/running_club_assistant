from pydantic import BaseModel, Field


class RunningSession(BaseModel):
    week_number: int = Field(get=1)
    day: str
    type: str
    distance_km: float
    intensity: str
    details: str


class StrengthSession(BaseModel):
    day: str
    focus: str
    details: str


class MobilitySession(BaseModel):
    day: str
    focus: str
    details: str


class WeeklyDistance(BaseModel):
    week_number: int = Field(get=1)
    distance_km: float


class PlanContent(BaseModel):
    summary: str
    sessions: list[RunningSession]
    strength: list[StrengthSession]
    mobility: list[MobilitySession]
    nutrition: list[str]
    safety_notes: list[str]
    # weekly_distance_km: list[WeeklyDistance]


class PlanExplanation(BaseModel):
    why_this_plan_fits: list[str]
    important_assumptions: list[str]


class RunningPlanOutput(BaseModel):
    title: str
    content: PlanContent
    explanation: PlanExplanation