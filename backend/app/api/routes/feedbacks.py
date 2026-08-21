from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.client_openai import get_recommendation
from app.db.session import get_db
from app.models.recommendation import Recommendation
from app.models.user import User
from app.prompts.feedback_input import build_feedback_revision_input
from app.prompts.feedback_prompt import get_feedback_prompt
from app.schemas.feedback import FeedbackCreate, FeedbackRead
from app.schemas.recommendation import RecommendationRead
from app.services.feedback_manager import (
    HEALTH_UPDATE_QUESTIONS,
    assess_feedback_safety,
    build_revision_title,
)
from app.services.feedback_service import (
    create_feedback,
    get_feedback_by_recommendation_id,
)
from app.services.plan_revision_service import build_remaining_plan_context
from app.services.running_plan_service import synchronize_weekly_distances


router = APIRouter(
    prefix="/recommendations",
    tags=["Feedback"],
)

REVISION_PROMPT_VERSION = "remaining"


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


@router.post(
    "/{recommendation_id}/revise",
    response_model=RecommendationRead,
    status_code=status.HTTP_201_CREATED,
)
def revise_recommendation_from_feedback(
    recommendation_id: UUID,
    db: Session = Depends(get_db),
):
    recommendation = db.get(Recommendation, recommendation_id)

    if recommendation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found",
        )

    feedback_entries = get_feedback_by_recommendation_id(
        db,
        recommendation_id,
    )

    if not feedback_entries:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Add feedback before requesting a revised plan",
        )

    recommendation_dict = {
        "id": str(recommendation.id),
        "survey_id": str(recommendation.survey_id),
        "user_id": str(recommendation.user_id),
        "recommendation_type": recommendation.recommendation_type,
        "title": recommendation.title,
        "content": recommendation.content,
        "explanation": recommendation.explanation,
        "survey_snapshot": recommendation.survey_snapshot,
    }
    feedback_dicts = [
        {
            "created_at": entry.created_at.isoformat(),
            "feedback": entry.feedback,
        }
        for entry in feedback_entries
    ]

    try:
        safety_assessment = assess_feedback_safety(
            recommendation_dict,
            feedback_dicts,
        )
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Your coach couldn't review this plan right now. Please try again in a moment.",
        ) from error

    if safety_assessment["decision"] == "needs_health_update":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "reason": "needs_health_update",
                "message": safety_assessment["message"],
                "questions": list(HEALTH_UPDATE_QUESTIONS),
            },
        )

    if safety_assessment["decision"] == "requires_coach_review":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "reason": "requires_coach_review",
                "message": safety_assessment["message"],
            },
        )

    user = db.get(User, recommendation.user_id)
    user_dict = {"height_cm": user.height_cm if user else None}

    remaining_plan = build_remaining_plan_context(
        recommendation_dict,
        date.today(),
    )

    instructions = get_feedback_prompt(REVISION_PROMPT_VERSION)
    input_text = build_feedback_revision_input(
        user_dict,
        recommendation_dict,
        feedback_dicts,
        remaining_plan,
    )

    try:
        revised = get_recommendation(
            input_text,
            instructions,
            REVISION_PROMPT_VERSION,
        )
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Your coach couldn't generate an updated plan right now. Please try again in a moment.",
        ) from error
    revised = synchronize_weekly_distances(revised)

    new_recommendation = Recommendation(
        survey_id=recommendation.survey_id,
        user_id=recommendation.user_id,
        recommendation_type=recommendation.recommendation_type,
        title=build_revision_title(recommendation.title),
        content=revised["content"],
        explanation=revised.get("explanation"),
        survey_snapshot=recommendation.survey_snapshot,
    )

    db.add(new_recommendation)
    db.commit()
    db.refresh(new_recommendation)

    return new_recommendation