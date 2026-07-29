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
  const [authorized, setAuthorized] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;

    async function verifySession() {
      const clientAuth = authService.isAuthenticated();
      const isDashboardRoute = pathname.startsWith("/dashboard");
      const isPublicDashboardRoute = pathname.startsWith("/templates");

      if (isDashboardRoute && !isPublicDashboardRoute) {
        if (!clientAuth) {
          if (active) {
            setAuthorized(false);
            router.push("/login");
            setLoading(false);
          }
          return;
        }

        try {
          const res = await fetch("/api/auth/me");
          if (!res.ok) {
            throw new Error("Session expired on server");
          }
          const json = await res.json();
          if (!json.success) {
            throw new Error("Session invalid");
          }
          if (active) {
            setAuthorized(true);
            setLoading(false);
          }
        } catch (e) {
          // Clear all localStorage, sessionStorage, and cookies
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_user");
            localStorage.clear();
            sessionStorage.clear();
            document.cookie = "session_token=; path=/; max-age=0; SameSite=Lax";
          }
          if (active) {
            setAuthorized(false);
            router.push("/login?expired=true");
            setLoading(false);
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
