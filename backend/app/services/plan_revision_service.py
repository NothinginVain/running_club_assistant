from datetime import date
from typing import Any


def build_remaining_plan_context(
        recommendation: dict[str, Any],
        revision_date: date,
) -> dict[str, Any]:

    content = recommendation.get("content") or {}
    training_days = content.get("training_days") or []
    weekly_distance = content.get("weekly_distance") or []

    remaining_training_days = []

    for training_day in training_days:
        training_date_value = training_day.get("date")

        if not training_date_value:
            raise ValueError('Every training day must have a date.')

        try:
            training_date = date.fromisoformat(training_date_value)

        except ValueError as error:
            raise ValueError(f'Invalid date format for training day: '
                             f'{training_date_value}') from error

        if training_date >= revision_date:
            remaining_training_days.append(training_day)

    if not remaining_training_days:
        raise ValueError('No remaining training days after the revision date.')

    remaining_week_numbers = {
        training_day['week_number'] for training_day in remaining_training_days
    }

    remaining_weekly_distance = [
        week for week in weekly_distance
        if week['week_number'] in remaining_week_numbers
           ]

    return {
        'revision_date': revision_date.isoformat(),
        'remaining_week_numbers': sorted(remaining_week_numbers),
        'remaining_weekly_distance': remaining_weekly_distance,
        'remaining_training_days': remaining_training_days,
    }