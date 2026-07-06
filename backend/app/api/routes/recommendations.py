from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.recommendation import Recommendation
from app.models.survey import Survey
from app.schemas.recommendation import (
    RecommendationCreate,
    RecommendationFavoriteUpdate,
    RecommendationFeedbackUpdate,
    RecommendationRead,
)


router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"],
)


@router.post('/', response_model=RecommendationRead, status_code=status.HTTP_201_CREATED)
def create_recommendation(
        recommendation_data: RecommendationCreate,
        db: Session = Depends(get_db),
):
    survey = db.get(Survey, recommendation_data.survey_id)

    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Survey not found',
        )

    recommendation = Recommendation(
        survey_id=recommendation_data.survey_id,
        recommendation_type=recommendation_data.recommendation_type,
        title=recommendation_data.title,
        content=recommendation_data.content,
        explanation=recommendation_data.explanation,
        survey_snapshot=survey.answers,
    )

    db.add(recommendation)
    db.commit()
    db.refresh(recommendation)

    return recommendation


@router.get('/', response_model=list[RecommendationRead])
def get_recommendations(db: Session = Depends(get_db)):
    return db.scalars(select(Recommendation)).all()


@router.get('/{recommendation_id}', response_model=RecommendationRead)
def get_recommendation(
        recommendation_id: UUID,
        db: Session = Depends(get_db),
):
    recommendation = db.get(Recommendation, recommendation_id)

    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Recommendation not found',
        )

    return  recommendation


@router.get('/survey/{survey_id}/items', response_model=list[RecommendationRead])
def get_recommendations_by_survey(
        survey_id: UUID,
        db: Session = Depends(get_db),
):
    survey = db.get(Survey, survey_id)

    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Survey not found',
        )

    return db.scalars(
        select(Recommendation).where(Recommendation.survey_id == survey_id)
    ).all()


@router.patch('/{recommendation_id}/feedback', response_model=RecommendationRead)
def update_recommendation_feedback(
        recommendation_id: UUID,
        feedback_data: RecommendationFeedbackUpdate,
        db: Session = Depends(get_db),
):
    recommendation = db.get(Recommendation, recommendation_id)

    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Recommendation not found',
        )

    recommendation.feedback_rating = feedback_data.feedback_rating
    recommendation.feedback_comment = feedback_data.feedback_comment

    db.commit()
    db.refresh(recommendation)

    return recommendation


@router.patch('/{recommendation_id}/favorite', response_model=RecommendationRead)
def update_recommendation_favorite(
        recommendation_id: UUID,
        favorite_data: RecommendationFavoriteUpdate,
        db: Session = Depends(get_db)
):
    recommendation = db.get(Recommendation, recommendation_id)

    if not recommendation:
        raise HTTPException(
            stauts_code=status.HTTP_404_NOT_FOUND,
            detail='Recommendation not found',
        )

    recommendation.is_favorite = favorite_data.is_favorite

    db.commit()
    db.refresh(recommendation)

    return recommendation


@router.delete('/{recommendation_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_recommendation(
        recommendation_id: UUID,
        db: Session = Depends(get_db)
):
    recommendation = db.get(Recommendation, recommendation_id)

    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Recommendation not found',
        )

    db.delete(recommendation)
    db.commit()

    return None