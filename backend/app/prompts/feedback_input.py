import json
from typing import Any


def build_feedback_revision_input(
        user: dict[str, Any],
        recommendation: dict[str, Any],
        feedback_entries: list[dict[str, Any]],
        remaining_plan: dict[str, Any],
        safety_assessment: dict[str, Any] | None = None,
) -> str:
    if not feedback_entries:
        raise ValueError(
            "At least one feedback entry is required."
        )

    survey = recommendation.get("survey_snapshot") or {}
    content = recommendation.get("content") or {}

    feedback_context = [
        {
            "created_at": entry.get("created_at"),
            "feedback": entry.get("feedback"),
        }
        for entry in feedback_entries
    ]

    runner_measurements = {
        "height_cm": user.get("height_cm"),
    }

    selected_plan_context = {
        "title": recommendation.get("title"),
        "summary": content.get("summary"),
        "safety_notes": content.get("safety_notes") or [],
    }

    safety_contract = None

    if safety_assessment is not None:
        safety_contract = {
            "plan_mode": safety_assessment.get(
                "plan_mode"
            ),
            "current_pain_level": safety_assessment.get(
                "current_pain_level"
            ),
            "medically_cleared_activities": (
                safety_assessment.get(
                    "medically_cleared_activities"
                )
            ),
        }

    return f"""
    TASK
    Revise the selected plan for the remaining period only.

    RUNNER MEASUREMENTS
    {json.dumps(runner_measurements, ensure_ascii=False)}

    SURVEY SNAPSHOT
    {json.dumps(survey, ensure_ascii=False)}

    SELECTED PLAN CONTEXT
    {json.dumps(selected_plan_context, ensure_ascii=False)}

    SAFETY CONTRACT
    {json.dumps(safety_contract, ensure_ascii=False)}

    REMAINING PLAN
    {json.dumps(remaining_plan, ensure_ascii=False)}

    ATTACHED FEEDBACK, OLDEST TO NEWEST
    {json.dumps(feedback_context, ensure_ascii=False)}
    """.strip()
