import { ReviewRequest, ReviewResponse } from '../types/review';
import { ExecutionResult, TestCase } from '../types/execution';
import { ChatRequest, ChatMessage } from '../types/chat';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Code Review ───────────────────────────────────────────────────

export async function submitCodeReview(
  request: ReviewRequest,
  token: string | null
): Promise<ReviewResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    headers['Authorization'] = 'Bearer test_development_token'; // fallback for dev
  }

  const response = await fetch(`${API_URL}/api/review`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new Error(detail?.detail ?? `API Error: ${response.statusText}`);
  }

  return response.json();
}

// ── Code Execution ─────────────────────────────────────────

export async function executeCode(
  code: string,
  language: string,
  testCases: TestCase[],
  token: string | null
): Promise<ExecutionResult> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    headers['Authorization'] = 'Bearer test_development_token';
  }

  const payload = {
    code,
    language: language.toLowerCase(),
    test_cases: testCases.map(tc => ({
      input: tc.input,
      expected_output: tc.expectedOutput
    }))
  };

  const response = await fetch(`${API_URL}/api/execute`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new Error(detail?.detail ?? `Execution Error: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Map backend response back to frontend TestCase format
  const mappedTestCases = testCases.map((tc, index) => {
    // Backend results might be fewer if it failed early, match by index
    const result = data.results && data.results[index];
    if (result) {
      return {
        ...tc,
        status: result.status === 'passed' || result.status === 'failed' ? 'completed' : 'error',
        passed: result.status === 'passed',
        actualOutput: result.actual_output || result.error || 'No output',
        errorMessage: result.error || undefined
      };
    }
    return {
      ...tc,
      status: 'error',
      errorMessage: 'No result returned from backend'
    };
  });

  return {
    success: data.status === 'completed' && data.summary?.failed === 0,
    testCases: mappedTestCases as TestCase[],
    runtime: data.results && data.results.length > 0 ? `${data.results[0].runtime_ms}ms` : undefined,
    memory: data.results && data.results.length > 0 ? `${data.results[0].memory_mb}MB` : undefined,
    error: data.status !== 'completed' ? `Execution failed with status: ${data.status}` : undefined
  };
}

// ── Chat ───────────────────────────────────────────────────

export async function sendChatMessage(
  request: ChatRequest,
  token: string | null
): Promise<ChatMessage> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    headers['Authorization'] = 'Bearer test_development_token';
  }

  const payload = {
    code: request.code,
    language: request.language,
    question: request.message,
    history: request.history.map(h => ({
      role: h.role,
      content: h.content
    }))
  };

  const response = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new Error(detail?.detail ?? `Chat Error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    id: data.id,
    role: data.role,
    content: data.content,
    timestamp: new Date(data.timestamp),
  };
}
