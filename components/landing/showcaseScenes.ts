/**
 * Scenes for the hero FeatureShowcase. Each scene is a tiny "code video":
 * lines are typed (`typed: true`) or printed after a pause (`wait`, ms).
 * Keep lines short so the window never scrolls.
 */
export type ShowcaseLine = {
  text: string;
  /** typed character-by-character (code / commands / speech) */
  typed?: boolean;
  /** pause before this line appears, ms */
  wait?: number;
  /** visual role → colour */
  tone?: "cmd" | "code" | "kw" | "ok" | "warn" | "dim" | "ai" | "you" | "accent";
  /** optional prefix glyph, e.g. "$ " or "AI ▸ " */
  prefix?: string;
};

export type ShowcaseScene = {
  id: string;
  label: string;
  title: string;
  blurb: string;
  file: string;
  /** status-bar text (bottom-left) */
  status: string;
  lines: ShowcaseLine[];
  /** shown bottom-right once the scene completes */
  badge: string;
};

export const SHOWCASE_SCENES: ShowcaseScene[] = [
  {
    id: "sheets",
    label: "Sheets",
    title: "Curated sheets, in the right order",
    blurb: "Blind 75, NeetCode 150, Striver — concept-ordered and difficulty-ramped.",
    file: "basecase › sheets",
    status: "6 sheets · 3 tracks in progress",
    badge: "next: Two Sum →",
    lines: [
      { text: "basecase sheets open blind-75", typed: true, tone: "cmd", prefix: "$ " },
      { text: "Blind 75 — 4 sections · 23 problems", wait: 260, tone: "accent" },
      { text: "Arrays & Hashing    ████████░░   8/10", wait: 160, tone: "code" },
      { text: "Two Pointers        █████░░░░░   3/6", wait: 120, tone: "code" },
      { text: "Stack               ██░░░░░░░░   1/4", wait: 120, tone: "code" },
      { text: "Greedy              ░░░░░░░░░░   0/6", wait: 120, tone: "dim" },
      { text: "✓ progress synced to dashboard", wait: 320, tone: "ok" },
      { text: "→ opening next unsolved: two-sum", wait: 220, tone: "warn" },
    ],
  },
  {
    id: "judge0",
    label: "Judge0 runner",
    title: "Run code on a self-hosted Judge0",
    blurb: "Python, C++ and Java, executed on our own Judge0 box — no third-party API, no rate limits.",
    file: "two_sum.py",
    status: "judge0 · self-hosted · python 3.11",
    badge: "Accepted · 4/4 · 3 ms",
    lines: [
      { text: "def two_sum(nums, target):", typed: true, tone: "kw" },
      { text: "    seen = {}", typed: true, tone: "code" },
      { text: "    for i, n in enumerate(nums):", typed: true, tone: "code" },
      { text: "        if target - n in seen:", typed: true, tone: "code" },
      { text: "            return [seen[target - n], i]", typed: true, tone: "code" },
      { text: "        seen[n] = i", typed: true, tone: "code" },
      { text: "", wait: 120 },
      { text: "POST /submissions  →  token 7f3a…", wait: 240, tone: "dim", prefix: "▸ " },
      { text: "queued → running", wait: 380, tone: "warn", prefix: "▸ " },
      { text: "✓ test 1/4  2 ms    ✓ test 2/4  2 ms", wait: 420, tone: "ok" },
      { text: "✓ test 3/4  3 ms    ✓ test 4/4  3 ms", wait: 300, tone: "ok" },
    ],
  },
  {
    id: "voice",
    label: "Voice interviews",
    title: "AI mock interviews you speak to",
    blurb: "Speech-to-text in, LLM follow-ups, text-to-speech out. It pushes back like a real interviewer.",
    file: "interview › google · senior",
    status: "STT → LLM → TTS · 420 ms round-trip",
    badge: "scored report ready",
    lines: [
      { text: "Walk me through your approach for Two Sum.", typed: true, tone: "ai", prefix: "AI  ▸ " },
      { text: "I'd keep a hash map from value to index and check the complement on each pass…", typed: true, tone: "you", prefix: "You ▸ ", wait: 400 },
      { text: "What's the complexity, and what if the array is sorted?", typed: true, tone: "ai", prefix: "AI  ▸ ", wait: 500 },
      { text: "O(n) time, O(n) space. Sorted → two pointers, O(1) extra space.", typed: true, tone: "you", prefix: "You ▸ ", wait: 400 },
      { text: "✓ confidence 8.4   ✓ depth 7.9   ✓ clarity 9.1", wait: 600, tone: "ok" },
    ],
  },
  {
    id: "sm2",
    label: "SM-2 revision",
    title: "Spaced repetition that actually schedules",
    blurb: "Rate your confidence after a solve; SM-2 decides exactly when the problem comes back.",
    file: "revision/sm2.ts",
    status: "3 due today · 14 scheduled",
    badge: "next review in 12 days",
    lines: [
      { text: "// SM-2: q = confidence (0–5)", tone: "dim" },
      { text: "if (q < 3) { reps = 0; interval = 1 }", typed: true, tone: "kw" },
      { text: "else {", typed: true, tone: "code" },
      { text: "  interval = reps === 0 ? 1 : reps === 1 ? 6", typed: true, tone: "code" },
      { text: "           : Math.round(interval * ef)", typed: true, tone: "code" },
      { text: "  ef = max(1.3, ef + 0.1 - (5-q) * (0.08 + (5-q) * 0.02))", typed: true, tone: "code" },
      { text: "}", typed: true, tone: "code" },
      { text: "", wait: 100 },
      { text: "Two Sum          HIGH   → review in 12 days", wait: 260, tone: "ok" },
      { text: "3Sum             LOW    → tomorrow", wait: 160, tone: "warn" },
      { text: "Merge Intervals  MEDIUM → in 4 days", wait: 160, tone: "accent" },
    ],
  },
  {
    id: "planly",
    label: "Planly",
    title: "A plan that fits your week",
    blurb: "Tell Planly your target role and hours; it builds a week-by-week plan from the sheets and your weak spots.",
    file: "planly › generate",
    status: "planly · 8 h/week · 4 weeks",
    badge: "synced to dashboard ✓",
    lines: [
      { text: 'planly generate --goal "Google SDE-2" --hours 8', typed: true, tone: "cmd", prefix: "$ " },
      { text: "reading progress… weakest: Graphs (18%), DP (31%)", wait: 320, tone: "dim" },
      { text: "Week 1 · Arrays & Hashing ───── 14 problems", wait: 260, tone: "code" },
      { text: "Week 2 · Graphs (focus) ─────── 12 problems", wait: 160, tone: "warn" },
      { text: "Week 3 · DP patterns ────────── 11 problems", wait: 160, tone: "code" },
      { text: "Week 4 · 2 mock interviews + revision", wait: 160, tone: "code" },
      { text: "✓ plan saved · reminders on", wait: 320, tone: "ok" },
    ],
  },
];
