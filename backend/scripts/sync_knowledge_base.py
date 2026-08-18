import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(BACKEND_DIR))

from app.db.session import SessionLocal
from app.services.knowledge_document_service import (
    load_knowledge_documents,
    sync_knowledge_documents,
)

KNOWLEDGE_DOCS_DIR = BACKEND_DIR / "knowledge_docs"


def main() -> None:
    documents = load_knowledge_documents(KNOWLEDGE_DOCS_DIR)

    db = SessionLocal()

    try:
        result = sync_knowledge_documents(db, documents)
        db.commit()

        for action, titles in result.items():
            print(f"{action}: {len(titles)}")
            for title in titles:
                print(f"  - {title}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
