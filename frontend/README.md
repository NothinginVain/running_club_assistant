# Running Club Assistant — Frontend

A Next.js frontend for the Running Club Assistant AI coaching backend. Lets a
runner complete a training survey, generate an AI running plan, track and
rate plans, leave feedback and request revisions, manage their profile, and
chat with an AI coach.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** on **Base UI** primitives (not Radix — this repo's shadcn
  setup uses `@base-ui/react`, which has some API differences from the more
  common Radix-based shadcn: polymorphism uses a `render` prop instead of
  `asChild`, and `Select.Value` needs an explicit render function to show a
  label instead of the raw stored value)
- **TanStack Query** for server state, caching, and mutations
- **React Hook Form + Zod** for the survey and profile forms
- **Lucide** icons

## Getting started

```bash
npm install
cp .env.example .env.local   # adjust NEXT_PUBLIC_API_BASE_URL if needed
npm run dev
```

The app runs at `http://localhost:3000` and expects the FastAPI backend at
`http://127.0.0.1:5002` (see `backend/README` / `backend/app/main.py`).

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
npx tsc --noEmit  # typecheck
```

## Environment variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the FastAPI backend. Defaults to `http://127.0.0.1:5002`. |

## Architecture

```
src/
  app/
    login/                  public — pick or create a runner
    (app)/                  protected route group, wrapped in AuthGuard + AppShell
      dashboard/
      survey/
      plans/
        [id]/               plan detail: rating, favorite, feedback, regenerate
      favorites/
      coach/
      profile/
  components/
    app-shell/               sidebar, mobile drawer nav, header
    auth/                    AuthGuard (redirects to /login if no session)
    providers/                SessionProvider, QueryProvider, AppProviders
    plans/                    RecommendationCard/List, StarRating, FavoriteButton,
                               GeneratePlanButton, RegenerateSection, plan rendering
    survey/                   multi-step wizard + reusable field components
    feedback/                 FeedbackForm, FeedbackList
    chat/                     ChatMessage, ChatComposer
    ui/                       shadcn/Base UI primitives
  hooks/                      one hook per resource (surveys, recommendations,
                               feedback, current user) wrapping TanStack Query
  lib/
    api/                      client.ts (fetch wrapper + error normalization)
                               + one file per resource (users, surveys,
                               recommendations, feedback, chat)
    validation/                zod schemas mirroring backend Pydantic schemas
    session.ts                 localStorage helpers for the current "session"
    survey-options.ts          label maps for backend enums
    query-keys.ts               centralized TanStack Query keys
  types/                       TypeScript types mirroring backend schemas 1:1
                                (same field names, snake_case, no invented fields)
```

### API layer

All HTTP calls go through `lib/api/client.ts`, which centralizes the base
URL, JSON handling, and error normalization into a typed `ApiError` (`kind`:
`validation | not_found | conflict | bad_request | server | network`). Every
resource (`users`, `surveys`, `recommendations`, `feedback`, `chat`) has its
own thin wrapper file — no `fetch()` calls happen directly in components.

### Types

Types in `src/types/` mirror the backend's Pydantic schemas field-for-field
(same names, same optionality). Nothing is invented; anything not present in
a backend schema (e.g. structured `social_media` editing) is intentionally
left out of the UI rather than faked.

## Authentication — important limitation

**The backend has no real authentication.** `POST /users/` hashes the
password with a placeholder (`fakehashed_` + password) and no endpoint ever
verifies it — there is no login/token endpoint at all. Users are otherwise
just identified by their database UUID.

The frontend's `/login` page reflects this honestly instead of pretending to
be secure:

- "Continue" tab: lists existing users (`GET /users/`) and lets you pick one.
- "Create account" tab: creates a new user (`POST /users/`) with name/email/
  password (password is sent because the schema requires it, but it is
  **not** used to authenticate anything).
- The chosen user's ID is stored in `localStorage` (`lib/session.ts`,
  `SessionProvider`) as the "current session." Any browser/device that opens
  the app can pick any existing user — **this is not access control.**
- `AuthGuard` only checks "is a user ID stored," not "is this a valid,
  verified session."

This is clearly documented so it isn't mistaken for real auth. When the
backend adds real authentication (password verification + tokens/sessions),
swap `SessionProvider`'s localStorage-backed `login`/`logout` for real token
storage and point `apiClient` at the new auth header — the rest of the app
(pages, hooks, API layer) doesn't need to change since it only depends on
`useSession()`/`useCurrentUser()`, not on how the session is stored.

## Backend changes made for this frontend

The backend was almost entirely usable as-is. Four small, additive changes
were needed (all in `backend/app/`, no existing behavior changed):

1. **CORS middleware** (`main.py`) — allows `http://localhost:3000`. Without
   this the browser can't call the API at all.
2. **`POST /recommendations/generate/{user_id}`** (`api/routes/
   recommendations.py`) — the AI plan-generation logic
   (`services/recommendation_manager.generate_recommendation`) previously
   only ran from `cli.py` via self-issued HTTP calls. This route reuses that
   same function directly against the DB session so the frontend has a real
   HTTP endpoint to trigger generation from a user's latest survey.
3. **`POST /recommendations/{id}/revise`** (`api/routes/feedbacks.py`) —
   same situation for the feedback-driven revision flow
   (`services/feedback_manager.execute_remaining_plan_revision`), including
   the existing safety gate (`needs_health_update` / `requires_coach_review`
   decisions), now surfaced as a structured `409` response instead of only
   working from the CLI.
4. **`GET /chatbot/{user_id}/history`** (`api/routes/chatbot.py`) — the
   coach's conversation history already lived in `coach_memory` but had no
   read endpoint, so a page refresh would silently lose the visible chat.
   This exposes it read-only so the Coach page can hydrate on load.

Additionally, the two new AI-calling routes (`generate`, `revise`) and the
chat route now catch OpenAI failures and return a clean `502` instead of
letting the exception propagate past FastAPI's error handling — an
unhandled exception there previously produced a response with no CORS
headers, which the browser reports as a confusing "blocked by CORS policy"
error instead of a real error message.

No other backend files, models, or existing routes were changed.

## Notable design decisions

- **Survey is a 5-step wizard**, not a single long form, mirroring the
  size and complexity of `RunningPlanSurveyAnswers` (24 fields with several
  cross-field constraints — training days must include the long-run day and
  cover `runs_per_week`, `available_equipment`/`current_issue_areas` can't
  combine "none" with other options, etc.). Those constraints are
  re-implemented client-side in `lib/validation/survey.ts` with a Zod
  `superRefine`, matching the backend's Pydantic `model_validator`.
- **Editing an existing survey uses `PATCH /surveys/{id}`** (in place)
  rather than always creating a new survey row, since the backend supports
  updates and a user only ever has one "current" survey in the product's
  mental model.
- **Regenerating from feedback** surfaces the backend's safety gate exactly:
  a `needs_health_update` response opens a dialog with the backend-provided
  questions (compiled into one feedback entry on submit, same shape the CLI
  produces) and a `requires_coach_review` response shows a static "paused
  for human review" message — no client ever second-guesses that gate.
- **RAG/knowledge-base internals are not exposed.** The chat UI only ever
  shows `reply` text; embeddings, retrieved chunks, and Langfuse are
  entirely backend-internal.
- **Favorites are a real page**, not just a client-side filter, since the
  backend has a dedicated `GET /recommendations/user/{id}/favorites`
  endpoint.

## Known gaps / things a backend engineer should know

- Shoe recommendations (`RecommendationType.SHOE_RECOMMENDATION`) are
  defined in the survey schema but have no prompt/service implementation on
  the backend, so the frontend only builds the running-plan survey flow.
- `prompts/running_plan_input.py` reads `user.get("age")`, but no `age`
  field exists anywhere in the `User` model/schema (only `birth`) — this is
  a pre-existing backend quirk, left untouched; it just means `age` is
  always `None` in the AI prompt today.
- `social_media` (`dict[str, Any]` on `User`) has no structured UI — there's
  no reasonable generic editor for an arbitrary JSON blob, so it's left
  out of the Profile form rather than faked.
