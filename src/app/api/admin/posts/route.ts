import { type NextRequest, NextResponse } from "next/server";
import { createPost, getAllPosts } from "@/db/server";
import { checkAdminAuth } from "@/lib/admin-auth";

// GET - List all posts
export async function GET(request: NextRequest) {
  const authError = checkAdminAuth(request);
  if (authError) return authError;

  try {
    const posts = getAllPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST - Create new post
export async function POST(request: NextRequest) {
  const authError = checkAdminAuth(request);
  if (authError) return authError;

  try {
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      );
    }

    const newPost = createPost({
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt || null,
      content: data.content || "",
      content_group_id: data.content_group_id || null,
      locale: data.locale || null,
      cover_image_url: data.cover_image_url || null,
      tags: data.tags || null,
      published: data.published || false,
      published_at: data.published_at ? new Date(data.published_at) : null,
      created_at: new Date(),
      updated_at: new Date(),
      price: data.price || null,
      discount_percentage: data.discount_percentage || null,
      homepage: data.homepage || null,
      product_description: data.product_description || null,
      social_media_links: data.social_media_links || null,
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
