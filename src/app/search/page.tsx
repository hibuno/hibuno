import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/blog/site-header";
import { SiteFooter } from "@/components/blog/site-footer";
import { SearchResults } from "@/components/blog/search-results";

export const metadata: Metadata = {
  title: "Pencarian - hibuno",
  description: "Cari artikel di hibuno",
};

export const dynamic = "force-dynamic";

export default function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <Suspense fallback={<SearchResultsSkeleton />}>
        <SearchResults />
      </Suspense>
      <SiteFooter />
    </div>
  );
}

function SearchResultsSkeleton() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="mb-8">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-4" />
        <div className="h-4 w-64 bg-muted rounded animate-pulse" />
      </div>
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-border rounded-lg p-4">
            <div className="h-6 w-3/4 bg-muted rounded animate-pulse mb-2" />
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </main>
  );
}
