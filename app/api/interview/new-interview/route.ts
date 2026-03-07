import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse, NextRequest } from "next/server";

enum Difficulty {
  Easy = "Easy",
  Medium = "Medium",
  Hard = "Hard",
}

import * as z from "zod";

const interviewSchema = z.object({
  type: z.enum(["DSA", "Technical", "HR", "Behavioural"]),
  company: z.string(),
  difficulty: z.enum(["Entry", "Mid", "Senior", "Staff"]),
  noOfQuestions: z.coerce.number().int().max(10).min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }

  const { type, company, difficulty, noOfQuestions } = await req.json();

  try {
    const parsedData = await interviewSchema.safeParseAsync({
      type,
      company,
      difficulty,
      noOfQuestions,
    });

    if (!parsedData.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: parsedData.error.issues.map((err) => err.message).join(", "),
        },
        {
          status: 400,
        },
      );
    }

    const interview = await prisma.interview.create({
      data: {
        userId: session.user.id,
        mode: parsedData.data.type,
        company: parsedData.data.company,
        difficulty: parsedData.data.difficulty,
        questionLimit: parsedData.data.noOfQuestions,
        startedAt: new Date(),
      },
    });

    if (!interview) {
      return NextResponse.json(
        { success: false, data: null, message: "Failed to create interview" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: interview.id,
        message: "Interview created successfully",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
