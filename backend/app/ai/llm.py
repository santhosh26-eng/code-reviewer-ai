import os
from typing import Optional, Any
from dotenv import load_dotenv
import litellm

# Load environment variables
load_dotenv()

def generate_review(system_prompt: str, user_prompt: str, response_schema: Any) -> Any:
    """
    Calls the underlying LLM (via LiteLLM) to generate a structured review.
    Uses Google Gemini via litellm's generic interface.
    
    Args:
        system_prompt: The system instruction.
        user_prompt: The actual prompt containing code and review instructions.
        response_schema: The Pydantic model class to validate the output against.
        
    Returns:
        An instance of the response_schema with the parsed structured data.
    """
    api_key: Optional[str] = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY environment variable is required. "
            "Please ensure it is set in your .env file or environment."
        )
        
    model_name = os.getenv("GEMINI_MODEL", "gemini/gemini-3.6-flash")
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    try:
        # LiteLLM supports passing a Pydantic class to response_format
        response = litellm.completion(
            model=model_name,
            messages=messages,
            api_key=api_key,
            response_format=response_schema,
            temperature=0.2,
        )
        
        # Parse the JSON response text back into the Pydantic schema
        content = response.choices[0].message.content
        if not content:
            raise ValueError("No content returned from the model.")
            
        return response_schema.model_validate_json(content)
        
    except Exception as e:
        # Gracefully handle the error, allow upper layers to catch it
        raise RuntimeError(f"LiteLLM generation failed: {str(e)}")
