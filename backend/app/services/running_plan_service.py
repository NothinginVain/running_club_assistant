def calculate_weekly_distance_totals(
        training_days: list[dict],
) -> dict[int, float]:
    totals_by_week = {}

    for training_day in training_days:
        running = training_day.get("running")

        if running is None:
            continue

        week_number = training_day["week_number"]
        distance_km = running["distance_km"]

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
