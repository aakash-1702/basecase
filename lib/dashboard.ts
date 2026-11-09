import prisma from "@/lib/prisma";
import { MOCK_MODE } from "@/lib/mock/mode";

/* ──────────────────────────────────────────────────────────────────────────
   Dashboard data
   Shared by `app/api/dashboard/route.ts` (HTTP) and
   `app/(main)/dashboard/page.tsx` (direct server call) so the page never has
   to fetch itself over HTTP. Dates are serialised to ISO strings so both
   callers produce exactly the same shape.
   ────────────────────────────────────────────────────────────────────────── */

export interface DashboardProblem {
  id: string;
  title: string;
  difficulty: string;
  slug: string;
  link: string;
}

export interface SheetProgressItem {
  id: string;
  slug: string;
  title: string;
  total: number;
  solved: number;
  /** 0-100 */
  progress: number;
}

export interface RecentSubmissionItem {
  id: string;
  solvedAt: string | null;
  updatedAt: string;
  problem: DashboardProblem;
}

export interface RevisionItem {
  id: string;
  nextAttempt: string | null;
  problem: DashboardProblem;
}

export interface DashboardData {
  easy: number;
  medium: number;
  hard: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  easyProgress: number;
  mediumProgress: number;
  hardProgress: number;
  /** overall completion, 0-100 */
  completion: number;
  sheetProgress: SheetProgressItem[];
  recentSubmission: RecentSubmissionItem[];
  name: string;
  problemsToRevise: RevisionItem[];
  totalDue: number;
}

const problemSelect = {
  id: true,
  title: true,
  difficulty: true,
  slug: true,
  link: true,
} as const;

const percent = (solved: number, total: number) =>
  total === 0 ? 0 : Math.round((solved / total) * 100);

const iso = (date: Date | null | undefined) => (date ? date.toISOString() : null);

/**
 * Builds the dashboard payload for a user.
 * Runs 6 queries in parallel (previously 7 + 2 per sheet).
 */
export async function getDashboardData(
  userId: string,
  name?: string | null,
): Promise<DashboardData> {
  if (MOCK_MODE) return getMockDashboardData(name);

  const now = new Date();
  const dueWhere = { userId, solved: true, nextAttempt: { lte: now } } as const;

  const [difficultyCounts, solvedRows, sheets, revisionRows, totalDue, recentRows] =
    await Promise.all([
      prisma.problem.groupBy({
        by: ["difficulty"],
        _count: { _all: true },
      }),
      prisma.userProblem.findMany({
        where: { userId, solved: true },
        select: { problemId: true, problem: { select: { difficulty: true } } },
      }),
      prisma.sheet.findMany({
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          title: true,
          slug: true,
          sections: { select: { problems: { select: { problemId: true } } } },
        },
      }),
      prisma.userProblem.findMany({
        where: dueWhere,
        select: { id: true, nextAttempt: true, problem: { select: problemSelect } },
        orderBy: { nextAttempt: "asc" },
        take: 5,
      }),
      prisma.userProblem.count({ where: dueWhere }),
      prisma.userProblem.findMany({
        where: { userId, solved: true },
        select: {
          id: true,
          solvedAt: true,
          updatedAt: true,
          problem: { select: problemSelect },
        },
        orderBy: { solvedAt: "desc" },
        take: 5,
      }),
    ]);

  // ── totals per difficulty ────────────────────────────────────────────────
  const totals = { easy: 0, medium: 0, hard: 0 };
  for (const row of difficultyCounts) {
    totals[row.difficulty] = row._count._all;
  }

  const solved = { easy: 0, medium: 0, hard: 0 };
  const solvedIds = new Set<string>();
  for (const row of solvedRows) {
    solved[row.problem.difficulty] += 1;
    solvedIds.add(row.problemId);
  }

  const totalProblems = totals.easy + totals.medium + totals.hard;
  const totalSolved = solved.easy + solved.medium + solved.hard;

  // ── per-sheet progress (computed in memory from one query) ───────────────
  const sheetProgress: SheetProgressItem[] = sheets.map((sheet) => {
    const problemIds = sheet.sections.flatMap((section) =>
      section.problems.map((p) => p.problemId),
    );
    let solvedInSheet = 0;
    for (const id of new Set(problemIds)) {
      if (solvedIds.has(id)) solvedInSheet += 1;
    }
    return {
      id: sheet.id,
      slug: sheet.slug,
      title: sheet.title,
      total: problemIds.length,
      solved: solvedInSheet,
      progress: percent(solvedInSheet, problemIds.length),
    };
  });

  return {
    easy: totals.easy,
    medium: totals.medium,
    hard: totals.hard,
    easySolved: solved.easy,
    mediumSolved: solved.medium,
    hardSolved: solved.hard,
    easyProgress: percent(solved.easy, totals.easy),
    mediumProgress: percent(solved.medium, totals.medium),
    hardProgress: percent(solved.hard, totals.hard),
    completion: percent(totalSolved, totalProblems),
    sheetProgress,
    recentSubmission: recentRows.map((row) => ({
      id: row.id,
      solvedAt: iso(row.solvedAt),
      updatedAt: row.updatedAt.toISOString(),
      problem: row.problem,
    })),
    name: name?.trim() || "User",
    problemsToRevise: revisionRows.map((row) => ({
      id: row.id,
      nextAttempt: iso(row.nextAttempt),
      problem: row.problem,
    })),
    totalDue,
  };
}

/** Mock-mode twin: same shape, built from the in-memory fixtures. */
async function getMockDashboardData(name?: string | null): Promise<DashboardData> {
  const { buildDashboard } = await import("@/lib/mock/data");
  const d = buildDashboard();
  const pick = (p: { id: string; title: string; difficulty: string; slug: string; link: string } | null): DashboardProblem => ({
    id: p?.id ?? "",
    title: p?.title ?? "Unknown problem",
    difficulty: p?.difficulty ?? "medium",
    slug: p?.slug ?? "",
    link: p?.link ?? "",
  });
  return {
    easy: d.easy,
    medium: d.medium,
    hard: d.hard,
    easySolved: d.easySolved,
    mediumSolved: d.mediumSolved,
    hardSolved: d.hardSolved,
    easyProgress: d.easyProgress,
    mediumProgress: d.mediumProgress,
    hardProgress: d.hardProgress,
    completion: d.completion,
    sheetProgress: d.sheetProgress,
    recentSubmission: d.recentSubmission.map((row) => ({
      id: row.id,
      solvedAt: row.solvedAt,
      updatedAt: row.updatedAt,
      problem: pick(row.problem),
    })),
    name: name?.trim() || d.name,
    problemsToRevise: d.problemsToRevise.map((row) => ({
      id: row.id,
      nextAttempt: row.nextAttempt,
      problem: pick(row.problem),
    })),
    totalDue: d.totalDue,
  };
}
