import React from "react";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Sheets from "./Sheets";

export const metadata: Metadata = {
  title: "DSA Sheets",
  description:
    "Explore curated DSA sheets like Blind 75, NeetCode, and Striver paths with structured progression.",
  openGraph: {
    title: "DSA Sheets | BaseCase",
    description:
      "Topic-wise interview prep sheets with progress tracking and confidence-aware revision.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

const page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session?.user) {
    redirect("/auth/sign-in");
  }

  return (
    <div>
      <Sheets />
    </div>
  );
};

export default page;
