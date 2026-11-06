// components/problems/UpdateProgressDialog.tsx
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";

export type ConfidenceLevel =
  | "not_attempted"
  | "confident"
  | "needs_revision"
  | "failed"
  | "skipped";

const OPTIONS: ReadonlyArray<{ value: ConfidenceLevel; label: string }> = [
  { value: "confident", label: "Confident – nailed it! 💪" },
  { value: "needs_revision", label: "Needs revision – almost there 👏" },
  { value: "failed", label: "Unable to solve – tough one 😤" },
  { value: "skipped", label: "Skipped for now – no pressure 📅" },
];

interface UpdateProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialConfidence?: ConfidenceLevel;
  initialNotes?: string;
  problemTitle?: string;
  onSave: (confidence: ConfidenceLevel, notes: string) => void;
  onCancel?: () => void;
}

type FormProps = Required<
  Pick<UpdateProgressDialogProps, "initialConfidence" | "initialNotes" | "problemTitle">
> &
  Pick<UpdateProgressDialogProps, "onSave" | "onCancel" | "onOpenChange">;

// The form mounts fresh every time the dialog opens (Radix unmounts closed
// content), so its state is naturally reset without an effect.
function UpdateProgressForm({
  initialConfidence,
  initialNotes,
  problemTitle,
  onSave,
  onCancel,
  onOpenChange,
}: FormProps) {
  const [confidence, setConfidence] = useState<ConfidenceLevel>(initialConfidence);
  const [notes, setNotes] = useState(initialNotes);

  const handleSave = () => {
    onSave(confidence, notes);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <>
      <DialogHeader className="space-y-3 pb-2">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-accent-soft text-accent">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <DialogTitle className="font-display text-2xl tracking-tight text-fg">
            Update Progress
          </DialogTitle>
        </div>
        <DialogDescription className="text-base leading-relaxed text-fg-secondary">
          One click closer to mastery. Mark how you did on{" "}
          <span className="font-medium text-accent">{problemTitle}</span> and
          leave notes — this helps us craft the perfect next sheet for you.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        <div className="space-y-3">
          <Label htmlFor="confidence" className="text-fg">
            How did it go?
          </Label>
          <Select
            value={confidence}
            onValueChange={(v) => setConfidence(v as ConfidenceLevel)}
          >
            <SelectTrigger id="confidence" className="h-11 w-full text-base">
              <SelectValue placeholder="Select your confidence level" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} className="py-3">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label htmlFor="notes" className="text-fg">
            Notes / Pitfalls / Insights
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Edge case with empty array... O(n) prefix sum trick... common two-pointer mistake..."
            className="min-h-[120px] resize-none"
          />
        </div>
      </div>

      <DialogFooter className="gap-3 pt-2 sm:gap-4">
        <button type="button" onClick={handleCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="button" onClick={handleSave} className="btn btn-primary">
          Save &amp; Keep Growing! ✨
        </button>
      </DialogFooter>
    </>
  );
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface sm:max-w-lg">
        <UpdateProgressForm
          initialConfidence={initialConfidence}
          initialNotes={initialNotes}
          problemTitle={problemTitle}
          onSave={onSave}
          onCancel={onCancel}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}
