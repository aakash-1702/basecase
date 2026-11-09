import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-session";
import { getDashboardData } from "@/lib/dashboard";
import DashBoard from "./DashBoard";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Track your coding progress, revision schedule, and sheet completion.",
};

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) redirect("/auth/sign-in");

  // Direct call – no HTTP round-trip to our own API route.
  const data = await getDashboardData(session.user.id, session.user.name);

  return <DashBoard data={data} />;
}
