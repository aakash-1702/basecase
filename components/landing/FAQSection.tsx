"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/landing-animations";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faq = [
  {
    q: "Is BaseCase free to use?",
    a: "Yes. Core features including sheets, code execution, and the dashboard are free. BaseCase Pro unlocks additional features like unlimited AI interviews and priority recommendations.",
  },
  {
    q: "What languages does the code execution support?",
    a: "All major languages via Judge0 — C++, Java, Python, JavaScript, Go, and more. Full support for custom test cases and hidden test case validation.",
  },
  {
    q: "How does the project-based AI interview work?",
    a: "You paste your GitHub repo URL. BaseCase fetches, parses, and semantically indexes your codebase. The AI then asks questions specifically about your implementation decisions, architecture, and code.",
  },
  {
    q: "What is SM-2 spaced repetition?",
    a: "SM-2 is the algorithm behind Anki. BaseCase uses it to schedule problem reviews at optimal intervals based on your performance — so you remember what you struggle with, and don't waste time re-solving what you already know.",
  },
  {
    q: "How is BaseCase different from LeetCode?",
    a: "LeetCode is a problem bank. BaseCase is a structured learning system — sheets, AI interviews, spaced repetition, roadmaps, and a dashboard that shows you exactly where you're weak.",
  },
  {
    q: "Is the source code available?",
    a: "Yes. BaseCase is fully open source at github.com/aakash-1702/basecase. Contributions, bug reports, and feature suggestions are always welcome.",
  },
];

export default function FAQSection() {
  return (
    <section
      className="py-20 md:py-28"
      style={{ background: "#0a0a0f" }}
    >
      <div className="max-w-[680px] mx-auto px-4 sm:px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="text-center mb-10"
        >
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            Questions?{" "}
            <span style={{ color: "rgba(255,255,255,0.4)" }}>Answered.</span>
          </h2>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faq.map((item, i) => (
              <AccordionItem
                key={item.q}
                value={`item-${i}`}
                className="border-0"
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <AccordionTrigger
                  className="text-left text-sm sm:text-base font-medium py-5 hover:no-underline transition-colors data-[state=open]:text-[#f05a28]"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                >
                  {item.q}
                </AccordionTrigger>
                <AccordionContent
                  className="text-sm leading-[1.65] pb-5"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
