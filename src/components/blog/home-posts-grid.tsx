"use client";

import { motion } from "framer-motion";
import { memo, useMemo } from "react";
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

const HeroSection = memo(() => (
  <motion.header
    className="border-b border-border bg-card"
    variants={ANIMATION.item}
  >
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
      <motion.h1
        className="font-serif text-balance text-2xl sm:text-3xl font-semibold leading-tight md:text-4xl"
        variants={ANIMATION.item}
      >
        Sekarang, belajar tentang dunia digital ngga perlu ribet.
      </motion.h1>
      <motion.p
        className="mt-2 max-w-prose text-sm sm:text-base text-muted-foreground"
        variants={ANIMATION.item}
      >
        Dengan kalimat yang mudah dibaca dan gambar yang mudah dipahami,
        menjadikan setiap artikel menjadi sumber pengetahuan yang bermanfaat.
      </motion.p>
    </div>
  </motion.header>
));

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
          Postingan Terbaru
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
    if (!recentPosts?.length) {
      return (
        <main className="mx-auto max-w-4xl px-4 py-12">
          <div className="text-center">
            <h2 className="text-lg font-medium mb-1">Belum ada postingan</h2>
            <p className="text-muted-foreground text-sm">
              Postingan akan muncul di sini setelah dipublikasikan.
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
