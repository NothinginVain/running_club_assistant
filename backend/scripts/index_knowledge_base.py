import sys
from pathlib import Path

# Allow importing from backend/app when running this script directly.
BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(BACKEND_DIR))

from app.client_openai import create_embeddings
from app.db.session import SessionLocal
from app.models.knowledge_base import KnowledgeBase
from app.models.knowledge_chunk import KnowledgeChunk
from app.services.knowledge_chunking_service import chunk_document


def _build_embedding_input(document_title: str, chunk: dict) -> str:
    # Extra context (title + heading trail) makes short chunks embed
    # better, but is only used for the embedding call, not stored.
    header_trail = " > ".join(chunk["metadata"].values())
    context = f"{document_title}\n{header_trail}" if header_trail else document_title

    return f"{context}\n\n{chunk['content']}"


def main() -> None:
    db = SessionLocal()

    try:
        # Full rebuild: delete everything, re-chunk and re-embed from
        # the current knowledge_base content. Nothing is committed yet.
        db.query(KnowledgeChunk).delete()

        documents = db.query(KnowledgeBase).all()
        total_chunks = 0

        for document in documents:
            chunks = chunk_document(document.content)

            if not chunks:
                continue

            embedding_inputs = [
                _build_embedding_input(document.title, chunk)
                for chunk in chunks
            ]
            # One API call embeds all of this document's chunks; order
            # of the result matches the order of embedding_inputs.
            embeddings = create_embeddings(embedding_inputs)

            # Guard against a silent chunk/embedding mismatch before
            # zipping them together below.
            assert len(chunks) == len(embeddings), (
                f"{document.title}: expected {len(chunks)} embeddings, got {len(embeddings)}"
            )

            for index, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                db.add(
                    KnowledgeChunk(
                        knowledge_base_id=document.id,
                        chunk_index=index,
                        content=chunk["content"],
                        embedding=embedding,
                        metadata_=chunk["metadata"],
                    )
                )

            total_chunks += len(chunks)
            print(f"{document.title}: {len(chunks)} chunks")

        # Everything above is staged in memory; this is the only point
        # the database is actually changed.
        db.commit()
        print(f"Indexed {len(documents)} documents into {total_chunks} chunks")
    finally:
        db.close()


if __name__ == "__main__":
    main()
