from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.recommendation import Recommendation


REVISION_MARKER = " — Revised "


def build_initial_plan_title(
        goal: str,
        plan_number: int,
) -> str:
    goal_title = goal.replace("_", " ").title()
    return f"Plan {plan_number} · {goal_title}"


def build_revision_title(title: str) -> str:
    base_title, marker, revision_value = title.rpartition(
        REVISION_MARKER,
    )

    if marker and revision_value.isdigit():
        next_revision = int( revision_value ) + 1
        return f"{base_title}{REVISION_MARKER}{next_revision}"

    return f"{title}{REVISION_MARKER}1"

def get_next_plan_number(
        db: Session,
        user_id: UUID,
) -> int:
    original_plan_count = db.scalar(
        select(func.count(Recommendation.id))
        .where(
            Recommendation.user_id == user_id,
            Recommendation.title.not_like(
                f"%{REVISION_MARKER}%"
            ),
        )
    )

    return (original_plan_count or 0) + 1
