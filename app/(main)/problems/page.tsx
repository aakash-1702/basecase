import React from "react";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ProblemsTable from "./Problems";

export const metadata: Metadata = {
  title: "Problems",
  description:
    "Practice curated DSA problems with filters, difficulty segmentation, and progress tracking.",
  openGraph: {
    title: "Problems | BaseCase",
    description:
      "Solve interview-focused DSA problems with confidence and spaced revision.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

const page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
  }
  return (
    <div>
      <ProblemsTable />
    </div>
  );
};

export default page;
