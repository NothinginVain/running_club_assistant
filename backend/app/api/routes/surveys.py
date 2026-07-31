from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ValidationError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.survey import Survey
from app.models.user import User
from app.schemas.survey import RunningPlanSurveyAnswers, SurveyCreate, SurveyRead, SurveyUpdate
from app.models.enums import RecommendationType

router = APIRouter( prefix='/surveys',tags=['Surveys'],)


@router.get('/forms/running-plan')
def get_running_plan_survey_form():
    return RunningPlanSurveyAnswers.model_json_schema()


@router.post('/users/{user_id}', response_model=SurveyRead, status_code=status.HTTP_201_CREATED)
def create_survey(
        user_id: UUID,
        survey_data: SurveyCreate,
        db: Session = Depends(get_db),
):
    user = db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='User not found',
        )
    answers = (
        survey_data.answers.model_dump(mode="json")
        if isinstance(survey_data.answers, BaseModel)
        else survey_data.answers
    )

    survey = Survey(
        user_id=user_id,
        survey_type=survey_data.survey_type,
        answers=answers,
    )

    db.add(survey)
    db.commit()
    db.refresh(survey)

    return survey

@router.get('/', response_model=list[SurveyRead])
def get_surveys(db: Session = Depends(get_db)):
    return db.scalars(select(Survey)).all()


@router.get('/users/{user_id}/latest', response_model=SurveyRead)
def get_latest_survey_by_user(
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
        select(Survey).where(Survey.user_id == user_id)
        .order_by(Survey.created_at.desc()).limit(1)
    ).first()

    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='No surveys found for this user',
        )

    return survey


@router.get('/users/{user_id}', response_model=list[SurveyRead])
def get_surveys_by_user(
        user_id:UUID,
        db: Session = Depends(get_db),
):
    user = db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='User not found',
        )

    return db.scalars(
        select(Survey).where(Survey.user_id == user_id)
    ).all()


@router.get('/{survey_id}', response_model=SurveyRead)
def get_survey(
        survey_id: UUID, db: Session = Depends(get_db),
):
    survey = db.get(Survey, survey_id)

    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Survey not found',
        )

    return survey


@router.patch('/{survey_id}', response_model=SurveyRead)
def update_survey(
        survey_id: UUID,
        survey_data: SurveyUpdate,
        db: Session = Depends(get_db),
):
    survey =  db.get(Survey, survey_id)

    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Survey not found',
        )

    update_data = survey_data.model_dump(exclude_unset=True)

    if (
            "answers" in update_data
            and survey.survey_type == RecommendationType.RUNNING_PLAN
    ):
        try:
            validated_answers = RunningPlanSurveyAnswers.model_validate(
                update_data["answers"]
            )
        except ValidationError as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=exc.errors(include_context=False),
            ) from exc

        update_data["answers"] = validated_answers.model_dump(mode="json")

    for key, value in update_data.items():
        setattr(survey, key, value)

    db.commit()
    db.refresh(survey)

    return survey


@router.delete('/{survey_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_survey(
        survey_id: UUID,
        db: Session = Depends(get_db),
):
    survey = db.get(Survey, survey_id)

    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Survey not found',
        )

    db.delete(survey)
    db.commit()

    return None
