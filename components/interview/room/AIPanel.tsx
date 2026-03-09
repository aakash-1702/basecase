"use client";

import { AIOrb } from "../AIOrb";

type AIState = "asking" | "waiting" | "processing";

interface AIPanelProps {
  state: AIState;
}

export function AIPanel({ state }: AIPanelProps) {
  const isListening = state === "waiting";

  return (
    <div className="flex flex-col items-center justify-center w-full h-full" style={{ gap: "24px", padding: "24px" }}>
      {/* Label */}
      <div 
        style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", letterSpacing: "0.2em", color: "#737373", fontWeight: 500 }}
      >
        INTERVIEWER
      </div>

      {/* AI Orb Overlay wrapper to constrain size */}
      <div 
        className="flex items-center justify-center transition-opacity duration-500 relative"
        style={{ 
          width: "80px", 
          height: "80px", 
          opacity: isListening ? 0.6 : 1 
        }}
      >
        <div className="absolute inset-0 scale-[0.65] pointer-events-none flex items-center justify-center">
          <AIOrb size="large" state={state === "asking" ? "asking" : state === "processing" ? "processing" : "idle"} />
        </div>
      </div>

      {/* State Indicator */}
      <div 
        style={{ 
          fontFamily: "var(--font-dm-mono)", 
          fontSize: "11px", 
          letterSpacing: "0.15em",
          color: isListening ? "rgba(245,158,11,0.8)" : "#a3a3a3",
          textTransform: "uppercase",
          fontWeight: 500
        }}
      >
        {state === "asking" ? "ASKING" : isListening ? "LISTENING" : "THINKING"}
      </div>
    </div>
  );
}
