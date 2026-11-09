import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "@/lib/auth-session";
import { getInterviewSummary } from "@/lib/interviews";
import { InterviewReport } from "@/components/interview/report/InterviewReport";

export const metadata: Metadata = {
  title: "Interview Report",
  description: "Detailed feedback and scores from your mock interview session.",
};

export default async function InterviewReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/sign-in");

  const { id } = await params;
  const interview = await getInterviewSummary(id, session.user.id);
  if (!interview) notFound();

  return <InterviewReport interviewId={interview.id} />;
}
