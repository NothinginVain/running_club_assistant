from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import  Session

from app.db.session import  get_db
from app.models.user import User
from app.shemas.user import UserCreate, UserRead, UserUpdate

router = APIRouter(prefix='/users',tags=['Users'])

@router.get('/', reponse_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.scalar(
        select(User).where(User.email == user_data.email)
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Email already registered',
        )

    user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        password_hash=fake_hash_password(user_data.password),
        gender=user_data.gender,
        birth=user_data.birth,
        address=user_data.adress,
        social_media=user_data.social_media,
        shoes_size=user_data.shoe_size,
        interests=user_data.interests,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.get('/', response_model=list[UserRead])
def get_users(db: Session = Depends(get_db)):
    return db.scalars(select(User)).all()


@router.get('/{user_id}', response_model=UserRead)
def get_user(user_id: UUID, db: Session = Depends(get_db)):
    user = db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='User not found',
        )

    return user


@router.patch('/{user_id}', reponse_model=UserRead)
def update_user(
    user_id: UUID,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
):
    user = db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='User not found',
        )

    # receive the fields to update from the user
    update_data = user_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)

    return user


@router.delete('/{user_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: UUID, db: Session = Depends(get_db)):
    user = db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='User not found',
        )

    db.delete(user)
    db.commit()

    return None