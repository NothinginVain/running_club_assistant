import json

from langfuse import observe
import requests
from app.client_openai import get_recommendation
from app.prompts.running_plan_prompt import get_running_plan_prompt
from app.prompts.running_plan_input import build_running_plan_input
from dotenv import load_dotenv
import os

load_dotenv()

BASE_URL = os.getenv('BASE_URL')

def get_user(user_id):
    response = requests.get(f'{BASE_URL}/users/{user_id}')

    if not response.ok:
        print("User API error:", response.text)

    response.raise_for_status()
    return response.json()


# 1 - getting survey from database, base on user id
def get_latest_survey(user_id):
    response = requests.get(f'{BASE_URL}/surveys/users/{user_id}/latest')

    if not response.ok:
        print("Survey API error:", response.text)

    response.raise_for_status()
    return response.json()


# 2 - calling openAI to send the survey get the recommendation
def generate_recommendation(user, survey, prompt_version='simple'):
    instructions = get_running_plan_prompt(prompt_version)
    input_text = build_running_plan_input(user, survey)
    return get_recommendation(input_text, instructions, prompt_version)


# 3 - construct the full recommendation package which is aligned with data schema
def build_recommendation_package(survey: dict, recommendation: dict):
    return {
        'survey_id': survey['id'],
        'recommendation_type': survey['survey_type'],
        'title': recommendation['title'],
        'content': recommendation['content'],
        'explanation': recommendation.get('explanation'),
    }


# 4- calling recommendations route with post method to store the package in the step3 in database
def save_recommendation(payload):
    response = requests.post(f'{BASE_URL}/recommendations/', json=payload)

    if not response.ok:
        print("Recommendation payload:")
        print(json.dumps(payload, indent=4, ensure_ascii=False))
        print("Recommendation API error:")
        print(response.text)


    response.raise_for_status()
    return response.json()


def update_favorite_recommendation(recommendation_id, favorite):
    payload = {
       'is_favorite': favorite,
   }

    response = requests.patch(
        f'{BASE_URL}/recommendations/{recommendation_id}/favorite',
        json=payload,
    )

    if not response.ok:
        print("Recommendation API error:")
        print(response.text)

    response.raise_for_status()
    return response.json()

@observe(name='recommendation_execution')
def execute_recommendation(user_id, prompt_version='simple'):
    survey = get_latest_survey(user_id)
    user = get_user(user_id)
    recommendation = generate_recommendation(user, survey, prompt_version)
    payload = build_recommendation_package(survey, recommendation)
    saved_recommendation = save_recommendation(payload)
    return saved_recommendation

if __name__ == '__main__':
    test_user_id = '328cae0c-b9fe-4d3e-ac20-7fc642b406e1'
    result = execute_recommendation(test_user_id)
    print(json.dumps(result, indent=4, ensure_ascii=False))

# uvicorn app.main:app --reload --port 5002  -> to be able activate the apis thro terminal