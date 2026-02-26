"use client";

import React from "react";

interface XPPopupProps {
  amount: number;
  visible: boolean;
}

export const XPPopup = React.memo(function XPPopup({
  amount,
  visible,
}: XPPopupProps) {
  return (
    <div
      className="pointer-events-none select-none fixed z-[999] right-8 bottom-24 font-black tracking-widest transition-all duration-700"
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: "28px",
        color: "#f97316",
        textShadow:
          "0 0 30px rgba(249,115,22,1), 0 0 60px rgba(249,115,22,0.5)",
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(-20px) scale(1.05)"
          : "translateY(10px) scale(0.9)",
      }}
    >
      +{amount} XP
    </div>
  );
});
