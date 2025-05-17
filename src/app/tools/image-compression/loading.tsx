"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function CompressionLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 md:gap-6">
        {/* Left Column - Upload and Settings */}
        <div className="space-y-6">
          <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
            <div className="p-4 border-b border-zinc-700/50">
              <Skeleton className="h-6 w-40" />
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center">
                <Skeleton className="h-12 w-12 rounded-full mb-4" />
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-64 mb-4" />
                <Skeleton className="h-9 w-40" />
              </div>
            </div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
            <div className="p-4 border-b border-zinc-700/50">
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-36" />
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-9 flex-1" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Preview and Results */}
        <div className="space-y-6">
          <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
            <div className="p-4 border-b border-zinc-700/50">
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center justify-center h-64">
                <Skeleton className="h-12 w-12 rounded-full mb-4" />
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
