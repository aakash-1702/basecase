import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-session";
import { getInterviewUserMeta } from "@/lib/interviews";
import { InterviewLanding } from "@/components/interview/landing/CommandCenter";

export const metadata: Metadata = {
  title: "Interview Prep",
  description: "Practice with an AI interviewer. Voice-first, feedback-driven mock interviews.",
};

export default async function InterviewDashboard() {
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/sign-in");

  const user = await getInterviewUserMeta(session.user.id);

  return (
    <InterviewLanding
      isPremium={user.premium}
      initialCredits={user.interviewCredits}
      expiresAt={user.expiresAt}
    />
  );
}
