from datetime import date, datetime
from typing import Annotated, Any, Literal, Self
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.enums import RecommendationType
from app.schemas.survey_options import (
    DetailLevel,
    DietType,
    EquipmentOption,
    ExperienceLevel,
    GoalOption,
    IssueAreaOption,
    MainPreference,
    MedicallyClearedActivity,
    RecoveryLevel,
    SleepDurationOption,
    StressLevel,
    TargetDistanceOption,
    TerrainOption,
    Weekday,
)


class RunningPlanSurveyAnswers(BaseModel):
    """Validated answers used to create a running-plan recommendation."""

    goal: GoalOption
    target_distance: TargetDistanceOption = TargetDistanceOption.NONE
    plan_duration_weeks: Literal[4, 6, 8, 12, 16]
    plan_start_date: date
    target_event_date: date | None = None
    experience_level: ExperienceLevel
    current_weekly_distance_km: float = Field(ge=0)
    runs_per_week: Literal[1, 2, 3, 4, 5, 6, 7]
    longest_recent_run_km: float = Field(ge=0)
    preferred_training_days: list[Weekday] = Field(min_length=1, max_length=7)
    preferred_long_run_day: Weekday | None = None
    max_session_minutes: Literal[30, 45, 60, 75, 90, 120]
    preferred_terrain: TerrainOption
    available_equipment: list[EquipmentOption] = Field(min_length=1)
    current_issue_areas: list[IssueAreaOption] = Field(min_length=1)
    current_pain_level: int = Field(ge=0, le=10)
    medically_cleared_activities: list[MedicallyClearedActivity] | None = Field(
        default=None,
        min_length=1,
        max_length=3,
    )
    recovery_level: RecoveryLevel
    average_sleep_duration: SleepDurationOption
    stress_level: StressLevel
    diet_type: DietType
    weight_kg: float | None = Field(default=None, gt=0, le=500)
    main_preference: MainPreference
    detail_level: DetailLevel = DetailLevel.BALANCED

    @model_validator(mode="after")
    def validate_consistent_answers(self) -> Self:
        if len(set(self.preferred_training_days)) != len(
            self.preferred_training_days
        ):
            raise ValueError("preferred_training_days cannot contain duplicates")

        if len(self.preferred_training_days) < self.runs_per_week:
            raise ValueError(
                "preferred_training_days must include at least runs_per_week days"
            )

        if (
            self.preferred_long_run_day is not None
            and self.preferred_long_run_day not in self.preferred_training_days
        ):
            raise ValueError(
                "preferred_long_run_day must be included in preferred_training_days"
            )

        if (
            EquipmentOption.NONE in self.available_equipment
            and len(self.available_equipment) > 1
        ):
            raise ValueError(
                "available_equipment cannot combine 'none' with other equipment"
            )

        if (
            IssueAreaOption.NONE in self.current_issue_areas
            and len(self.current_issue_areas) > 1
        ):
            raise ValueError(
                "current_issue_areas cannot combine 'none' with another issue"
            )

        has_health_concern = (
            self.current_pain_level > 0
            or IssueAreaOption.NONE not in self.current_issue_areas
        )

        if has_health_concern and self.medically_cleared_activities is None:
            raise ValueError(
                "medically_cleared_activities is required when pain or an issue "
                "is reported"
            )

        if (
            self.medically_cleared_activities
            and MedicallyClearedActivity.NOT_CLEARED
            in self.medically_cleared_activities
            and len(self.medically_cleared_activities) > 1
        ):
            raise ValueError(
                "not_cleared cannot be combined with cleared activities"
            )

        if (
            self.medically_cleared_activities
            and len(set(self.medically_cleared_activities))
            != len(self.medically_cleared_activities)
        ):
            raise ValueError(
                "medically_cleared_activities cannot contain duplicates"
            )

        if (
            self.target_event_date is not None
            and self.target_event_date <= self.plan_start_date
        ):
            raise ValueError("target_event_date must be after plan_start_date")

        return self


class RunningPlanSurveyCreate(BaseModel):
    survey_type: Literal[RecommendationType.RUNNING_PLAN]
    answers: RunningPlanSurveyAnswers


class ShoeRecommendationSurveyCreate(BaseModel):
    survey_type: Literal[RecommendationType.SHOE_RECOMMENDATION]
    answers: dict[str, Any]


SurveyCreate = Annotated[
    RunningPlanSurveyCreate | ShoeRecommendationSurveyCreate,
    Field(discriminator="survey_type"),
]


class SurveyRead(BaseModel):
    id: UUID
    user_id: UUID
    survey_type: RecommendationType
    answers: dict[str, Any]

    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
