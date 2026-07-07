import requests
from client_openai import get_recommendation

BASE_URL = 'http://127.0.0.1:8000'
# 1 - getting survey from database, base on user id
def number_one(user_id):
    response = requests.get(f'{BASE_URL}/surveys/users/{user_id}/latest')
    response.raise_for_status()
    return response.json
# 2 - calling openAI to send the survey get the recommendation
def number_two():
    print(2)
# 3 - construct the full recommendation package which is align with data schema
def number_three():
    print(3)
# 4- calling recommendations route with post method to store the package in the step3 in database
def number_four():
    response = requests.post('http://127.0.0.1:8000/recommendations/')
    print(response.json()['status'])

if __name__ == '__main__':
    number_one()
    number_two()
    number_three()
    number_four()