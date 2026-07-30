"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/services/auth";
import { motion } from "framer-motion";

interface RouteGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [authorized, setAuthorized] = React.useState(() => {
    if (typeof window === "undefined") return false;
    const isDashboardRoute = pathname.startsWith("/dashboard");
    const isPublicDashboardRoute = pathname.startsWith("/templates");
    if (isDashboardRoute && !isPublicDashboardRoute) {
      return authService.isAuthenticated();
    }
    return true;
  });

  const [loading, setLoading] = React.useState(() => {
    if (typeof window === "undefined") return true;
    const isDashboardRoute = pathname.startsWith("/dashboard");
    const isPublicDashboardRoute = pathname.startsWith("/templates");
    if (isDashboardRoute && !isPublicDashboardRoute) {
      return !authService.isAuthenticated();
    }
    return false;
  });

  React.useEffect(() => {
    let active = true;

    async function verifySession() {
      const isDashboardRoute = pathname.startsWith("/dashboard");
      const isPublicDashboardRoute = pathname.startsWith("/templates");

      if (isDashboardRoute && !isPublicDashboardRoute) {
        try {
          const res = await fetch("/api/auth/me");
          if (!res.ok) {
            throw new Error("Session expired on server");
          }
          const json = await res.json();
          if (!json.success) {
            throw new Error("Session invalid");
          }

          if (typeof window !== "undefined" && json.data) {
            localStorage.setItem("auth_user", JSON.stringify(json.data));
          }

          if (active) {
            setAuthorized(true);
            setLoading(false);
          }
        } catch (err) {
          console.warn("Session verification failed:", err);
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_user");
            localStorage.clear();
            sessionStorage.clear();
          }
          if (active) {
            setAuthorized(false);
            setLoading(false);
            router.push("/login?expired=true");
          }
        }
      } else {
        if (active) {
          setAuthorized(true);
          setLoading(false);
        }
      }
    }

    verifySession();

    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div
          className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return authorized ? <>{children}</> : null;
}
