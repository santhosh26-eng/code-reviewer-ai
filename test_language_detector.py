import sys
import os

# Ensure we can import the app module from the project root
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.utils.language_detector import detect_language

snippets = [
    # Snippet 1
    """def add(a, b):
    return a + b""",
    
    # Snippet 2
    """#include <stdio.h>
int main() {
    printf("Hello");
    return 0;
}""",

    # Snippet 3
    """    x = 0:0.1:10;
y = sin(x);
plot(x, y);""",

    # Snippet 4
    """module counter(input clk, output reg [3:0] count);
always @(posedge clk)
    count <= count + 1;
endmodule"""
]

def run_tests():
    print("Testing Language Detector...\n")
    for i, code in enumerate(snippets, 1):
        lang = detect_language(code)
        print(f"--- Snippet {i} ---")
        print(code.strip())
        print(f"Detected: {lang}\n")

if __name__ == "__main__":
    run_tests()
