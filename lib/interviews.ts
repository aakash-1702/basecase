import { MOCK_MODE } from "@/lib/mock/mode";

/* ──────────────────────────────────────────────────────────────────────────
   Server-side interview reads used by the (main)/interview pages.
   Each call branches to the in-memory fixtures in mock mode so the pages
   never touch Prisma there.
   ────────────────────────────────────────────────────────────────────────── */

export interface InterviewUserMeta {
  premium: boolean;
  interviewCredits: number;
  expiresAt: string | null;
}

export interface InterviewSummary {
  id: string;
  mode: string;
  status: string;
  company: string;
  difficulty: string | null;
  questionLimit: number | null;
}

export async function getInterviewUserMeta(userId: string): Promise<InterviewUserMeta> {
  if (MOCK_MODE) {
    const { MOCK_USER, state } = await import("@/lib/mock/data");
    return {
      premium: MOCK_USER.premium,
      interviewCredits: state().credits,
      expiresAt: MOCK_USER.expiresAt,
    };
  }
  const { default: prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findFirst({
    where: { id: userId },
    select: { premium: true, interviewCredits: true, expiresAt: true },
  });
  return {
    premium: user?.premium ?? false,
    interviewCredits: user?.interviewCredits ?? 0,
    expiresAt: user?.expiresAt?.toISOString() ?? null,
  };
}

export async function getInterviewSummary(
  id: string,
  userId: string,
): Promise<InterviewSummary | null> {
  if (MOCK_MODE) {
    const { state } = await import("@/lib/mock/data");
    const i = state().interviews.find((x) => x.id === id && x.userId === userId);
    if (!i) return null;
    const { mode, status, company, difficulty, questionLimit } = i;
    return { id: i.id, mode, status, company, difficulty, questionLimit };
  }
  const { default: prisma } = await import("@/lib/prisma");
  const i = await prisma.interview.findFirst({
    where: { id, userId },
    select: { id: true, mode: true, status: true, company: true, difficulty: true, questionLimit: true },
  });
  return i;
}
