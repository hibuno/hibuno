import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar } from "@/components/sidebar";

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-200 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64 p-6">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Blog Posts Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4">
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
