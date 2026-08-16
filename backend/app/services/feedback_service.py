from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.feedback import Feedback
from app.models.recommendation import Recommendation
from app.schemas.feedback import FeedbackCreate


def create_feedback(
        db: Session,
        recommendation: Recommendation,
        feedback_data: FeedbackCreate,
) -> Feedback:
    feedback = Feedback(
        feedback=feedback_data.feedback,
        user_id=recommendation.user_id,
        recommendation_id=recommendation.id,
    )

    db.add(feedback)
    db.flush()

    return feedback


def get_feedback_by_recommendation_id(
        db: Session,
        recommendation_id: UUID,
) -> list[Feedback]:
    feedback_entries = db.scalars(
        select(Feedback).where(
            Feedback.recommendation_id == recommendation_id
        ).order_by(Feedback.created_at.asc(),
                   Feedback.id.asc(),)
    ).all()

    return list(feedback_entries)
