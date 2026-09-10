import os
import sys

# Ensure we can import the app module from the project root
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.mcp.tools import analyze_code_structure

def test_analyze_code_structure():
    code = "def divide(a, b):\n    return a / b"
    language = "Python"
    
    result = analyze_code_structure(code, language)
    
    print("MCP Analysis Result:")
    import pprint
    pprint.pprint(result)
    
    assert result["language"] == "Python"
    assert result["total_lines"] == 2
    assert result["function_count"] == 1
    
    print("Direct MCP Tool Test passed!")

if __name__ == "__main__":
    test_analyze_code_structure()
