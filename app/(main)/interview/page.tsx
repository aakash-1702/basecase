import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { InterviewLanding } from "@/components/interview/landing/CommandCenter";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Interview",
  description:
    "Practice with an AI interviewer through voice-first, feedback-driven mock interviews.",
  openGraph: {
    title: "Interview Prep | BaseCase",
    description:
      "Run AI-powered mock interviews and improve with structured post-session feedback.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export default async function InterviewDashboard() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/sign-in");

  const user = await prisma.user.findFirst({
    where: { id: session.user.id },
    select: {
      premium: true,
      interviewCredits: true,
      expiresAt: true,
    },
  });

  return (
    <InterviewLanding
      isPremium={user?.premium ?? false}
      initialCredits={user?.interviewCredits ?? 0}
      expiresAt={user?.expiresAt?.toISOString() ?? null}
    />
  );
}
