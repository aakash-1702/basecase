import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import SheetDetailPage from "./SheetDetail";

const Page = async ({ params }: { params: Promise<{ sheetSlug: string }> }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const { sheetSlug } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/sheets/${sheetSlug}/section`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        cookie: (await headers()).get("cookie") ?? "",
      },
      cache: "no-store",
    },
  );

  if (!res.ok) redirect("/sheets");

  const json = await res.json();

  // userProblems contains { problemId, solved, confidenceV2 } for all attempted problems
  const { userProblems = [], ...sheet } = json.data;

  const solvedProblemIds: string[] = userProblems
    .filter((up: { solved: boolean }) => up.solved)
    .map((up: { problemId: string }) => up.problemId);

  const confidenceMap: Record<string, string | null> = Object.fromEntries(
    userProblems.map((up: { problemId: string; confidenceV2: string | null }) => [
      up.problemId,
      up.confidenceV2,
    ]),
  );

  return <SheetDetailPage data={sheet} initialSolvedIds={solvedProblemIds} initialConfidenceMap={confidenceMap} />;
};

export default Page;
