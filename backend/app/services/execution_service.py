import os
import tempfile
import subprocess
import json
import logging
from typing import List, Dict, Any, Optional
from abc import ABC, abstractmethod
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class TestCaseResult(BaseModel):
    test_case: int
    status: str
    input: str
    expected_output: str
    actual_output: Optional[str] = None
    runtime_ms: Optional[int] = None
    memory_mb: Optional[float] = None
    error: Optional[str] = None

class ExecutionResult(BaseModel):
    status: str
    language: str
    results: List[TestCaseResult] = []
    summary: Dict[str, int] = {"passed": 0, "failed": 0, "total": 0}

class SandboxExecutor(ABC):
    @abstractmethod
    def execute(self, code: str, language: str, test_cases: List[Dict[str, str]]) -> ExecutionResult:
        pass

class DockerSandboxExecutor(SandboxExecutor):
    def __init__(self):
        self.timeout = int(os.getenv("EXECUTION_TIMEOUT_SECONDS", "10"))
        self.image_map = {
            "python": "python:3.11-slim",
            "c": "gcc:13",
            "cpp": "gcc:13",
            "java": "openjdk:21-jdk-slim"
        }

    def _create_runner_script_python(self, code: str, test_cases: List[Dict[str, str]]) -> str:
        import json
        return f"""
import sys
import json
import time
import traceback

def __run_tests():
    user_code = {repr(code)}
    test_cases = {json.dumps(test_cases)}
    results = []
    
    namespace = {{}}
    try:
        exec(user_code, namespace)
    except Exception as e:
        print(json.dumps([{{
            "test_case": 0,
            "status": "compilation_error",
            "error": traceback.format_exc()
        }}]))
        sys.exit(0)

    func = None
    for name, val in namespace.items():
        if callable(val) and not name.startswith('__'):
            func = val
            break
            
    if not func:
        print(json.dumps([{{
            "test_case": 0,
            "status": "runtime_error",
            "error": "No function defined in code."
        }}]))
        sys.exit(0)

    for i, tc in enumerate(test_cases):
        try:
            start = time.perf_counter()
            
            tc_input = tc['input']
            if 'nums=' in tc_input:
                parts = tc_input.split('target=')
                nums_str = parts[0].replace('nums=', '').strip().strip(',')
                target_str = parts[1].strip()
                import ast
                nums = ast.literal_eval(nums_str)
                target = ast.literal_eval(target_str)
                out = func(nums, target)
            else:
                out = func()
                
            end = time.perf_counter()
            actual = str(out).replace(" ", "")
            expected = str(tc['expected_output']).replace(" ", "")
            
            passed = actual == expected
            
            results.append({{
                "test_case": i + 1,
                "status": "passed" if passed else "failed",
                "input": tc['input'],
                "expected_output": tc['expected_output'],
                "actual_output": str(out),
                "runtime_ms": int((end - start) * 1000),
                "memory_mb": 1.5,
                "error": None
            }})
        except Exception as e:
            results.append({{
                "test_case": i + 1,
                "status": "runtime_error",
                "input": tc['input'],
                "expected_output": tc['expected_output'],
                "error": traceback.format_exc()
            }})

    print(json.dumps(results))

if __name__ == '__main__':
    __run_tests()
"""

    def _get_filename(self, language: str) -> str:
        if language == "python": return "main.py"
        if language == "c": return "main.c"
        if language == "cpp": return "main.cpp"
        if language == "java": return "Main.java"
        return "main.txt"

    def _create_run_sh(self) -> str:
        return """#!/bin/bash
LANGUAGE=$1
FILE=$2
COUNT=$3

if [ "$LANGUAGE" = "c" ]; then
    gcc -O2 "$FILE" -o prog > compile.err 2>&1
    if [ $? -ne 0 ]; then exit 1; fi
    EXEC_CMD="./prog"
elif [ "$LANGUAGE" = "cpp" ]; then
    g++ -O2 "$FILE" -o prog > compile.err 2>&1
    if [ $? -ne 0 ]; then exit 1; fi
    EXEC_CMD="./prog"
elif [ "$LANGUAGE" = "java" ]; then
    javac "$FILE" > compile.err 2>&1
    if [ $? -ne 0 ]; then exit 1; fi
    EXEC_CMD="java Main"
fi

for i in $(seq 1 $COUNT); do
    timeout 5s $EXEC_CMD < test_case_$i.in > test_case_$i.out 2> test_case_$i.err
    echo $? > test_case_$i.exit
done
exit 0
"""

    def execute(self, code: str, language: str, test_cases: List[Dict[str, str]]) -> ExecutionResult:
        if language not in self.image_map:
            return ExecutionResult(status="unsupported", language=language)

        image = self.image_map[language]
        
        try:
            subprocess.run(["docker", "--version"], capture_output=True, check=True)
        except Exception:
            logger.warning("Docker is not available.")
            return ExecutionResult(status="sandbox_unavailable", language=language)

        with tempfile.TemporaryDirectory() as temp_dir:
            if language == "python":
                # Special Python AST wrapper
                script_path = os.path.join(temp_dir, "runner.py")
                with open(script_path, "w") as f:
                    f.write(self._create_runner_script_python(code, test_cases))

                cmd = [
                    "docker", "run", "--rm",
                    "--network", "none",
                    "--cap-drop", "ALL",
                    "--security-opt", "no-new-privileges",
                    "--memory", "128m",
                    "--cpus", "0.5",
                    "-v", f"{temp_dir}:/workspace:ro",
                    "-w", "/workspace",
                    image,
                    "python", "runner.py"
                ]

                try:
                    result = subprocess.run(cmd, capture_output=True, text=True, timeout=self.timeout)
                    if result.returncode == 124 or result.returncode == 137:
                         return ExecutionResult(status="timeout", language=language)
                    
                    output = result.stdout.strip()
                    if not output:
                        return ExecutionResult(status="runtime_error", language=language, results=[
                            TestCaseResult(test_case=1, status="runtime_error", input="", expected_output="", error=result.stderr)
                        ])

                    try:
                        parsed_results = json.loads(output)
                        
                        if len(parsed_results) == 1 and parsed_results[0].get("status") == "compilation_error":
                             return ExecutionResult(status="compilation_error", language=language, results=[
                                 TestCaseResult(**parsed_results[0], input="", expected_output="")
                             ])

                        test_results = [TestCaseResult(**res) for res in parsed_results]
                        
                        passed = sum(1 for r in test_results if r.status == "passed")
                        failed = sum(1 for r in test_results if r.status == "failed")
                        total = len(test_results)
                        
                        return ExecutionResult(
                            status="completed",
                            language=language,
                            results=test_results,
                            summary={"passed": passed, "failed": failed, "total": total}
                        )
                    except json.JSONDecodeError:
                        return ExecutionResult(status="runtime_error", language=language, results=[
                            TestCaseResult(test_case=1, status="runtime_error", input="", expected_output="", error=f"Failed to parse output: {output}\\n{result.stderr}")
                        ])

                except subprocess.TimeoutExpired:
                    return ExecutionResult(status="timeout", language=language)
                except Exception as e:
                    logger.error(f"Execution error: {str(e)}")
                    return ExecutionResult(status="runtime_error", language=language, results=[
                            TestCaseResult(test_case=1, status="runtime_error", input="", expected_output="", error=str(e))
                    ])
            else:
                # STDIN/STDOUT runner for C, C++, Java
                code_filename = self._get_filename(language)
            with open(os.path.join(temp_dir, code_filename), "w") as f:
                f.write(code)

            # 2. Write test cases
            for i, tc in enumerate(test_cases):
                with open(os.path.join(temp_dir, f"test_case_{i+1}.in"), "w") as f:
                    f.write(tc.get("input", ""))

            # 3. Write run.sh
            with open(os.path.join(temp_dir, "run.sh"), "w", newline='\\n') as f:
                f.write(self._create_run_sh())
            os.chmod(os.path.join(temp_dir, "run.sh"), 0o777)

            # 4. Run Docker
            cmd = [
                "docker", "run", "--rm",
                "--network", "none",
                "--cap-drop", "ALL",
                "--security-opt", "no-new-privileges",
                "--memory", "256m",
                "--cpus", "0.5",
                "-v", f"{temp_dir}:/workspace",
                "-w", "/workspace",
                image,
                "bash", "run.sh", language, code_filename, str(len(test_cases))
            ]

            try:
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=self.timeout)
                
                # Check for compilation error
                if result.returncode == 1:
                    err_path = os.path.join(temp_dir, "compile.err")
                    compilation_error = "Compilation failed."
                    if os.path.exists(err_path):
                        with open(err_path, "r") as f:
                            compilation_error = f.read()
                    
                    return ExecutionResult(status="compilation_error", language=language, results=[
                        TestCaseResult(test_case=0, status="compilation_error", input="", expected_output="", error=compilation_error)
                    ])

                if result.returncode == 124 or result.returncode == 137:
                    return ExecutionResult(status="timeout", language=language)

                # Read outputs and grade
                test_results = []
                for i, tc in enumerate(test_cases):
                    out_path = os.path.join(temp_dir, f"test_case_{i+1}.out")
                    err_path = os.path.join(temp_dir, f"test_case_{i+1}.err")
                    exit_path = os.path.join(temp_dir, f"test_case_{i+1}.exit")

                    actual_output = ""
                    error_output = ""
                    exit_code = 0

                    if os.path.exists(out_path):
                        with open(out_path, "r") as f:
                            actual_output = f.read().strip()
                    
                    if os.path.exists(err_path):
                        with open(err_path, "r") as f:
                            error_output = f.read().strip()

                    if os.path.exists(exit_path):
                        with open(exit_path, "r") as f:
                            try:
                                exit_code = int(f.read().strip())
                            except:
                                exit_code = -1

                    status = "passed"
                    if exit_code == 124:
                        status = "timeout"
                    elif exit_code != 0:
                        status = "runtime_error"
                    elif actual_output.replace(" ", "") != str(tc.get("expected_output", "")).replace(" ", "").strip():
                        status = "failed"

                    test_results.append(TestCaseResult(
                        test_case=i+1,
                        status=status,
                        input=tc.get("input", ""),
                        expected_output=tc.get("expected_output", ""),
                        actual_output=actual_output,
                        runtime_ms=0,
                        memory_mb=0,
                        error=error_output if error_output else None
                    ))

                passed = sum(1 for r in test_results if r.status == "passed")
                failed = sum(1 for r in test_results if r.status == "failed")
                
                return ExecutionResult(
                    status="completed",
                    language=language,
                    results=test_results,
                    summary={"passed": passed, "failed": failed, "total": len(test_cases)}
                )

            except subprocess.TimeoutExpired:
                return ExecutionResult(status="timeout", language=language)
            except Exception as e:
                logger.error(f"Execution error: {str(e)}")
                return ExecutionResult(status="runtime_error", language=language, results=[
                    TestCaseResult(test_case=1, status="runtime_error", input="", expected_output="", error=str(e))
                ])

class MockSandboxExecutor(SandboxExecutor):
    def execute(self, code: str, language: str, test_cases: List[Dict[str, str]]) -> ExecutionResult:
        if not code.strip():
            return ExecutionResult(status="compilation_error", language=language)
            
        results = []
        for i, tc in enumerate(test_cases):
            passed = "return" in code
            results.append(TestCaseResult(
                test_case=i+1,
                status="passed" if passed else "failed",
                input=tc['input'],
                expected_output=tc['expected_output'],
                actual_output=tc['expected_output'] if passed else "wrong",
                runtime_ms=15,
                memory_mb=1.2
            ))
            
        passed = sum(1 for r in results if r.status == "passed")
        return ExecutionResult(
            status="completed",
            language=language,
            results=results,
            summary={"passed": passed, "failed": len(results) - passed, "total": len(results)}
        )

def get_executor() -> SandboxExecutor:
    is_enabled = os.getenv("EXECUTION_ENABLED", "true").lower() == "true"
    if not is_enabled:
         return MockSandboxExecutor()
         
    sandbox_type = os.getenv("EXECUTION_SANDBOX", "docker").lower()
    if sandbox_type == "docker":
        return DockerSandboxExecutor()
    return MockSandboxExecutor()
