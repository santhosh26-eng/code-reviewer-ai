from typing import Dict, Any

from app.agents.review_graph import ReviewState
from app.utils.language_detector import detect_language
from app.ai.llm import generate_review
from app.ai.prompts import CodeReviewResult, REVIEWER_SYSTEM_PROMPT
from app.mcp.tools import analyze_code_structure

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
    provided_language = state.get("provided_language")
    
    # Handle empty, missing, or invalid code inputs safely
    if not code or not isinstance(code, str) or not code.strip():
        return {
            "detected_language": "Unknown",
            "language_confidence": 0.0,
            "error": "Unable to detect programming language"
        }
        
    # If the user explicitly provided a language (and it's not Auto-Detect), trust it
    if provided_language and provided_language != "Auto-Detect":
        return {
            "detected_language": provided_language,
            "language_confidence": 1.0
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

def run_mcp_analysis(state: ReviewState) -> Dict[str, Any]:
    """
    LangGraph node for running deterministic MCP static code analysis.
    
    Args:
        state (ReviewState): The current state.
        
    Returns:
        dict: The state updates containing static_analysis.
    """
    code = state.get("code", "")
    language = state.get("detected_language", "Unknown")
    
    try:
        # In-process call to our MCP tool for the MVP
        analysis = analyze_code_structure(code, language)
        return {"static_analysis": analysis}
    except Exception as e:
        # Provide safe error state without crashing
        return {"static_analysis": {"error": f"MCP static analysis failed to run: {str(e)}" }}

def review_code_with_gemini(state: ReviewState) -> Dict[str, Any]:
    """
    LangGraph node that acts as the core AI Code Reviewer.
    
    It constructs a comprehensive prompt combining the user's code, requested 
    review depth, and the pre-detected language. It then requests a structured 
    review from the LLM via LiteLLM.
    
    Args:
        state (ReviewState): The current state of the review workflow.
        
    Returns:
        dict: A dictionary containing the structured review state updates.
    """
    code = state.get("code", "")
    review_depth = state.get("review_depth", "Quick Scan")
    detected_language = state.get("detected_language", "Unknown")
    
    if not code or not code.strip():
        return {"error": "No code was provided for review."}

    # Construct the instruction set based on user's desired depth
    depth_instructions = ""
    if review_depth == "Quick Scan":
        depth_instructions = (
            "- Provide a concise explanation.\n"
            "- Highlight only the most important bugs.\n"
            "- Highlight only the most critical security issues.\n"
            "- Provide a practical, basic refactoring.\n"
            "- Keep complexity and readability assessments concise."
        )
    else:
        # Deep Review
        depth_instructions = (
            "- Provide a detailed, in-depth explanation.\n"
            "- Conduct a thorough bug analysis, catching edge cases.\n"
            "- Conduct a thorough security analysis.\n"
            "- Provide a comprehensive and heavily detailed refactored version.\n"
            "- Provide detailed and highly specific complexity and readability assessments."
        )

    prompt = f"""
Please analyze the following code.

Context:
- Detected Language (from initial heuristic): {detected_language}
- Requested Review Depth: {review_depth}

MCP Static Analysis Context (Deterministic data for your awareness, do not invent beyond this):
{state.get("static_analysis", "No static analysis available")}

Depth Instructions for {review_depth}:
{depth_instructions}

Code to Review:
```
{code}
```
"""

    try:
        # Calls the generic generate_review wrapper powered by LiteLLM
        review: CodeReviewResult = generate_review(
            system_prompt=REVIEWER_SYSTEM_PROMPT,
            user_prompt=prompt,
            response_schema=CodeReviewResult
        )

        # Format the output matching ReviewState fields exactly
        final_language = detected_language if detected_language != "Unknown" else review.detected_language
        return {
            "detected_language": final_language,
            "explanation": review.explanation,
            "bugs": [bug.model_dump() for bug in review.bugs],
            "security_issues": [issue.model_dump() for issue in review.security_issues],
            "refactored_code": review.refactored_code,
            "complexity": review.complexity.model_dump(),
            "readability": review.readability.model_dump()
        }
        
    except Exception as e:
        # Gracefully catch API/network/parsing errors and return the specific error
        return {
            "error": f"AI Reviewer failed: {str(e)}"
        }
