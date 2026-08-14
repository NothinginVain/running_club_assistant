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
    chat_memory = memory.get("chat", {})

    return f"""
    RUNNER PROFILE

    Name: {user.get("full_name")}
    Interests: {user.get("interests")}
    Shoe size: {user.get("shoe_size")}

    RUNNER MEMORY SUMMARY (from previous sessions)

    Current goal: {chat_memory.get("current_goal")}
    Preferences: {chat_memory.get("preferences")}
    Progress: {chat_memory.get("progress")}

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
    chat_memory = memory.get("chat", {})

    return f"""
    RUNNER PROFILE

    Name: {user.get("full_name")}
    Interests: {user.get("interests")}
    Shoe size: {user.get("shoe_size")}

    PREVIOUS MEMORY SUMMARY

    Current goal: {chat_memory.get("current_goal")}
    Preferences: {chat_memory.get("preferences")}
    Progress: {chat_memory.get("progress")}

    FULL CONVERSATION FROM THIS SESSION

    {_format_conversation(conversation_history)}

    Produce an updated chat summary that merges the previous chat summary with anything
    new learned from this session's conversation. Carry forward anything from the previous
    summary that is still valid and wasn't contradicted in this session.
    """.strip()
