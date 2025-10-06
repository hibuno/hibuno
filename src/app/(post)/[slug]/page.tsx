import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ErrorBoundary } from "@/components/error-boundary";
import MarkdownRenderer from "@/components/markdown-renderer";
import { AuthorAvatar, PostCoverImage } from "@/components/optimized-image";
import PostNavigation from "@/components/post-navigation";
import PostTOC from "@/components/post-toc";
import { ReadingProgress } from "@/components/reading-progress";
import { SocialShare, SocialShareCompact } from "@/components/social-share";
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

   {/* Tags */}
   {tags.length > 0 && (
    <div className="flex justify-center">
     <TagList tags={tags} />
    </div>
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
          description={post.excerpt || post.subtitle || undefined}
          className="w-full sm:w-auto"
         />
         <SocialShareCompact
          url={`${
           process.env.NEXT_PUBLIC_SITE_URL || "https://hibuno.com"
          }/${slug}`}
          title={post.title}
          description={post.excerpt || post.subtitle || undefined}
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
   </ErrorBoundary>
  );
 } catch (_error) {
  return notFound();
 }
}
