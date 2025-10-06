import { ErrorBoundary } from "@/components/error-boundary";
import type { Post } from "@/components/post-card";
import { SiteHeader } from "@/components/site-header";
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
    github_repo_url: post.githubRepoUrl,
    github_stars: post.githubStars,
    github_forks: post.githubForks,
    github_homepage_url: post.githubHomepageUrl,
    github_pricing_url: post.githubPricingUrl,
    github_license: post.githubLicense,
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
    github_repo_url: post.githubRepoUrl,
    github_stars: post.githubStars,
    github_forks: post.githubForks,
    github_homepage_url: post.githubHomepageUrl,
    github_pricing_url: post.githubPricingUrl,
    github_license: post.githubLicense,
    min_price: post.minPrice,
    max_price: post.maxPrice,
    offer_free: post.offerFree,
    prev_min_price: post.prevMinPrice,
    prev_max_price: post.prevMaxPrice,
    in_promotion: post.inPromotion,
    social_medias: post.socialMedias,
    voucher_codes: post.voucherCodes,
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
 const { featuredPosts, recentPosts, error } = await getHomepageData();

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
