def build_running_plan_input(user, survey):
    answers = survey['answers']

    preferred_days = ", ".join(
        answers.get("preferred_training_days", [])
    )

    plan_start_date = (
        answers.get("plan_start_date")
        or str(survey.get('created_at', ''))[:10]
    )

    equipment = ", ".join(
        answers.get("available_equipment", [])
    )

    issue_areas = ", ".join(
        answers.get("current_issue_areas", [])
    )

    return f"""
    The following user completed a running plan survey.

    USER INFORMATION

    Name: {user.get("full_name")}
    Age: {user.get("age")}
    Location: {user.get("address")}
    Weight: {answers.get("weight_kg")} kg

    RUNNING SURVEY

    Main goal: {answers.get("goal")}
    Target distance: {answers.get("target_distance")}
    Experience level: {answers.get("experience_level")}
    Plan duration: {answers.get("plan_duration_weeks")} weeks
    Plan start date: {plan_start_date}
    Target event date: {answers.get("target_event_date")}

    Current weekly distance: {answers.get("current_weekly_distance_km")} km
    Runs per week: {answers.get("runs_per_week")}
    Longest recent run: {answers.get("longest_recent_run_km")} km

    Preferred training days: {preferred_days}
    Preferred long-run day: {answers.get("preferred_long_run_day")}
    Maximum session duration: {answers.get("max_session_minutes")} minutes
    Preferred terrain: {answers.get("preferred_terrain")}
    Available equipment: {equipment}

    Current issue areas: {issue_areas}
    Current pain level: {answers.get("current_pain_level")}/10
    Medical clearance: {answers.get("has_medical_clearance")}

    Recovery level: {answers.get("recovery_level")}
    Average sleep duration: {answers.get("average_sleep_duration")}
    Stress level: {answers.get("stress_level")}

    Diet type: {answers.get("diet_type")}

    Main preference: {answers.get("main_preference")}
    Recommendation detail level: {answers.get("detail_level")}

    Create a safe and personalized running plan using the user information
    and survey answers above.

    Do not invent information that was not provided.
    Respect the preferred training days, current running level, weekly distance,
    pain level, available equipment, and plan duration.
    """.strip()
