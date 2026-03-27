"use client";

import React, { useState, useEffect } from "react";
import { RoadmapLandingClient } from "@/components/roadmap/RoadmapLandingClient";

interface Roadmap {
  id: string;
  title: string;
  description: string;
  company: string;
  prepLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  status: string;
  createdAt: string;
  userId: string;
  data?: {
    weeks: any[];
  };
}

interface PublicRoadmap extends Roadmap {
  user: {
    name: string;
    image: string | null;
  };
}

interface ApiResponse {
  success: boolean;
  data: {
    publicRoadmaps: PublicRoadmap[];
    userRoadmaps: Roadmap[];
    user: {
      id: string | null;
      premium: boolean;
      roadmapCredits: number;
      isAuthenticated: boolean;
    };
  };
  message: string;
}

export function RoadmapPageWrapper() {
  const [data, setData] = useState<ApiResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/roadmap");
        const result: ApiResponse = await response.json();

        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch roadmaps:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [refreshKey]);

  // Expose refresh function globally for child components
  useEffect(() => {
    (window as any).refreshRoadmaps = () => setRefreshKey((prev) => prev + 1);
    return () => {
      delete (window as any).refreshRoadmaps;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500/20 border-t-amber-500" />
          <p className="text-sm text-neutral-400">Loading roadmaps...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-400">Failed to load roadmaps</p>
      </div>
    );
  }

  return (
    <RoadmapLandingClient
      currentUserId={data.user.id}
      credits={data.user.roadmapCredits}
      userRoadmaps={data.userRoadmaps}
      communityRoadmaps={data.publicRoadmaps}
      isPremium={data.user.premium}
      isAuthenticated={data.user.isAuthenticated}
    />
  );
}
