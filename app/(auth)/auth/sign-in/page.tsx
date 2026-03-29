export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import SignInForm from "@/components/SignIn";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to BaseCase and continue your interview prep journey.",
  robots: {
    index: false,
    follow: false,
  },
};

const page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }
  return (
    <div>
      <SignInForm />
    </div>
  );
};

export default page;
