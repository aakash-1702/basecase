"use client";

import { MicOff, Globe } from "lucide-react";

export function BrowserGateScreen() {
  return (
    <div className="min-h-screen interview-ambient-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div
          className="flex justify-center mb-8"
          style={{ animation: "fadeSlideUp 0.4s ease backwards" }}
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center relative"
            style={{
              background: "rgba(244,63,94,0.08)",
              border: "1px solid rgba(244,63,94,0.2)",
            }}
          >
            <Globe className="w-10 h-10 text-[#a1a1aa]" />
            <div
              className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: "#0a0a0a",
                border: "1px solid rgba(244,63,94,0.3)",
              }}
            >
              <MicOff className="w-5 h-5 text-[#f43f5e]" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1
          className="text-xl mb-4"
          style={{
            fontFamily: "var(--font-dm-serif)",
            color: "var(--text-primary)",
            animation: "fadeSlideUp 0.4s ease 0.05s backwards",
          }}
        >
          Your browser doesn't support voice input
        </h1>

        {/* Body */}
        <p
          className="text-sm leading-relaxed mb-8"
          style={{
            fontFamily: "var(--font-dm-mono)",
            color: "var(--text-muted)",
            animation: "fadeSlideUp 0.4s ease 0.1s backwards",
          }}
        >
          This interview uses live speech recognition to capture your responses.
          Brave, Firefox, and similar browsers block this feature. Please reopen
          this page in{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            Google Chrome
          </strong>
          ,{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            Microsoft Edge
          </strong>
          , or <strong style={{ color: "var(--text-primary)" }}>Safari</strong>{" "}
          to continue.
        </p>

        {/* Disabled Button with Tooltip */}
        <div className="relative inline-block group">
          <button
            disabled
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium tracking-wide cursor-not-allowed opacity-50"
            style={{
              background: "var(--amber)",
              color: "#000",
              borderRadius: "6px",
              fontFamily: "var(--font-dm-mono)",
            }}
          >
            Join Interview Room
          </button>

          {/* Tooltip */}
          <div
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-md text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200"
            style={{
              background: "#1a1a1a",
              border: "1px solid rgba(255,255,255,0.1)",
              fontFamily: "var(--font-dm-mono)",
              color: "var(--text-muted)",
            }}
          >
            Switch to Chrome, Edge, or Safari to enable this
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
              style={{ borderTopColor: "#1a1a1a" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
