import json
from typing import Any


def build_feedback_revision_input(
        user: dict[str, Any],
        recommendation: dict[str, Any],
        feedback_entries: list[dict[str, Any]],
        remaining_plan: dict[str, Any],
) -> str:
    if not feedback_entries:
        raise ValueError(
            "At least one feedback entry is required."
        )

    survey = recommendation.get("survey_snapshot") or {}
    content = recommendation.get("content") or {}
    explanation = recommendation.get("explanation") or {}

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
        "nutrition": content.get("nutrition") or [],
        "safety_notes": content.get("safety_notes") or [],
        "important_assumptions": (
            explanation.get("important_assumptions") or []
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

    REMAINING PLAN
    {json.dumps(remaining_plan, ensure_ascii=False)}

    ATTACHED FEEDBACK, OLDEST TO NEWEST
    {json.dumps(feedback_context, ensure_ascii=False)}
    """.strip()
