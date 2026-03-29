import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const commits = [
  "feat: add SM-2 spaced repetition · 2 days ago",
  "fix: voice interview race condition · 4 days ago",
  "feat: roadmap generator v1 · 1 week ago",
];

export default function BuiltInPublicSection() {
  return (
    <section className="py-10 border-y border-zinc-800/60 bg-zinc-950/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge
            variant="outline"
            className="border-zinc-700 text-zinc-400 bg-zinc-900"
          >
            Built In Public
          </Badge>

          <p className="mt-4 text-sm sm:text-base text-zinc-400">
            BaseCase is being built in public. Follow the journey
            <ArrowRight className="inline-block w-3.5 h-3.5 ml-1" />
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="font-mono text-xs border-zinc-600 bg-zinc-900/60 text-white hover:bg-zinc-800"
            >
              <Link
                href="https://github.com/aakash-1702/basecase"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5"
              >
                <Github className="w-3.5 h-3.5" />
                View on GitHub
              </Link>
            </Button>
          </div>

          <div className="mt-7 mx-auto max-w-3xl rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 text-left">
            {commits.map((item, index) => (
              <p
                key={item}
                className={`font-mono text-xs sm:text-sm text-zinc-500 ${
                  index > 0 ? "mt-2" : ""
                }`}
              >
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
