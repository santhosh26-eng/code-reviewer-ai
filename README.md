# Code Reviewer and Explainer

An AI-powered code review tool that uses LangGraph, LangChain, LiteLLM, and Google Gemini to perform structured, multi-stage code analysis — with a Next.js + Clerk-authenticated frontend.

---

## Architecture

```
Code Reviewer and Explainer
│
├── backend/
│   └── FastAPI + LangGraph + LangChain + LiteLLM + Gemini + MCP
│
└── frontend/
    └── Streamlit + Python
```

### How it works

1. The **frontend** (Streamlit) sends requests to the FastAPI backend.
2. The **backend** runs a LangGraph pipeline:
   - **Language Detection** — heuristic regex classifier
   - **MCP Static Analysis** — deterministic code structure analysis
   - **AI Review** — structured review via LiteLLM → Gemini
3. The **backend** provides an Execution Service via `DockerSandboxExecutor`:
   - Runs code in isolated Docker containers with `--network none`, strict memory, and read-only limits.
   - Parses output to determine test case success/failure.
4. The **backend** provides an AI Chat Service via LangGraph state machines (`chat_graph.py`).
5. Results are returned as structured JSON to the Next.js UI.

---

## Project Structure

```
PROJECT_ROOT/
├── backend/
│   ├── app/
│   │   ├── agents/          # LangGraph workflow (graph + nodes)
│   │   ├── ai/              # LiteLLM client + Pydantic prompts
│   │   ├── analyzers/       # (reserved for future analyzers)
│   │   ├── api/             # FastAPI routers
│   │   ├── core/            # Auth (Clerk JWT verification)
│   │   ├── mcp/             # MCP static analysis server + tools
│   │   ├── services/        # Markdown report generation
│   │   └── utils/           # Language detector, validators
│   ├── tests/               # Pytest test suite
│   ├── test_language_detector.py
│   ├── test_mcp.py
│   ├── .env                 # Backend secrets (NOT committed)
│   ├── .env.example         # Backend env template
│   └── requirements.txt
│
├── frontend/
│   ├── app.py               # Streamlit application entry point
│   ├── utils/               # API clients
│   ├── .env                 # Frontend env configuration
│   └── requirements.txt     # Frontend Python dependencies
│
├── docs/
├── CONTRIBUTING.md
├── README.md
└── .gitignore
```

---

## Local Development Setup

### Prerequisites

- Python 3.11+
- A Google Gemini API key

---

### Backend

```bash
cd backend

# 1. Create and activate a virtual environment (from project root or backend/)
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment variables
cp .env.example .env
# Edit .env and fill in your GEMINI_API_KEY, CLERK_SECRET_KEY, etc.

# 4. Start the API server
uvicorn app.main:app --reload
```

The API will be available at: **http://localhost:8000**

- Swagger UI: http://localhost:8000/docs
- Health check: http://localhost:8000/health

---

### Frontend

```bash
cd frontend

# 1. Create and activate a virtual environment (optional but recommended)
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment variables (ensure API_URL points to the backend)
# edit .env

# 4. Start the Streamlit app
streamlit run app.py
```

The frontend will be available at: **http://localhost:8501**

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_MODEL` | LiteLLM model string (e.g. `gemini/gemini-2.5-flash`) |
| `CLERK_SECRET_KEY` | Clerk secret key for server-side use |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_ISSUER_URL` | Clerk JWT issuer URL (e.g. `https://your-app.clerk.accounts.dev`) |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `API_URL` | Backend API base URL (e.g. `http://localhost:8000`) |

---

## Running Tests

```bash
cd backend
python -m pytest tests/ -v
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.
