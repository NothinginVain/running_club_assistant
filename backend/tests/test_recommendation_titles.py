from app.services.recommendation_title_service import (
    build_initial_plan_title,
    build_revision_title,
)


def test_build_initial_plan_title():
    assert (
        build_initial_plan_title("weight_management", 2)
        == "Plan 2 · Weight Management"
    )


def test_build_first_revision_title():
    assert (
        build_revision_title("Plan 2 · Weight Management")
        == "Plan 2 · Weight Management — Revised 1"
    )


def test_increment_revision_title():
    assert (
        build_revision_title(
            "Plan 2 · Weight Management — Revised 1"
        )
        == "Plan 2 · Weight Management — Revised 2"
    )
