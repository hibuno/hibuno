import type { SelectPost } from "@/db/schema";
import { getSupabaseServerClient } from "@/db/server";

// Extended types for query results
export type PostListItem = Pick<
  SelectPost,
  | "id"
  | "slug"
  | "title"
  | "subtitle"
  | "excerpt"
  | "coverImageUrl"
  | "coverImageAlt"
  | "authorName"
  | "authorAvatarUrl"
  | "authorBio"
  | "tags"
  | "category"
  | "readingTime"
  | "wordCount"
  | "featured"
  | "published_at"
  | "created_at"
  | "updated_at"
>;

export type PostSummary = Pick<
  SelectPost,
  | "id"
  | "slug"
  | "title"
  | "subtitle"
  | "excerpt"
  | "coverImageUrl"
  | "coverImageAlt"
  | "authorName"
  | "authorAvatarUrl"
  | "tags"
  | "category"
  | "readingTime"
  | "published_at"
>;

// Query builders for better performance and reusability
export class PostQueries {
  private supabase = getSupabaseServerClient();

  /**
   * Get published posts with optimized query
   */
  async getPublishedPosts(
    options: {
      limit?: number;
      offset?: number;
      featured?: boolean;
      category?: string;
      tag?: string;
    } = {},
  ): Promise<PostListItem[]> {
    let query = this.supabase
      .from("posts")
      .select(`
	      id, slug, title, subtitle, excerpt, cover_image_url, cover_image_alt,
	      author_name, author_avatar_url, author_bio, tags, category,
	      reading_time, word_count, featured, published_at, created_at, updated_at
	    `)
      .eq("published", true)
      .order("published_at", { ascending: false });

    if (options.featured !== undefined) {
      query = query.eq("featured", options.featured);
    }

    if (options.category) {
      query = query.eq("category", options.category);
    }

    if (options.tag) {
      query = query.contains("tags", [options.tag]);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 10) - 1,
      );
    }

    const { data, error } = await query;

    if (error) throw error;

    return data as unknown as PostListItem[];
  }

  /**
   * Get a single post by slug with full content
   */
  async getPostBySlug(slug: string): Promise<SelectPost | null> {
    const { data, error } = await this.supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (error) {
      // If no rows returned, it's not an error, just return null
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return data as SelectPost;
  }

  /**
   * Get featured posts for homepage
   */
  async getFeaturedPosts(limit = 1) {
    return this.getPublishedPosts({ featured: true, limit });
  }

  /**
   * Get recent posts excluding featured ones
   */
  async getRecentPosts(
    limit = 10,
    excludeIds: string[] = [],
  ): Promise<PostSummary[]> {
    let query = this.supabase
      .from("posts")
      .select(`
	      id, slug, title, subtitle, excerpt, cover_image_url, cover_image_alt,
	      author_name, author_avatar_url, tags, category, reading_time, published_at
	    `)
      .eq("published", true)
      .eq("featured", false)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (excludeIds.length > 0) {
      query = query.not("id", "in", `(${excludeIds.join(",")})`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data as unknown as PostSummary[];
  }

  /**
   * Search posts by title, content, or excerpt
   */
  async searchPosts(query: string, limit = 20): Promise<PostSummary[]> {
    const { data, error } = await this.supabase
      .from("posts")
      .select(`
	      id, slug, title, subtitle, excerpt, cover_image_url,
	      author_name, reading_time, published_at
	    `)
      .eq("published", true)
      .or(
        `title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`,
      )
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data as unknown as PostSummary[];
  }

  /**
   * Get posts by category
   */
  async getPostsByCategory(category: string, limit = 20) {
    return this.getPublishedPosts({ category, limit });
  }

  /**
   * Get posts by tag
   */
  async getPostsByTag(tag: string, limit = 20) {
    return this.getPublishedPosts({ tag, limit });
  }

  /**
   * Get all unique categories
   */
  async getCategories() {
    const { data, error } = await this.supabase
      .from("posts")
      .select("category")
      .eq("published", true)
      .not("category", "is", null);

    if (error) throw error;

    const categories = [
      ...new Set(data.map((item) => item.category).filter(Boolean)),
    ];
    return categories;
  }

  /**
   * Get all unique tags
   */
  async getTags() {
    const { data, error } = await this.supabase
      .from("posts")
      .select("tags")
      .eq("published", true)
      .not("tags", "is", null);

    if (error) throw error;

    const tags = [...new Set(data.flatMap((item) => item.tags || []))];
    return tags;
  }
}

// Newsletter queries
export class NewsletterQueries {
  private supabase = getSupabaseServerClient();

  /**
   * Subscribe email to newsletter
   */
  async subscribeEmail(email: string, source?: string) {
    const { data, error } = await this.supabase
      .from("newsletter")
      .insert({
        email,
        email_lower: email.toLowerCase(),
        source,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  /**
   * Check if email is already subscribed
   */
  async isEmailSubscribed(email: string) {
    const { data, error } = await this.supabase
      .from("newsletter")
      .select("id, is_active")
      .eq("email_lower", email.toLowerCase())
      .eq("is_active", true)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return !!data;
  }
}

// Singleton instances
export const postQueries = new PostQueries();
export const newsletterQueries = new NewsletterQueries();
