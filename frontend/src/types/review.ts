export interface ReviewRequest {
  code: string;
  depth: 'quick' | 'deep';
}

// ── Bug (matches backend app/ai/prompts.py Bug model) ────────────
export interface Bug {
  title?: string;
  description: string;
  line_reference?: string | null;
  line_number?: number | null;  // kept for compatibility
  severity: string;
}

// ── SecurityIssue (matches backend SecurityIssue model) ───────────
export interface SecurityIssue {
  title?: string;
  description: string;
  line_reference?: string | null;
  line_number?: number | null;
  severity: string;
  recommendation?: string;
}

// ── Complexity (matches backend Complexity model) ─────────────────
export interface Complexity {
  time_complexity?: string;
  space_complexity?: string;
  explanation?: string;
}

// ── Readability (matches backend Readability model) ───────────────
export interface Readability {
  score?: number;
  explanation?: string;
  suggestions?: string[];
}

// ── Full review API response ──────────────────────────────────────
export interface ReviewResponse {
  success: boolean;
  language?: string | null;
  depth?: string | null;
  explanation?: string | null;
  bugs?: Bug[] | null;
  security_issues?: SecurityIssue[] | null;
  refactored_code?: string | null;
  complexity?: Complexity | null;
  readability?: Readability | null;
  markdown_report?: string | null;
  error?: string | null;
}
