"use client";

import { motion } from "framer-motion";
import { type Post, PostCard } from "@/components/post-card";

interface AnimatedHomepageProps {
 recentPosts: Post[];
}

const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
  opacity: 1,
  transition: {
   staggerChildren: 0.1,
   delayChildren: 0.2,
  },
 },
} as const;

const itemVariants = {
 hidden: { opacity: 0, y: 20 },
 visible: {
  opacity: 1,
  y: 0,
  transition: {
   duration: 0.6,
  },
 },
} as const;

export function AnimatedHomepage({ recentPosts }: AnimatedHomepageProps) {
 return (
  <motion.main variants={containerVariants} initial="hidden" animate="visible">
   {/* Hero Section */}
   <motion.section
    className="border-b border-border bg-card"
    role="banner"
    variants={itemVariants}
   >
    <div className="mx-auto max-w-3xl px-4 py-12">
     <motion.div variants={itemVariants}>
      <motion.h1
       className="font-serif text-balance text-4xl font-bold leading-tight md:text-5xl"
       variants={itemVariants}
      >
       Tempat singgah untuk memperdalam pemahaman Anda
      </motion.h1>
      <motion.p
       className="mt-3 max-w-prose text-lg text-muted-foreground"
       variants={itemVariants}
      >
       Dengan kalimat yang mudah dibaca dan gambar yang mudah dipahami,
       menjadikan setiap artikel menjadi sumber pengetahuan yang bermanfaat.
      </motion.p>
     </motion.div>
    </div>
   </motion.section>

   {/* Posts Grid */}
   <motion.section
    role="region"
    aria-label="Recent posts"
    variants={itemVariants}
   >
    <div className="mx-auto max-w-3xl px-4 py-10">
     <motion.h2 className="sr-only" variants={itemVariants}>
      Postingan Terbaru
     </motion.h2>
     <motion.div
      className="grid gap-10 md:grid-cols-2"
      variants={containerVariants}
     >
      {recentPosts.map((post, index) => (
       <motion.div
        key={post.id}
        variants={itemVariants}
        transition={{ delay: index * 0.1 }}
       >
        <PostCard post={post} />
       </motion.div>
      ))}
     </motion.div>
    </div>
   </motion.section>
  </motion.main>
 );
}
