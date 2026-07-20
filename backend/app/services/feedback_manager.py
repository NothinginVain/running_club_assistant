import json
import os
import requests
from dotenv import load_dotenv
from langfuse import observe

from app.client_openai import get_recommendation
from app.prompts.feedback_prompt import get_feedback_prompt
from app.prompts.feedback_input import build_feedback_input
from app.services.recommendation_manager import save_recommendation

load_dotenv()

BASE_URL = os.getenv('BASE_URL')

def build_feedback_payload():
    return {
        'feedback_rating': 4 ,
        'feedback_comment': 'will like to have the strength plan and mobility in the days that i am running, want to know if i do them after or before running ',
    }


def save_feedback(recommendation_id, payload):
    response = requests.patch(
        f'{BASE_URL}/recommendations/{recommendation_id}/feedback',
        json=payload,
    )
    response.raise_for_status()
    return response.json()


def generate_feedback_recommendation(previus_recommendation, prompt_version):
    instructions = get_feedback_prompt(prompt_version)
    input_text = build_feedback_input(previus_recommendation)
    return get_recommendation(input_text, instructions, prompt_version)


def build_feedback_recommendation_package(previus_recommendation, new_recommendation):
    return {
        'survey_id': previus_recommendation['survey_id'],
        'recommendation_type': previus_recommendation['recommendation_type'],
        'title': new_recommendation['title'],
        'content': new_recommendation['content'],
        'explanation': new_recommendation.get('explanation'),
    }


@observe(name='feedback_recommendation_execution')
def execute_feedback_recommendation(recommendation_id, user_feedback, prompt_version='simple2'):
    saved_feedback_recommendation = save_feedback(recommendation_id,user_feedback)
    new_recommendation = generate_feedback_recommendation(saved_feedback_recommendation, prompt_version)
    payload = build_feedback_recommendation_package(saved_feedback_recommendation, new_recommendation)

    return save_recommendation(payload)


if __name__ == '__main__':
    test_recommendation_id = '6a54a5eb-f27c-4a72-b384-fa2eed9b64c4'

    test_feedback_payload = build_feedback_payload()
    result = execute_feedback_recommendation(test_recommendation_id, test_feedback_payload)

    print(json.dumps(result, indent=4))
