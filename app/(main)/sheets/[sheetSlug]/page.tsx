import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-session";
import type { SheetData } from "@/components/sheets/types";
import SheetDetailPage from "./SheetDetail";

interface UserProblemLite {
  problemId: string;
  solved: boolean;
  confidenceV2: string | null;
}

interface SheetResponse {
  success: boolean;
  data: (SheetData & { userProblems?: UserProblemLite[] }) | null;
}

export default async function Page({
  params,
}: {
  params: Promise<{ sheetSlug: string }>;
}) {
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/sign-in");

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

  const json = (await res.json()) as SheetResponse;
  if (!json.data) redirect("/sheets");

  // userProblems contains { problemId, solved, confidenceV2 } for every attempted problem
  const { userProblems = [], ...sheet } = json.data;

  const solvedProblemIds = userProblems
    .filter((up) => up.solved)
    .map((up) => up.problemId);

  const confidenceMap: Record<string, string | null> = Object.fromEntries(
    userProblems.map((up) => [up.problemId, up.confidenceV2]),
  );

  return (
    <SheetDetailPage
      data={sheet}
      initialSolvedIds={solvedProblemIds}
      initialConfidenceMap={confidenceMap}
    />
  );
}
