import { type NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/admin-auth";
import { sanitizeFilename, generateUniqueFilename } from "@/lib/file-validator";
import fs from "node:fs";
import path from "node:path";

// Route segment config for large file uploads
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VIDEOS_DIR = path.join(process.cwd(), "public/videos/uploads");
const TEMP_DIR = path.join(process.cwd(), "public/videos/uploads/.temp");
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
];

const ALLOWED_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov"];

function ensureUploadDir() {
  if (!fs.existsSync(VIDEOS_DIR)) {
    fs.mkdirSync(VIDEOS_DIR, { recursive: true });
  }
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
}

function isPathSafe(filePath: string, baseDir: string): boolean {
  const resolvedPath = path.resolve(baseDir, filePath);
  return resolvedPath.startsWith(baseDir);
}

// Initialize a chunked upload
async function handleInit(request: NextRequest) {
  const body = await request.json();
  const { filename, fileSize, fileType } = body;

  if (!filename || !fileSize || !fileType) {
    return NextResponse.json(
      { error: "Missing required fields: filename, fileSize, fileType" },
      { status: 400 }
    );
  }

  if (!ALLOWED_VIDEO_TYPES.includes(fileType)) {
    return NextResponse.json(
      { error: "Invalid video type. Allowed: MP4, WebM, OGG, MOV" },
      { status: 400 }
    );
  }

  const ext = path.extname(filename).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      { error: "Invalid file extension" },
      { status: 400 }
    );
  }

  if (fileSize > MAX_VIDEO_SIZE) {
    return NextResponse.json(
      { error: "Video size exceeds 100MB limit" },
      { status: 400 }
    );
  }

  ensureUploadDir();

  // Generate upload ID and temp file path
  const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  const tempFilePath = path.join(TEMP_DIR, uploadId);

  // Create empty temp file
  fs.writeFileSync(tempFilePath, "");

  return NextResponse.json({
    uploadId,
    chunkSize: 1024 * 1024, // 1MB chunks
  });
}

// Handle chunk upload
async function handleChunk(
  request: NextRequest,
  searchParams: URLSearchParams
) {
  const uploadId = searchParams.get("uploadId");
  const chunkIndex = searchParams.get("chunkIndex");

  if (!uploadId || chunkIndex === null) {
    return NextResponse.json(
      { error: "Missing upload ID or chunk index" },
      { status: 400 }
    );
  }

  const tempFilePath = path.join(TEMP_DIR, uploadId);

  if (!isPathSafe(uploadId, TEMP_DIR) || !fs.existsSync(tempFilePath)) {
    return NextResponse.json(
      { error: "Invalid or expired upload session" },
      { status: 400 }
    );
  }

  // Read the raw body as ArrayBuffer
  const chunk = await request.arrayBuffer();
  fs.appendFileSync(tempFilePath, Buffer.from(chunk));

  return NextResponse.json({ received: true, chunkIndex: Number(chunkIndex) });
}

// Finalize the upload
async function handleFinalize(request: NextRequest) {
  const body = await request.json();
  const { uploadId, filename, postId } = body;

  if (!uploadId || !filename) {
    return NextResponse.json(
      { error: "Missing uploadId or filename" },
      { status: 400 }
    );
  }

  const tempFilePath = path.join(TEMP_DIR, uploadId);

  if (!isPathSafe(uploadId, TEMP_DIR) || !fs.existsSync(tempFilePath)) {
    return NextResponse.json(
      { error: "Invalid or expired upload session" },
      { status: 400 }
    );
  }

  const sanitizedOriginalName = sanitizeFilename(filename);
  const fileName = generateUniqueFilename(sanitizedOriginalName, postId);
  const finalPath = path.join(VIDEOS_DIR, fileName);

  // Move temp file to final location
  fs.renameSync(tempFilePath, finalPath);

  const publicUrl = `/videos/uploads/${fileName}`;

  return NextResponse.json({
    url: publicUrl,
    path: fileName,
    filename: fileName,
  });
}

export async function POST(request: NextRequest) {
  const authError = checkAdminAuth(request);
  if (authError) return authError;

  try {
    // Use query params for action (more reliable than headers)
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "init":
        return handleInit(request);
      case "chunk":
        return handleChunk(request, searchParams);
      case "finalize":
        return handleFinalize(request);
      default:
        return NextResponse.json(
          { error: "Invalid upload action. Use: init, chunk, or finalize" },
          { status: 400 }
        );
    }
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

    if (!isPathSafe(fileName, VIDEOS_DIR)) {
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
