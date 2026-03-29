import { RoadmapPageWrapper } from "@/components/roadmap/RoadmapPageWrapper";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "AI-powered interview preparation roadmaps",
  openGraph: {
    title: "Roadmaps | BaseCase",
    description:
      "Generate and track structured roadmap plans for interview prep milestones.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function RoadmapPage() {
  return <RoadmapPageWrapper />;
}
