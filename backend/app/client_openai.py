from typing import Any
from dotenv import load_dotenv
from langfuse.openai import OpenAI
from app.schemas.feedback_revision import FeedbackSafetyAssessment
from app.schemas.running_structured_outputs import RunningPlanOutput, ChatReplyOutput, ChatSummaryOutput
from app.schemas.training_safety import TrainingSafetyAssessment

load_dotenv()

client = OpenAI()


def get_training_safety_assessment(
    input_text: str,
    instructions: str,
    prompt_version: str,
) -> dict[str, Any]:
    response = client.responses.parse(
        model="gpt-5-mini",
        reasoning={"effort":"minimal"},
        instructions=instructions,
        input=input_text,
        text_format=TrainingSafetyAssessment,
        metadata={
            "feature": "training_safety",
            "environment": "local_backend",
            "prompt_version": prompt_version,
        },
    )

    assessment = response.output_parsed

    if assessment is None:
        raise ValueError(
            "OpenAI returned no training safety assessment."
        )

    return assessment.model_dump()


def get_recommendation(
        input_text: str,
        instructions: str,
        prompt_version: str,
        plan_mode: str | None = None,
) -> dict[str, Any]:
    metadata = {
        "feature": "running_plan",
        "environment": "local_backend",
        "prompt_version": prompt_version,
    }

    if plan_mode is not None:
        metadata["plan_mode"] = plan_mode

    response = client.responses.parse(
        model="gpt-5-mini",
        instructions=instructions,
        input=input_text,
        text_format=RunningPlanOutput,
        metadata=metadata,
    )

    structured_output = response.output_parsed

    if structured_output is None:
        raise ValueError(
            "OpenAI returned no structured running plan output."
        )

    return structured_output.model_dump()


def get_feedback_safety_assessment(
        input_text: str,
        instructions: str,
        prompt_version: str,
) -> dict[str, Any]:
    response = client.responses.parse(
        model="gpt-5-mini",
        reasoning={"effort":"minimal"},
        instructions=instructions,
        input=input_text,
        text_format=FeedbackSafetyAssessment,
        metadata={
            "feature": "feedback_safety",
            "environment": "local_backend",
            "prompt_version": prompt_version,
        },
    )

    assessment = response.output_parsed

    if assessment is None:
        raise ValueError(
            "OpenAI returned no feedback safety assessment."
        )

    return assessment.model_dump()


def get_chat_reply(input_text: str, instructions: str, prompt_version: str) -> dict[str, Any]:
    response = client.responses.parse(
        model="gpt-5-mini",
        instructions=instructions,
        input=input_text,
        text_format=ChatReplyOutput,
        metadata={
            "feature": "chatbot",
            "environment": "local_backend",
            "prompt_version": prompt_version,
        },
    )

    structured_output = response.output_parsed

    if structured_output is None:
        raise ValueError(
            "OpenAI returned no structured chat reply output."
        )

    return structured_output.model_dump()


def summarize_conversation(input_text: str, instructions: str, prompt_version: str) -> dict[str, Any]:
    response = client.responses.parse(
        model="gpt-4o-mini",
        instructions=instructions,
        input=input_text,
        text_format=ChatSummaryOutput,
        metadata={
            "feature": "coach_memory_summary",
            "environment": "local_backend",
            "prompt_version": prompt_version,
        },
    )

    structured_output = response.output_parsed

    if structured_output is None:
        raise ValueError(
            "OpenAI returned no structured chat summary output."
        )

    return structured_output.model_dump()


def create_embeddings(texts: list[str]) -> list[list[float]]:
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=texts,
    )

    return [item.embedding for item in response.data]

