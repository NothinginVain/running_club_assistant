from fastapi import FastAPI
from app.api.routes import users, surveys, recommendations, chatbot, feedbacks




app = FastAPI(title="Running AI App")

@app.get("/")
def read_root():
    return {"message": "Running AI app is working"}

app.include_router(users.router)
app.include_router(surveys.router)
app.include_router(recommendations.router)
app.include_router(chatbot.router)
app.include_router(feedbacks.router)

# uvicorn app.main:app --reload --port 5002