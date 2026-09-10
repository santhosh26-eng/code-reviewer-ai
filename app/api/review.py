from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from app.agents.review_graph import run_review
from app.utils.validators import validate_code_input
from app.core.auth import get_current_user
from app.services.markdown_service import generate_markdown_report

router = APIRouter()

class ReviewRequest(BaseModel):
    code: str = Field(..., description="The user's source code to review.")
    depth: str = Field(..., description="Review depth, must be either 'quick' or 'deep'.")

class ReviewResponse(BaseModel):
    success: bool
    language: Optional[str] = None
    depth: Optional[str] = None
    explanation: Optional[str] = None
    bugs: Optional[List[Dict[str, Any]]] = None
    security_issues: Optional[List[Dict[str, Any]]] = None
    refactored_code: Optional[str] = None
    complexity: Optional[Dict[str, Any]] = None
    readability: Optional[Dict[str, Any]] = None
    markdown_report: Optional[str] = None
    error: Optional[str] = None

@router.post("/review", response_model=ReviewResponse)
async def create_review(request: ReviewRequest, current_user: dict = Depends(get_current_user)):
    # Map depth cleanly to the existing identifiers
    if request.depth.lower() == "quick":
        mapped_depth = "Quick Scan"
    elif request.depth.lower() == "deep":
        mapped_depth = "Deep Review"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Review depth must be 'quick' or 'deep'."
        )
        
    # Pre-validation (fail fast to avoid spinning up LangGraph)
    is_valid, error_msg = validate_code_input(request.code)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
        
    try:
        # Run LangGraph pipeline
        result = run_review(code=request.code, depth=mapped_depth)
        
        # Check if the pipeline caught an error
        if result.get("error"):
            return ReviewResponse(
                success=False,
                error=result["error"]
            )
            
        # Format the markdown report
        md_report = generate_markdown_report(result)
            
        return ReviewResponse(
            success=True,
            language=result.get("detected_language"),
            depth=request.depth,
            explanation=result.get("explanation"),
            bugs=result.get("bugs", []),
            security_issues=result.get("security_issues", []),
            refactored_code=result.get("refactored_code"),
            complexity=result.get("complexity", {}),
            readability=result.get("readability", {}),
            markdown_report=md_report
        )
        
    except Exception as e:
        # Handle unexpected server errors without leaking stack traces
        return ReviewResponse(
            success=False,
            error="Unable to complete the code review at this time."
        )
