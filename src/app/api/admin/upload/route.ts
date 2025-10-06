import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/db/server";

// POST - Upload image to Supabase storage
export async function POST(request: NextRequest) {
	// Development environment check
	if (process.env.NODE_ENV !== 'development') {
		return NextResponse.json(
			{ error: "This endpoint is only available in development" },
			{ status: 403 }
		);
	}

	try {
		const supabase = getSupabaseServerClient();
		const formData = await request.formData();
		const file = formData.get('file') as File;
		const postId = formData.get('postId') as string;

		if (!file) {
			return NextResponse.json(
				{ error: "No file provided" },
				{ status: 400 }
			);
		}

		// Validate file type
		const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
		if (!allowedTypes.includes(file.type)) {
			return NextResponse.json(
				{ error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." },
				{ status: 400 }
			);
		}

		// Validate file size (5MB max)
		const maxSize = 5 * 1024 * 1024; // 5MB in bytes
		if (file.size > maxSize) {
			return NextResponse.json(
				{ error: "File size too large. Maximum size is 5MB." },
				{ status: 400 }
			);
		}

		// Generate unique filename
		const fileExt = file.name.split('.').pop();
		const fileName = `${postId}-${Date.now()}.${fileExt}`;

		// Convert file to buffer
		const arrayBuffer = await file.arrayBuffer();
		const buffer = new Uint8Array(arrayBuffer);

		// Upload to Supabase storage
		const { error: uploadError } = await supabase.storage
			.from('images')
			.upload(fileName, buffer, {
				contentType: file.type,
				upsert: false,
			});

		if (uploadError) {
			console.error("Upload error:", uploadError);
			return NextResponse.json(
				{ error: "Failed to upload image" },
				{ status: 500 }
			);
		}

		// Get public URL
		const { data: urlData } = supabase.storage
			.from('images')
			.getPublicUrl(fileName);

		if (!urlData.publicUrl) {
			return NextResponse.json(
				{ error: "Failed to get public URL" },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			url: urlData.publicUrl,
			path: fileName,
			filename: fileName,
		});

	} catch (error) {
		console.error("Error uploading file:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}