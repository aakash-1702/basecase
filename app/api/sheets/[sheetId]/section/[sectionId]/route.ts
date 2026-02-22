import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sheetId: string; sectionId: string }> },
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

  const { sheetId, sectionId } = await params;
  const section = await prisma.sheetSection.findFirst({
    where: {
      id: sectionId,
      sheetId,
    },
  });

  if (!section) {
    return NextResponse.json(
      { message: "Invalid section for this sheet" },
      { status: 404 },
    );
  }

  const { problemId } = await req.json();

  const last = await prisma.sectionProblem.findFirst({
    where: {
      sectionId,
    },
    orderBy: {
      order: "desc",
    },
    select: {
      order: true,
    },
  });

  const exists = await prisma.sectionProblem.findFirst({
    where: { sectionId, problemId },
  });

  if (exists) {
    return NextResponse.json(
      { message: "Problem already exists in this section" },
      { status: 409 },
    );
  }

  const order = last ? last.order + 1 : 1;
  const problem = await prisma.sectionProblem.create({
    data: {
      sectionId,
      problemId,
      order,
    },
  });

  if (!problem) {
    return NextResponse.json(
      { success: false, data: null, message: "Problem not added" },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { success: true, data: problem, message: "Problem added" },
    { status: 200 },
  );
}


