import { type NextRequest, NextResponse } from "next/server";
import type { SelectPost } from "@/db/types";
import { getPostBySlug, updatePost, deletePost } from "@/db/server";

// GET - Fetch post by slug for editing
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Development environment check
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  try {
    const { slug } = await params;
    const data = getPostBySlug(slug);

    if (!data) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Format data for frontend
    const formattedData = {
      id: data.id,
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      cover_image_url: data.cover_image_url,
      tags: data.tags,
      published: data.published,
      published_at: data.published_at,
      created_at: data.created_at,
      price: data.price,
      discount_percentage: data.discount_percentage,
      homepage: data.homepage,
      product_description: data.product_description,
    };

    return NextResponse.json(formattedData as SelectPost, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// PUT - Update post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Development environment check
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  try {
    const { slug } = await params;
    const updateData = await request.json();

    // Validate required fields
    if (!updateData.title || !updateData.content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Get the current post
    const currentPost = getPostBySlug(slug);
    if (!currentPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Prepare update payload
    const updatePayload: Partial<SelectPost> = {
      title: updateData.title,
      slug: updateData.slug,
      excerpt: updateData.excerpt,
      content: updateData.content,
      cover_image_url: updateData.cover_image_url,
      tags: updateData.tags,
      published: updateData.published,
      published_at: updateData.published_at,
      price: updateData.price,
      discount_percentage: updateData.discount_percentage,
      homepage: updateData.homepage,
      product_description: updateData.product_description,
    };

    // Only update created_at if explicitly provided and different
    if (
      updateData.created_at &&
      updateData.created_at !== currentPost.created_at
    ) {
      updatePayload.created_at = new Date(updateData.created_at);
    }

    // Update the post
    const data = updatePost(slug, updatePayload);

    if (!data) {
      return NextResponse.json(
        { error: "Failed to update post" },
        { status: 500 }
      );
    }

    // Format response
    const formattedData = {
      id: data.id,
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      cover_image_url: data.cover_image_url,
      tags: data.tags,
      published: data.published,
      published_at: data.published_at,
      created_at: data.created_at,
      price: data.price,
      discount_percentage: data.discount_percentage,
      homepage: data.homepage,
      product_description: data.product_description,
    };

    return NextResponse.json(formattedData as SelectPost, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

// DELETE - Delete post
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Development environment check
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  try {
    const { slug } = await params;

    // Check if post exists
    const post = getPostBySlug(slug);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Delete the post
    const success = deletePost(slug);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete post" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
