"use client";

import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function DeleteInterviewDialog({
  open,
  isDeleting,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isDeleting) onCancel();
      }}
    >
      <AlertDialogContent className="border-line bg-surface text-fg">
        <AlertDialogHeader>
          <div className="mb-2 grid h-12 w-12 place-items-center rounded-full border border-danger/20 bg-danger/10 text-danger">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <AlertDialogTitle className="font-display text-xl">
            Delete interview?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-relaxed text-fg-secondary">
            This action cannot be undone. The interview session, performance metrics and all
            associated AI feedback will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="btn btn-secondary btn-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="btn btn-sm border border-danger/30 bg-danger/15 text-danger hover:bg-danger hover:text-white"
          >
            {isDeleting ? "Deleting…" : "Delete interview"}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
