import fs from "fs";
import path from "path";
import type { SelectPost } from "./types";

const POSTS_DIR = path.join(process.cwd(), "content/posts");
const POSTS_INDEX_FILE = path.join(POSTS_DIR, "index.json");

// Ensure directories exist
function ensureDirectories() {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }
  if (!fs.existsSync(POSTS_INDEX_FILE)) {
    fs.writeFileSync(POSTS_INDEX_FILE, JSON.stringify([], null, 2));
  }
}

// Read all posts from index
export function getAllPosts(): SelectPost[] {
  ensureDirectories();
  try {
    const data = fs.readFileSync(POSTS_INDEX_FILE, "utf-8");
    return JSON.parse(data) as SelectPost[];
  } catch {
    return [];
  }
}

// Write all posts to index
function savePosts(posts: SelectPost[]) {
  ensureDirectories();
  fs.writeFileSync(POSTS_INDEX_FILE, JSON.stringify(posts, null, 2));
}

// Get a single post by slug
export function getPostBySlug(slug: string): SelectPost | null {
  const posts = getAllPosts();
  return posts.find((p) => p.slug === slug) || null;
}

// Create a new post
export function createPost(post: Omit<SelectPost, "id">): SelectPost {
  const posts = getAllPosts();
  const newPost: SelectPost = {
    ...post,
    id: crypto.randomUUID(),
    created_at: post.created_at || new Date(),
    updated_at: new Date(),
  };
  posts.push(newPost);
  savePosts(posts);
  return newPost;
}

// Update an existing post
export function updatePost(
  slug: string,
  updates: Partial<SelectPost>
): SelectPost | null {
  const posts = getAllPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  if (index === -1) return null;

  const existingPost = posts[index];
  if (!existingPost) return null;

  const updatedPost: SelectPost = {
    id: existingPost.id,
    slug: updates.slug ?? existingPost.slug,
    title: updates.title ?? existingPost.title,
    excerpt:
      updates.excerpt !== undefined ? updates.excerpt : existingPost.excerpt,
    content: updates.content ?? existingPost.content,
    cover_image_url:
      updates.cover_image_url !== undefined
        ? updates.cover_image_url
        : existingPost.cover_image_url,
    tags: updates.tags !== undefined ? updates.tags : existingPost.tags,
    published: updates.published ?? existingPost.published,
    published_at:
      updates.published_at !== undefined
        ? updates.published_at
        : existingPost.published_at,
    created_at: updates.created_at ?? existingPost.created_at,
    updated_at: new Date(),
    price: updates.price !== undefined ? updates.price : existingPost.price,
    discount_percentage:
      updates.discount_percentage !== undefined
        ? updates.discount_percentage
        : existingPost.discount_percentage,
    homepage:
      updates.homepage !== undefined ? updates.homepage : existingPost.homepage,
    product_description:
      updates.product_description !== undefined
        ? updates.product_description
        : existingPost.product_description,
    social_media_links:
      updates.social_media_links !== undefined
        ? updates.social_media_links
        : existingPost.social_media_links,
  };
  posts[index] = updatedPost;
  savePosts(posts);
  return updatedPost;
}

// Delete a post
export function deletePost(slug: string): boolean {
  const posts = getAllPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  if (index === -1) return false;

  posts.splice(index, 1);
  savePosts(posts);
  return true;
}

// Get published posts with filtering
export function getPublishedPosts(options: {
  limit?: number;
  offset?: number;
  tag?: string;
  includeDrafts?: boolean;
}): SelectPost[] {
  let posts = getAllPosts();

  // Filter by published status
  if (!options.includeDrafts) {
    posts = posts.filter((p) => p.published);
  }

  // Filter by tag
  if (options.tag) {
    posts = posts.filter((p) => p.tags?.includes(options.tag!));
  }

  // Sort by published_at descending (fallback to created_at)
  posts.sort((a, b) => {
    const dateA = a.published_at
      ? new Date(a.published_at).getTime()
      : a.created_at
      ? new Date(a.created_at).getTime()
      : 0;
    const dateB = b.published_at
      ? new Date(b.published_at).getTime()
      : b.created_at
      ? new Date(b.created_at).getTime()
      : 0;
    return dateB - dateA;
  });

  // Apply pagination
  const offset = options.offset || 0;
  const limit = options.limit || posts.length;
  return posts.slice(offset, offset + limit);
}

// Search posts
export function searchPosts(
  query: string,
  limit = 20,
  includeDrafts = false
): SelectPost[] {
  let posts = getAllPosts();
  const lowerQuery = query.toLowerCase();

  if (!includeDrafts) {
    posts = posts.filter((p) => p.published);
  }

  posts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(lowerQuery) ||
      p.content.toLowerCase().includes(lowerQuery) ||
      p.excerpt?.toLowerCase().includes(lowerQuery)
  );

  posts.sort((a, b) => {
    const dateA = a.published_at
      ? new Date(a.published_at).getTime()
      : a.created_at
      ? new Date(a.created_at).getTime()
      : 0;
    const dateB = b.published_at
      ? new Date(b.published_at).getTime()
      : b.created_at
      ? new Date(b.created_at).getTime()
      : 0;
    return dateB - dateA;
  });

  return posts.slice(0, limit);
}

// Get all unique tags
export function getAllTags(): string[] {
  const posts = getAllPosts().filter((p) => p.published);
  const tags = new Set<string>();
  for (const post of posts) {
    if (post.tags) {
      for (const tag of post.tags) {
        tags.add(tag);
      }
    }
  }
  return Array.from(tags);
}

// Get posts for navigation (newer/older)
export function getAdjacentPosts(publishedAt: string | null): {
  newer: SelectPost | null;
  older: SelectPost | null;
} {
  const posts = getAllPosts()
    .filter((p) => p.published)
    .sort((a, b) => {
      const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
      const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
      return dateA - dateB;
    });

  if (!publishedAt) return { newer: null, older: null };

  const currentDate = new Date(publishedAt).getTime();
  let newer: SelectPost | null = null;
  let older: SelectPost | null = null;

  for (const post of posts) {
    if (post.published_at) {
      const postDate = new Date(post.published_at).getTime();
      if (postDate > currentDate) {
        newer = post;
        break;
      }
    }
  }

  for (let i = posts.length - 1; i >= 0; i--) {
    const currentPost = posts[i];
    if (currentPost && currentPost.published_at) {
      const postDate = new Date(currentPost.published_at).getTime();
      if (postDate < currentDate) {
        older = currentPost;
        break;
      }
    }
  }

  return { newer, older };
}

// Get similar posts by tags
export function getSimilarPosts(
  currentSlug: string,
  tags?: string[] | null,
  limit = 4
): SelectPost[] {
  let posts = getAllPosts()
    .filter((p) => p.published && p.slug !== currentSlug)
    .sort((a, b) => {
      const dateA = a.published_at
        ? new Date(a.published_at).getTime()
        : a.created_at
        ? new Date(a.created_at).getTime()
        : 0;
      const dateB = b.published_at
        ? new Date(b.published_at).getTime()
        : b.created_at
        ? new Date(b.created_at).getTime()
        : 0;
      return dateB - dateA;
    });

  // Try to find posts with matching tags first
  if (tags?.length) {
    const taggedPosts = posts.filter((p) =>
      p.tags?.some((t) => tags.includes(t))
    );
    if (taggedPosts.length >= limit) {
      return taggedPosts.slice(0, limit);
    }
  }

  return posts.slice(0, limit);
}

// Get posts with social media links (for /codes page)
export function getPostsWithSocialMedia(options: {
  limit?: number;
  offset?: number;
  includeDrafts?: boolean;
}): SelectPost[] {
  let posts = getAllPosts();

  // Filter by published status
  if (!options.includeDrafts) {
    posts = posts.filter((p) => p.published);
  }

  // Filter only posts with social media links
  posts = posts.filter(
    (p) => p.social_media_links && p.social_media_links.length > 0
  );

  // Sort by published_at descending
  posts.sort((a, b) => {
    const dateA = a.published_at
      ? new Date(a.published_at).getTime()
      : a.created_at
      ? new Date(a.created_at).getTime()
      : 0;
    const dateB = b.published_at
      ? new Date(b.published_at).getTime()
      : b.created_at
      ? new Date(b.created_at).getTime()
      : 0;
    return dateB - dateA;
  });

  // Apply pagination
  const offset = options.offset || 0;
  const limit = options.limit || posts.length;
  return posts.slice(offset, offset + limit);
}

// Get posts without social media links (for homepage)
export function getPostsWithoutSocialMedia(options: {
  limit?: number;
  offset?: number;
  includeDrafts?: boolean;
}): SelectPost[] {
  let posts = getAllPosts();

  // Filter by published status
  if (!options.includeDrafts) {
    posts = posts.filter((p) => p.published);
  }

  // Filter only posts WITHOUT social media links
  posts = posts.filter(
    (p) => !p.social_media_links || p.social_media_links.length === 0
  );

  // Sort by published_at descending
  posts.sort((a, b) => {
    const dateA = a.published_at
      ? new Date(a.published_at).getTime()
      : a.created_at
      ? new Date(a.created_at).getTime()
      : 0;
    const dateB = b.published_at
      ? new Date(b.published_at).getTime()
      : b.created_at
      ? new Date(b.created_at).getTime()
      : 0;
    return dateB - dateA;
  });

  // Apply pagination
  const offset = options.offset || 0;
  const limit = options.limit || posts.length;
  return posts.slice(offset, offset + limit);
}
