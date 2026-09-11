def analyze_code_structure(code: str, language: str) -> dict:
    """
    Performs static, deterministic analysis on the submitted code.
    Returns observations to guide the LLM contextually without executing the code.
    """
    if not code:
        return {}

    lines = code.split("\n")
    total_lines = len(lines)
    
    non_empty_lines = sum(1 for line in lines if line.strip())
    
    comment_count = 0
    function_count = 0
    class_count = 0
    
    # Very basic language-aware heuristics for static context
    lang_lower = language.lower() if language else "unknown"
    
    for line in lines:
        stripped = line.strip()
        
        # Python, Ruby, Bash style
        if lang_lower in ["python", "ruby", "bash", "shell", "powershell"]:
            if stripped.startswith("#"): comment_count += 1
            if stripped.startswith("def ") or stripped.startswith("def\t"): function_count += 1
            if stripped.startswith("class ") or stripped.startswith("class\t"): class_count += 1
            
        # C-family, JS, Java, Rust, Go style
        elif lang_lower in ["javascript", "typescript", "java", "c", "c++", "c#", "go", "rust"]:
            if stripped.startswith("//") or stripped.startswith("/*") or stripped.startswith("*"):
                comment_count += 1
            if "function " in stripped or stripped.startswith("func ") or stripped.startswith("fn "):
                function_count += 1
            if stripped.startswith("class "):
                class_count += 1
                
    observations = []
    if total_lines > 50:
        observations.append("Code is relatively long (over 50 lines).")
    if function_count == 0 and class_count == 0 and total_lines > 15:
        observations.append("Code is a continuous script lacking functional modularity.")
    if function_count > 5:
        observations.append("Code contains many functions, suggesting higher complexity.")
        
    return {
        "language": language,
        "total_lines": total_lines,
        "non_empty_lines": non_empty_lines,
        "function_count": function_count,
        "class_count": class_count,
        "comment_count": comment_count,
        "observations": observations
    }
