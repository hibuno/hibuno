import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// Simple auth check - in production, replace with your actual auth logic
const auth = (req: Request) => {
  // Check for access key in headers or use session-based auth
  const accessKey = req.headers.get("x-access-key");
  const envKey = process.env.ACCESS_KEY;

  if (accessKey && envKey && accessKey === envKey) {
    return { id: "admin" };
  }

  // For now, allow uploads (you can make this stricter)
  return { id: "user" };
};

export const ourFileRouter = {
  // Image uploader - for blog post images
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 10,
    },
  })
    .middleware(async ({ req }) => {
      const user = auth(req);
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Image upload complete for userId:", metadata.userId);
      console.log("File URL:", file.ufsUrl);
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),

  // Video uploader - for blog post videos
  videoUploader: f({
    video: {
      maxFileSize: "64MB",
      maxFileCount: 5,
    },
  })
    .middleware(async ({ req }) => {
      const user = auth(req);
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Video upload complete for userId:", metadata.userId);
      console.log("File URL:", file.ufsUrl);
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),

  // Media uploader - for both images and videos
  mediaUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 10 },
    video: { maxFileSize: "64MB", maxFileCount: 5 },
  })
    .middleware(async ({ req }) => {
      const user = auth(req);
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Media upload complete for userId:", metadata.userId);
      console.log("File URL:", file.ufsUrl);
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
