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
        delete_missing: bool = False,
) -> dict[str, list[str]]:
    existing_documents = list(
        db.scalars(select(KnowledgeBase)).all()
    )

    documents_by_source = {
        document.source: document
        for document in existing_documents
        if document.source
    }
    documents_by_title = {
        document.title: document
        for document in existing_documents
    }

    result = {
        "created": [],
        "updated": [],
        "unchanged": [],
        "stale": [],
        "deleted": [],
    }
    matched_ids = set()

    for data in documents:
        document = documents_by_source.get(data["source"])

        # This title fallback adopts rows created by the old seeder.
        if document is None:
            document = documents_by_title.get(data["title"])

        if document is None:
            db.add(KnowledgeBase(**data))
            result["created"].append(data["title"])
            continue

        matched_ids.add(document.id)
        changed = False

        for field, value in data.items():
            if getattr(document, field) != value:
                setattr(document, field, value)
                changed = True

        action = "updated" if changed else "unchanged"
        result[action].append(data["title"])

    stale_documents = [
        document
        for document in existing_documents
        if document.id not in matched_ids
    ]

    for document in stale_documents:
        if delete_missing:
            db.delete(document)
            result["deleted"].append(document.title)
        else:
            result["stale"].append(document.title)

    return result

