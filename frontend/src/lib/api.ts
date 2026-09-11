import { ReviewRequest, ReviewResponse } from '../types/review';
import { ExecutionResult, TestCase } from '../types/execution';
import { ChatRequest, ChatMessage } from '../types/chat';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function submitCodeReview(
  request: ReviewRequest,
  token: string | null
): Promise<ReviewResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/review`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * MOCK EXECUTION SERVICE
 * This simulates executing code against test cases. It is an MVP abstraction 
 * because real arbitrary code execution cannot be safely performed in the backend yet.
 */
export async function executeCode(
  code: string,
  language: string,
  testCases: TestCase[]
): Promise<ExecutionResult> {
  // Simulate network delay for execution
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // If code is completely empty or just whitespace
  if (!code || code.trim() === '') {
    return {
      success: false,
      testCases: testCases.map(tc => ({ ...tc, status: 'error', errorMessage: 'No code provided.' })),
      error: 'Code cannot be empty.',
    };
  }

  // Simulate test case processing
  const processedTestCases = testCases.map((tc) => {
    // For demonstration purposes, if the code contains "return a / b", we simulate passing
    // the simple division test case. Otherwise we randomly pass/fail to simulate a real environment.
    const isSuccess = Math.random() > 0.5 || code.includes('a / b');
    
    return {
      ...tc,
      status: 'completed' as const,
      passed: isSuccess,
      actualOutput: isSuccess ? tc.expectedOutput : 'Simulated Failure Output',
    };
  });

  return {
    success: processedTestCases.every(tc => tc.passed),
    testCases: processedTestCases,
    runtime: `${Math.floor(Math.random() * 50 + 10)}ms`,
    memory: `${(Math.random() * 5 + 15).toFixed(1)}MB`,
  };
}

/**
 * MOCK CHAT SERVICE
 * Simulates a chatbot responding to user questions about the current code.
 */
export async function sendChatMessage(
  request: ChatRequest,
  token: string | null
): Promise<ChatMessage> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Generate a mock response depending on the input
  let responseText = "I'm a simulated AI assistant. I can see you are writing in " + request.language + ". ";
  if (request.message.toLowerCase().includes('bug')) {
    responseText += "It looks like there might be an issue with edge cases (like dividing by zero).";
  } else if (request.message.toLowerCase().includes('optimize')) {
    responseText += "To optimize this, consider reducing unnecessary loops or using a more efficient data structure.";
  } else {
    responseText += "How else can I help you understand this code?";
  }

  return {
    id: Math.random().toString(36).substring(7),
    role: 'assistant',
    content: responseText,
    timestamp: new Date(),
  };
}
