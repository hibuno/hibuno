import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar } from "@/components/sidebar";

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-200 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content - Add left padding to prevent overlap with sidebar */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Hero Section Skeleton */}
            <div className="bg-violet-900/30 rounded-xl p-6 flex items-center">
              <div className="flex-1">
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-6 w-2/3 mb-4" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div>

            {/* Categories Section Skeleton */}
            <div>
              <Skeleton className="h-7 w-48 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4">
                    <Skeleton className="h-10 w-10 rounded-full mb-3" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-3" />
                    <Skeleton className="h-8 w-28" />
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Tools Section Skeleton */}
            <div>
              <Skeleton className="h-7 w-48 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 flex items-center">
                    <Skeleton className="h-10 w-10 rounded-full mr-4" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Access Skeleton */}
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </div>
            </div>

            {/* Features Card Skeleton */}
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start">
                    <Skeleton className="h-6 w-6 rounded-full mr-3" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Blog Posts Skeleton */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4">
                    <Skeleton className="h-3 w-20 mb-2" />
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
