import { type NextRequest, NextResponse } from "next/server";
import { createPost, getAllPosts } from "@/db/server";

// GET - List all posts
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

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
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

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
      cover_image_url: data.cover_image_url || null,
      tags: data.tags || null,
      published: data.published || false,
      published_at: data.published_at ? new Date(data.published_at) : null,
      created_at: new Date(),
      updated_at: new Date(),
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
