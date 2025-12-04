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
