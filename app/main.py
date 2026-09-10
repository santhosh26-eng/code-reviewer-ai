from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.review import router as review_router

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
