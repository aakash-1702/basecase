import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * Retrieves a problem by its slug.
 *
 * @param {NextRequest} req - The NextRequest object
 * @param {{ params: Promise<{problemSlug: string}> }} - The parameters object
 * @returns {Promise<NextResponse>} - The response object
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ problemSlug: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session?.user) {
    return NextResponse.json(
      { success: false, data: null, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { problemSlug } = await params;
    const problem = await prisma.problem.findUnique({
      where: {
        slug: problemSlug,
      },
    });

    if (!problem) {
      return NextResponse.json(
        { success: false, data: null, message: "Problem not found" },
        { status: 404 },
      );
    }

    console.log(problem);

    return NextResponse.json(
      { success: true, data: problem, message: "Problem fetched successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.log("Error fetching problem details:", error);
    return NextResponse.json(
      { success: false, data: null, message: "Error fetching problem details" },
      { status: 500 },
    );
  }
}

/**
 * Updates a user's progress on a problem
 *
 * @param {NextRequest} req - The NextRequest object
 * @param {{ params: Promise<{ problemSlug: string }> }} - The parameters object
 *
 * @returns {Promise<NextResponse>} - The response object
 */

/**
 * Updates a user's progress on a problem
 *
 * @param {NextRequest} req - The NextRequest object
 * @param {{ params: Promise<{problemSlug: string }> }} - The parameters object
 *
 * @returns {Promise<NextResponse>} - The response object
 *
 * Updates a user's progress on a problem with the given slug. If the problem
 * is not found, returns a 404. If the user is not authenticated, returns
 * a 401. If the request body is invalid, returns a 400. If an
 * unexpected error occurs, returns a 500.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ problemSlug: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json(
      { success: false, data: null, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { problemSlug } = await params;
    const body = await req.json();

    // 1️⃣ Fetch problem (slug must be unique)
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

    // 2️⃣ Fetch existing user progress (may be null)
    const existing = await prisma.userProblem.findUnique({
      where: {
        userId_problemId: {
          userId: session.user.id,
          problemId: problem.id,
        },
      },
    });

    // 3️⃣ Prevent unsolving once solved
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

    // 4️⃣ Build update payload safely
    const toUpdate: any = {};

    if (typeof body.bookmark === "boolean") {
      toUpdate.bookmark = body.bookmark;
    }

    if (typeof body.solved === "boolean") {
      toUpdate.solved = body.solved;
      if (body.solved === true && !existing?.solved) {
        toUpdate.solvedAt = new Date(); // useful later for heatmap
      }
    }

    if (
      body.confidence === "confident" ||
      body.confidence === "neutral" ||
      body.confidence === "shaky"
    ) {
      toUpdate.confidence = body.confidence;
    }

    if (typeof body.notes === "string") {
      toUpdate.notes = body.notes;
    }

    // 5️⃣ Upsert progress
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
        message: "Problem progress updated successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating problem progress:", error);
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error" },
      { status: 500 },
    );
  }
}


