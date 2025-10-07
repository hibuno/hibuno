import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ErrorBoundary } from "@/components/error-boundary";
import { MediaProvider } from "@/components/media-provider";
import { AuthorAvatar, PostCoverImage } from "@/components/optimized-image";
import PostNavigation from "@/components/post-navigation";
import DynamicTOCPostContent from "@/components/dynamic-toc-post-content";
import ArticleSignature from "@/components/article-signature";
import { ReadingProgress } from "@/components/reading-progress";
import SimilarPosts from "@/components/similar-posts";
import { SiteHeader } from "@/components/site-header";
import { StructuredData } from "@/components/structured-data";
import type { SelectPost } from "@/db/schema";
import { postQueries } from "@/lib/database";
import {
 generateBreadcrumbStructuredData,
 generatePostMetadata,
 generatePostStructuredData,
} from "@/lib/seo";
import { calculateStats } from "@/lib/utils";

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
   <div className="max-w-3xl mx-auto px-6 py-2.5 flex items-center justify-between text-sm">
    <div className="flex items-center gap-3">
     <span className="font-mono text-xs opacity-60">ADMIN MODE</span>
     {post.published === false && (
      <span className="text-xs px-2 py-0.5 bg-white/10 rounded">
       UNPUBLISHED
      </span>
     )}
    </div>
    <a
     href={`/admin/edit/${slug}`}
     className="hover:opacity-70 transition-opacity flex items-center gap-1.5"
    >
     <svg
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
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

function PostHeader({ post }: { post: SelectPost }) {
 const publishedISO = post.published_at || undefined;
 const readingTime = calculateStats(post.content)?.readingTime || 0;

 return (
  <header className="space-y-6 mb-12">
   {/* Title */}
   <h1 className="font-serif text-3xl md:text-5xl font-bold leading-[1.15] text-black dark:text-white tracking-tight">
    {post.title}
   </h1>

   {/* Excerpt */}
   {post.excerpt && (
    <p className="text-base md:text-lg text-black/60 dark:text-white/60 leading-relaxed">
     {post.excerpt}
    </p>
   )}

   {/* Meta */}
   <div className="flex items-center gap-2 text-xs text-black/50 dark:text-white/50">
    <div className="flex items-center gap-2">
     <AuthorAvatar
      src="/placeholder.png"
      alt="hibuno"
      className="h-6 w-6 rounded-full"
     />
     <span className="text-black/70 dark:text-white/70">hibuno</span>
    </div>
    {publishedISO && (
     <>
      <span>•</span>
      <time dateTime={new Date(publishedISO).toISOString()}>
       {formatDate(post.published_at ? new Date(post.published_at) : null)}
      </time>
     </>
    )}
    <span>•</span>
    <span>{readingTime} min read</span>
   </div>

   {/* Tags */}
   {normalizeTags(post.tags).length > 0 && (
    <div className="pt-2 flex flex-wrap gap-2">
     <TagList tags={normalizeTags(post.tags)} />

     {post.github_repo_url && (
      <a
       href={post.github_repo_url}
       target="_blank"
       rel="noopener noreferrer"
       className="text-xs px-3 py-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors rounded-md inline-flex items-center gap-1.5"
      >
       <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
       </svg>
       GitHub
      </a>
     )}

     {post.homepage_url && (
      <a
       href={post.homepage_url}
       target="_blank"
       rel="noopener noreferrer"
       className="text-xs px-3 py-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors rounded-md inline-flex items-center gap-1.5"
      >
       <svg
        className="w-3.5 h-3.5"
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
       Homepage
      </a>
     )}
    </div>
   )}
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
    className="absolute top-0 left-0 w-full h-[60vh] object-cover z-0 opacity-5"
   />
   <div className="absolute top-0 left-0 w-full h-[60vh] object-cover z-0 bg-gradient-to-b from-transparent via-85% via-white to-white"></div>
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
    <MediaProvider>
     <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white relative">
      <SiteHeader />

      {/* Cover Image */}
      <PostImage post={post} />

      {/* Main Content Container */}
      <main
       className={`max-w-3xl mx-auto px-6 relative z-10 ${
        isDevMode ? "pt-16" : "pt-8"
       } pb-20`}
      >
       <article className="space-y-12">
        {/* Header */}
        <PostHeader post={post} />

        {/* Content */}
        <PostContent post={post} />

        {/* Signature */}
        <ArticleSignature />
       </article>

       {/* Navigation & Related Content */}
       <div className="mt-20 space-y-12 divide-y divide-black/5 dark:divide-white/5">
        <PostNavigation
         published_at={(post.published_at || null) as string | null}
        />
        <SimilarPosts currentSlug={slug} tags={tags} />
       </div>
      </main>
     </div>
    </MediaProvider>
   </ErrorBoundary>
  );
 } catch (_error) {
  return notFound();
 }
}
