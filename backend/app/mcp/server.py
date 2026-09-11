from mcp.server.fastmcp import FastMCP
from app.mcp.tools import analyze_code_structure

# Initialize FastMCP server
mcp = FastMCP("CodeAnalysisServer")

@mcp.tool()
def analyze_code_tool(code: str, language: str) -> dict:
    """
    Analyzes code structure to return line counts, function counts, and heuristics.
    """
    return analyze_code_structure(code, language)
    
if __name__ == "__main__":
    # Provides standard stdio interface when run as a script
    mcp.run()
