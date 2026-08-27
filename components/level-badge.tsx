import { CEFRLevel, LEVEL_LABELS } from "@/types";
import { LEVEL_BG_CLASS } from "@/lib/content-meta";
import { cn } from "@/lib/utils";

export function LevelBadge({
  level,
  size = "md",
  showLabel = true,
  className,
}: {
  level: CEFRLevel;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}) {
  const sizes = {
    sm: "text-[10px] px-1.5 py-0.5 gap-1",
    md: "text-xs px-2 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold text-white shadow-sm",
        LEVEL_BG_CLASS[level],
        sizes[size],
        className
      )}
    >
      {level}
      {showLabel && (
        <span className="hidden font-medium opacity-90 sm:inline">
          · {LEVEL_LABELS[level]}
        </span>
      )}
    </span>
  );
}
