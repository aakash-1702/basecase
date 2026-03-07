import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { interviews, transcripts } from "@/lib/mockData";
import InterviewDetail from "../../../../components/interview/InterviewDetail";

export default async function InterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/sign-in");

  const { id } = await params;
  const interview = interviews.find((i) => i.id === id);
  if (!interview) notFound();

  const transcript = transcripts[id] || transcripts["1"] || [];

  return <InterviewDetail interview={interview} transcript={transcript} />;
}
