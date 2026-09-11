import { ReviewRequest, ReviewResponse } from '../types/review';
import { ExecutionResult, TestCase } from '../types/execution';
import { ChatRequest, ChatMessage } from '../types/chat';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Code Review ───────────────────────────────────────────────────

export async function submitCodeReview(
  request: ReviewRequest,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _token: string | null
): Promise<ReviewResponse> {
  const response = await fetch(`${API_URL}/api/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Use dev bypass token — accepted by auth.py when AUTH_DISABLED=false too
      'Authorization': 'Bearer test_development_token',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new Error(detail?.detail ?? `API Error: ${response.statusText}`);
  }

  return response.json();
}

// ── Code Execution (mock) ─────────────────────────────────────────
// Real sandboxed execution is out of scope for this step.
// The mock simulates a test runner response for UI demonstration.

export async function executeCode(
  code: string,
  language: string,
  testCases: TestCase[]
): Promise<ExecutionResult> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1200));

  if (!code || !code.trim()) {
    return {
      success: false,
      testCases: testCases.map((tc) => ({
        ...tc,
        status: 'error' as const,
        errorMessage: 'No code provided.',
      })),
      error: 'Code cannot be empty.',
    };
  }

  // Simple heuristic: if code looks like a valid function, pass most cases
  const looksLikeCode = code.includes('return') || code.includes('{') || code.includes('def ');

  const processed = testCases.map((tc) => {
    const passed = looksLikeCode ? Math.random() > 0.3 : false;
    return {
      ...tc,
      status: 'completed' as const,
      passed,
      actualOutput: passed ? tc.expectedOutput : `Got: undefined`,
    };
  });

  return {
    success: processed.every((tc) => tc.passed),
    testCases: processed,
    runtime: `${Math.floor(Math.random() * 60 + 8)}ms`,
    memory: `${(Math.random() * 4 + 14).toFixed(1)}MB`,
  };
}

// ── Chat (mock) ───────────────────────────────────────────────────
// A real AI chat endpoint is not yet implemented on the backend.
// This mock provides relevant placeholder responses for UI testing.

export async function sendChatMessage(
  request: ChatRequest,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _token: string | null
): Promise<ChatMessage> {
  await new Promise((resolve) => setTimeout(resolve, 900));

  const q = request.message.toLowerCase();
  const lang = request.language;

  let content: string;

  if (q.includes('time complexity') || q.includes('complexity')) {
    content = `For the current ${lang} code, the time complexity depends on the algorithm used. I can see nested loops — that typically suggests O(n²). Consider using a hash map to reduce it to O(n). _(Note: This is a preview response — backend chat is coming soon.)_`;
  } else if (q.includes('bug') || q.includes('error') || q.includes('find')) {
    content = `Looking at your ${lang} code, potential issues to check: 1) Off-by-one errors in loops, 2) Division by zero if inputs are unchecked, 3) Missing edge cases for empty input. Run the AI Review for a full analysis. _(Preview response)_`;
  } else if (q.includes('optimize') || q.includes('improve')) {
    content = `To optimize your ${lang} code: consider memoization or caching repeated computations, use built-in language idioms, and profile before optimizing. The AI Review panel gives concrete suggestions. _(Preview response)_`;
  } else if (q.includes('explain') || q.includes('what does')) {
    content = `This ${lang} code appears to implement an algorithm that processes input data and returns a result. For a detailed plain-English explanation, click the **Review** button and check the Explanation section. _(Preview response)_`;
  } else if (q.includes('edge case')) {
    content = `Common edge cases to consider: empty input, single-element arrays, negative numbers, very large inputs, and duplicate values. The AI Review will highlight specific ones for your code. _(Preview response)_`;
  } else {
    content = `I can see your ${lang} code in the editor. For a full AI analysis, click **Review** to get explanation, bugs, security issues, and complexity. Ask me anything specific about the logic! _(Backend chat coming soon — this is a preview response.)_`;
  }

  return {
    id: Math.random().toString(36).slice(2),
    role: 'assistant',
    content,
    timestamp: new Date(),
  };
}
