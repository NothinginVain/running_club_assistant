from typing import Literal

from pydantic import BaseModel, Field


class TrainingSafetyAssessment(BaseModel):
    plan_mode: Literal[
        "normal_running",
        "walk_only",
        "walk_run",
        "easy_running",
        "blocked",
    ]
    message: str = Field(min_length=1, max_length=500)
