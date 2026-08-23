import json
from typing import Any


def build_feedback_safety_input(
        recommendation: dict[str, Any],
        feedback_entries: list[dict[str, Any]],
) -> str:
    if not feedback_entries:
        raise ValueError(
            "At least one feedback entry is required."
        )

    survey = recommendation.get("survey_snapshot") or {}
    weekly_distance = recommendation.get("content", {}).get("weekly_distance") or []

    historical_health_snapshot = {
        "current_issue_areas": (
            survey.get("current_issue_areas") or []
        ),
        "current_pain_level": survey.get(
            "current_pain_level"
        ),
        "has_medical_clearance": survey.get(
            "has_medical_clearance"
        ),
        "recovery_level": survey.get(
            "recovery_level"
        ),
    }

    plan_date_context = {
        "current_plan_start": weekly_distance[0]["start_date"] if weekly_distance else None,
        "current_plan_end": weekly_distance[-1]["end_date"] if weekly_distance else None,
    }

    current_feedback = [
        {
            "created_at": entry.get("created_at"),
            "feedback": entry.get("feedback"),
        }
        for entry in feedback_entries
    ]

    safety_input = {
        "historical_health_snapshot": (
            historical_health_snapshot
        ),
        "plan_date_context": plan_date_context,
        "current_feedback_oldest_to_newest": (
            current_feedback
        ),
    }

    return json.dumps(
        safety_input,
        ensure_ascii=False,
    )
