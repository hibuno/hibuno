import { cn } from "@/lib/utils";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
 return (
  <div
   className={cn("animate-pulse rounded-md bg-zinc-700/50", className)}
   {...props}
  />
 );
}
