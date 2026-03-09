import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { InterviewReport } from "@/components/interview/report/InterviewReport";

export default async function InterviewReportPage({
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
      turns: {
        orderBy: { index: "asc" },
      },
      feedback: true,
    },
  });

  if (!interview) notFound();

  // Build transcript from turns for the report component
  const transcript = interview.turns.map((turn) => ({
    question: turn.question,
    answer: turn.answer,
    feedback: "",
    score: turn.turnScore ?? 0,
    suggestedAnswer: undefined,
  }));

  // Map interview to the shape InterviewReport expects
  const reportInterview = {
    id: interview.id,
    company: interview.company,
    type: interview.mode,
    date: interview.startedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    score: interview.feedback?.overallScore ?? 0,
    questionCount: interview.questionLimit ?? interview.turns.length,
    difficulty: interview.difficulty ?? "—",
    duration: interview.completedAt
      ? `${Math.round((interview.completedAt.getTime() - interview.startedAt.getTime()) / 60000)} min`
      : "—",
    metrics: {
      confidence: ((interview.feedback?.confidence as any)?.score ?? 0) * 10,
      conceptClarity: ((interview.feedback?.depthReview as any)?.score ?? 0) * 10,
      englishClarity: ((interview.feedback?.englishQuality as any)?.score ?? 0) * 10,
      technicalDepth: ((interview.feedback?.technicalAccuracy as any)?.score ?? 0) * 10,
      communicationFlow: 0,
    },
    strongAreas: interview.feedback?.strongAreas ?? [],
    needsWork: interview.feedback?.weakAreas ?? [],
    topics: [],
  };

  return <InterviewReport interview={reportInterview} transcript={transcript} />;
}
