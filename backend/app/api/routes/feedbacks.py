from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.recommendation import Recommendation
from app.schemas.feedback import FeedbackCreate, FeedbackRead
from app.services.feedback_service import (
    create_feedback,
    get_feedback_by_recommendation_id,
)


router = APIRouter(
    prefix="/recommendations",
    tags=["Feedback"],
)


@router.post(
    "/{recommendation_id}/feedback",
    response_model=FeedbackRead,
    status_code=status.HTTP_201_CREATED,
)
def add_recommendation_feedback(
    recommendation_id: UUID,
    feedback_data: FeedbackCreate,
    db: Session = Depends(get_db),
):
    recommendation = db.get(Recommendation, recommendation_id)

    if recommendation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found",
        )

    feedback = create_feedback(
        db,
        recommendation,
        feedback_data,
    )

    db.commit()
    db.refresh(feedback)

    return feedback


@router.get(
    "/{recommendation_id}/feedback",
    response_model=list[FeedbackRead],
)
def get_recommendation_feedback(
    recommendation_id: UUID,
    db: Session = Depends(get_db),
):
    recommendation = db.get(Recommendation, recommendation_id)

    if recommendation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found",
        )

    return get_feedback_by_recommendation_id(
        db,
        recommendation.id,
    )