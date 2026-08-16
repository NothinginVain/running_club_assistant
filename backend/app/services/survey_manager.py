import os

import requests
from dotenv import load_dotenv


load_dotenv()

BASE_URL = os.getenv('BASE_URL')


def build_sample_survey() -> dict:
    return {
        "survey_type": "running_plan",
        "answers": {
            "goal": "build_endurance",
            "target_distance": "10k",
            "plan_duration_weeks": 8,
            "plan_start_date": "2026-08-17",
            "target_event_date": "2026-10-10",
            "experience_level": "intermediate",
            "current_weekly_distance_km": 18,
            "runs_per_week": 3,
            "longest_recent_run_km": 7,
            "preferred_training_days": [
                "monday",
                "wednesday",
                "saturday",
            ],
            "preferred_long_run_day": "saturday",
            "max_session_minutes": 75,
            "preferred_terrain": "road",
            "available_equipment": [
                "resistance_band",
            ],
            "current_issue_areas": [
                "none",
            ],
            "current_pain_level": 0,
            "has_medical_clearance": None,
            "recovery_level": "good",
            "average_sleep_duration": "7_to_8_hours",
            "stress_level": "moderate",
            "diet_type": "omnivore",
            "weight_kg": 72,
            "main_preference": "balanced_training",
            "detail_level": "balanced",
        },
    }


def build_survey_package(survey: dict) -> dict:
    return {
        'survey_type': survey['survey_type'],
        'answers': survey['answers'],
    }


def save_survey(user_id, payload):
    response = requests.post(
        f'{BASE_URL}/surveys/users/{user_id}',
        json=payload,
    )

    if not response.ok:
        print("Status:", response.status_code)
        print("Payload sent:", payload)
        print("FastAPI error:", response.text)

    response.raise_for_status()
    return response.json()
