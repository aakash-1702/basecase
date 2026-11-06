"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/** Labelled input for auth forms. Focus styling comes from `input-base`. */
export default function AuthField({
  label,
  error,
  className,
  id,
  ...props
}: React.ComponentProps<"input"> & { label: string; error?: string }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="block font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted"
      >
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn("input-base h-12", error && "border-danger/60", className)}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
