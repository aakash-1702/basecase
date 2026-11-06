/**
 * Mock API dispatcher. Every real route handler has a twin here that returns
 * the same JSON shape from in-memory fixtures (see ./data.ts).
 */
import {
  MOCK_SESSION,
  MOCK_USER,
  PROBLEMS,
  SHEETS,
  buildDashboard,
  buildFeedback,
  nextId,
  problemById,
  problemBySlug,
  sheetBySlug,
  state,
  type Confidence,
  type MockInterview,
  type MockUserProblem,
} from "./data";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "x-basecase-mock": "1" },
  });
const ok = (data: unknown, message = "OK", status = 200) =>
  json({ success: true, data, message }, status);
const fail = (message: string, status = 400) =>
  json({ success: false, data: null, message }, status);

async function readJson<T = Record<string, unknown>>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    return {} as T;
  }
}

const DAY = 24 * 60 * 60 * 1000;

/* ────────────────────────────── problems ────────────────────────────── */

function listProblems(url: URL) {
  const sp = url.searchParams;
  const page = Math.max(Number(sp.get("page")) || 1, 1);
  const limit = Math.max(Number(sp.get("limit")) || 5, 1);
  const difficulty = sp.get("difficulty");
  const status = sp.get("status");
  const search = (sp.get("search") ?? "").toLowerCase().trim();
  const s = state();

  let rows = PROBLEMS.filter((p) => p.isPublic && p.isActive);
  if (difficulty && difficulty !== "all") rows = rows.filter((p) => p.difficulty === difficulty);
  if (search) rows = rows.filter((p) => p.title.toLowerCase().includes(search));
  if (status === "solved") rows = rows.filter((p) => s.userProblems.get(p.id)?.solved);
  if (status === "unsolved") rows = rows.filter((p) => !s.userProblems.get(p.id)?.solved);

  const total = rows.length;
  const pageRows = rows.slice((page - 1) * limit, page * limit).map((p) => {
    const up = s.userProblems.get(p.id);
    const { testCases: _tc, ...rest } = p;
    void _tc;
    const userProgress = up ? { solved: up.solved, confidenceV2: up.confidenceV2 } : null;
    return { ...rest, userProblems: userProgress ? [userProgress] : [], userProgress };
  });

  return json({
    success: true,
    data: {
      problems: pageRows,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    },
  });
}

function getProblem(slug: string) {
  const p = problemBySlug(slug);
  if (!p) return fail("Problem not found", 404);
  const up = state().userProblems.get(p.id) ?? null;
  const problem = {
    ...p,
    testCases: p.testCases
      .filter((t) => t.visibility === "PUBLIC")
      .map(({ id, input, displayInput, displayOutput, expectedOutput, order }) => ({
        id,
        input,
        displayInput,
        displayOutput,
        expectedOutput,
        order,
      })),
    userProblems: up ? [up] : [],
  };
  return ok({ problem, userProgress: up }, "Problem fetched successfully");
}

const HARDNESS: Record<string, number> = { TOO_EASY: 1, EASY: 2, JUST_RIGHT: 3, HARD: 4, VERY_HARD: 5 };

function upsertProgress(problemId: string, patch: Partial<MockUserProblem>): MockUserProblem {
  const s = state();
  const existing = s.userProblems.get(problemId);
  const row: MockUserProblem = existing ?? {
    id: nextId("up"),
    userId: MOCK_USER.id,
    problemId,
    solved: false,
    attempts: 0,
    revision: 0,
    interval: 1,
    nextAttempt: null,
    solvedAt: null,
    updatedAt: new Date().toISOString(),
    notes: null,
    bookmark: false,
    confidenceV2: "LOW",
    problemHardness: 1,
  };
  const updated = { ...row, ...patch, updatedAt: new Date().toISOString() };
  s.userProblems.set(problemId, updated);
  return updated;
}

async function patchProblem(slug: string, req: Request) {
  const p = problemBySlug(slug);
  if (!p) return fail("Problem not found", 404);
  const body = await readJson<Record<string, unknown>>(req);
  const existing = state().userProblems.get(p.id);
  const patch: Partial<MockUserProblem> = {};
  const now = Date.now();

  if (typeof body.bookmark === "boolean") patch.bookmark = body.bookmark;
  if (typeof body.notes === "string") patch.notes = body.notes;
  if (typeof body.solved === "boolean") {
    patch.solved = body.solved;
    if (body.solved) {
      patch.solvedAt = new Date(now).toISOString();
      patch.interval = 1;
      patch.nextAttempt = new Date(now + DAY).toISOString();
    }
  }
  if (["LOW", "MEDIUM", "HIGH"].includes(String(body.confidenceV2))) {
    const conf = body.confidenceV2 as Confidence;
    patch.confidenceV2 = conf;
    const prev = existing?.interval ?? 1;
    const interval = conf === "HIGH" ? prev * 2 : conf === "MEDIUM" ? Math.round(prev * 1.5) : 1;
    patch.interval = interval;
    patch.nextAttempt = new Date(now + interval * DAY).toISOString();
    patch.revision = (existing?.revision ?? 0) + 1;
  }
  if (typeof body.perceivedDifficulty === "string" && HARDNESS[body.perceivedDifficulty]) {
    patch.problemHardness = HARDNESS[body.perceivedDifficulty];
  }
  if (typeof body.keyInsight === "string" && body.keyInsight.trim()) {
    const insight = body.keyInsight.trim();
    patch.notes = existing?.notes ? `${existing.notes}\n\n${insight}` : insight;
  }
  if (Object.keys(patch).length === 0) return fail("No valid fields to update", 400);

  await sleep(150);
  return ok(upsertProgress(p.id, patch), "Progress updated successfully");
}

async function executeProblem(slug: string, req: Request) {
  const p = problemBySlug(slug);
  if (!p) return fail("Problem not found", 404);
  const { code = "", stdin = "" } = await readJson<{ code?: string; language?: string; stdin?: string }>(req);
  await sleep(650);
  if (!String(code).trim()) {
    return json({ stdout: "", stderr: "", compile_output: "error: empty submission", status: "Compilation Error" });
  }
  if (/RUNTIME_ERROR/.test(String(code))) {
    return json({ stdout: "", stderr: "Traceback (most recent call last):\n  ZeroDivisionError: division by zero", compile_output: "", status: "Runtime Error (NZEC)" });
  }
  const clean = String(stdin).replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  const match = p.testCases.find((t) => t.input.trim() === clean) ?? p.testCases[0];
  return json({ stdout: match ? match.expectedOutput : "", stderr: "", compile_output: "", status: "Accepted" });
}

async function submitProblem(slug: string, req: Request) {
  const p = problemBySlug(slug);
  if (!p) return fail("Problem not found", 404);
  const { code = "" } = await readJson<{ code?: string; language?: string }>(req);
  if (!p.testCases.length) return fail("No test cases found", 404);
  await sleep(1100);

  const wrong = /WRONG_ANSWER/.test(String(code));
  const results = p.testCases.map((tc, i) => {
    const pub = tc.visibility === "PUBLIC";
    const passed = !(wrong && i % 2 === 1);
    return {
      passed,
      input: pub ? (tc.displayInput ?? tc.input) : null,
      expected: pub ? (tc.displayOutput ?? tc.expectedOutput) : null,
      got: pub ? (passed ? tc.expectedOutput : "0") : null,
      status: passed ? "Accepted" : "Wrong Answer",
      error: null,
    };
  });
  const accepted = results.every((r) => r.passed);
  const existing = state().userProblems.get(p.id);
  upsertProgress(p.id, {
    attempts: (existing?.attempts ?? 0) + 1,
    ...(accepted ? { solved: true, solvedAt: new Date().toISOString() } : {}),
  });
  return ok(
    { accepted, passed: results.filter((r) => r.passed).length, total: results.length, results },
    accepted ? "All test cases passed" : "Some test cases failed",
  );
}

/* ────────────────────────────── AI mentor ────────────────────────────── */

function mentorReply(message: string, title: string) {
  const m = message.toLowerCase();
  if (/complexit|big o|time|space/.test(m))
    return `Think about what each pass over the input costs. For **${title}**, can you do it in a single pass with O(1) or O(n) extra memory? Try to name the dominant operation before you count anything.`;
  if (/hint|stuck|how do i|where to start/.test(m))
    return `Start from the brute force for **${title}** and ask: which work is being repeated? Usually there's a data structure (hash map, heap, two pointers) that remembers that work for you. What would you need to remember?`;
  if (/edge|corner|fail/.test(m))
    return `Good instinct. List the degenerate inputs first: empty input, a single element, all duplicates, negatives, and the maximum constraint. Which of those does your current approach mishandle?`;
  return `I'm only here to help with **${title}** — let's stay focused. Tell me your current approach in one or two sentences and I'll point out what to improve.`;
}

/* ────────────────────────────── interviews ────────────────────────────── */

const findInterview = (id: string) => state().interviews.find((i) => i.id === id) ?? null;

const interviewListRow = (i: MockInterview) => ({
  ...i,
  feedback: i.feedback
    ? {
        overallScore: i.feedback.overallScore,
        confidence: i.feedback.confidence,
        depthReview: i.feedback.depthReview,
        englishQuality: i.feedback.englishQuality,
      }
    : null,
  user: { interviewCredits: state().credits, premium: MOCK_USER.premium, id: MOCK_USER.id },
});

const FOLLOW_UPS = [
  "Thanks for sharing. Let's get into it — given an array of integers and a target, return the indices of two numbers that add up to the target. How would you approach it?",
  "Good. What's the time and space complexity of that, and can you improve either one if the input is sorted?",
  "Nice. What breaks if the array contains duplicates or negative numbers?",
  "Let's switch to a sliding-window problem: longest substring without repeating characters. Walk me through it.",
  "How would you test your solution? Name the three edge cases you'd try first.",
  "Last question — describe a time you had to debug a problem under time pressure. What did you do?",
];

function sse(data: object) {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

async function roomTurn(id: string, req: Request) {
  const interview = findInterview(id);
  if (!interview || interview.status !== "active") return fail("Interview not found or not active", 404);
  const { userResponse = "" } = await readJson<{ userResponse?: string }>(req);
  const s = state();
  const live = s.interviewSessions.get(id) ?? {
    transcript: [],
    turnCount: 0,
    questionLimit: interview.questionLimit ?? 5,
  };
  live.transcript.push(String(userResponse));
  live.turnCount += 1;

  const isEnding = live.turnCount >= live.questionLimit;
  const text = isEnding
    ? "That's all the questions I had. Thank you — you communicated clearly and reasoned well under pressure. I'll compile your report now."
    : FOLLOW_UPS[(live.turnCount - 1) % FOLLOW_UPS.length];
  live.transcript.push(text);
  s.interviewSessions.set(id, live);

  const parts = text.split(/(?<=[.?!])\s+/);
  const stream = new ReadableStream({
    async start(controller) {
      for (let seq = 0; seq < parts.length; seq++) {
        await sleep(350);
        controller.enqueue(sse({ type: "chunk", seq, text: parts[seq], audio: null }));
      }
      await sleep(200);
      controller.enqueue(sse({ type: "done", isComplete: isEnding, isEnding }));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}

/* ────────────────────────────── dispatcher ────────────────────────────── */

export async function handleMockRequest(req: Request, segments: string[]): Promise<Response> {
  const method = req.method.toUpperCase();
  const path = segments.join("/");
  const url = new URL(req.url);
  const s = state();

  /* better-auth client endpoints */
  if (path.startsWith("auth/")) {
    const sub = path.slice(5);
    if (sub === "get-session") return json(MOCK_SESSION);
    if (sub === "sign-out") return json({ success: true });
    if (sub === "sign-in/social") return json({ url: `${url.origin}/dashboard`, redirect: true });
    if (sub.startsWith("sign-in") || sub.startsWith("sign-up"))
      return json({ redirect: false, token: "mock-session-token", user: MOCK_USER });
    return json({ status: true });
  }

  /* problems */
  let m: RegExpMatchArray | null;
  if (path === "problems" && method === "GET") return listProblems(url);
  if ((m = path.match(/^problems\/([^/]+)\/problem$/))) {
    if (method === "GET") return getProblem(m[1]);
    if (method === "PATCH") return patchProblem(m[1], req);
  }
  if ((m = path.match(/^problems\/([^/]+)\/problem\/execute$/)) && method === "POST") return executeProblem(m[1], req);
  if ((m = path.match(/^problems\/([^/]+)\/problem\/submit$/)) && method === "POST") return submitProblem(m[1], req);
  if ((m = path.match(/^problems\/([^/]+)\/testcases$/)) && method === "GET") {
    const p = problemBySlug(m[1]);
    return p ? json({ success: true, data: p.testCases }) : fail("Problem not found", 404);
  }

  /* sheets */
  if (path === "sheets" && method === "GET") {
    const rows = SHEETS.map(({ sections, ...rest }) => ({
      ...rest,
      problemCount: sections.reduce((n, sec) => n + sec.problems.length, 0),
    }));
    return ok(rows, "Sheets fetched successfully");
  }
  if ((m = path.match(/^sheets\/([^/]+)\/section$/)) && method === "GET") {
    const sheet = sheetBySlug(m[1]);
    if (!sheet) return fail("Sheet not found", 404);
    const ids = sheet.sections.flatMap((sec) => sec.problems.map((p) => p.problemId));
    const userProblems = ids
      .map((id) => s.userProblems.get(id))
      .filter((u): u is MockUserProblem => Boolean(u))
      .map((u) => ({ problemId: u.problemId, solved: u.solved, confidenceV2: u.confidenceV2 }));
    return ok({ ...sheet, userProblems }, "Sheet data fetched successfully");
  }

  /* dashboard */
  if (path === "dashboard" && method === "GET") return json({ success: true, data: buildDashboard() });

  /* AI mentor */
  if (path === "ai-agent") {
    if (method === "GET") {
      const problemId = url.searchParams.get("problemId") ?? "";
      return ok(s.mentorHistory.get(problemId) ?? [], "Chat history fetched successfully");
    }
    if (method === "POST") {
      const { problemId = "", message = "" } = await readJson<{ problemId?: string; message?: string }>(req);
      const p = problemById(problemId);
      if (!p) return fail("Problem not found", 404);
      await sleep(900);
      const reply = mentorReply(String(message), p.title);
      const history = s.mentorHistory.get(problemId) ?? [];
      s.mentorHistory.set(problemId, [...history, { role: "user", text: String(message) }, { role: "model", text: reply }]);
      return ok(reply, "Response fetched successfully");
    }
  }

  /* feedback */
  if (path === "feedback" && method === "POST") {
    const body = await readJson<{ message?: string; importance?: string }>(req);
    return ok({ id: nextId("sug"), ...body, createdAt: new Date().toISOString() }, "Suggestion submitted successfully");
  }

  /* interviews */
  if (path === "interview" && method === "GET") {
    const rows = [...s.interviews]
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .map(interviewListRow);
    return ok(rows, "Previous interviews fetched successfully");
  }
  if (path === "interview/new-interview" && method === "POST") {
    const body = await readJson<{ type?: string; company?: string; difficulty?: string; noOfQuestions?: number }>(req);
    if (s.credits <= 0) return fail("Not enough credits to start an interview", 400);
    s.credits -= 1;
    const interview: MockInterview = {
      id: nextId("intv"),
      userId: MOCK_USER.id,
      mode: body.type ?? "Technical",
      status: "notStarted",
      startedAt: new Date().toISOString(),
      completedAt: null,
      difficulty: body.difficulty ?? "Mid",
      company: body.company ?? "Generic",
      questionLimit: Number(body.noOfQuestions) || 5,
      resumeKeywords: [],
      feedback: null,
    };
    s.interviews.unshift(interview);
    await sleep(300);
    return ok(interview.id, "Interview created successfully", 201);
  }
  if ((m = path.match(/^interview\/([^/]+)$/))) {
    const interview = findInterview(m[1]);
    if (method === "GET") return interview ? ok(interview, "Interview fetched successfully") : fail("Interview not found", 404);
    if (method === "DELETE") {
      if (!interview) return fail("Unable to delete the interview at the moment", 500);
      s.interviews = s.interviews.filter((i) => i.id !== interview.id);
      return ok(interview.id, "Interview deleted successfully");
    }
  }
  if ((m = path.match(/^interview\/([^/]+)\/join-interview$/)) && method === "POST") {
    const interview = findInterview(m[1]);
    // mock is forgiving: an "active" room can be re-joined so the UI can be reviewed repeatedly
    if (!interview || (interview.status !== "notStarted" && interview.status !== "active"))
      return fail("Interview does not exists or has already been completed", 404);
    interview.status = "active";
    interview.startedAt = new Date().toISOString();
    const greetingMessage = `Hi! Welcome to your ${interview.company}, ${interview.difficulty}-level ${interview.mode} interview — I'm glad you're here today. This is a safe space to think out loud, take your time, and show what you know. Before we get started, how are you feeling?`;
    s.interviewSessions.set(interview.id, {
      transcript: [greetingMessage],
      turnCount: 0,
      questionLimit: interview.questionLimit ?? 5,
    });
    await sleep(1200);
    return ok({ greetingMessage, audio: null }, "Interview started successfully");
  }
  if ((m = path.match(/^interview\/([^/]+)\/join-interview\/room$/)) && method === "PATCH") return roomTurn(m[1], req);
  if ((m = path.match(/^interview\/([^/]+)\/exit-interview$/)) && method === "PATCH") {
    const interview = findInterview(m[1]);
    if (!interview) return fail("Interview does not exists ", 404);
    const live = s.interviewSessions.get(interview.id);
    interview.status = "ready";
    interview.completedAt = new Date().toISOString();
    interview.feedback = buildFeedback(interview.id, interview.mode, live?.transcript ?? [], 7.4);
    s.interviewSessions.delete(interview.id);
    return ok(null, "Interview ended successfully, analysis is being processed");
  }
  if ((m = path.match(/^interview\/([^/]+)\/report$/)) && method === "GET") {
    const interview = findInterview(m[1]);
    if (!interview?.feedback) return ok(null, "Report fetched successfully");
    const { company, mode, difficulty, startedAt, completedAt } = interview;
    return ok({ ...interview.feedback, interview: { company, mode, difficulty, startedAt, completedAt } }, "Report fetched successfully");
  }

  return fail(`Mock route not implemented: ${method} /api/${path}`, 404);
}
