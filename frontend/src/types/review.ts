export interface ReviewRequest {
  code: string;
  depth: 'quick' | 'deep';
}

export interface Bug {
  description: string;
  line_number?: number;
  severity: string;
}

export interface SecurityIssue {
  description: string;
  line_number?: number;
  severity: string;
}

export interface Complexity {
  time?: string;
  space?: string;
  details?: string;
}

export interface Readability {
  assessment?: string;
  suggestions?: string[];
}

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
