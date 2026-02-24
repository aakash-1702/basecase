import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import SheetDetailPage from "./SheetDetail";

const Page = async ({ params }: { params: Promise<{ sheetId: string }> }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const { sheetId } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/sheets/${sheetId}/section`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        cookie: (await headers()).get("cookie") ?? "",
      },
    },
  );

  if (!res.ok) redirect("/sheets");

  const json = await res.json();
  const { sheet, solvedProblemsOfSheetByUser } = json.data;

  // Extract all problemIds where userProblems[0].solved === true
  const solvedProblemIds: string[] = solvedProblemsOfSheetByUser
    .flatMap((section: any) => section.problems)
    .filter((item: any) => item.problem.userProblems?.[0]?.solved === true)
    .map((item: any) => item.problem.id);

  return <SheetDetailPage data={sheet} initialSolvedIds={solvedProblemIds} />;
};

export default Page;
