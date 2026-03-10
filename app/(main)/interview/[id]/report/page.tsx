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
  });

  if (!interview) notFound();

  return <InterviewReport interviewId={interview.id} />;
}
