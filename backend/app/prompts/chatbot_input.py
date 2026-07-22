from typing import Any


def _format_knowledge(knowledge_documents: list[dict[str, Any]]) -> str:
    knowledge_text = "\n\n".join(
        f"[{doc.get('document_type') or 'doc'}] {doc.get('title')}\n{doc.get('content')}"
        for doc in knowledge_documents
    )

    return knowledge_text or "No knowledge documents available."


def _format_conversation(conversation_history: list[dict[str, str]]) -> str:
    conversation_text = "\n".join(
        f"{'Runner' if turn.get('role') == 'user' else 'Coach'}: {turn.get('content')}"
        for turn in conversation_history
    )

    return conversation_text or "No messages yet this session."


def build_chatbot_input(
    message: str,
    user: dict[str, Any],
    memory: dict[str, Any],
    conversation_history: list[dict[str, str]],
    knowledge_documents: list[dict[str, Any]],
) -> str:
    return f"""
    RUNNER PROFILE

    Name: {user.get("full_name")}
    Interests: {user.get("interests")}
    Shoe size: {user.get("shoe_size")}

    RUNNER MEMORY SUMMARY (from previous sessions)

    Current goal: {memory.get("current_goal")}
    Preferences: {memory.get("preferences")}
    Progress: {memory.get("progress")}
    Past plans: {memory.get("plans")}
    Feedback highlights: {memory.get("feedback_highlights")}

    CONVERSATION SO FAR (this session)

    {_format_conversation(conversation_history)}

    CLUB KNOWLEDGE DOCUMENTS

    {_format_knowledge(knowledge_documents)}

    RUNNER MESSAGE

    {message}

    Reply to the runner's message using the profile, memory summary, conversation so far, and knowledge documents above.
    """.strip()


def build_conversation_summary_input(
    user: dict[str, Any],
    memory: dict[str, Any],
    conversation_history: list[dict[str, str]],
) -> str:
    return f"""
    RUNNER PROFILE

    Name: {user.get("full_name")}
    Interests: {user.get("interests")}
    Shoe size: {user.get("shoe_size")}

    PREVIOUS MEMORY SUMMARY

    Current goal: {memory.get("current_goal")}
    Preferences: {memory.get("preferences")}
    Progress: {memory.get("progress")}
    Past plans: {memory.get("plans")}
    Feedback highlights: {memory.get("feedback_highlights")}

    FULL CONVERSATION FROM THIS SESSION

    {_format_conversation(conversation_history)}

    Produce an updated memory summary that merges the previous memory summary with anything
    new learned from this session's conversation (goal changes, preferences, progress, plans
    discussed, feedback given). Carry forward anything from the previous summary that is still
    valid and wasn't contradicted in this session.
    """.strip()
