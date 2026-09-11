from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from app.core.auth import get_current_user
from app.services.execution_service import get_executor

router = APIRouter()

class TestCase(BaseModel):
    input: str
    expected_output: str

class ExecuteRequest(BaseModel):
    code: str = Field(..., max_length=10000, description="The code to execute.")
    language: str = Field(..., description="The language of the code.")
    test_cases: List[TestCase] = Field(..., max_length=10, description="Test cases to run.")

@router.post("/execute")
async def execute_code(request: ExecuteRequest, current_user: dict = Depends(get_current_user)):
    if not request.code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code cannot be empty."
        )
        
    executor = get_executor()
    
    test_cases_dict = [{"input": tc.input, "expected_output": tc.expected_output} for tc in request.test_cases]
    
    try:
        result = executor.execute(request.code, request.language, test_cases_dict)
        return result.model_dump()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Execution service failed: {str(e)}"
        )
