"use client";

import { motion } from "framer-motion";
import { memo, useMemo } from "react";
import { useTranslations } from "next-intl";
import { type Post, PostCard } from "@/components/blog/post-card";

interface AnimatedHomepageProps {
  recentPosts: Post[];
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
} as const;

const HeroSection = memo(() => {
  const t = useTranslations("hero");

  return (
    <motion.header
      className="border-b border-border bg-card/30"
      variants={ANIMATION.item}
    >
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <motion.h1
          className="font-serif text-balance text-2xl sm:text-3xl font-semibold leading-tight md:text-4xl mb-3"
          variants={ANIMATION.item}
        >
          {t("title")}
        </motion.h1>
        <motion.p
          className="max-w-prose text-sm sm:text-base text-muted-foreground"
          variants={ANIMATION.item}
        >
          {t("description")}
        </motion.p>
      </div>
    </motion.header>
  );
});

HeroSection.displayName = "HeroSection";

const PostGridItem = memo(({ post, index }: { post: Post; index: number }) => (
  <motion.div
    key={post.id}
    variants={ANIMATION.item}
    transition={{ delay: index * 0.05 }}
  >
    <PostCard post={post} />
  </motion.div>
));

PostGridItem.displayName = "PostGridItem";

const PostsGrid = memo(({ posts }: { posts: Post[] }) => {
  const t = useTranslations("hero");
  const postItems = useMemo(
    () =>
      posts.map((post, index) => (
        <PostGridItem key={post.id} post={post} index={index} />
      )),
    [posts]
  );

  return (
    <motion.section aria-label="Recent posts" variants={ANIMATION.item}>
      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
        <motion.h2 className="sr-only" variants={ANIMATION.item}>
          {t("recentPosts")}
        </motion.h2>
        <motion.div
          className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2"
          variants={ANIMATION.container}
        >
          {postItems}
        </motion.div>
      </div>
    </motion.section>
  );
});

PostsGrid.displayName = "PostsGrid";

export const AnimatedHomepage = memo(
  ({ recentPosts }: AnimatedHomepageProps) => {
    const t = useTranslations("hero");

    if (!recentPosts?.length) {
      return (
        <main className="mx-auto max-w-4xl px-4 py-12">
          <div className="text-center">
            <h2 className="text-lg font-medium mb-1">{t("noPosts")}</h2>
            <p className="text-muted-foreground text-sm">
              {t("postsWillAppear")}
            </p>
          </div>
        </main>
      );
    }

    return (
      <motion.main
        variants={ANIMATION.container}
        initial="hidden"
        animate="visible"
      >
        <HeroSection />
        <PostsGrid posts={recentPosts} />
      </motion.main>
    );
  }
);

AnimatedHomepage.displayName = "AnimatedHomepage";
