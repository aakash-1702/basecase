import SignupForm from "@/components/SignUp";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";
import { headers } from "next/headers";

const page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }
  return (
    <div>
      <SignupForm />
    </div>
  );
};

export default page;
