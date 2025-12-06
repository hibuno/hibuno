import { UTApi } from "uploadthing/server";

export const utapi = new UTApi();

export async function listUploadedFiles(limit = 100, offset = 0) {
  try {
    const files = await utapi.listFiles({ limit, offset });
    return files;
  } catch (error) {
    console.error("Failed to list files:", error);
    return { files: [], hasMore: false };
  }
}
