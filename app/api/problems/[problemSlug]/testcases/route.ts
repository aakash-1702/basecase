import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * POST /api/problems/[problemSlug]/testcases
 * Creates test cases for a problem
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ problemSlug: string }> },
) {
  // ✅ DEV SEED BYPASS (safe)
  const seedKey = req.headers.get("x-seed-key");

  if (
    process.env.NODE_ENV === "development" &&
    seedKey === process.env.SEED_KEY
  ) {
    // skip auth — allow seeding
  } else {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session?.user) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }
  }

  try {
    const { problemSlug } = await params;
    const { testCases } = await req.json();

    // Find the problem by slug
    const problem = await prisma.problem.findUnique({
      where: { slug: problemSlug },
    });

    if (!problem) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Problem not found",
        },
        { status: 404 },
      );
    }

    // Check if test cases already exist for this problem - skip if they do
    const existingCount = await prisma.testCase.count({
      where: { problemId: problem.id },
    });

    if (existingCount > 0) {
      return NextResponse.json(
        {
          success: true,
          data: { count: existingCount },
          message: "Test cases already exist, skipping",
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    // Create test cases
    const createdTestCases = await prisma.testCase.createMany({
      data: testCases.map((tc: any, index: number) => ({
        problemId: problem.id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        displayInput: tc.displayInput || tc.input,
        displayOutput: tc.displayOutput || tc.expectedOutput,
        visibility: tc.visibility || "PRIVATE",
        order: tc.order !== undefined ? tc.order : index + 1,
      })),
    });

    return NextResponse.json(
      {
        success: true,
        data: { count: createdTestCases.count },
        message: `${createdTestCases.count} test cases created successfully`,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Error creating test cases:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Unable to create test cases",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/problems/[problemSlug]/testcases
 * Fetches all test cases for a problem
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ problemSlug: string }> },
) {
  try {
    const { problemSlug } = await params;

    // Find the problem by slug
    const problem = await prisma.problem.findUnique({
      where: { slug: problemSlug },
      include: {
        testCases: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!problem) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Problem not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: problem.testCases,
    });
  } catch (error) {
    console.error("Error fetching test cases:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Unable to fetch test cases",
      },
      { status: 500 },
    );
  }
}
