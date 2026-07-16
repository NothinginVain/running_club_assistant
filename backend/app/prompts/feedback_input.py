def build_feedback_input(previous_recommendation: dict) -> str:
    survey = previous_recommendation["survey_snapshot"]
    content = previous_recommendation["content"]

    preferred_days = (
        survey.get("preferred_training_days")
        or survey.get("preferred_days")
        or []
    )

    sessions = content.get("sessions", [])

    session_text = "\n".join(
        (
            f"- {session.get('day')}: "
            f"{session.get('type')} — "
            f"{session.get('distance_km')} km, "
            f"{session.get('intensity')}. "
            f"{session.get('details')}"
        )
        for session in sessions
    )

    if not session_text:
        session_text = "No previous sessions available."

    return f"""
    Revise the runner's previous running plan.

    ORIGINAL RUNNER INFORMATION

    Goal: {survey.get("goal")}
    Experience level: {survey.get("experience_level")}
    Current weekly distance: {
        survey.get("current_weekly_distance_km")
    } km
    Runs per week: {survey.get("runs_per_week")}
    Preferred training days: {", ".join(preferred_days)}
    Plan duration: {survey.get("plan_duration_weeks")} weeks
    Current issue: {
        survey.get("has_current_issue")
        or survey.get("current_injury")
    }
    Pain level: {
        survey.get("pain_during_running_level_0_to_10")
        or survey.get("pain_during_running")
    }
    Main preference: {survey.get("main_preference")}

    PREVIOUS RUNNING PLAN

    Title: {previous_recommendation.get("title")}
    Summary: {content.get("summary")}
    Weekly distance: {content.get("weekly_distance_km")} km

    Previous sessions:
    {session_text}

    RUNNER FEEDBACK

    Rating: {previous_recommendation.get("feedback_rating")}/5
    Comment: {previous_recommendation.get("feedback_comment")}

    Create a complete revised running plan.

    Keep the original goal and useful parts of the previous plan, but apply
    the runner's feedback directly to the new recommendation.
    """.strip()
