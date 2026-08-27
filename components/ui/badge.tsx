import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import React from "react";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full text-xs font-semibold px-2.5 py-1 whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-surface-muted text-foreground",
        primary: "bg-primary/10 text-primary",
        accent: "bg-accent/15 text-accent",
        outline: "border border-border text-muted",
        success: "bg-emerald-500/10 text-emerald-600",
        danger: "bg-red-500/10 text-red-600",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
