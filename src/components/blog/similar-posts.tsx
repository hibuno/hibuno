import "server-only";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { getSimilarPosts } from "@/db/server";

interface Post {
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: Date | null;
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

export default async function SimilarPosts({
  currentSlug,
  tags,
}: SimilarPostsProps) {
  try {
    const posts = getSimilarPosts(currentSlug, tags, 4);

    if (!posts?.length) {
      return null;
    }

    return (
      <section aria-label="Similar posts" className="mt-12">
        <h3 className="mb-4 text-lg font-semibold">Postingan Serupa</h3>
        <PostsGrid posts={posts as Post[]} />
      </section>
    );
  } catch (error) {
    console.error("Error fetching similar posts:", error);
    return null;
  }
}
