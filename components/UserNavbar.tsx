"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LogOut, Menu } from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { label: "DSA Sheets", href: "/sheets" },
  { label: "Problems", href: "/problems" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "Mock Interview", href: "/interview" },
  { label: "Dashboard", href: "/dashboard" },
];

export default function UserNavbar({
  session: sessionProp,
}: {
  session?: any;
}) {
  const router = useRouter();
  const { data: sessionFromHook } = useSession();
  const session = sessionProp ?? sessionFromHook;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

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
    <nav
      className={`sticky top-0 z-50 w-full transition-[background,border] duration-300 ${
        scrolled
          ? "bg-zinc-950/92 backdrop-blur-xl border-b border-zinc-800"
          : "bg-zinc-950/84 backdrop-blur-md border-b border-zinc-800/80"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-mono font-bold text-lg tracking-tight text-white"
        >
          Base<span className="text-orange-500">Case</span>
          <span className="text-orange-500 text-xl leading-none">.</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {session?.user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 border-zinc-500 bg-zinc-900/70 text-white transition-colors hover:border-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              <LogOut className="h-4 w-4" /> Log out
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-zinc-200 hover:bg-zinc-800 hover:text-white"
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
                  Get Started{" "}
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
          <SheetContent
            side="left"
            className="w-72 bg-zinc-950 border-zinc-800 text-zinc-100"
          >
            <div className="pt-8 flex h-full flex-col">
              <div className="px-1 pb-6 font-mono font-bold text-lg tracking-tight">
                Base<span className="text-orange-500">Case</span>
                <span className="text-orange-500 text-xl leading-none">.</span>
              </div>
              <div className="flex flex-col border-t border-zinc-800">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="py-3 border-b border-zinc-800 text-sm text-zinc-400 hover:text-white transition-colors"
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
                    className="justify-center border-zinc-500 bg-zinc-900/70 text-white transition-colors hover:border-zinc-400 hover:bg-zinc-800 hover:text-white"
                  >
                    <LogOut className="h-4 w-4 mr-1.5" /> Log out
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
                        Get Started{" "}
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
  );
}
