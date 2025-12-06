import { type NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/admin-auth";
import { sanitizeFilename, generateUniqueFilename } from "@/lib/file-validator";
import fs from "fs";
import path from "path";

const VIDEOS_DIR = path.join(process.cwd(), "public/videos/uploads");
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
];

function ensureUploadDir() {
  if (!fs.existsSync(VIDEOS_DIR)) {
    fs.mkdirSync(VIDEOS_DIR, { recursive: true });
  }
}

function isPathSafe(filePath: string): boolean {
  const resolvedPath = path.resolve(VIDEOS_DIR, filePath);
  return resolvedPath.startsWith(VIDEOS_DIR);
}

export async function POST(request: NextRequest) {
  const authError = checkAdminAuth(request);
  if (authError) return authError;

  try {
    ensureUploadDir();
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const postId = formData.get("postId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid video type. Allowed: MP4, WebM, OGG, MOV" },
        { status: 400 }
      );
    }

    if (file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: "Video size exceeds 100MB limit" },
        { status: 400 }
      );
    }

    const sanitizedOriginalName = sanitizeFilename(file.name);
    const fileName = generateUniqueFilename(sanitizedOriginalName, postId);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filePath = path.join(VIDEOS_DIR, fileName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/videos/uploads/${fileName}`;

    return NextResponse.json({
      url: publicUrl,
      path: fileName,
      filename: fileName,
    });
  } catch (error) {
    console.error("Error uploading video:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authError = checkAdminAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get("url");

    if (!fileUrl) {
      return NextResponse.json(
        { error: "No file URL provided" },
        { status: 400 }
      );
    }

    const urlPath = fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`;
    const match = urlPath.match(/\/videos\/uploads\/(.+)$/);

    if (!match || !match[1]) {
      return NextResponse.json(
        { error: "Invalid file URL format" },
        { status: 400 }
      );
    }

    const fileName = match[1];

    if (!isPathSafe(fileName)) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    const filePath = path.join(VIDEOS_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    fs.unlinkSync(filePath);

    return NextResponse.json({
      success: true,
      message: "Video deleted successfully",
      deletedFile: fileName,
    });
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
