import Image from "next/image";
import Link from "next/link";
import { ErrorBoundary } from "@/components/error-boundary";
import { NewsletterForm } from "@/components/newsletter-form";
import { type Post, PostCard } from "@/components/post-card";
import { SiteHeader } from "@/components/site-header";
import { HeroSkeleton, PostsGridSkeleton } from "@/components/loading";
import { StructuredData } from "@/components/structured-data";
import { AnimatedHomepage } from "@/components/animated-homepage";
import { postQueries } from "@/lib/database";
import { retryDatabaseOperation } from "@/lib/retry";
import { generateWebsiteStructuredData } from "@/lib/seo";

async function getHomepageData(): Promise<{
 featuredPosts: Post[];
 recentPosts: Post[];
 error?: string;
 isLoading?: boolean;
}> {
 try {
  // Get featured posts with retry mechanism
  const featuredPosts = await retryDatabaseOperation(() =>
   postQueries.getFeaturedPosts(1)
  );

  // Get recent posts excluding featured ones with retry mechanism
  const recentPosts = await retryDatabaseOperation(() =>
   postQueries.getRecentPosts(
    12,
    featuredPosts.map((p) => p.id)
   )
  );

  return {
   featuredPosts: featuredPosts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    subtitle: post.subtitle,
    excerpt: post.excerpt,
    cover_image_url: post.coverImageUrl,
    author_name: post.authorName,
    author_avatar_url: post.authorAvatarUrl,
    reading_time: post.readingTime,
    published: (post as any).published ?? true,
    published_at: (post.published_at || new Date().toISOString()) as string,
   })),
   recentPosts: recentPosts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    subtitle: post.subtitle,
    excerpt: post.excerpt,
    cover_image_url: post.coverImageUrl,
    author_name: post.authorName,
    author_avatar_url: post.authorAvatarUrl,
    reading_time: post.readingTime,
    published: (post as any).published ?? true,
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
   featuredPosts: [],
   recentPosts: [],
   error: isMissingTable
    ? "Database tables not found. Run `npm run db:migrate` to apply Drizzle migrations, then refresh."
    : `Failed to load posts: ${message}`,
  };
 }
}

function HeroSection({
 featuredPost,
 isLoading,
}: {
 featuredPost?: Post | undefined;
 isLoading?: boolean | undefined;
}) {
 if (isLoading) {
  return <HeroSkeleton />;
 }

 return (
  <section className="border-b border-border bg-card" role="banner">
   <div className="mx-auto max-w-6xl px-4 py-12">
    <div className="grid items-start gap-8 md:grid-cols-2">
     <div>
      <h1 className="font-serif text-balance text-4xl font-bold leading-tight md:text-5xl">
       Stories and ideas to deepen your understanding
      </h1>
      <p className="mt-3 max-w-prose text-lg text-muted-foreground">
       Read, learn, and subscribe for weekly updates. No noise, just thoughtful
       writing.
      </p>
      <div className="mt-6">
       <NewsletterForm />
      </div>
     </div>
     {featuredPost ? (
      <Link href={`/${featuredPost.slug}`} passHref>
       <article
        className="group cursor-pointer"
        role="region"
        aria-label="Featured post"
       >
        <div className="aspect-[16/9] overflow-hidden rounded-lg mb-4 relative">
         <Image
          src={featuredPost.cover_image_url || "/placeholder.svg"}
          alt={featuredPost.title || "hibuno"}
          width={500}
          height={300}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          priority
         />
         <span className="absolute top-3 left-3 px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-medium rounded">
          Featured
         </span>
        </div>
        <div className="space-y-3">
         <div className="flex items-center gap-3 text-sm text-gray-600">
          <span className="font-medium text-gray-900">
           {new Date(featuredPost.published_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
           })}
          </span>
          {featuredPost.reading_time && (
           <>
            <span>•</span>
            <div className="flex items-center gap-1">
             <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              role="img"
              aria-label="Clock icon"
             >
              <title>Clock</title>
              <path
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth={2}
               d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
             </svg>
             <span className="text-sm text-gray-700">
              {featuredPost.reading_time} min read
             </span>
            </div>
           </>
          )}
         </div>
         <h3 className="text-2xl font-serif font-bold group-hover:text-gray-600 transition-colors leading-tight">
          {featuredPost.title}
         </h3>
         <p className="text-gray-600 line-clamp-2">{featuredPost.excerpt}</p>
        </div>
       </article>
      </Link>
     ) : (
      <div className="text-muted-foreground" role="status" aria-live="polite">
       Featured post will appear here
      </div>
     )}
    </div>
   </div>
  </section>
 );
}

function PostsGrid({
 posts,
 isLoading,
}: {
 posts: Post[];
 isLoading?: boolean | undefined;
}) {
 if (isLoading) {
  return <PostsGridSkeleton count={6} />;
 }

 if (posts.length === 0) {
  return (
   <section role="region" aria-label="Recent posts">
    <div className="mx-auto max-w-6xl px-4 py-10">
     <p className="text-center text-muted-foreground">
      No posts yet. Add some in Supabase to get started.
     </p>
    </div>
   </section>
  );
 }

 return (
  <section role="region" aria-label="Recent posts">
   <div className="mx-auto max-w-6xl px-4 py-10">
    <h2 className="sr-only">Recent Posts</h2>
    <div className="grid gap-10 md:grid-cols-2">
     {posts.map((post) => (
      <PostCard key={post.id} post={post} />
     ))}
    </div>
   </div>
  </section>
 );
}

function ErrorState({ error }: { error: string }) {
 return (
  <main>
   <SiteHeader />
   <div className="mx-auto max-w-6xl px-4 py-16">
    <div className="text-center">
     <h2 className="text-2xl font-semibold mb-2">Unable to load content</h2>
     <p className="text-muted-foreground">{error}</p>
    </div>
   </div>
  </main>
 );
}

export default async function HomePage() {
 const { featuredPosts, recentPosts, error, isLoading } =
  await getHomepageData();

 if (error) {
  return <ErrorState error={error} />;
 }

 const websiteStructuredData = generateWebsiteStructuredData();

 return (
  <ErrorBoundary>
   <StructuredData data={websiteStructuredData} />
   <div>
    <SiteHeader />
    <AnimatedHomepage
     featuredPost={featuredPosts[0]}
     recentPosts={recentPosts}
    />
   </div>
  </ErrorBoundary>
 );
}
