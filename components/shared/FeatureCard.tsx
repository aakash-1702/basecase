"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cardHover } from "@/lib/constants";

interface FeatureCardProps {
  icon: string;
  title: string;
  desc: string;
}

const MotionCard = motion(Card);

export default function FeatureCard({ icon, title, desc }: FeatureCardProps) {
  return (
    <MotionCard
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={cardHover}
      style={{
        border: "1px solid var(--border, #2d3748)",
        borderRadius: 12,
        position: "relative",
        overflow: "hidden",
        cursor: "default",
        boxShadow: "none",
      }}
    >
      <motion.div
        variants={{
          rest: { scaleX: 0 },
          hover: { scaleX: 1, transition: { duration: 0.2 } },
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: "linear-gradient(90deg, var(--orange, #f97316), var(--orange-light, #fb923c))",
          transformOrigin: "left",
        }}
      />

      <CardContent style={{ padding: 32 }}>
        <div
          style={{
            width: 48,
            height: 48,
            background: "var(--orange-glow, rgba(249, 115, 22, 0.15))",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            marginBottom: 16,
          }}
        >
          {icon}
        </div>

        <h3
          style={{
            fontFamily: "Nunito, sans-serif",
            fontWeight: 800,
            fontSize: 18,
            color: "var(--text, #e2e8f0)",
            marginBottom: 8,
          }}
        >
          {title}
        </h3>

        <p
          style={{
            fontFamily: "Nunito, sans-serif",
            fontWeight: 600,
            fontSize: 14,
            color: "var(--text-muted, #94a3b8)",
            lineHeight: 1.6,
            marginBottom: 12,
          }}
        >
          {desc}
        </p>

        <span
          style={{
            fontFamily: "Nunito, sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: "var(--orange, #f97316)",
          }}
        >
          Learn more {"\u2192"}
        </span>
      </CardContent>
    </MotionCard>
  );
}
