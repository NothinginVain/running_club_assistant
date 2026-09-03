import json
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.knowledge_base import KnowledgeBase

import yaml


REQUIRED_FIELDS = {
    "title",
    "document_type",
    "publisher",
    "content_origin",
    "content_status",
    "language",
    "topics",
}


def parse_knowledge_document(path: Path) -> dict:
    """Parse one Markdown knowledge file into fields for ``KnowledgeBase``.

    The file must contain YAML frontmatter between two ``---`` markers,
    followed by a non-empty Markdown body. The returned dictionary can be
    passed directly to ``KnowledgeBase(**document)``.
    """
    parts = path.read_text(encoding="utf-8").split("---", 2)

    if len(parts) != 3:
        raise ValueError(f"{path.name}: invalid YAML frontmatter")

    metadata = yaml.safe_load(parts[1])

    if not isinstance(metadata, dict):
        raise ValueError(f"{path.name}: metadata must be an object")

    missing = REQUIRED_FIELDS - metadata.keys()

    if missing:
        raise ValueError(
            f"{path.name}: missing {sorted(missing)}"
        )

    content = parts[2].strip()

    if not content:
        raise ValueError(f"{path.name}: content is empty")

    title = metadata.pop("title")
    document_type = metadata.pop("document_type")

    # Convert YAML dates into values accepted by PostgreSQL JSONB.
    metadata = json.loads(json.dumps(metadata, default=str))

    return {
        "title": title,
        "document_type": document_type,
        "source": f"knowledge_docs/{path.name}",
        "content": content,
        "metadata_": metadata,
    }


def load_knowledge_documents(directory: Path) -> list[dict]:
    """Load and validate every top-level Markdown document in a directory.

    Files are sorted to make script output deterministic. Subdirectories are
    intentionally ignored, and duplicate titles are rejected so every document
    remains clearly identifiable in logs and retrieved context.
    """
    documents = [
        parse_knowledge_document(path)
        for path in sorted(directory.glob("*.md"))
    ]

    titles = [document["title"] for document in documents]

    if len(titles) != len(set(titles)):
        raise ValueError("Document titles must be unique")

    return documents


def sync_knowledge_documents(
        db: Session,
        documents: list[dict],
) -> dict[str, list[str]]:
    """Make ``KnowledgeBase`` mirror the supplied Markdown documents.

    ``source`` is the identity of a document. A matching row is updated, a new
    source is inserted, and a row whose source is absent from ``documents`` is
    deleted. This makes ``backend/knowledge_docs`` the source of truth.

    Args:
        db: Active SQLAlchemy session. Changes are staged on this session.
        documents: Parsed document dictionaries, normally returned by
            ``load_knowledge_documents()``.

    Returns:
        Lists of document titles grouped by the action taken: ``created``,
        ``updated``, ``unchanged``, and ``deleted``.

    Important:
        This function does not commit or roll back the transaction and does not
        rebuild embeddings. The caller owns the transaction; the separate
        indexing script refreshes ``KnowledgeChunk`` rows afterward.
    """
    # Read existing rows once, then use direct source lookups in the loop.
    existing_documents = list(
        db.scalars(select(KnowledgeBase)).all()
    )

    documents_by_source = {
        document.source: document
        for document in existing_documents
    }

    result = {
        "created": [],
        "updated": [],
        "unchanged": [],
        "deleted": [],
    }

    incoming_sources = {
        document["source"]
        for document in documents
    }

    # Create a row for a new file, or update the row for an existing file.
    for data in documents:
        document = documents_by_source.get(data["source"])

        if document is None:
            db.add(KnowledgeBase(**data))
            result["created"].append(data["title"])
            continue

        changed = False

        # Assign only changed values, keeping unchanged rows out of UPDATEs.
        for field, value in data.items():
            if getattr(document, field) != value:
                setattr(document, field, value)
                changed = True

        action = "updated" if changed else "unchanged"
        result[action].append(data["title"])

    # Remove database rows for files that are no longer in knowledge_docs.
    for document in existing_documents:
        if document.source not in incoming_sources:
            db.delete(document)
            result["deleted"].append(document.title)

    return result
