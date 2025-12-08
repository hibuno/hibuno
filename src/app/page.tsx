import { AnimatedHomepage } from "@/components/blog/home-posts-grid";
import { ErrorBoundary } from "@/components/blog/error-boundary";
import type { Post } from "@/components/blog/post-card";
import { SiteHeader } from "@/components/blog/site-header";
import { SiteFooter } from "@/components/blog/site-footer";
import { StructuredData } from "@/components/blog/structured-data";
import { postQueries } from "@/lib/post-queries";
import { retryDatabaseOperation } from "@/lib/retry-helper";
import { generateWebsiteStructuredData } from "@/lib/seo-metadata";
import { cookies } from "next/headers";
import type { PostLocale } from "@/db/types";

// Disable caching to always read fresh data from local files
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getHomepageData(): Promise<{
  recentPosts: Post[];
  error?: string;
  isLoading?: boolean;
}> {
  try {
    // Get user's locale preference from cookies
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get("NEXT_LOCALE");
    const locale = (localeCookie?.value || "id") as PostLocale;

    // Get recent posts WITHOUT social media links (those go to /codes)
    const recentPosts = await retryDatabaseOperation(() =>
      postQueries.getPostsWithoutSocialMedia(12, locale)
    );

    return {
      recentPosts: recentPosts.map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt ?? null,
        cover_image_url: post.cover_image_url ?? null,
        published: "published" in post ? post.published ?? true : true,
        published_at: (post.published_at || new Date().toISOString()) as string,
      })),
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error && typeof err?.message === "string"
        ? err.message
        : "Unknown error";
    const isMissingTable = message.includes("Could not find the table");

    return {
      recentPosts: [],
      error: isMissingTable
        ? "Tabel database tidak ditemukan. Jalankan `npm run db:migrate` untuk menerapkan migrasi Drizzle, lalu muat ulang."
        : `Gagal memuat posting: ${message}`,
    };
  }
}

function ErrorState({ error }: { error: string }) {
  return (
    <main>
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">
            Tidak dapat memuat konten
          </h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    </main>
  );
}

export default async function HomePage() {
  const { recentPosts, error } = await getHomepageData();

  if (error) {
    return <ErrorState error={error} />;
  }

  const websiteStructuredData = generateWebsiteStructuredData();

  return (
    <ErrorBoundary>
      <StructuredData data={websiteStructuredData} />
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <AnimatedHomepage recentPosts={recentPosts} />
        <SiteFooter />
      </div>
    </ErrorBoundary>
  );
}
