from app.client_openai import get_feedback_safety_assessment
from app.prompts.feedback_safety_prompt import get_feedback_safety_prompt
from app.prompts.feedback_safety_input import build_feedback_safety_input


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


def assess_feedback_safety(
        recommendation,
        feedback_entries,
        prompt_version="safety4",
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
