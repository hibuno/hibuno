import { type NextRequest, NextResponse } from "next/server";
import {
  compressForUpload,
  needsCompression,
  formatFileSize,
} from "@/lib/image-compressor";
import {
  validateFile,
  sanitizeFilename,
  generateUniqueFilename,
  isImageFile,
  MAX_FILE_SIZE,
} from "@/lib/file-validator";
import { sanitizeSVG } from "@/lib/svg-sanitizer";
import fs from "fs";
import path from "path";

const IMAGES_DIR = path.join(process.cwd(), "public/images/uploads");

// Validate that a path is within the uploads directory (prevent path traversal)
function isPathSafe(filePath: string): boolean {
  const resolvedPath = path.resolve(IMAGES_DIR, filePath);
  return resolvedPath.startsWith(IMAGES_DIR);
}

// Ensure upload directory exists
function ensureUploadDir() {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }
}

// POST - Upload image to local storage
export async function POST(request: NextRequest) {
  // Development environment check
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  try {
    ensureUploadDir();
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const postId = formData.get("postId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Comprehensive file validation
    const validation = validateFile(file, MAX_FILE_SIZE);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Check if file is an image
    const isImage = isImageFile(file);
    const isSVG = file.type === "image/svg+xml";

    // Compress image if needed (only for raster images, not SVG)
    let fileToUpload = file;
    if (isImage && !isSVG && needsCompression(file, 1)) {
      console.log(
        `Compressing image: ${file.name} (${formatFileSize(file.size)})`
      );
      try {
        fileToUpload = await compressForUpload(file, 1); // Target 1MB
        console.log(`Compressed to: ${formatFileSize(fileToUpload.size)}`);
      } catch (error) {
        console.error("Image compression failed, using original:", error);
        // Continue with original file if compression fails
      }
    }

    // Sanitize SVG files to remove potentially malicious content
    if (isSVG) {
      console.log(`Sanitizing SVG: ${file.name}`);
      try {
        const svgText = await file.text();
        const sanitizedSVG = sanitizeSVG(svgText);

        if (!sanitizedSVG) {
          return NextResponse.json(
            { error: "Invalid or malicious SVG content detected" },
            { status: 400 }
          );
        }

        // Create a new File object with sanitized content
        const blob = new Blob([sanitizedSVG], { type: "image/svg+xml" });
        fileToUpload = new File([blob], file.name, { type: "image/svg+xml" });
        console.log("SVG sanitized successfully");
      } catch (error) {
        console.error("SVG sanitization failed:", error);
        return NextResponse.json(
          { error: "Failed to sanitize SVG file" },
          { status: 400 }
        );
      }
    }

    // Sanitize and generate unique filename
    const sanitizedOriginalName = sanitizeFilename(fileToUpload.name);
    const fileName = generateUniqueFilename(sanitizedOriginalName, postId);

    // Convert file to buffer and save locally
    const arrayBuffer = await fileToUpload.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filePath = path.join(IMAGES_DIR, fileName);
    fs.writeFileSync(filePath, buffer);

    // Return public URL (relative to public folder)
    const publicUrl = `/images/uploads/${fileName}`;

    return NextResponse.json({
      url: publicUrl,
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

// DELETE - Remove image from local storage
export async function DELETE(request: NextRequest) {
  // Development environment check
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get("url");

    if (!fileUrl) {
      return NextResponse.json(
        { error: "No file URL provided" },
        { status: 400 }
      );
    }

    // Extract filename from URL (e.g., /images/uploads/filename.jpg -> filename.jpg)
    const urlPath = fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`;
    const match = urlPath.match(/\/images\/uploads\/(.+)$/);

    if (!match || !match[1]) {
      return NextResponse.json(
        { error: "Invalid file URL format" },
        { status: 400 }
      );
    }

    const fileName = match[1];

    // Security: Prevent path traversal attacks
    if (!isPathSafe(fileName)) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    const filePath = path.join(IMAGES_DIR, fileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Delete the file
    fs.unlinkSync(filePath);

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
      deletedFile: fileName,
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
