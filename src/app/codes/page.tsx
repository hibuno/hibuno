import type { Metadata } from "next";
import { ErrorBoundary } from "@/components/blog/error-boundary";
import { SiteHeader } from "@/components/blog/site-header";
import { SiteFooter } from "@/components/blog/site-footer";
import { ProductShortcuts } from "@/components/blog/product-shortcuts";
import { StructuredData } from "@/components/blog/structured-data";
import { CodesGrid } from "@/components/blog/codes-grid";
import { postQueries } from "@/lib/post-queries";
import { retryDatabaseOperation } from "@/lib/retry-helper";
import type { SelectPost, PostLocale } from "@/db/types";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Codes",
  description:
    "Kumpulan konten tentang coding dari hibuno. Tutorial, tips, dan berbagai konten menarik lainnya.",
};

export const dynamic = "force-dynamic";

export default async function CodesPage() {
  let posts: SelectPost[] = [];
  let error: string | null = null;

  try {
    // Get user's locale preference from cookies
    const cookieStore = await cookies();
    const locale = (cookieStore.get("NEXT_LOCALE")?.value ||
      "id") as PostLocale;

    posts = (await retryDatabaseOperation(() =>
      postQueries.getAllPosts(50, locale)
    )) as unknown as SelectPost[];

    posts = posts.filter((p) => p.content.includes("language-"));
  } catch (err) {
    error = err instanceof Error ? err.message : "Gagal memuat konten";
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Codes",
    description: "Kumpulan konten tentang coding dari hibuno",
    url: "https://hibuno.com/codes",
  };

  return (
    <ErrorBoundary>
      <StructuredData data={structuredData} />
      <div className="min-h-screen bg-background flex flex-col">
        <SiteHeader />

        {error ? (
          <main className="max-w-4xl mx-auto px-4 py-12 flex-1">
            <div className="text-center py-12">
              <p className="text-muted-foreground">{error}</p>
            </div>
          </main>
        ) : (
          <CodesGrid posts={posts} />
        )}

        <ProductShortcuts />
        <SiteFooter />
      </div>
    </ErrorBoundary>
  );
}
