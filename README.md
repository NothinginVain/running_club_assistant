# Running Club Assistant

FastAPI backend for an AI-assisted running club assistant. The app stores users, surveys, running recommendations, and feedback, then structures the data through API routes, service layers, database models, and Pydantic schemas.

## Features

- User, survey, and recommendation API routes
- Running-plan and feedback workflows
- SQLAlchemy database models and sessions
- Pydantic schemas for request and response validation
- OpenAI integration for AI-generated running guidance
- Structured service layer for recommendation and feedback logic
- Environment-based configuration with `.env`

## Tech Stack

Python · FastAPI · SQLAlchemy · Pydantic · PostgreSQL · OpenAI API · Uvicorn

## Project Structure

```text
backend/
├── app/
│   ├── api/routes/          # API endpoints
│   ├── db/                  # database setup and sessions
│   ├── models/              # SQLAlchemy models
│   ├── prompts/             # AI prompt inputs and templates
│   ├── schemas/             # Pydantic schemas
│   ├── services/            # application logic
│   └── main.py              # FastAPI application entry point
├── create_tables.py
└── requirements.txt
```

## Getting Started

```bash
git clone https://github.com/NothinginVain/running_club_assistant.git
cd running_club_assistant/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file for local configuration, including your database connection and API credentials.

Run the application:

```bash
uvicorn app.main:app --reload --port 5002
```

The API will be available at:

```text
http://127.0.0.1:5002
```

## What This Project Demonstrates

- Backend API design with FastAPI
- Database modeling with SQLAlchemy
- Input validation with Pydantic
- Layered project structure
- AI API integration
- Handling user feedback and recommendation data

## Future Improvements

- Add automated tests for API routes and services
- Add Docker setup for local development
- Add authentication for user-specific data
- Expand recommendation history and analytics

