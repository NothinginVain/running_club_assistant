from fastapi import FastAPI

from app.api.routes import recommendations, surveys, users


app = FastAPI(title="Running AI App",)

@app.get('/')
def read_root():
    return {'message': 'Running AI app is working'}

app.include_router(users.router)
app.include_router(surveys.router)
app.include_router(recommendations.router)