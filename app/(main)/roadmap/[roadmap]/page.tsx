import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Calendar,
  Circle,
  Lock,
  Globe,
  ChevronDown,
  Mic,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MakePublicButton } from "@/components/roadmap/MakePublicButton";
import { InterviewButton } from "@/components/roadmap/InterviewButton";
import { ProblemLink } from "@/components/roadmap/ProblemLink";

interface Day {
  day: number;
  title: string;
  focus: string;
  tasks: string[];
  problemSlugs: string[];
  isInterviewDay: boolean;
  interviewTopics?: string[];
}

interface Week {
  weekNumber: number;
  theme: string;
  days: Day[];
}

interface RoadmapData {
  title: string;
  description: string;
  weeks: Week[];
}

const prepLevelColors = {
  BEGINNER: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  INTERMEDIATE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  ADVANCED: "bg-red-500/10 text-red-400 border-red-500/20",
};

async function getRoadmapDetails(roadmapId: string, userId: string | null) {
  const roadmap = await prisma.roadmap.findUnique({
    where: { id: roadmapId },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!roadmap) {
    return null;
  }

  const isOwner = Boolean(userId && roadmap.userId === userId);
  if (roadmap.status !== "PUBLIC" && !isOwner) {
    return null;
  }

  let userRoadmap = null;
  let userInterviewCredits = 0;
  if (isOwner && userId) {
    userRoadmap = await prisma.userRoadmap.findUnique({
      where: {
        userId_roadmapId: {
          userId,
          roadmapId,
        },
      },
    });

    // Fetch user's interview credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { interviewCredits: true },
    });
    userInterviewCredits = user?.interviewCredits || 0;
  }

  const solvedProblems = userId
    ? await prisma.userProblem.findMany({
        where: {
          userId,
          solved: true,
        },
        select: {
          problem: {
            select: {
              slug: true,
            },
          },
        },
      })
    : [];

  const solvedSlugsArray = solvedProblems.map((up) => up.problem.slug);

  return {
    roadmap,
    userRoadmap,
    isOwner,
    solvedSlugs: solvedSlugsArray,
    userInterviewCredits,
    isAuthenticated: !!userId,
  };
}

export default async function RoadmapDetailPage({
  params,
}: {
  params: Promise<{ roadmap: string }>;
}) {
  const { roadmap: roadmapId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const data = await getRoadmapDetails(roadmapId, session?.user?.id || null);

  if (!data) {
    notFound();
  }

  const {
    roadmap,
    userRoadmap,
    isOwner,
    solvedSlugs,
    userInterviewCredits,
    isAuthenticated,
  } = data;

  const roadmapData = roadmap.data as unknown as RoadmapData;
  if (!roadmapData || !roadmapData.weeks) {
    notFound();
  }

  const totalWeeks = roadmapData.weeks.length;
  const currentWeek = userRoadmap?.currentWeek || 1;
  const progressPercentage = userRoadmap ? (currentWeek / totalWeeks) * 100 : 0;

  return (
    <div className="min-h-screen pb-20">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header Card */}
        <div
          className={cn(
            "mb-8 rounded-xl border border-white/5 bg-[#0a0a0a] p-8",
            "animate-in fade-in slide-in-from-bottom-4 duration-500",
          )}
        >
          {/* Title & Description */}
          <h1 className="mb-3 text-3xl font-bold text-white">
            {roadmapData.title}
          </h1>
          <p className="mb-6 text-neutral-400">{roadmapData.description}</p>

          {/* Meta Badges */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div
              className={cn(
                "flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-neutral-300",
                "transition-all duration-300 hover:border-amber-500/30 hover:bg-amber-500/5 hover:text-amber-400",
              )}
            >
              <Building2 className="h-4 w-4" />
              {roadmap.company}
            </div>

            <Badge
              variant="outline"
              className={cn(
                "border transition-all duration-300",
                prepLevelColors[roadmap.prepLevel],
              )}
            >
              {roadmap.prepLevel.charAt(0) +
                roadmap.prepLevel.slice(1).toLowerCase()}
            </Badge>

            <div
              className={cn(
                "flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-neutral-300",
                "transition-all duration-300 hover:border-amber-500/30 hover:bg-amber-500/5 hover:text-amber-400",
              )}
            >
              <Calendar className="h-4 w-4" />
              {totalWeeks} week{totalWeeks !== 1 ? "s" : ""}
            </div>

            {roadmap.status === "PRIVATE" && (
              <Badge
                variant="outline"
                className="border-neutral-500/20 text-neutral-400 transition-all duration-300"
              >
                <Lock className="h-3 w-3 mr-1" />
                Private
              </Badge>
            )}

            {roadmap.status === "PUBLIC" && (
              <Badge
                variant="outline"
                className="border-emerald-500/20 text-emerald-400 transition-all duration-300"
              >
                <Globe className="h-3 w-3 mr-1" />
                Public
              </Badge>
            )}
          </div>

          {/* Make Public Button (only for owner with private roadmap) */}
          {isOwner && roadmap.status === "PRIVATE" && (
            <div className="mb-6">
              <MakePublicButton roadmapId={roadmap.id} />
            </div>
          )}

          {/* Progress Bar (only for owner) */}
          {isOwner && userRoadmap && (
            <div>
              <div className="mb-2 flex items-center justify-between text-sm text-neutral-400">
                <span>
                  Week {currentWeek} of {totalWeeks}
                </span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Weeks Accordion */}
        <div className="space-y-4">
          {roadmapData.weeks.map((week, weekIndex) => {
            const completedDays = week.days.filter((day) => {
              if (day.isInterviewDay) return false;
              if (day.problemSlugs.length === 0) return false;
              return day.problemSlugs.every((slug) =>
                solvedSlugs.includes(slug),
              );
            }).length;

            const totalDays = week.days.filter((d) => !d.isInterviewDay).length;
            const weekProgress =
              totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

            return (
              <details
                key={week.weekNumber}
                className={cn(
                  "group rounded-xl border border-white/5 bg-[#0a0a0a] overflow-hidden",
                  "transition-all duration-300",
                  "hover:border-white/10 hover:shadow-lg hover:shadow-amber-500/5",
                  "animate-in fade-in slide-in-from-bottom-2",
                )}
                style={{
                  animationDelay: `${weekIndex * 100}ms`,
                  animationFillMode: "both",
                }}
              >
                <summary
                  className={cn(
                    "flex cursor-pointer items-center justify-between p-6 list-none",
                    "transition-all duration-300",
                    "hover:bg-[#0f0f0f]",
                  )}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white group-hover:text-amber-50 transition-colors duration-300">
                        Week {week.weekNumber} — {week.theme}
                      </h3>
                    </div>
                    <div className="mt-2 flex items-center gap-4">
                      <p className="text-sm text-neutral-400">
                        {completedDays} / {totalDays} days completed
                      </p>
                      {/* Mini progress bar */}
                      <div className="h-1.5 w-24 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                          style={{ width: `${weekProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "ml-4 flex h-8 w-8 items-center justify-center rounded-full",
                      "bg-white/5 text-neutral-400",
                      "transition-all duration-300",
                      "group-hover:bg-amber-500/10 group-hover:text-amber-400",
                      "group-open:rotate-180 group-open:bg-amber-500/10 group-open:text-amber-400",
                    )}
                  >
                    <ChevronDown className="h-5 w-5" />
                  </div>
                </summary>

                {/* Days List */}
                <div className="border-t border-white/5 bg-[#050505] p-6">
                  <div className="space-y-4">
                    {week.days.map((day, dayIndex) => (
                      <div
                        key={day.day}
                        className={cn(
                          "rounded-xl border p-5",
                          "transition-all duration-300",
                          day.isInterviewDay
                            ? "border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-500/5 hover:border-amber-500/50"
                            : "border-white/5 bg-[#0a0a0a] hover:border-white/10 hover:bg-[#0f0f0f]",
                        )}
                        style={{
                          animationDelay: `${dayIndex * 50}ms`,
                        }}
                      >
                        {/* Day Header */}
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "text-xs font-medium px-2 py-0.5 rounded-full",
                                  day.isInterviewDay
                                    ? "bg-amber-500/20 text-amber-400"
                                    : "bg-white/5 text-neutral-400",
                                )}
                              >
                                Day {day.day}
                              </span>
                              {day.isInterviewDay && (
                                <Mic className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                              )}
                            </div>
                            <h4 className="mt-2 text-base font-semibold text-white">
                              {day.title}
                            </h4>
                            <p className="mt-1 text-sm text-neutral-400">
                              {day.focus}
                            </p>
                          </div>
                        </div>

                        {/* Tasks */}
                        <div className="mb-4 space-y-2">
                          {day.tasks.map((task, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                "flex items-start gap-3 text-sm text-neutral-300",
                                "transition-all duration-300 hover:text-white",
                              )}
                            >
                              <Circle className="mt-0.5 h-3 w-3 flex-shrink-0 text-neutral-500" />
                              <span>{task}</span>
                            </div>
                          ))}
                        </div>

                        {/* Problems or Interview Topics */}
                        {day.isInterviewDay ? (
                          <>
                            <div className="flex flex-wrap gap-2">
                              {day.interviewTopics?.map((topic, idx) => (
                                <Badge
                                  key={idx}
                                  className={cn(
                                    "bg-amber-500/10 text-amber-400 border border-amber-500/20",
                                    "transition-all duration-300 hover:bg-amber-500/20",
                                  )}
                                >
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                            <InterviewButton
                              company={roadmap.company}
                              interviewTopics={day.interviewTopics}
                              hasInterviewAttempted={
                                userRoadmap?.interviewAttempted || false
                              }
                              hasInterviewCredits={userInterviewCredits > 0}
                              isOwner={isOwner}
                              weekNumber={week.weekNumber}
                              isAuthenticated={isAuthenticated}
                            />
                          </>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {day.problemSlugs.map((slug) => {
                              const isSolved = solvedSlugs.includes(slug);
                              return (
                                <ProblemLink
                                  key={slug}
                                  slug={slug}
                                  isSolved={isSolved}
                                  isAuthenticated={isAuthenticated}
                                />
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </div>
  );
}
