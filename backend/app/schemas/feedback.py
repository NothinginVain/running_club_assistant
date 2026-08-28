from datetime import datetime
from typing import Literal, Self
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.schemas.survey_options import MedicallyClearedActivity


class FeedbackCreate(BaseModel):
    feedback: str = Field(
        min_length=1,
        max_length=2000,
    )

    @field_validator("feedback")
    @classmethod
    def validate_feedback(cls, value: str) -> str:
        cleaned_value = value.strip()

        if not cleaned_value:
            raise ValueError("feedback cannot be empty")

        return cleaned_value


class HealthUpdateCreate(BaseModel):
    current_pain_level: int = Field(
        ge=0,
        le=10,
    )

    warning_symptoms: list[
        Literal[
            "swelling",
            "restricted_movement",
            "abnormal_walking",
            "worsening_daily",
            "none",
        ]
    ] = Field(
        min_length=1,
        max_length=4,
    )

    walking_symptom_response: Literal[
        "no_increase",
        "symptoms_increase",
        "not_tried",
    ]

    professional_clearance_status: Literal[
        "not_assessed",
        "not_cleared",
        "cleared",
    ]

    medically_cleared_activities: (
        list[MedicallyClearedActivity] | None
    ) = Field(
        default=None,
        min_length=1,
        max_length=3,
    )

    has_additional_restrictions: bool

    @model_validator(mode="after")
    def validate_health_update(self) -> Self:
        if len(set(self.warning_symptoms)) != len(
            self.warning_symptoms
        ):
            raise ValueError(
                "warning_symptoms cannot contain duplicates"
            )

        if (
            "none" in self.warning_symptoms
            and len(self.warning_symptoms) > 1
        ):
            raise ValueError(
                "none cannot be combined with warning symptoms"
            )

        if (
            self.medically_cleared_activities
            and len(set(self.medically_cleared_activities))
            != len(self.medically_cleared_activities)
        ):
            raise ValueError(
                "medically_cleared_activities cannot contain duplicates"
            )

        if self.professional_clearance_status == "cleared":
            if not self.medically_cleared_activities:
                raise ValueError(
                    "cleared activities are required when professionally cleared"
                )

            if (
                MedicallyClearedActivity.NOT_CLEARED
                in self.medically_cleared_activities
            ):
                raise ValueError(
                    "not_cleared cannot be used with cleared status"
                )

        elif self.medically_cleared_activities is not None:
            raise ValueError(
                "cleared activities require professionally cleared status"
            )

        return self


class FeedbackRead(BaseModel):
    id: UUID
    feedback: str
    user_id: UUID
    recommendation_id: UUID
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )
