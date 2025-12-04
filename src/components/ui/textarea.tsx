import type * as React from "react";
import { cn } from "@/lib/content-utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-16 w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-sm shadow-xs transition-colors",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "resize-none",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
