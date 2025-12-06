"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { memo, useMemo } from "react";

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published?: boolean;
  published_at: string;
};

const ANIMATION = {
  card: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" },
    whileHover: { y: -2 },
  },
  image: {
    whileHover: { scale: 1.02 },
    transition: { duration: 0.25, ease: "easeOut" },
  },
} as const;

const PostImage = memo(
  ({ post, isUnpublished }: { post: Post; isUnpublished: boolean }) => (
    <div className="relative aspect-video overflow-hidden rounded-md mb-3">
      <motion.div
        whileHover={ANIMATION.image.whileHover}
        transition={ANIMATION.image.transition}
        className="w-full h-full"
      >
        <Image
          src={post.cover_image_url || "/placeholder.svg"}
          alt={post.title || "Blog post cover image"}
          className="w-full h-full object-cover"
          width={500}
          height={300}
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </motion.div>
      {isUnpublished && (
        <span className="absolute left-2 top-2 rounded bg-neutral-500/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
          Draft
        </span>
      )}
    </div>
  )
);

PostImage.displayName = "PostImage";

// Format date consistently to avoid hydration mismatch
const formatDate = (date: Date): string => {
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
};

const PostMeta = memo(({ date }: { date: Date }) => (
  <div className="text-xs text-muted-foreground mb-1" suppressHydrationWarning>
    {formatDate(date)}
  </div>
));

PostMeta.displayName = "PostMeta";

export const PostCard = memo(({ post }: { post: Post }) => {
  const { date, isUnpublished } = useMemo(() => {
    const date = new Date(post.published_at);
    const isDev = process.env.NODE_ENV === "development";
    const isUnpublished = isDev && post.published === false;
    return { date, isUnpublished };
  }, [post.published_at, post.published]);

  return (
    <motion.div
      initial={ANIMATION.card.initial}
      animate={ANIMATION.card.animate}
      transition={ANIMATION.card.transition}
      whileHover={ANIMATION.card.whileHover}
      className="group"
    >
      <Link href={`/${post.slug}`} passHref>
        <article className="cursor-pointer h-full">
          <PostImage post={post} isUnpublished={isUnpublished} />
          <div className="space-y-1">
            <PostMeta date={date} />
            <h3 className="text-base sm:text-lg font-serif font-semibold group-hover:text-muted-foreground transition-colors leading-snug line-clamp-2">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {post.excerpt}
              </p>
            )}
          </div>
        </article>
      </Link>
    </motion.div>
  );
});

PostCard.displayName = "PostCard";
