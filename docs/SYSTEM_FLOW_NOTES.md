# Running Club Assistant: System Flow Notes

This document is the map to read before changing the AI flows. It records what
the current code actually does, not a future architecture.

## Big picture

The application has two separate LLM entry points that must not be confused:

1. **Chat with coach** combines live runner context, coach memory, the current
   conversation, and RAG excerpts.
2. **Generate training plan** combines the runner profile and latest survey with
   safety and plan-generation prompts. **It does not currently use RAG, coach
   memory, or chat history.**

```text
CHAT
runner message
    |-- semantic retrieval ------------> official/general knowledge excerpts
    |-- build_coach_context() ----------> current runner database facts
    |-- coach_memory.summary -----------> learned chat summary + current chat
    `-- build_chatbot_input() ----------> get_chat_reply() ----------> reply

PLAN GENERATION
latest running-plan survey + basic user data
    `-- safety assessment -> plan prompt -> structured plan -> validation -> DB
```

## Study plan

- [x] Group 1 — RAG: documents, syncing, chunking, embeddings, retrieval, and
  injection into chat.
- [ ] Group 2 — Coach context: which live runner records are selected and how
  they are shaped.
- [ ] Group 3 — Coach memory and chat lifecycle: current conversation,
  end-of-chat summarization, persistence, and history.
- [ ] Group 4 — LLM assembly: exact prompt boundaries, structured outputs,
  failure behavior, and observability.
- [ ] Group 5 — Generate-plan flow: endpoint, survey selection, safety gate,
  prompt selection, structured plan generation, validation, and persistence.

---

# Group 1 — How RAG works

## 1. What “RAG” means in this project

RAG means **retrieval-augmented generation**. The application does not train or
fine-tune the chat model on Braves documents. Instead it:

1. stores curated Markdown documents;
2. splits them into smaller passages;
3. converts each passage into an embedding vector;
4. converts the runner's latest message into another vector;
5. finds the stored vectors closest in meaning to that message; and
6. places the matching text passages into the chat model's input.

The LLM therefore receives relevant reference text at answer time. The
embedding model finds text; the chat model writes the answer. These are two
different model calls with different jobs.

## 2. The two separate RAG phases

```text
OFFLINE / MANUAL PREPARATION
knowledge_docs/*.md
  -> load_knowledge_documents()
  -> parse_knowledge_document()
  -> sync_knowledge_documents()
  -> knowledge_base table (whole documents)
  -> chunk_document()
  -> _build_embedding_input()
  -> create_embeddings()
  -> knowledge_chunks table (passages + vectors)

ONLINE / ON EVERY CHAT MESSAGE
runner's latest message
  -> retrieve_knowledge()
  -> create_embeddings([message])
  -> PostgreSQL cosine-distance query
  -> at most 5 chunks with distance <= 0.65
  -> _format_knowledge()
  -> build_chatbot_input()
  -> get_chat_reply()
  -> answer
```

The offline phase is not invoked by the chat endpoint. Adding or editing a
Markdown file has no effect on chat until the sync and index scripts are run.

## 2.1 Where the R, A, and G happen

The name **RAG** describes three distinct operations in the online chat flow:

```text
R — RETRIEVAL
chatbot.py
retrieve_knowledge(db, chat_data.message)
    |
    `-> returns knowledge_chunks: list[dict]

A — AUGMENTATION
chatbot.py
build_chatbot_input(
    chat_data.message,
    coach_context,
    coach_memory.summary,
    conversation_history,
    knowledge_chunks,          # retrieval result enters here
)
    |
    `-> chatbot_input.py inserts the formatted chunks under
        "RETRIEVED KNOWLEDGE EXCERPTS"

G — GENERATION
chatbot.py
get_chat_reply(input_text, instructions, "simple")
    |
    `-> client_openai.py sends the augmented input to gpt-5-mini
        and returns {"reply": "..."}
```

### R — Retrieval and its arguments

In `chat_with_coach()` the call is:

```python
knowledge_chunks = retrieve_knowledge(
    db,
    chat_data.message,
)
```

`retrieve_knowledge()` accepts:

- `db`: the request's SQLAlchemy database session, used to query pgvector;
- `query`: here, only the latest runner message;
- `limit`: optional maximum result count, defaulting to 5.

Its return value is assigned to `knowledge_chunks`. This list is the bridge
from Retrieval to Augmentation.

### A — Where retrieval is appended to the model input

The retrieval result is not appended to the conversation history and is not
saved in coach memory. It is passed as the fifth argument of
`build_chatbot_input()`:

```python
input_text = build_chatbot_input(
    chat_data.message,
    coach_context,
    coach_memory.summary,
    conversation_history,
    knowledge_chunks,
)
```

Those positional arguments map to this function signature in
`backend/app/prompts/chatbot_input.py`:

```python
def build_chatbot_input(
    message,
    coach_context,
    memory,
    conversation_history,
    knowledge_chunks,
) -> str:
```

Inside that function, this expression performs the actual augmentation:

```python
RETRIEVED KNOWLEDGE EXCERPTS

{_format_knowledge(knowledge_chunks)}
```

`_format_knowledge()` turns the list of dictionaries into readable reference
blocks. The resulting blocks become part of the temporary `input_text` string
sent for this one answer. “Augmented” therefore means **the retrieved passages
are inserted into the LLM input alongside the runner context, memory,
conversation, and current message**. It does not mean the LLM or its training
data is permanently changed.

### G — Generation and its arguments

Back in `chat_with_coach()`, the augmented string is passed to:

```python
result = get_chat_reply(
    input_text,
    instructions,
    "simple",
)
```

The arguments are:

- `input_text`: the complete augmented input assembled above;
- `instructions`: `SIMPLE_CHATBOT_PROMPT`, returned by
  `get_chatbot_prompt()`; this defines the coach role and grounding rules;
- `prompt_version`: `"simple"`; this is attached as observability metadata,
  not shown as content to the runner.

In `backend/app/client_openai.py`, `get_chat_reply()` makes the generative model
call:

```python
client.responses.parse(
    model="gpt-5-mini",
    instructions=instructions,
    input=input_text,
    text_format=ChatReplyOutput,
    metadata={...},
)
```

The OpenAI request arguments have these jobs:

- `model`: chooses the model that writes the answer;
- `instructions`: supplies stable behavior and grounding rules;
- `input`: supplies the per-request augmented information and question;
- `text_format`: requires structured output matching `ChatReplyOutput`;
- `metadata`: labels the call for tracing/observability.

`response.output_parsed` is converted to a dictionary. The route takes
`result["reply"]`, appends that generated reply and the runner's message to
`current_conversation`, commits memory, and returns the reply to the frontend.

In one sentence: **Retrieval returns `knowledge_chunks`; Augmentation renders
those chunks inside `input_text`; Generation sends that `input_text` plus the
coach instructions to `gpt-5-mini`.**

## 3. Source documents

Location: `backend/knowledge_docs/*.md`

Each top-level Markdown file is one knowledge document. Files under subfolders
such as `sources/` and `images/` are not loaded because the loader uses the
non-recursive pattern `directory.glob("*.md")`.

Every loaded document must have YAML frontmatter surrounded by `---`. Required
metadata fields are:

- `title`
- `document_type`
- `publisher`
- `content_origin`
- `content_status`
- `language`
- `topics`

The Markdown after the frontmatter is the document body. Titles must be unique
across all loaded files. Dates produced by YAML are converted to strings so the
metadata can be stored safely in PostgreSQL JSONB.

Important functions in
`backend/app/services/knowledge_document_service.py`:

- `parse_knowledge_document(path)` validates frontmatter and returns a database
  shaped dictionary. It separates `title` and `document_type`, stores the body
  as `content`, produces a source such as
  `knowledge_docs/club_weekly_running_calendar.md`, and keeps the remaining
  metadata in `metadata_`.
- `load_knowledge_documents(directory)` loads all top-level Markdown files in
  sorted filename order and rejects duplicate titles.
- `sync_knowledge_documents(db, documents, delete_missing=False)` compares the
- `sync_knowledge_documents(db, documents)` makes the table mirror the loaded
  files. It matches by `source`, creates new rows, updates changed rows, and
  deletes rows whose source file is no longer present.

## 4. Syncing whole documents into PostgreSQL

Entrypoint: `backend/scripts/sync_knowledge_base.py`

Run from `backend/`:

```bash
python scripts/sync_knowledge_base.py
```

The script:

1. loads `backend/knowledge_docs/*.md`;
2. opens a SQLAlchemy session;
3. calls `sync_knowledge_documents()`;
4. commits the transaction; and
5. prints the created/updated/unchanged/stale/deleted titles.

A database document whose source file disappeared is deleted. Its chunks are
also deleted through the foreign key's `ON DELETE CASCADE` behavior.

Database model: `backend/app/models/knowledge_base.py`

`KnowledgeBase` stores each complete source document:

- `id`: UUID primary key;
- `title`: human-readable title;
- `content`: full Markdown body without frontmatter;
- `document_type`: category used when formatting retrieved results;
- `source`: source file path;
- `metadata`: JSONB containing publisher, status, topics, and other fields;
- timestamps.

Syncing changes only `knowledge_base`. It does not create or refresh vectors.

### `sync_knowledge_documents()` step by step

The function follows one rule: `backend/knowledge_docs` is the source of truth,
and `knowledge_base` mirrors it. It reports four possible outcomes.

Suppose the database starts with documents A, B, and C, while the filesystem
loader supplies A, B, and D:

1. It reads all existing rows once: `[A, B, C]`.
2. It builds `documents_by_source` and `documents_by_title` dictionaries. These
   provide direct lookups and avoid a database query for each input file.
3. For incoming A, it finds the existing row. If any parsed field differs, A is
   added to `updated`; otherwise it is added to `unchanged`.
4. For incoming B, it performs the same comparison.
5. For incoming D, neither lookup finds a row, so it stages
   `KnowledgeBase(**data)` and reports D as `created`.
6. It builds the set of incoming source paths: A, B, and D.
7. It checks the rows that existed before synchronization. C's source is absent
   from that set, so it stages deletion of C and reports it as `deleted`.
8. It returns the action report. The caller, not this function, commits.

The remaining bookkeeping serves two purposes:

- **Efficiency:** existing rows are loaded once and found through a dictionary.
- **Clear reporting:** the script tells the developer exactly what it created,
  updated, left unchanged, and deleted.

Identity is intentionally based only on `source`. Renaming a Markdown file is
treated as deleting the old source and creating a new one. Editing its title or
content without renaming the file updates the existing row.

## 5. Chunking and indexing

Entrypoint: `backend/scripts/index_knowledge_base.py`

Run this after syncing:

```bash
python scripts/index_knowledge_base.py
```

This is a **full rebuild**, not an incremental update:

1. it stages deletion of every existing `KnowledgeChunk` row;
2. reads every `KnowledgeBase` document;
3. calls `chunk_document(document.content)`;
4. builds embedding input for every surviving chunk;
5. makes one embeddings API request per document;
6. stages new chunk rows; and
7. commits once, after all documents are processed.

If an exception occurs before the commit, closing the session rolls back the
staged deletion and inserts. That protects the previous index from a partial
rebuild.

### How `chunk_document()` splits text

File: `backend/app/services/knowledge_chunking_service.py`

It uses two LangChain splitters in sequence:

1. `MarkdownHeaderTextSplitter` first divides content around `#`, `##`, and
   `###` headings and records the heading trail as metadata (`h1`, `h2`, `h3`).
   Headers remain in the chunk text because `strip_headers=False`.
2. `RecursiveCharacterTextSplitter` then keeps chunks around 800 characters,
   with 100 characters of overlap between adjacent size-based chunks.

`_has_substantive_content()` drops chunks with fewer than 20 meaningful
characters after ignoring heading lines, images, and Markdown link targets.
This prevents image-only or heading-only passages from entering the index.

### What is embedded

`_build_embedding_input(document_title, chunk)` in the indexing script creates:

```text
document title
heading > subheading > sub-subheading

actual chunk content
```

Adding the document title and heading trail helps short passages carry their
meaning into vector space. This enriched string is sent only to the embeddings
API. The database stores the original chunk content and heading metadata, not
the enriched embedding input.

`create_embeddings(texts)` in `backend/app/client_openai.py` calls OpenAI's
`text-embedding-3-small`. Its returned vectors are kept in the same order as
the inputs. The indexing script asserts that the chunk and vector counts match.

### Where vectors live

Model: `backend/app/models/knowledge_chunk.py`

Migration:
`backend/alembic/versions/a4f72fbaa05d_create_knowledge_chunks_table.py`

`KnowledgeChunk` stores:

- its own UUID;
- `knowledge_base_id`, with cascade deletion from the parent document;
- zero-based `chunk_index` within that document;
- original chunk `content`;
- a 1536-dimensional pgvector `embedding`;
- heading metadata as JSONB;
- timestamps.

The migration enables PostgreSQL's `vector` extension. It creates a normal
index on `knowledge_base_id`, but no HNSW or IVFFlat vector index. Retrieval is
therefore an exact cosine-distance ordering over eligible chunk rows. That is
simple and accurate for a small knowledge base, but will become slower as the
number of chunks grows.

## 6. Retrieval for a chat message

File: `backend/app/services/knowledge_retrieval_service.py`

Function: `retrieve_knowledge(db, query, limit=5)`

It performs these exact steps:

1. strips whitespace from the query;
2. returns `[]` without an API call if the result is empty;
3. rejects limits below 1;
4. embeds only the cleaned query using the same
   `text-embedding-3-small` helper;
5. asks pgvector to calculate cosine distance between the query and every
   stored chunk embedding;
6. joins each chunk to its parent `KnowledgeBase` document;
7. keeps only results whose distance is at most `0.65`;
8. orders ascending, so the smallest/closest distance is first; and
9. returns at most 5 results by default.

Cosine distance is lower when two embeddings point in more similar semantic
directions. `0.65` is a distance ceiling, not a “65% relevance score.” The
current value is hard-coded as `MAX_COSINE_DISTANCE`, and there is no keyword
search, reranker, per-topic filter, recency filter, or document-diversity rule.
Several top chunks may therefore come from the same source document.

Every returned dictionary contains the chunk and document IDs, title, source,
content status, document type, original content, heading metadata, and numeric
distance. Not all of those fields are later shown to the LLM.

### A subtle but important boundary

The retrieval query is only `chat_data.message`, the runner's latest message.
The current conversation, coach memory, and live runner context are not used to
search the vector database. They are added later for answer generation. A
follow-up such as “What time is it?” may retrieve poorly because the standalone
message does not say which club session “it” refers to, even though the chat
history contains that information.

## 7. Putting retrieved knowledge into the LLM input

API entrypoint: `chat_with_coach()` in
`backend/app/api/routes/chatbot.py`

For each `POST /chatbot/` request, the route first loads runner context and
memory. Inside one error boundary it then:

1. calls `retrieve_knowledge(db, chat_data.message)`;
2. passes the results to `build_chatbot_input()`; and
3. calls `get_chat_reply()`.

File: `backend/app/prompts/chatbot_input.py`

`_format_knowledge()` renders each retrieved chunk as:

```text
[document_type] Document title
Source: knowledge_docs/file.md
Status: content_status
chunk text
```

Chunks are separated by blank lines. If none passes the threshold, the prompt
contains `No relevant knowledge found.` It does not include distance, IDs, or
the complete JSON metadata.

`build_chatbot_input()` creates one large input containing, in order:

1. live runner background;
2. previous-session memory summary;
3. the current session transcript;
4. retrieved knowledge excerpts;
5. the latest runner message; and
6. a final instruction to use those sections in the reply.

The latest message appears twice in the full request lifecycle: once as the
retrieval query and once as the message the chat model must answer.

## 8. How the model is told to use RAG

File: `backend/app/prompts/chatbot_prompt.py`

`get_chatbot_prompt()` supplies `SIMPLE_CHATBOT_PROMPT` as the OpenAI
instructions. Its key grounding rules are:

- personalize with runner context and memory when relevant;
- use only relevant excerpts;
- do not mix rules or schedules from different club services;
- use retrieved excerpts as the only source for official Berlin Braves facts;
- admit when an official fact is missing instead of guessing;
- preserve the status warnings on time-sensitive information; and
- allow clearly distinguished general coaching knowledge for general running
  questions even when RAG finds nothing.

File: `backend/app/client_openai.py`

`get_chat_reply()` sends those instructions and the assembled input to
`gpt-5-mini` through the OpenAI Responses API. The result is parsed as
`ChatReplyOutput`, whose only field is `reply`. If structured parsing produces
no output, it raises an error.

The API response returns only the answer text. Retrieved source titles,
distances, and citations are not exposed to the frontend, and there is no
post-generation check that each factual statement is supported by a retrieved
passage.

If embedding, database retrieval, prompt building, or answer generation raises
inside the route's `try`, the client receives HTTP 502 with a generic retry
message. The reply is appended to the current conversation and committed only
after successful generation.

## 9. The complete call chain

### Build or refresh the knowledge index

```text
scripts/sync_knowledge_base.py:main
  -> load_knowledge_documents
       -> parse_knowledge_document (once per top-level Markdown file)
  -> sync_knowledge_documents
  -> db.commit

scripts/index_knowledge_base.py:main
  -> delete all KnowledgeChunk rows (staged)
  -> for each KnowledgeBase row:
       -> chunk_document
       -> _build_embedding_input (once per chunk)
       -> create_embeddings (one batch API call per document)
       -> db.add(KnowledgeChunk) (once per chunk)
  -> db.commit
```

### Answer one chat message

```text
POST /chatbot/
  -> chat_with_coach
       -> get_or_create_coach_memory
       -> build_coach_context
       -> get_chatbot_prompt
       -> retrieve_knowledge
            -> create_embeddings([latest message])
            -> pgvector cosine-distance SELECT
       -> build_chatbot_input
            -> _format_conversation
            -> _format_knowledge
       -> get_chat_reply
            -> OpenAI Responses API + ChatReplyOutput
       -> append user and assistant turns to current_conversation
       -> db.commit
  -> {"reply": "..."}
```

## 10. What RAG currently does not do

- It does not automatically watch or index changed files.
- It does not retrieve for training-plan generation.
- It does not use coach memory or conversation history to form the search
  query.
- It does not combine semantic search with exact keyword search.
- It does not rerank results after pgvector search.
- It does not filter by publisher, topic, status, or date.
- It does not guarantee one result per document.
- It does not return citations to the UI.
- It has no automated tests covering parsing, chunking, indexing, retrieval, or
  prompt injection at the time these notes were written.
- It has no approximate vector index; the database orders exact distances.

These are current boundaries, not necessarily bugs. They are the places to
inspect first when retrieved answers seem irrelevant, stale, unsupported, or
slow.

## 11. Safe update procedure

After adding or editing a knowledge document:

```bash
cd backend
python scripts/sync_knowledge_base.py
python scripts/index_knowledge_base.py
```

Then test the real `POST /chatbot/` flow with:

- a direct question whose answer uses distinctive wording from the document;
- a paraphrase, to verify semantic rather than exact-word retrieval;
- an unrelated question, to verify weak chunks are excluded;
- a time-sensitive club question, to verify the status warning survives; and
- a follow-up question containing a pronoun, to expose the current
  latest-message-only retrieval limitation.

The database container must be running, migrations must be at head, and OpenAI
credentials must be configured for both indexing and live retrieval.

## 12. Debugging checklist

When the coach fails to use expected knowledge, check in this order:

1. Is the source a top-level `.md` file in `backend/knowledge_docs/`?
2. Does it have all required frontmatter fields and a unique title?
3. Was the sync script run, and did it report created or updated?
4. Was the index script run after the sync?
5. Does `knowledge_chunks` contain chunks for the document?
6. Is the expected passage substantive and present in a stored chunk?
7. Does `retrieve_knowledge()` return it for the standalone latest message?
8. Is its cosine distance at most `0.65`, and is it inside the top five?
9. Does `_format_knowledge()` place it in the assembled chatbot input?
10. Do the chatbot instructions permit using it for this type of question?

---

# Generate-plan flow — boundary note for later study

The generate-plan path begins at `POST /recommendations/generate` in
`backend/app/api/routes/recommendations.py`. The route selects the user's latest
non-deleted survey, requires it to be a running-plan survey, derives basic user
data, and calls `generate_recommendation()` in
`backend/app/services/recommendation_generation_service.py`.

That service performs a safety assessment, validates the allowed plan mode,
selects plan instructions, formats the user and survey input, asks
`gpt-5-mini` for a `RunningPlanOutput`, synchronizes weekly distance totals,
validates the mode, and returns the structured plan. The route then titles and
stores it as a `Recommendation`.

There is no call to `retrieve_knowledge()` anywhere in this path. Official
Braves documents, RAG chunks, coach memory, previous chat, and previous plans do
not currently influence a newly generated plan. Group 5 will document every
step and validation in depth.
