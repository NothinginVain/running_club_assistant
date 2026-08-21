from tests.helpers import create_survey, register_user


def test_latest_survey_404_when_user_has_none(client):
    register_user(client)

    response = client.get("/surveys/latest")

    assert response.status_code == 404


def test_create_survey_is_owned_by_authenticated_user(client):
    register_user(client)
    me = client.get("/auth/me").json()

    response = create_survey(client)

    assert response.status_code == 201
    assert response.json()["user_id"] == me["id"]


def test_survey_has_no_update_endpoint(client):
    register_user(client)
    survey_id = create_survey(client).json()["id"]

    response = client.patch(
        f"/surveys/{survey_id}",
        json={"answers": {"goal": "weight_management"}},
    )

    assert response.status_code in (404, 405)


def test_survey_answers_are_unchanged_by_creating_a_new_one(client):
    register_user(client)
    first = create_survey(client, goal="build_consistency").json()
    create_survey(client, goal="weight_management")

    refetched_first = client.get(f"/surveys/{first['id']}").json()

    assert refetched_first["answers"]["goal"] == "build_consistency"


def test_latest_survey_is_the_most_recently_created_one(client):
    register_user(client)
    create_survey(client, goal="build_consistency")
    second = create_survey(client, goal="weight_management").json()

    latest = client.get("/surveys/latest").json()

    assert latest["id"] == second["id"]
    assert latest["answers"]["goal"] == "weight_management"


def test_soft_delete_removes_survey_from_list_and_latest(client):
    register_user(client)
    survey_id = create_survey(client).json()["id"]

    delete_response = client.delete(f"/surveys/{survey_id}")
    assert delete_response.status_code == 204

    assert client.get("/surveys/").json() == []
    assert client.get("/surveys/latest").status_code == 404


def test_soft_deleted_survey_is_still_directly_readable_by_owner(client):
    register_user(client)
    survey_id = create_survey(client).json()["id"]
    client.delete(f"/surveys/{survey_id}")

    response = client.get(f"/surveys/{survey_id}")

    assert response.status_code == 200
    assert response.json()["deleted_at"] is not None


def test_soft_delete_preserves_existing_recommendation(client, db_session):
    register_user(client)
    survey = create_survey(client).json()

    from app.models.recommendation import Recommendation

    recommendation = Recommendation(
        survey_id=survey["id"],
        user_id=survey["user_id"],
        recommendation_type="running_plan",
        title="Plan built from this survey",
        content={
            "summary": "test",
            "weekly_distance": [],
            "training_days": [],
            "nutrition": [],
            "safety_notes": [],
        },
        survey_snapshot=survey["answers"],
    )
    db_session.add(recommendation)
    db_session.commit()
    db_session.refresh(recommendation)

    delete_response = client.delete(f"/surveys/{survey['id']}")
    assert delete_response.status_code == 204

    recommendation_response = client.get(f"/recommendations/{recommendation.id}")
    assert recommendation_response.status_code == 200
    assert recommendation_response.json()["title"] == "Plan built from this survey"
