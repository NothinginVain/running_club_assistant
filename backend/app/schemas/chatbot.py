from pydantic import BaseModel, Field, field_validator

from app.schemas.running_structured_outputs import ChatMessage, CoachMemorySummary


class ChatbotRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=2000,
    )

    @field_validator("message", mode="before")
    @classmethod
    def clean_message(cls, value):
        if isinstance(value, str):
            return value.strip()

        return value


class ChatbotResponse(BaseModel):
    reply: str


class ChatbotEndResponse(BaseModel):
    summary: CoachMemorySummary


class ChatHistoryResponse(BaseModel):
    messages: list[ChatMessage] = Field(
        default_factory=list,
    )
    current_goal: str | None = None
    preferences: list[str] = Field(
        default_factory=list,
    )
    topics_of_interest: list[str] = Field(
        default_factory=list,
    )
    progress: str | None = None
