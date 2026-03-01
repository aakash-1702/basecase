import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
type ProblemUpdate = {
  bookmark? : boolean,
  solved? : boolean,
  notes? : string,
  confidenceV2? : "LOW" | "MEDIUM" | "HIGH",
  interval? : number,
  revision? : number,
  nextAttempt? : Date,
}

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
    // skip auth — allow seeding
  } else {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  }

  try {
    const { problemSlug } = await params;

    const problem = await prisma.problem.findUnique({
      where: { slug: problemSlug },
    });

    if (!problem) {
      return NextResponse.json(
        { success: false, data: null, message: "Problem not found" },
        { status: 404 },
      );
    }

    // Also fetch user's progress for this problem
    const userProgress = session?.user?.id
      ? await prisma.userProblem.findUnique({
          where: {
            userId_problemId: {
              userId: session.user.id,
              problemId: problem.id,
            },
          },
        })
      : null;

    return NextResponse.json(
      {
        success: true,
        data: { problem, userProgress },
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

    // repetition logic
   

    const toUpdate: ProblemUpdate = {};

    if (typeof body.bookmark === "boolean") {
      toUpdate.bookmark = body.bookmark;
    }

    if (typeof body.solved === "boolean") {
      toUpdate.solved = body.solved;
        if(body.solved === true && existing?.solved === false){
          // i need to put interval as 1 , nextRevision as tomorrow and revision as 0
          toUpdate.interval = 1;
          toUpdate.revision = 0;
          toUpdate.nextAttempt  = new Date(Date.now() + 24 * 60 * 60 * 1000);
        }
    }

    // Updated to use new ConfidenceV2 enum values
    if (["LOW", "MEDIUM", "HIGH"].includes(body.confidenceV2)) {
      toUpdate.confidenceV2 = body.confidenceV2;
      if(existing?.solved === true){
        if(body.confidenceV2 === "HIGH"){
          toUpdate.interval  = existing.interval * 2;
          const newInterval = toUpdate.interval || (existing.interval * 2);
          toUpdate.revision = existing.revision + 1;
          toUpdate.nextAttempt = new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000);
        }else if(body.confidenceV2 === "MEDIUM"){
          toUpdate.interval = Math.round(existing.interval * 1.5);
          const newInterval = toUpdate.interval || (existing.interval * 2);
          toUpdate.revision = existing.revision + 1;
          toUpdate.nextAttempt = new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000);
        }else {
          toUpdate.interval = 1;
          toUpdate.revision = 0;
          toUpdate.nextAttempt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        }
      }      
    }



    if (typeof body.notes === "string") {
      toUpdate.notes = body.notes;
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
