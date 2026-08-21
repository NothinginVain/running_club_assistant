from pydantic import BaseModel

from app.schemas.running_structured_outputs import ChatMessage, CoachMemorySummary


class ChatbotRequest(BaseModel):
    message: str


class ChatbotResponse(BaseModel):
    reply: str


class ChatbotEndResponse(BaseModel):
    summary: CoachMemorySummary


class ChatHistoryResponse(BaseModel):
    messages: list[ChatMessage]
    current_goal: str | None = None
    preferences: list[str] = []
    progress: str | None = None
