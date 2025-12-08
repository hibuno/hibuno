import { NextResponse } from "next/server";
import { postQueries } from "@/lib/post-queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Get recent published posts as "popular" posts
    // You can modify this to use actual view counts or other metrics
    const posts = await postQueries.getPublishedPosts({ limit: 6 });

    const popularPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
    }));

    return NextResponse.json({ posts: popularPosts });
  } catch (error) {
    console.error("Popular posts API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch popular posts" },
      { status: 500 }
    );
  }
}
