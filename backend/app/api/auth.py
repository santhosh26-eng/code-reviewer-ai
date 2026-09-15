import os
import jwt
import httpx
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse
import urllib.parse
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-default-key-for-dev")
REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/callback")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:8501")

@router.get("/login")
async def login():
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google Client ID not configured in .env")
    
    auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        "?response_type=code"
        f"&client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={urllib.parse.quote(REDIRECT_URI)}"
        "&scope=openid%20email%20profile"
        "&access_type=offline"
        "&prompt=consent"
    )
    return RedirectResponse(auth_url)

@router.get("/callback")
async def callback(code: str):
    if not code:
        raise HTTPException(status_code=400, detail="No authorization code provided")
        
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code",
    }
    
    async with httpx.AsyncClient() as client:
        token_response = await client.post(token_url, data=token_data)
        if not token_response.is_success:
            logger.error(f"Google token error: {token_response.text}")
            raise HTTPException(status_code=400, detail="Failed to retrieve token from Google")
            
        token_json = token_response.json()
        id_token = token_json.get("id_token")
        
        # Decode the Google ID token
        try:
            user_info = jwt.decode(id_token, options={"verify_signature": False})
        except Exception as e:
            raise HTTPException(status_code=400, detail="Failed to decode Google ID token")
        
        # Create our own JWT session token
        payload = {
            "sub": user_info.get("sub"),
            "email": user_info.get("email"),
            "name": user_info.get("name"),
            "picture": user_info.get("picture"),
            "exp": datetime.now(timezone.utc) + timedelta(days=7)
        }
        session_token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
        
        # Redirect to frontend with the token
        return RedirectResponse(f"{FRONTEND_URL}/?token={session_token}")
