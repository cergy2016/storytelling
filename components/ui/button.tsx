import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import React from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:opacity-90 shadow-sm shadow-primary/20",
        accent:
          "bg-accent text-accent-foreground hover:opacity-90 shadow-sm shadow-accent/20",
        outline:
          "border border-border bg-transparent hover:bg-surface-muted text-foreground",
        ghost: "bg-transparent hover:bg-surface-muted text-foreground",
        subtle: "bg-surface-muted text-foreground hover:opacity-80",
        danger: "bg-red-500/10 text-red-600 hover:bg-red-500/20",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-5 text-sm",
        lg: "h-12 px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";
