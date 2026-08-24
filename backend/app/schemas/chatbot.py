from pydantic import BaseModel, Field

from app.schemas.running_structured_outputs import ChatMessage, CoachMemorySummary


class ChatbotRequest(BaseModel):
    message: str


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
