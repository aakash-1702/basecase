"use client";

import Link from "next/link";

function FlameIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2C12 2 8 6 8 10C8 12.2 9.3 14.1 11 15.2C10.4 14.2 10 13.1 10 12C10 10 11.5 8.2 13 7C13 7 12.8 9.5 14 11C15 12.3 16 13.5 16 15C16 18.3 14.2 20 12 20C9.8 20 8 18.3 8 16C8 15.3 8.2 14.6 8.5 14C7.5 14.8 7 16 7 17.5C7 20.5 9.2 23 12 23C14.8 23 17 20.5 17 17.5C17 14.5 14 11 14 11C14 11 16 10 16 7C16 5 14.5 3 12 2Z"
        fill="#f97316"
      />
    </svg>
  );
}



function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const isExternal = href.startsWith("http");
  const baseStyle: React.CSSProperties = {
    color: "#6b7280",
    fontSize: 14,
    textDecoration: "none",
    transition: "color 0.2s ease",
    display: "block",
    marginBottom: 10,
  };
  return isExternal ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={baseStyle}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
    >
      {children}
    </a>
  ) : (
    <Link
      href={href}
      style={baseStyle}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
    >
      {children}
    </Link>
  );
}

export default function LandingFooter() {
  return (
    <footer
      style={{
        background: "#0a0a0a",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        padding: "56px 48px 32px",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        {/* 4-column grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 48,
            marginBottom: 48,
          }}
          className="bc-footer-cols"
        >
          {/* Col 1 — Brand */}
          <div>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
                marginBottom: 14,
              }}
            >
              <FlameIcon />
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#ffffff",
                  fontFamily: "var(--font-nunito), sans-serif",
                }}
              >
                BaseCase
              </span>
            </Link>
            <p
              style={{
                color: "#6b7280",
                fontSize: 14,
                lineHeight: 1.7,
                margin: 0,
                maxWidth: 280,
              }}
            >
              The all-in-one platform to practice DSA, simulate technical interviews,
              and get real AI-powered feedback.
            </p>
          </div>

          {/* Col 2 — Features */}
          <div>
            <h3
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "1px",
                margin: "0 0 16px",
                fontFamily: "var(--font-nunito), sans-serif",
              }}
            >
              Features
            </h3>
            <FooterLink href="/sheets">Sheets</FooterLink>
            <FooterLink href="/subscription">Pricing</FooterLink>
            <FooterLink href="/interview">Interviews</FooterLink>
            <FooterLink href="/problems">Problems</FooterLink>
          </div>

          {/* Col 3 — About */}
          <div>
            <h3
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "1px",
                margin: "0 0 16px",
                fontFamily: "var(--font-nunito), sans-serif",
              }}
            >
              About
            </h3>
            <FooterLink href="#">Blog</FooterLink>
            <FooterLink href="#">Contact</FooterLink>
            <FooterLink href="#">Privacy Policy</FooterLink>
            <FooterLink href="#">Terms of Service</FooterLink>
          </div>

          {/* Col 4 — Platform */}
          <div>
            <h3
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "1px",
                margin: "0 0 16px",
                fontFamily: "var(--font-nunito), sans-serif",
              }}
            >
              Platform
            </h3>
            <FooterLink href="/interview">AI Interview</FooterLink>
            <FooterLink href="/sheets">AI Mentor</FooterLink>
            <FooterLink href="/sheets">DSA Sheets</FooterLink>
            <FooterLink href="/problems">Analytics</FooterLink>
          </div>
        </div>

        {/* Bottom strip */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#4b5563",
            fontSize: 13,
          }}
        >
          © 2021 – 2025. BaseCase
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .bc-footer-cols { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .bc-footer-cols { grid-template-columns: 1fr !important; gap: 32px !important; }
          footer { padding: 40px 24px 24px !important; }
        }
      `}</style>
    </footer>
  );
}
