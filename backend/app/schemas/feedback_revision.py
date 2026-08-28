from datetime import date
from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.survey_options import MedicallyClearedActivity
from app.schemas.training_safety import TrainingPlanMode


class FeedbackSafetyAssessment(BaseModel):
    decision: Literal[
        "continue_revision",
        "needs_health_update",
        "requires_coach_review",
    ]
    message: str = Field(
        min_length=1,
        max_length=500,
    )
    requested_start_date: date | None = None

    plan_mode: TrainingPlanMode | None = None

    current_pain_level: int | None = Field(
        default=None,
        ge=0,
        le=10,
    )

    medically_cleared_activities: (
        list[MedicallyClearedActivity] | None
    ) = None
