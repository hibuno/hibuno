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

// Memoized animation variants
const ANIMATION_VARIANTS = {
  card: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
    whileHover: { y: -4 },
  },
  image: {
    whileHover: { scale: 1.05 },
    transition: { duration: 0.3, ease: "easeOut" },
  },
  badge: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
  },
} as const;

// Memoized unpublished badge component
const UnpublishedBadge = memo(() => (
  <motion.span
    initial={ANIMATION_VARIANTS.badge.initial}
    animate={ANIMATION_VARIANTS.badge.animate}
    className="absolute left-2 top-2 rounded bg-yellow-500/90 px-2 py-1 text-xs font-semibold text-white shadow"
  >
    Belum diterbitkan
  </motion.span>
));

UnpublishedBadge.displayName = "UnpublishedBadge";

// Memoized post image component
const PostImage = memo(({ 
  post, 
  isUnpublished 
}: { 
  post: Post; 
  isUnpublished: boolean; 
}) => (
  <div className="relative aspect-[16/9] overflow-hidden rounded-lg mb-4">
    <motion.div
      whileHover={ANIMATION_VARIANTS.image.whileHover}
      transition={ANIMATION_VARIANTS.image.transition}
      className="w-full h-full"
    >
      <Image
        src={post.cover_image_url || "/placeholder.png"}
        alt={post.title}
        className="w-full h-full object-cover"
        width={500}
        height={300}
        loading="lazy"
      />
    </motion.div>
    {isUnpublished && <UnpublishedBadge />}
  </div>
));

PostImage.displayName = "PostImage";

// Memoized post meta component
const PostMeta = memo(({ 
  date, 
  isUnpublished 
}: { 
  date: Date; 
  isUnpublished: boolean; 
}) => (
  <motion.div
    className="flex items-center gap-3 text-sm text-gray-600"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.2 }}
  >
    <span className="font-medium text-gray-900">
      {date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
    </span>
    {isUnpublished && (
      <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
        Belum diterbitkan
      </span>
    )}
  </motion.div>
));

PostMeta.displayName = "PostMeta";

// Memoized post title component
const PostTitle = memo(({ title }: { title: string }) => (
  <motion.h3
    className="text-2xl font-serif font-bold group-hover:text-gray-600 transition-colors leading-tight"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
  >
    {title}
  </motion.h3>
));

PostTitle.displayName = "PostTitle";

// Memoized post excerpt component
const PostExcerpt = memo(({ excerpt }: { excerpt: string | null }) => (
  <motion.p
    className="text-gray-600 line-clamp-2"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.4 }}
  >
    {excerpt || "Read this article by Hibuno on https://hibuno.com"}
  </motion.p>
));

PostExcerpt.displayName = "PostExcerpt";

// Memoized author info component
const AuthorInfo = memo(() => (
  <motion.div
    className="flex items-center gap-2 pt-2"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.5 }}
  >
    <Image
      src="/placeholder.png"
      alt="hibuno"
      className="h-6 w-6 rounded-full object-cover"
      width={24}
      height={24}
    />
    <span className="text-sm text-gray-600">hibuno</span>
  </motion.div>
));

AuthorInfo.displayName = "AuthorInfo";

export const PostCard = memo(({ post }: { post: Post }) => {
  // Memoize computed values
  const { date, isUnpublished } = useMemo(() => {
    const date = new Date(post.published_at);
    const isDev = process.env.NODE_ENV === "development";
    const isUnpublished = isDev && post.published === false;
    
    return { date, isUnpublished };
  }, [post.published_at, post.published]);

  return (
    <motion.div
      initial={ANIMATION_VARIANTS.card.initial}
      animate={ANIMATION_VARIANTS.card.animate}
      transition={ANIMATION_VARIANTS.card.transition}
      whileHover={ANIMATION_VARIANTS.card.whileHover}
      className="group"
    >
      <Link href={`/${post.slug}`} passHref>
        <article className="cursor-pointer h-full">
          <PostImage post={post} isUnpublished={isUnpublished} />
          <div className="space-y-3">
            <PostMeta date={date} isUnpublished={isUnpublished} />
            <PostTitle title={post.title} />
            <PostExcerpt excerpt={post.excerpt} />
            <AuthorInfo />
          </div>
        </article>
      </Link>
    </motion.div>
  );
});

PostCard.displayName = "PostCard";
