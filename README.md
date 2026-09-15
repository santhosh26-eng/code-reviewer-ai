# AI Code Reviewer

## What it does
The AI Code Reviewer is an intelligent, automated platform that helps developers analyze and improve their code. You can paste code in over 26 languages (including Python, C, Verilog, VHDL, Go, Rust, and MATLAB), and the system will automatically detect the language, analyze its structure using the Model Context Protocol (MCP), and generate a detailed review. 

The review identifies bugs, security vulnerabilities, time/space complexity, and provides a refactored version of the code. The platform features a beautiful Streamlit-based workspace and is secured by Google OAuth JWT authentication.

## How to run it
The project is split into a FastAPI backend and a Streamlit frontend. You need to run both servers simultaneously.

**1. Start the Backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**2. Start the Frontend**
Open a new terminal window:
```bash
cd frontend
pip install -r requirements.txt
streamlit run app.py
```
*Once both servers are running, open `http://localhost:8501` in your browser and click "Sign in with Google" to access the workspace.*

## Which AI model is used and why
This project uses **Mistral** (`open-mistral-7b`) as the primary AI model, accessed through the **LiteLLM** abstraction layer. 

**Why Mistral?**
- **Speed & Efficiency**: Mistral 7B is highly optimized for fast inference, providing near-instantaneous code reviews without the latency overhead of massive models.
- **Cost-Effective**: Open-weights models like Mistral are extremely cost-effective for high-volume tasks like automated code scanning.
- **LiteLLM Abstraction**: By using LiteLLM, the platform isn't hardcoded to Mistral. It can be easily swapped out for OpenAI, Anthropic, or Google Gemini in the future with zero code changes, providing ultimate flexibility.

## What the env vars are
To run the application, you need to create a `.env` file in the `backend/` folder with the following variables:

```env
# AI Model Configuration
MISTRAL_API_KEY=your-mistral-api-key-here
MISTRAL_MODEL=mistral/open-mistral-7b

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/callback

# Security
JWT_SECRET=a-secure-random-string-for-session-tokens
FRONTEND_URL=http://localhost:8501
```
