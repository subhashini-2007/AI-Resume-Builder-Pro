"use client";

import * as React from "react";
import { MainLayout } from "@/components/layouts/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = React.useState(false);

  const plans = [
    {
      name: "Starter",
      desc: "Perfect for testing our builder interface.",
      price: 0,
      features: [
        "1 Resume PDF export",
        "Standard layout builder templates",
        "Baseline ATS parser test scan",
        "Shared email support channel",
      ],
      cta: "Start for free",
      popular: false,
    },
    {
      name: "Professional",
      desc: "Our most popular offering for job search campaigns.",
      price: isAnnual ? 12 : 19,
      features: [
        "Unlimited resume documents & exports",
        "Full suite of premium modern templates",
        "Deep AI bullet and content generation",
        "Detailed ATS scoring & keyphrase scans",
        "Mock interview prep & roadmap timelines",
        "Priority support",
      ],
      cta: "Upgrade to Professional",
      popular: true,
    },
    {
      name: "Enterprise",
      desc: "Designed for cohorts, universities, and teams.",
      price: "Custom",
      features: [
        "Everything in Professional tier",
        "Team dashboards and sharing permissions",
        "Dedicated corporate domain accounts",
        "Custom template styling extensions",
        "Dedicated account manager",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <MainLayout>
      <div className="relative overflow-hidden py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Header */}
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Simple, Transparent{" "}
              <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                Pricing
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Pick the plan that fits your current job search campaign.
            </p>

            {/* Toggle */}
            <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card p-1">
              <button
                onClick={() => setIsAnnual(false)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  !isAnnual ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                Monthly billing
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  isAnnual ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                Annual billing (Save 35%)
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-3">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`glassmorphism relative flex flex-col justify-between transition-all duration-300 hover:shadow-xl ${
                  plan.popular ? "border-primary/60 bg-primary/[0.02] ring-1 ring-primary/20" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute right-1/2 top-0 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-md shadow-primary/25">
                    Most Popular
                  </div>
                )}
                <div>
                  <CardHeader className="pb-8">
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {plan.desc}
                    </p>
                    <div className="mt-6 flex items-baseline text-foreground">
                      <span className="text-4xl font-extrabold tracking-tight">
                        {typeof plan.price === "number" ? `$${plan.price}` : plan.price}
                      </span>
                      {typeof plan.price === "number" && (
                        <span className="ml-1 text-sm text-muted-foreground">/month</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-8">
                    <ul role="list" className="space-y-4">
                      {plan.features.map((feat, fIndex) => (
                        <li key={fIndex} className="flex items-start gap-3">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span className="text-sm leading-relaxed text-muted-foreground">
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </div>
                <CardFooter className="pt-4">
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => {
                      if (plan.name !== "Enterprise") {
                        window.location.href = "/login";
                      } else {
                        window.location.href = "/contact";
                      }
                    }}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
