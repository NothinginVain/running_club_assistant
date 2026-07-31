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
            "goal": "wish to run 5k",
            "plan_duration_weeks": 6,
            "plan_start_date": "2026-08-01",
            "target_event_date": None,
            "experience_level": "Beginner",
            "current_weekly_distance_km": None,
            "runs_per_week": 2,
            "preferred_training_days": ["Wednesday", "Saturday"],
            "longest_recent_run_km": 1,
            "Weight": 55,
            "preferred_terrain": "mix",
            "available_equipment": ["none"],

            "has_current_issue": False,
            "pain_during_running_level_0_to_10": 0,

            "diet_type": "omnivore",
            "dietary_restrictions": [],

            "main_preference": "progressive plan",
            "recommendation_detail_level": "balanced"
        }
    }

    survey_v3 = {
  "survey_type": "running_plan",
  "answers": {
    "goal": {
      "main_goal": "run_10k",
      "plan_start_date": "2026-08-01",
      "target_event_date": "2026-10-18",
      "plan_duration_weeks": 8
    },

    "current_training": {
      "experience_level": "beginner",
      "current_runs_per_week": 3,
      "current_weekly_distance_km": 15,
      "longest_recent_run_km": 7,
    },

    "availability": {
      "runs_per_week": 2,
      "preferred_training_days": [
        "Tuesday",
        "Thursday",
        "Sunday"
      ],
    },

    "health": {
      "has_current_issue": False,
      "current_issue_description": None,
      "pain_during_running_level_0_to_10": 0,
    },

    "training_preferences": {
      "preferred_terrain": "road",
      "available_equipment": [
        "resistance_band",
        "gym"
      ],
      "preferred_intensity": "balanced"
    },

    "recovery": {
      "sleep_quality": "good",
      "daily_stress_level": "moderate",
      "recovery_after_runs": "good",
      "current_energy_level": "good"
    },

    "measurements": {
      "weight_kg": 70
    },

    "nutrition": {
      "diet_type": "vegetarian",
      "dietary_restrictions": [],
    },

    "output_preferences": {
      "recommendation_detail_level": "balanced",
      "main_preference": "stability"
    }
  }
}
    final_survey = {
  "answers": {
    "goal": "build_endurance",
    "target_distance": "10k",
    "plan_duration_weeks": 8,
    "plan_start_date": "2026-08-03",
    "target_event_date": "2026-10-04",
    "experience_level": "intermediate",
    "current_weekly_distance_km": 30,
    "runs_per_week": 4,
    "longest_recent_run_km": 10,
    "preferred_training_days": [
      "tuesday",
      "thursday",
      "saturday",
      "sunday"
    ],
    "preferred_long_run_day": "sunday",
    "max_session_minutes": 90,
    "preferred_terrain": "road",
    "available_equipment": [
      "none"
    ],
    "current_issue_areas": [
      "none"
    ],
    "current_pain_level": 0,
    "has_medical_clearance": None,
    "recovery_level": "good",
    "average_sleep_duration": "7_to_8_hours",
    "stress_level": "moderate",
    "diet_type": "omnivore",
    "weight_kg": 72,
    "main_preference": "balanced_training",
    "detail_level": "balanced"
  }
}

    return final_survey

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