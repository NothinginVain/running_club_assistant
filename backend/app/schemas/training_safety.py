from typing import Literal

from pydantic import BaseModel, Field


TrainingPlanMode = Literal[
    "normal_running",
    "walk_only",
    "walk_run",
    "easy_running",
    "blocked",
]


class TrainingSafetyAssessment(BaseModel):
    plan_mode: TrainingPlanMode
    message: str = Field(min_length=1, max_length=500)
