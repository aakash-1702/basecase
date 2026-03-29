"use client";

import Link from "next/link";
import { ArrowRight, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function MobileBottomCTA() {
  const router = useRouter();
  const { data: session } = useSession();

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
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/90 backdrop-blur border-t border-border py-3 px-4">
      <div className="grid grid-cols-2 gap-2">
        {session?.user ? (
          <>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full border-zinc-600 bg-zinc-900/60 text-white hover:bg-zinc-800"
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full border-zinc-500 bg-zinc-900/70 text-white hover:bg-zinc-800"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Log out
            </Button>
          </>
        ) : (
          <>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full border-zinc-600 bg-zinc-900/60 text-white hover:bg-zinc-800"
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
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
