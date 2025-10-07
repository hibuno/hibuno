"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export type Post = {
 id: string;
 slug: string;
 title: string;
 excerpt: string | null;
 cover_image_url: string | null;
 published?: boolean;
 published_at: string;
 // GitHub repository information
 github_repo_url?: string | null;
 homepage_url?: string | null;
};

export function PostCard({ post }: { post: Post }) {
 const date = new Date(post.published_at);
 const isDev = process.env.NODE_ENV === "development";
 const isUnpublished = isDev && post.published === false;

 return (
  <motion.div
   initial={{ opacity: 0, y: 20 }}
   animate={{ opacity: 1, y: 0 }}
   transition={{ duration: 0.5, ease: "easeOut" }}
   whileHover={{ y: -4 }}
   className="group"
  >
   <Link href={`/${post.slug}`} passHref>
    <article className="cursor-pointer h-full">
     <div className="relative aspect-[16/9] overflow-hidden rounded-lg mb-4">
      <motion.div
       whileHover={{ scale: 1.05 }}
       transition={{ duration: 0.3, ease: "easeOut" }}
       className="w-full h-full"
      >
       <Image
        src={post.cover_image_url || "/placeholder.svg"}
        alt={post.title}
        className="w-full h-full object-cover"
        width={500}
        height={300}
       />
      </motion.div>
      {isUnpublished && (
       <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute left-2 top-2 rounded bg-yellow-500/90 px-2 py-1 text-xs font-semibold text-white shadow"
       >
        Unpublished
       </motion.span>
      )}
     </div>
     <div className="space-y-3">
      <motion.div
       className="flex items-center gap-3 text-sm text-gray-600"
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       transition={{ delay: 0.2 }}
      >
       <span className="font-medium text-gray-900">
        {date.toLocaleDateString("en-US", {
         month: "long",
         day: "numeric",
         year: "numeric",
        })}
       </span>
       {isUnpublished && (
        <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
         Unpublished
        </span>
       )}
      </motion.div>
      <motion.h3
       className="text-2xl font-serif font-bold group-hover:text-gray-600 transition-colors leading-tight"
       initial={{ opacity: 0, y: 10 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ delay: 0.3 }}
      >
       {post.title}
      </motion.h3>
      <motion.p
       className="text-gray-600 line-clamp-2"
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       transition={{ delay: 0.4 }}
      >
       {post.excerpt || `Read this article by Hibuno on https://hibuno.com`}
      </motion.p>
      <motion.div
       className="flex items-center gap-2 pt-2"
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       transition={{ delay: 0.5 }}
      >
       <Image
        src="/placeholder.svg"
        alt="hibuno"
        width={32}
        height={32}
        className="w-8 h-8 rounded-full"
       />
       <span className="text-sm text-gray-700">hibuno</span>
      </motion.div>

      {/* GitHub Repository Information */}
      {post.github_repo_url && (
       <motion.div
        className="flex items-center gap-3 pt-2 border-t border-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
       >
        {post.github_repo_url && (
         <a
          href={post.github_repo_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded-md text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors"
          onClick={(e) => e.stopPropagation()}
         >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
           <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <span>GitHub</span>
         </a>
        )}
       </motion.div>
      )}
     </div>
    </article>
   </Link>
  </motion.div>
 );
}
