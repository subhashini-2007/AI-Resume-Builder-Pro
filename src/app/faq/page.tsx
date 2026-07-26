"use client";

import * as React from "react";
import { MainLayout } from "@/components/layouts/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "How does the AI Resume Builder assist in writing?",
    a: "Our AI analysis tool maps key phrases and skills from your target job descriptions directly to your professional summary and experience bullets. It drafts ATS-friendly bullet points using strong active verbs.",
  },
  {
    q: "What is an ATS score and how is it calculated?",
    a: "An Applicant Tracking System (ATS) score reflects how cleanly your resume parses under standard recruiting filters. We calculate the score by analyzing keyword densities, section structures, and layout readability.",
  },
  {
    q: "Can I download my resume as a PDF file?",
    a: "Yes! All templates support exports. In the editor toolbar, press the export button to download a clean, single-page PDF formatting structure.",
  },
  {
    q: "Is my personal data secure?",
    a: "We prioritize user privacy. Your resume content, draft entries, and uploaded photos are stored locally or securely in encrypted sessions. We do not sell user data to third-party recruiters.",
  },
  {
    q: "How can I upgrade or cancel my plan?",
    a: "You can toggle subscription tiers or cancel your plan at any time inside your Dashboard Account Settings panel.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <MainLayout>
      <div className="relative overflow-hidden py-20">
        {/* Flare */}
        <div className="absolute left-1/2 top-1/4 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                Questions
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about AI Resume Builder Pro features, templates, and
              subscriptions.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <Card key={index} className="glassmorphism overflow-hidden">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="flex w-full items-center justify-between p-6 text-left focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="flex items-center gap-2 pr-4 text-sm font-bold text-foreground">
                      <HelpCircle className="h-5 w-5 shrink-0 text-primary" />
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <CardContent className="pl-13 pb-6 pt-0 text-xs leading-relaxed text-muted-foreground">
                          {faq.a}
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
