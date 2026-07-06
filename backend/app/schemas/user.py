from datetime import date, datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str

    gender: str | None = None
    birth: date | None = None
    address: str | None = None
    social_media: dict[str, Any] | None = None
    shoe_size: str | None = None
    interests: list[str] | None = None


class UserUpdate(BaseModel):
    full_name: str | None = None
    gender: str | None = None
    birth: date | None = None
    address: str | None = None
    social_media: dict[str, Any] | None = None
    shoe_size: str | None = None
    interests: list[str] | None = None


class UserRead(BaseModel):
    id: UUID
    full_name: str
    email: EmailStr

    gender: str | None = None
    birth: date | None = None
    address: str | None = None
    social_media: dict[str, Any] | None = None
    shoe_size: str | None = None
    interests: list[str] | None = None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)