import re
from typing import Dict, List

# A modular dictionary mapping language names to their distinct regex signatures.
# This list provides a fast first-pass heuristic and can be easily extended.
# Order matters slightly for ties (e.g., Arduino C/C++ is checked before generic C/C++).
LANGUAGE_SIGNATURES: Dict[str, List[str]] = {
    "Arduino C/C++": [r"\bvoid\s+setup\s*\(", r"\bvoid\s+loop\s*\(", r"\bdigitalWrite\s*\(", r"\bpinMode\s*\("],
    "Embedded C": [r"\bvolatile\s+", r"\bISR\s*\(", r"\bPORT[A-Z]\s*=", r"\b_BV\s*\("],
    "C/C++": [r"#include\s*<.*>", r"\bint\s+main\s*\(", r"\bstd::cout", r"\bprintf\s*\("],
    "Java": [r"\bpublic\s+class\s+", r"\bSystem\.out\.println", r"\bpublic\s+static\s+void\s+main"],
    "C#": [r"\busing\s+System;", r"\bConsole\.WriteLine", r"\bnamespace\s+[a-zA-Z_]"],
    "Python": [r"\bdef\s+[a-zA-Z_]", r"\bimport\s+[a-zA-Z_]", r"^\s*print\(", r"\bclass\s+[a-zA-Z_].*:"],
    "JavaScript/TypeScript": [r"\bconsole\.log\(", r"\bconst\s+[a-zA-Z_]", r"\blet\s+[a-zA-Z_]", r"\bfunction\s+[a-zA-Z_]"],
    "Go": [r"\bfunc\s+[a-zA-Z_]", r"\bpackage\s+main\b", r"\bfmt\.Println"],
    "Rust": [r"\bfn\s+[a-zA-Z_]", r"\bprintln!\s*\(", r"\bmut\s+[a-zA-Z_]"],
    "PHP": [r"<\?php", r"\$\w+\s*=", r"\becho\s+.*?;"],
    "Ruby": [r"\bdef\s+[a-zA-Z_]", r"\bputs\s+", r"\byield\b"],
    "Kotlin": [r"\bfun\s+[a-zA-Z_]", r"\bprintln\(", r"\bval\s+[a-zA-Z_]"],
    "Swift": [r"\bfunc\s+[a-zA-Z_]", r"\blet\s+[a-zA-Z_]", r"\bvar\s+[a-zA-Z_]"],
    "Dart": [r"\bvoid\s+main\s*\(", r"\bprint\(", r"\bimport\s+'package:"],
    "R": [r"<-\s*", r"\blibrary\s*\(", r"\binstall\.packages\s*\("],
    "MATLAB": [r"\bfunction\s+\[?.*\]?\s*=\s*[a-zA-Z_]", r"\bdisp\s*\(", r"^\s*%.*$", r"\bplot\s*\(", r"=\s*\d+(:[\d.]+)+"],
    "SystemVerilog": [r"\balways_ff\b", r"\balways_comb\b", r"\blogic\b\s+"],
    "Verilog": [r"\bmodule\s+[a-zA-Z_]", r"\balways\s*@", r"\bendmodule\b"],
    "VHDL": [r"\bentity\s+[a-zA-Z_]\s+is", r"\barchitecture\s+[a-zA-Z_]\s+of", r"\bsignal\s+[a-zA-Z_].*:"],
    "Assembly": [r"\bmov\s+[a-zA-Z0-9_]+,\s*[a-zA-Z0-9_]+", r"\bpush\s+[a-zA-Z0-9_]+", r"\bjmp\s+[a-zA-Z0-9_]+"],
    "SQL": [r"(?i)\bSELECT\b.*\bFROM\b", r"(?i)\bUPDATE\b.*\bSET\b", r"(?i)\bINSERT\s+INTO\b"],
    "Bash/Shell": [r"^#!/bin/bash", r"^#!/bin/sh", r"\becho\s+"],
    "PowerShell": [r"\bWrite-Host\b", r"\bGet-[A-Z][a-zA-Z]+", r"\bSet-[A-Z][a-zA-Z]+"],
    "HTML": [r"<!DOCTYPE html>", r"<html>", r"<head>", r"<body>", r"<div\b"],
    "CSS": [r"\bmargin:\s*", r"\bpadding:\s*", r"\bcolor:\s*#"],
    "PLC Structured Text": [r"\bPROGRAM\s+[a-zA-Z_]", r"\bEND_PROGRAM\b", r"\bVAR\b", r"\bEND_VAR\b", r":=\s*"]
}

def detect_language(code: str) -> str:
    """
    Detects the programming language of a code snippet using lightweight local heuristics.
    
    This acts as a fast first-pass helper to guess the language without relying on
    an external API. It scores languages based on matching regex signatures. 
    If it cannot confidently determine the language, it safely returns "Unknown".
    
    The downstream AI workflow is designed to gracefully handle "Unknown" languages 
    and identify them contextually, ensuring valid code is never rejected simply 
    because it wasn't matched here.
    
    Args:
        code (str): The source code snippet to analyze.
        
    Returns:
        str: The detected language name, or "Unknown" if no matches are found.
    """
    if not code or not code.strip():
        return "Unknown"
        
    best_match = "Unknown"
    highest_score = 0
    
    for language, patterns in LANGUAGE_SIGNATURES.items():
        score = 0
        for pattern in patterns:
            # MULTILINE allows '^' to match the start of any line, useful for comments/shebangs
            if re.search(pattern, code, re.MULTILINE):
                score += 1
                
        if score > highest_score:
            highest_score = score
            best_match = language
            
    # We require at least 1 signature match to make a guess
    if highest_score > 0:
        return best_match
        
    return "Unknown"
