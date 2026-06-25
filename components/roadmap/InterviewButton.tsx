"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Loader2, Crown, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface InterviewButtonProps {
  company: string;
  interviewTopics?: string[];
  hasInterviewAttempted: boolean;
  hasInterviewCredits: boolean;
  isOwner: boolean;
  weekNumber: number;
  isAuthenticated: boolean;
}

export function InterviewButton({
  company,
  interviewTopics,
  hasInterviewAttempted,
  hasInterviewCredits,
  isOwner,
  weekNumber,
  isAuthenticated,
}: InterviewButtonProps) {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  // If not authenticated, show "Sign in" button
  if (!isAuthenticated) {
    return (
      <Link href="/auth/sign-in" className="block mt-4">
        <Button
          variant="outline"
          className={cn(
            "w-full font-medium",
            "bg-gradient-to-r from-amber-500/10 to-purple-500/10",
            "border-amber-500/30 text-amber-400",
            "hover:from-amber-500 hover:to-purple-500 hover:text-black",
            "transition-all duration-300 ease-out",
            "hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-0.5",
            "active:translate-y-0 active:shadow-none",
          )}
        >
          <LogIn className="h-4 w-4 mr-2" />
          Sign in to Take Interview
        </Button>
      </Link>
    );
  }

  // If not owner (viewing someone else's roadmap), don't show any button
  if (!isOwner) {
    return null;
  }

  // Check if user can take interview
  const canTakeInterview = hasInterviewCredits;

  const handleGiveInterview = async () => {
    if (isCreating) return;

    setIsCreating(true);

    try {
      // TODO: Implement API call to create interview
      const difficulty =
        interviewTopics?.join(", ") || `Week ${weekNumber} Topics`;

      const response = await fetch("/api/interview/new-interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "Technical",
          company: company,
          difficulty: "Mid", // Default to Mid for now
          noOfQuestions: 5,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create interview");
      }

      // Success - redirect to interview room
      toast.success("Interview created successfully!");
      router.push(`/interview/${result.data}`);
    } catch (error: any) {
      console.error("Failed to create interview:", error);
      toast.error(error.message || "Failed to create interview");
    } finally {
      setIsCreating(false);
    }
  };

  // Show "Upgrade to Premium" button if can't take interview
  if (!canTakeInterview) {
    return (
      <Link href="/subscription" className="block mt-4">
        <Button
          variant="outline"
          className={cn(
            "w-full font-medium",
            "bg-gradient-to-r from-amber-500/10 to-purple-500/10",
            "border-amber-500/30 text-amber-400",
            "hover:from-amber-500 hover:to-purple-500 hover:text-black",
            "transition-all duration-300 ease-out",
            "hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-0.5",
            "active:translate-y-0 active:shadow-none",
          )}
        >
          <Crown className="h-4 w-4 mr-2" />
          Upgrade to Premium for More Interviews
        </Button>
      </Link>
    );
  }

  // Show "Give Interview" button
  return (
    <Button
      onClick={handleGiveInterview}
      disabled={isCreating}
      variant="outline"
      className={cn(
        "w-full font-medium mt-4",
        "bg-amber-500/10 border-amber-500/30 text-amber-400",
        "hover:bg-amber-500 hover:border-amber-500 hover:text-black",
        "transition-all duration-300 ease-out",
        "hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-0.5",
        "active:translate-y-0 active:shadow-none",
        isCreating && "opacity-50 cursor-not-allowed",
      )}
    >
      {isCreating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Creating Interview...
        </>
      ) : (
        <>
          <Mic className="h-4 w-4 mr-2" />
          Give Interview
        </>
      )}
    </Button>
  );
}
