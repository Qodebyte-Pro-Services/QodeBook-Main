import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent text-template-chart-store bg-template-chart-store/10",
        secondary:
          "border-transparent text-badge-two-pending bg-badge-two-pbg/10",
        destructive:
          "border-transparent text-template-chart-gas bg-template-chart-gas/10",
        processing:
            "border-transparent text-badge-two-blue bg-badge-two-blue/10",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function BadgeTwo({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { BadgeTwo, badgeVariants };
