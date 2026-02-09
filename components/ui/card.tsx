import * as React from "react";
import { cn } from "@/lib/utils";

const cardVariants = {
  default:
    "rounded-lg border border-neon-blue/25 bg-bg-card shadow-sm holographic",
  simple:
    "rounded-xl border border-white/10 bg-bg-darkGray shadow-none",
  cyberpunk:
    "rounded-xl border border-neon-blue/40 bg-bg-darkGray/95 shadow-[0_0_12px_rgba(0,217,255,0.08)] transition-all duration-300 ease-out hover:scale-[1.02] hover:border-neon-blue/60 hover:shadow-[0_0_20px_rgba(0,217,255,0.12),0_0_40px_rgba(0,217,255,0.06)]",
  stat:
    "rounded-lg border border-neon-blue/50 bg-bg-card transition-all duration-200 hover:shadow-[0_0_16px_rgba(0,217,255,0.12)]",
};

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "simple" | "cyberpunk" | "stat" }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "p-6 sm:p-8",
      cardVariants[variant],
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 pb-4", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-heading-sm font-orbitron font-bold leading-tight tracking-tight text-primary",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-body text-secondary", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-2", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4 gap-4", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
