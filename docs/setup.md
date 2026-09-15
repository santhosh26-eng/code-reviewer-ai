# Local Development Setup Guide

Follow this guide to get the Code Reviewer AI running on your local machine.

## Prerequisites
- Python 3.11+
- Node.js (Optional, for frontend linting)
- **Docker Desktop** (Highly recommended for executing C, C++, and Java test cases securely).

## 1. Environment Variables

Create two separate `.env` files, one in the `backend/` directory and one in the `frontend/` directory.

### `backend/.env`
```env
# AI Model Configuration
MISTRAL_API_KEY=your_mistral_api_key_here

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/callback

# Security
JWT_SECRET=super_secret_key_change_in_production
FRONTEND_URL=http://localhost:8501

# Execution Engine
EXECUTION_ENABLED=true
# Set to 'docker' for true isolated execution, or 'mock' for local evaluation/bypassing
EXECUTION_SANDBOX=docker
```

### `frontend/.env`
```env
# Backend API Base URL
BACKEND_URL=http://localhost:8000
```

## 2. Starting the Backend (FastAPI)
Open a terminal and navigate to the backend directory:
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
The backend will run on `http://localhost:8000`.

## 3. Starting the Frontend (Streamlit)
Open a completely separate terminal and navigate to the frontend directory:
```bash
cd frontend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
streamlit run app.py
```
The frontend will open automatically in your browser at `http://localhost:8501`.
