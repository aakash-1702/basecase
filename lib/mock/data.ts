/**
 * Mock-mode fixtures + in-memory state.
 * Shapes mirror the real Prisma rows / API payloads so the UI needs no changes.
 * State lives on globalThis so it survives HMR in `next dev`.
 */
import { EASY_PROBLEMS, MEDIUM_PROBLEMS, HARD_PROBLEMS } from "./fixtures";

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.now();
const iso = (ms: number) => new Date(ms).toISOString();

/* ────────────────────────────── user / session ────────────────────────────── */

export const MOCK_USER = {
  id: "user_mock_001",
  name: "Aakash Dwivedi",
  email: "aakash@basecase.dev",
  emailVerified: true,
  image: null as string | null,
  createdAt: iso(NOW - 120 * DAY),
  updatedAt: iso(NOW - DAY),
  role: "USER",
  premium: true,
  interviewCredits: 3,
  roadmapCredits: 2,
  expiresAt: iso(NOW + 25 * DAY),
};

export const MOCK_SESSION = {
  session: {
    id: "sess_mock_001",
    userId: MOCK_USER.id,
    token: "mock-session-token",
    expiresAt: iso(NOW + 7 * DAY),
    createdAt: iso(NOW - DAY),
    updatedAt: iso(NOW - DAY),
    ipAddress: "127.0.0.1",
    userAgent: "mock",
  },
  user: MOCK_USER,
};

/* ────────────────────────────── problems ────────────────────────────── */

export type Difficulty = "easy" | "medium" | "hard";
export type Confidence = "LOW" | "MEDIUM" | "HIGH";

export interface MockTestCase {
  id: string;
  problemId: string;
  input: string;
  expectedOutput: string;
  displayInput: string | null;
  displayOutput: string | null;
  order: number;
  visibility: "PUBLIC" | "PRIVATE";
}

export interface MockProblem {
  id: string;
  title: string;
  slug: string;
  description: string;
  tags: string[];
  companies: string[];
  difficulty: Difficulty;
  isPublic: boolean;
  isActive: boolean;
  link: string;
  examples: string[];
  editorial: string | null;
  aiHints: string | null;
  inputFormat: null;
  createdAt: string;
  updatedAt: string;
  testCases: MockTestCase[];
}

interface RawTestCase {
  input: string;
  expectedOutput: string;
  displayInput?: string;
  displayOutput?: string;
  visibility: string;
}
interface RawProblem {
  title: string;
  slug: string;
  difficulty: string;
  link: string;
  description: string;
  tags: string[];
  companies?: string[];
  examples?: string[];
  editorial?: string;
  aiHints?: string;
  testCases?: RawTestCase[];
}

const RAW: RawProblem[] = [
  ...(EASY_PROBLEMS as RawProblem[]),
  ...(MEDIUM_PROBLEMS as RawProblem[]),
  ...(HARD_PROBLEMS as RawProblem[]),
];

export const PROBLEMS: MockProblem[] = RAW.map((p, i) => {
  const id = `prob_${String(i + 1).padStart(3, "0")}`;
  return {
    id,
    title: p.title,
    slug: p.slug,
    description: p.description,
    tags: p.tags ?? [],
    companies: p.companies ?? [],
    difficulty: (p.difficulty as Difficulty) ?? "medium",
    isPublic: true,
    isActive: true,
    link: p.link,
    examples: p.examples ?? [],
    editorial: p.editorial ?? null,
    aiHints: p.aiHints ?? null,
    inputFormat: null,
    createdAt: iso(NOW - (60 - i) * DAY),
    updatedAt: iso(NOW - (30 - (i % 30)) * DAY),
    testCases: (p.testCases ?? []).map((tc, j) => ({
      id: `tc_${id}_${j + 1}`,
      problemId: id,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      displayInput: tc.displayInput ?? null,
      displayOutput: tc.displayOutput ?? null,
      order: j + 1,
      visibility: tc.visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE",
    })),
  };
});

export const problemBySlug = (slug: string) => PROBLEMS.find((p) => p.slug === slug) ?? null;
export const problemById = (id: string) => PROBLEMS.find((p) => p.id === id) ?? null;

/* ────────────────────────────── user progress ────────────────────────────── */

export interface MockUserProblem {
  id: string;
  userId: string;
  problemId: string;
  solved: boolean;
  attempts: number;
  revision: number;
  interval: number;
  nextAttempt: string | null;
  solvedAt: string | null;
  updatedAt: string;
  notes: string | null;
  bookmark: boolean;
  confidenceV2: Confidence;
  problemHardness: number;
}

function seedProgress(): Map<string, MockUserProblem> {
  const m = new Map<string, MockUserProblem>();
  const seed: Array<[number, Confidence, number, number, string | null]> = [
    // [problemIndex, confidence, solvedDaysAgo, nextAttemptInDays (negative = overdue), notes]
    [0, "HIGH", 14, -3, "Sort both, two pointers. Don't overthink it."],
    [1, "MEDIUM", 12, -1, null],
    [2, "HIGH", 11, 6, "Sum every positive delta."],
    [3, "LOW", 9, -2, "Kadane — reset when running sum < 0."],
    [4, "MEDIUM", 8, 2, null],
    [8, "HIGH", 6, 9, null],
    [9, "MEDIUM", 5, 3, "Sort by end time, greedily keep non-overlapping."],
    [12, "LOW", 2, 0, null],
    [17, "HIGH", 1, 7, null],
  ];
  seed.forEach(([idx, conf, solvedDaysAgo, nextIn, notes], n) => {
    const p = PROBLEMS[idx];
    if (!p) return;
    m.set(p.id, {
      id: `up_${String(n + 1).padStart(3, "0")}`,
      userId: MOCK_USER.id,
      problemId: p.id,
      solved: true,
      attempts: 1 + (n % 3),
      revision: n % 2,
      interval: conf === "HIGH" ? 8 : conf === "MEDIUM" ? 3 : 1,
      nextAttempt: iso(NOW + nextIn * DAY),
      solvedAt: iso(NOW - solvedDaysAgo * DAY),
      updatedAt: iso(NOW - solvedDaysAgo * DAY),
      notes,
      bookmark: n % 4 === 0,
      confidenceV2: conf,
      problemHardness: 3,
    });
  });
  return m;
}

/* ────────────────────────────── sheets ────────────────────────────── */

export interface MockSectionProblem {
  id: string;
  sectionId: string;
  problemId: string;
  order: number;
  note: string | null;
  problem: MockProblem;
}
export interface MockSection {
  id: string;
  title: string;
  description: string | null;
  order: number;
  sheetId: string;
  problems: MockSectionProblem[];
}
export interface MockSheet {
  id: string;
  title: string;
  description: string;
  slug: string;
  difficulty: string;
  createdAt: string;
  updatedAt: string;
  sections: MockSection[];
}

const byTag = (tag: string, limit = 6) =>
  PROBLEMS.filter((p) => p.tags.some((t) => t.toLowerCase() === tag.toLowerCase())).slice(0, limit);
const byDifficulty = (d: Difficulty) => PROBLEMS.filter((p) => p.difficulty === d);

function makeSheet(
  n: number,
  title: string,
  slug: string,
  description: string,
  difficulty: string,
  sections: Array<{ title: string; description?: string; problems: MockProblem[] }>,
  daysAgo: number,
): MockSheet {
  const sheetId = `sheet_${String(n).padStart(2, "0")}`;
  return {
    id: sheetId,
    title,
    slug,
    description,
    difficulty,
    createdAt: iso(NOW - daysAgo * DAY),
    updatedAt: iso(NOW - Math.min(daysAgo, 3) * DAY),
    sections: sections
      .filter((s) => s.problems.length > 0)
      .map((s, i) => {
        const sectionId = `${sheetId}_sec_${i + 1}`;
        return {
          id: sectionId,
          title: s.title,
          description: s.description ?? null,
          order: i + 1,
          sheetId,
          problems: s.problems.map((p, j) => ({
            id: `${sectionId}_p${j + 1}`,
            sectionId,
            problemId: p.id,
            order: j + 1,
            note: null,
            problem: p,
          })),
        };
      }),
  };
}

export const SHEETS: MockSheet[] = [
  makeSheet(
    1,
    "Greedy Problems",
    "greedy-problems",
    "Interval scheduling, two-pointer greedy, monotonic stacks, heap-based greedy and classic greedy proofs — the exact set FAANG loops keep asking.",
    "Mixed",
    [
      { title: "Easy Problems", description: "Cookie assignment, stock profits, Kadane, jump game.", problems: byDifficulty("easy") },
      { title: "Medium Problems", description: "Interval scheduling, heaps, task cooling, partition labels.", problems: byDifficulty("medium") },
      { title: "Hard Problems", description: "Monotonic stacks, dual heaps, coverage-extension proofs.", problems: byDifficulty("hard") },
    ],
    40,
  ),
  makeSheet(
    2,
    "Blind 75",
    "blind-75",
    "The classic list every interview loop is built on. Arrays, two pointers, sliding window, stack, binary search, DP and graphs.",
    "Mixed",
    [
      { title: "Arrays & Hashing", problems: byTag("Array", 8) },
      { title: "Two Pointers", problems: byTag("Two Pointers", 5) },
      { title: "Stack", problems: byTag("Stack", 4) },
      { title: "Greedy", problems: byTag("Greedy", 6) },
    ],
    90,
  ),
  makeSheet(
    3,
    "NeetCode 150",
    "neetcode-150",
    "Pattern-grouped problems from arrays to dynamic programming, in the order the patterns build on each other.",
    "Mixed",
    [
      { title: "Sorting & Searching", problems: byTag("Sorting", 6) },
      { title: "Heap / Priority Queue", problems: byTag("Heap", 5) },
      { title: "Intervals", problems: byTag("Intervals", 5) },
      { title: "Dynamic Programming", problems: byTag("Dynamic Programming", 5) },
    ],
    75,
  ),
  makeSheet(
    4,
    "Striver's SDE Sheet",
    "strivers-sde-sheet",
    "Topic-wise coverage for SDE interviews: 191 problems across arrays, linked lists, recursion, trees, graphs and DP.",
    "Hard",
    [
      { title: "Day 1 · Arrays", problems: byTag("Array", 6) },
      { title: "Day 2 · Greedy", problems: byTag("Greedy", 6) },
      { title: "Day 3 · Hard mix", problems: byDifficulty("hard").slice(0, 5) },
    ],
    60,
  ),
  makeSheet(
    5,
    "Top Interview 150",
    "top-interview-150",
    "The most frequently asked questions across the last two years of interview reports, curated and difficulty-ramped.",
    "Medium",
    [
      { title: "Warm-up", problems: byDifficulty("easy").slice(0, 5) },
      { title: "Core", problems: byDifficulty("medium").slice(0, 6) },
    ],
    30,
  ),
  makeSheet(
    6,
    "Two Pointers & Sliding Window",
    "two-pointers-sliding-window",
    "A focused mini-track for the two patterns that unlock most array and string questions.",
    "Easy",
    [{ title: "Two Pointers", problems: byTag("Two Pointers", 6) }],
    7,
  ),
];

export const sheetBySlug = (slug: string) => SHEETS.find((s) => s.slug === slug) ?? null;

/* ────────────────────────────── interviews ────────────────────────────── */

export interface MockFeedback {
  id: string;
  interviewId: string;
  overallScore: number;
  confidence: { score: number; summary: string };
  depthReview: { score: number; summary: string };
  englishQuality: { score: number; summary: string };
  technicalAccuracy: { score: number; summary: string } | null;
  starStructure: { score: number; summary: string } | null;
  strongAreas: string[];
  weakAreas: string[];
  recommendations: string[];
  transcript: string[];
  createdAt: string;
}

export interface MockInterview {
  id: string;
  userId: string;
  mode: string;
  status: "notStarted" | "active" | "processing" | "ready" | "failed";
  startedAt: string;
  completedAt: string | null;
  difficulty: string | null;
  company: string;
  questionLimit: number | null;
  resumeKeywords: string[];
  feedback: MockFeedback | null;
}

export function buildFeedback(
  interviewId: string,
  mode: string,
  transcript: string[],
  base = 7.6,
): MockFeedback {
  const hr = mode === "HR" || mode === "Behavioural";
  const r = (d: number) => Math.round((base + d) * 10) / 10;
  return {
    id: `fb_${interviewId}`,
    interviewId,
    overallScore: r(0),
    confidence: {
      score: r(0.4),
      summary:
        "You opened answers decisively and rarely hedged. Pauses before complexity questions were slightly long — think out loud instead of going silent.",
    },
    depthReview: {
      score: r(-0.3),
      summary:
        "Good first-principles reasoning on the hash-map approach. You could have gone one level deeper on the trade-off between time and memory when asked about the sorted variant.",
    },
    englishQuality: {
      score: r(0.6),
      summary: "Clear, concise and well-structured sentences. Minimal filler words.",
    },
    technicalAccuracy: hr
      ? null
      : {
          score: r(-0.1),
          summary:
            "Algorithms and complexities were correct. One off-by-one risk in the sliding-window boundary wasn't caught until prompted.",
        },
    starStructure: hr
      ? {
          score: r(-0.5),
          summary:
            "Situation and Task were crisp; Result sections were short — quantify the outcome whenever possible.",
        }
      : null,
    strongAreas: [
      "Explains approach before coding",
      "Identifies the optimal data structure quickly",
      "Handles follow-up questions calmly",
    ],
    weakAreas: ["Edge-case enumeration", "Quantifying impact in answers"],
    recommendations: [
      "Before saying 'done', list three edge cases out loud.",
      "Practise the sorted-input variants of two-pointer problems.",
      "Rehearse 60-second STAR stories with a measurable result.",
    ],
    transcript,
    createdAt: iso(NOW - DAY),
  };
}

const TRANSCRIPT_GOOGLE = [
  "Hi! Welcome to your Google, Senior-level Technical Interview — glad you're here. Before we start, how are you feeling?",
  "Feeling good, a little nervous but ready.",
  "Great. Let's start: given an array of integers and a target, return the indices of two numbers that add up to the target. Walk me through your approach.",
  "I'd iterate once, keeping a hash map from value to index. For each number I check whether target minus the number exists in the map.",
  "Nice. What's the time and space complexity, and how does it change if the array is sorted?",
  "O(n) time and O(n) space. If it's sorted I can use two pointers from both ends for O(1) extra space.",
  "Good. Last one — what breaks if the array contains duplicates?",
  "Nothing — I store the index on insert and check before inserting, so a pair of equal numbers still resolves.",
];

function seedInterviews(): MockInterview[] {
  const list: MockInterview[] = [
    {
      id: "intv_001",
      userId: MOCK_USER.id,
      mode: "Technical",
      status: "ready",
      startedAt: iso(NOW - 2 * DAY),
      completedAt: iso(NOW - 2 * DAY + 28 * 60 * 1000),
      difficulty: "Senior",
      company: "Google",
      questionLimit: 6,
      resumeKeywords: [],
      feedback: null,
    },
    {
      id: "intv_002",
      userId: MOCK_USER.id,
      mode: "HR",
      status: "ready",
      startedAt: iso(NOW - 6 * DAY),
      completedAt: iso(NOW - 6 * DAY + 22 * 60 * 1000),
      difficulty: "Mid",
      company: "Amazon",
      questionLimit: 5,
      resumeKeywords: [],
      feedback: null,
    },
    {
      id: "intv_003",
      userId: MOCK_USER.id,
      mode: "DSA",
      status: "notStarted",
      startedAt: iso(NOW - 60 * 60 * 1000),
      completedAt: null,
      difficulty: "Mid",
      company: "Microsoft",
      questionLimit: 8,
      resumeKeywords: [],
      feedback: null,
    },
    {
      id: "intv_004",
      userId: MOCK_USER.id,
      mode: "Technical",
      status: "processing",
      startedAt: iso(NOW - 25 * 60 * 1000),
      completedAt: iso(NOW - 2 * 60 * 1000),
      difficulty: "Entry",
      company: "Stripe",
      questionLimit: 5,
      resumeKeywords: [],
      feedback: null,
    },
  ];
  list[0].feedback = buildFeedback("intv_001", "Technical", TRANSCRIPT_GOOGLE, 8.2);
  list[1].feedback = buildFeedback("intv_002", "HR", TRANSCRIPT_GOOGLE.slice(0, 4), 6.9);
  return list;
}

/* ────────────────────────────── mutable state ────────────────────────────── */

export interface InterviewLiveSession {
  transcript: string[];
  turnCount: number;
  questionLimit: number;
}

interface MockState {
  userProblems: Map<string, MockUserProblem>;
  interviews: MockInterview[];
  interviewSessions: Map<string, InterviewLiveSession>;
  mentorHistory: Map<string, Array<{ role: string; text: string }>>;
  credits: number;
  counter: number;
}

const g = globalThis as unknown as { __basecaseMockState?: MockState };

export function state(): MockState {
  if (!g.__basecaseMockState) {
    g.__basecaseMockState = {
      userProblems: seedProgress(),
      interviews: seedInterviews(),
      interviewSessions: new Map(),
      mentorHistory: new Map(),
      credits: MOCK_USER.interviewCredits,
      counter: 100,
    };
  }
  return g.__basecaseMockState;
}

export const nextId = (prefix: string) => `${prefix}_${++state().counter}`;

/* ────────────────────────────── dashboard ────────────────────────────── */

export function buildDashboard() {
  const s = state();
  const count = (d: Difficulty) => PROBLEMS.filter((p) => p.difficulty === d).length;
  const solvedCount = (d: Difficulty) =>
    [...s.userProblems.values()].filter((u) => u.solved && problemById(u.problemId)?.difficulty === d)
      .length;

  const easy = count("easy");
  const medium = count("medium");
  const hard = count("hard");
  const easySolved = solvedCount("easy");
  const mediumSolved = solvedCount("medium");
  const hardSolved = solvedCount("hard");
  const totalSolved = easySolved + mediumSolved + hardSolved;
  const totalProblems = easy + medium + hard;
  const pct = (a: number, b: number) => (b === 0 ? 0 : Math.round((a / b) * 100));

  const sheetProgress = SHEETS.map((sheet) => {
    const ids = new Set(sheet.sections.flatMap((sec) => sec.problems.map((p) => p.problemId)));
    const solved = [...ids].filter((id) => s.userProblems.get(id)?.solved).length;
    return {
      id: sheet.id,
      slug: sheet.slug,
      title: sheet.title,
      total: ids.size,
      solved,
      progress: pct(solved, ids.size),
    };
  });

  const withProblem = (u: MockUserProblem) => ({ ...u, problem: problemById(u.problemId) });
  const due = [...s.userProblems.values()]
    .filter((u) => u.solved && u.nextAttempt && new Date(u.nextAttempt).getTime() <= Date.now())
    .sort((a, b) => new Date(a.nextAttempt!).getTime() - new Date(b.nextAttempt!).getTime());

  const recentSubmission = [...s.userProblems.values()]
    .filter((u) => u.solved && u.solvedAt)
    .sort((a, b) => new Date(b.solvedAt!).getTime() - new Date(a.solvedAt!).getTime())
    .slice(0, 5)
    .map(withProblem);

  return {
    easy,
    medium,
    hard,
    easySolved,
    mediumSolved,
    hardSolved,
    easyProgress: pct(easySolved, easy),
    mediumProgress: pct(mediumSolved, medium),
    hardProgress: pct(hardSolved, hard),
    completion: pct(totalSolved, totalProblems),
    sheetProgress,
    recentSubmission,
    name: MOCK_USER.name,
    problemsToRevise: due.slice(0, 5).map(withProblem),
    totalDue: due.length,
  };
}
