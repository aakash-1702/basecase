import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { InterviewLanding } from "@/components/interview/landing/CommandCenter";

export const metadata: Metadata = {
  title: "Interview Prep — BaseCase",
  description: "Practice with an AI interviewer. Voice-first, feedback-driven mock interviews.",
};

export default async function InterviewDashboard() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/sign-in");

  return <InterviewLanding isPremium={session.user.premium ?? false} />;
}
