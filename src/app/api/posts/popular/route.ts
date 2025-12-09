import { NextRequest, NextResponse } from "next/server";
import { postQueries } from "@/lib/post-queries";
import type { PostLocale } from "@/db/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Get user's locale preference from cookies
    const locale = (request.cookies.get("NEXT_LOCALE")?.value ||
      "id") as PostLocale;

    // Get recent published posts as "popular" posts
    // You can modify this to use actual view counts or other metrics
    const posts = await postQueries.getPublishedPosts({ limit: 6, locale });

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
