import re

def validate_code_input(code: str) -> tuple[bool, str]:
    """
    Validates whether the user input appears to be programming code.
    
    This function uses fast, lightweight heuristics to reject empty input 
    and obvious natural language paragraphs without being overly strict 
    about specific language syntax (like requiring braces or semicolons).
    
    Args:
        code (str): The text submitted for review.
        
    Returns:
        tuple[bool, str]: A tuple containing a boolean indicating validity, 
                          and a human-readable error message if invalid.
    """
    code = code.strip()
    
    if not code:
        return False, "Code input cannot be empty or just whitespace."

    # Common programming symbols that rarely appear densely in natural language
    code_symbols = {'=', '{', '}', '[', ']', '(', ')', ';', '<', '>', '_', '+', '*', '/', '\\', '@', '#', '$'}
    
    symbol_count = sum(1 for char in code if char in code_symbols)
    
    # Strong keywords indicating code or configuration
    strong_keywords = {
        'def ', 'function ', 'class ', 'import ', 'export ', 'const ', 'let ', 
        'var ', 'public ', 'private ', 'void ', 'FROM ', 'RUN ', 'SELECT '
    }
    has_strong_keyword = any(kw in code for kw in strong_keywords)
    
    # Check for meaningful indentation (spaces or tabs at the start of a line)
    has_indentation = bool(re.search(r'^[ \t]+[^\s]', code, re.MULTILINE))
    
    # If it has clear code indicators, accept it immediately
    if has_strong_keyword or has_indentation or symbol_count >= 2:
        return True, ""
        
    # Check if it looks like a normal English sentence or paragraph
    words = code.split()
    
    if len(words) > 5 and symbol_count == 0:
        # Plain text sentences usually end with punctuation
        if code.endswith('.') or code.endswith('?') or code.endswith('!'):
            return False, "Input appears to be a plain text sentence rather than programming code."
            
    # Very long text with practically no programming symbols is likely not code
    if len(code) > 100 and symbol_count < 2:
        return False, "Input appears to be a plain text paragraph. Please submit valid programming code."
        
    # When in doubt, default to accepting the input
    return True, ""
