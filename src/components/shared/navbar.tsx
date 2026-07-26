"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { publicNavItems } from "@/config/navigation";
import { authService } from "@/services/auth";
import { useMounted } from "@/hooks/use-mounted";
import { useRouter } from "next/navigation";
import * as React from "react";

export function Navbar() {
  const router = useRouter();
  const mounted = useMounted();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    setIsLoggedIn(authService.isAuthenticated());
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Brand/Logo */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-violet-500 text-primary-foreground shadow-md shadow-primary/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-lg font-bold tracking-tight text-transparent">
            ResumeBuilder<span className="font-extrabold text-primary">Pro</span>
          </span>
        </Link>

        {/* Dynamic Navigation Links */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {publicNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/faq" className="transition-colors hover:text-foreground">
            FAQ
          </Link>
        </nav>

        {/* Header Actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {mounted && isLoggedIn ? (
            <>
              <Button
                variant="outline"
                className="hidden sm:inline-flex"
                onClick={() => router.push("/dashboard")}
              >
                Dashboard
              </Button>
              <Button onClick={() => router.push("/dashboard/resumes/create")}>
                Create Resume
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="hidden sm:inline-flex"
                onClick={() => router.push("/login")}
              >
                Sign In
              </Button>
              <Button onClick={() => router.push("/register")}>Get Started</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
