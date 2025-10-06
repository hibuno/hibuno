import type { MetadataRoute } from "next";
import { postQueries } from "@/lib/database";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hibuno.com";

  try {
    const posts = await postQueries.getPublishedPosts();

    const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
      url: `${baseUrl}/${p.slug}`,
      lastModified: (p.updated_at || p.published_at || new Date()) as
        | string
        | Date,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1,
      },
      ...postEntries,
    ];
  } catch (_error) {
    // Fallback sitemap with just the homepage
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1,
      },
    ];
  }
}