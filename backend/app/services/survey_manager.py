import requests

BASE_URL = 'http://127.0.0.1:8000'

def trigger_survey():
    return {
  "survey_type": "running_plan",
  "answers": {
    "goal": "run_10k",
    "race_date": "2026-09-20",
    "experience_level": "beginner_to_intermediate",
    "current_weekly_distance_km": 15,
    "runs_per_week": 3,
    "preferred_days": ["Tuesday", "Thursday", "Sunday"],
    "long_run_day": "Sunday",
    "terrain": "road",
    "current_injury": "mild left leg PTTD",
    "pain_during_running": False,
    "wants_strength_training": True,
    "diet_type": "vegetarian",
    "main_preference": "simple structured plan with conservative progression"
  }
}

def build_survey_package(survey: dict, user_id: str):
    return {
        'user_id': user_id,
        'survey_type': survey['survey_type'],
        'answers': survey
    }

def save_survey(playload):
    response = requests.post(f'{BASE_URL}/surveys/', json=playload)
    response.raise_for_status()
    return response.json()