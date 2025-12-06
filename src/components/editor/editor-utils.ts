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
  // Step 1: Initialize upload
  const initResponse = await fetch("/api/admin/upload/video?action=init", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filename: file.name,
      fileSize: file.size,
      fileType: file.type,
    }),
    credentials: "same-origin",
  });

  if (!initResponse.ok) {
    const errorData = await initResponse.json();
    throw new Error(errorData.error || "Failed to initialize upload");
  }

  const { uploadId, chunkSize } = await initResponse.json();

  // Step 2: Upload chunks
  const totalChunks = Math.ceil(file.size / chunkSize);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    const chunkUrl = `/api/admin/upload/video?action=chunk&uploadId=${uploadId}&chunkIndex=${i}`;
    const chunkResponse = await fetch(chunkUrl, {
      method: "POST",
      body: chunk,
      credentials: "same-origin",
    });

    if (!chunkResponse.ok) {
      const errorData = await chunkResponse.json();
      throw new Error(errorData.error || `Failed to upload chunk ${i + 1}`);
    }
  }

  // Step 3: Finalize upload
  const finalizeResponse = await fetch(
    "/api/admin/upload/video?action=finalize",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uploadId,
        filename: file.name,
        postId,
      }),
      credentials: "same-origin",
    }
  );

  if (!finalizeResponse.ok) {
    const errorData = await finalizeResponse.json();
    throw new Error(errorData.error || "Failed to finalize upload");
  }

  const data = await finalizeResponse.json();
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
