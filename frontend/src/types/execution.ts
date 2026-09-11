export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
  status: 'idle' | 'running' | 'completed' | 'error';
  errorMessage?: string;
}

export interface ExecutionResult {
  success: boolean;
  testCases: TestCase[];
  runtime?: string;
  memory?: string;
  error?: string;
}
