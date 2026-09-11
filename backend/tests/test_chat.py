from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app
import app.core.auth as auth

def override_get_current_user():
    return {"sub": "user_123"}

app.dependency_overrides[auth.get_current_user] = override_get_current_user
client = TestClient(app)
AUTH_HEADERS = {"Authorization": "Bearer test_development_token"}

@patch("app.api.chat.run_chat")
def test_chat_success(mock_run_chat):
    mock_run_chat.return_value = {"response": "Here is how to optimize it..."}

    response = client.post("/api/chat", json={
        "code": "print(1)",
        "language": "python",
        "question": "How to optimize?",
        "history": []
    }, headers=AUTH_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["role"] == "assistant"
    assert "Here is how to optimize" in data["content"]

def test_chat_empty_question():
    response = client.post("/api/chat", json={
        "code": "print(1)",
        "language": "python",
        "question": "   ",
        "history": []
    }, headers=AUTH_HEADERS)
    assert response.status_code == 400

def test_chat_code_too_large():
    large_code = "print(1)\n" * 16000 
    response = client.post("/api/chat", json={
        "code": large_code,
        "language": "python",
        "question": "Optimize this?",
        "history": []
    }, headers=AUTH_HEADERS)
    assert response.status_code == 422 

def test_chat_missing_token():
    app.dependency_overrides.pop(auth.get_current_user, None)
    response = client.post("/api/chat", json={
        "code": "print(1)",
        "language": "python",
        "question": "What does this do?",
        "history": []
    })
    assert response.status_code == 401
