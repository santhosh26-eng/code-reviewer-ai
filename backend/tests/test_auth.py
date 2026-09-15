import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.auth import get_current_user
from fastapi.security import HTTPAuthorizationCredentials
from fastapi import HTTPException

client = TestClient(app)

def test_login_redirect():
    response = client.get("/api/auth/login", follow_redirects=False)
    assert response.status_code == 307
    assert "accounts.google.com/o/oauth2/v2/auth" in response.headers["location"]

def test_get_current_user_invalid_token():
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="invalid_token_xyz")
    with pytest.raises(HTTPException) as exc_info:
        get_current_user(creds)
    assert exc_info.value.status_code == 401

