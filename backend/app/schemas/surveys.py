from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.enums import RecommendationType


class SurveyCreate(BaseModel):
    survey_type: RecommendationType
    answers: dict[str, Any]


class SurveyUpdate(BaseModel):
    answers: dict[str, Any] | None = None
    survey_type: RecommendationType | None = None


class SurveyRead(BaseModel):
    id: UUID
    user_id: UUID
    survey_type: RecommendationType
    answers: dict[str, Any]

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)