import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar } from "@/components/sidebar";

export default function TextToolsLoading() {
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
            {/* Tabs Skeleton */}
            <div className="flex border-b border-zinc-700 mb-4 overflow-x-auto hide-scrollbar">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-8 w-24 mr-2 mb-2" />
              ))}
            </div>

            {/* Options Skeleton */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-32" />
              ))}
            </div>

            {/* Text Areas Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-64 w-full" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-5 w-24" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
                <Skeleton className="h-64 w-full" />
              </div>
            </div>

            {/* Stats Skeleton */}
            <div className="flex flex-wrap gap-4 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
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
