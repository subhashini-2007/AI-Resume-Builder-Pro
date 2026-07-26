"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error("Runtime Boundary Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mx-auto max-w-md rounded-2xl border border-destructive/20 bg-destructive/5 p-6 shadow-sm md:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>

        <h2 className="mt-6 text-xl font-bold tracking-tight text-foreground md:text-2xl">
          Something went wrong
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          An unexpected error occurred while rendering this page. If this problem persists, please
          contact support.
        </p>

        {error.digest && (
          <p className="mt-4 font-mono text-xs text-muted-foreground/60">
            Error ID: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="destructive" onClick={() => reset()} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Go back home
          </Button>
        </div>
      </div>
    </div>
  );
}
