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
        src={post.cover_image_url || "/placeholder.png"}
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
        Belum diterbitkan
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
        src="/placeholder.png"
        alt="hibuno"
        width={32}
        height={32}
        className="w-8 h-8 rounded-full"
       />
       <span className="text-sm text-gray-700">hibuno</span>
      </motion.div>
     </div>
    </article>
   </Link>
  </motion.div>
 );
}
