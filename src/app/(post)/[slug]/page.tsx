import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ErrorBoundary } from "@/components/error-boundary";
import MarkdownRenderer from "@/components/markdown-renderer";
import { AuthorAvatar, PostCoverImage } from "@/components/optimized-image";
import PostNavigation from "@/components/post-navigation";
import PostTOC from "@/components/post-toc";
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
 if (post.content) {
  return (
   <div className="mt-8 space-y-4">
    {post.excerpt && (
     <div className="prose prose-zinc dark:prose-invert max-w-none">
      {post.excerpt.split(/\n{2,}/g).map((para, i) => (
       <p key={`${para.slice(0, 20)}-${i}`}>{para}</p>
      ))}
     </div>
    )}
    <PostTOC markdown={post.content} />
    <MarkdownRenderer markdown={post.content} />
   </div>
  );
 }

 return (
  <div className="prose prose-zinc dark:prose-invert mt-8 max-w-none">
   {post.excerpt?.split(/\n{2,}/g).map((para, i) => (
    <p key={`${para.slice(0, 20)}-${i}`}>{para}</p>
   ))}
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
    <main className="min-h-screen">
     <SiteHeader />
     <div className="mx-auto max-w-4xl px-4 py-8 lg:py-12">
      {/* Development-only edit button */}
      {process.env.NODE_ENV === "development" && (
       <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
         Development Mode: Edit this post
        </p>
        <a
         href={`/admin/edit/${slug}`}
         className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
        >
         Edit Post
        </a>
       </div>
      )}
      <article className="mx-auto max-w-3xl">
       <PostHeader post={post} />
       <PostImage post={post} />
       <PostContent post={post} />
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
