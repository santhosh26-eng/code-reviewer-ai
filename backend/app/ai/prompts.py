from typing import List, Optional
from pydantic import BaseModel, Field

class Bug(BaseModel):
    title: str = Field(..., description="A concise title for the bug.")
    description: str = Field(..., description="Detailed explanation of what the bug is and why it occurs.")
    line_reference: Optional[str] = Field(default=None, description="Specific line numbers or ranges where the bug exists.")
    severity: str = Field(..., description="Severity level of the bug (e.g., Low, Medium, High, Critical).")

class SecurityIssue(BaseModel):
    title: str = Field(..., description="A concise title for the security issue.")
    description: str = Field(..., description="Detailed explanation of the vulnerability and its potential impact.")
    line_reference: Optional[str] = Field(default=None, description="Specific line numbers or ranges where the issue exists.")
    severity: str = Field(..., description="Severity level of the security issue (e.g., Low, Medium, High, Critical).")
    recommendation: str = Field(..., description="Actionable advice on how to mitigate or fix the security issue.")

class Complexity(BaseModel):
    time_complexity: str = Field(..., description="The estimated time complexity (Big O notation) of the code.")
    space_complexity: str = Field(..., description="The estimated space complexity (Big O notation) of the code.")
    explanation: str = Field(..., description="Explanation of how the time and space complexities were derived.")

class Readability(BaseModel):
    score: int = Field(..., description="Readability score from 1 to 10 (10 being highly readable).")
    explanation: str = Field(..., description="Justification for the given readability score.")
    suggestions: List[str] = Field(default_factory=list, description="Actionable suggestions to improve code readability and maintainability.")

class CodeReviewResult(BaseModel):
    detected_language: str = Field(..., description="The programming language detected in the code snippet.")
    explanation: str = Field(..., description="A clear, high-level summary of what the code does.")
    bugs: List[Bug] = Field(default_factory=list, description="A list of functional bugs identified in the code. Empty if none found.")
    security_issues: List[SecurityIssue] = Field(default_factory=list, description="A list of security vulnerabilities identified. Empty if none found.")
    refactored_code: str = Field(..., description="An improved, refactored version of the supplied code addressing the identified issues.")
    complexity: Complexity = Field(..., description="Analysis of the code's time and space complexity.")
    readability: Readability = Field(..., description="Assessment of the code's readability and style.")

REVIEWER_SYSTEM_PROMPT = """You are a senior software developer acting as an expert code reviewer.
Your task is to analyze the provided code snippet and return a comprehensive, structured review.

Follow these rules strictly:
1. Analyze only the supplied code. Do not make assumptions about external systems or missing context.
2. Explain technical issues clearly, professionally, and concisely.
3. Provide specific line references when possible for any bugs or security issues you identify.
4. Clearly distinguish between functional bugs (logic errors) and security issues (vulnerabilities).
5. Provide a fully refactored, improved version of the code that incorporates fixes for bugs/security issues and enhances readability.
6. Assess both time complexity and space complexity accurately using Big O notation.
7. Assess code readability fairly and provide actionable suggestions for improvement.
8. Never invent vulnerabilities or hallucinate bugs. If none are found, return empty lists for those fields.
9. You must return all information exactly according to the requested structured schema.
"""
