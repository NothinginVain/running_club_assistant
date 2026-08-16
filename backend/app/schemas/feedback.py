from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


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


class FeedbackRead(BaseModel):
    id: UUID
    feedback: str
    user_id: UUID
    recommendation_id: UUID
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )