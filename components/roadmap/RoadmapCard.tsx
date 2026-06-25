"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Building2,
  User,
  ArrowRight,
  Globe,
  Lock,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RoadmapCardProps {
  id: string;
  title: string;
  company: string;
  prepLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  totalWeeks: number;
  createdBy?: {
    name: string;
    image?: string;
  };
  progress?: {
    currentWeek: number;
    status: "Not Started" | "In Progress" | "Completed";
  };
  isOwn?: boolean;
  isPublic?: boolean;
  userId?: string;
  currentUserId?: string | null;
  onVisibilityChange?: (roadmapId: string, newIsPublic: boolean) => void;
}

const prepLevelColors = {
  BEGINNER: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  INTERMEDIATE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  ADVANCED: "bg-red-500/10 text-red-400 border-red-500/20",
};

const statusColors = {
  "Not Started": "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
  "In Progress": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export function RoadmapCard({
  id,
  title,
  company,
  prepLevel,
  totalWeeks,
  createdBy,
  progress,
  isOwn = false,
  isPublic = false,
  userId,
  currentUserId,
  onVisibilityChange,
}: RoadmapCardProps) {
  const [localIsPublic, setLocalIsPublic] = useState(isPublic);
  const [isUpdating, setIsUpdating] = useState(false);

  const progressPercentage = progress
    ? (progress.currentWeek / totalWeeks) * 100
    : 0;

  const buttonText = isOwn
    ? progress?.status === "Not Started"
      ? "Start"
      : progress?.status === "Completed"
        ? "Review"
        : "Resume"
    : "View";

  // Check if current user is the owner
  const isOwner = userId && currentUserId && userId === currentUserId;

  // Handle visibility toggle
  const handleVisibilityToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Stop event bubbling

    if (isUpdating) return; // Prevent double clicks

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/roadmap/${id}/visibility`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update visibility");
      }

      // Pessimistic update - only update after successful response
      setLocalIsPublic(result.data.isPublic);

      // Call callback if provided
      if (onVisibilityChange) {
        onVisibilityChange(id, result.data.isPublic);
      }

      // Show success toast
      toast.success(
        result.message ||
          `Roadmap is now ${result.data.isPublic ? "public" : "private"}`,
      );
    } catch (error: any) {
      console.error("Failed to update visibility:", error);
      toast.error("Failed to update roadmap visibility");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Link href={`/roadmap/${id}`} className="block group">
      <div
        className={cn(
          "relative rounded-xl border border-white/5 bg-[#0a0a0a] p-6",
          "transition-all duration-300 ease-out",
          "hover:border-amber-500/20 hover:bg-[#0f0f0f]",
          "hover:shadow-lg hover:shadow-amber-500/5",
          "hover:-translate-y-1",
        )}
      >
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/[0.02] group-hover:to-transparent transition-all duration-300 pointer-events-none" />

        {/* Visibility Toggle Button - Only for Owner */}
        {isOwner && (
          <div className="relative mb-3 flex justify-end">
            <Button
              onClick={handleVisibilityToggle}
              disabled={isUpdating}
              variant="outline"
              size="sm"
              className={cn(
                "h-8 px-3 text-xs font-medium pointer-events-auto",
                localIsPublic
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-black",
                "transition-all duration-300 ease-out",
                "hover:shadow-lg hover:-translate-y-0.5",
                "active:translate-y-0 active:shadow-none",
                isUpdating && "opacity-50 cursor-not-allowed",
              )}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Updating...
                </>
              ) : localIsPublic ? (
                <>
                  <Lock className="h-3.5 w-3.5 mr-1.5" />
                  Make Private
                </>
              ) : (
                <>
                  <Globe className="h-3.5 w-3.5 mr-1.5" />
                  Make Public
                </>
              )}
            </Button>
          </div>
        )}

        {/* Title */}
        <h3 className="relative text-lg font-semibold text-white line-clamp-2 mb-3 group-hover:text-amber-50 transition-colors duration-300">
          {title}
        </h3>

        {/* Meta Information */}
        <div className="relative flex flex-wrap items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors duration-300">
            <Building2 className="h-3.5 w-3.5" />
            <span>{company}</span>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "text-xs border transition-all duration-300",
              prepLevelColors[prepLevel],
            )}
          >
            {prepLevel.charAt(0) + prepLevel.slice(1).toLowerCase()}
          </Badge>

          <div className="flex items-center gap-1.5 text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors duration-300">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {totalWeeks} week{totalWeeks !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Progress Bar (for own roadmaps) */}
        {isOwn && progress && (
          <div className="relative mb-4">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <span>
                Week {progress.currentWeek} of {totalWeeks}
              </span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Status Badge (for own roadmaps) */}
        {isOwn && progress && (
          <div className="relative mb-4">
            <Badge
              variant="outline"
              className={cn("text-xs border", statusColors[progress.status])}
            >
              {progress.status}
            </Badge>
          </div>
        )}

        {/* Created By (for community roadmaps) */}
        {!isOwn && createdBy && (
          <div className="relative flex items-center gap-2 mb-4 text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors duration-300">
            <User className="h-3.5 w-3.5" />
            <span>Created by {createdBy.name}</span>
          </div>
        )}

        {/* Action Button */}
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "relative w-full font-medium",
            "bg-amber-500/10 border-amber-500/20 text-amber-400",
            "hover:bg-amber-500 hover:border-amber-500 hover:text-black",
            "transition-all duration-300 ease-out",
            "group-hover:bg-amber-500/20 group-hover:border-amber-500/30",
          )}
        >
          <span className="flex items-center justify-center gap-2">
            {buttonText}
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </Button>
      </div>
    </Link>
  );
}
