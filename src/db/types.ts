// Social media link interface
export interface SocialMediaLink {
  platform: "tiktok" | "youtube" | "instagram" | "twitter" | "facebook";
  url: string;
  caption?: string;
}

// Supported locales
export type PostLocale = "en" | "id";

// Localized content structure for editor
export interface LocalizedContent {
  title: string;
  excerpt: string;
  content: string;
}

// Post interface for blog and product functionality
export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null | undefined;
  content: string;
  // i18n fields - content_group_id links translations of the same post
  content_group_id?: string | null | undefined; // UUID to group translations together
  locale?: PostLocale | null | undefined; // Language of this specific post
  cover_image_url?: string | null | undefined;
  tags?: string[] | null | undefined;
  published: boolean;
  published_at?: Date | null | undefined;
  created_at: Date;
  updated_at: Date;
  // E-commerce fields
  price?: number | null | undefined;
  discount_percentage?: number | null | undefined;
  homepage?: string | null | undefined;
  product_description?: string | null | undefined;
  // Social media fields
  social_media_links?: SocialMediaLink[] | null | undefined;
}

// Translation info for a post
export interface PostTranslation {
  locale: PostLocale;
  slug: string;
  title: string;
  exists: boolean;
}

// Type for creating a new post (optional fields that have defaults)
export type InsertPost = Omit<Post, "id" | "created_at" | "updated_at"> & {
  id?: string;
  published?: boolean;
  created_at?: Date;
  updated_at?: Date;
};

// Type for selecting a post (same as Post)
export type SelectPost = Post;
