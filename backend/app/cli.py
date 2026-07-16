import json
from app.services.recommendation_manager import execute_recommendation, update_favorite_recommendation
from app.services.survey_manager import (
    save_survey,
    build_survey_package,
    build_sample_survey,
)
from app.services.feedback_manager import execute_feedback_recommendation


def show_menu():
    print(
        """
0 - Exit
1 - Create running plan
2 - Recommendations view  
3 - Feedback / Generate new running plan
5 - add Favorite Recommendations 

"""
    )


def run_cli():
    user_id = "e1347682-fb4c-4e2b-a030-3cf0d3c0ae1e"
    recommendation_id = "efc1e79d-d4b1-4513-b795-3dd07498f3b0"

    while True:
        show_menu()

        try:
            user_input = int(input("Select the menu option: "))
        except ValueError:
            print("Please enter a valid number.")
            continue

        if user_input == 0:
            print("Exiting...")
            break

        elif user_input == 1:
            survey = build_sample_survey()
            payload = build_survey_package(survey)
            save_survey(user_id, payload)
            print("Survey saved.")
            print("Executing recommendation...")
            result = execute_recommendation(user_id)
            print("Recommendation executed.")
            print(json.dumps(result, indent=4, ensure_ascii=False))

        elif user_input == 2:
            pass

        elif user_input == 3:
            print("Executing feedback recommendation ...")
            result = execute_feedback_recommendation(recommendation_id)
            print("Feedback executed.")
            print(json.dumps(result, indent=4))

        elif user_input == 5:
           favorite_input = input('Set favorite? true/false:').strip().lower()

           if favorite_input == 'true':
               favorite = True

           elif favorite_input == 'false':
               valor = False
           else:
               print('Invalid option. Please choose 0, 1, 2, 3 or 4')

           update_favorite_recommendation(recommendation_id, favorite)
           print(
               f"Recommendation {recommendation_id} is now set as favorite: {favorite}"
           )

        else:
            print("Invalid option. Please choose 0, 1, 2, or 3.")


if __name__ == "__main__":
    run_cli()

# python -m app.cli
