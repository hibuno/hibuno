import { type NextRequest, NextResponse } from "next/server";
import type { SelectPost } from "@/db/schema";
import { getSupabaseServerClient } from "@/db/server";

// GET - Fetch post by slug for editing
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	// Development environment check
	if (process.env.NODE_ENV !== "development") {
		return NextResponse.json(
			{ error: "This endpoint is only available in development" },
			{ status: 403 },
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
				return NextResponse.json({ error: "Post not found" }, { status: 404 });
			}
			throw error;
		}

		// Convert snake_case to camelCase for frontend
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
			github_repo_url: data.github_repo_url,
			homepage_url: data.homepage_url,
			created_at: data.created_at,
		};

		return NextResponse.json(formattedData as SelectPost, {
			headers: {
				'Cache-Control': 'no-cache, no-store, must-revalidate',
				'Pragma': 'no-cache',
				'Expires': '0',
			},
		});
	} catch (error) {
		console.error("Error fetching post:", error);
		return NextResponse.json(
			{ error: "Failed to fetch post" },
			{ status: 500 },
		);
	}
}

// PUT - Update post
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	// Development environment check
	if (process.env.NODE_ENV !== "development") {
		return NextResponse.json(
			{ error: "This endpoint is only available in development" },
			{ status: 403 },
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
				{ status: 400 },
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
				return NextResponse.json({ error: "Post not found" }, { status: 404 });
			}
			throw fetchError;
		}

		// Prepare update data - map camelCase to snake_case for database
		const updatePayload = {
			title: updateData.title,
			excerpt: updateData.excerpt,
			content: updateData.content,
			cover_image_url: updateData.cover_image_url,
			tags: updateData.tags,
			published: updateData.published,
			published_at: updateData.published_at,
			github_repo_url: updateData.github_repo_url,
			homepage_url: updateData.homepage_url,
			// Only update created_at if explicitly provided and different from current value
			...(updateData.created_at && updateData.created_at !== currentPost.created_at && {
				created_at: updateData.created_at,
			}),
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
			excerpt: data.excerpt,
			content: data.content,
			cover_image_url: data.cover_image_url,
			tags: data.tags,
			published: data.published,
			published_at: data.published_at,
			created_at: data.created_at,
		};

		return NextResponse.json(formattedData as SelectPost, {
			headers: {
				'Cache-Control': 'no-cache, no-store, must-revalidate',
				'Pragma': 'no-cache',
				'Expires': '0',
			},
		});
	} catch (error) {
		console.error("Error updating post:", error);
		return NextResponse.json(
			{ error: "Failed to update post" },
			{ status: 500 },
		);
	}
}
