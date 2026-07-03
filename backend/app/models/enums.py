import enum


class RecommendationType(str, enum.Enum):
    RUNNING_PLAN = "running_plan"
    SHOE_RECOMMENDATION = "shoe_recommendation"