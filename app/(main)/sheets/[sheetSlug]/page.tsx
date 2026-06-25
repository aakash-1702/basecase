import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import SheetDetailPage from "./SheetDetail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sheetSlug: string }>;
}): Promise<Metadata> {
  const { sheetSlug } = await params;

  const sheet = await prisma.sheet.findUnique({
    where: { slug: sheetSlug },
    select: { title: true, description: true, slug: true },
  });

  if (!sheet) {
    return {
      title: "Sheet Not Found",
      robots: { index: false, follow: false },
    };
  }

  const description =
    sheet.description ||
    `Track progress on ${sheet.title} with structured sections and revision-friendly workflow.`;

  return {
    title: sheet.title,
    description,
    alternates: {
      canonical: `/sheets/${sheet.slug}`,
    },
    openGraph: {
      title: `${sheet.title} | BaseCase`,
      description,
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${sheet.title} | BaseCase`,
      description,
      images: ["/opengraph-image"],
    },
  };
}

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
    userProblems.map(
      (up: { problemId: string; confidenceV2: string | null }) => [
        up.problemId,
        up.confidenceV2,
      ],
    ),
  );

  return (
    <SheetDetailPage
      data={sheet}
      initialSolvedIds={solvedProblemIds}
      initialConfidenceMap={confidenceMap}
    />
  );
};

export default Page;
