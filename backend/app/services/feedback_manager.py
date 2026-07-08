import json
import requests

BASE_URL = 'http://127.0.0.1:5002'

def build_feedback_payload():
    return {
        'feedback_rating': 4 ,
        'feedback_comment': 'the plan is to easy i will like incrise the run',
    }


def save_feedback(recommendation_id, payload):
    response = requests.patch(
        f'{BASE_URL}/recommendations/{recommendation_id}/feedback',
        json=payload,
    )
    response.raise_for_status()
    return response.json()


def execute_feedback(recommendation_id):
    payload = build_feedback_payload()
    saved_feedback = save_feedback(recommendation_id,payload)
    return saved_feedback


if __name__ == '__main__':
    test_recommendation_id = 'a718d1b2-5fac-4408-9451-ce2ec5c0fbe9'

    result = execute_feedback(test_recommendation_id)

    print(json.dumps(result, indent=4))
