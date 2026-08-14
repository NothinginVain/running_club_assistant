import os

import requests
from dotenv import load_dotenv

from app.services.feedback_manager import (
    CoachReviewRequiredError,
    HealthUpdateRequiredError,
    create_feedback_entry,
    execute_remaining_plan_revision,
    get_feedback_entries,
)
from app.services.recommendation_manager import (
    delete_recommendation,
    execute_recommendation,
    get_favorite_recommendations_by_user,
    get_recommendation_by_id,
    get_recommendations_by_user,
    update_favorite_recommendation,
    update_recommendation_rating,
)
from app.services.survey_manager import (
    build_sample_survey,
    build_survey_package,
    save_survey,
)

load_dotenv()

DEFAULT_USER_ID = "7eebf305-38f5-4a57-97b2-ee72936f3a2c"


def clear_space():
    print("\n" * 2)


def line():
    print("-" * 72)


def title(text):
    clear_space()
    line()
    print(text)
    line()


def pause(message="Press Enter to return to dashboard..."):
    input(f"\n{message}")


def format_date(value):
    if not value:
        return "N/A"

    return str(value)[:10]


def favorite_label(recommendation):
    return "yes" if recommendation.get("is_favorite") else "no"


def rating_label(recommendation):
    rating = recommendation.get("feedback_rating")

    if rating is None:
        return "not rated"

    return f"{rating}/5"


def get_plan_range(recommendation):
    content = recommendation.get("content", {})
    weekly_distance = content.get("weekly_distance", [])

    if not weekly_distance:
        return "N/A"

    first_week = weekly_distance[0]
    last_week = weekly_distance[-1]

    start_date = first_week.get("start_date")
    end_date = last_week.get("end_date")

    if not start_date and not end_date:
        return "N/A"

    return f"{start_date} -> {end_date}"


def get_week_count(recommendation):
    content = recommendation.get("content", {})
    return len(content.get("weekly_distance", []))


def get_training_day_count(recommendation):
    content = recommendation.get("content", {})
    return len(content.get("training_days", []))


def show_dashboard():
    title("Running Club Assistant")

    print("1 - Create running plan")
    print("2 - View all recommendations")
    print("3 - View favorite recommendations")
    print("4 - Chat with coach")
    print("0 - Exit")


def create_running_plan_flow():
    title("Create Running Plan")

    survey = build_sample_survey()
    payload = build_survey_package(survey)

    print("Saving sample survey...")
    saved_survey = save_survey(DEFAULT_USER_ID, payload)

    print(f"Survey saved: {saved_survey.get('id')}")
    print("Generating recommendation...")

    recommendation = execute_recommendation(DEFAULT_USER_ID)

    show_recommendation_detail(recommendation)
    pause()


def browse_recommendations_flow(favorites_only=False):
    while True:
        if favorites_only:
            title("Favorite Recommendations")
            recommendations = get_favorite_recommendations_by_user(
                DEFAULT_USER_ID,
            )
        else:
            title("All Recommendations")
            recommendations = get_recommendations_by_user(DEFAULT_USER_ID)

        if not recommendations:
            print("No recommendations found.")
            pause()
            return

        show_recommendation_list(recommendations)

        print()
        print("Type a recommendation number to open it.")
        print("B - Back to dashboard")

        choice = input("\nChoice: ").strip().lower()

        if choice == "b":
            return

        try:
            selected_index = int(choice) - 1
        except ValueError:
            print("Invalid option.")
            input("Press Enter to continue...")
            continue

        if selected_index < 0 or selected_index >= len(recommendations):
            print("Invalid recommendation number.")
            input("Press Enter to continue...")
            continue

        selected = recommendations[selected_index]
        recommendation = get_recommendation_by_id(selected["id"])

        should_return_dashboard = recommendation_actions_flow(recommendation)

        if should_return_dashboard:
            return


def chat_with_coach_flow():
    title("Chat with Coach")
    base_url = os.getenv("BASE_URL")

    print("Type your message, 'END' to finish and update long-term memory, or 'B' to pause and return to the dashboard (this conversation is kept and resumes next time).")

    while True:
        message = input("\nYou: ").strip()

        if message.lower() == "b":
            return

        if message.lower() == "end":
            response = requests.post(f"{base_url}/chatbot/{DEFAULT_USER_ID}/end")

            if not response.ok:
                print("Chatbot API error:", response.text)
                input("Press Enter to continue...")
                return

            summary = response.json().get("summary", {})
            chat_memory = summary.get("chat", {})

            print("\nMemory updated:")
            print(f"  Current goal: {chat_memory.get('current_goal')}")
            print(f"  Preferences: {chat_memory.get('preferences')}")
            print(f"  Progress: {chat_memory.get('progress')}")
            input("\nPress Enter to return to dashboard...")
            return

        if not message:
            continue

        response = requests.post(
            f"{base_url}/chatbot/{DEFAULT_USER_ID}",
            json={"message": message},
        )

        if not response.ok:
            print("Chatbot API error:", response.text)
            continue

        print(f"Coach: {response.json().get('reply')}")


def show_recommendation_list(recommendations):
    print("#  Created     Fav  Rating     Weeks  Days  Plan range")
    line()

    for index, recommendation in enumerate(recommendations, start=1):
        print(
            f"{index:<2} "
            f"{format_date(recommendation.get('created_at')):<11} "
            f"{favorite_label(recommendation):<4} "
            f"{rating_label(recommendation):<10} "
            f"{get_week_count(recommendation):<6} "
            f"{get_training_day_count(recommendation):<5} "
            f"{get_plan_range(recommendation)}"
        )
        print(f"   {recommendation.get('title')}")
        print(f"   id: {recommendation.get('id')}")


def recommendation_actions_flow(recommendation):
    while True:
        show_recommendation_detail(recommendation)

        print()
        print("1 - Toggle favorite")
        print("2 - Leave feedback")
        print("3 - View feedback history")
        print("4 - Generate revised plan from feedback")
        print("5 - Rate or change rating")
        print("6 - Delete recommendation")
        print("B - Back to recommendation list")
        print("M - Back to dashboard")

        choice = input("\nChoice: ").strip().lower()

        if choice == "b":
            return False

        if choice == "m":
            return True

        if choice == "1":
            recommendation = toggle_favorite_flow(recommendation)
            continue

        if choice == "2":
            leave_feedback_flow(recommendation)
            continue

        if choice == "3":
            view_feedback_history_flow(recommendation)
            continue

        if choice == "4":
            revised = generate_revised_plan_flow(
                recommendation
            )

            if revised is None:
                continue

            show_recommendation_detail(revised)
            pause()
            return True

        if choice == "5":
            recommendation = rate_recommendation_flow(
                recommendation
            )
            continue


        if choice == "6":
            deleted = delete_recommendation_flow(recommendation)

            if deleted:
                pause(
                    "Recommendation deleted. Press Enter to return to dashboard...")
                return True

            continue

        print("Invalid option.")
        input("Press Enter to continue...")


def show_recommendation_detail(recommendation):
    title("Recommendation Detail")

    print(f"Title: {recommendation.get('title')}")
    print(f"ID: {recommendation.get('id')}")
    print(f"Created: {format_date(recommendation.get('created_at'))}")
    print(f"Favorite: {favorite_label(recommendation)}")
    print(f"Rating: {rating_label(recommendation)}")
    print(f"Plan range: {get_plan_range(recommendation)}")

    content = recommendation.get("content", {})
    explanation = recommendation.get("explanation") or {}

    summary = content.get("summary")
    if summary:
        print()
        line()
        print("Summary")
        line()
        print(summary)

    print_weekly_distance(content)
    print_training_days(content)
    print_list_section("Nutrition", content.get("nutrition", []))
    print_list_section("Safety Notes", content.get("safety_notes", []))
    print_list_section(
        "Why This Plan Fits",
        explanation.get("why_this_plan_fits", []),
    )
    print_list_section(
        "Important Assumptions",
        explanation.get("important_assumptions", []),
    )


def print_weekly_distance(content):
    weekly_distance = content.get("weekly_distance", [])

    if not weekly_distance:
        return

    print()
    line()
    print("Weekly Distance")
    line()

    for week in weekly_distance:
        print(
            f"Week {week.get('week_number')}: "
            f"{week.get('start_date')} -> {week.get('end_date')} | "
            f"{week.get('distance_km')} km"
        )


def print_training_days(content):
    training_days = content.get("training_days", [])

    if not training_days:
        return

    print()
    line()
    print("Training Days")
    line()

    for training_day in training_days:
        print()
        print(
            f"Week {training_day.get('week_number')} | "
            f"{training_day.get('day')} | "
            f"{training_day.get('date')}"
        )

        running = training_day.get("running")
        if running:
            print(
                f"  Run: {running.get('type')} | "
                f"{running.get('distance_km')} km | "
                f"{running.get('intensity_level')}"
            )
            print(f"       {running.get('details')}")

        strength = training_day.get("strength")
        if strength:
            print(
                f"  Strength: {strength.get('focus')} | "
                f"{strength.get('timing')} | "
                f"{strength.get('duration_minutes')} min"
            )
            print(f"            {strength.get('details')}")

        mobility = training_day.get("mobility")
        if mobility:
            print(
                f"  Mobility: {mobility.get('focus')} | "
                f"{mobility.get('timing')} | "
                f"{mobility.get('duration_minutes')} min"
            )
            print(f"           {mobility.get('details')}")

        notes = training_day.get("notes")
        if notes:
            print(f"  Notes: {notes}")


def print_list_section(section_title, items):
    if not items:
        return

    print()
    line()
    print(section_title)
    line()

    for item in items:
        print(f"- {item}")


def toggle_favorite_flow(recommendation):
    current_value = bool(recommendation.get("is_favorite"))
    new_value = not current_value

    updated = update_favorite_recommendation(
        recommendation["id"],
        new_value,
    )

    print(f"Favorite set to: {favorite_label(updated)}")
    input("Press Enter to continue...")

    return updated


def rate_recommendation_flow(recommendation):
    title("Rate Recommendation")

    while True:
        value = input(
            "Rating from 1 to 5 (B to cancel): "
        ).strip().lower()

        if value == "b":
            return recommendation

        if value.isdigit() and 1 <= int(value) <= 5:
            break

        print("Rating must be a number from 1 to 5.")

    updated = update_recommendation_rating(
        recommendation["id"],
        int(value),
    )

    print(f"Rating set to: {rating_label(updated)}")
    pause()

    return updated


def leave_feedback_flow(recommendation):
    title("Leave Feedback")

    while True:
        feedback_text = input("Feedback: ").strip()

        if feedback_text:
            break

        print("Feedback cannot be empty.")

    created_feedback = create_feedback_entry(
        recommendation["id"],
        feedback_text,
    )

    print()
    print("Feedback saved.")
    print(f"Created: {format_date(created_feedback.get('created_at'))}")

    pause()


def view_feedback_history_flow(recommendation):
    title("Feedback History")

    feedback_entries = get_feedback_entries(
        recommendation["id"],
    )

    if not feedback_entries:
        print("No feedback has been submitted for this recommendation.")
        pause()
        return

    print(f"Recommendation: {recommendation.get('title')}")
    print()

    for index, feedback_entry in enumerate(
        feedback_entries,
        start=1,
    ):
        print(
            f"{index}. "
            f"{format_date(feedback_entry.get('created_at'))}"
        )
        print(f"   {feedback_entry.get('feedback')}")
        print()

    pause()


def collect_health_update_flow(
        recommendation,
        questions,
):
    print()
    print("Please provide the following health information:")

    for index, question in enumerate(questions, start=1):
        print(f"{index}. {question}")

    confirmation = input(
        "\nAnswer these questions now? (y/n): "
    ).strip().lower()

    if confirmation not in ("y", "yes"):
        print("No health update was saved.")
        pause()
        return

    health_update_parts = [
        "Health update after a reported injury or health concern:"
    ]

    for index, question in enumerate(questions, start=1):
        print()
        print(f"{index}. {question}")

        while True:
            answer = input("Answer: ").strip()

            if answer:
                break

            print("Answer cannot be empty.")

        health_update_parts.append(
            f"{index}. {question}\n"
            f"Answer: {answer}"
        )

    health_update_text = "\n\n".join(
        health_update_parts
    )

    created_feedback = create_feedback_entry(
        recommendation["id"],
        health_update_text,
    )

    print()
    print("Health update saved.")
    print(
        f"Created: "
        f"{format_date(created_feedback.get('created_at'))}"
    )
    print(
        "Automatic injury-related revisions remain paused "
        "until qualified human review is available."
    )

    pause()


def generate_revised_plan_flow(recommendation):
    title("Generate Revised Plan")

    feedback_entries = get_feedback_entries(
        recommendation["id"],
    )

    if not feedback_entries:
        print("Add feedback before generating a revised plan.")
        pause()
        return None

    print(
        f"Using {len(feedback_entries)} feedback "
        f"{'entry' if len(feedback_entries) == 1 else 'entries'}."
    )

    confirmation = input(
        "Generate revised plan? (y/n): "
    ).strip().lower()

    if confirmation not in ("y", "yes"):
        print("Revision cancelled.")
        pause()
        return None

    print("Generating revised remaining plan...")

    try:
        return execute_remaining_plan_revision(
            recommendation,
        )
    except HealthUpdateRequiredError as error:
        print()
        print("Plan revision paused for safety.")
        print(error)
        print()
        print("No revised plan was generated or saved.")

        collect_health_update_flow(
            recommendation,
            error.questions,
        )

        return None
    except CoachReviewRequiredError as error:
        print()
        print("Automatic plan revision paused.")
        print(error)
        print()
        print(
            "Injury-related plan changes require review by a "
            "qualified club coach or healthcare professional."
        )
        print()
        print("No revised plan was generated or saved.")
        pause()

        return None


def delete_recommendation_flow(recommendation):
    print()
    print(f"Delete recommendation: {recommendation.get('title')}")
    print(f"ID: {recommendation.get('id')}")

    confirmation = input("Type DELETE to confirm: ").strip()

    if confirmation != "DELETE":
        print("Delete cancelled.")
        input("Press Enter to continue...")
        return False

    delete_recommendation(recommendation["id"])
    return True


def check_environment():
    base_url = os.getenv("BASE_URL")

    if not base_url:
        print("BASE_URL is not set.")
        print("Expected: BASE_URL=http://localhost:5002")
        return False

    return True


def run_cli():
    if not check_environment():
        return

    while True:
        show_dashboard()

        choice = input("\nChoice: ").strip()

        try:
            if choice == "0":
                print("Exiting...")
                return

            if choice == "1":
                create_running_plan_flow()
            elif choice == "2":
                browse_recommendations_flow(favorites_only=False)
            elif choice == "3":
                browse_recommendations_flow(favorites_only=True)
            elif choice == "4":
                chat_with_coach_flow()
            else:
                print("Invalid option.")
                input("Press Enter to continue...")

        except Exception as error:
            print()
            print("Command failed:")
            print(error)
            input("Press Enter to continue...")


if __name__ == "__main__":
    run_cli()

# Run with:
# python -m app.cli
