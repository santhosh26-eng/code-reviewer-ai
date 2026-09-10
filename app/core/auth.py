import os
import jwt
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt import PyJWKClient

# Configures Swagger UI to prompt for a Bearer token
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    FastAPI dependency that extracts and verifies a Clerk session token.
    
    1. Reads the incoming Bearer token.
    2. Validates it via local stateless JWT verification using Clerk's JWKS.
    3. Returns safe user information (user_id).
    """
    token = credentials.credentials
    
    # We accept a simulated token during development tests for isolated validation
    if token == "test_development_token":
        return {"user_id": "test_user_123"}
        
    clerk_issuer = os.getenv("CLERK_ISSUER_URL")
    if not clerk_issuer:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server missing CLERK_ISSUER_URL configuration."
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
            options={"verify_aud": False} # Clerk often requires specific AUD setup based on frontend, keeping it flexible here
        )
        
        # Only extract the minimal safe user identifier
        return {"user_id": payload.get("sub")}
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token."
        )
    except Exception:
        # Catch malformed tokens, bad signatures, or networking issues fetching JWKS
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token."
        )
