from app.services.recommendation_manager import execute_recommendation
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
1 - Survey
2 - Recommendation
3 - Feedback
"""
    )


def run_cli():
    user_id = "328cae0c-b9fe-4d3e-ac20-7fc642b406e1"
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

        elif user_input == 2:
            execute_recommendation(user_id)
            print("Recommendation executed.")

        elif user_input == 3:
            execute_feedback_recommendation(recommendation_id)
            print("Feedback executed.")

        else:
            print("Invalid option. Please choose 0, 1, 2, or 3.")


if __name__ == "__main__":
    run_cli()

# python -m app.cli
