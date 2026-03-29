import Link from "next/link";
import { Github, Linkedin, Twitter } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="border-t border-border py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <p className="font-mono text-lg font-bold tracking-tight">
              Base<span className="text-orange-500">Case</span>
              <span className="text-orange-500">.</span>
            </p>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              DSA learning and interview prep for engineers who want structure,
              not noise.
            </p>
            <div className="mt-4 flex items-center gap-3 text-zinc-600">
              <Link
                href="#"
                aria-label="GitHub"
                className="hover:text-zinc-300 transition-colors"
              >
                <Github className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                aria-label="X"
                className="hover:text-zinc-300 transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                aria-label="LinkedIn"
                className="hover:text-zinc-300 transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <FooterCol
            title="Product"
            links={[
              ["DSA Sheets", "/sheets"],
              ["Problems", "/problems"],
              ["Roadmaps", "/roadmap"],
              ["Mock Interviews", "/interview"],
              ["Analytics", "/dashboard"],
            ]}
          />

          <FooterCol
            title="Resources"
            links={[
              ["Blog", "#"],
              ["Changelog", "#"],
              ["GitHub", "#"],
              ["Documentation", "#"],
            ]}
          />

          <FooterCol
            title="Company"
            links={[
              ["About", "#"],
              ["Contact", "#"],
              ["Privacy Policy", "#"],
              ["Terms", "#"],
            ]}
          />
        </div>

        <div className="border-t border-zinc-800/60 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-600">
          <p>© 2026 BaseCase. Built for engineers, by engineers.</p>
          <p>Made with ♥ in India</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: Array<[string, string]>;
}) {
  return (
    <div>
      <h3 className="font-medium mb-3">{title}</h3>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="hover:text-white transition-colors">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
