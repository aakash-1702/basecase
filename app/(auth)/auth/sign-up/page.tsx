import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-session";
import { MOCK_MODE } from "@/lib/mock/mode";
import SignupForm from "@/components/SignUp";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create account",
};

export default async function SignUpPage() {
  const session = await getServerSession();
  // In mock mode everyone is "signed in"; keep the page reachable for UI review.
  if (session && !MOCK_MODE) redirect("/dashboard");

  return <SignupForm />;
}
