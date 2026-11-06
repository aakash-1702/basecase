import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-session";
import LoadingScreen from "@/components/shared/LoadingScreen";
import ProblemsPage from "./Problems";

export const metadata: Metadata = {
  title: "Problems",
  description:
    "Handpicked DSA problems with real interview patterns and synced progress.",
};

export default async function Page() {
  const session = await getServerSession();
  if (!session) redirect("/auth/sign-in");

  return (
    // useSearchParams() inside <ProblemsPage /> needs a Suspense boundary.
    <Suspense fallback={<LoadingScreen title="Loading problems" />}>
      <ProblemsPage />
    </Suspense>
  );
}
