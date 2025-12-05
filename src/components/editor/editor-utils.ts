import { compressForUpload, needsCompression } from "@/lib/image-compressor";

export async function uploadImage(
  file: File,
  postId?: string
): Promise<string> {
  // Compress image if needed (client-side compression as backup)
  let fileToUpload = file;
  if (file.type.startsWith("image/") && needsCompression(file, 1)) {
    try {
      fileToUpload = await compressForUpload(file, 1);
      console.log("Client-side compression applied");
    } catch (error) {
      console.error(
        "Client-side compression failed, server will handle it:",
        error
      );
    }
  }

  // Create form data
  const formData = new FormData();
  formData.append("file", fileToUpload);
  if (postId) {
    formData.append("postId", postId);
  }

  // Upload using admin API route
  const response = await fetch("/api/admin/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to upload image");
  }

  const data = await response.json();
  return data.url;
}

export async function deleteImage(imageUrl: string): Promise<void> {
  const response = await fetch(
    `/api/admin/upload?url=${encodeURIComponent(imageUrl)}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete image");
  }
}

export async function uploadVideo(
  file: File,
  postId?: string
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  if (postId) {
    formData.append("postId", postId);
  }

  const response = await fetch("/api/admin/upload/video", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to upload video");
  }

  const data = await response.json();
  return data.url;
}

export async function deleteVideo(videoUrl: string): Promise<void> {
  const response = await fetch(
    `/api/admin/upload/video?url=${encodeURIComponent(videoUrl)}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete video");
  }
}
