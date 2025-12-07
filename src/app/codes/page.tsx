import type { Metadata } from "next";
import Link from "next/link";
import { ErrorBoundary } from "@/components/blog/error-boundary";
import { SiteHeader } from "@/components/blog/site-header";
import { StructuredData } from "@/components/blog/structured-data";
import { postQueries } from "@/lib/post-queries";
import { retryDatabaseOperation } from "@/lib/retry-helper";
import type { SelectPost, SocialMediaLink } from "@/db/types";

export const metadata: Metadata = {
  title: "Codes - Video & Social Media Content",
  description:
    "Kumpulan konten video dan social media dari hibuno. Tutorial, tips, dan berbagai konten menarik lainnya.",
};

export const dynamic = "force-dynamic";

const PLATFORM_CONFIG = {
  tiktok: { label: "TikTok", icon: "🎵", color: "bg-black text-white" },
  youtube: { label: "YouTube", icon: "▶️", color: "bg-red-600 text-white" },
  instagram: {
    label: "Instagram",
    icon: "📷",
    color: "bg-pink-500 text-white",
  },
  twitter: { label: "Twitter/X", icon: "𝕏", color: "bg-black text-white" },
  facebook: { label: "Facebook", icon: "📘", color: "bg-blue-600 text-white" },
};

function formatDate(date: Date | string): string {
  const d = new Date(date);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function CodeCard({ post }: { post: SelectPost }) {
  const links = (post.social_media_links || []) as SocialMediaLink[];
  const primaryLink = links[0];

  return (
    <Link href={`/${post.slug}`} className="group block">
      <article className="h-full rounded-xl border border-border bg-card overflow-hidden hover:border-foreground/20 transition-all duration-200 hover:shadow-lg">
        {/* Cover Image or Platform Banner */}
        {post.cover_image_url ? (
          <div className="aspect-video relative overflow-hidden bg-muted">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Platform badges */}
            <div className="absolute top-2 right-2 flex gap-1">
              {links.map((link, i) => {
                const p = PLATFORM_CONFIG[link.platform];
                return (
                  <span
                    key={i}
                    className={`px-2 py-1 rounded text-xs font-medium ${p.color}`}
                  >
                    {p.icon}
                  </span>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <div className="flex gap-2">
              {links.map((link, i) => {
                const p = PLATFORM_CONFIG[link.platform];
                return (
                  <span
                    key={i}
                    className={`px-3 py-2 rounded-lg text-2xl ${p.color}`}
                  >
                    {p.icon}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-3">
          <h2 className="font-semibold text-lg leading-tight group-hover:text-foreground/80 transition-colors line-clamp-2">
            {post.title}
          </h2>

          {post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {post.excerpt}
            </p>
          )}

          {/* Caption from first social link */}
          {primaryLink?.caption && (
            <p className="text-xs text-muted-foreground italic line-clamp-2 border-l-2 border-muted pl-2">
              "{primaryLink.caption}"
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <time className="text-xs text-muted-foreground">
              {formatDate(post.published_at || post.created_at)}
            </time>
            <div className="flex items-center gap-1">
              {links.map((link, i) => {
                const p = PLATFORM_CONFIG[link.platform];
                return (
                  <span
                    key={i}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                  >
                    {p.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default async function CodesPage() {
  let posts: SelectPost[] = [];
  let error: string | null = null;

  try {
    posts = (await retryDatabaseOperation(() =>
      postQueries.getPostsWithSocialMedia(50)
    )) as unknown as SelectPost[];
  } catch (err) {
    error = err instanceof Error ? err.message : "Gagal memuat konten";
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Codes - Video & Social Media Content",
    description: "Kumpulan konten video dan social media dari hibuno",
    url: "https://hibuno.com/codes",
  };

  return (
    <ErrorBoundary>
      <StructuredData data={structuredData} />
      <div className="min-h-screen bg-background">
        <SiteHeader />

        <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
          {/* Header */}
          <header className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Codes</h1>
            <p className="text-muted-foreground max-w-2xl">
              Kumpulan konten video dan social media. Tutorial, tips, dan
              berbagai konten menarik yang bisa kamu tonton langsung.
            </p>
          </header>

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!error && posts.length === 0 && (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">📹</div>
              <h2 className="text-xl font-semibold mb-2">Belum ada konten</h2>
              <p className="text-muted-foreground">
                Konten video dan social media akan muncul di sini.
              </p>
            </div>
          )}

          {/* Posts Grid */}
          {!error && posts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <CodeCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}
