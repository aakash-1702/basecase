import { auth } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session?.user) {
    return NextResponse.json(
      { success: false, data: null, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { message, importance } = await req.json();

  if (!message || typeof message !== "string") {
    return NextResponse.json(
      { success: false, data: null, message: "Invalid message" },
      { status: 400 },
    );
  }

  const res = await prisma.suggestion.create({
    data: { message: message, importance: importance || "medium" },
  });

  if (!res) {
    return NextResponse.json(
      { success: false, data: null, message: "Failed to submit suggestion" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { success: true, data: res, message: "Suggestion submitted successfully" },
    { status: 200 },
  );
}
