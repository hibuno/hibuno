"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import type * as React from "react";
import { cn } from "@/lib/content-utils";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "text-[10px] text-muted-foreground uppercase tracking-wide font-medium select-none",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Label };
