import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { InterviewLanding } from "@/components/interview/landing/CommandCenter";

export default async function InterviewDashboard() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/sign-in");

  return <InterviewLanding isPremium={session.user.premium ?? false} />;
}
