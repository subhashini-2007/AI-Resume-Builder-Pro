import * as React from "react";
import { cn } from "@/lib/utils";

interface FieldErrorProps {
  error?: string | null;
  id?: string;
  className?: string;
}

export const FieldError = React.memo(function FieldError({ error, id, className }: FieldErrorProps) {
  if (!error) return null;

  return (
    <p
      id={id}
      className={cn("mt-1 text-xs font-medium text-destructive", className)}
      role="alert"
      aria-live="polite"
    >
      {error}
    </p>
  );
});
