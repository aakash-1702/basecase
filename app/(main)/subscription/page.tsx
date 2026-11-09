import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-session";
import { SubscriptionPage } from "@/components/subscription/SubscriptionPage";

export const metadata: Metadata = {
  title: "BaseCase Pro",
  description: "Unlock AI mock interviews, feedback reports and the AI mentor.",
};

export default async function Subscription() {
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/sign-in");

  return (
    <SubscriptionPage
      isPremium={session.user.premium ?? false}
      userName={session.user.name ?? "User"}
    />
  );
}
