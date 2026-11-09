"use client";

import { MicOff, Globe } from "lucide-react";

export function BrowserGateScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        {/* Icon */}
        <div className="mb-8 flex animate-fade-up justify-center">
          <div className="relative grid h-24 w-24 place-items-center rounded-full border border-danger/20 bg-danger/10">
            <Globe className="h-10 w-10 text-fg-secondary" />
            <div className="absolute -bottom-1 -right-1 grid h-10 w-10 place-items-center rounded-full border border-danger/30 bg-bg">
              <MicOff className="h-5 w-5 text-danger" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1
          className="mb-4 animate-fade-up font-display text-xl tracking-tight text-fg"
          style={{ animationDelay: "50ms" }}
        >
          Your browser doesn&apos;t support voice input
        </h1>

        {/* Body */}
        <p
          className="mb-8 animate-fade-up text-sm leading-relaxed text-fg-muted"
          style={{ animationDelay: "100ms" }}
        >
          This interview uses live speech recognition to capture your responses.
          Brave, Firefox, and similar browsers block this feature. Please reopen
          this page in <strong className="font-semibold text-fg">Google Chrome</strong>,{" "}
          <strong className="font-semibold text-fg">Microsoft Edge</strong>, or{" "}
          <strong className="font-semibold text-fg">Safari</strong> to continue.
        </p>

        {/* Disabled Button with Tooltip */}
        <div className="group relative inline-block">
          <button type="button" disabled className="btn btn-primary">
            Join Interview Room
          </button>

          {/* Tooltip */}
          <div
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-line bg-surface-2 px-3 py-2 text-xs text-fg-muted opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          >
            Switch to Chrome, Edge, or Safari to enable this
            <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-surface-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
