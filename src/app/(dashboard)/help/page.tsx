"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { HelpCircle, Mail } from "lucide-react";

export default function HelpPage() {
  const faqs = [
    {
      q: "How does the ATS Score Checker work?",
      a: "Our scanner parses the content and keywords of your resume in the same format as corporate applicant tracking software. It checks match ratios against standard industry terms.",
    },
    {
      q: "Can I export my resume as a PDF file?",
      a: "Yes. All templates support exports. In the editor toolbar, press the export button to download a clean, single-page PDF formatting structure.",
    },
    {
      q: "Is there a limit on how many versions I can create?",
      a: "Starter accounts can create up to 1 active document. Professional accounts support unlimited resume files, cover letters, and AI generations.",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Help & Support"
        description="Search our documentation database or check our FAQ guides for advice on templates."
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* FAQs */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Click a question to view detailed advice.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border-b border-border/40 pb-4 last:border-0 last:pb-0">
                  <h4 className="flex items-start gap-2 text-sm font-bold text-foreground">
                    <HelpCircle className="h-4.5 w-4.5 mt-0.5 shrink-0 text-primary" />
                    {faq.q}
                  </h4>
                  <p className="pl-6.5 mt-2 text-xs leading-relaxed text-muted-foreground">
                    {faq.a}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Contact panel */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle>Still Need Help?</CardTitle>
              <CardDescription>Get in touch with a support representative.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-muted-foreground">
              <p className="leading-relaxed">
                If you encounter bugs, templates styling errors, or billing questions, contact our
                operations channels:
              </p>
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@resumebuilder.pro</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
