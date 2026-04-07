"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";

const NAV_LINKS = [
  { label: "Problems", href: "/problems" },
  { label: "Sheets", href: "/sheets" },
  { label: "Interview", href: "/interview" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "Dashboard", href: "/dashboard" },
];

function FlameIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2C12 2 8 6 8 10C8 12.2 9.3 14.1 11 15.2C10.4 14.2 10 13.1 10 12C10 10 11.5 8.2 13 7C13 7 12.8 9.5 14 11C15 12.3 16 13.5 16 15C16 18.3 14.2 20 12 20C9.8 20 8 18.3 8 16C8 15.3 8.2 14.6 8.5 14C7.5 14.8 7 16 7 17.5C7 20.5 9.2 23 12 23C14.8 23 17 20.5 17 17.5C17 14.5 14 11 14 11C14 11 16 10 16 7C16 5 14.5 3 12 2Z"
        fill="#f97316"
      />
    </svg>
  );
}

export default function LandingNav() {
  const router = useRouter();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }
    router.push(href);
  };

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          setMobileOpen(false);
          router.push("/");
          router.refresh();
        },
      },
    });
  };

  return (
    <>
      <nav
        id="landing-navbar"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          background: scrolled
            ? "rgba(10,10,10,0.92)"
            : "rgba(10,10,10,0.6)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          transition: "background 0.3s ease",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 48px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <FlameIcon />
            <span
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-0.3px",
                fontFamily: "var(--font-nunito), sans-serif",
              }}
            >
              BaseCase
            </span>
          </Link>

          {/* Center nav — desktop */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
            className="bc-nav-desktop"
          >
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  fontSize: 14,
                  fontWeight: 500,
                  padding: "8px 16px",
                  borderRadius: 6,
                  transition: "color 0.2s ease",
                  fontFamily: "var(--font-nunito), sans-serif",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "#ffffff")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#9ca3af")
                }
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right actions — desktop */}
          <div
            style={{ display: "flex", alignItems: "center", gap: 12 }}
            className="bc-nav-desktop"
          >
            {session?.user ? (
              <button
                onClick={handleLogout}
                style={{
                  background: "rgba(249,115,22,0.14)",
                  color: "#fb923c",
                  fontSize: 14,
                  fontWeight: 700,
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "1px solid rgba(249,115,22,0.35)",
                  transition: "all 0.2s ease",
                  fontFamily: "var(--font-nunito), sans-serif",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/auth/sign-in"
                  style={{
                    color: "#f97316",
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "opacity 0.2s ease",
                    fontFamily: "var(--font-nunito), sans-serif",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/sign-up"
                  id="nav-cta-sign-up"
                  style={{
                    background: "#f97316",
                    color: "#ffffff",
                    fontSize: 14,
                    fontWeight: 700,
                    padding: "10px 20px",
                    borderRadius: 8,
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    boxShadow: "0 0 0 0 rgba(249,115,22,0)",
                    fontFamily: "var(--font-nunito), sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 0 24px rgba(249,115,22,0.5), 0 0 8px rgba(249,115,22,0.3)";
                    e.currentTarget.style.background = "#ea6c0a";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 0 0 0 rgba(249,115,22,0)";
                    e.currentTarget.style.background = "#f97316";
                  }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="bc-nav-mobile"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              background: "none",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 6,
              padding: 6,
              cursor: "pointer",
              color: "#ffffff",
              display: "none",
            }}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              padding: "16px 24px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  fontSize: 16,
                  fontWeight: 600,
                  padding: "12px 0",
                  textAlign: "left",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  fontFamily: "var(--font-nunito), sans-serif",
                }}
              >
                {link.label}
              </button>
            ))}
            <div style={{ paddingTop: 16, display: "flex", gap: 12 }}>
              {session?.user ? (
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    background: "rgba(249,115,22,0.14)",
                    color: "#fb923c",
                    fontSize: 14,
                    fontWeight: 700,
                    padding: "10px 0",
                    borderRadius: 8,
                    border: "1px solid rgba(249,115,22,0.35)",
                    cursor: "pointer",
                  }}
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    href="/auth/sign-in"
                    style={{
                      color: "#f97316",
                      fontSize: 14,
                      fontWeight: 600,
                      textDecoration: "none",
                      flex: 1,
                      textAlign: "center",
                      padding: "10px 0",
                      border: "1px solid rgba(249,115,22,0.3)",
                      borderRadius: 8,
                    }}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    style={{
                      background: "#f97316",
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 700,
                      textDecoration: "none",
                      flex: 1,
                      textAlign: "center",
                      padding: "10px 0",
                      borderRadius: 8,
                    }}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .bc-nav-desktop { display: none !important; }
          .bc-nav-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .bc-nav-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
}
