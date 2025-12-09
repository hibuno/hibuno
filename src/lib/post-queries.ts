import type { SelectPost, PostTranslation, PostLocale } from "@/db/types";
import {
  getPublishedPosts as localGetPublishedPosts,
  getPostBySlug as localGetPostBySlug,
  searchPosts as localSearchPosts,
  getAllTags,
  getAllPosts as localgetAllPosts,
  getPostTranslations as localGetPostTranslations,
} from "@/db/server";

// Extended types for query results
export type PostListItem = Pick<
  SelectPost,
  | "id"
  | "slug"
  | "title"
  | "excerpt"
  | "cover_image_url"
  | "tags"
  | "published"
  | "published_at"
  | "created_at"
  | "updated_at"
>;

export type PostSummary = Pick<
  SelectPost,
  | "id"
  | "slug"
  | "title"
  | "content"
  | "excerpt"
  | "cover_image_url"
  | "tags"
  | "published"
  | "published_at"
>;

// Query builders for better performance and reusability
export class PostQueries {
  /**
   * Get published posts with optimized query
   */
  async getPublishedPosts(
    options: {
      limit?: number;
      offset?: number;
      tag?: string;
      skipLocaleDeduplication?: boolean;
    } = {}
  ): Promise<PostListItem[]> {
    const isDev = process.env.NODE_ENV === "development";

    const queryOptions: {
      limit?: number;
      offset?: number;
      tag?: string;
      includeDrafts?: boolean;
      skipLocaleDeduplication?: boolean;
    } = {
      includeDrafts: isDev,
    };
    if (options.limit !== undefined) queryOptions.limit = options.limit;
    if (options.offset !== undefined) queryOptions.offset = options.offset;
    if (options.tag !== undefined) queryOptions.tag = options.tag;
    if (options.skipLocaleDeduplication !== undefined)
      queryOptions.skipLocaleDeduplication = options.skipLocaleDeduplication;

    const posts = localGetPublishedPosts(queryOptions);

    return posts as unknown as PostListItem[];
  }

  /**
   * Get a single post by slug with full content
   */
  async getPostBySlug(slug: string): Promise<SelectPost | null> {
    const isDev = process.env.NODE_ENV === "development";
    const post = localGetPostBySlug(slug);

    if (!post) return null;

    // In production, only return published posts
    if (!isDev && !post.published) {
      return null;
    }

    return post;
  }

  /**
   * Get translations for a post
   */
  async getPostTranslations(
    contentGroupId: string
  ): Promise<PostTranslation[]> {
    if (!contentGroupId) return [];
    return localGetPostTranslations(contentGroupId);
  }

  /**
   * Get a post with its translations
   */
  async getPostWithTranslations(
    slug: string
  ): Promise<{ post: SelectPost; translations: PostTranslation[] } | null> {
    const post = await this.getPostBySlug(slug);
    if (!post) return null;

    const translations = post.content_group_id
      ? await this.getPostTranslations(post.content_group_id)
      : [];

    return { post, translations };
  }

  /**
   * Get recent posts
   */
  async getRecentPosts(
    limit = 10,
    excludeIds: string[] = []
  ): Promise<PostSummary[]> {
    const isDev = process.env.NODE_ENV === "development";

    let posts = localGetPublishedPosts({
      includeDrafts: isDev,
    });

    if (excludeIds.length > 0) {
      posts = posts.filter((p) => !excludeIds.includes(p.id));
    }

    return posts.slice(0, limit) as unknown as PostSummary[];
  }

  /**
   * Search posts by title, content, or excerpt
   */
  async searchPosts(
    query: string,
    locale?: PostLocale,
    limit = 20
  ): Promise<PostSummary[]> {
    const isDev = process.env.NODE_ENV === "development";
    const posts = localSearchPosts(
      query,
      limit,
      isDev,
      locale || ("id" as PostLocale)
    );
    return posts as unknown as PostSummary[];
  }

  /**
   * Get posts by tag
   */
  async getPostsByTag(tag: string, limit = 20) {
    return this.getPublishedPosts({ tag, limit });
  }

  /**
   * Get all unique tags
   */
  async getTags() {
    return getAllTags();
  }

  /**
   * Get posts with social media links (for /codes page)
   */
  async getAllPosts(limit = 20, locale?: PostLocale): Promise<PostSummary[]> {
    const isDev = process.env.NODE_ENV === "development";
    const options: {
      limit: number;
      includeDrafts: boolean;
      locale?: PostLocale;
    } = {
      limit,
      includeDrafts: isDev,
    };
    if (locale) {
      options.locale = locale;
    }
    const posts = localgetAllPosts(options);
    return posts as unknown as PostSummary[];
  }
}

// Singleton instances
export const postQueries = new PostQueries();
