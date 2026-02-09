import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue focus-visible:ring-offset-2 focus-visible:ring-offset-bg-black disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-neon-blue text-bg-black hover:bg-neon-blue/90",
        outline:
          "border border-white/20 text-primary hover:bg-white/10 hover:border-white/30",
        ghost: "text-primary hover:bg-white/10",
        destructive:
          "bg-red-600 text-white hover:bg-red-700",
        secondary:
          "bg-bg-darkGray text-primary border border-white/10 hover:bg-white/10",
        success:
          "bg-neon-green text-bg-black hover:bg-neon-green/90",
      },
      size: {
        default: "h-11 min-h-[44px] px-5 py-2",
        sm: "h-10 min-h-[40px] rounded-lg px-4",
        lg: "h-12 min-h-[48px] rounded-xl px-6 text-base sm:h-14 sm:min-h-[56px]",
        icon: "h-11 min-h-[44px] w-11 min-w-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
