"use client";

import React, { useEffect, useState } from "react";
import { Compass } from "lucide-react";

interface LoaderOverlayProps {
  show: boolean;
  companyName?: string;
}

const baseMessages = [
  "Fetching available problems...",
  "Analysing your prep level...",
  "Building your weekly schedule...",
  "Almost there...",
];

export function LoaderOverlay({ show, companyName }: LoaderOverlayProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    if (!show) {
      setCurrentMessageIndex(0);
      return;
    }

    const messages = companyName
      ? [
          baseMessages[0],
          baseMessages[1],
          `Personalising for ${companyName}...`,
          baseMessages[2],
          baseMessages[3],
        ]
      : baseMessages;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [show, companyName]);

  if (!show) return null;

  const messages = companyName
    ? [
        baseMessages[0],
        baseMessages[1],
        `Personalising for ${companyName}...`,
        baseMessages[2],
        baseMessages[3],
      ]
    : baseMessages;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        {/* Animated Compass Icon */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
          <div className="relative rounded-full bg-amber-500/10 p-6">
            <Compass
              className="h-12 w-12 text-amber-500 animate-spin"
              style={{ animationDuration: "3s" }}
            />
          </div>
        </div>

        {/* Rotating Message */}
        <div className="text-center">
          <p
            key={currentMessageIndex}
            className="text-lg font-medium text-white animate-fade-in-up"
          >
            {messages[currentMessageIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}
