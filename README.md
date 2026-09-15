# AI Code Reviewer

![Architecture](docs/architecture.md)

## What it does
The AI Code Reviewer is an intelligent, automated platform that helps developers analyze, execute, and improve their code. **You can paste code to be AI-reviewed in over 26+ languages** (including Python, C, Java, Go, Rust, MATLAB, and Verilog). Additionally, the platform features a Sandboxed Execution Engine to **securely compile and run** your C, C++, Java, and Python code directly in the browser.

The platform features a beautiful Streamlit-based workspace (with dynamic **Cyber Dark** and **Premium Light** modes) and is secured by Google OAuth JWT authentication. 

### Key Features
1. **AI Review Engine**: Identifies bugs, security vulnerabilities, time/space complexity, and provides refactored code.
2. **Universal Execution Engine**: Securely compiles and executes user code (C, C++, Java, Python) against test cases using locked-down Docker containers and a standard STDIN/STDOUT competitive programming architecture.
3. **Resilient AI Pipeline**: Uses Mistral as the primary model, with an automatic fallback to Google Gemini if rate-limited.

---

## Extensive Documentation
We have a comprehensive `docs/` folder to help you understand every aspect of the system:
- 🏗️ [**Architecture Overview**](docs/architecture.md): Visual diagrams of the entire system.
- 🚀 [**Local Setup Guide**](docs/setup.md): Detailed instructions on running the servers locally.
- ⚙️ [**Execution Engine & Testing**](docs/testing.md): How the Docker Sandboxing securely runs C, C++, Java, and Python code.
- 🔌 [**API Documentation**](docs/api.md): Endpoints for Auth, Review, and Execution.
- 🎨 [**Frontend Architecture**](docs/frontend.md): Details on the Streamlit UI and Theming engine.
- 🔀 [**Git Workflow**](docs/git-workflow.md): Branching strategies and conventional commit guidelines for contributing.
- 🔄 [**OAuth & Execution Flows**](docs/oauth-flow.md): Sequence diagrams illustrating complex data flows.

---

## How to run it
*(For a more detailed breakdown, see the [Local Setup Guide](docs/setup.md))*

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
*Once both servers are running, open `http://localhost:8501` in your browser and click "Sign in with Google".*

---

## Which AI model is used and why?
This project uses **Mistral** (`open-mistral-7b`) as the *default* AI model, accessed through the **LiteLLM** abstraction layer, with **Google Gemini** (`gemini/gemini-1.5-pro-latest`) acting as a seamless fallback.

**Why Mistral 7B as the default?**
The choice of an open-weights 7B model is a deliberate engineering tradeoff optimizing for **speed, cost-efficiency, and low latency**. For high-volume automated code scanning, Mistral provides near-instantaneous feedback without the massive API costs associated with frontier models.

**Enterprise Scalability (LiteLLM)**
Because the entire AI pipeline is abstracted behind **LiteLLM**, the system is *not* hardcoded to Mistral. For enterprise deployments where nuanced reasoning is prioritized over cost, **the platform natively supports GPT-4, Claude 3.5 Sonnet, and Gemini 1.5 Pro**. You simply change the `MISTRAL_MODEL` environment variable to `gpt-4o` or `claude-3-5-sonnet-20240620`—requiring zero code changes to the underlying architecture.

---

## What the env vars are
To run the application, you need to create a `.env` file in the `backend/` folder. Here are the core variables:

```env
# AI Model Configuration
MISTRAL_API_KEY=your-mistral-api-key-here
MISTRAL_MODEL=mistral/open-mistral-7b
GEMINI_API_KEY=your-google-gemini-key-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/callback

# Security & Execution
JWT_SECRET=a-secure-random-string-for-session-tokens
FRONTEND_URL=http://localhost:8501
EXECUTION_SANDBOX=docker # Use 'docker' for true execution, or 'mock' to fake it locally
```
