"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, FileText, LayoutGrid, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MainLayout } from "@/components/layouts/main-layout";
import { authService } from "@/services/auth";
import { useMounted } from "@/hooks/use-mounted";

export default function Home() {
  const router = useRouter();
  const mounted = useMounted();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    setIsLoggedIn(authService.isAuthenticated());
  }, []);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <MainLayout>
      <div className="relative isolate overflow-hidden">
        {/* Background gradient flares */}
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-violet-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>

        {/* Hero Section */}
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary"
            >
              <Sparkles className="h-4 w-4" />
              <span>Project Foundation Initialized Successfully</span>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl"
            >
              Build Resumes That Stand Out With{" "}
              <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                AI Precision
              </span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-6 text-lg leading-8 text-muted-foreground"
            >
              Welcome to the foundation of AI Resume Builder Pro. This boilerplate is configured
              with Next.js 15, React 19, TypeScript, Tailwind CSS, Shadcn UI, and Framer Motion.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-10 flex items-center justify-center gap-x-6"
            >
              {mounted && isLoggedIn ? (
                <Button
                  size="lg"
                  className="group flex items-center gap-2"
                  onClick={() => router.push("/dashboard")}
                >
                  Go to Dashboard
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="group flex items-center gap-2"
                  onClick={() => router.push("/dashboard")}
                >
                  Get Started
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              )}
                <Button variant="outline" size="lg" onClick={() => router.push("/templates")}>View Templates</Button>
            </motion.div>
          </div>
        </div>

        {/* Feature Grid / Cards Section */}
        <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mx-auto grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2 lg:max-w-none lg:grid-cols-3"
          >
            {/* Card 1 */}
            <motion.div variants={itemVariants}>
              <Card className="glassmorphism transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                <CardHeader>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <CardTitle>Next.js 15 & React 19</CardTitle>
                  <CardDescription>
                    Fully configured with React Server Components (RSC) and standard layouts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Leverages the new App Router structure with loading and error boundaries
                  pre-configured.
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 2 */}
            <motion.div variants={itemVariants}>
              <Card className="glassmorphism transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                <CardHeader>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <LayoutGrid className="h-5 w-5" />
                  </div>
                  <CardTitle>Shadcn UI & Tailwind</CardTitle>
                  <CardDescription>
                    Complete design system incorporating CSS variables for dark/light themes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Built-in theme switcher, standard button, card primitives, and absolute imports
                  setup.
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 3 */}
            <motion.div variants={itemVariants}>
              <Card className="glassmorphism transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                <CardHeader>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <CardTitle>Husky & Lint Staged</CardTitle>
                  <CardDescription>
                    Automated code quality gates verifying ESLint rules and Prettier formats.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Keeps code clean, formatting synchronized, and commits compliant automatically.
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>

        {/* Background gradient flares bottom */}
        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-violet-500 to-primary opacity-25 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
      </div>
    </MainLayout>
  );
}
