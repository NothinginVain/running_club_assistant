def build_running_plan_input(user, survey):
    answers = survey['answers']

    preferred_days = ", ".join(
        answers.get("preferred_training_days", [])
    )

    equipment = ", ".join(
        answers.get("available_equipment", [])
    )

    dietary_restrictions = answers.get(
        "dietary_restrictions",
        [],
    )

    if dietary_restrictions:
        dietary_restrictions_text = ", ".join(
            dietary_restrictions
        )
    else:
        dietary_restrictions_text = "None"

    return f"""
    The following user completed a running plan survey.

    USER INFORMATION

    Name: {user.get("full_name")}
    Age: {user.get("age")}
    Location: {user.get("address")}
    Height: {user.get("height_cm")} cm
    Weight: {user.get("weight_kg")} kg

    RUNNING SURVEY

    Main goal: {answers.get("goal")}
    Experience level: {answers.get("experience_level")}
    Plan duration: {answers.get("plan_duration_weeks")} weeks

    Current weekly distance: {answers.get("current_weekly_distance_km")} km
    Runs per week: {answers.get("runs_per_week")}
    Longest recent run: {answers.get("longest_recent_run_km")} km

    Preferred training days: {preferred_days}
    Preferred terrain: {answers.get("preferred_terrain")}
    Available equipment: {equipment}

    Has a current injury or health issue: {answers.get("has_current_issue")}
    Pain during running: {answers.get("pain_during_running_level_0_to_10")}/10

    Diet type: {answers.get("diet_type")}
    Dietary restrictions: {dietary_restrictions_text}

    Main preference: {answers.get("main_preference")}
    Recommendation detail level: {answers.get("recommendation_detail_level")}

    Create a safe and personalized running plan using the user information
    and survey answers above.

    Do not invent information that was not provided.
    Respect the preferred training days, current running level, weekly distance,
    pain level, available equipment, and plan duration.
    """.strip()