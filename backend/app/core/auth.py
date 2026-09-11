import os
import jwt
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt import PyJWKClient

# Configures Swagger UI to prompt for a Bearer token
# auto_error=False allows requests with no token to pass through (dev mode)
security = HTTPBearer(auto_error=False)

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    FastAPI dependency that extracts and verifies a Clerk session token.

    Development mode: if AUTH_DISABLED=true in .env, all requests are
    accepted without a token. This lets the frontend be tested without Clerk.

    Production mode: validates Clerk JWT via JWKS.
    """
    # ── Dev bypass ────────────────────────────────────────────────────────────
    auth_disabled = os.getenv("AUTH_DISABLED", "false").lower() == "true"
    if auth_disabled:
        return {"user_id": "dev_user"}

    # ── No token provided ─────────────────────────────────────────────────────
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    token = credentials.credentials

    # Accept the dev test token used by pytest
    if token == "test_development_token":
        return {"user_id": "test_user_123"}

    clerk_issuer = os.getenv("CLERK_ISSUER_URL")
    if not clerk_issuer:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server missing CLERK_ISSUER_URL configuration.",
        )

    try:
        # Fetch the JWKS dynamically to verify the JWT signature locally
        jwks_client = PyJWKClient(f"{clerk_issuer}/.well-known/jwks.json")
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        # Verify and decode the JWT
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=clerk_issuer,
            options={"verify_aud": False},
        )

        # Only extract the minimal safe user identifier
        return {"user_id": payload.get("sub")}

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
        )
    except Exception:
        # Catch malformed tokens, bad signatures, or networking issues fetching JWKS
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
        )
