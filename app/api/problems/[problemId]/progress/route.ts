import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ problemId: string }> },
) {
  // checking for the session of the user , like if it is authenticated or not
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session?.user) {
    return NextResponse.json(
      { success: false, data: null, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { problemId } = await params;

  try {
    const { confidence, notes, solved } = await req.json();

    if (!confidence || typeof solved !== "boolean") {
      return NextResponse.json(
        { success: false, data: null, message: "Invalid input" },
        { status: 400 },
      );
    }

    const problem = await prisma.userProblem.upsert({
      where: {
        userId_problemId: {
          userId: session.user.id,
          problemId: problemId,
        },
      },
      update: {
        solved: solved,
        confidence: confidence,
        notes,
        solvedAt: solved ? new Date() : null,
      },
      create: {
        userId: session.user.id,
        problemId: problemId,
        solved: solved,
        confidence: confidence,
        notes,
        solvedAt: solved ? new Date() : null,
      },
    });

    if (!problem) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Something went wrong",
        },
        { status: 501 },
      );
    }

    return NextResponse.json(
      { success: true, data: problem, message: "Success" },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, data: null, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
