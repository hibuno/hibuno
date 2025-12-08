import { type NextRequest, NextResponse } from "next/server";
import {
  getPostBySlug,
  getPostTranslations,
  getPostByContentGroupAndLocale,
  createPost,
  updatePost,
  linkPostTranslations,
} from "@/db/server";
import { checkAdminAuth } from "@/lib/admin-auth";
import type { PostLocale } from "@/db/types";

// GET - Get all translations for a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authError = checkAdminAuth(request);
  if (authError) return authError;

  try {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (!post.content_group_id) {
      return NextResponse.json({
        translations: [],
        content_group_id: null,
      });
    }

    const translations = getPostTranslations(post.content_group_id);
    return NextResponse.json({
      translations,
      content_group_id: post.content_group_id,
    });
  } catch (error) {
    console.error("Error fetching translations:", error);
    return NextResponse.json(
      { error: "Failed to fetch translations" },
      { status: 500 }
    );
  }
}

// POST - Create a translation for a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authError = checkAdminAuth(request);
  if (authError) return authError;

  try {
    const { slug } = await params;
    const data = await request.json();
    const targetLocale = data.locale as PostLocale;

    if (!targetLocale || !["en", "id"].includes(targetLocale)) {
      return NextResponse.json(
        { error: "Invalid locale. Must be 'en' or 'id'" },
        { status: 400 }
      );
    }

    const sourcePost = getPostBySlug(slug);
    if (!sourcePost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Generate or use existing content_group_id
    let contentGroupId = sourcePost.content_group_id;
    if (!contentGroupId) {
      contentGroupId = crypto.randomUUID();
      // Update source post with content_group_id and locale
      updatePost(slug, {
        content_group_id: contentGroupId,
        locale: sourcePost.locale || (targetLocale === "en" ? "id" : "en"),
      });
    }

    // Check if translation already exists
    const existingTranslation = getPostByContentGroupAndLocale(
      contentGroupId,
      targetLocale
    );
    if (existingTranslation) {
      return NextResponse.json(
        {
          error: "Translation already exists",
          slug: existingTranslation.slug,
        },
        { status: 409 }
      );
    }

    // Create new translation post
    const newSlug = data.slug || `${sourcePost.slug}-${targetLocale}`;
    const newPost = createPost({
      slug: newSlug,
      title:
        data.title || `[${targetLocale.toUpperCase()}] ${sourcePost.title}`,
      excerpt: data.excerpt || sourcePost.excerpt,
      content: data.content || "",
      content_group_id: contentGroupId,
      locale: targetLocale,
      cover_image_url: sourcePost.cover_image_url,
      tags: sourcePost.tags,
      published: false,
      published_at: null,
      created_at: new Date(),
      updated_at: new Date(),
      price: sourcePost.price,
      discount_percentage: sourcePost.discount_percentage,
      homepage: sourcePost.homepage,
      product_description: sourcePost.product_description,
      social_media_links: sourcePost.social_media_links,
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Error creating translation:", error);
    return NextResponse.json(
      { error: "Failed to create translation" },
      { status: 500 }
    );
  }
}

// PUT - Link an existing post as a translation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authError = checkAdminAuth(request);
  if (authError) return authError;

  try {
    const { slug } = await params;
    const data = await request.json();
    const targetSlug = data.targetSlug as string;

    if (!targetSlug) {
      return NextResponse.json(
        { error: "Target slug is required" },
        { status: 400 }
      );
    }

    const sourcePost = getPostBySlug(slug);
    const targetPost = getPostBySlug(targetSlug);

    if (!sourcePost || !targetPost) {
      return NextResponse.json(
        { error: "One or both posts not found" },
        { status: 404 }
      );
    }

    const contentGroupId = linkPostTranslations(sourcePost.id, targetPost.id);
    if (!contentGroupId) {
      return NextResponse.json(
        { error: "Failed to link translations" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      content_group_id: contentGroupId,
    });
  } catch (error) {
    console.error("Error linking translations:", error);
    return NextResponse.json(
      { error: "Failed to link translations" },
      { status: 500 }
    );
  }
}
