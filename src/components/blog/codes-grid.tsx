"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { memo, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { SelectPost, SocialMediaLink } from "@/db/types";
import type { Locale } from "@/i18n/config";

interface CodesGridProps {
  posts: SelectPost[];
}

const ANIMATION = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  },
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

import {
  siYoutube,
  siTiktok,
  siInstagram,
  siX,
  siFacebook,
} from "simple-icons";

const PLATFORM_CONFIG = {
  tiktok: { label: "TikTok", icon: siTiktok.path },
  youtube: { label: "YouTube", icon: siYoutube.path },
  instagram: { label: "Instagram", icon: siInstagram.path },
  twitter: { label: "X", icon: siX.path },
  facebook: { label: "Facebook", icon: siFacebook.path },
};

const formatDate = (date: Date, locale: Locale): string => {
  return date.toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const PostImage = memo(
  ({ post, links }: { post: SelectPost; links: SocialMediaLink[] }) => (
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
      {links.length > 0 && (
        <div className="absolute top-2 right-2 flex gap-1">
          {links.map((link, i) => {
            const p = PLATFORM_CONFIG[link.platform];
            return (
              <span
                key={i}
                className="px-2 py-1 rounded bg-background/90 backdrop-blur-sm border border-border"
                title={p.label}
              >
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  className="w-3 h-3 fill-current text-foreground"
                  aria-label={p.label}
                >
                  <path d={p.icon} />
                </svg>
              </span>
            );
          })}
        </div>
      )}
    </div>
  )
);

PostImage.displayName = "PostImage";

const PostMeta = memo(({ date }: { date: Date }) => {
  const locale = useLocale() as Locale;
  return (
    <div
      className="text-xs text-muted-foreground mb-1"
      suppressHydrationWarning
    >
      {formatDate(date, locale)}
    </div>
  );
});

PostMeta.displayName = "PostMeta";

const CodeCard = memo(({ post }: { post: SelectPost }) => {
  const { date, links } = useMemo(() => {
    const date = new Date(post.published_at || post.created_at);
    const links = (post.social_media_links || []) as SocialMediaLink[];
    return { date, links };
  }, [post.published_at, post.created_at, post.social_media_links]);

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
          <PostImage post={post} links={links} />
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

CodeCard.displayName = "CodeCard";

const HeroSection = memo(() => {
  const t = useTranslations("codes");
  return (
    <motion.header className="mb-8 sm:mb-12" variants={ANIMATION.item}>
      <motion.h1
        className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold mb-3"
        variants={ANIMATION.item}
      >
        {t("title")}
      </motion.h1>
      <motion.p
        className="text-sm sm:text-base text-muted-foreground max-w-2xl"
        variants={ANIMATION.item}
      >
        {t("description")}
      </motion.p>
    </motion.header>
  );
});

HeroSection.displayName = "HeroSection";

const CodeGridItem = memo(
  ({ post, index }: { post: SelectPost; index: number }) => (
    <motion.div
      key={post.id}
      variants={ANIMATION.item}
      transition={{ delay: index * 0.05 }}
    >
      <CodeCard post={post} />
    </motion.div>
  )
);

CodeGridItem.displayName = "CodeGridItem";

const CodesGridContent = memo(({ posts }: { posts: SelectPost[] }) => {
  const postItems = useMemo(
    () =>
      posts.map((post, index) => (
        <CodeGridItem key={post.id} post={post} index={index} />
      )),
    [posts]
  );

  return (
    <motion.section
      aria-label="Video and social media content"
      variants={ANIMATION.item}
    >
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        variants={ANIMATION.container}
      >
        {postItems}
      </motion.div>
    </motion.section>
  );
});

CodesGridContent.displayName = "CodesGridContent";

const EmptyState = memo(() => {
  const t = useTranslations("codes");
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold mb-2">{t("noContent")}</h2>
        <p className="text-muted-foreground mb-6">
          {t("noContentDescription")}
        </p>
        <a
          href="/"
          className="inline-block px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          {t("readArticles")}
        </a>
      </div>
    </main>
  );
});

EmptyState.displayName = "EmptyState";

export const CodesGrid = memo(({ posts }: CodesGridProps) => {
  if (!posts?.length) {
    return <EmptyState />;
  }

  return (
    <motion.main
      className="max-w-4xl mx-auto px-4 py-8 sm:py-12"
      variants={ANIMATION.container}
      initial="hidden"
      animate="visible"
    >
      <HeroSection />
      <CodesGridContent posts={posts} />
    </motion.main>
  );
});

CodesGrid.displayName = "CodesGrid";
