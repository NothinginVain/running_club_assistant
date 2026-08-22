import os
from datetime import date

import requests
from dotenv import load_dotenv
from langfuse import observe

from app.client_openai import get_feedback_safety_assessment, get_recommendation
from app.prompts.feedback_input import build_feedback_revision_input
from app.prompts.feedback_prompt import get_feedback_prompt
from app.prompts.feedback_safety_prompt import get_feedback_safety_prompt
from app.prompts.feedback_safety_input import build_feedback_safety_input
from app.services.plan_revision_service import build_remaining_plan_context
from app.services.recommendation_manager import get_user, save_recommendation
from app.services.recommendation_title_service import build_revision_title
from app.services.running_plan_service import synchronize_weekly_distances

load_dotenv()

BASE_URL = os.getenv('BASE_URL')

# NOTE: `assess_feedback_safety` is reused by
# app/api/routes/feedbacks.py and is still live. The
# `requests`-based helpers and `execute_remaining_plan_revision` below are
# legacy CLI-only code with no authenticated session — see the note at the
# top of app/cli.py.


HEALTH_UPDATE_QUESTIONS: tuple[str, ...] = (
    "What is your current pain level from 0 to 10?",
    (
        "Do you currently have swelling, restricted movement, "
        "or abnormal walking? (yes/no)"
    ),
    (
        "Can you walk or do easy running without symptoms "
        "getting worse? (yes/no)"
    ),
    (
        "Has a doctor or physiotherapist cleared you for walking, "
        "walk-run, or running training? (yes/no)"
    ),
    (
        "What exact activities or restrictions did they give you? "
        "If you were not assessed, write \"no assessment\"."
    ),
)


class HealthUpdateRequiredError(Exception):
    def __init__(
            self,
            message: str,
            questions: list[str],
    ):
        super().__init__(message)
        self.questions = questions


class CoachReviewRequiredError(Exception):
    pass


def create_feedback_entry(recommendation_id, feedback_text):
    payload = {'feedback': feedback_text}
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
        prompt_version="safety3",
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


def build_feedback_recommendation_package(
        previous_recommendation,
        new_recommendation,
):
    return {
        'survey_id': previous_recommendation['survey_id'],
        'recommendation_type': previous_recommendation['recommendation_type'],
        'title': build_revision_title(
            previous_recommendation['title'],
        ),
        'content': new_recommendation['content'],
        'explanation': new_recommendation.get('explanation'),
    }


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
            list(HEALTH_UPDATE_QUESTIONS),
        )

    if (
        safety_assessment['decision']
        == 'requires_coach_review'
    ):
        raise CoachReviewRequiredError(
            safety_assessment['message'],
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
