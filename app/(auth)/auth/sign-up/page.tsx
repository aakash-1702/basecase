export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import SignupForm from "@/components/SignUp";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your BaseCase account and start structured DSA prep.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SignUpPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) redirect("/dashboard");

  return <SignupForm />;
}
