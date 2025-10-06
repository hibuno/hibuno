"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Generic loading spinner
export function LoadingSpinner({ className }: { className?: string }) {
 return (
  <div className={cn("flex items-center justify-center p-8", className)}>
   <Loader2 className="h-6 w-6 animate-spin" />
  </div>
 );
}

// Skeleton components for different content types
export function PostCardSkeleton() {
 return (
  <article className="animate-pulse">
   <div className="relative aspect-[16/9] overflow-hidden rounded-lg mb-4 bg-muted">
    <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
   </div>
   <div className="space-y-3">
    <div className="flex items-center gap-3">
     <div className="h-4 bg-muted rounded w-24" />
     <div className="h-4 bg-muted rounded w-16" />
    </div>
    <div className="h-6 bg-muted rounded w-3/4" />
    <div className="space-y-2">
     <div className="h-4 bg-muted rounded w-full" />
     <div className="h-4 bg-muted rounded w-2/3" />
    </div>
    <div className="flex items-center gap-2 pt-2">
     <div className="w-8 h-8 bg-muted rounded-full" />
     <div className="h-4 bg-muted rounded w-20" />
    </div>
   </div>
  </article>
 );
}

export function HeroSkeleton() {
 return (
  <section className="border-b border-border bg-card animate-pulse">
   <div className="mx-auto max-w-6xl px-4 py-12">
    <div className="grid items-start gap-8 md:grid-cols-2">
     <div className="space-y-4">
      <div className="h-8 bg-muted rounded w-3/4" />
      <div className="h-4 bg-muted rounded w-full" />
      <div className="h-4 bg-muted rounded w-2/3" />
      <div className="h-10 bg-muted rounded w-32" />
     </div>
     <div className="space-y-3">
      <div className="aspect-[16/9] bg-muted rounded-lg" />
      <div className="space-y-2">
       <div className="h-4 bg-muted rounded w-1/2" />
       <div className="h-6 bg-muted rounded w-3/4" />
       <div className="h-4 bg-muted rounded w-full" />
      </div>
     </div>
    </div>
   </div>
  </section>
 );
}

export function PostsGridSkeleton({ count = 6 }: { count?: number }) {
 return (
  <section>
   <div className="mx-auto max-w-6xl px-4 py-10">
    <div className="grid gap-10 md:grid-cols-2">
     {Array.from({ length: count }).map((_, i) => (
      <PostCardSkeleton key={i} />
     ))}
    </div>
   </div>
  </section>
 );
}

export function BlogPostSkeleton() {
 return (
  <main className="min-h-screen">
   <div className="mx-auto max-w-4xl px-4 py-8 lg:py-12">
    <article className="mx-auto max-w-3xl animate-pulse">
     <header className="mb-12 text-center space-y-6">
      <div className="h-8 bg-muted rounded w-3/4 mx-auto" />
      <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
      <div className="flex items-center justify-center gap-3">
       <div className="w-8 h-8 bg-muted rounded-full" />
       <div className="h-4 bg-muted rounded w-20" />
       <div className="h-4 bg-muted rounded w-16" />
      </div>
     </header>
     <div className="mb-12 aspect-[16/9] bg-muted rounded-lg" />
     <div className="space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
       <div
        key={i}
        className={`h-4 bg-muted rounded ${
         i % 3 === 0 ? "w-full" : i % 3 === 1 ? "w-5/6" : "w-4/5"
        }`}
       />
      ))}
     </div>
    </article>
   </div>
  </main>
 );
}
