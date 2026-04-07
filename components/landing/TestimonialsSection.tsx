"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/landing-animations";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
  badgeColor: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "Project-based interview mode asked questions directly from my implementation choices. It felt like a real panel.",
    name: "Rohit K.",
    role: "SDE at Flipkart",
    company: "Flipkart",
    badgeColor: "#1d4ed8",
  },
  {
    quote:
      "The structured sheets + spaced repetition removed random prep. I focused exactly where I was weak.",
    name: "Sneha P.",
    role: "SDE-1 at Amazon",
    company: "Amazon",
    badgeColor: "#E8490F",
  },
  {
    quote:
      "BaseCase made me consistent. The dashboard tells me what to do next instead of letting me guess.",
    name: "Arjun M.",
    role: "Engineer at Microsoft",
    company: "Microsoft",
    badgeColor: "#0284c7",
  },
  {
    quote:
      "I used it as my daily prep console for six weeks and saw major confidence gains in interviews.",
    name: "Tanvi A.",
    role: "SDE at PhonePe",
    company: "PhonePe",
    badgeColor: "#7c3aed",
  },
  {
    quote:
      "The execution speed and interview prompts make practice feel high-stakes and realistic.",
    name: "Manas J.",
    role: "SWE at Razorpay",
    company: "Razorpay",
    badgeColor: "#0891b2",
  },
  {
    quote:
      "I finally had one place for problems, mock interviews, and revision strategy. That changed everything.",
    name: "Priya V.",
    role: "SDE at Groww",
    company: "Groww",
    badgeColor: "#16a34a",
  },
];

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <article
      className="w-85 shrink-0 rounded-xl p-5 relative"
      style={{ background: "#111111", border: "1px solid #1E1E1E" }}
    >
      <span
        className="absolute top-4 right-4 text-[11px] px-2.5 py-1 rounded-full"
        style={{ background: item.badgeColor, color: "#fff" }}
      >
        {item.company}
      </span>
      <p
        className="text-sm leading-[1.65] mb-5"
        style={{ color: "rgba(255,255,255,0.8)" }}
      >
        “{item.quote}”
      </p>
      <div style={{ borderTop: "1px solid #1E1E1E" }} className="pt-3">
        <p className="text-sm text-white font-medium">
          {item.name}{" "}
          <span className="text-[12px]" style={{ color: "#86efac" }}>
            Verified User ✓
          </span>
        </p>
        <p className="text-xs mt-1" style={{ color: "#A0A0A0" }}>
          {item.role}
        </p>
      </div>
    </article>
  );
}

export default function TestimonialsSection() {
  const rowA = [...testimonials, ...testimonials];
  const rowB = [
    ...testimonials.slice().reverse(),
    ...testimonials.slice().reverse(),
  ];

  return (
    <section
      className="py-30 overflow-hidden"
      style={{ background: "#0A0A0A", borderTop: "1px solid #1E1E1E" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="text-center mb-10"
        >
          <h2
            className="text-[40px] sm:text-[48px] md:text-[56px] font-extrabold tracking-tight text-white"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            Real Students.{" "}
            <span className="text-gradient-bc">Real Results.</span>
          </h2>
          <p className="mt-4 text-base" style={{ color: "#A0A0A0" }}>
            Trusted by engineers at Flipkart, Amazon, Microsoft, and more.
          </p>
        </motion.div>
      </div>

      <div className="space-y-4">
        <div className="overflow-hidden">
          <div className="flex gap-4 w-max scroll-left">
            {rowA.map((item, idx) => (
              <TestimonialCard key={`${item.name}-${idx}`} item={item} />
            ))}
          </div>
        </div>
        <div className="overflow-hidden">
          <div className="flex gap-4 w-max scroll-right">
            {rowB.map((item, idx) => (
              <TestimonialCard key={`${item.name}-rev-${idx}`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
