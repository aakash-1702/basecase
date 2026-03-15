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

/**
 * Creates a new interview.
 * @throws {Error} - If there is an error creating the interview.
 * @returns {NextResponse} - A response object with the created interview's ID.
 * @throws {NextResponse} - A 401 response if the user is not authorized.
 * @throws {NextResponse} - A 400 response if the request body is invalid.
 * @throws {NextResponse} - A 500 response if there is an internal server error.
 */
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

  // seeing if the user has enough credits to start an interview

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

    const [updatedUser, interview] = await prisma.$transaction([
      prisma.user.update({
        where: {
          id: session.user.id,
          interviewCredits: { gt: 0 },
        },
        data: {
          interviewCredits: {
            decrement: 1,
          },
        },
      }),

      prisma.interview.create({
        data: {
          userId: session.user.id,
          mode: parsedData.data.type,
          company: parsedData.data.company,
          difficulty: parsedData.data.difficulty,
          questionLimit: parsedData.data.noOfQuestions,
          startedAt: new Date(),
        },
      }),
    ]);







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
  } catch (error : any) {
    console.log(error);

    if(error.code === "P2025") {
      return NextResponse.json({
        success : false,
        data : null,
        message : "Not enough credits to start an interview"
      },{
        status : 400
      });
    }
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
