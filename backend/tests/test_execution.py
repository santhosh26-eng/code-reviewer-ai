import os
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
import app.core.auth as auth
from app.services.execution_service import MockSandboxExecutor

def override_get_current_user():
    return {"sub": "user_123"}

app.dependency_overrides[auth.get_current_user] = override_get_current_user
client = TestClient(app)
AUTH_HEADERS = {"Authorization": "Bearer test_development_token"}

@patch("app.api.execute.get_executor")
def test_execute_mock_success(mock_get_executor):
    mock_get_executor.return_value = MockSandboxExecutor()
    
    response = client.post("/api/execute", json={
        "code": "def solve(): return 1",
        "language": "python",
        "test_cases": [{"input": "1", "expected_output": "1"}]
    }, headers=AUTH_HEADERS)
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert data["language"] == "python"
    assert len(data["results"]) == 1

def test_execute_empty_code():
    response = client.post("/api/execute", json={
        "code": "   ",
        "language": "python",
        "test_cases": [{"input": "1", "expected_output": "1"}]
    }, headers=AUTH_HEADERS)
    assert response.status_code == 400

def test_execute_too_many_test_cases():
    test_cases = [{"input": str(i), "expected_output": str(i)} for i in range(15)]
    response = client.post("/api/execute", json={
        "code": "print(1)",
        "language": "python",
        "test_cases": test_cases
    }, headers=AUTH_HEADERS)
    assert response.status_code == 422 

def test_execute_missing_token():
    app.dependency_overrides.pop(auth.get_current_user, None)
    response = client.post("/api/execute", json={
        "code": "print(1)",
        "language": "python",
        "test_cases": []
    })
    assert response.status_code == 401
