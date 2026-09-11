from typing import Dict, Any

def generate_markdown_report(review_result: Dict[str, Any]) -> str:
    """
    Converts a structured code review result dictionary into a 
    well-formatted Markdown document.
    """
    md = []
    
    # Title
    md.append("# Code Review Report\n")
    
    # Overview
    md.append("## Overview\n")
    language = review_result.get("language") or review_result.get("detected_language") or "Unknown"
    depth = review_result.get("depth", "Quick Scan")
    
    md.append(f"- **Detected Language:** {language}")
    md.append(f"- **Review Depth:** {depth}\n")
    
    # Explanation
    md.append("## Plain-English Explanation\n")
    explanation = review_result.get("explanation", "No explanation provided.")
    md.append(f"{explanation}\n")
    
    # Bugs
    md.append("## Bugs\n")
    bugs = review_result.get("bugs", [])
    if not bugs:
        md.append("No bugs were identified.\n")
    else:
        for i, bug in enumerate(bugs, 1):
            md.append(f"### Bug {i}: {bug.get('title', 'Unknown')}\n")
            line_ref = bug.get('line_reference')
            md.append(f"- **Line:** {line_ref if line_ref else 'N/A'}")
            md.append(f"- **Severity:** {bug.get('severity', 'Unknown')}")
            md.append(f"- **Description:** {bug.get('description', '')}\n")
            
    # Security Vulnerabilities
    md.append("## Security Vulnerabilities\n")
    security_issues = review_result.get("security_issues", [])
    if not security_issues:
        md.append("No security vulnerabilities were identified.\n")
    else:
        for i, issue in enumerate(security_issues, 1):
            md.append(f"### Security Issue {i}: {issue.get('title', 'Unknown')}\n")
            line_ref = issue.get('line_reference')
            md.append(f"- **Line:** {line_ref if line_ref else 'N/A'}")
            md.append(f"- **Severity:** {issue.get('severity', 'Unknown')}")
            md.append(f"- **Recommendation:** {issue.get('recommendation', '')}")
            md.append(f"- **Description:** {issue.get('description', '')}\n")
            
    # Refactored Code
    md.append("## Refactored Code\n")
    refactored_code = review_result.get("refactored_code", "")
    if refactored_code:
        # Determine language for syntax highlighting
        lang_syntax = language.lower() if language and language != "Unknown" else ""
        md.append(f"```{lang_syntax}\n{refactored_code}\n```\n")
    else:
        md.append("No refactored code provided.\n")
        
    # Complexity
    md.append("## Complexity\n")
    complexity = review_result.get("complexity", {})
    if complexity:
        md.append(f"- **Time Complexity:** {complexity.get('time_complexity', 'N/A')}")
        md.append(f"- **Space Complexity:** {complexity.get('space_complexity', 'N/A')}")
        md.append(f"- **Explanation:** {complexity.get('explanation', '')}\n")
    else:
        md.append("No complexity metrics provided.\n")
        
    # Readability
    md.append("## Readability\n")
    readability = review_result.get("readability", {})
    if readability:
        md.append(f"- **Score:** {readability.get('score', 'N/A')} / 10")
        md.append(f"- **Explanation:** {readability.get('explanation', '')}")
        suggestions = readability.get('suggestions', [])
        if suggestions:
            md.append("- **Suggestions:**")
            for suggestion in suggestions:
                md.append(f"  - {suggestion}")
        md.append("\n")
    else:
        md.append("No readability metrics provided.\n")
        
    return "\n".join(md)
