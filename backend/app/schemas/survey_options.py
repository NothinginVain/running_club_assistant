from enum import Enum


class GoalOption(str, Enum):
    START_RUNNING = "start_running"
    GENERAL_FITNESS = "general_fitness"
    WEIGHT_MANAGEMENT = "weight_management"
    MAINTAIN_FITNESS = "maintain_fitness"
    BUILD_CONSISTENCY = "build_consistency"
    BUILD_ENDURANCE = "build_endurance"
    IMPROVE_SPEED = "improve_speed"
    RETURN_TO_RUNNING = "return_to_running"
    COMPLETE_FIRST_RACE = "complete_first_race"
    RACE_PREPARATION = "race_preparation"
    PERSONAL_BEST = "personal_best"
    STRESS_RELIEF = "stress_relief"


class TargetDistanceOption(str, Enum):
    NONE = "none"
    ONE_MILE = "one_mile"
    RUN_5K = "5k"
    RUN_10K = "10k"
    FIFTEEN_K = "15k"
    HALF_MARATHON = "half_marathon"
    MARATHON = "marathon"
    ULTRAMARATHON = "ultramarathon"
    OTHER = "other"


class ExperienceLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class Weekday(str, Enum):
    MONDAY = "monday"
    TUESDAY = "tuesday"
    WEDNESDAY = "wednesday"
    THURSDAY = "thursday"
    FRIDAY = "friday"
    SATURDAY = "saturday"
    SUNDAY = "sunday"


class TerrainOption(str, Enum):
    ROAD = "road"
    TRAIL = "trail"
    TRACK = "track"
    TREADMILL = "treadmill"
    MIXED = "mixed"


class EquipmentOption(str, Enum):
    NONE = "none"
    RESISTANCE_BAND = "resistance_band"
    DUMBBELLS = "dumbbells"
    KETTLEBELL = "kettlebell"
    GYM = "gym"
    TREADMILL = "treadmill"
    STATIONARY_BIKE = "stationary_bike"


class IssueAreaOption(str, Enum):
    NONE = "none"
    FOOT = "foot"
    ANKLE = "ankle"
    ACHILLES = "achilles"
    CALF = "calf"
    SHIN = "shin"
    KNEE = "knee"
    HAMSTRING = "hamstring"
    HIP = "hip"
    LOWER_BACK = "lower_back"
    OTHER = "other"


class MedicallyClearedActivity(str, Enum):
    NOT_CLEARED = "not_cleared"
    WALK = "walk"
    WALK_RUN = "walk_run"
    RUN = "run"


class RecoveryLevel(str, Enum):
    POOR = "poor"
    FAIR = "fair"
    GOOD = "good"
    EXCELLENT = "excellent"


class SleepDurationOption(str, Enum):
    LESS_THAN_6_HOURS = "less_than_6_hours"
    SIX_TO_7_HOURS = "6_to_7_hours"
    SEVEN_TO_8_HOURS = "7_to_8_hours"
    MORE_THAN_8_HOURS = "more_than_8_hours"


class StressLevel(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    VERY_HIGH = "very_high"


class DietType(str, Enum):
    OMNIVORE = "omnivore"
    VEGETARIAN = "vegetarian"
    VEGAN = "vegan"
    PESCATARIAN = "pescatarian"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class MainPreference(str, Enum):
    CONSERVATIVE_PROGRESSION = "conservative_progression"
    BALANCED_TRAINING = "balanced_training"
    CHALLENGING_PROGRESSION = "challenging_progression"
    BUILD_CONSISTENCY = "build_consistency"
    STRENGTH_AND_MOBILITY = "strength_and_mobility_focus"
    MINIMAL_TIME = "minimal_time_commitment"


class DetailLevel(str, Enum):
    CONCISE = "concise"
    BALANCED = "balanced"
    DETAILED = "detailed"
