import json
from typing import Any
from dotenv import load_dotenv
from langfuse.openai import OpenAI
from app.schemas.running_structured_outputs import RunningPlanOutput, ChatReplyOutput, CoachMemorySummary

load_dotenv()

client = OpenAI()


def get_recommendation(input_text: str, instructions: str, prompt_version: str) -> dict[str, Any]:
    response = client.responses.parse(
        model="gpt-4o-mini",
        instructions=instructions,
        input=input_text,
        text_format=RunningPlanOutput,
        metadata={
            "feature": "running_plan",
            "environment": "local_backend",
            "prompt_version": prompt_version,
        },
    )

    structured_output = response.output_parsed

    if structured_output is None:
        raise ValueError(
            "OpenAI returned no structured running plan output."
        )

    return structured_output.model_dump()


def get_chat_reply(input_text: str, instructions: str, prompt_version: str) -> dict[str, Any]:
    response = client.responses.parse(
        model="gpt-4o-mini",
        instructions=instructions,
        input=input_text,
        text_format=ChatReplyOutput,
        metadata={
            "feature": "chatbot",
            "environment": "local_backend",
            "prompt_version": prompt_version,
        },
    )

    structured_output = response.output_parsed

    if structured_output is None:
        raise ValueError(
            "OpenAI returned no structured chat reply output."
        )

    return structured_output.model_dump()


def summarize_conversation(input_text: str, instructions: str, prompt_version: str) -> dict[str, Any]:
    response = client.responses.parse(
        model="gpt-4o-mini",
        instructions=instructions,
        input=input_text,
        text_format=CoachMemorySummary,
        metadata={
            "feature": "coach_memory_summary",
            "environment": "local_backend",
            "prompt_version": prompt_version,
        },
    )

    structured_output = response.output_parsed

    if structured_output is None:
        raise ValueError(
            "OpenAI returned no structured coach memory summary output."
        )

    return structured_output.model_dump()



# if __name__ == "__main__":
#     user_survey = '''
# {
#   "survey_type": "running_plan",
#   "answers": {
#     "goal": {
#       "main_goal": "run_10k",
#       "race_date": "2026-09-20",
#       "goal_time": null,
#       "priority": "finish_strong_and_healthy"
#     },
#     "personal_info": {
#       "age": 35,
#       "height_cm": 185,
#       "weight_kg": 77
#     },
#     "running_background": {
#       "running_experience": "beginner_to_intermediate",
#       "recent_races": [
#         {
#           "distance": "10k",
#           "result": "completed",
#           "pace_per_km": "3:50"
#         }
#       ],
#       "current_weekly_distance_km": 15,
#       "longest_recent_run_km": 10,
#       "current_training_frequency_per_week": 3
#     },
#     "availability": {
#       "training_days_per_week": 3,
#       "preferred_days": ["Tuesday", "Thursday", "Sunday"],
#       "max_session_duration_minutes": 75,
#       "preferred_long_run_day": "Sunday"
#     },
#     "injury_and_health": {
#       "current_injuries": [
#         {
#           "area": "left_leg",
#           "issue": "PTTD",
#           "status": "mild",
#           "notes": "pain is not constant but can appear after races"
#         }
#       ],
#       "past_injuries": ["mild knee pain", "achilles discomfort"],
#       "pain_during_running": false,
#       "medical_clearance": "unknown"
#     },
#     "training_preferences": {
#       "terrain": "road",
#       "preferred_intensity": "balanced",
#       "likes": ["structured plan", "clear weekly targets", "progressive training"],
#       "dislikes": ["too much complexity", "overtraining"]
#     },
#     "strength_and_mobility": {
#       "wants_strength_training": true,
#       "strength_sessions_per_week": 2,
#       "equipment": ["bodyweight", "resistance_band", "gym_available"],
#       "mobility_focus": ["ankles", "hips", "hamstrings", "calves"]
#     },
#     "nutrition": {
#       "diet_type": "vegetarian",
#       "wants_basic_nutrition_guidance": true,
#       "known_restrictions": [],
#       "main_nutrition_goal": "support_training_and_recovery"
#     },
#     "safety_preferences": {
#       "max_weekly_volume_increase_percent": 10,
#       "prefer_conservative_progression": true,
#       "include_recovery_weeks": true
#     }
#   }
# }
#         '''
#     recommendation = get_recommendation(user_survey)
#
#     print("\nRecommendation:")
#     print(recommendation)