import time
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from app.core.auth import get_current_user
from app.agents.chat_graph import run_chat

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    code: str = Field(..., max_length=15000, description="The current editor code.")
    language: str = Field(..., description="The language of the code.")
    question: str = Field(..., max_length=2000, description="The user's question.")
    history: List[ChatMessage] = Field(default_factory=list, description="Conversation history.")

class ChatResponse(BaseModel):
    id: str
    role: str
    content: str
    timestamp: str

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    if not request.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty."
        )
        
    history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.history]
    
    result = run_chat(
        code=request.code,
        language=request.language,
        history=history_dicts,
        question=request.question
    )
    
    if result.get("error"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result["error"]
        )
        
    import uuid
    from datetime import datetime, timezone
    
    return ChatResponse(
        id=str(uuid.uuid4()),
        role="assistant",
        content=result.get("response", "I'm sorry, I couldn't formulate a response."),
        timestamp=datetime.now(timezone.utc).isoformat()
    )
