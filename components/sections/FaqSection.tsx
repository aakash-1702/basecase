"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FAQS, fadeUp, staggerContainer } from "@/lib/constants";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FaqSection() {
  const [openItem, setOpenItem] = useState<string | undefined>(undefined);

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainer}
      style={{ background: "var(--bg2, #161b22)", padding: "90px 24px" }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <motion.h2
          variants={fadeUp}
          style={{
            fontFamily: "Nunito, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(28px, 4vw, 42px)",
            color: "var(--text, #e2e8f0)",
            letterSpacing: "-1.5px",
            textAlign: "center",
            marginBottom: 48,
          }}
        >
          Frequently Asked Questions
        </motion.h2>

        <Accordion
          type="single"
          collapsible
          value={openItem}
          onValueChange={setOpenItem}
        >
          {FAQS.map((faq, index) => {
            const value = `item-${index}`;
            const isOpen = openItem === value;
            return (
              <motion.div key={faq.q} variants={fadeUp}>
                <AccordionItem
                  value={value}
                  style={{ borderBottom: "1px solid var(--border, #2d3748)" }}
                >
                  <AccordionTrigger
                    className="accordion-trigger [&>svg]:hidden"
                    style={{
                      fontFamily: "Nunito, sans-serif",
                      fontWeight: 800,
                      fontSize: 16,
                      color: isOpen ? "var(--orange, #f97316)" : "var(--text, #e2e8f0)",
                      textDecoration: "none",
                    }}
                  >
                    <span>{faq.q}</span>
                    <span
                      style={{
                        fontSize: 20,
                        color: isOpen ? "var(--orange, #f97316)" : "var(--text-dim, #64748b)",
                        marginLeft: 12,
                        lineHeight: 1,
                      }}
                    >
                      {isOpen ? "\u2212" : "+"}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          style={{ overflow: "hidden" }}
                        >
                          <p
                            style={{
                              fontFamily: "Nunito, sans-serif",
                              fontWeight: 600,
                              fontSize: 14,
                              color: "var(--text-muted, #94a3b8)",
                              lineHeight: 1.65,
                              paddingBottom: 20,
                            }}
                          >
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            );
          })}
        </Accordion>
      </div>
    </motion.section>
  );
}
