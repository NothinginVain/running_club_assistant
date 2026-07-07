import requests
from client_openai import get_recommendation

BASE_URL = 'http://127.0.0.1:8000'
# 1 - getting survey from database, base on user id
def number_one(user_id):
    response = requests.get(f'{BASE_URL}/surveys/users/{user_id}/latest')
    response.raise_for_status()
    return response.json
# 2 - calling openAI to send the survey get the recommendation
def number_two(survey):
    return get_recommendation((survey['answers']))
# 3 - construct the full recommendation package which is align with data schema
def number_three(survey: dict, recommendation_text: str):
    return {
        'survey_id': survey['id'],
        'recommendation_type': survey['survey_type'],
        'title': survey['title'],
        'content': {'plan': recommendation_text},
        'explanation':
    }
# 4- calling recommendations route with post method to store the package in the step3 in database
def number_four():
    response = requests.post(f'{BASE_URL}/recommendations/')
    print(response.json()['status'])

if __name__ == '__main__':
    number_one()
    number_two()
    number_three()
    number_four()