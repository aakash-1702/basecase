import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type ProblemUpdate = {
  bookmark?: boolean;
  solved?: boolean;
  notes?: string;
  confidenceV2?: "LOW" | "MEDIUM" | "HIGH";
  interval?: number;
  revision?: number;
  nextAttempt?: Date;
  perceivedDifficulty?: string;
  keyInsight?: string;
  solvedAt?: Date; // Added this property
  problemHardness?: number; // Added this property
};

/**
 * GET /api/problems/[problemSlug]/problem
 * Fetches problem details by slug
 *
 * @param {NextRequest} req - The NextRequest object
 * @param {{ problemSlug: string}} params - The problem slug
 * @returns {Promise<NextResponse>} - The response object
 * @throws {Error} - If there is an error fetching the problem details
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ problemSlug: string }> },
) {
  const seedKey = req.headers.get("x-seed-key");
  let session = null;

  if (
    process.env.NODE_ENV === "development" &&
    seedKey === process.env.SEED_KEY
  ) {
    // bypass auth for seeding
  } else {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  }

  try {
    const { problemSlug } = await params;

    const problem = await prisma.problem.findUnique({
      where: { slug: problemSlug },
      include: {
        // Only send PUBLIC test cases to frontend
        testCases: {
          where: { visibility: "PUBLIC" },
          orderBy: { order: "asc" },
          select: {
            id: true,
            input: true,
            displayInput: true,
            displayOutput: true,
            expectedOutput: true,
            order: true,
            // never send visibility field — unnecessary
          },
        },
        // Only include user progress if user is logged in
        ...(session?.user?.id
          ? {
              userProblems: {
                where: { userId: session.user.id },
                take: 1,
              },
            }
          : {}),
      },
    });

    if (!problem) {
      return NextResponse.json(
        { success: false, data: null, message: "Problem not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          problem,
          userProgress: problem.userProblems?.[0] ?? null,
        },
        message: "Problem fetched successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching problem details:", error);
    return NextResponse.json(
      { success: false, data: null, message: "Error fetching problem details" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/problems/[problemSlug]/problem
 * Updates user progress for a problem
 *
 * @param {NextRequest} req - The NextRequest object
 * @param {{ problemSlug: string}} params - The problem slug
 * @returns {Promise<NextResponse>} - The response object
 * @throws {Error} - If there is an error updating the problem progress
 */

/**
 * Updates user progress for a problem
 *
 * @param {NextRequest} req - The NextRequest object
 * @param {{problemSlug: string}} params - The problem slug
 * @returns {Promise<NextResponse>} - The response object
 * @throws {Error} - If there is an error updating the problem progress
 *
 * Updates user progress for a problem based on the provided body.
 * The body should contain the following fields:
 * - bookmark: boolean (optional) - Whether to bookmark the problem
 * - solved: boolean (optional) - Whether the user has solved the problem
 * - notes: string (optional) - User notes for the problem
 * - confidenceV2: "LOW" | "MEDIUM" | "HIGH" (optional) - User confidence in solving the problem
 * - interval: number (optional) - The interval at which to review the problem
 * - revision: number (optional) - The revision number of the problem
 * - nextAttempt: Date (optional) - The date at which to review the problem
 * - perceivedDifficulty: string (optional) - User perceived difficulty of the problem
 * - keyInsight: string (optional) - User key insight for the problem
 * - solvedAt: Date (optional) - The date at which the user solved the problem
 * - problemHardness: number (optional) - The hardness of the problem
 *
 * Returns a JSON response with the following structure:
 * {
 *   success: boolean,
 *   data: UserProblem | null,
 *   message: string,
 * }
 */

const DIFFICULTY_MAP: Record<string, number> = {
  TOO_EASY: 1,
  EASY: 2,
  JUST_RIGHT: 3,
  HARD: 4,
  VERY_HARD: 5,
};
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ problemSlug: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json(
      { success: false, data: null, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { problemSlug } = await params;
    const body = await req.json();

    const problem = await prisma.problem.findUnique({
      where: { slug: problemSlug },
      select: { id: true },
    });

    if (!problem) {
      return NextResponse.json(
        { success: false, data: null, message: "Problem not found" },
        { status: 404 },
      );
    }

    const existing = await prisma.userProblem.findUnique({
      where: {
        userId_problemId: {
          userId: session.user.id,
          problemId: problem.id,
        },
      },
    });

    // Cannot unsolve
    if (existing?.solved === true && body.solved === false) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Cannot mark a solved problem as unsolved",
        },
        { status: 400 },
      );
    }

    const toUpdate: ProblemUpdate = {};

    if (typeof body.bookmark === "boolean") {
      toUpdate.bookmark = body.bookmark;
    }

    if (typeof body.solved === "boolean") {
      toUpdate.solved = body.solved;
      if (body.solved === true && !existing?.solved) {
        toUpdate.solvedAt = new Date();
        toUpdate.interval = 1;
        toUpdate.revision = 0;
        toUpdate.nextAttempt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      }
    }

    if (["LOW", "MEDIUM", "HIGH"].includes(body.confidenceV2)) {
      toUpdate.confidenceV2 = body.confidenceV2;
      if (existing?.solved === true) {
        if (body.confidenceV2 === "HIGH") {
          toUpdate.interval = (existing.interval ?? 1) * 2;
          toUpdate.revision = (existing.revision ?? 0) + 1;
          toUpdate.nextAttempt = new Date(
            Date.now() + toUpdate.interval * 24 * 60 * 60 * 1000,
          );
        } else if (body.confidenceV2 === "MEDIUM") {
          toUpdate.interval = Math.round((existing.interval ?? 1) * 1.5);
          toUpdate.revision = (existing.revision ?? 0) + 1;
          toUpdate.nextAttempt = new Date(
            Date.now() + toUpdate.interval * 24 * 60 * 60 * 1000,
          );
        } else {
          toUpdate.interval = 1;
          toUpdate.revision = 0;
          toUpdate.nextAttempt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        }
      }
    }

    // Plain notes update — replaces existing notes entirely
    if (typeof body.notes === "string") {
      toUpdate.notes = body.notes;
    }

    // perceivedDifficulty → maps to problemHardness Int
    if (
      typeof body.perceivedDifficulty === "string" &&
      DIFFICULTY_MAP[body.perceivedDifficulty]
    ) {
      toUpdate.problemHardness = DIFFICULTY_MAP[body.perceivedDifficulty];
    }

    // keyInsight → appended to existing notes with double line gap
    if (typeof body.keyInsight === "string" && body.keyInsight.trim()) {
      const insight = body.keyInsight.trim();
      const existingNotes = existing?.notes ?? "";

      if (existingNotes) {
        // Append with two newlines gap after existing notes
        toUpdate.notes = `${existingNotes}\n\n${insight}`;
      } else {
        // No existing notes — just set the insight directly
        toUpdate.notes = insight;
      }
    }

    // Nothing valid to update
    if (Object.keys(toUpdate).length === 0) {
      return NextResponse.json(
        { success: false, data: null, message: "No valid fields to update" },
        { status: 400 },
      );
    }

    const updated = await prisma.userProblem.upsert({
      where: {
        userId_problemId: {
          userId: session.user.id,
          problemId: problem.id,
        },
      },
      update: toUpdate,
      create: {
        userId: session.user.id,
        problemId: problem.id,
        ...toUpdate,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: updated,
        message: "Progress updated successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("PATCH progress error:", error);
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error" },
      { status: 500 },
    );
  }
}
