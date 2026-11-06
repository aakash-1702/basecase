import { MOCK_MODE } from "@/lib/mock/mode";

export interface LandingProblem {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
}

export interface LandingSheet {
  id: string;
  slug: string;
  title: string;
  description: string;
  problemCount: number;
}

export interface LandingData {
  problems: LandingProblem[];
  sheets: LandingSheet[];
  stats: { problems: number; sheets: number; users: number };
}

const FALLBACK: LandingData = {
  problems: [
    { id: "1", slug: "two-sum", title: "Two Sum", description: "Return indices of two numbers that add up to a target.", difficulty: "easy", tags: ["Array", "Hash Table"] },
    { id: "2", slug: "valid-parentheses", title: "Valid Parentheses", description: "Determine if the brackets in a string are balanced.", difficulty: "easy", tags: ["Stack", "String"] },
    { id: "3", slug: "longest-substring-without-repeating-characters", title: "Longest Substring Without Repeating", description: "Length of the longest substring without repeating characters.", difficulty: "medium", tags: ["Sliding Window"] },
    { id: "4", slug: "3sum", title: "3Sum", description: "Find all unique triplets that sum to zero.", difficulty: "medium", tags: ["Two Pointers", "Sorting"] },
    { id: "5", slug: "course-schedule", title: "Course Schedule", description: "Detect whether all courses can be finished given prerequisites.", difficulty: "medium", tags: ["Graph", "Topological Sort"] },
    { id: "6", slug: "trapping-rain-water", title: "Trapping Rain Water", description: "Compute water trapped between bars of an elevation map.", difficulty: "hard", tags: ["Two Pointers", "Stack"] },
  ],
  sheets: [
    { id: "1", slug: "blind-75", title: "Blind 75", description: "The classic list every interview loop is built on.", problemCount: 75 },
    { id: "2", slug: "neetcode-150", title: "NeetCode 150", description: "Pattern-grouped problems from arrays to DP.", problemCount: 150 },
    { id: "3", slug: "striver-sde", title: "Striver's SDE Sheet", description: "Topic-wise coverage for SDE interviews.", problemCount: 191 },
    { id: "4", slug: "top-interview-150", title: "Top Interview 150", description: "The most frequently asked questions, curated.", problemCount: 150 },
  ],
  stats: { problems: 500, sheets: 40, users: 2000 },
};

function truncate(text: string | null | undefined, max = 110) {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

async function fromMock(): Promise<LandingData> {
  const { PROBLEMS, SHEETS } = await import("@/lib/mock/data");
  return {
    problems: PROBLEMS.slice(0, 6).map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: truncate(p.description),
      difficulty: p.difficulty,
      tags: p.tags.slice(0, 3),
    })),
    sheets: SHEETS.slice(0, 4).map((s) => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      description: truncate(s.description, 90),
      problemCount: s.sections.reduce((n, sec) => n + sec.problems.length, 0),
    })),
    stats: { problems: Math.max(PROBLEMS.length, 1), sheets: SHEETS.length, users: 2140 },
  };
}

/** Loads landing-page data straight from the DB (no self-HTTP), from mock
 *  fixtures in mock mode, with a static fallback if the DB is unreachable. */
export async function getLandingData(): Promise<LandingData> {
  if (MOCK_MODE) return fromMock();

  try {
    const { default: prisma } = await import("@/lib/prisma");
    const [problems, sheets, problemCount, sheetCount, userCount] = await Promise.all([
      prisma.problem.findMany({
        where: { isPublic: true, isActive: true },
        orderBy: { createdAt: "asc" },
        take: 6,
        select: { id: true, slug: true, title: true, description: true, difficulty: true, tags: true },
      }),
      prisma.sheet.findMany({
        orderBy: { createdAt: "asc" },
        take: 4,
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          sections: { select: { _count: { select: { problems: true } } } },
        },
      }),
      prisma.problem.count({ where: { isPublic: true, isActive: true } }),
      prisma.sheet.count(),
      prisma.user.count(),
    ]);

    if (problems.length === 0 && sheets.length === 0) return FALLBACK;

    return {
      problems: problems.length
        ? problems.map((p) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            description: truncate(p.description),
            difficulty: p.difficulty,
            tags: p.tags.slice(0, 3),
          }))
        : FALLBACK.problems,
      sheets: sheets.length
        ? sheets.map((s) => ({
            id: s.id,
            slug: s.slug,
            title: s.title,
            description: truncate(s.description, 90),
            problemCount: s.sections.reduce((n, sec) => n + sec._count.problems, 0),
          }))
        : FALLBACK.sheets,
      stats: {
        problems: Math.max(problemCount, 1),
        sheets: Math.max(sheetCount, 1),
        users: Math.max(userCount, 1),
      },
    };
  } catch {
    return FALLBACK;
  }
}
