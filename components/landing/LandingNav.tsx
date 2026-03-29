"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Command, LogOut, Menu, X } from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const navItems = [
  { label: "DSA Sheets", href: "/sheets" },
  { label: "Problems", href: "/problems" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "Mock Interview", href: "/interview" },
  { label: "Dashboard", href: "/dashboard" },
];

export default function LandingNav() {
  const router = useRouter();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("bc_announcement_dismissed");
    if (stored === "1") {
      setAnnouncementDismissed(true);
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const dismissAnnouncement = () => {
    setAnnouncementDismissed(true);
    localStorage.setItem("bc_announcement_dismissed", "1");
  };

  const paletteItems = [
    { label: "Go to Sheets", href: "/sheets", hint: "G S" },
    { label: "Start Mock Interview", href: "/interview", hint: "G I" },
    { label: "View Roadmap", href: "/roadmap", hint: "G R" },
    { label: "Browse Problems", href: "/problems", hint: "G P" },
  ];

  const onPaletteSelect = (href: string) => {
    setPaletteOpen(false);
    router.push(href);
  };

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  };

  return (
    <>
      {!announcementDismissed && (
        <div className="bg-orange-500/10 border-b border-orange-500/20 py-2 px-4 flex items-center justify-center gap-3 text-xs text-orange-300">
          <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">
            NEW
          </span>
          <span>AI Roadmap Generator is now live - powered by Gemini</span>
          <ArrowRight className="w-3 h-3" />
          <button
            onClick={dismissAnnouncement}
            className="ml-auto text-orange-400/60 hover:text-orange-400 transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <nav
        className={`sticky top-0 z-50 w-full transition-[background,border] duration-300 ${
          scrolled
            ? "bg-background/85 backdrop-blur-xl border-b border-border"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-mono font-bold text-lg tracking-tight">
            Base<span className="text-orange-500">Case</span>
            <span className="text-orange-500 text-xl leading-none">.</span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {navItems.map((item) => {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="relative pb-1 text-sm text-muted-foreground transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaletteOpen(true)}
              className="font-mono text-xs text-zinc-100 bg-zinc-900/70 border-zinc-600 hover:bg-zinc-800 hover:text-white"
            >
              <Command className="h-3.5 w-3.5" /> K
            </Button>
            {session?.user ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 border-zinc-500 bg-zinc-900/70 text-white transition-colors hover:border-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-zinc-600 bg-zinc-900/60 text-white hover:bg-zinc-800"
                >
                  <Link href="/auth/sign-in">Sign In</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="group gap-1.5 bg-white text-black hover:bg-zinc-100"
                >
                  <Link
                    href="/auth/sign-up"
                    className="inline-flex items-center gap-1.5"
                  >
                    Get Started
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
              </>
            )}
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                className="md:hidden"
                variant="ghost"
                size="icon"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-card border-border">
              <div className="pt-8 flex h-full flex-col">
                <div className="px-1 pb-6 font-mono font-bold text-lg tracking-tight">
                  Base<span className="text-orange-500">Case</span>
                  <span className="text-orange-500 text-xl leading-none">
                    .
                  </span>
                </div>
                <div className="flex flex-col border-t border-border">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="py-3 border-b border-border text-sm text-muted-foreground hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                <div className="pt-4 flex flex-col gap-2">
                  {session?.user ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="w-full justify-center border-zinc-500 bg-zinc-900/70 text-white transition-colors hover:border-zinc-400 hover:bg-zinc-800 hover:text-white"
                    >
                      <LogOut className="h-4 w-4 mr-1.5" />
                      Log out
                    </Button>
                  ) : (
                    <>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="border-zinc-600 bg-zinc-900/60 text-white hover:bg-zinc-800"
                      >
                        <Link href="/auth/sign-in">Sign In</Link>
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        className="w-full group bg-white text-black hover:bg-zinc-100"
                      >
                        <Link
                          href="/auth/sign-up"
                          className="inline-flex items-center justify-center gap-1.5"
                        >
                          Get Started
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      <Dialog open={paletteOpen} onOpenChange={setPaletteOpen}>
        <DialogContent className="max-w-xl border-zinc-800 bg-zinc-950 p-0 overflow-hidden">
          <DialogTitle className="sr-only">Command Palette</DialogTitle>
          <div className="border-b border-zinc-800 px-4 py-3 font-mono text-xs text-zinc-500">
            BaseCase Command Palette
          </div>
          <div className="p-2">
            {paletteItems.map((item) => (
              <button
                key={item.label}
                onClick={() => onPaletteSelect(item.href)}
                className="w-full rounded-md px-3 py-2.5 text-left flex items-center justify-between hover:bg-zinc-900 transition-colors"
              >
                <span className="text-sm text-zinc-200">{item.label}</span>
                <span className="font-mono text-[11px] text-zinc-500">
                  {item.hint}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
