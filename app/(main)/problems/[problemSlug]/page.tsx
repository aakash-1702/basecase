import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";
import ProblemPage from "./Problem";
import { headers } from "next/headers";

const page = async ({
  params,
}: {
  params: Promise<{ problemSlug: string }>;
}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/auth/sign-in");
  }

  const { problemSlug } = await params;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/problems/${problemSlug}/problem`,
    {
      method: "GET",
      headers: {
        "content-type": "application/json",
        cookie: (await headers()).get("cookie") ?? "",
      },
      cache: "no-store",
      credentials: "include",
    },
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("Error fetching problem details:", error);
    redirect("/problems");
    return;
  }

  const data = await response.json();

  return (
    <div>
      <ProblemPage problem={data.data.problem} userProblem={data.data.userProgress} />
    </div>
  );
};

export default page;