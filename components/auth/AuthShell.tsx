import Link from "next/link";
import Logo from "@/components/shared/Logo";
import GoogleButton from "./GoogleButton";

/**
 * Shared layout for the sign-in / sign-up pages: logo, heading, card with the
 * form, "or" divider, Google button and the switch link. The ambient
 * background is provided by the (auth) layout – nothing fixed is added here.
 */
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: { text: string; linkLabel: string; href: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 animate-fade-in-up">
          <Logo />
          <h1 className="mt-6 font-display text-3xl tracking-tight text-fg sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-fg-secondary">
            {subtitle}
          </p>
        </div>

        <div className="card-base relative overflow-hidden p-7 animate-fade-in-up animation-delay-100 sm:p-8">
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent"
          />

          {children}

          <div className="my-7 flex items-center gap-3" role="separator">
            <span className="h-px flex-1 bg-line" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-muted">
              or
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <GoogleButton />

          <p className="mt-6 text-center text-sm text-fg-secondary">
            {footer.text}{" "}
            <Link
              href={footer.href}
              className="font-medium text-accent transition-colors hover:text-accent-hover"
            >
              {footer.linkLabel}
            </Link>
          </p>
        </div>

        <p className="mt-8 text-center text-[11px] text-fg-dim">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
