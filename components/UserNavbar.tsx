"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, m, useMotionValueEvent, useScroll } from "framer-motion";
import { LogOut, Menu, X } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import Logo from "@/components/shared/Logo";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { EASE_OUT, SPRING_SNAPPY } from "@/components/motion/presets";

const NAV_ITEMS = [
  { label: "Problems", href: "/problems" },
  { label: "Sheets", href: "/sheets" },
  { label: "Interview", href: "/interview" },
  { label: "Dashboard", href: "/dashboard" },
];

export interface NavSession {
  user?: { name?: string | null; email?: string | null; image?: string | null } | null;
}

/**
 * Session is resolved on the server and passed down — the navbar never
 * re-fetches it on the client. Hides on scroll-down, returns on scroll-up.
 * In mock mode the auth pages stay reachable (Sign in / Sign up links are
 * shown and "Logout" simply opens the sign-in page).
 */
export default function UserNavbar({
  session,
  mock = false,
}: {
  session?: NavSession | null;
  mock?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const isAuthed = Boolean(session?.user);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (open) return;
    setHidden(y > 96 && y > prev);
  });

  const close = useCallback(() => setOpen(false), []);

  const handleLogout = useCallback(async () => {
    if (mock) {
      router.push("/auth/sign-in");
      return;
    }
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  }, [router, mock]);

  const authLinks = (
    <>
      <Link href="/auth/sign-in" className="btn btn-ghost btn-sm hidden sm:inline-flex">
        Sign in
      </Link>
      <Link href="/auth/sign-up" className="btn btn-primary btn-sm">
        Get started
      </Link>
    </>
  );

  return (
    <m.header
      className="nav-glass sticky top-0 z-50 w-full"
      animate={{ y: hidden ? -64 : 0 }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
    >
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <Logo />

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <li key={item.href} className="relative">
                <Link
                  href={item.href}
                  className={cn(
                    "relative z-10 block rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    active ? "text-accent-hover" : "text-fg-secondary hover:text-fg",
                  )}
                >
                  {item.label}
                </Link>
                {active && (
                  <m.span
                    layoutId="nav-active"
                    transition={SPRING_SNAPPY}
                    className="absolute inset-0 rounded-lg bg-accent-soft"
                  />
                )}
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthed ? (
            <>
              <span className="hidden max-w-[160px] truncate text-sm text-fg-muted lg:inline">
                {session?.user?.name}
              </span>
              {mock && (
                <Link href="/auth/sign-up" className="btn btn-ghost btn-sm hidden sm:inline-flex">
                  Sign up
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-ghost btn-sm"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{mock ? "Sign in" : "Logout"}</span>
              </button>
            </>
          ) : (
            authLinks
          )}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="btn btn-ghost btn-sm px-2 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="overflow-hidden border-t border-line bg-bg md:hidden"
          >
            <ul className="mx-auto flex max-w-7xl flex-col px-4 py-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    className={cn(
                      "block rounded-md px-3 py-2.5 text-sm font-medium",
                      pathname?.startsWith(item.href)
                        ? "bg-accent-soft text-accent-hover"
                        : "text-fg-secondary hover:bg-fg/5 hover:text-fg",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {(!isAuthed || mock) && (
                <>
                  <li>
                    <Link
                      href="/auth/sign-in"
                      onClick={close}
                      className="block rounded-md px-3 py-2.5 text-sm font-medium text-fg-secondary hover:bg-fg/5"
                    >
                      Sign in
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/auth/sign-up"
                      onClick={close}
                      className="block rounded-md px-3 py-2.5 text-sm font-medium text-fg-secondary hover:bg-fg/5"
                    >
                      Create account
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </m.div>
        )}
      </AnimatePresence>
    </m.header>
  );
}
