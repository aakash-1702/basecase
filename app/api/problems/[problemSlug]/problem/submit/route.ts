import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { LANGUAGE_IDS, JUDGE0_URL } from "@/lib/judge0";

const decode = (val: string | null) =>
  val ? Buffer.from(val, "base64").toString("utf-8") : "";

export async function POST(
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
    const { code, language } = await req.json();

    const languageId = LANGUAGE_IDS[language];
    if (!languageId) {
      return NextResponse.json(
        { success: false, data: null, message: "Unsupported language" },
        { status: 400 },
      );
    }

    // Fetch problem with ALL test cases including visibility
    const problem = await prisma.problem.findUnique({
      where: { slug: problemSlug },
      select: {
        id: true,
        testCases: {
          orderBy: { order: "asc" },
          select: {
            input: true,
            expectedOutput: true,
            displayInput: true,
            displayOutput: true,
            visibility: true,
          },
        },
      },
    });

    if (!problem) {
      return NextResponse.json(
        { success: false, data: null, message: "Problem not found" },
        { status: 404 },
      );
    }

    if (problem.testCases.length === 0) {
      return NextResponse.json(
        { success: false, data: null, message: "No test cases found" },
        { status: 404 },
      );
    }

    // Encode code once outside loop
    const encodedCode = Buffer.from(code).toString("base64");

    const results = [];
    let compileErrored = false;

    for (const tc of problem.testCases) {
      if (compileErrored) {
        results.push({
          passed: false,
          input: null,
          expected: null,
          got: null,
          status: "Skipped",
        });
        continue;
      }

      const cleanInput = tc.input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      const encodedStdin = Buffer.from(cleanInput).toString("base64");

      // Submit to Judge0
      const submitRes = await fetch(
        `${JUDGE0_URL}/submissions?base64_encoded=true&wait=false`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source_code: encodedCode,
            language_id: languageId,
            stdin: encodedStdin,
          }),
        },
      );

      const { token } = await submitRes.json();

      if (!token) {
        results.push({
          passed: false,
          input:
            tc.visibility === "PUBLIC" ? (tc.displayInput ?? tc.input) : null,
          expected:
            tc.visibility === "PUBLIC"
              ? (tc.displayOutput ?? tc.expectedOutput)
              : null,
          got: null,
          status: "Submission Failed",
        });
        continue;
      }

      // Poll for result
      let result = null;
      for (let i = 0; i < 10; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        const pollRes = await fetch(
          `${JUDGE0_URL}/submissions/${token}?base64_encoded=true&fields=stdout,stderr,compile_output,status`,
          { method: "GET" },
        );
        result = await pollRes.json();
        if (result.status.id !== 1 && result.status.id !== 2) break;
      }

      if (!result) {
        results.push({
          passed: false,
          input:
            tc.visibility === "PUBLIC" ? (tc.displayInput ?? tc.input) : null,
          expected:
            tc.visibility === "PUBLIC"
              ? (tc.displayOutput ?? tc.expectedOutput)
              : null,
          got: null,
          status: "Time Limit Exceeded",
        });
        continue;
      }

      const compileOutput = decode(result.compile_output);
      const stderr = decode(result.stderr);
      const stdout = decode(result.stdout).trim();
      const expected = tc.expectedOutput.trim();
      const passed = stdout === expected;

      let status = "Accepted";
      if (compileOutput) {
        status = "Compile Error";
        compileErrored = true;
      } else if (stderr) status = "Runtime Error";
      else if (!passed) status = "Wrong Answer";

      results.push({
        passed,
        input:
          tc.visibility === "PUBLIC" ? (tc.displayInput ?? tc.input) : null,
        expected:
          tc.visibility === "PUBLIC"
            ? (tc.displayOutput ?? tc.expectedOutput)
            : null,
        got: tc.visibility === "PUBLIC" ? stdout : null,
        status,
        error:
          tc.visibility === "PUBLIC" && (compileOutput || stderr)
            ? compileOutput || stderr
            : null,
      });
    }

    const allPassed = results.every((r) => r.passed);
    const passedCount = results.filter((r) => r.passed).length;

    // Update UserProblem in database
    await prisma.userProblem.upsert({
      where: {
        userId_problemId: {
          userId: session.user.id,
          problemId: problem.id,
        },
      },
      update: {
        attempts: { increment: 1 },
        ...(allPassed && {
          solved: true,
          solvedAt: new Date(),
        }),
      },
      create: {
        userId: session.user.id,
        problemId: problem.id,
        attempts: 1,
        solved: allPassed,
        solvedAt: allPassed ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        accepted: allPassed,
        passed: passedCount,
        total: problem.testCases.length,
        results,
      },
      message: allPassed ? "All test cases passed" : "Some test cases failed",
    });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error" },
      { status: 500 },
    );
  }
}
