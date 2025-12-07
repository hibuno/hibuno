import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleSignature from "@/components/blog/post-signature";
import DynamicTOCPostContent from "@/components/blog/post-content-with-toc";
import { ErrorBoundary } from "@/components/blog/error-boundary";
import {
  AuthorAvatar,
  PostCoverImage,
} from "@/components/blog/optimized-image";
import PostNavigation from "@/components/blog/post-navigation";
import { ReadingProgress } from "@/components/blog/reading-progress-bar";
import SimilarPosts from "@/components/blog/similar-posts";
import { SiteHeader } from "@/components/blog/site-header";
import { StructuredData } from "@/components/blog/structured-data";
import SocialMediaHighlight from "@/components/blog/social-media-highlight";
import type { SelectPost, SocialMediaLink } from "@/db/types";
import { postQueries } from "@/lib/post-queries";
import {
  generateBreadcrumbStructuredData,
  generatePostMetadata,
  generatePostStructuredData,
} from "@/lib/seo-metadata";
import { calculateStats } from "@/lib/content-utils";

interface BlogPostPageProps {
  params: { slug: string };
}

// Helpers

function normalizeTags(tags: SelectPost["tags"] | null | undefined): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return (tags as string[]).filter(Boolean);
  return String(tags)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function TagList({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <>
      {tags.map((tag) => (
        <span
          key={tag}
          className="text-xs px-3 py-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors cursor-pointer"
        >
          #{tag}
        </span>
      ))}
    </>
  );
}

function AdminToolbar({ slug, post }: { slug: string; post: SelectPost }) {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs opacity-60">ADMIN MODE</span>
          {post.published === false && (
            <span className="text-xs px-2 py-0.5 bg-white/10 rounded">
              UNPUBLISHED
            </span>
          )}
        </div>
        <a
          href={`/editor/${slug}`}
          className="hover:opacity-70 transition-opacity flex items-center gap-1.5"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            role="img"
            aria-label="Edit post"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          <span className="text-xs">Edit</span>
        </a>
      </div>
    </div>
  );
}

function ProductInfo({ post }: { post: SelectPost }) {
  const hasProductInfo =
    post.price ||
    post.discount_percentage ||
    post.homepage ||
    post.product_description;

  if (!hasProductInfo) return null;

  // Ensure price is a number
  const priceNum =
    typeof post.price === "string" ? parseFloat(post.price) : post.price;

  const finalPrice =
    priceNum && post.discount_percentage
      ? priceNum * (1 - post.discount_percentage / 100)
      : priceNum;

  return (
    <div className="p-4 bg-black/5 dark:bg-white/5 rounded-lg border border-black/10 dark:border-white/10">
      <div className="space-y-3">
        {/* Price Section */}
        {priceNum && (
          <div className="flex items-baseline gap-2 flex-wrap">
            {post.discount_percentage ? (
              <>
                <span className="text-2xl font-bold text-black dark:text-white">
                  Rp {Math.round(finalPrice || 0).toLocaleString("id-ID")}
                </span>
                <span className="text-sm text-black/40 dark:text-white/40 line-through">
                  Rp {Math.round(priceNum).toLocaleString("id-ID")}
                </span>
                <span className="px-1.5 py-0.5 bg-black dark:bg-white text-white dark:text-black text-xs font-medium rounded">
                  -{post.discount_percentage}%
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-black dark:text-white">
                Rp {Math.round(priceNum).toLocaleString("id-ID")}
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {post.product_description && (
          <p className="text-sm text-black/60 dark:text-white/60">
            {post.product_description}
          </p>
        )}

        {/* Homepage Link */}
        {post.homepage && (
          <a
            href={post.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded hover:bg-black/80 dark:hover:bg-white/80 transition-colors"
          >
            <span>Kunjungi Website</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

// Format date consistently to avoid hydration mismatch
function formatDate(date: Date): string {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function PostHeader({ post }: { post: SelectPost }) {
  const publishedISO = post.published_at || Date.now();
  const readingTime = calculateStats(post.content)?.readingTime || 0;
  const date = new Date(publishedISO);

  return (
    <header className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
      {/* Title */}
      <h1 className="font-serif text-2xl sm:text-3xl md:text-5xl font-bold leading-[1.15] text-black dark:text-white tracking-tight">
        {post.title}
      </h1>

      {/* Excerpt */}
      {post.excerpt && (
        <p className="text-sm sm:text-base md:text-lg text-black/60 dark:text-white/60 leading-relaxed">
          {post.excerpt}
        </p>
      )}

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-black/50 dark:text-white/50">
        <div className="flex items-center gap-2">
          <AuthorAvatar
            src="/placeholder.svg"
            alt="hibuno"
            className="h-6 w-6 rounded-full"
          />
          <span className="text-black/70 dark:text-white/70">hibuno</span>
        </div>
        <span className="hidden sm:inline">•</span>
        <time className="font-medium text-neutral-500 dark:text-neutral-400">
          {formatDate(date)}
        </time>
        <span>•</span>
        <span>{readingTime} menit baca</span>
      </div>

      {/* Tags */}
      {normalizeTags(post.tags).length > 0 && (
        <div className="pt-2 flex flex-wrap gap-2">
          <TagList tags={normalizeTags(post.tags)} />
        </div>
      )}

      {/* Product Info */}
      <ProductInfo post={post} />
    </header>
  );
}

function PostImage({ post }: { post: SelectPost }) {
  if (!post.cover_image_url) return null;
  return (
    <>
      <PostCoverImage
        src={post.cover_image_url}
        alt={post.title}
        className="absolute top-0 left-0 w-full h-[60vh] object-cover z-0 opacity-20"
      />
      <div className="absolute top-0 left-0 w-full h-[60vh] object-cover z-1 bg-gradient-to-b from-transparent via-85% via-white to-white"></div>
    </>
  );
}

function PostContent({ post }: { post: SelectPost }) {
  if (post.content) {
    return (
      <div className="space-y-8">
        {/* Main content with dynamic TOC insertion */}
        <DynamicTOCPostContent post={post} />
      </div>
    );
  }

  if (post.excerpt) {
    return (
      <div className="prose prose-lg max-w-none">
        {post.excerpt.split(/\n{2,}/g).map((para, i) => (
          <p
            key={`${para.slice(0, 20)}-${i}`}
            className="mb-6 last:mb-0 text-base md:text-lg leading-relaxed text-black/80 dark:text-white/80"
          >
            {para}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className="text-center py-20">
      <p className="text-black/40 dark:text-white/40 text-sm">
        Content coming soon
      </p>
    </div>
  );
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const post = await postQueries.getPostBySlug(slug);

    if (!post) {
      return {
        title: "Post Not Found",
      };
    }

    return generatePostMetadata(post);
  } catch (_error) {
    return {
      title: "Post Not Found",
    };
  }
}

export const revalidate = 0;

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  try {
    const { slug } = await params;
    const post = await postQueries.getPostBySlug(slug);

    if (!post) {
      return notFound();
    }

    const tags = normalizeTags(post.tags);
    const structuredData = generatePostStructuredData(post);
    const breadcrumbData = generateBreadcrumbStructuredData([
      { name: "Home", url: "/" },
      { name: post.title, url: `/${slug}` },
    ]);

    const isDevMode = process.env.NODE_ENV === "development";

    return (
      <ErrorBoundary>
        <StructuredData data={structuredData} />
        <StructuredData data={breadcrumbData} />
        <ReadingProgress />
        <AdminToolbar slug={slug} post={post} />
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white relative">
          <SiteHeader />

          {/* Cover Image */}
          <PostImage post={post} />

          {/* Main Content Container */}
          <main
            className={`max-w-6xl mx-auto px-4 relative z-10 ${
              isDevMode ? "pt-12 sm:pt-16" : "pt-6 sm:pt-8"
            } pb-12 sm:pb-20`}
          >
            <div className="flex gap-8">
              {/* Main Article */}
              <div className="flex-1 max-w-4xl">
                <article className="space-y-12">
                  {/* Header */}
                  <PostHeader post={post} />

                  {/* Content */}
                  <PostContent post={post} />

                  {/* Signature */}
                  <ArticleSignature />
                </article>

                {/* Navigation & Related Content */}
                <div className="mt-12 sm:mt-20 space-y-8 sm:space-y-12 divide-y divide-black/5 dark:divide-white/5">
                  <PostNavigation
                    published_at={(post.published_at || null) as string | null}
                  />
                  <SimilarPosts currentSlug={slug} tags={tags} />
                </div>
              </div>

              {/* Right Sidebar - Social Media Highlight (Desktop) */}
              {post.social_media_links &&
                (post.social_media_links as SocialMediaLink[]).length > 0 && (
                  <aside className="hidden xl:block w-64 shrink-0">
                    <SocialMediaHighlight
                      links={post.social_media_links as SocialMediaLink[]}
                    />
                  </aside>
                )}
            </div>

            {/* Mobile Social Media Highlight */}
            {post.social_media_links &&
              (post.social_media_links as SocialMediaLink[]).length > 0 && (
                <div className="xl:hidden mt-8 pt-8 border-t border-black/5 dark:border-white/5">
                  <SocialMediaHighlight
                    links={post.social_media_links as SocialMediaLink[]}
                  />
                </div>
              )}
          </main>
        </div>
      </ErrorBoundary>
    );
  } catch (_error) {
    return notFound();
  }
}
