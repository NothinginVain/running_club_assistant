import json

import requests
from app.client_openaiv2 import get_recommendation

BASE_URL = 'http://127.0.0.1:8000'


# 1 - getting survey from database, base on user id
def get_latest_survey(user_id):
    response = requests.get(f'{BASE_URL}/surveys/users/{user_id}/latest')
    response.raise_for_status()
    return response.json()


# 2 - calling openAI to send the survey get the recommendation
def generate_recommendation(survey):
    return get_recommendation((survey['answers']))


# 3 - construct the full recommendation package which is aligned with data schema
def build_recommendation_package(survey: dict, recommendation: dict):
    return {
        'survey_id': survey['id'],
        'recommendation_type': recommendation['recommendation_type'],
        'title': recommendation['title'],
        'content': recommendation['content'],
        'explanation': recommendation.get('explanation'),
    }


# 4- calling recommendations route with post method to store the package in the step3 in database
def save_recommendation(playload):
    response = requests.post(f'{BASE_URL}/recommendations/', json=playload)
    response.raise_for_status()
    return response.json()


def execute_recommendation(user_id):
    survey = get_latest_survey(user_id)
    recommendation = generate_recommendation(survey)
    playload = build_recommendation_package(survey, recommendation)
    saved = save_recommendation(playload)
    return saved

if __name__ == '__main__':
    test_user_id = '328cae0c-b9fe-4d3e-ac20-7fc642b406e1'
    result = run(test_user_id)
    print(json.dumps(result, indent=4))