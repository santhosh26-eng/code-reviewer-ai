from typing import Dict, Any, List
from app.ai.llm import generate_review
from pydantic import BaseModel, Field

class ChatResponse(BaseModel):
    response: str = Field(..., description="The AI's helpful response to the user's question, formatted in markdown.")

def generate_chat_response(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Node that calls the LLM with the code context, chat history, and the new user question.
    """
    code = state.get("code", "")
    language = state.get("language", "unknown")
    history = state.get("history", [])
    question = state.get("question", "")
    
    system_prompt = f"""You are a helpful and expert AI programming assistant.
The user is working on code in {language}.
Their current code is:
```
{code}
```
Use this context to accurately answer their questions. 
Do not hallucinate execution results unless the user provided them. 
Respond in clear, professional markdown. 
If the user's input does not appear related to programming or the provided code, politely guide them back to discussing the code.
"""

    # Build the conversation context
    user_prompt = "Conversation History:\n"
    for msg in history:
        role = "User" if msg.get("role") == "user" else "Assistant"
        user_prompt += f"{role}: {msg.get('content')}\n"
    
    user_prompt += f"\nUser's current question: {question}"

    try:
        result = generate_review(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_schema=ChatResponse
        )
        return {"response": result.response}
    except Exception as e:
        return {"error": f"Failed to generate chat response: {str(e)}"}
