"use client";

import { FOOTER_LINKS } from "@/lib/constants";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer style={{ background: "var(--bg2, #161b22)", borderTop: "1px solid var(--border, #2d3748)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 0" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 48,
            marginBottom: 40,
          }}
          className="bc-footer-grid"
        >
          <div>
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
            <p
              style={{
                fontFamily: "Nunito, sans-serif",
                fontWeight: 600,
                fontSize: 14,
                color: "var(--text-muted, #94a3b8)",
                marginTop: 12,
                lineHeight: 1.6,
                maxWidth: 280,
              }}
            >
              DSA learning and interview prep for engineers who want structure, not noise.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <div
                style={{
                  fontFamily: "Nunito, sans-serif",
                  fontWeight: 800,
                  fontSize: 13,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "var(--text, #e2e8f0)",
                  marginBottom: 16,
                }}
              >
                {title}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {links.map((link) => (
                  <motion.a
                    key={link}
                    href="#"
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.15 }}
                    className="bc-footer-link"
                    style={{
                      fontFamily: "Nunito, sans-serif",
                      fontWeight: 600,
                      fontSize: 14,
                      color: "var(--text-muted, #94a3b8)",
                      textDecoration: "none",
                    }}
                  >
                    {link}
                  </motion.a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: "1px solid var(--border, #2d3748)",
            padding: "20px 0",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span
            style={{
              fontFamily: "Nunito, sans-serif",
              fontWeight: 600,
              fontSize: 13,
              color: "var(--text-muted, #94a3b8)",
            }}
          >
            {"\u00A9"} 2026 BaseCase. Built for engineers, by engineers.
          </span>
          <span
            style={{
              fontFamily: "Nunito, sans-serif",
              fontWeight: 600,
              fontSize: 13,
              color: "var(--text-muted, #94a3b8)",
            }}
          >
            Made with {"\u2665"} in India
          </span>
        </div>
      </div>
    </footer>
  );
}
