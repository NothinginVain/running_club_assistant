from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.feedback import Feedback
from app.models.recommendation import Recommendation
from app.schemas.feedback import FeedbackCreate, HealthUpdateCreate


def build_health_update_feedback(
        health_update: HealthUpdateCreate,
) -> FeedbackCreate:
    warning_symptoms = ", ".join(
        health_update.warning_symptoms
    )

    if health_update.medically_cleared_activities:
        cleared_activities = ", ".join(
            activity.value
            for activity
            in health_update.medically_cleared_activities
        )
    else:
        cleared_activities = "none"

    additional_restrictions = (
        "yes"
        if health_update.has_additional_restrictions
        else "no"
    )

    feedback_text = (
        "HEALTH_UPDATE_V1\n"
        f"current_pain_level: {health_update.current_pain_level}\n"
        f"warning_symptoms: {warning_symptoms}\n"
        f"walking_symptom_response: "
        f"{health_update.walking_symptom_response}\n"
        f"professional_clearance_status: "
        f"{health_update.professional_clearance_status}\n"
        f"medically_cleared_activities: {cleared_activities}\n"
        f"has_additional_restrictions: {additional_restrictions}"
    )

    return FeedbackCreate(
        feedback=feedback_text,
    )


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
