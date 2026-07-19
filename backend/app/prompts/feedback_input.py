def build_feedback_input(previous_recommendation: dict) -> str:
    survey = previous_recommendation["survey_snapshot"]
    content = previous_recommendation["content"]

    preferred_days = (
        survey.get("preferred_training_days")
        or survey.get("preferred_days")
        or []
    )

    weekly_distance_text = "\n".join(
        f"- Week {week.get('week_number')}: {week.get('distance_km')} km"
        for week in content.get("weekly_distance", [])
    )

    if not weekly_distance_text:
        weekly_distance_text = "No previous weekly distance available."

    training_days_lines = []

    for training_day in content.get("training_days", []):
        training_days_lines.append(
            f"- Week {training_day.get('week_number')}, {training_day.get('day')}"
        )

        running = training_day.get("running")
        if running:
            training_days_lines.append(
                f"  Running: {running.get('type')}, "
                f"{running.get('distance_km')} km, "
                f"{running.get('intensity_level')}. "
                f"{running.get('details')}"
            )

        strength = training_day.get("strength")
        if strength:
            training_days_lines.append(
                f"  Strength: {strength.get('focus')}, "
                f"{strength.get('timing')}, "
                f"{strength.get('duration_minutes')} min. "
                f"{strength.get('details')}"
            )

        mobility = training_day.get("mobility")
        if mobility:
            training_days_lines.append(
                f"  Mobility: {mobility.get('focus')}, "
                f"{mobility.get('timing')}, "
                f"{mobility.get('duration_minutes')} min. "
                f"{mobility.get('details')}"
            )

        if training_day.get("notes"):
            training_days_lines.append(
                f"  Notes: {training_day.get('notes')}"
            )

    training_days_text = "\n".join(training_days_lines)

    if not training_days_text:
        training_days_text = "No previous training days available."

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

    Previous weekly distance:
    {weekly_distance_text}

    Previous training days:
    {training_days_text}

    RUNNER FEEDBACK

    Rating: {previous_recommendation.get("feedback_rating")}/5
    Comment: {previous_recommendation.get("feedback_comment")}

    Create a complete revised running plan.

    Keep the original goal and useful parts of the previous plan, but apply
    the runner's feedback directly to the new recommendation.
    Respect the preferred training days: {", ".join(preferred_days)}.
    Do not create training days outside those preferred days.
    Keep running, strength, and mobility grouped by week and day.
    Keep weekly distance progression conservative.
    """.strip()
