import "server-only";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { getSimilarPosts } from "@/db/server";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/config";

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
  locale: Locale;
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
          className="h-16 w-24 sm:h-20 sm:w-32 rounded-md object-cover ring-1 ring-border shrink-0"
          loading="lazy"
        />
      ) : (
        <div className="h-16 w-24 sm:h-20 sm:w-32 rounded-md bg-muted shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <div className="line-clamp-2 text-sm sm:text-base font-medium group-hover:underline">
          {post.title}
        </div>
        {post.excerpt && (
          <p className="mt-1 line-clamp-2 text-xs sm:text-sm text-muted-foreground">
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
  <ul className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
    {posts.map((post) => (
      <PostItem key={post.slug} post={post} />
    ))}
  </ul>
));

PostsGrid.displayName = "PostsGrid";

export default async function SimilarPosts({
  currentSlug,
  tags,
  locale,
}: SimilarPostsProps) {
  try {
    const t = await getTranslations({ locale, namespace: "post" });
    const posts = getSimilarPosts(currentSlug, tags, 4, locale);

    if (!posts?.length) {
      return null;
    }

    return (
      <section aria-label="Similar posts" className="mt-12">
        <h3 className="mb-4 text-lg font-semibold">{t("relatedArticles")}</h3>
        <PostsGrid posts={posts as Post[]} />
      </section>
    );
  } catch (error) {
    console.error("Error fetching similar posts:", error);
    return null;
  }
}
