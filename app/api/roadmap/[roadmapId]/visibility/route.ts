import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ roadmapId: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }

  const { roadmapId } = await params;

  try {
    // Check if roadmap exists and user is the owner
    const existingRoadmap = await prisma.roadmap.findUnique({
      where: { id: roadmapId },
      select: { userId: true, status: true },
    });

    if (!existingRoadmap) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Roadmap not found",
        },
        { status: 404 },
      );
    }

    // Verify ownership
    if (existingRoadmap.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "You don't have permission to update this roadmap",
        },
        { status: 403 },
      );
    }

    // Toggle the status
    const newStatus =
      existingRoadmap.status === "PUBLIC" ? "PRIVATE" : "PUBLIC";

    // Update the roadmap
    const updatedRoadmap = await prisma.roadmap.update({
      where: { id: roadmapId },
      data: { status: newStatus },
      select: {
        id: true,
        status: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: updatedRoadmap.id,
          isPublic: updatedRoadmap.status === "PUBLIC",
        },
        message: `Roadmap is now ${newStatus.toLowerCase()}`,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[ROADMAP_VISIBILITY_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Failed to update roadmap visibility",
      },
      { status: 500 },
    );
  }
}
