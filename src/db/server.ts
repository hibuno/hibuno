import fs from "fs";
import path from "path";
import type { SelectPost, PostLocale, PostTranslation } from "./types";

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
export function getPosts(): SelectPost[] {
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
  const posts = getPosts();
  return posts.find((p) => p.slug === slug) || null;
}

// Get a post by slug and locale (returns the localized version if available)
export function getPostBySlugAndLocale(
  slug: string,
  locale: PostLocale
): SelectPost | null {
  const post = getPostBySlug(slug);
  if (!post) return null;

  // If post has no content_group_id, return as-is
  if (!post.content_group_id) return post;

  // If post matches requested locale, return it
  if (post.locale === locale) return post;

  // Try to find translation in the same content group
  const posts = getPosts();
  const translation = posts.find(
    (p) => p.content_group_id === post.content_group_id && p.locale === locale
  );

  return translation || post;
}

// Get all translations for a post by content_group_id
export function getPostTranslations(contentGroupId: string): PostTranslation[] {
  const posts = getPosts();
  const translations = posts.filter(
    (p) => p.content_group_id === contentGroupId
  );

  const locales: PostLocale[] = ["en", "id"];
  return locales.map((locale) => {
    const post = translations.find((p) => p.locale === locale);
    return {
      locale,
      slug: post?.slug || "",
      title: post?.title || "",
      exists: !!post,
    };
  });
}

// Get post by content_group_id and locale
export function getPostByContentGroupAndLocale(
  contentGroupId: string,
  locale: PostLocale
): SelectPost | null {
  const posts = getPosts();
  return (
    posts.find(
      (p) => p.content_group_id === contentGroupId && p.locale === locale
    ) || null
  );
}

// Link two posts as translations of each other
export function linkPostTranslations(
  postId1: string,
  postId2: string
): string | null {
  const posts = getPosts();
  const post1 = posts.find((p) => p.id === postId1);
  const post2 = posts.find((p) => p.id === postId2);

  if (!post1 || !post2) return null;

  // Use existing content_group_id or create new one
  const contentGroupId =
    post1.content_group_id || post2.content_group_id || crypto.randomUUID();

  // Update both posts
  const idx1 = posts.findIndex((p) => p.id === postId1);
  const idx2 = posts.findIndex((p) => p.id === postId2);

  if (idx1 !== -1) {
    posts[idx1] = { ...posts[idx1]!, content_group_id: contentGroupId };
  }
  if (idx2 !== -1) {
    posts[idx2] = { ...posts[idx2]!, content_group_id: contentGroupId };
  }

  savePosts(posts);
  return contentGroupId;
}

// Create a new post
export function createPost(post: Omit<SelectPost, "id">): SelectPost {
  const posts = getPosts();
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
  const posts = getPosts();
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
    content_group_id:
      updates.content_group_id !== undefined
        ? updates.content_group_id
        : existingPost.content_group_id,
    locale: updates.locale !== undefined ? updates.locale : existingPost.locale,
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
  const posts = getPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  if (index === -1) return false;

  posts.splice(index, 1);
  savePosts(posts);
  return true;
}

// Default locale for the site
const DEFAULT_LOCALE: PostLocale = "id";

// Helper function to deduplicate posts by content_group_id
function deduplicateByLocale(
  posts: SelectPost[],
  preferredLocale: PostLocale = DEFAULT_LOCALE
): SelectPost[] {
  const postsByGroup = new Map<string, SelectPost[]>();
  const standalonePosts: SelectPost[] = [];

  for (const post of posts) {
    if (post.content_group_id) {
      const group = postsByGroup.get(post.content_group_id) || [];
      group.push(post);
      postsByGroup.set(post.content_group_id, group);
    } else {
      // Standalone posts (no content_group_id) are always included
      // They don't have translations, so show them regardless of locale
      standalonePosts.push(post);
    }
  }

  const deduplicatedPosts: SelectPost[] = [];

  for (const [_groupId, groupPosts] of postsByGroup) {
    // Try to find post matching preferred locale
    let selectedPost = groupPosts.find((p) => p.locale === preferredLocale);

    // If not found and preferred is not default, try default locale
    if (!selectedPost && preferredLocale !== DEFAULT_LOCALE) {
      selectedPost = groupPosts.find((p) => p.locale === DEFAULT_LOCALE);
    }

    // If still not found, take first available
    if (!selectedPost) {
      selectedPost = groupPosts[0];
    }

    if (selectedPost) {
      deduplicatedPosts.push(selectedPost);
    }
  }

  deduplicatedPosts.push(...standalonePosts);
  return deduplicatedPosts;
}

// Get published posts with filtering - deduplicates translations
export function getPublishedPosts(options: {
  limit?: number;
  offset?: number;
  tag?: string;
  locale?: PostLocale;
  includeDrafts?: boolean;
}): SelectPost[] {
  let posts = getPosts();
  const preferredLocale = options.locale || DEFAULT_LOCALE;

  // Filter by published status
  if (!options.includeDrafts) {
    posts = posts.filter((p) => p.published);
  }

  // Filter by tag
  if (options.tag) {
    posts = posts.filter((p) => p.tags?.includes(options.tag!));
  }

  // Deduplicate posts with same content_group_id - prefer the requested locale
  const deduplicatedPosts = deduplicateByLocale(posts, preferredLocale);

  // Sort by published_at descending (fallback to created_at)
  deduplicatedPosts.sort((a, b) => {
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
  const limit = options.limit || deduplicatedPosts.length;
  return deduplicatedPosts.slice(offset, offset + limit);
}

// Search posts
export function searchPosts(
  query: string,
  limit = 20,
  includeDrafts = false,
  locale: PostLocale = DEFAULT_LOCALE
): SelectPost[] {
  let posts = getPosts();
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

  // Deduplicate by locale
  posts = deduplicateByLocale(posts, locale);

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
  const posts = getPosts().filter((p) => p.published);
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
export function getAdjacentPosts(
  publishedAt: string | null,
  locale: PostLocale = DEFAULT_LOCALE
): {
  newer: SelectPost | null;
  older: SelectPost | null;
} {
  let posts = getPosts().filter((p) => p.published);

  // Deduplicate by locale
  posts = deduplicateByLocale(posts, locale);

  posts.sort((a, b) => {
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
  limit = 4,
  locale: PostLocale = DEFAULT_LOCALE
): SelectPost[] {
  let posts = getPosts().filter((p) => p.published && p.slug !== currentSlug);

  // Deduplicate by locale
  posts = deduplicateByLocale(posts, locale);

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
export function getAllPosts(options: {
  limit?: number;
  offset?: number;
  locale?: PostLocale;
  includeDrafts?: boolean;
}): SelectPost[] {
  let posts = getPosts();
  const preferredLocale = options.locale || DEFAULT_LOCALE;

  // Filter by published status
  if (!options.includeDrafts) {
    posts = posts.filter((p) => p.published);
  }

  // Deduplicate by locale
  posts = deduplicateByLocale(posts, preferredLocale);

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
