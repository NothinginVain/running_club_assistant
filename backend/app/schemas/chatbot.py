from pydantic import BaseModel

from app.schemas.running_structured_outputs import CoachMemorySummary


class ChatbotRequest(BaseModel):
    message: str


class ChatbotResponse(BaseModel):
    reply: str


class ChatbotEndResponse(BaseModel):
    summary: CoachMemorySummary
