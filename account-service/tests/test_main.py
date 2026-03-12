import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_check():
    """Health endpoint should return status healthy."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_create_account_valid_branch():
    """Creating an account with a valid branch should succeed."""
    response = client.post("/accounts", json={"user_id": "user1", "branch": "Hyderabad"})
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == "user1"
    assert data["branch"] == "Hyderabad"
    assert data["balance"] == 0.0
    # Account ID must be exactly 11 numeric digits
    assert len(data["id"]) == 11
    assert data["id"].isdigit()


def test_create_account_all_branches():
    """All five allowed branches should be accepted."""
    branches = ["Hyderabad", "Bangalore", "Pune", "Bidar", "Chennai"]
    for branch in branches:
        response = client.post("/accounts", json={"user_id": f"user_{branch}", "branch": branch})
        assert response.status_code == 200, f"Branch {branch} was rejected unexpectedly"


def test_create_account_invalid_branch():
    """Creating an account with an invalid branch should return 400."""
    response = client.post("/accounts", json={"user_id": "user2", "branch": "Delhi"})
    assert response.status_code == 400
    assert "Invalid branch" in response.json()["detail"]


def test_get_accounts_for_user():
    """GET /accounts/{user_id} should return accounts for that user."""
    # Create an account first
    client.post("/accounts", json={"user_id": "user_test_get", "branch": "Pune"})
    response = client.get("/accounts/user_test_get")
    assert response.status_code == 200
    accounts = response.json()
    assert len(accounts) >= 1
    assert all(acc["user_id"] == "user_test_get" for acc in accounts)


def test_update_balance():
    """Balance update should correctly add the given amount."""
    # Create account
    create_resp = client.post("/accounts", json={"user_id": "user_balance", "branch": "Chennai"})
    account_id = create_resp.json()["id"]

    # Deposit 500
    response = client.post(f"/accounts/{account_id}/update_balance", json={"amount": 500.0})
    assert response.status_code == 200
    assert response.json()["balance"] == 500.0

    # Withdraw 200
    response = client.post(f"/accounts/{account_id}/update_balance", json={"amount": -200.0})
    assert response.status_code == 200
    assert response.json()["balance"] == 300.0


def test_update_balance_nonexistent_account():
    """Updating balance for a non-existent account should return 404."""
    response = client.post("/accounts/00000000000/update_balance", json={"amount": 100.0})
    assert response.status_code == 404


def test_get_account_details():
    """GET /accounts/details/{account_id} should return the correct account."""
    create_resp = client.post("/accounts", json={"user_id": "user_detail", "branch": "Bidar"})
    account_id = create_resp.json()["id"]

    response = client.get(f"/accounts/details/{account_id}")
    assert response.status_code == 200
    assert response.json()["id"] == account_id
    assert response.json()["branch"] == "Bidar"


def test_get_nonexistent_account_details():
    """GET /accounts/details/{account_id} for missing account returns 404."""
    response = client.get("/accounts/details/00000000000")
    assert response.status_code == 404
