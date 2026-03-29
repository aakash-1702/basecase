import type { Metadata } from "next";
import LandingPage from "./(landing)/LandingPage";

export const metadata: Metadata = {
  title: "BaseCase - Structured DSA Learning and AI Interview Prep",
  description:
    "Master coding interviews with curated DSA sheets, confidence-based revision, AI mock interviews, and roadmap-driven prep.",
  openGraph: {
    title: "BaseCase - Structured DSA Learning and AI Interview Prep",
    description:
      "Curated sheets, SM-2 spaced repetition, and AI interviews to help you crack technical rounds.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
  },
};

const page = () => {
  return (
    <div>
      <LandingPage />
    </div>
  );
};

export default page;
