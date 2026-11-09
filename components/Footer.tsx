import Link from "next/link";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import Logo from "@/components/shared/Logo";

const FOOTER_LINKS: { title: string; links: { label: string; href: string; soon?: boolean }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Problems", href: "/problems" },
      { label: "Sheets", href: "/sheets" },
      { label: "AI Interview", href: "/interview" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Pricing", href: "/subscription" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/", soon: true },
      { label: "Blog", href: "/", soon: true },
      { label: "Guides", href: "/", soon: true },
      { label: "Changelog", href: "/", soon: true },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/" },
      { label: "Contact", href: "mailto:dwivediakash1702@gmail.com" },
      { label: "Privacy Policy", href: "/" },
      { label: "Terms of Service", href: "/" },
    ],
  },
];

const SOCIALS = [
  { name: "GitHub", icon: Github, href: "https://github.com/aakash-1702" },
  { name: "Twitter", icon: Twitter, href: "https://x.com/im_aakash49" },
  { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/in/aakash49/" },
  { name: "Email", icon: Mail, href: "mailto:dwivediakash1702@gmail.com" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-line bg-bg">
      <div className="divider-glow absolute inset-x-0 top-0" />
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 border-b border-line pb-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo size="lg" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-fg-secondary">
              Master data structures &amp; algorithms through curated sheets,
              spaced repetition and AI-driven mock interviews. Built for
              engineers preparing for top tech interviews.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {SOCIALS.map(({ name, icon: Icon, href }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-fg-muted transition-colors hover:border-accent/40 hover:text-accent"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
            {FOOTER_LINKS.map((group) => (
              <div key={group.title}>
                <h4 className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-fg">
                  {group.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="inline-flex items-center gap-2 text-sm text-fg-secondary transition-colors hover:text-accent"
                      >
                        {link.label}
                        {link.soon && (
                          <span className="chip chip-neutral px-1.5 py-0 text-[9px]">soon</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-8 text-xs text-fg-muted sm:flex-row">
          <p>© {new Date().getFullYear()} BaseCase. All rights reserved.</p>
          <p>Built with care for engineers, by engineers.</p>
        </div>
      </div>
    </footer>
  );
}
