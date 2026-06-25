"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type PrepLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

interface CreateRoadmapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    company: string;
    timespan: string;
    prepLevel: PrepLevel;
  }) => void;
  isLoading?: boolean;
  error?: string | null;
}

const prepLevels: {
  value: PrepLevel;
  label: string;
  description: string;
}[] = [
  {
    value: "BEGINNER",
    label: "Beginner",
    description: "New to case interviews",
  },
  {
    value: "INTERMEDIATE",
    label: "Intermediate",
    description: "Know frameworks, need practice",
  },
  {
    value: "ADVANCED",
    label: "Advanced",
    description: "Ready for timed, complex cases",
  },
];

export function CreateRoadmapModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  error = null,
}: CreateRoadmapModalProps) {
  const [company, setCompany] = useState("");
  const [timespan, setTimespan] = useState("");
  const [prepLevel, setPrepLevel] = useState<PrepLevel | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    company?: string;
    timespan?: string;
    prepLevel?: string;
  }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const errors: { company?: string; timespan?: string; prepLevel?: string } =
      {};

    if (!company.trim()) {
      errors.company = "Company name is required";
    }

    const timespanNum = parseInt(timespan);
    if (
      !timespan ||
      isNaN(timespanNum) ||
      timespanNum < 1 ||
      timespanNum > 12
    ) {
      errors.timespan = "Please enter a valid duration (1-12 weeks)";
    }

    if (!prepLevel) {
      errors.prepLevel = "Please select your preparation level";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    onSubmit({ company, timespan, prepLevel: prepLevel! });
  };

  const handleClose = () => {
    if (!isLoading) {
      setCompany("");
      setTimespan("");
      setPrepLevel(null);
      setValidationErrors({});
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] bg-[#0f0f0f] border border-white/5">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Create Your Roadmap
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            Generate a personalized study plan for your interview preparation
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-medium text-white">
              Company Name
            </Label>
            <Input
              id="company"
              type="text"
              placeholder="e.g. McKinsey, Google, Infosys"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={isLoading}
              className={cn(
                "bg-[#141414] border-white/10 text-white placeholder:text-neutral-500",
                validationErrors.company && "border-red-500/50",
              )}
            />
            {validationErrors.company && (
              <p className="text-xs text-red-400">{validationErrors.company}</p>
            )}
          </div>

          {/* Timespan */}
          <div className="space-y-2">
            <Label
              htmlFor="timespan"
              className="text-sm font-medium text-white"
            >
              Timespan
            </Label>
            <div className="relative">
              <Input
                id="timespan"
                type="number"
                min="1"
                max="12"
                placeholder="No of weeks 1-12"
                value={timespan}
                onChange={(e) => setTimespan(e.target.value)}
                disabled={isLoading}
                className={cn(
                  "bg-[#141414] border-white/10 text-white placeholder:text-neutral-500 pr-20",
                  validationErrors.timespan && "border-red-500/50",
                )}
              />
              {timespan &&
                parseInt(timespan) >= 1 &&
                parseInt(timespan) <= 12 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
                    {timespan} week{parseInt(timespan) !== 1 ? "s" : ""}
                  </span>
                )}
            </div>
            {validationErrors.timespan && (
              <p className="text-xs text-red-400">
                {validationErrors.timespan}
              </p>
            )}
          </div>

          {/* Prep Level */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-white">
              Preparation Level
            </Label>
            <div className="space-y-2">
              {prepLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setPrepLevel(level.value)}
                  disabled={isLoading}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border transition-all",
                    "hover:border-amber-500/40 hover:bg-[#141414]",
                    prepLevel === level.value
                      ? "border-amber-500 bg-amber-500/5"
                      : "border-white/10 bg-[#141414]",
                    isLoading && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          {level.label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-neutral-400">
                        {level.description}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center",
                        prepLevel === level.value
                          ? "border-amber-500"
                          : "border-white/20",
                      )}
                    >
                      {prepLevel === level.value && (
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {validationErrors.prepLevel && (
              <p className="text-xs text-red-400">
                {validationErrors.prepLevel}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-medium"
          >
            {isLoading ? "Generating..." : "Generate My Roadmap"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
