import UserNavbar from "@/components/UserNavbar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

export default async function ProblemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        body:has([data-hide-footer]) footer {
          display: none !important;
        }
      `}</style>
      <div data-hide-footer="true">{children}</div>
    </>
  );
}
