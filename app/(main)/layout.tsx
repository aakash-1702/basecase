import UserNavbar from "@/components/UserNavbar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="min-h-screen bg-[#080808] text-neutral-100">
      {/* Global grid background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
        }}
      />

      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(245,158,11,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 80%, rgba(234,88,12,0.04) 0%, transparent 60%)
          `,
        }}
      />

      <Toaster position="top-right" theme="dark" richColors />
      <UserNavbar session={session as any} />

      <main
        className={cn(
          "relative w-full min-h-[calc(100vh-3.5rem)]",
          "pt-8 pb-16 md:pt-12",
        )}
      >
        {children}
      </main>

      <footer className="border-t border-neutral-800/60 bg-[#080808]/80 py-6 text-center text-sm text-neutral-500 relative z-10">
        <div className="mx-auto max-w-7xl px-6">
          © {new Date().getFullYear()} BaseCase. All rights reserved.
        </div>
      </footer>
    </div>
  );
}