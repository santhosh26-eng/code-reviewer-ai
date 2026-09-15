import os
from unittest.mock import patch, MagicMock
from app.services.execution_service import DockerSandboxExecutor

@patch("subprocess.run")
def test_docker_sandbox_security_flags(mock_run):
    """
    This test proves that even without Docker installed, the code securely 
    constructs the docker run command with strict security flags.
    """
    executor = DockerSandboxExecutor()
    
    # Mock the subprocess.run to return a successful execution without actually running docker
    mock_result = MagicMock()
    mock_result.returncode = 0
    mock_run.return_value = mock_result
    
    # We will test compiling C code, which uses the STDIN/STDOUT runner
    code = "int main() { return 0; }"
    test_cases = [{"input": "1", "expected_output": "1"}]
    
    result = executor.execute(code, "c", test_cases)
    
    # Ensure subprocess.run was called
    assert mock_run.called, "subprocess.run was not called"
    
    # mock_run is called twice: first for `docker --version`, second for the actual execution
    command_called = mock_run.call_args_list[-1][0][0]
    command_str = " ".join(command_called)
    
    # PROVE SECURITY CLAIMS:
    # 1. No Network Access
    assert "--network none" in command_str, "Docker container is not isolated from the network!"
    # 2. Memory Limits
    assert "--memory 256m" in command_str, "Docker container lacks memory limits!"
    # 3. CPU Limits
    assert "--cpus 0.5" in command_str, "Docker container lacks CPU limits!"
    # 4. Privilege Dropping
    assert "--cap-drop ALL" in command_str, "Docker container did not drop kernel capabilities!"
    
    # Also verify it used the correct gcc image for C
    assert "gcc:13" in command_str, "Did not use the correct Docker image for C"
