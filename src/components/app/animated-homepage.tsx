"use client";

import { motion } from "framer-motion";
import { memo, useMemo } from "react";
import { type Post, PostCard } from "@/components/app/post-card";

interface AnimatedHomepageProps {
 recentPosts: Post[];
}

// Memoized animation variants to prevent recreation on each render
const ANIMATION_VARIANTS = {
 container: {
  hidden: { opacity: 0 },
  visible: {
   opacity: 1,
   transition: {
    staggerChildren: 0.1,
    delayChildren: 0.2,
   },
  },
 },
 item: {
  hidden: { opacity: 0, y: 20 },
  visible: {
   opacity: 1,
   y: 0,
   transition: {
    duration: 0.6,
    ease: "easeOut",
   },
  },
 },
} as const;

// Memoized hero section component
const HeroSection = memo(() => (
 <motion.header
  className="border-b border-border bg-card"
  variants={ANIMATION_VARIANTS.item}
 >
  <div className="mx-auto max-w-3xl px-4 py-12">
   <motion.div variants={ANIMATION_VARIANTS.item}>
    <motion.h1
     className="font-serif text-balance text-4xl font-bold leading-tight md:text-5xl"
     variants={ANIMATION_VARIANTS.item}
    >
     Tempat singgah untuk memperdalam pemahaman Anda
    </motion.h1>
    <motion.p
     className="mt-3 max-w-prose text-lg text-muted-foreground"
     variants={ANIMATION_VARIANTS.item}
    >
     Dengan kalimat yang mudah dibaca dan gambar yang mudah dipahami, menjadikan
     setiap artikel menjadi sumber pengetahuan yang bermanfaat.
    </motion.p>
   </motion.div>
  </div>
 </motion.header>
));

HeroSection.displayName = "HeroSection";

// Memoized post grid item component
const PostGridItem = memo(({ post, index }: { post: Post; index: number }) => (
 <motion.div
  key={post.id}
  variants={ANIMATION_VARIANTS.item}
  transition={{ delay: index * 0.1 }}
 >
  <PostCard post={post} />
 </motion.div>
));

PostGridItem.displayName = "PostGridItem";

// Memoized posts grid component
const PostsGrid = memo(({ posts }: { posts: Post[] }) => {
 // Memoize the post items to prevent unnecessary re-renders
 const postItems = useMemo(
  () =>
   posts.map((post, index) => (
    <PostGridItem key={post.id} post={post} index={index} />
   )),
  [posts]
 );

 return (
  <motion.section aria-label="Recent posts" variants={ANIMATION_VARIANTS.item}>
   <div className="mx-auto max-w-3xl px-4 py-10">
    <motion.h2 className="sr-only" variants={ANIMATION_VARIANTS.item}>
     Postingan Terbaru
    </motion.h2>
    <motion.div
     className="grid gap-10 md:grid-cols-2"
     variants={ANIMATION_VARIANTS.container}
    >
     {postItems}
    </motion.div>
   </div>
  </motion.section>
 );
});

PostsGrid.displayName = "PostsGrid";

// Main component with memoization
export const AnimatedHomepage = memo(
 ({ recentPosts }: AnimatedHomepageProps) => {
  // Early return if no posts to prevent unnecessary rendering
  if (!recentPosts?.length) {
   return (
    <main className="mx-auto max-w-3xl px-4 py-16">
     <div className="text-center">
      <h2 className="text-2xl font-semibold mb-2">Belum ada postingan</h2>
      <p className="text-muted-foreground">
       Postingan akan muncul di sini setelah dipublikasikan.
      </p>
     </div>
    </main>
   );
  }

  return (
   <motion.main
    variants={ANIMATION_VARIANTS.container}
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
