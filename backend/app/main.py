import uvicorn

from app.services.recommendation_manager import execute_recommendation
from app.services.survey_manager import save_survey, build_survey_package
from services.survey_manager import trigger_survey
from fastapi import FastAPI

from app.api.routes import recommendations, surveys, users
from services.recommendation_manager import execute_recommendation


app = FastAPI(title="Running AI App",)

@app.get('/')
def read_root():
    return {'message': 'Running AI app is working'}

app.include_router(users.router)
app.include_router(surveys.router)
app.include_router(recommendations.router)

def show_menu():
    print('''
     0- Exit 
     1- Survey
     2- Recommendation
     3- Feedback
       
     ''')

def main():
    user_id = '328cae0c-b9fe-4d3e-ac20-7fc642b406e1'
    while True:
        show_menu()
        user_input = int(input('Select the menu option: '))
        if user_input == 0:
            return
        elif user_input == 1:
            survey = trigger_survey()
            payload = build_survey_package(survey, user_id)
            save_survey(payload)
            continue

        elif user_input == 2:
            execute_recommendation(user_id)



if __name__ == '__main__':
    uvicorn.run('main:app', host='127.0.0.1', port=5002, reload=True)
    main()