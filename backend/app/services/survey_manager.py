import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv('BASE_URL')

def build_sample_survey():
    simple_survey = {
  "survey_type": "running_plan",
  "answers": {
    "goal": "run_5k",
    "race_date": "2026-09-20",
    "experience_level": "intermediate",
    "current_weekly_distance_km": 15,
    "runs_per_week": 3,
    "preferred_days": ["Tuesday", "Thursday", "Sunday"],
    "long_run_day": "Sunday",
    "terrain": "mixed",
    "current_injury": "mild left leg PTTD",
    "pain_during_running": False,
    "wants_strength_training": True,
    "diet_type": "vegetarian",
    "main_preference": "simple structured plan with conservative progression"
  }
}
    medium_survey = {
    "survey_type": "running_plan",
    "answers": {
        "goal": {
            "main_goal": "run_10k",
            "target_time": None,
            "plan_duration_preference": "8_weeks"
        },
        "running_background": {
            "experience_level": "intermediate",
            "current_runs_per_week": 4,
            "current_weekly_distance_range": "5_to_10km",
            "longest_recent_run": "5k",
            "recent_5k_time": None,
            "recent_10k_time": None
        },
        "availability": {
            "preferred_training_days": ["Tuesday", "Thursday", "Sunday"]
        },
        "injury_and_health": {
            "has_current_issue": False
        },
        "training_preferences": {
            "preferred_terrain": "road",
            "available_equipment": ["resistance_band", "gym"],
            "recommendation_detail_level": "balanced"
        },
        "recovery_and_lifestyle": {
            "sleep_quality": "good",
            "daily_stress_level": "moderate",
            "daily_activity_level": "mixed",
            "recovery_after_runs": "good",
            "current_energy_level": "good"
        },
        "nutrition": {
            "diet_type": "vegetarian",
            "dietary_restrictions": []
        }
    }
}

    survey_v2 = {
        "survey_type": "running_plan",
        "answers": {
            "goal": "general_fitness",
            "plan_duration_weeks": 4,

            "experience_level": "intermediate",
            "current_weekly_distance_km": 8,
            "runs_per_week": 3,
            "preferred_training_days": ["Tuesday","Thursday", "Saturday"],
            "longest_recent_run_km": 10,

            "preferred_terrain": "mix",
            "available_equipment": ["none"],

            "has_current_issue": False,
            "pain_during_running_level_0_to_10": 0,

            "diet_type": "omnivore",
            "dietary_restrictions": [],

            "main_preference": "simple plan that builds consistency",
            "recommendation_detail_level": "balanced"
        }
    }
    return survey_v2

def build_survey_package(survey: dict):
    return {
        'survey_type': survey['survey_type'],
        'answers': survey['answers'],
    }

def save_survey(user_id, payload):
    response = requests.post(f'{BASE_URL}/surveys/users/{user_id}', json=payload)

    if not response.ok:
        print("Status:", response.status_code)
        print("Payload sent:", payload)
        print("FastAPI error:", response.text)

    response.raise_for_status()
    return response.json()


def run(user_id):
    survey = build_sample_survey()
    payload = build_survey_package(survey)
    saved_survey = save_survey(user_id, payload)
    return saved_survey


if __name__ == "__main__":
    test_user_id = "328cae0c-b9fe-4d3e-ac20-7fc642b406e1"

    result = run(test_user_id)

    print(json.dumps(result, indent=4))

# uvicorn app.main:app --reload --port 5002