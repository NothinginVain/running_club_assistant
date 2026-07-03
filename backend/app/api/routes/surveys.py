from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.survey import Survey
from app.models.user import User
from app.shemas.survey import SurveyCreate, SurveyRead, SurveyUpdate

router = APIRouter( prefix='/surveys',tags=['Surveys'],)

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
    survey = Survey(
        user_id=user_id,
        survey_type=survey_data.survey_type,
        answer=survey_data.answers,
    )

    db.add(survey)
    db.commit()
    db.refresh(survey)

    return survey