VALID_SURVEY_ANSWERS = {
    "goal": "build_consistency",
    "target_distance": "none",
    "plan_duration_weeks": 8,
    "plan_start_date": "2026-09-01",
    "target_event_date": None,
    "experience_level": "beginner",
    "current_weekly_distance_km": 10,
    "runs_per_week": 3,
    "longest_recent_run_km": 5,
    "preferred_training_days": ["monday", "wednesday", "saturday"],
    "preferred_long_run_day": "saturday",
    "max_session_minutes": 60,
    "preferred_terrain": "road",
    "available_equipment": ["none"],
    "current_issue_areas": ["none"],
    "current_pain_level": 0,
    "recovery_level": "good",
    "average_sleep_duration": "7_to_8_hours",
    "stress_level": "moderate",
    "diet_type": "omnivore",
    "weight_kg": None,
    "main_preference": "balanced_training",
    "detail_level": "balanced",
}


def create_survey(client, **overrides):
    answers = {**VALID_SURVEY_ANSWERS, **overrides}
    return client.post(
        "/surveys/",
        json={"survey_type": "running_plan", "answers": answers},
    )


def register_user(
    client,
    *,
    username="runner1",
    email="runner1@example.com",
    password="password123",
    full_name="Runner One",
):
    return client.post(
        "/auth/register",
        json={
            "username": username,
            "email": email,
            "full_name": full_name,
            "password": password,
        },
    )
