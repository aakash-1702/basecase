// components/problems/UpdateProgressDialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogPortal,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConfidenceLevel =
  | "not_attempted"
  | "confident"
  | "needs_revision"
  | "failed"
  | "skipped";

interface UpdateProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialConfidence?: ConfidenceLevel;
  initialNotes?: string;
  problemTitle?: string;
  onSave: (confidence: ConfidenceLevel, notes: string) => void;
  onCancel?: () => void;
}

export function UpdateProgressDialog({
  open,
  onOpenChange,
  initialConfidence = "not_attempted",
  initialNotes = "",
  problemTitle = "this problem",
  onSave,
  onCancel,
}: UpdateProgressDialogProps) {
  const [confidence, setConfidence] =
    useState<ConfidenceLevel>(initialConfidence);
  const [notes, setNotes] = useState(initialNotes);

  // Reset form when dialog opens with new initial values
  useEffect(() => {
    if (open) {
      setConfidence(initialConfidence);
      setNotes(initialNotes);
    }
  }, [open, initialConfidence, initialNotes]);

  const handleSaveClick = () => {
    onSave(confidence, notes);
    onOpenChange(false);
  };

  const handleCancelClick = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogContent className="sm:max-w-lg bg-gradient-to-b from-neutral-950 to-neutral-900 border border-neutral-800/80 text-neutral-100 shadow-2xl shadow-black/60">
          <DialogHeader className="space-y-3 pb-2">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-amber-500/20 p-2">
                <CheckCircle2 className="h-6 w-6 text-amber-400" />
              </div>
              <DialogTitle className="text-2xl font-bold text-amber-300 tracking-tight">
                Update Progress
              </DialogTitle>
            </div>
            <DialogDescription className="text-neutral-400 text-base leading-relaxed">
              One click closer to mastery. Mark how you did on{" "}
              <span className="text-amber-300 font-medium">{problemTitle}</span>{" "}
              and leave notes — this helps us craft the perfect next sheet for
              you.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Confidence */}
            <div className="space-y-3">
              <Label
                htmlFor="confidence"
                className="text-neutral-200 font-medium flex items-center gap-2"
              >
                How did it go?
              </Label>
              <Select
                value={confidence}
                onValueChange={(v: ConfidenceLevel) => setConfidence(v)}
              >
                <SelectTrigger
                  id="confidence"
                  className={cn(
                    "bg-neutral-900/80 border-neutral-700 text-neutral-100 h-11 text-base",
                    "transition-all duration-200",
                    "hover:border-amber-600/60 hover:bg-neutral-800/80",
                    "focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50",
                  )}
                >
                  <SelectValue placeholder="Select your confidence level" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-700 text-neutral-100 max-h-[300px]">
                  <SelectItem
                    value="confident"
                    className="hover:bg-amber-950/40 hover:text-amber-300 transition-colors py-3"
                  >
                    Confident – nailed it! 💪
                  </SelectItem>
                  <SelectItem
                    value="needs_revision"
                    className="hover:bg-amber-950/40 hover:text-amber-300 transition-colors py-3"
                  >
                    Needs revision – almost there 👏
                  </SelectItem>
                  <SelectItem
                    value="failed"
                    className="hover:bg-amber-950/40 hover:text-amber-300 transition-colors py-3"
                  >
                    Unable to solve – tough one 😤
                  </SelectItem>
                  <SelectItem
                    value="skipped"
                    className="hover:bg-amber-950/40 hover:text-amber-300 transition-colors py-3"
                  >
                    Skipped for now – no pressure 📅
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <Label htmlFor="notes" className="text-neutral-200 font-medium">
                Notes / Pitfalls / Insights
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Edge case with empty array... O(n) prefix sum trick... common two-pointer mistake..."
                className={cn(
                  "min-h-[120px] bg-neutral-900/80 border-neutral-700 text-neutral-100 resize-none placeholder:text-neutral-600",
                  "transition-all duration-200",
                  "focus-visible:ring-2 focus-visible:ring-amber-500/30 focus-visible:border-amber-500/50",
                )}
              />
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-4 pt-2">
            <Button
              variant="outline"
              onClick={handleCancelClick}
              className={cn(
                "border-neutral-600 bg-neutral-800 text-neutral-100",
                "hover:bg-neutral-700 hover:border-neutral-500 hover:text-white",
                "transition-all duration-200",
              )}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveClick}
              className={cn(
                "bg-gradient-to-r from-amber-600 to-orange-600",
                "hover:from-amber-500 hover:to-orange-500",
                "text-white font-medium shadow-lg shadow-amber-900/30",
                "transition-all duration-200 hover:shadow-xl hover:shadow-amber-900/40",
                "hover:scale-[1.02]",
              )}
            >
              Save & Keep Growing! ✨
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
