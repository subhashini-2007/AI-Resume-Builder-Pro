import * as React from "react";
import { cn } from "@/lib/utils";

interface CharacterCounterProps {
  currentLength: number;
  maxLength: number;
  recommendedRange?: [number, number];
  className?: string;
  id?: string;
}

export const CharacterCounter = React.memo(function CharacterCounter({
  currentLength,
  maxLength,
  recommendedRange,
  className,
  id,
}: CharacterCounterProps) {
  const isOverLimit = currentLength > maxLength;
  const isApproachingLimit = !isOverLimit && currentLength >= maxLength * 0.85;
  const isIdeal =
    !isOverLimit &&
    !isApproachingLimit &&
    recommendedRange &&
    currentLength >= recommendedRange[0] &&
    currentLength <= recommendedRange[1];

  let colorClass = "text-muted-foreground";
  if (isOverLimit) {
    colorClass = "text-destructive font-semibold";
  } else if (isApproachingLimit) {
    colorClass = "text-amber-500 font-medium";
  } else if (isIdeal) {
    colorClass = "text-emerald-500 font-medium";
  }

  let recommendationText = "";
  if (recommendedRange) {
    recommendationText = `Recommended: ${recommendedRange[0]}–${recommendedRange[1]} characters for ATS optimisation.`;
  }

  return (
    <div className={cn("mt-1 flex items-center justify-between text-[11px]", className)}>
      <span className="text-muted-foreground/80">{recommendationText}</span>
      <span id={id} className={cn("tabular-nums", colorClass)} aria-live="polite">
        {currentLength} / {maxLength}
      </span>
    </div>
  );
});
