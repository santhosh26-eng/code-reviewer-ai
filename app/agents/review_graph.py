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
    
    # Populated during the language detection phase
    detected_language: Optional[str]
    language_confidence: Optional[float]
    
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
from app.agents.review_nodes import detect_language_node

def build_review_graph() -> CompiledStateGraph:
    """
    Builds and compiles the Code Reviewer LangGraph workflow.
    
    Current workflow:
    START -> detect_language -> END
    
    Returns:
        CompiledStateGraph: The compiled LangGraph workflow ready for execution.
    """
    # Create a StateGraph using ReviewState
    workflow = StateGraph(ReviewState)
    
    # Add nodes
    workflow.add_node("detect_language", detect_language_node)
    
    # Add edges
    workflow.add_edge(START, "detect_language")
    workflow.add_edge("detect_language", END)
    
    # Compile the graph
    return workflow.compile()

# The module-level compiled graph ready for import and execution
review_graph = build_review_graph()
