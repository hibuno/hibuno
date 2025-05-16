"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PostMeta } from "@/lib/mdx";
import dynamic from "next/dynamic";
import { ArrowLeft, Clock, ChevronUp } from "lucide-react";

// Dynamically import MDXRemote to avoid SSR issues
const MDXRemote = dynamic(
 () => import("next-mdx-remote").then((mod) => mod.MDXRemote),
 {
  ssr: false,
  loading: () => (
   <div className="animate-pulse bg-zinc-800 h-96 rounded-md"></div>
  ),
 }
);

interface PostClientProps {
 post: PostMeta;
 relatedPosts: PostMeta[];
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 mdxSource: any;
}

export default function PostClient({
 post,
 relatedPosts,
 mdxSource,
}: PostClientProps) {
 const [showScrollTop, setShowScrollTop] = useState(false);

 useEffect(() => {
  const handleScroll = () => {
   setShowScrollTop(window.scrollY > 500);
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
 }, []);

 const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
 };

 return (
  <div className="min-h-screen bg-zinc-900 text-zinc-200 flex">
   {/* Sidebar */}
   <Sidebar />

   {/* Main Content - Add left padding to prevent overlap with sidebar */}
   <div className="flex-1 flex flex-col min-h-screen md:ml-64 p-6">
    {/* Header */}
    <header className="flex items-center justify-between mb-6">
     <div className="flex items-center gap-3">
      <Link href="/blog">
       <Button
        variant="outline"
        className="gap-2 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700"
       >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Blog</span>
       </Button>
      </Link>
     </div>
    </header>

    {/* Blog Content */}
    <main className="flex-1 container mx-auto px-4 py-8">
     <div className="max-w-4xl mx-auto">
      {/* Article Header */}
      <div className="mb-8">
       <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
        {post.title}
       </h1>

       <div className="relative h-64 md:h-96 mb-6 rounded-xl overflow-hidden">
        <Image
         src={post.featuredImage || "/placeholder.svg"}
         alt={post.title}
         fill
         className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent opacity-60"></div>
        <Badge className="absolute top-4 left-4 bg-violet-500 text-white border-0">
         {post.category || "General"}
        </Badge>
       </div>

       <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
         <Clock className="h-4 w-4 text-zinc-400" />
         <span className="text-zinc-400 text-sm">
          {post.readingTime ? `${post.readingTime} min read` : "5 min read"}
         </span>
         <span className="text-zinc-500">•</span>
         <span className="text-zinc-400 text-sm">{post.date}</span>
        </div>

        {post.author && (
         <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-zinc-700">
           <AvatarImage src={post.author.avatar} alt={post.author.name} />
           <AvatarFallback className="bg-zinc-800 text-zinc-400">
            {post.author.name.charAt(0)}
           </AvatarFallback>
          </Avatar>
          <div>
           <p className="text-zinc-200 font-medium">{post.author.name}</p>
           <p className="text-zinc-500 text-sm">{post.author.role}</p>
          </div>
         </div>
        )}
       </div>
      </div>

      {/* Article Content */}
      <div className="prose prose-invert prose-zinc text-justify !max-w-none mb-10">
       <div className="prose prose-invert prose-zinc max-w-none">
        <MDXRemote {...mdxSource} />
       </div>
      </div>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
       <div className="mb-10 mt-6 border-t border-zinc-700 pt-6">
        <h3 className="text-xl font-semibold mb-6">
         <span className="bg-violet-400 bg-clip-text text-transparent">
          Related Articles
         </span>
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
         {relatedPosts.map((relatedPost) => (
          <Link href={`/blog/${relatedPost.slug}`} key={relatedPost.slug}>
           <article className="rounded-lg overflow-hidden border border-zinc-700 bg-gradient-to-b from-zinc-800 to-zinc-800/70 hover:border-violet-700/50 transition-all duration-300 flex flex-col group">
            <div className="relative h-40 overflow-hidden">
             <Image
              src={relatedPost.featuredImage || "/placeholder.svg"}
              alt={relatedPost.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent opacity-60"></div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
             <h4 className="text-base font-semibold mb-2 group-hover:text-violet-400 transition-colors">
              {relatedPost.title}
             </h4>
             <p className="text-zinc-400 text-xs mb-3 flex-1 line-clamp-2">
              {relatedPost.excerpt}
             </p>
             <div className="flex items-center justify-between mt-auto">
              <div className="text-zinc-500 text-xs flex items-center gap-1">
               <Clock className="h-3 w-3" />
               <span>
                {relatedPost.readingTime
                 ? `${relatedPost.readingTime} min read`
                 : "5 min read"}
               </span>
              </div>
             </div>
            </div>
           </article>
          </Link>
         ))}
        </div>
       </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center border-t border-zinc-800 pt-6">
       <Link href="/blog" className="text-zinc-400 hover:text-white">
        ← Back to Blog
       </Link>
       <div className="flex gap-4">
        <Link href="#" className="text-zinc-400 hover:text-white">
         Previous
        </Link>
        <Link href="#" className="text-zinc-400 hover:text-white">
         Next
        </Link>
       </div>
      </div>
     </div>
    </main>

    {/* Scroll to top button */}
    {showScrollTop && (
     <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full shadow-lg z-20"
     >
      <ChevronUp className="h-5 w-5" />
     </button>
    )}

    {/* Footer */}
    <footer className="border-t border-zinc-800 py-6">
     <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="text-zinc-400 text-sm">
       © 2025 hibuno. All rights reserved.
      </div>
      <div className="flex gap-4">
       <Link
        href="/privacy-policy"
        className="text-zinc-400 hover:text-white text-sm"
       >
        Privacy Policy
       </Link>
       <Link
        href="/terms-of-service"
        className="text-zinc-400 hover:text-white text-sm"
       >
        Terms of Service
       </Link>
      </div>
     </div>
    </footer>
   </div>
  </div>
 );
}
