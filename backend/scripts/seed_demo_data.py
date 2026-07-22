import datetime
import sys
import uuid
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(BACKEND_DIR))

import yaml
from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.knowledge_base import KnowledgeBase
from app.models.user import User

DEMO_USER_ID = uuid.UUID("328cae0c-b9fe-4d3e-ac20-7fc642b406e1")
KNOWLEDGE_DOCS_DIR = Path("/Users/j-miguelrocharamos/Documents/running_app_assistant")


def parse_markdown_file(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    _, frontmatter_text, body = text.split("---", 2)

    metadata = yaml.safe_load(frontmatter_text) or {}
    metadata = {
        key: value.isoformat() if isinstance(value, (datetime.date, datetime.datetime)) else value
        for key, value in metadata.items()
    }
    body = body.strip()

    document_type = metadata.pop("document_type", None)
    source = metadata.pop("source_url", None) or metadata.pop("source_file", None)

    title = metadata.pop("title", None)

    if not title:
        title = path.stem.replace("_", " ").title()
        for line in body.splitlines():
            if line.startswith("# "):
                title = line.removeprefix("# ").strip()
                break

    return {
        "title": title,
        "content": body,
        "document_type": document_type,
        "source": source,
        "metadata_": metadata,
    }


def seed_demo_user(db) -> None:
    existing = db.get(User, DEMO_USER_ID)

    if existing:
        print(f"User already exists: {DEMO_USER_ID}")
        return

    db.add(
        User(
            id=DEMO_USER_ID,
            full_name="Demo Runner",
            email="demo.runner@brovesberlin.example",
            password_hash="not-a-real-hash",
        )
    )
    db.commit()
    print(f"Created demo user: {DEMO_USER_ID}")


def seed_knowledge_base(db) -> None:
    markdown_files = sorted(KNOWLEDGE_DOCS_DIR.glob("*.md"))

    if not markdown_files:
        print(f"No markdown files found in {KNOWLEDGE_DOCS_DIR}")
        return

    for path in markdown_files:
        parsed = parse_markdown_file(path)

        existing = db.scalars(
            select(KnowledgeBase).where(KnowledgeBase.title == parsed["title"])
        ).first()
        if existing:
            print(f"Knowledge doc already exists: {parsed['title']}")
            continue

        db.add(KnowledgeBase(**parsed))
        print(f"Added knowledge doc: {parsed['title']}")

    db.commit()


def main() -> None:
    db = SessionLocal()

    try:
        seed_demo_user(db)
        seed_knowledge_base(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
