from typing import Annotated, Literal, Self

from pydantic import BaseModel, Field, model_validator


HealthQuestion = Annotated[
    str,
    Field(min_length=1, max_length=250),
]


class FeedbackSafetyAssessment(BaseModel):
    decision: Literal[
        "continue_revision",
        "needs_health_update",
    ]
    message: str = Field(
        min_length=1,
        max_length=500,
    )
    questions: list[HealthQuestion] = Field(
        default_factory=list,
        max_length=4,
    )

    @model_validator(mode="after")
    def validate_decision(self) -> Self:
        if (
            self.decision == "needs_health_update"
            and len(self.questions) < 2
        ):
            raise ValueError(
                "Health-update decisions require 2 to 4 questions."
            )

        if (
            self.decision == "continue_revision"
            and self.questions
        ):
            raise ValueError(
                "Continue decisions cannot contain questions."
            )

        return self
