from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.recommendation import Recommendation
from app.models.coach_memory import CoachMemory
from app.schemas.running_structured_outputs import CoachMemorySummary, RecommendationMemory, FeedbackMemory


def get_or_create_coach_memory(
    db: Session,
    user_id: UUID,
) -> CoachMemory:
    coach_memory = db.scalars(
        select(CoachMemory).where(
            CoachMemory.user_id == user_id
        )
    ).first()

    if coach_memory is None:
        coach_memory = CoachMemory(
            user_id=user_id,
            summary=CoachMemorySummary().model_dump(),
        )
        db.add(coach_memory)
        db.flush()

    return coach_memory


def update_memory_after_recommendation(
    db: Session,
    recommendation: Recommendation,
) -> CoachMemory:
    coach_memory = get_or_create_coach_memory(
        db,
        recommendation.user_id,
    )

    memory_entry = RecommendationMemory(
        recommendation_id=recommendation.id,
        title=recommendation.title,
        summary=recommendation.content.get("summary"),
        created_at=recommendation.created_at,
    ).model_dump(mode="json")

    previous_recommendations = coach_memory.summary.get(
        "recommendations",
        [],
    )

    coach_memory.summary = {
        **coach_memory.summary,
        "recommendations": [
            *previous_recommendations,
            memory_entry,
        ][-10:],
    }

    coach_memory.source_recommendation_count += 1

    return coach_memory


def update_memory_after_feedback(
    db: Session,
    recommendation: Recommendation,
) -> CoachMemory:
    coach_memory = get_or_create_coach_memory(
        db,
        recommendation.user_id,
    )

    memory_entry = FeedbackMemory(
        recommendation_id=recommendation.id,
        title=recommendation.title,
        rating=recommendation.feedback_rating,
        comment=recommendation.feedback_comment,
        created_at=recommendation.updated_at,
    ).model_dump(mode="json")

    previous_feedback = coach_memory.summary.get(
        "feedback",
        [],
    )

    coach_memory.summary = {
        **coach_memory.summary,
        "feedback": [
            *previous_feedback,
            memory_entry,
        ][-10:],
    }

    coach_memory.source_feedback_count += 1

    return coach_memory
