from pydantic import BaseModel

class Recommendation_Response(BaseModel):
    id: int
    survey_id: str
    