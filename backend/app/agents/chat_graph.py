from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, START, END
from langgraph.graph.state import CompiledStateGraph

from app.agents.chat_nodes import generate_chat_response
from app.utils.validators import validate_code_input

class ChatState(TypedDict):
    code: str
    language: str
    history: List[Dict[str, str]]
    question: str
    
    response: Optional[str]
    error: Optional[str]

def build_chat_graph() -> CompiledStateGraph:
    workflow = StateGraph(ChatState)
    
    workflow.add_node("generate_chat_response", generate_chat_response)
    
    workflow.add_edge(START, "generate_chat_response")
    workflow.add_edge("generate_chat_response", END)
    
    return workflow.compile()

chat_graph = build_chat_graph()

def run_chat(code: str, language: str, history: List[Dict[str, str]], question: str) -> ChatState:
    # Basic validation (we allow empty code for chat if they just want to ask general questions, 
    # but the prompt requires it. Let's just limit the size).
    if len(code) > 10000:
        return {"error": "Code exceeds maximum allowed length."}
        
    initial_state: ChatState = {
        "code": code,
        "language": language,
        "history": history[-10:], # Keep only last 10 messages for bounded context
        "question": question,
        "response": None,
        "error": None
    }
    
    try:
        final_state = chat_graph.invoke(initial_state)
        return final_state
    except Exception as e:
        initial_state["error"] = f"An unexpected error occurred during chat: {str(e)}"
        return initial_state
