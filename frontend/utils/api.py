import os
import requests
from typing import Dict, Any, List

API_URL = os.getenv("API_URL", "http://localhost:8000")
TOKEN = "test_development_token"

import streamlit as st

def get_headers():
    token = st.session_state.token if "token" in st.session_state and st.session_state.token else TOKEN
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }

def submit_code_review(code: str, depth: str, language: str = "Auto-Detect") -> Dict[str, Any]:
    url = f"{API_URL}/api/review"
    payload = {"code": code, "depth": depth, "language": language}
    response = requests.post(url, json=payload, headers=get_headers())
    if not response.ok:
        raise Exception(f"Error {response.status_code}: {response.text}")
    return response.json()

def execute_code(code: str, language: str, test_cases: List[Dict[str, str]]) -> Dict[str, Any]:
    url = f"{API_URL}/api/execute"
    payload = {
        "code": code,
        "language": language,
        "test_cases": test_cases
    }
    response = requests.post(url, json=payload, headers=get_headers())
    if not response.ok:
        raise Exception(f"Error {response.status_code}: {response.text}")
    return response.json()

def send_chat_message(code: str, language: str, question: str, history: List[Dict[str, str]]) -> Dict[str, Any]:
    url = f"{API_URL}/api/chat"
    payload = {
        "code": code,
        "language": language,
        "question": question,
        "history": history
    }
    response = requests.post(url, json=payload, headers=get_headers())
    if not response.ok:
        raise Exception(f"Error {response.status_code}: {response.text}")
    return response.json()
