// Upload functions using UploadThing API
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  // Use the legacy admin upload endpoint for drag-drop (simpler flow)
  // UploadThing dropzone is used in dialogs for better UX
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

export async function uploadVideo(file: File): Promise<string> {
  // Step 1: Initialize upload
  const initResponse = await fetch("/api/admin/upload/video?action=init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      fileSize: file.size,
      fileType: file.type,
    }),
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

    const chunkResponse = await fetch(
      `/api/admin/upload/video?action=chunk&uploadId=${uploadId}&chunkIndex=${i}`,
      { method: "POST", body: chunk }
    );

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uploadId, filename: file.name }),
    }
  );

  if (!finalizeResponse.ok) {
    const errorData = await finalizeResponse.json();
    throw new Error(errorData.error || "Failed to finalize upload");
  }

  const data = await finalizeResponse.json();
  return data.url;
}

// Delete functions for legacy local uploads
export async function deleteImage(imageUrl: string): Promise<void> {
  if (imageUrl.startsWith("/images/uploads/")) {
    const response = await fetch(
      `/api/admin/upload?url=${encodeURIComponent(imageUrl)}`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete image");
    }
  }
}

export async function deleteVideo(videoUrl: string): Promise<void> {
  if (videoUrl.startsWith("/videos/uploads/")) {
    const response = await fetch(
      `/api/admin/upload/video?url=${encodeURIComponent(videoUrl)}`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete video");
    }
  }
}
