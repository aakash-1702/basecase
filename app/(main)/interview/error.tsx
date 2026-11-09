"use client";

import EmptyState from "@/components/shared/EmptyState";
import { AlertTriangle } from "lucide-react";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-24">
      <EmptyState
        icon={<AlertTriangle className="h-5 w-5" />}
        title="Something went wrong"
        description="We couldn't load your interviews. Please try again."
        action={
          <button type="button" onClick={reset} className="btn btn-secondary btn-sm">
            Try again
          </button>
        }
      />
    </div>
  );
}
