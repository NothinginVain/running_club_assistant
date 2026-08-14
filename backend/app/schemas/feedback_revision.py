from typing import Literal

from pydantic import BaseModel, Field


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
