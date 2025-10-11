import "server-only";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { getServerSupabase } from "@/db/server";

interface Post {
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string;
}

interface SimilarPostsProps {
  currentSlug: string;
  tags?: string[] | null;
}

// Memoized post item component
const PostItem = memo(({ post }: { post: Post }) => (
  <li key={post.slug} className="group">
    <Link href={`/${post.slug}`} className="flex gap-3">
      {post.cover_image_url ? (
        <Image
          src={post.cover_image_url}
          alt=""
          width={128}
          height={80}
          className="h-20 w-32 rounded-md object-cover ring-1 ring-border"
          loading="lazy"
        />
      ) : (
        <div className="h-20 w-32 rounded-md bg-muted" />
      )}
      <div>
        <div className="line-clamp-2 font-medium group-hover:underline">
          {post.title}
        </div>
        {post.excerpt && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {post.excerpt}
          </p>
        )}
      </div>
    </Link>
  </li>
));

PostItem.displayName = "PostItem";

// Memoized posts grid component
const PostsGrid = memo(({ posts }: { posts: Post[] }) => (
  <ul className="grid gap-6 sm:grid-cols-2">
    {posts.map((post) => (
      <PostItem key={post.slug} post={post} />
    ))}
  </ul>
));

PostsGrid.displayName = "PostsGrid";

// Optimized query function with better error handling
async function getSimilarPosts(
  currentSlug: string,
  tags?: string[] | null,
): Promise<Post[] | null> {
  const supabase = getServerSupabase();

  try {
    // First try: Get posts with similar tags if tags are provided
    if (tags?.length) {
      const { data: taggedPosts, error: tagError } = await supabase
        .from("posts")
        .select("slug,title,excerpt,cover_image_url,published_at")
        .neq("slug", currentSlug)
        .contains("tags", tags)
        .order("published_at", { ascending: false })
        .limit(4);

      if (!tagError && taggedPosts?.length) {
        return taggedPosts;
      }
    }

    // Fallback: Get latest posts excluding current
    const { data: latestPosts, error: latestError } = await supabase
      .from("posts")
      .select("slug,title,excerpt,cover_image_url,published_at")
      .neq("slug", currentSlug)
      .order("published_at", { ascending: false })
      .limit(4);

    if (latestError) {
      console.error("Error fetching similar posts:", latestError);
      return null;
    }

    return latestPosts || null;
  } catch (error) {
    console.error("Unexpected error in getSimilarPosts:", error);
    return null;
  }
}

export default async function SimilarPosts({
  currentSlug,
  tags,
}: SimilarPostsProps) {
  const posts = await getSimilarPosts(currentSlug, tags);

  if (!posts?.length) {
    return null;
  }

  return (
    <section aria-label="Similar posts" className="mt-12">
      <h3 className="mb-4 text-lg font-semibold">Postingan Serupa</h3>
      <PostsGrid posts={posts} />
    </section>
  );
}
