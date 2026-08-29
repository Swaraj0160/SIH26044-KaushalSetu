import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary-muted text-primary",
        subtle: "border-transparent bg-primary-muted text-primary",
        outline: "border-border text-foreground",
        muted: "border-transparent bg-muted text-muted-foreground",
        success: "border-transparent bg-success/12 text-success",
        warning:
          "border-transparent bg-warning/15 text-[oklch(0.48_0.12_75)] dark:text-warning",
        danger: "border-transparent bg-destructive/12 text-destructive",
        info: "border-transparent bg-info/12 text-info",
        accent: "border-transparent bg-accent-muted text-accent-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { badgeVariants };
