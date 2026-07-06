from app.db.base import Base
from app.db.session import engine

from app.models.user import User
from app.models.survey import Survey
from app.models.recommendation import Recommendation


Base.metadata.create_all(bind=engine)

print("Tables created successfully.")