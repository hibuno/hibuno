import { Suspense } from "react";
import { getAllPosts } from "@/lib/mdx";
import BlogClient from "./blog-client";
import BlogLoading from "./loading";

export const revalidate = 3600; // Revalidate at most every hour

export default async function BlogPage() {
 const posts = await getAllPosts();

 // Set featured flag for the first two posts if not already set
 const enhancedPosts = posts.map((post, index) => ({
  ...post,
  featured: post.featured || index < 4,
  // Add category if not present
  category: post.category || "General",
  // Format the reading time
  readTime: post.readingTime ? `${post.readingTime} min read` : "5 min read",
 }));

 return (
  <Suspense
   fallback={<BlogLoading />}
  >
   <BlogClient initialPosts={enhancedPosts} />
  </Suspense>
 );
}
