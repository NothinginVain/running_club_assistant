from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.client_openai import get_chat_reply, summarize_conversation
from app.db.session import get_db
from app.models.coach_memory import CoachMemory
from app.models.knowledge_base import KnowledgeBase
from app.models.user import User
from app.prompts.chatbot_input import build_chatbot_input, build_conversation_summary_input
from app.prompts.chatbot_prompt import get_chatbot_prompt, get_memory_summary_prompt
from app.schemas.chatbot import ChatbotEndResponse, ChatbotRequest, ChatbotResponse
from app.schemas.running_structured_outputs import CoachMemorySummary

router = APIRouter(prefix='/chatbot', tags=['Chatbot'])


def _get_or_create_coach_memory(db: Session, user_id: UUID) -> CoachMemory:
    coach_memory = db.scalars(
        select(CoachMemory).where(CoachMemory.user_id == user_id)
    ).first()

    if not coach_memory:
        coach_memory = CoachMemory(
            user_id=user_id,
            summary=CoachMemorySummary().model_dump(),
        )
        db.add(coach_memory)
        db.commit()
        db.refresh(coach_memory)

    return coach_memory


def _user_profile(user: User) -> dict:
    return {
        "full_name": user.full_name,
        "interests": user.interests,
        "shoe_size": user.shoe_size,
    }


@router.post('/{user_id}', response_model=ChatbotResponse)
def chat_with_coach(
        user_id: UUID,
        chat_data: ChatbotRequest,
        db: Session = Depends(get_db),
):
    user = db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='User not found',
        )

    coach_memory = _get_or_create_coach_memory(db, user_id)
    conversation_history = coach_memory.summary.get("current_conversation", [])

    knowledge_documents = db.scalars(select(KnowledgeBase)).all()

    instructions = get_chatbot_prompt()
    input_text = build_chatbot_input(
        chat_data.message,
        _user_profile(user),
        coach_memory.summary,
        conversation_history,
        [
            {
                "title": doc.title,
                "content": doc.content,
                "document_type": doc.document_type,
            }
            for doc in knowledge_documents
        ],
    )

    result = get_chat_reply(input_text, instructions, "simple")

    updated_conversation = conversation_history + [
        {"role": "user", "content": chat_data.message},
        {"role": "assistant", "content": result["reply"]},
    ]

    coach_memory.summary = {
        **coach_memory.summary,
        "current_conversation": updated_conversation,
    }

    db.commit()
    db.refresh(coach_memory)

    return ChatbotResponse(reply=result["reply"])


@router.post('/{user_id}/end', response_model=ChatbotEndResponse)
def end_chat(
        user_id: UUID,
        db: Session = Depends(get_db),
):
    user = db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='User not found',
        )

    coach_memory = _get_or_create_coach_memory(db, user_id)
    conversation_history = coach_memory.summary.get("current_conversation", [])

    if not conversation_history:
        current_summary = {
            key: value
            for key, value in coach_memory.summary.items()
            if key != "current_conversation"
        }
        return ChatbotEndResponse(summary=CoachMemorySummary(**current_summary))

    instructions = get_memory_summary_prompt()
    input_text = build_conversation_summary_input(
        _user_profile(user),
        coach_memory.summary,
        conversation_history,
    )

    updated_summary = summarize_conversation(input_text, instructions, "simple")

    coach_memory.summary = updated_summary

    db.commit()
    db.refresh(coach_memory)

    return ChatbotEndResponse(summary=CoachMemorySummary(**updated_summary))
