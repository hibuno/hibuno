import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar } from "@/components/sidebar";

export default function BackgroundRemovalLoading() {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-200 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64 p-4">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Skeleton className="h-9 w-9 mr-2" />
            <Skeleton className="h-6 w-48" />
          </div>
        </div>

        <div className="space-y-4">
          {/* Tool Interface Skeleton */}
          <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4">
            {/* Upload Area Skeleton */}
            <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center mb-6">
              <div className="flex flex-col items-center">
                <Skeleton className="h-12 w-12 rounded-full mb-4" />
                <Skeleton className="h-6 w-64 mb-2" />
                <Skeleton className="h-4 w-48 mb-4" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div>

            {/* Settings Panel Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-32 mb-2" />
                <div className="space-y-2">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
              
              <div className="space-y-4">
                <Skeleton className="h-6 w-32 mb-2" />
                <div className="space-y-2">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            </div>

            {/* Processing Status Skeleton */}
            <div className="mb-6">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>

            {/* Results Area Skeleton (Empty State) */}
            <div className="border border-zinc-700 rounded-lg p-6 text-center">
              <Skeleton className="h-10 w-10 rounded-full mx-auto mb-3" />
              <Skeleton className="h-5 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
          </div>

          {/* About Section Skeleton */}
          <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg mt-4">
            <div className="p-4">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
