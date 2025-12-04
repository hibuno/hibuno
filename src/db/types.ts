// Post interface for blog functionality
export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null | undefined;
  content: string;
  cover_image_url?: string | null | undefined;
  tags?: string[] | null | undefined;
  published: boolean;
  published_at?: Date | null | undefined;
  created_at: Date;
  updated_at: Date;
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
