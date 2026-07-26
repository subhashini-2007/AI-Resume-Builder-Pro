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
    // Perform verification checks
    function verifySession() {
      const authenticated = authService.isAuthenticated();
      const isDashboardRoute = pathname.startsWith("/dashboard");

      if (isDashboardRoute && !authenticated) {
        setAuthorized(false);
        router.push("/login");
      } else {
        setAuthorized(true);
      }
      setLoading(false);
    }

    verifySession();
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

  // Render children only if authenticated or outside dashboard
  return authorized ? <>{children}</> : null;
}
