import type { SelectPost } from "@/db/schema";
import { getSupabaseServerClient } from "@/db/server";

// Extended types for query results
export type PostListItem = Pick<
	SelectPost,
	| "id"
	| "slug"
	| "title"
	| "excerpt"
	| "coverImageUrl"
	| "tags"
	| "featured"
	| "published"
	| "published_at"
	| "created_at"
	| "updated_at"
	| "githubRepoUrl"
	| "homepageUrl"
>;

export type PostSummary = Pick<
	SelectPost,
	| "id"
	| "slug"
	| "title"
	| "excerpt"
	| "coverImageUrl"
	| "tags"
	| "published"
	| "published_at"
	| "githubRepoUrl"
	| "homepageUrl"
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
			tag?: string;
		} = {},
	): Promise<PostListItem[]> {
		const isDev = process.env.NODE_ENV === "development";
		let query = this.supabase
			.from("posts")
			.select(`
			 id, slug, title, excerpt, cover_image_url,
			 tags, featured, published, published_at, created_at, updated_at,
			 github_repo_url, homepage_url
		`)
			.order("published_at", { ascending: false });

		if (!isDev) {
			query = query.eq("published", true);
		}

		if (options.featured !== undefined) {
			query = query.eq("featured", options.featured);
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
		const isDev = process.env.NODE_ENV === "development";
		let query = this.supabase.from("posts").select("*").eq("slug", slug);
		if (!isDev) {
			query = query.eq("published", true);
		}
		const { data, error } = await query.single();

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
		const isDev = process.env.NODE_ENV === "development";
		let query = this.supabase
			.from("posts")
			.select(`
			 id, slug, title, excerpt, cover_image_url,
			 tags, published, published_at,
			 github_repo_url, homepage_url
		`)
			.eq("featured", false)
			.order("published_at", { ascending: false })
			.limit(limit);

		if (!isDev) {
			query = query.eq("published", true);
		}

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
		const isDev = process.env.NODE_ENV === "development";
		let base = this.supabase
			.from("posts")
			.select(`
	      id, slug, title, excerpt, cover_image_url,
	      published, published_at
	    `)
			.or(
				`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`,
			)
			.order("published_at", { ascending: false })
			.limit(limit);
		if (!isDev) {
			base = base.eq("published", true);
		}
		const { data, error } = await base;

		if (error) throw error;

		return data as unknown as PostSummary[];
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
	async isEmailSubscribed() {
		const { data, error } = await this.supabase
			.from("newsletter")
			.select("id, is_active")
			.eq("is_active", true)
			.single();

		if (error && error.code !== "PGRST116") throw error;

		return !!data;
	}
}

// Singleton instances
export const postQueries = new PostQueries();
export const newsletterQueries = new NewsletterQueries();
