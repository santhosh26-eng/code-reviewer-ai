from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, START, END
from langgraph.graph.state import CompiledStateGraph

class ReviewState(TypedDict):
    """
    ReviewState stores information passed between the Code Reviewer LangGraph nodes.
    
    It serves as the central state object that is updated incrementally as the
    user's code traverses through different stages of the review workflow.
    Fields populated later in the pipeline are marked as Optional.
    """
    
    # Initial input data
    code: str
    review_depth: str
    provided_language: Optional[str]
    
    # Populated during the language detection phase
    detected_language: Optional[str]
    language_confidence: Optional[float]
    
    # Populated during the MCP analysis phase
    static_analysis: Optional[Dict[str, Any]]
    
    # Populated during the AI code review phase
    explanation: Optional[str]
    bugs: Optional[List[Dict[str, Any]]]
    security_issues: Optional[List[Dict[str, Any]]]
    refactored_code: Optional[str]
    complexity: Optional[Dict[str, Any]]
    readability: Optional[Dict[str, Any]]
    
    # Populated if an error occurs anywhere in the pipeline
    error: Optional[str]

# Import nodes after defining ReviewState to prevent circular import issues
from app.agents.review_nodes import detect_language_node, run_mcp_analysis, review_code_with_gemini
from app.utils.validators import validate_code_input

def build_review_graph() -> CompiledStateGraph:
    """
    Builds and compiles the Code Reviewer LangGraph workflow.
    
    Current workflow:
    START -> detect_language -> review_code_with_gemini -> END
    
    Returns:
        CompiledStateGraph: The compiled LangGraph workflow ready for execution.
    """
    # Create a StateGraph using ReviewState
    workflow = StateGraph(ReviewState)
    
    # Add nodes
    workflow.add_node("detect_language", detect_language_node)
    workflow.add_node("mcp_analysis", run_mcp_analysis)
    workflow.add_node("review_code_with_gemini", review_code_with_gemini)
    
    # Add edges
    workflow.add_edge(START, "detect_language")
    workflow.add_edge("detect_language", "mcp_analysis")
    workflow.add_edge("mcp_analysis", "review_code_with_gemini")
    workflow.add_edge("review_code_with_gemini", END)
    
    # Compile the graph
    return workflow.compile()

# The module-level compiled graph ready for import and execution
review_graph = build_review_graph()

def run_review(code: str, depth: str = "Quick Scan", provided_language: Optional[str] = None) -> ReviewState:
    """
    Validates the input code and executes the complete Code Reviewer workflow.
    
    Args:
        code (str): The code to review.
        depth (str): The review depth, e.g., "Quick Scan" or "Deep Review".
        provided_language (Optional[str]): The language if already detected or specified by the user.
        
    Returns:
        ReviewState: The final state containing the AI review output or any errors.
    """
    is_valid, error_msg = validate_code_input(code)
    
    initial_state: ReviewState = {
        "code": code,
        "review_depth": depth,
        "provided_language": provided_language,
        "detected_language": None,
        "language_confidence": None,
        "static_analysis": None,
        "explanation": None,
        "bugs": [],
        "security_issues": [],
        "refactored_code": None,
        "complexity": None,
        "readability": None,
        "error": None
    }
    
    if not is_valid:
        # Halt execution and return early if validation fails
        initial_state["error"] = error_msg
        return initial_state
        
    # Execute the workflow
    try:
        final_state = review_graph.invoke(initial_state)
        return final_state
    except Exception as e:
        initial_state["error"] = f"An unexpected error occurred during execution: {str(e)}"
        return initial_state
