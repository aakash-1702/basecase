import { redirect, notFound } from "next/navigation";
import { getServerSession } from "@/lib/auth-session";
import { getInterviewSummary } from "@/lib/interviews";

export default async function InterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/sign-in");

  const { id } = await params;
  const interview = await getInterviewSummary(id, session.user.id);
  if (!interview) notFound();

  // Not started yet → lobby
  if (interview.status === "notStarted") {
    const query = new URLSearchParams({
      interviewId: interview.id,
      mode: interview.mode,
      company: interview.company,
      difficulty: interview.difficulty || "senior",
      questions: (interview.questionLimit || 8).toString(),
    });
    redirect(`/interview/new-session?${query.toString()}`);
  }

  // Otherwise → report
  redirect(`/interview/${id}/report`);
}
