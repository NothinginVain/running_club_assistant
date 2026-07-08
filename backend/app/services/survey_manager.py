import requests
import json

BASE_URL = 'http://127.0.0.1:5002'

def build_sample_survey():
    return {
  "survey_type": "running_plan",
  "answers": {
    "goal": "run_5k",
    "race_date": "2026-09-20",
    "experience_level": "intermediate",
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

def build_survey_package(survey: dict):
    return {
        'survey_type': survey['survey_type'],
        'answers': survey['answers'],
    }

def save_survey(user_id, payload):
    response = requests.post(f'{BASE_URL}/surveys/users/{user_id}', json=payload)
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