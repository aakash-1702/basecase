// Shared types for the problem workspace (components/problems/*).
// The page receives plain JSON from `/api/problems/[slug]/problem`, so these are
// structural types rather than Prisma client types.

export type ConfidenceV2 = "LOW" | "MEDIUM" | "HIGH";
export type EditorLanguage = "cpp" | "java" | "python";
export type IoTab = "testcase" | "output";
export type SectionId = "editorial" | "hints" | "notes" | "ai-mentor";

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  displayInput?: string | null;
  displayOutput?: string | null;
  order?: number;
  visibility?: string;
}

export interface ProblemData {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  difficulty: string;
  tags?: string[] | null;
  companies?: string[] | null;
  examples?: unknown;
  editorial?: string | null;
  aiHints?: string | null;
  inputFormat?: unknown;
  testCases?: TestCase[];
}

export interface UserProblemData {
  solved?: boolean | null;
  confidenceV2?: ConfidenceV2 | null;
  solvedAt?: string | Date | null;
  notes?: string | null;
  bookmark?: boolean | null;
}

export interface ProgressState {
  solved: boolean;
  confidenceV2: ConfidenceV2 | null;
  solvedAt: string | null;
  notes: string;
  bookmark: boolean;
}

export interface InputFormatItem {
  name: string;
  type: string;
  desc: string;
  sizeVar?: string;
}

export interface RunOutput {
  stdout: string | null;
  outputType: "success" | "error";
  errorType: "Compile Error" | "Runtime Error" | null;
}

export interface SubmitResultItem {
  passed: boolean;
  isPublic: boolean;
  input: string | null;
  displayInput: string | null;
  expected: string | null;
  displayOutput: string | null;
  got: string | null;
  status: string;
  error: string | null;
}

export interface SubmitOutput {
  accepted: boolean;
  passed: number;
  total: number;
  compileError?: string | null;
  results: SubmitResultItem[];
}

export interface SolveDialogData {
  difficulty: string;
  confidence: string;
  insight: string;
  enableReview: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
