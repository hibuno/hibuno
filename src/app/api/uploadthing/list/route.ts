import { NextRequest, NextResponse } from "next/server";
import { listUploadedFiles } from "@/lib/uploadthing-server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Number.parseInt(searchParams.get("limit") || "50");
    const offset = Number.parseInt(searchParams.get("offset") || "0");
    const type = searchParams.get("type") || "all"; // 'image', 'video', or 'all'

    const result = await listUploadedFiles(limit, offset);

    console.log(result);

    // Filter by type if specified
    let files = result.files || [];
    if (type === "image") {
      files = files.filter(
        (f) =>
          f.name.endsWith("png") ||
          f.name.endsWith("jpg") ||
          f.name.endsWith("jpeg") ||
          f.name.endsWith("webp")
      );
    } else if (type === "video") {
      files = files.filter((f) => f.name.endsWith("mp4"));
    }

    return NextResponse.json({
      files: files.map((file) => ({
        key: file.key,
        name: file.name,
        size: file.size,
        type: file.name.split(".").pop(),
        url: `https://utfs.io/f/${file.key}`,
        uploadedAt: file.uploadedAt,
      })),
      hasMore: result.hasMore,
    });
  } catch (error) {
    console.error("Error listing files:", error);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 }
    );
  }
}
