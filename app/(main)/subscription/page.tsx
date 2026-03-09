import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SubscriptionPage } from "@/components/subscription/SubscriptionPage";

export default async function Subscription() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/sign-in");

  return (
    <SubscriptionPage
      isPremium={session.user.premium ?? false}
      userName={session.user.name ?? "User"}
    />
  );
}
