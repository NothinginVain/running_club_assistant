def calculate_weekly_distance_totals(
        training_days: list[dict],
) -> dict[int, float]:
    totals_by_week = {}

    for training_day in training_days:
        running = training_day.get("running")
        walking = training_day.get("walking")

        distance_km = 0.0

        if running is not None:
            distance_km += running["distance_km"]

        if walking is not None:
            distance_km += walking["distance_km"]

        if distance_km == 0:
            continue

        week_number = training_day["week_number"]

        totals_by_week[week_number] = (
            totals_by_week.get(week_number, 0) + distance_km
        )

    return {
        week_number: round(distance_km, 2)
        for week_number, distance_km
        in totals_by_week.items()
    }


def synchronize_weekly_distances(
        recommendation: dict,
) -> dict:
    content = recommendation["content"]
    training_days = content.get("training_days", [])

    totals_by_week = calculate_weekly_distance_totals(
        training_days
    )

    for week in content.get("weekly_distance", []):
        week_number = week["week_number"]

        week["distance_km"] = totals_by_week.get(
            week_number,
            0,
        )

    return recommendation


def validate_plan_mode(
        recommendation: dict,
        plan_mode: str,
        cleared_activities: list[str],
) -> dict:
    easy_intensities = {
        "recovery",
        "very_easy",
        "easy",
    }
    cleared = set(cleared_activities)

    for day in recommendation["content"]["training_days"]:
        running = day.get("running")
        walking = day.get("walking")

        if running is not None and walking is not None:
            raise ValueError(
                "A day cannot contain both running and walking."
            )

        if plan_mode == "normal_running" and walking is not None:
            raise ValueError(
                "normal_running cannot contain walking."
            )

        if plan_mode == "easy_running":
            if (
                running is not None
                and running["intensity_level"]
                not in easy_intensities
            ):
                raise ValueError(
                    "easy_running contains excessive intensity."
                )

            if (
                walking is not None
                and walking["type"] not in cleared
            ):
                raise ValueError(
                    "Walking activity was not explicitly cleared."
                )

        if plan_mode == "walk_run":
            if running is not None:
                raise ValueError(
                    "walk_run cannot contain running blocks."
                )

            if (
                walking is not None
                and walking["type"] == "walk"
                and "walk" not in cleared
            ):
                raise ValueError(
                    "Pure walking was not explicitly cleared."
                )

        if plan_mode == "walk_only":
            if running is not None:
                raise ValueError(
                    "walk_only cannot contain running blocks."
                )

            if (
                walking is not None
                and walking["type"] != "walk"
            ):
                raise ValueError(
                    "walk_only cannot contain walk-run sessions."
                )

    return recommendation