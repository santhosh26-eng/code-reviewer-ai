import os
from typing import Optional
from dotenv import load_dotenv
from google import genai

# Load environment variables from the .env file
load_dotenv()

def get_gemini_client() -> genai.Client:
    """
    Creates and returns a reusable Google Gemini API client.
    
    Raises:
        ValueError: If GEMINI_API_KEY is not found in the environment variables.
        
    Returns:
        genai.Client: An initialized Gemini client.
    """
    api_key: Optional[str] = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY environment variable is required. "
            "Please ensure it is set in your .env file or environment."
        )
        
    # Initialize the client explicitly with the validated API key
    client = genai.Client(api_key=api_key)
    return client
