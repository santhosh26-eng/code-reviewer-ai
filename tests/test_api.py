from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# The mock token our auth dependency accepts for testing
AUTH_HEADERS = {"Authorization": "Bearer test_development_token"}

def test_health():
    # Public endpoint, no auth required
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_review_missing_token():
    code = "def divide(a, b):\n    return a / b"
    # No headers sent
    response = client.post("/api/review", json={"code": code, "depth": "quick"})
    assert response.status_code == 401 # FastAPI HTTPBearer returns 403 or 401 depending on version, we want 401

def test_review_malformed_token():
    code = "def divide(a, b):\n    return a / b"
    # Invalid token sent
    response = client.post("/api/review", json={"code": code, "depth": "quick"}, headers={"Authorization": "Bearer bad.jwt.token"})
    assert response.status_code == 500 # Will fail at missing config first, or 401 if CLERK_ISSUER_URL is set

def test_review_valid_code():
    code = "def divide(a, b):\n    return a / b"
    response = client.post("/api/review", json={
        "code": code,
        "depth": "quick"
    }, headers=AUTH_HEADERS)
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True, f"Expected success but got: {data}"
    assert data["language"] == "Python"
    assert data["depth"] == "quick"
    assert data["refactored_code"] is not None
    assert "complexity" in data
    assert "readability" in data
    assert "markdown_report" in data
    assert data["markdown_report"] is not None
    assert "## Overview" in data["markdown_report"]

def test_review_deep_code():
    code = "def divide(a, b):\n    return a / b"
    response = client.post("/api/review", json={
        "code": code,
        "depth": "deep"
    }, headers=AUTH_HEADERS)
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True, f"Expected success but got: {data}"
    assert data["language"] == "Python"
    assert data["depth"] == "deep"
    assert data["refactored_code"] is not None
    assert "markdown_report" in data
    assert data["markdown_report"] is not None
    assert "## Overview" in data["markdown_report"]

def test_review_invalid_input():
    code = "Hello, this is just a normal sentence."
    response = client.post("/api/review", json={
        "code": code,
        "depth": "quick"
    }, headers=AUTH_HEADERS)
    
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "sentence" in data["detail"]

def test_review_empty_input():
    response = client.post("/api/review", json={
        "code": "   ",
        "depth": "quick"
    }, headers=AUTH_HEADERS)
    
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data

def test_review_invalid_depth():
    code = "def add(a, b): return a + b"
    response = client.post("/api/review", json={
        "code": code,
        "depth": "invalid_depth"
    }, headers=AUTH_HEADERS)
    
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Review depth must be 'quick' or 'deep'."
