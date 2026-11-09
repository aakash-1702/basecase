import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-session";
import Sheets from "./Sheets";

export const metadata: Metadata = {
  title: "Sheets",
  description:
    "Curated, topic-wise DSA sheets with handpicked problems and synced progress.",
};

export default async function Page() {
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/sign-in");

  return <Sheets />;
}
