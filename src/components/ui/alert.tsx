import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/content-utils";

const alertVariants = cva(
  "relative w-full rounded-md border px-3 py-2 text-sm flex items-start gap-2 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:mt-0.5",
  {
    variants: {
      variant: {
        default: "bg-card border-border text-foreground",
        destructive:
          "bg-destructive/5 border-destructive/20 text-destructive [&>svg]:text-destructive",
        warning:
          "bg-neutral-50 border-neutral-200 text-neutral-800 [&>svg]:text-neutral-600",
        success:
          "bg-emerald-50 border-emerald-200 text-emerald-800 [&>svg]:text-emerald-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("font-medium text-sm", className)}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-sm opacity-90", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
