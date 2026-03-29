import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";
import ProblemPage from "./Problem";
import { headers } from "next/headers";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ problemSlug: string }>;
}): Promise<Metadata> {
  const { problemSlug } = await params;

  const problem = await prisma.problem.findUnique({
    where: { slug: problemSlug },
    select: {
      title: true,
      description: true,
      difficulty: true,
      tags: true,
      slug: true,
    },
  });

  if (!problem) {
    return {
      title: "Problem Not Found",
      robots: { index: false, follow: false },
    };
  }

  const tagText = problem.tags.slice(0, 4).join(", ");
  const description =
    `Solve ${problem.title} (${problem.difficulty}) on BaseCase.` +
    (tagText ? ` Topics: ${tagText}.` : "");

  return {
    title: problem.title,
    description,
    alternates: {
      canonical: `/problems/${problem.slug}`,
    },
    openGraph: {
      title: `${problem.title} | BaseCase`,
      description,
      type: "article",
      images: [
        {
          url: `/problems/${problem.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${problem.title} problem preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${problem.title} | BaseCase`,
      description,
      images: [`/problems/${problem.slug}/opengraph-image`],
    },
    keywords: [
      problem.title,
      problem.difficulty,
      ...problem.tags,
      "coding problem",
      "interview question",
    ],
  };
}

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
  const problem = data.data.problem;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: problem.title,
    description: problem.description || `Practice ${problem.title} on BaseCase`,
    educationalLevel: problem.difficulty,
    url: `${process.env.NEXT_PUBLIC_APP_URL || "https://basecase.example.com"}/problems/${problem.slug}`,
    keywords: Array.isArray(problem.tags) ? problem.tags.join(", ") : "",
    learningResourceType: "Coding problem",
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProblemPage
        problem={problem}
        userProblem={data.data.userProgress}
        isPremium={session.user.premium ?? false}
      />
    </div>
  );
};

export default page;
