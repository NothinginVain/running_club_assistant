from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import RecommendationType


class RecommendationCreate(BaseModel):
    survey_id: UUID
    recommendation_type: RecommendationType
    title: str
    content: dict[str, Any]
    explanation: dict[str, Any] | None = None


class RecommendationRead(BaseModel):
    id: UUID
    survey_id: UUID
    recommendation_type: RecommendationType

    title: str
    content: dict[str, Any]
    explanation: dict[str, Any] | None = None
    survey_snapshot: dict[str, Any]

    feedback_rating: int | None = None
    feedback_comment: str | None = None
    is_favorite: bool

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RecommendationFeedbackUpdate(BaseModel):
    feedback_rating: int = Field(ge=1, le=5)
    feedback_comment: str | None = None


class RecommendationFavoriteUpdate(BaseModel):
    is_favorite: bool