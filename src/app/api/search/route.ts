import { NextRequest, NextResponse } from "next/server";
import { postQueries } from "@/lib/post-queries";
import type { PostLocale } from "@/db/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [] });
    }

    // Get user's locale preference from cookies
    const locale = (request.cookies.get("NEXT_LOCALE")?.value ||
      "id") as PostLocale;

    const posts = await postQueries.searchPosts(query.trim(), locale);

    const results = posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to search posts" },
      { status: 500 }
    );
  }
}
