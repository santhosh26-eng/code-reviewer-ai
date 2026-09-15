# Universal Code Execution Engine

The Code Reviewer AI features a highly sophisticated Code Execution Engine (`execution_service.py`) capable of safely running untrusted user code across multiple languages.

## Security Architecture
The engine relies on **Docker** to create extremely lightweight, ephemeral containers.
When a user clicks "Run Code", the backend:
1. Creates a temporary directory.
2. Writes the user's code to a file (`main.c`, `Main.java`, `main.py`).
3. Generates a shell script (`run.sh`).
4. Mounts this temporary directory into a strictly locked-down Docker container (No network access, 256MB RAM limit, 0.5 CPU limit, all privileges dropped).

## Execution Strategies

### 1. Compiled Languages (C, C++, Java) - STDIN / STDOUT
Because these languages require boilerplate (like `public static void main` or `#include`), the execution engine evaluates them using the standard **Competitive Programming** architecture.
- Test case `input` is piped directly into standard input (`stdin`).
- The program's standard output (`stdout`) is captured and compared exactly against the `expected_output`.
- **User requirement**: Code must read from `stdin` and print answers to `stdout`.

### 2. Python - AST Magic Wrapper
Python is evaluated differently to provide a highly user-friendly "pure function" experience.
- The engine dynamically evaluates the Python code using the `exec()` function in a sandboxed namespace.
- It uses Abstract Syntax Trees (AST) and dynamic introspection to automatically find the user's function.
- It parses the test case inputs (`nums=[1,2]`) and dynamically injects them as function arguments.
- The function's return value is captured and compared against the expected output.
- **User requirement**: Just write a standard function (e.g., `def two_sum(nums, target):`). No `sys.stdin.read()` boilerplate required!

## Mock Mode
If a developer does not have Docker installed, they can set `EXECUTION_SANDBOX=mock` in their `backend/.env`.
- For Python: The engine will evaluate the code securely using the local Python installation running the backend.
- For Compiled Languages: It will bypass execution and immediately return "Passed (Mocked)" to allow frontend UI testing without crashing.
