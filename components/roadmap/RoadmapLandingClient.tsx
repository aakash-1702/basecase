"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Sparkles,
  Users,
  Zap,
  Crown,
  ArrowRight,
  Target,
  Calendar,
  TrendingUp,
  LogIn,
} from "lucide-react";
import { CreateRoadmapModal } from "@/components/roadmap/CreateRoadmapModal";
import { LoaderOverlay } from "@/components/roadmap/LoaderOverlay";
import { RoadmapCard } from "@/components/roadmap/RoadmapCard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  user?: {
    name: string;
    image: string | null;
  };
}

interface RoadmapLandingClientProps {
  currentUserId: string | null;
  credits: number;
  userRoadmaps: Roadmap[];
  communityRoadmaps: Roadmap[];
  isPremium: boolean;
  isAuthenticated: boolean;
}

// Animation wrapper component for staggered fade-in
function AnimatedCard({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      )}
    >
      {children}
    </div>
  );
}

// Section animation wrapper
function AnimatedSection({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function RoadmapLandingClient({
  currentUserId,
  credits,
  userRoadmaps,
  communityRoadmaps,
  isPremium,
  isAuthenticated,
}: RoadmapLandingClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [currentCompany, setCurrentCompany] = useState<string>("");
  const [showAllCommunity, setShowAllCommunity] = useState(false);

  const handleCreateRoadmap = async (data: {
    company: string;
    timespan: string;
    prepLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  }) => {
    setIsLoading(true);
    setModalError(null);
    setCurrentCompany(data.company);

    try {
      const response = await fetch("/api/roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to generate roadmap");
      }

      setIsModalOpen(false);
      setIsLoading(false);

      toast.success("Roadmap generated successfully!");

      router.push(`/roadmap/${result.data.id}`);
    } catch (error: any) {
      setIsLoading(false);
      setModalError(error.message || "Something went wrong");
    }
  };

  const visibleCommunityRoadmaps = showAllCommunity
    ? communityRoadmaps
    : communityRoadmaps.slice(0, 4);

  // Show premium view only for authenticated premium users
  if (isAuthenticated && isPremium) {
    return (
      <PremiumView
        currentUserId={currentUserId}
        credits={credits}
        userRoadmaps={userRoadmaps}
        communityRoadmaps={communityRoadmaps}
        visibleCommunityRoadmaps={visibleCommunityRoadmaps}
        showAllCommunity={showAllCommunity}
        setShowAllCommunity={setShowAllCommunity}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        isLoading={isLoading}
        currentCompany={currentCompany}
        modalError={modalError}
        handleCreateRoadmap={handleCreateRoadmap}
      />
    );
  }

  // Show free user view for non-premium authenticated users and unauthenticated users
  return (
    <FreeUserView
      currentUserId={currentUserId}
      communityRoadmaps={communityRoadmaps}
      visibleCommunityRoadmaps={visibleCommunityRoadmaps}
      showAllCommunity={showAllCommunity}
      setShowAllCommunity={setShowAllCommunity}
      isAuthenticated={isAuthenticated}
    />
  );
}

// Premium user view - clean and direct
function PremiumView({
  currentUserId,
  credits,
  userRoadmaps,
  communityRoadmaps,
  visibleCommunityRoadmaps,
  showAllCommunity,
  setShowAllCommunity,
  isModalOpen,
  setIsModalOpen,
  isLoading,
  currentCompany,
  modalError,
  handleCreateRoadmap,
}: {
  currentUserId: string | null;
  credits: number;
  userRoadmaps: Roadmap[];
  communityRoadmaps: Roadmap[];
  visibleCommunityRoadmaps: Roadmap[];
  showAllCommunity: boolean;
  setShowAllCommunity: (show: boolean) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  isLoading: boolean;
  currentCompany: string;
  modalError: string | null;
  handleCreateRoadmap: (data: {
    company: string;
    timespan: string;
    prepLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  }) => Promise<void>;
}) {
  return (
    <>
      <LoaderOverlay show={isLoading} companyName={currentCompany} />

      <CreateRoadmapModal
        open={isModalOpen && !isLoading}
        onOpenChange={setIsModalOpen}
        onSubmit={handleCreateRoadmap}
        isLoading={isLoading}
        error={modalError}
      />

      <div className="min-h-screen pb-20">
        {/* Compact Header for Premium Users */}
        <AnimatedSection delay={0}>
          <section className="px-4 pt-10 pb-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-white">Roadmaps</h1>
                  <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-400">Credits:</span>
                    <Badge
                      className={cn(
                        "px-3 py-1 text-sm font-medium transition-colors duration-300",
                        credits === 0
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : credits <= 2
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                      )}
                    >
                      {credits}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    disabled={credits === 0}
                    className={cn(
                      "bg-amber-500 hover:bg-amber-400 text-black font-medium",
                      "transition-all duration-300 ease-out",
                      "hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-0.5",
                      "active:translate-y-0 active:shadow-none",
                      credits === 0 &&
                        "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none",
                    )}
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Create Roadmap
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* Community Roadmaps Section */}
        <AnimatedSection delay={150}>
          <section className="px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="mb-6 flex items-center gap-3">
                <h2 className="text-xl font-semibold text-white">
                  Community Roadmaps
                </h2>
                <Badge
                  variant="outline"
                  className="border-white/10 text-neutral-400"
                >
                  <Users className="h-3 w-3 mr-1" />
                  {communityRoadmaps.length}
                </Badge>
              </div>

              {communityRoadmaps.length === 0 ? (
                <div className="rounded-xl border border-white/5 bg-[#0a0a0a] p-8 text-center transition-all duration-300 hover:border-white/10">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 animate-pulse">
                    <Users className="h-6 w-6 text-amber-500" />
                  </div>
                  <h3 className="mb-1 text-base font-medium text-white">
                    No public roadmaps yet
                  </h3>
                  <p className="text-sm text-neutral-400">
                    Be the first to share yours
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {visibleCommunityRoadmaps.map((roadmap, index) => (
                      <AnimatedCard key={roadmap.id} index={index}>
                        <RoadmapCard
                          id={roadmap.id}
                          title={roadmap.title}
                          company={roadmap.company}
                          prepLevel={roadmap.prepLevel}
                          totalWeeks={roadmap.data?.weeks.length || 0}
                          createdBy={
                            roadmap.user
                              ? {
                                  name: roadmap.user.name,
                                  image: roadmap.user.image || undefined,
                                }
                              : undefined
                          }
                          isOwn={false}
                          isPublic={roadmap.status === "PUBLIC"}
                          userId={roadmap.userId}
                          currentUserId={currentUserId}
                        />
                      </AnimatedCard>
                    ))}
                  </div>

                  {communityRoadmaps.length > 4 && !showAllCommunity && (
                    <div className="mt-8 flex justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setShowAllCommunity(true)}
                        className={cn(
                          "border-amber-500/20 text-amber-400",
                          "bg-amber-500/5 hover:bg-amber-500/10",
                          "hover:border-amber-500/40",
                          "transition-all duration-300 ease-out",
                          "hover:-translate-y-0.5",
                        )}
                      >
                        Show More
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </AnimatedSection>

        {/* Your Roadmaps Section */}
        <AnimatedSection delay={300}>
          <section className="px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <h2 className="mb-6 text-xl font-semibold text-white">
                Your Roadmaps
              </h2>

              {userRoadmaps.length === 0 ? (
                <div className="rounded-xl border border-white/5 bg-[#0a0a0a] p-8 text-center transition-all duration-300 hover:border-white/10">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                    <Zap className="h-6 w-6 text-amber-500" />
                  </div>
                  <h3 className="mb-1 text-base font-medium text-white">
                    No roadmaps yet
                  </h3>
                  <p className="text-sm text-neutral-400 mb-4">
                    Generate one tailored to your next interview
                  </p>
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    disabled={credits === 0}
                    className={cn(
                      "bg-amber-500 hover:bg-amber-400 text-black font-medium",
                      "transition-all duration-300 ease-out",
                      "hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-0.5",
                      "active:translate-y-0 active:shadow-none",
                      credits === 0 &&
                        "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none",
                    )}
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Create Your First Roadmap
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {userRoadmaps.map((roadmap, index) => (
                    <AnimatedCard key={roadmap.id} index={index}>
                      <RoadmapCard
                        id={roadmap.id}
                        title={roadmap.title}
                        company={roadmap.company}
                        prepLevel={roadmap.prepLevel}
                        totalWeeks={roadmap.data?.weeks.length || 0}
                        isOwn={true}
                        isPublic={roadmap.status === "PUBLIC"}
                        userId={roadmap.userId}
                        currentUserId={currentUserId}
                      />
                    </AnimatedCard>
                  ))}
                </div>
              )}
            </div>
          </section>
        </AnimatedSection>
      </div>
    </>
  );
}

// Free user view - marketing focused with upgrade CTA
function FreeUserView({
  currentUserId,
  communityRoadmaps,
  visibleCommunityRoadmaps,
  showAllCommunity,
  setShowAllCommunity,
  isAuthenticated,
}: {
  currentUserId: string | null;
  communityRoadmaps: Roadmap[];
  visibleCommunityRoadmaps: Roadmap[];
  showAllCommunity: boolean;
  setShowAllCommunity: (show: boolean) => void;
  isAuthenticated: boolean;
}) {
  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <AnimatedSection delay={0}>
        <section className="relative px-4 pt-20 pb-16 sm:px-6 lg:px-8 overflow-hidden">
          <div className="mx-auto max-w-7xl text-center">
            <div className="mb-6 flex justify-center">
              <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-4 py-1.5 animate-pulse">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                AI-Powered Study Plans
              </Badge>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
              Your Interview.
              <br />
              <span className="text-amber-500 inline-block hover:scale-105 transition-transform duration-300">
                Your Pace.
              </span>{" "}
              Your Roadmap.
            </h1>

            <p className="mx-auto max-w-2xl text-lg sm:text-xl text-neutral-400 mb-8">
              AI-generated study plans built around your target company,
              timeline, and current level. Structured preparation that actually
              works.
            </p>

            {/* Feature highlights */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-400 mb-10">
              {[
                { icon: Target, label: "Company-Specific" },
                { icon: Calendar, label: "Custom Timeline" },
                { icon: TrendingUp, label: "Level Adapted" },
              ].map((feature, index) => (
                <div
                  key={feature.label}
                  className="flex items-center gap-2 transition-all duration-300 hover:text-amber-400 cursor-default"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <feature.icon className="h-4 w-4 text-amber-500" />
                  <span>{feature.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Animated background gradient */}
          <div
            className="absolute inset-0 -z-10 opacity-30 animate-pulse"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)`,
              animationDuration: "4s",
            }}
          />
        </section>
      </AnimatedSection>

      {/* Community Roadmaps Section */}
      <AnimatedSection delay={200}>
        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">
                Community Roadmaps
              </h2>
              <Badge
                variant="outline"
                className="border-white/10 text-neutral-400"
              >
                <Users className="h-3 w-3 mr-1" />
                {communityRoadmaps.length}
              </Badge>
            </div>

            {communityRoadmaps.length === 0 ? (
              <div className="rounded-xl border border-white/5 bg-[#0a0a0a] p-12 text-center transition-all duration-300 hover:border-white/10">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 animate-pulse">
                  <Users className="h-7 w-7 text-amber-500" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-white">
                  No public roadmaps yet
                </h3>
                <p className="text-sm text-neutral-400">
                  Be the first to share yours with the community
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {visibleCommunityRoadmaps.map((roadmap, index) => (
                    <AnimatedCard key={roadmap.id} index={index}>
                      <RoadmapCard
                        id={roadmap.id}
                        title={roadmap.title}
                        company={roadmap.company}
                        prepLevel={roadmap.prepLevel}
                        totalWeeks={roadmap.data?.weeks.length || 0}
                        createdBy={
                          roadmap.user
                            ? {
                                name: roadmap.user.name,
                                image: roadmap.user.image || undefined,
                              }
                            : undefined
                        }
                        isOwn={false}
                        isPublic={roadmap.status === "PUBLIC"}
                        userId={roadmap.userId}
                        currentUserId={currentUserId}
                      />
                    </AnimatedCard>
                  ))}
                </div>

                {communityRoadmaps.length > 4 && !showAllCommunity && (
                  <div className="mt-8 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setShowAllCommunity(true)}
                      className={cn(
                        "border-amber-500/20 text-amber-400",
                        "bg-amber-500/5 hover:bg-amber-500/10",
                        "hover:border-amber-500/40",
                        "transition-all duration-300 ease-out",
                        "hover:-translate-y-0.5",
                      )}
                    >
                      Show More
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </AnimatedSection>

      {/* Personalized Roadmap CTA Section */}
      <AnimatedSection delay={400}>
        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="group relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-[#0a0a0a] to-[#0a0a0a] transition-all duration-500 hover:border-amber-500/30">
              {/* Decorative elements with animations */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-all duration-700 group-hover:bg-amber-500/10" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 transition-all duration-700 group-hover:bg-amber-500/10" />

              <div className="relative px-8 py-12 sm:px-12 sm:py-16">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                  <div className="lg:max-w-xl">
                    <div className="mb-4 flex items-center gap-2">
                      <Crown className="h-5 w-5 text-amber-500 animate-pulse" />
                      <span className="text-sm font-medium text-amber-400">
                        Premium Feature
                      </span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                      Create Your Personalized Roadmap
                    </h2>

                    <p className="text-neutral-400 mb-6">
                      Get an AI-generated study plan tailored specifically to
                      your target company, preparation timeline, and experience
                      level. Stop guessing what to study — let us build the
                      perfect path for you.
                    </p>

                    <ul className="space-y-3 mb-8">
                      {[
                        "Company-specific preparation strategies",
                        "Day-by-day structured learning path",
                        "Weekly mock interview sessions",
                        "Progress tracking and milestones",
                      ].map((item, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-3 text-neutral-300 transition-all duration-300 hover:text-white hover:translate-x-1"
                        >
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 flex-shrink-0">
                            <svg
                              className="h-3 w-3 text-amber-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          {item}
                        </li>
                      ))}
                    </ul>

                    <Link href={isAuthenticated ? "/subscription" : "/auth/sign-in"}>
                      <Button
                        className={cn(
                          "bg-amber-500 hover:bg-amber-400 text-black font-medium px-6 py-2.5 h-auto",
                          "transition-all duration-300 ease-out",
                          "hover:shadow-lg hover:shadow-amber-500/25 hover:-translate-y-0.5",
                          "active:translate-y-0 active:shadow-none",
                        )}
                      >
                        {isAuthenticated ? (
                          <>
                            <Crown className="h-4 w-4 mr-2" />
                            Upgrade to Premium
                          </>
                        ) : (
                          <>
                            <LogIn className="h-4 w-4 mr-2" />
                            Sign in to Get Started
                          </>
                        )}
                        <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>

                  {/* Decorative roadmap preview with animation */}
                  <div className="hidden lg:block lg:w-80">
                    <div className="rounded-xl border border-white/10 bg-[#050505] p-4 transition-all duration-500 group-hover:border-amber-500/20 group-hover:shadow-lg group-hover:shadow-amber-500/5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-xs text-neutral-400">
                          Sample Roadmap Preview
                        </span>
                      </div>
                      <div className="space-y-3">
                        {[1, 2, 3].map((week) => (
                          <div
                            key={week}
                            className="rounded-lg border border-white/5 bg-white/[0.02] p-3 transition-all duration-300 hover:border-amber-500/20 hover:bg-amber-500/5"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-white">
                                Week {week}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-[10px] border-amber-500/20 text-amber-400 px-1.5 py-0"
                              >
                                7 days
                              </Badge>
                            </div>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                                <div
                                  key={day}
                                  className={cn(
                                    "h-1.5 flex-1 rounded-full transition-all duration-500",
                                    day <= week * 2
                                      ? "bg-gradient-to-r from-amber-500 to-amber-400"
                                      : "bg-white/5",
                                  )}
                                  style={{
                                    transitionDelay: `${day * 50}ms`,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
