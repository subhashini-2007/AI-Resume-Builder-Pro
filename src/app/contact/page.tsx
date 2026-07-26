"use client";

import * as React from "react";
import { MainLayout } from "@/components/layouts/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <MainLayout>
      <div className="relative overflow-hidden py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Get in{" "}
              <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                Touch
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Have questions about billing, enterprise options, or custom templates? Write to us.
            </p>
          </div>

          <div className="mx-auto max-w-xl">
            <Card className="glassmorphism">
              <CardContent className="pt-6">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="mb-4 flex h-12 w-12 animate-bounce items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold">Message Sent Successfully!</h3>
                    <p className="mb-6 max-w-xs text-sm text-muted-foreground">
                      Thank you for contacting us. A member of our support team will reply within 24
                      hours.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: "", email: "", subject: "", message: "" });
                      }}
                    >
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label htmlFor="name" className="text-xs font-semibold text-muted-foreground">
                        Your Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-primary focus:outline-none"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="email"
                        className="text-xs font-semibold text-muted-foreground"
                      >
                        Your Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-primary focus:outline-none"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="subject"
                        className="text-xs font-semibold text-muted-foreground"
                      >
                        Subject
                      </label>
                      <input
                        id="subject"
                        type="text"
                        className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-primary focus:outline-none"
                        placeholder="Template customization, enterprise plans..."
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="message"
                        className="text-xs font-semibold text-muted-foreground"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        required
                        rows={4}
                        className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-primary focus:outline-none"
                        placeholder="Tell us what you need help with..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>

                    <Button type="submit" className="flex w-full items-center justify-center gap-2">
                      <Send className="h-4 w-4" />
                      Send Message
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
