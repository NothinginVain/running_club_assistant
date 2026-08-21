from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import RecommendationType
from app.models.user import User
from app.models.recommendation import Recommendation
from app.models.survey import Survey
from app.schemas.recommendation import (
    RecommendationCreate,
    RecommendationFavoriteUpdate,
    RecommendationRatingUpdate,
    RecommendationRead,
)
from app.services.recommendation_manager import (
    generate_recommendation as generate_ai_recommendation,
)


router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"],
)

GENERATION_PROMPT_VERSION = "medium4"


@router.post('/', response_model=RecommendationRead, status_code=status.HTTP_201_CREATED)
def create_recommendation(
        recommendation_data: RecommendationCreate,
        db: Session = Depends(get_db),
):
    survey = db.get(Survey, recommendation_data.survey_id)

    if survey is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Survey not found',
        )

    recommendation = Recommendation(
        survey_id=recommendation_data.survey_id,
        user_id=survey.user_id,
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


@router.post(
    "/generate/{user_id}",
    response_model=RecommendationRead,
    status_code=status.HTTP_201_CREATED,
)
def generate_recommendation_for_user(
        user_id: UUID,
        db: Session = Depends(get_db),
):
    user = db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='User not found',
        )

    survey = db.scalars(
        select(Survey)
        .where(Survey.user_id == user_id)
        .order_by(Survey.created_at.desc())
        .limit(1)
    ).first()

    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Complete the survey before generating a recommendation',
        )

    if survey.survey_type != RecommendationType.RUNNING_PLAN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Automatic generation is only available for running-plan surveys',
        )

    user_dict = {
        'full_name': user.full_name,
        'address': user.address,
    }
    survey_dict = {
        'answers': survey.answers,
        'created_at': survey.created_at,
    }

    try:
        ai_recommendation = generate_ai_recommendation(
            user_dict,
            survey_dict,
            GENERATION_PROMPT_VERSION,
        )
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Your coach couldn't generate a plan right now. Please try again in a moment.",
        ) from error

    recommendation = Recommendation(
        survey_id=survey.id,
        user_id=user.id,
        recommendation_type=survey.survey_type,
        title=ai_recommendation['title'],
        content=ai_recommendation['content'],
        explanation=ai_recommendation.get('explanation'),
        survey_snapshot=survey.answers,
    )

    db.add(recommendation)
    db.commit()
    db.refresh(recommendation)

    return recommendation


@router.get('/', response_model=list[RecommendationRead])
def get_recommendations(db: Session = Depends(get_db)):
    return db.scalars(select(Recommendation)).all()


@router.get('/user/{user_id}', response_model=list[RecommendationRead])
def get_recommendations_by_user(user_id: UUID, db: Session = Depends(get_db)):
    user = db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='User not found',
        )

    return db.scalars(
        select(Recommendation)
        .join(Survey)
        .where(Survey.user_id == user_id)
        .order_by(Recommendation.created_at.desc())
    ).all()


@router.get('/user/{user_id}/favorites', response_model=list[RecommendationRead])
def get_favorite_recommendation_by_user(user_id: UUID, db: Session = Depends(get_db)):
    user = db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='User not found',
        )

    return db.scalars(
        select(Recommendation)
        .join(Survey)
        .where(
            Survey.user_id == user_id,
            Recommendation.is_favorite == True,
        )
        .order_by(Recommendation.created_at.desc())
    ).all()


@router.get('/survey/{survey_id}', response_model=list[RecommendationRead])
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


@router.patch(
    "/{recommendation_id}/rating",
    response_model=RecommendationRead,
)
def update_recommendation_rating(
    recommendation_id: UUID,
    rating_data: RecommendationRatingUpdate,
    db: Session = Depends(get_db),
):
    recommendation = db.get(
        Recommendation,
        recommendation_id,
    )

    if recommendation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found",
        )

    recommendation.feedback_rating = rating_data.feedback_rating

    db.commit()
    db.refresh(recommendation)

    return recommendation


@router.patch(
    "/{recommendation_id}/favorite",
    response_model=RecommendationRead,
)
def update_recommendation_favorite(
    recommendation_id: UUID,
    favorite_data: RecommendationFavoriteUpdate,
    db: Session = Depends(get_db),
):
    recommendation = db.get(
        Recommendation,
        recommendation_id,
    )

    if recommendation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found",
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
