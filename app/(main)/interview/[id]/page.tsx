import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import InterviewDetail from "../../../../components/interview/InterviewDetail";

export default async function InterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/sign-in");

  const { id } = await params;

  const interview = await prisma.interview.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      feedback: true,
    },
  });

  if (!interview) notFound();

  // If interview hasn't started yet, redirect to the lobby
  if (interview.status === "notStarted") {
    const params = new URLSearchParams({
      interviewId: interview.id,
      mode: interview.mode,
      company: interview.company,
      difficulty: interview.difficulty || "senior",
      questions: (interview.questionLimit || 8).toString(),
    });
    redirect(`/interview/new-session?${params.toString()}`);
  }

  // Otherwise redirect to the report page
  redirect(`/interview/${id}/report`);
}
