import Link from "next/link";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  const footerLinks = {
    product: [
      { label: "Sheets", href: "/sheets" },
      { label: "Problems", href: "/problems" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Interview", href: "/interview" },
    ],
    resources: [
      { label: "Documentation - Coming Soon", href: "/" },
      { label: "Blog - Coming Soon", href: "/" },
      { label: "Guides - Coming Soon", href: "/" },
      { label: "Changelog - Coming Soon", href: "/" },
    ],
    company: [
      { label: "About", href: "/" },
      { label: "Contact", href: "/" },
      { label: "Privacy Policy", href: "/" },
      { label: "Terms of Service", href: "/" },
    ],
  };

  const socialLinks = [
    { name: "GitHub", icon: Github, href: "https://github.com/aakash-1702" },
    { name: "Twitter", icon: Twitter, href: "https://x.com/im_aakash49" },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "https://www.linkedin.com/in/aakash49/",
    },
    { name: "Email", icon: Mail, href: "mailto:dwivediakash1702@gmail.com" },
  ];

  return (
    <footer className="relative border-t border-neutral-800/60 bg-[#080808]/95 backdrop-blur-sm">
      {/* Subtle top glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-8 border-b border-neutral-800/40">
          {/* Brand & Description - Takes more space */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <h3 className="text-xl font-semibold text-neutral-100">
                BaseCase
              </h3>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed mb-6 max-w-sm">
              Master data structures & algorithms through curated problem sheets
              with spaced repetition. Built for engineers preparing for top tech
              interviews.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-2 rounded-lg bg-neutral-900/50 border border-neutral-800/60 hover:border-amber-700/50 hover:bg-neutral-800/50 transition-all duration-200"
                    aria-label={social.name}
                  >
                    <Icon className="w-4 h-4 text-neutral-400 group-hover:text-amber-500 transition-colors" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Grid - spans remaining space */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold text-neutral-100 uppercase tracking-wider mb-4">
                Product
              </h4>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-400 hover:text-amber-500 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-semibold text-neutral-100 uppercase tracking-wider mb-4">
                Resources
              </h4>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-400 hover:text-amber-500 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-neutral-100 uppercase tracking-wider mb-4">
                Company
              </h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-400 hover:text-amber-500 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} BaseCase. All rights reserved.
          </p>
          <p className="text-sm text-neutral-500">
            Built with 💛 for engineers, by engineers
          </p>
        </div>
      </div>
    </footer>
  );
}
