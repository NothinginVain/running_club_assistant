from tests.helpers import create_survey, register_user


def test_user_cannot_read_another_users_survey(client, second_client):
    register_user(client, username="alice", email="alice@example.com")
    survey_id = create_survey(client).json()["id"]

    register_user(second_client, username="bob", email="bob@example.com")
    response = second_client.get(f"/surveys/{survey_id}")

    assert response.status_code == 404


def test_user_cannot_delete_another_users_survey(client, second_client):
    register_user(client, username="alice", email="alice@example.com")
    survey_id = create_survey(client).json()["id"]

    register_user(second_client, username="bob", email="bob@example.com")
    response = second_client.delete(f"/surveys/{survey_id}")

    assert response.status_code == 404

    # Confirm it's still there for the owner.
    owner_check = client.get(f"/surveys/{survey_id}")
    assert owner_check.status_code == 200
    assert owner_check.json()["deleted_at"] is None


def test_survey_list_only_shows_own_surveys(client, second_client):
    register_user(client, username="alice", email="alice@example.com")
    create_survey(client)

    register_user(second_client, username="bob", email="bob@example.com")
    create_survey(second_client)

    alice_surveys = client.get("/surveys/").json()
    bob_surveys = second_client.get("/surveys/").json()

    assert len(alice_surveys) == 1
    assert len(bob_surveys) == 1
    assert alice_surveys[0]["id"] != bob_surveys[0]["id"]


def test_user_cannot_read_another_users_recommendation(client, second_client, db_session):
    register_user(client, username="alice", email="alice@example.com")
    survey = create_survey(client).json()

    from app.models.recommendation import Recommendation

    recommendation = Recommendation(
        survey_id=survey["id"],
        user_id=survey["user_id"],
        recommendation_type="running_plan",
        title="Alice's plan",
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

    register_user(second_client, username="bob", email="bob@example.com")
    response = second_client.get(f"/recommendations/{recommendation.id}")

    assert response.status_code == 404


def test_user_cannot_favorite_another_users_recommendation(client, second_client, db_session):
    register_user(client, username="alice", email="alice@example.com")
    survey = create_survey(client).json()

    from app.models.recommendation import Recommendation

    recommendation = Recommendation(
        survey_id=survey["id"],
        user_id=survey["user_id"],
        recommendation_type="running_plan",
        title="Alice's plan",
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

    register_user(second_client, username="bob", email="bob@example.com")
    response = second_client.patch(
        f"/recommendations/{recommendation.id}/favorite",
        json={"is_favorite": True},
    )

    assert response.status_code == 404


def test_users_me_never_exposes_another_users_data(client, second_client):
    register_user(client, username="alice", email="alice@example.com")
    register_user(second_client, username="bob", email="bob@example.com")

    alice_me = client.get("/auth/me").json()
    bob_me = second_client.get("/auth/me").json()

    assert alice_me["username"] == "alice"
    assert bob_me["username"] == "bob"
    assert alice_me["id"] != bob_me["id"]
