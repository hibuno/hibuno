import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getPostBySlug, getAllPosts } from "@/lib/mdx";
import PostClient from "./post-client";
import { serialize } from "next-mdx-remote/serialize";

export const revalidate = 3600; // Revalidate at most every hour

// Generate static params for all posts
export async function generateStaticParams() {
 const posts = await getAllPosts();
 return posts.map((post) => ({
  slug: post.slug,
 }));
}

// Get post data
export default async function BlogPostPage({
 params,
}: {
 params: Promise<{ slug: string }>;
}) {
 const post = await getPostBySlug((await params).slug);

 if (!post) {
  notFound();
 }

 // Get related posts (excluding current post)
 const allPosts = await getAllPosts();
 const relatedPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

 // Serialize the MDX content
 const mdxSource = await serialize(post.content);

 return (
  <Suspense fallback={<div className="p-12 text-center">Loading post...</div>}>
   <PostClient post={post} relatedPosts={relatedPosts} mdxSource={mdxSource} />
  </Suspense>
 );
}
