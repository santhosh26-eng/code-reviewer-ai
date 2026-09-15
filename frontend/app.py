import streamlit as st
import json
import re
from dotenv import load_dotenv
from utils.api import submit_code_review, execute_code, send_chat_message
from code_editor import code_editor

load_dotenv()

st.set_page_config(page_title="AI Code Reviewer", page_icon="✨", layout="wide")

# Custom CSS for styling
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@400;700&display=swap');

    /* Premium Cyber Dark Background */
    .stApp {
        background: radial-gradient(circle at 10% 20%, rgb(14, 21, 38) 0%, rgb(8, 12, 23) 90%);
        color: #e2e8f0;
        font-family: 'Inter', sans-serif;
    }
    
    /* Top padding */
    .st-emotion-cache-16txtl3 {
        padding-top: 1.5rem;
    }

    /* Glassmorphism for chat messages */
    .stChatMessage {
        background-color: rgba(30, 41, 59, 0.4);
        border-radius: 12px;
        padding: 15px;
        margin-bottom: 12px;
        border: 1px solid rgba(148, 163, 184, 0.1);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        color: #f8fafc;
    }
    
    /* Vibrant Headers */
    h1, h2, h3, h4, h5, h6 {
        color: #f8fafc !important;
        font-weight: 800 !important;
        letter-spacing: -0.5px;
    }
    .stMarkdown p {
        color: #cbd5e1 !important;
    }
    
    /* Dynamic Buttons with Neon Hover Effects */
    .stButton>button {
        border-radius: 8px !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        font-weight: 600 !important;
        background-color: rgba(30, 41, 59, 0.6);
        color: #f1f5f9;
        border: 1px solid rgba(148, 163, 184, 0.2);
        backdrop-filter: blur(8px);
    }
    
    /* Primary Action Button (AI Review) */
    .stButton>button[kind="primary"] {
        background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
        border: none;
        color: white;
        box-shadow: 0 0 15px rgba(168, 85, 247, 0.3);
    }
    
    .stButton>button:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 8px 25px rgba(6, 182, 212, 0.2); /* Cyan Glow */
        border-color: #06b6d4;
        color: #06b6d4;
    }
    
    .stButton>button[kind="primary"]:hover {
        box-shadow: 0 8px 25px rgba(168, 85, 247, 0.5); /* Purple Glow */
        color: white;
    }
    
    /* Refined Tabs */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }
    .stTabs [data-baseweb="tab"] {
        border-radius: 8px 8px 0 0;
        background-color: rgba(30, 41, 59, 0.3);
        padding: 10px 20px;
        transition: all 0.2s ease;
        color: #94a3b8;
        border: 1px solid transparent;
        border-bottom: none;
    }
    .stTabs [data-baseweb="tab"]:hover {
        background-color: rgba(30, 41, 59, 0.8);
        color: #e2e8f0;
    }
    .stTabs [aria-selected="true"] {
        background-color: rgba(30, 41, 59, 0.8) !important;
        border: 1px solid rgba(148, 163, 184, 0.1) !important;
        border-bottom: 3px solid #06b6d4 !important; /* Electric Cyan accent */
        color: #06b6d4 !important;
    }
    
    /* Input Fields and Select Boxes */
    .stSelectbox>div>div, .stTextInput>div>div {
        background-color: rgba(30, 41, 59, 0.5);
        border: 1px solid rgba(148, 163, 184, 0.2);
        color: #f1f5f9;
        border-radius: 6px;
    }
    
    /* Code styling in Markdown */
    code {
        font-family: 'JetBrains Mono', monospace !important;
        background-color: rgba(15, 23, 42, 0.6) !important;
        color: #38bdf8 !important; /* Sky blue code */
        padding: 2px 6px !important;
        border-radius: 4px !important;
        border: 1px solid rgba(148, 163, 184, 0.1);
    }
</style>
""", unsafe_allow_html=True)

# Token Handling
if "token" not in st.session_state:
    if "token" in st.query_params:
        st.session_state.token = st.query_params["token"]
        st.query_params.clear()
    else:
        st.session_state.token = None

if not st.session_state.token:
    st.title("✨ AI Code Reviewer")
    st.markdown("### Welcome! Please sign in to continue.")
    
    st.markdown(
        """
        <div style="display: flex; justify-content: center; margin-top: 50px;">
            <a href="http://localhost:8000/api/auth/login" target="_self">
                <button style="padding: 12px 24px; background-color: #4285F4; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                    Sign in with Google
                </button>
            </a>
        </div>
        """,
        unsafe_allow_html=True
    )
    st.stop()

# Logout Sidebar
with st.sidebar:
    st.markdown("### Profile")
    if st.button("Sign Out", use_container_width=True):
        st.session_state.token = None
        st.rerun()

# Advanced Helper to detect language automatically using regex heuristics
def detect_language(code: str) -> str:
    if not code or not code.strip():
        return "python"
        
    LANGUAGE_SIGNATURES = {
        "c_cpp": [r"\bvoid\s+setup\s*\(", r"\bvoid\s+loop\s*\(", r"\bdigitalWrite\s*\(", r"\bpinMode\s*\(", r"\bvolatile\s+", r"\bISR\s*\(", r"\bPORT[A-Z]\s*=", r"\b_BV\s*\(", r"#include\s*<.*>", r"\bint\s+main\s*\(", r"\bstd::cout", r"\bprintf\s*\("],
        "java": [r"\bpublic\s+class\s+", r"\bSystem\.out\.println", r"\bpublic\s+static\s+void\s+main"],
        "csharp": [r"\busing\s+System;", r"\bConsole\.WriteLine", r"\bnamespace\s+[a-zA-Z0-9_]+"],
        "python": [r"\bdef\s+[a-zA-Z0-9_]+", r"\bimport\s+[a-zA-Z0-9_]+", r"^\s*print\(", r"\bclass\s+[a-zA-Z0-9_]+.*:"],
        "javascript": [r"\bconsole\.log\(", r"\bconst\s+[a-zA-Z0-9_]+", r"\blet\s+[a-zA-Z0-9_]+", r"\bfunction\s+[a-zA-Z0-9_]+"],
        "golang": [r"\bfunc\s+[a-zA-Z0-9_]+", r"\bpackage\s+main\b", r"\bfmt\.Println"],
        "rust": [r"\bfn\s+[a-zA-Z0-9_]+", r"\bprintln!\s*\(", r"\bmut\s+[a-zA-Z0-9_]+"],
        "php": [r"<\?php", r"\$\w+\s*=", r"\becho\s+.*?;"],
        "ruby": [r"\bdef\s+[a-zA-Z0-9_]+", r"\bputs\s+", r"\byield\b"],
        "kotlin": [r"\bfun\s+[a-zA-Z0-9_]+", r"\bprintln\(", r"\bval\s+[a-zA-Z0-9_]+"],
        "swift": [r"\bfunc\s+[a-zA-Z0-9_]+", r"\blet\s+[a-zA-Z0-9_]+", r"\bvar\s+[a-zA-Z0-9_]+"],
        "dart": [r"\bvoid\s+main\s*\(", r"\bprint\(", r"\bimport\s+'package:"],
        "r": [r"<-\s*", r"\blibrary\s*\(", r"\binstall\.packages\s*\("],
        "matlab": [r"\bfunction\s+\[?.*\]?\s*=\s*[a-zA-Z0-9_]+", r"\bdisp\s*\(", r"^\s*%.*$", r"\bplot\s*\(", r"=\s*\d+(:[\d.]+)+"],
        "verilog": [r"\balways_ff\b", r"\balways_comb\b", r"\blogic\b\s+", r"\bmodule\s+[a-zA-Z0-9_]+", r"\balways\s*@", r"\bendmodule\b"],
        "vhdl": [r"(?i)\bentity\s+[a-zA-Z0-9_]+\s+is", r"(?i)\barchitecture\s+[a-zA-Z0-9_]+\s+of", r"(?i)\bsignal\s+[a-zA-Z0-9_]+.*:"],
        "assembly_x86": [r"\bmov\s+[a-zA-Z0-9_]+,\s*[a-zA-Z0-9_]+", r"\bpush\s+[a-zA-Z0-9_]+", r"\bjmp\s+[a-zA-Z0-9_]+"],
        "sql": [r"(?i)\bSELECT\b.*\bFROM\b", r"(?i)\bUPDATE\b.*\bSET\b", r"(?i)\bINSERT\s+INTO\b"],
        "sh": [r"^#!/bin/bash", r"^#!/bin/sh", r"\becho\s+"],
        "powershell": [r"\bWrite-Host\b", r"\bGet-[A-Z][a-zA-Z]+", r"\bSet-[A-Z][a-zA-Z]+"],
        "html": [r"<!DOCTYPE html>", r"<html>", r"<head>", r"<body>", r"<div\b"],
        "css": [r"\bmargin:\s*", r"\bpadding:\s*", r"\bcolor:\s*#"],
        "pascal": [r"\bPROGRAM\s+[a-zA-Z0-9_]+", r"\bEND_PROGRAM\b", r"\bVAR\b", r"\bEND_VAR\b", r":=\s*"]
    }
    
    best_match = "python"
    highest_score = 0
    
    for language, patterns in LANGUAGE_SIGNATURES.items():
        score = 0
        for pattern in patterns:
            if re.search(pattern, code, re.MULTILINE):
                score += 1
                
        if score > highest_score:
            highest_score = score
            best_match = language
            
    return best_match

# Initialize Session State
if "code" not in st.session_state:
    st.session_state.code = "def two_sum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i + 1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []\n"
if "language_preference" not in st.session_state:
    st.session_state.language_preference = "Auto-Detect"
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []
if "test_cases" not in st.session_state:
    st.session_state.test_cases = [
        {"input": "nums=[2,7,11,15], target=9", "expected_output": "[0,1]"},
        {"input": "nums=[3,2,4], target=6", "expected_output": "[1,2]"}
    ]
if "execution_result" not in st.session_state:
    st.session_state.execution_result = None
if "review_result" not in st.session_state:
    st.session_state.review_result = None

# Header
st.title("✨ AI Code Reviewer")
st.markdown("An AI-powered workspace for code review, execution, and chat.")

# Main Layout
col1, col2 = st.columns([1, 2], gap="large")

with col1:
    st.subheader("💬 AI Assistant")
    
    # Chat display
    chat_container = st.container(height=500)
    with chat_container:
        if not st.session_state.chat_history:
            st.info("Ask anything about your code! (e.g., 'What is the time complexity?')")
        for msg in st.session_state.chat_history:
            with st.chat_message(msg["role"]):
                st.write(msg["content"])
                
    # Chat input
    if prompt := st.chat_input("Ask about your code..."):
        st.session_state.chat_history.append({"role": "user", "content": prompt})
        with st.spinner("Assistant is thinking..."):
            try:
                res = send_chat_message(
                    code=st.session_state.code,
                    language=st.session_state.language_preference, # Pass preference directly to backend
                    question=prompt,
                    history=st.session_state.chat_history[:-1]
                )
                st.session_state.chat_history.append({"role": "assistant", "content": res["content"]})
            except Exception as e:
                st.error(f"Failed to get response: {str(e)}")
        st.rerun()

with col2:
    controls_container = st.container()
    editor_container = st.container()
    
    # Determine active language
    if st.session_state.language_preference == "Auto-Detect":
        active_language = detect_language(st.session_state.code)
    else:
        active_language = st.session_state.language_preference

    # Process editor FIRST logically to update session state before buttons
    with editor_container:
        st.caption(f"ℹ️ **Tip:** Press `Ctrl+Enter` inside the editor or click the `Save/Run` button inside the editor to apply your code changes before clicking AI Review or Run Code. *(Detected Language: {active_language})*")
        editor_dict = code_editor(st.session_state.code, lang=active_language, theme="dark", height="400px")
        
        # The editor component returns {"text": ""} on the very first render before it mounts.
        # We must prevent overwriting our default code with empty string.
        if editor_dict.get('text') and editor_dict['text'] != st.session_state.code:
            st.session_state.code = editor_dict['text']

    with controls_container:
        # Controls
        ctrl_col1, ctrl_col2, ctrl_col3 = st.columns([2, 1, 1])
        
        with ctrl_col1:
            st.session_state.language_preference = st.selectbox(
                "Language", 
                ["Auto-Detect", "python", "javascript", "typescript", "c", "cpp", "java", "matlab", "verilog"], 
                index=["Auto-Detect", "python", "javascript", "typescript", "c", "cpp", "java", "matlab", "verilog"].index(st.session_state.language_preference) if st.session_state.language_preference in ["Auto-Detect", "python", "javascript", "typescript", "c", "cpp", "java", "matlab", "verilog"] else 0
            )
        with ctrl_col2:
            depth = st.selectbox("Review Depth", ["quick", "deep"])
        with ctrl_col3:
            st.write("") # Spacing
            st.write("") # Spacing
            if st.button("🚀 AI Review", use_container_width=True, type="primary"):
                with st.spinner("Running AI Review..."):
                    try:
                        res = submit_code_review(st.session_state.code, depth, st.session_state.language_preference)
                        st.session_state.review_result = res
                    except Exception as e:
                        err_str = str(e)
                        if "{" in err_str:
                            try:
                                # Try to parse the FastAPI JSON error response
                                err_json = json.loads(err_str.split("{", 1)[1].strip())
                                # Wrap it back into {} so json.loads works
                                err_json = json.loads("{" + err_str.split("{", 1)[1])
                                err_str = err_json.get("detail", err_str)
                            except:
                                pass
                        st.warning(f"⚠️ {err_str}")
        
    st.divider()

    # Tabs for Execution and Review Results
    tab_tests, tab_exec_res, tab_review = st.tabs(["📝 Test Cases", "⚙️ Execution Results", "✨ AI Review"])
    
    with tab_tests:
        st.subheader("Test Cases")
        
        # Display existing test cases
        updated_cases = []
        for i, tc in enumerate(st.session_state.test_cases):
            tc_col1, tc_col2, tc_col3 = st.columns([3, 3, 1])
            with tc_col1:
                tc_input = st.text_input(f"Input {i+1}", value=tc["input"], key=f"in_{i}")
            with tc_col2:
                tc_expected = st.text_input(f"Expected {i+1}", value=tc["expected_output"], key=f"out_{i}")
            with tc_col3:
                st.write("")
                st.write("")
                if st.button("🗑️", key=f"del_{i}"):
                    continue # Skip adding to updated_cases
            updated_cases.append({"input": tc_input, "expected_output": tc_expected})
            
        st.session_state.test_cases = updated_cases
        
        btn_col1, btn_col2 = st.columns(2)
        with btn_col1:
            if st.button("➕ Add Test Case"):
                if len(st.session_state.test_cases) < 10:
                    st.session_state.test_cases.append({"input": "", "expected_output": ""})
                    st.rerun()
        with btn_col2:
            if st.button("▶️ Run Code", type="primary", use_container_width=True):
                with st.spinner(f"Executing {active_language} code..."):
                    try:
                        res = execute_code(st.session_state.code, st.session_state.language_preference, st.session_state.test_cases)
                        st.session_state.execution_result = res
                    except Exception as e:
                        st.error(f"Execution failed: {str(e)}")

    with tab_exec_res:
        if st.session_state.execution_result:
            res = st.session_state.execution_result
            if res.get("status") == "completed":
                summary = res.get("summary", {})
                st.success(f"Execution Completed: {summary.get('passed')} / {summary.get('total')} Passed")
                for tc in res.get("results", []):
                    passed = tc.get("status") == "passed"
                    with st.expander(f"Test Case {tc.get('test_case')} - {'✅ Passed' if passed else '❌ Failed'}", expanded=not passed):
                        st.markdown(f"**Input:** `{tc.get('input')}`")
                        st.markdown(f"**Expected:** `{tc.get('expected_output')}`")
                        if tc.get('actual_output'):
                            st.markdown(f"**Actual:** `{tc.get('actual_output')}`")
                        if tc.get('error'):
                            st.error(f"Error: {tc.get('error')}")
            else:
                st.error(f"Execution failed with status: {res.get('status')}")
                if res.get("results") and res["results"][0].get("error"):
                    st.code(res["results"][0]["error"])
        else:
            st.info("Run your code to see execution results.")

    with tab_review:
        if st.session_state.review_result:
            res = st.session_state.review_result
            if res.get("success"):
                st.download_button(
                    label="📥 Download Full Review (Markdown)",
                    data=res.get("markdown_report", "No report generated."),
                    file_name="ai_code_review.md",
                    mime="text/markdown",
                    type="secondary"
                )
                
                st.markdown(res.get("markdown_report", "No report generated."))
                
                st.divider()
                st.subheader("Side-by-Side Comparison")
                comp_col1, comp_col2 = st.columns(2)
                with comp_col1:
                    st.markdown("**Original Code**")
                    st.code(st.session_state.code, language=active_language)
                with comp_col2:
                    st.markdown("**Refactored Code**")
                    st.code(res.get("refactored_code", "No refactored code provided."), language=active_language)
            else:
                st.error(f"Review failed: {res.get('error')}")
        else:
            st.info("Click 'AI Review' to analyze your code.")
