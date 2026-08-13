import json
import os
from datetime import date

import requests
from dotenv import load_dotenv
from langfuse import observe

from app.client_openai import get_feedback_safety_assessment, get_recommendation
from app.prompts.feedback_input import (
    build_feedback_input,
    build_feedback_revision_input,
)
from app.prompts.feedback_prompt import get_feedback_prompt
from app.prompts.feedback_safety_prompt import get_feedback_safety_prompt
from app.prompts.feedback_safety_input import build_feedback_safety_input
from app.services.plan_revision_service import build_remaining_plan_context
from app.services.recommendation_manager import get_user, save_recommendation
from app.services.running_plan_service import synchronize_weekly_distances

load_dotenv()

BASE_URL = os.getenv('BASE_URL')

class HealthUpdateRequiredError(Exception):
    def __init__(
            self,
            message: str,
            questions: list[str],
    ):
        super().__init__(message)
        self.questions = questions


def create_feedback_entry(recommendation_id, feedback_text):
    payload = {'feedback': feedback_text,}
    response = requests.post(
        f'{BASE_URL}/recommendations/{recommendation_id}/feedback',
        json=payload,
    )

    if not response.ok:
        print("Feedback API error:")
        print(response.text)

    response.raise_for_status()

    return response.json()


def get_feedback_entries(recommendation_id):
    response = requests.get(f'{BASE_URL}/recommendations/{recommendation_id}/feedback')

    if not response.ok:
        print("Feedback API error:")
        print(response.text)

    response.raise_for_status()

    return response.json()


def assess_feedback_safety(
        recommendation,
        feedback_entries,
        prompt_version="safety1",
):
    instructions = get_feedback_safety_prompt(
        prompt_version,
    )

    input_text = build_feedback_safety_input(
        recommendation,
        feedback_entries,
    )

    return get_feedback_safety_assessment(
        input_text,
        instructions,
        prompt_version,
    )


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


@observe(name='remaining_plan_revision_execution')
def execute_remaining_plan_revision(
        recommendation,
        revision_date=None,
        prompt_version='remaining',
):
    feedback_entries = get_feedback_entries(recommendation['id'])

    if not feedback_entries:
        raise ValueError(
            'The selected recommendation has no feedback'
        )

    safety_assessment = assess_feedback_safety(
        recommendation,
        feedback_entries,
    )

    if (
        safety_assessment['decision']
        == 'needs_health_update'
    ):
        raise HealthUpdateRequiredError(
            safety_assessment['message'],
            safety_assessment['questions'],
        )

    user = get_user(
        recommendation['user_id'],
    )

    effective_revision_date = (
        revision_date or date.today()
    )

    remaining_plan = build_remaining_plan_context(
        recommendation,
        effective_revision_date,
    )

    instructions = get_feedback_prompt(prompt_version)

    input_text = build_feedback_revision_input(
        user,
        recommendation,
        feedback_entries,
        remaining_plan,
    )

    revised_recommendation = get_recommendation(
        input_text,
        instructions,
        prompt_version,
    )

    revised_recommendation = synchronize_weekly_distances(
        revised_recommendation)

    payload = build_feedback_recommendation_package(
        recommendation,
        revised_recommendation,
    )

    return save_recommendation(payload)


if __name__ == '__main__':
    test_recommendation_id = '6a54a5eb-f27c-4a72-b384-fa2eed9b64c4'

    test_feedback_payload = build_feedback_payload()
    result = execute_feedback_recommendation(test_recommendation_id, test_feedback_payload)

    print(json.dumps(result, indent=4))
