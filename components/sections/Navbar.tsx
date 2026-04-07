"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import OrangeButton from "@/components/shared/OrangeButton";
import GhostButton from "@/components/shared/GhostButton";
import { NAV_LINKS } from "@/lib/constants";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        background: "rgba(15,17,23,0.85)",
        borderBottom: "1px solid var(--border, #2d3748)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a
          href="#"
          style={{
            fontFamily: "Nunito, sans-serif",
            fontWeight: 900,
            fontSize: 22,
            color: "var(--text, #e2e8f0)",
            textDecoration: "none",
          }}
        >
          BaseCase<span style={{ color: "var(--orange, #f97316)" }}>.</span>
        </a>

        <div className="bc-nav-center" style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {NAV_LINKS.map((link) => (
            <motion.a
              key={link.label}
              href={link.href}
              whileHover={{ backgroundColor: "var(--bg3, #1c2333)" }}
              transition={{ duration: 0.15 }}
              className="bc-nav-link-hover"
              style={{
                fontFamily: "Nunito, sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: "var(--text-muted, #94a3b8)",
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: 8,
              }}
            >
              {link.label}
            </motion.a>
          ))}
        </div>

        <div className="bc-nav-right" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <GhostButton href="#" style={{ padding: "8px 20px", fontSize: 13 }}>
            Sign In
          </GhostButton>
          <OrangeButton href="#" style={{ padding: "8px 20px", fontSize: 13 }}>
            Get Started
          </OrangeButton>
        </div>

        <button
          className="bc-navbar-hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "var(--text, #e2e8f0)",
            fontSize: 22,
            cursor: "pointer",
            padding: 6,
          }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? "\u2715" : "\u2630"}
        </button>
      </div>

      {mobileOpen && (
        <div
          style={{
            padding: "12px 24px 20px",
            borderTop: "1px solid var(--border, #2d3748)",
            background: "var(--bg, #0f1117)",
          }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "block",
                fontFamily: "Nunito, sans-serif",
                fontWeight: 700,
                fontSize: 15,
                color: "var(--text-muted, #94a3b8)",
                textDecoration: "none",
                padding: "12px 0",
                borderBottom: "1px solid var(--border, #2d3748)",
              }}
            >
              {link.label}
            </a>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <GhostButton href="#" style={{ padding: "8px 20px", fontSize: 13 }}>
              Sign In
            </GhostButton>
            <OrangeButton href="#" style={{ padding: "8px 20px", fontSize: 13 }}>
              Get Started
            </OrangeButton>
          </div>
        </div>
      )}
    </motion.nav>
  );
}
