import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ErrorBoundary } from "@/components/error-boundary";
import { MediaProvider } from "@/components/media-provider";
import MarkdownRenderer from "@/components/markdown-renderer";
import { AuthorAvatar, PostCoverImage } from "@/components/optimized-image";
import PostNavigation from "@/components/post-navigation";
import PostTOC from "@/components/post-toc";
import { PricingInfo } from "@/components/pricing-info";
import { ReadingProgress } from "@/components/reading-progress";
import { SocialMediaInfo } from "@/components/social-media-info";
import { SocialShare, SocialShareCompact } from "@/components/social-share";
import SimilarPosts from "@/components/similar-posts";
import { SiteHeader } from "@/components/site-header";
import { StructuredData } from "@/components/structured-data";
import { VoucherInfo } from "@/components/voucher-info";
import type { SelectPost } from "@/db/schema";
import { postQueries } from "@/lib/database";
import {
 generateBreadcrumbStructuredData,
 generatePostMetadata,
 generatePostStructuredData,
} from "@/lib/seo";

interface BlogPostPageProps {
 params: { slug: string };
}

// Helpers
const dateFormatter = new Intl.DateTimeFormat("en-US", {
 year: "numeric",
 month: "long",
 day: "numeric",
});

function formatDate(date?: Date | null) {
 return date ? dateFormatter.format(date) : "";
}

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
  <div className="flex gap-2 flex-wrap justify-center">
   {tags.map((tag) => (
    <span
     key={tag}
     className="rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground"
    >
     {tag}
    </span>
   ))}
  </div>
 );
}

function PostMeta({ post }: { post: SelectPost }) {
 const tags = normalizeTags(post.tags);
 const publishedISO = post.published_at || undefined;

 return (
  <div className="mt-8 space-y-6">
   {/* Author and Date Info */}
   <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
    {post.authorAvatarUrl && (
     <AuthorAvatar
      src={post.authorAvatarUrl}
      alt={`${post.authorName} avatar`}
      className="h-8 w-8"
     />
    )}
    <span className="font-medium text-foreground">{post.authorName}</span>
    {publishedISO && (
     <>
      <span className="text-muted-foreground/70">•</span>
      <time
       dateTime={new Date(publishedISO).toISOString()}
       className="font-medium"
      >
       {formatDate(post.published_at ? new Date(post.published_at) : null)}
      </time>
     </>
    )}
    {post.readingTime && (
     <>
      <span className="text-muted-foreground/70">•</span>
      <span className="font-medium">{post.readingTime} min read</span>
     </>
    )}
   </div>

   {/* GitHub Repository Information */}
   {(post.githubRepoUrl || post.githubHomepageUrl) && (
    <div className="flex justify-center">
     <GitHubInfo post={post} />
    </div>
   )}

   {/* Pricing Information */}
   {(post.minPrice || post.maxPrice || post.offerFree || post.inPromotion) && (
    <div className="flex justify-center">
     <PricingInfo post={post} />
    </div>
   )}

   {/* Social Media Links */}
   {post.socialMedias && post.socialMedias.length > 0 && (
    <div className="flex justify-center">
     <SocialMediaInfo socialMedias={post.socialMedias} />
    </div>
   )}

   {/* Voucher Codes */}
   {post.voucherCodes && post.voucherCodes.length > 0 && (
    <div className="flex justify-center">
     <VoucherInfo voucherCodes={post.voucherCodes} />
    </div>
   )}

   {/* Tags */}
   {tags.length > 0 && (
    <div className="flex justify-center">
     <TagList tags={tags} />
    </div>
   )}
  </div>
 );
}

function GitHubInfo({ post }: { post: SelectPost }) {
 return (
  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
   {/* GitHub Repository Link */}
   {post.githubRepoUrl && (
    <a
     href={post.githubRepoUrl}
     target="_blank"
     rel="noopener noreferrer"
     className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors group"
    >
     <svg
      className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white"
      fill="currentColor"
      viewBox="0 0 24 24"
     >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
     </svg>
     <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white">
      View Repository
     </span>
    </a>
   )}

   {/* GitHub Stats */}
   <div className="flex items-center gap-3">
    {post.githubStars && post.githubStars > 0 && (
     <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
       <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span className="font-medium">{post.githubStars.toLocaleString()}</span>
     </div>
    )}

    {post.githubForks && post.githubForks > 0 && (
     <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
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
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
       />
      </svg>
      <span className="font-medium">{post.githubForks.toLocaleString()}</span>
     </div>
    )}
   </div>

   {/* Homepage Link */}
   {post.githubHomepageUrl && post.githubHomepageUrl !== post.githubRepoUrl && (
    <a
     href={post.githubHomepageUrl}
     target="_blank"
     rel="noopener noreferrer"
     className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
    >
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
     <span className="text-sm font-medium">Homepage</span>
    </a>
   )}

   {/* Pricing Link */}
   {post.githubPricingUrl && (
    <a
     href={post.githubPricingUrl}
     target="_blank"
     rel="noopener noreferrer"
     className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
    >
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
       d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
      />
     </svg>
     <span className="text-sm font-medium">Pricing</span>
    </a>
   )}
  </div>
 );
}

function PostHeader({ post }: { post: SelectPost }) {
 return (
  <header className="mb-12 text-center">
   <h1 className="font-serif text-balance text-4xl font-bold leading-tight md:text-5xl mb-6">
    {post.title}
   </h1>
   {process.env.NODE_ENV === "development" && post.published === false && (
    <div className="mx-auto mb-4 inline-block rounded bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
     Unpublished
    </div>
   )}
   {post.subtitle && (
    <p className="mt-6 text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
     {post.subtitle}
    </p>
   )}
   <PostMeta post={post} />
  </header>
 );
}

function PostContent({ post }: { post: SelectPost }) {
 // If we have full content, render it with TOC and markdown
 if (post.content) {
  return (
   <div className="mt-8 space-y-4">
    {/* Show excerpt as introduction if available */}
    {post.excerpt && (
     <div className="prose prose-zinc dark:prose-invert max-w-none border-b border-border pb-6">
      <p className="text-lg leading-relaxed text-muted-foreground font-medium">
       {post.excerpt}
      </p>
     </div>
    )}
    {/* Table of contents for long content */}
    <PostTOC markdown={post.content} />
    {/* Main content */}
    <MarkdownRenderer markdown={post.content} />
   </div>
  );
 }

 // Fallback to excerpt if no full content
 if (post.excerpt) {
  return (
   <div className="prose prose-zinc dark:prose-invert mt-8 max-w-none">
    {post.excerpt.split(/\n{2,}/g).map((para, i) => (
     <p key={`${para.slice(0, 20)}-${i}`} className="mb-4 last:mb-0">
      {para}
     </p>
    ))}
   </div>
  );
 }

 // If no content or excerpt, show a message
 return (
  <div className="prose prose-zinc dark:prose-invert mt-8 max-w-none">
   <p className="text-muted-foreground italic">Content coming soon...</p>
  </div>
 );
}

function PostImage({ post }: { post: SelectPost }) {
 if (!post.coverImageUrl) return null;
 return (
  <div className="mb-12">
   <PostCoverImage
    src={post.coverImageUrl}
    alt={post.coverImageAlt || post.title}
    className="w-full"
   />
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

  return (
   <ErrorBoundary>
    <StructuredData data={structuredData} />
    <StructuredData data={breadcrumbData} />
    <ReadingProgress />
    <MediaProvider>
     <main className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-4 py-8 lg:py-12">
      {/* Development-only edit button */}
      {process.env.NODE_ENV === "development" && (
       <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
         Development Mode: Edit this post
        </p>
        <a
         href={`/admin/edit/${slug}`}
         className="inline-flex items-center px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-md transition-colors"
        >
         Edit Post
        </a>
       </div>
      )}
      <article className="mx-auto max-w-3xl">
       <PostHeader post={post} />
       <PostImage post={post} />
       <PostContent post={post} />

       {/* Social sharing section */}
       <div className="mt-12 pt-8 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
         <SocialShare
          url={`${
           process.env.NEXT_PUBLIC_SITE_URL || "https://hibuno.com"
          }/${slug}`}
          title={post.title}
          className="w-full sm:w-auto"
         />
         <SocialShareCompact
          url={`${
           process.env.NEXT_PUBLIC_SITE_URL || "https://hibuno.com"
          }/${slug}`}
          title={post.title}
          className="self-end sm:self-auto"
         />
        </div>
       </div>

       <div className="mt-16 space-y-12">
        <PostNavigation
         published_at={(post.published_at || null) as string | null}
        />
        <SimilarPosts currentSlug={slug} tags={tags} />
       </div>
      </article>
      </div>
     </main>
    </MediaProvider>
   </ErrorBoundary>
  );
 } catch (_error) {
  return notFound();
 }
}
