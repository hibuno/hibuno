import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar } from "@/components/sidebar";

export default function BlogPostLoading() {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-200 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64 p-6">
        {/* Back Button Skeleton */}
        <Skeleton className="h-9 w-9 mb-6" />

        {/* Article Skeleton */}
        <article className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Skeleton className="h-3 w-32 mb-2" />
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-5 w-full mb-6" />
            <div className="flex items-center">
              <Skeleton className="h-10 w-10 rounded-full mr-3" />
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <Skeleton className="h-80 w-full mb-8 rounded-lg" />

          {/* Content Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-11/12" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
            
            <Skeleton className="h-20 w-full" />
            
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            
            <Skeleton className="h-40 w-full rounded-lg" />
            
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-11/12" />
            <Skeleton className="h-5 w-full" />
          </div>
        </article>
      </div>
    </div>
  );
}
