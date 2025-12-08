import { type NextRequest, NextResponse } from "next/server";
import { getPostBySlug, getPostTranslations } from "@/db/server";

// GET - Fetch post translations (public endpoint)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Get translations if content_group_id exists
    const translations = post.content_group_id
      ? getPostTranslations(post.content_group_id)
      : [];

    return NextResponse.json(
      {
        post: {
          slug: post.slug,
          locale: post.locale,
          content_group_id: post.content_group_id,
        },
        translations,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching post translations:", error);
    return NextResponse.json(
      { error: "Failed to fetch translations" },
      { status: 500 }
    );
  }
}
