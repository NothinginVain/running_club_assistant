from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.coach_memory import CoachMemory
from app.schemas.running_structured_outputs import CoachMemorySummary


def normalize_coach_memory_summary(
    summary: dict | None,
) -> dict:
    # Older rows can contain cached plans and legacy feedback. Rebuilding the
    # value through this schema preserves the chat while removing those keys.
    chat = (summary or {}).get("chat") or {}

    return CoachMemorySummary(
        chat=chat,
    ).model_dump(
        mode="json",
    )


def get_or_create_coach_memory(
    db: Session,
    user_id: UUID,
) -> CoachMemory:
    coach_memory = db.scalars(
        select(CoachMemory).where(
            CoachMemory.user_id == user_id,
        )
    ).first()

    if coach_memory is None:
        coach_memory = CoachMemory(
            user_id=user_id,
            summary=CoachMemorySummary().model_dump(
                mode="json",
            ),
        )
        db.add(coach_memory)
        db.flush()

        return coach_memory

    normalized_summary = normalize_coach_memory_summary(
        coach_memory.summary,
    )

    if coach_memory.summary != normalized_summary:
        coach_memory.summary = normalized_summary

    return coach_memory
