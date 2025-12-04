"use client";

import * as SwitchPrimitives from "@radix-ui/react-switch";
import type * as React from "react";
import { cn } from "@/lib/content-utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitives.Root>) {
  return (
    <SwitchPrimitives.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-4 w-7 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-foreground data-[state=unchecked]:bg-input",
        className
      )}
      {...props}
    >
      <SwitchPrimitives.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block h-3 w-3 rounded-full bg-background shadow-sm ring-0 transition-transform",
          "data-[state=checked]:translate-x-3.5 data-[state=unchecked]:translate-x-0.5"
        )}
      />
    </SwitchPrimitives.Root>
  );
}

export { Switch };
