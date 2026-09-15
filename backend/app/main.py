from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.review import router as review_router
from app.api.execute import router as execute_router
from app.api.chat import router as chat_router
from app.api.auth import router as auth_router

app = FastAPI(
    title="Code Reviewer API",
    description="FastAPI backend for the AI Code Reviewer and Explainer.\n\nNote: Clerk provides authentication for protected review endpoints, while FastAPI handles token verification at the API boundary.",
    version="1.0.0"
)

# Allow CORS for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8501", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

app.include_router(review_router, prefix="/api")
app.include_router(execute_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
