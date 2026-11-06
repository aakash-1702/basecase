import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-session";
import ProblemPage from "./Problem";

export default async function Page({
  params,
}: {
  params: Promise<{ problemSlug: string }>;
}) {
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/sign-in");

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
    },
  );

  if (!response.ok) {
    console.error("Error fetching problem details:", response.status);
    redirect("/problems");
  }

  const data = await response.json();

  return (
    <ProblemPage
      problem={data.data.problem}
      userProblem={data.data.userProgress}
      isPremium={session.user.premium ?? false}
    />
  );
}
