from typing import Dict, Any

from app.agents.review_graph import ReviewState
from app.utils.language_detector import detect_language

def detect_language_node(state: ReviewState) -> Dict[str, Any]:
    """
    LangGraph node for detecting the programming language of the provided code.
    
    Reads the 'code' snippet from the current state, processes it using 
    the local heuristic language detector, and computes a confidence score.
    
    Args:
        state (ReviewState): The current state of the review workflow.
        
    Returns:
        dict: A dictionary containing the state updates (detected_language, 
              language_confidence, and optionally error).
    """
    code = state.get("code")
    
    # Handle empty, missing, or invalid code inputs safely
    if not code or not isinstance(code, str) or not code.strip():
        return {
            "detected_language": "Unknown",
            "language_confidence": 0.0,
            "error": "Unable to detect programming language"
        }
        
    try:
        language = detect_language(code)
        
        # Calculate a simple confidence value based on detection success
        if language == "Unknown":
            confidence = 0.0
        else:
            confidence = 1.0
            
        return {
            "detected_language": language,
            "language_confidence": confidence
        }
        
    except Exception:
        # Prevent crashes from unexpected errors during detection
        return {
            "detected_language": "Unknown",
            "language_confidence": 0.0,
            "error": "Unable to detect programming language"
        }
