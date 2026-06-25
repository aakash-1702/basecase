import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Fetches all the previous interviews of a user.
 * @returns {NextResponse} - A response object with the previous interviews' data.
 * @throws {NextResponse} - A 401 response if the user is not authorized.
 */
export async function GET() {
  try {
    // verifying the user
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

    // this is the route for providing the information of previous interviews
    const data = await prisma.interview.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        feedback: {
          select: {
            overallScore: true,
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data,
      message: "Previous interviews fetched successfully",
    });
  } catch (error) {
    console.error("Failed to fetch interviews:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Something went wrong fetching interviews",
      },
      { status: 500 },
    );
  }
}
