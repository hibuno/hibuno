"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";
import { type Post, PostCard } from "@/components/post-card";

interface AnimatedHomepageProps {
 featuredPost?: Post | undefined;
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

export function AnimatedHomepage({
 featuredPost,
 recentPosts,
}: AnimatedHomepageProps) {
 return (
  <motion.main variants={containerVariants} initial="hidden" animate="visible">
   {/* Hero Section */}
   <motion.section
    className="border-b border-border bg-card"
    role="banner"
    variants={itemVariants}
   >
    <div className="mx-auto max-w-6xl px-4 py-12">
     <div className="grid items-start gap-8 md:grid-cols-2">
      <motion.div variants={itemVariants}>
       <motion.h1
        className="font-serif text-balance text-4xl font-bold leading-tight md:text-5xl"
        variants={itemVariants}
       >
        Stories and ideas to deepen your understanding
       </motion.h1>
       <motion.p
        className="mt-3 max-w-prose text-lg text-muted-foreground"
        variants={itemVariants}
       >
        Read, learn, and subscribe for weekly updates. No noise, just thoughtful
        writing.
       </motion.p>
       <motion.div className="mt-6" variants={itemVariants}>
        <NewsletterForm />
       </motion.div>
      </motion.div>

      {featuredPost ? (
       <motion.div variants={itemVariants}>
        <Link href={`/${featuredPost.slug}`} passHref>
         <motion.article
          className="group cursor-pointer"
          role="region"
          aria-label="Featured post"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
         >
          <div className="aspect-[16/9] overflow-hidden rounded-lg mb-4 relative">
           <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
           >
            <Image
             src={featuredPost.cover_image_url || "/placeholder.svg"}
             alt={featuredPost.title || "hibuno"}
             width={500}
             height={300}
             className="w-full h-full object-cover"
             priority
            />
           </motion.div>
           <motion.span
            className="absolute top-3 left-3 px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-medium rounded"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
           >
            Featured
           </motion.span>
          </div>
          <div className="space-y-3">
           <motion.div
            className="flex items-center gap-3 text-sm text-gray-600"
            variants={itemVariants}
           >
            <span className="font-medium text-gray-900">
             {new Date(featuredPost.published_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
             })}
            </span>
           </motion.div>
           <motion.h3
            className="text-2xl font-serif font-bold group-hover:text-gray-600 transition-colors leading-tight"
            variants={itemVariants}
           >
            {featuredPost.title}
           </motion.h3>
           <motion.p
            className="text-gray-600 line-clamp-2"
            variants={itemVariants}
           >
            {featuredPost.excerpt}
           </motion.p>
          </div>
         </motion.article>
        </Link>
       </motion.div>
      ) : (
       <motion.div
        className="text-muted-foreground"
        role="status"
        aria-live="polite"
        variants={itemVariants}
       >
        Featured post will appear here
       </motion.div>
      )}
     </div>
    </div>
   </motion.section>

   {/* Posts Grid */}
   <motion.section
    role="region"
    aria-label="Recent posts"
    variants={itemVariants}
   >
    <div className="mx-auto max-w-6xl px-4 py-10">
     <motion.h2 className="sr-only" variants={itemVariants}>
      Recent Posts
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
