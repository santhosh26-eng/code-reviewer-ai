from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app
import app.core.auth as auth

def override_get_current_user():
    return {"sub": "user_123"}

app.dependency_overrides[auth.get_current_user] = override_get_current_user
client = TestClient(app)
AUTH_HEADERS = {"Authorization": "Bearer test_development_token"}

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

@patch("app.api.review.run_review")
def test_review_valid_code(mock_run_review):
    mock_run_review.return_value = {
        "detected_language": "Python",
        "explanation": "It divides two numbers.",
        "bugs": [],
        "security_issues": [],
        "refactored_code": "def divide(a, b):\n    if b == 0: raise ValueError()\n    return a / b",
        "complexity": {"time_complexity": "O(1)", "space_complexity": "O(1)", "explanation": "Simple arithmetic."},
        "readability": {"score": 10, "explanation": "Good", "suggestions": []}
    }

    code = "def divide(a, b):\n    return a / b"
    response = client.post("/api/review", json={
        "code": code,
        "depth": "quick"
    }, headers=AUTH_HEADERS)
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["language"] == "Python"
    assert data["depth"] == "quick"
    assert data["refactored_code"] is not None
    assert "complexity" in data
    assert "readability" in data
    assert "markdown_report" in data

@patch("app.api.review.run_review")
def test_review_deep_code(mock_run_review):
    mock_run_review.return_value = {
        "detected_language": "Python",
        "explanation": "It divides two numbers.",
        "bugs": [],
        "security_issues": [],
        "refactored_code": "def divide(a, b):\n    if b == 0: raise ValueError()\n    return a / b",
        "complexity": {"time_complexity": "O(1)", "space_complexity": "O(1)", "explanation": "Simple arithmetic."},
        "readability": {"score": 10, "explanation": "Good", "suggestions": []}
    }

    code = "def divide(a, b):\n    return a / b"
    response = client.post("/api/review", json={
        "code": code,
        "depth": "deep"
    }, headers=AUTH_HEADERS)
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True

def test_review_invalid_input():
    code = "Hello, this is just a normal sentence."
    response = client.post("/api/review", json={
        "code": code,
        "depth": "quick"
    }, headers=AUTH_HEADERS)
    assert response.status_code == 400

def test_review_empty_input():
    response = client.post("/api/review", json={
        "code": "   ",
        "depth": "quick"
    }, headers=AUTH_HEADERS)
    assert response.status_code == 400

def test_review_invalid_depth():
    code = "def add(a, b): return a + b"
    response = client.post("/api/review", json={
        "code": code,
        "depth": "invalid_depth"
    }, headers=AUTH_HEADERS)
    assert response.status_code == 400

def test_review_missing_token():
    app.dependency_overrides.pop(auth.get_current_user, None)
    response = client.post("/api/review", json={
        "code": "def divide(a, b):\n    return a / b",
        "depth": "quick"
    })
    assert response.status_code == 401
    
def test_review_malformed_token():
    response = client.post("/api/review", json={
        "code": "def divide(a, b):\n    return a / b",
        "depth": "quick"
    }, headers={"Authorization": "Bearer bad.jwt.token"})
    assert response.status_code in [401, 500] 
