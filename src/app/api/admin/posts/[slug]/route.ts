import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/db/server";
import type { SelectPost } from "@/db/schema";

// GET - Fetch post by slug for editing
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> }
) {
	// Development environment check
	if (process.env.NODE_ENV !== 'development') {
		return NextResponse.json(
			{ error: "This endpoint is only available in development" },
			{ status: 403 }
		);
	}

	try {
		const supabase = getSupabaseServerClient();
		const { slug } = await params;

		const { data, error } = await supabase
			.from("posts")
			.select("*")
			.eq("slug", slug)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json(
					{ error: "Post not found" },
					{ status: 404 }
				);
			}
			throw error;
		}

		// Convert snake_case to camelCase for frontend
		const formattedData = {
			id: data.id,
			slug: data.slug,
			title: data.title,
			subtitle: data.subtitle,
			excerpt: data.excerpt,
			content: data.content,
			coverImageUrl: data.cover_image_url,
			coverImageAlt: data.cover_image_alt,
			authorName: data.author_name,
			authorAvatarUrl: data.author_avatar_url,
			authorBio: data.author_bio,
			tags: data.tags,
			category: data.category,
			readingTime: data.reading_time,
			wordCount: data.word_count,
			featured: data.featured,
			published: data.published,
			published_at: data.published_at,
			created_at: data.created_at,
			updated_at: data.updated_at,
		};

		return NextResponse.json(formattedData as SelectPost);
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
	if (process.env.NODE_ENV !== 'development') {
		return NextResponse.json(
			{ error: "This endpoint is only available in development" },
			{ status: 403 }
		);
	}

	try {
		const supabase = getSupabaseServerClient();
		const { slug } = await params;
		const updateData = await request.json();

		// Validate required fields
		if (!updateData.title || !updateData.content) {
			return NextResponse.json(
				{ error: "Title and content are required" },
				{ status: 400 }
			);
		}

		// Get the current post to preserve certain fields if not provided
		const { data: currentPost, error: fetchError } = await supabase
			.from("posts")
			.select("id, slug, created_at")
			.eq("slug", slug)
			.single();

		if (fetchError) {
			if (fetchError.code === "PGRST116") {
				return NextResponse.json(
					{ error: "Post not found" },
					{ status: 404 }
				);
			}
			throw fetchError;
		}

		// Prepare update data - map camelCase to snake_case for database
		const updatePayload = {
			title: updateData.title,
			subtitle: updateData.subtitle,
			excerpt: updateData.excerpt,
			content: updateData.content,
			cover_image_url: updateData.coverImageUrl,
			cover_image_alt: updateData.coverImageAlt,
			author_name: updateData.authorName,
			author_avatar_url: updateData.authorAvatarUrl,
			author_bio: updateData.authorBio,
			tags: updateData.tags,
			category: updateData.category,
			reading_time: updateData.readingTime,
			word_count: updateData.wordCount,
			featured: updateData.featured,
			published: updateData.published,
			published_at: updateData.published_at,
			updated_at: new Date().toISOString(),
		};

		// Update the post
		const { data, error } = await supabase
			.from("posts")
			.update(updatePayload)
			.eq("id", currentPost.id)
			.select("*")
			.single();

		if (error) {
			throw error;
		}

		// Convert snake_case to camelCase for frontend
		const formattedData = {
			id: data.id,
			slug: data.slug,
			title: data.title,
			subtitle: data.subtitle,
			excerpt: data.excerpt,
			content: data.content,
			coverImageUrl: data.cover_image_url,
			coverImageAlt: data.cover_image_alt,
			authorName: data.author_name,
			authorAvatarUrl: data.author_avatar_url,
			authorBio: data.author_bio,
			tags: data.tags,
			category: data.category,
			readingTime: data.reading_time,
			wordCount: data.word_count,
			featured: data.featured,
			published: data.published,
			published_at: data.published_at,
			created_at: data.created_at,
			updated_at: data.updated_at,
		};

		return NextResponse.json(formattedData as SelectPost);
	} catch (error) {
		console.error("Error updating post:", error);
		return NextResponse.json(
			{ error: "Failed to update post" },
			{ status: 500 }
		);
	}
}