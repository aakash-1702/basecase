import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { LANGUAGE_IDS, JUDGE0_URL } from "@/lib/judge0";

export async function POST(
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
    const { code, language, stdin = "" } = await req.json();

    const languageId = LANGUAGE_IDS[language];

    if (!language || !languageId) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Unsupported Langugage",
        },
        {
          status: 401,
        },
      );
    }

    // encoding data to base64
    const encodedCode = Buffer.from(code).toString("base64");
    const encodedStdin = Buffer.from(stdin).toString("base64");

    // step 1 is gettting the token
    const submitRes = await fetch(
      `${JUDGE0_URL}/submissions?base64_encoded=true&wait=false`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          source_code: encodedCode,
          language_id: languageId,
          stdin: encodedStdin,
        }),
      },
    );

    const { token } = await submitRes.json();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Error submittiing the code , please try again",
        },
        {
          status: 500,
        },
      );
    }

    let result = null;

    // step 2 is polling to get the result
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 1000)); // wait for 1 second before polling

      const pollRes = await fetch(
        `${JUDGE0_URL}/submissions/${token}?base64_encoded=true&fields=stdout,stderr,compile_output,status`,
        { method: "GET" },
      );

      result = await pollRes.json();

      if (result.status.id !== 1 && result.status.id !== 2) {
        break;
      }
    }

    if (!result) {
      return NextResponse.json(
        { error: "Execution timed out" },
        { status: 408 },
      );
    }

    const decode = (val: string | null) =>
      val ? Buffer.from(val, "base64").toString("utf-8") : "";

    return NextResponse.json({
      stdout: decode(result.stdout),
      stderr: decode(result.stderr),
      compile_output: decode(result.compile_output),
      status: result.status.description,
    });
  } catch (error) {
    console.error("Execute route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
