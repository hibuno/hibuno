// This file should only be imported by server components
'use server';

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'src/content');

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  featuredImage: string;
  layout: 'standard' | 'two-column' | 'overlap' | string;
  content: string;
  readingTime?: string;
  category?: string;
  featured?: boolean;
  author?: {
    name: string;
    role: string;
    avatar: string;
    bio?: string;
  };
};

export async function getAllPosts(): Promise<PostMeta[]> {
  // Get file names under /content
  const fileNames = await fs.promises.readdir(postsDirectory);
  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.mdx'))
    .map(async fileName => {
      // Remove ".mdx" from file name to get slug
      const slug = fileName.replace(/\.mdx$/, '');

      // Read markdown file as string
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = await fs.promises.readFile(fullPath, 'utf8');

      // Use gray-matter to parse the post metadata section
      const { data, content } = matter(fileContents);
      
      // Set default values for optional fields
      const postData = {
        ...data,
        featured: data.featured || false,
        category: data.category || 'General',
      };

      // Combine the data with the slug
      return {
        slug,
        content,
        ...(postData as Omit<PostMeta, 'slug' | 'content'>)
      };
    });

  // Wait for all promises to resolve
  const resolvedData = await Promise.all(allPostsData);

  // Sort posts by date
  return resolvedData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getPostBySlug(slug: string): Promise<PostMeta | null> {
  try {
    // First try with the exact slug
    let fullPath = path.join(postsDirectory, `${slug}.mdx`);
    
    // If file doesn't exist, try to find a file that starts with a number followed by the slug
    if (!fs.existsSync(fullPath)) {
      const fileNames = await fs.promises.readdir(postsDirectory);
      const matchingFile = fileNames.find(fileName => {
        // Match files that end with the slug after removing the numeric prefix
        const fileSlug = fileName.replace(/^\d+-(.+)\.mdx$/, '$1');
        return fileSlug === slug || fileName.replace(/\.mdx$/, '') === slug;
      });
      
      if (matchingFile) {
        fullPath = path.join(postsDirectory, matchingFile);
      } else {
        return null;
      }
    }
    
    const fileContents = await fs.promises.readFile(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const { data, content } = matter(fileContents);
    
    // Set default values for optional fields
    const postData = {
      ...data,
      featured: data.featured || false,
      category: data.category || 'General',
    };

    // Combine the data with the slug
    return {
      slug,
      content,
      ...(postData as Omit<PostMeta, 'slug' | 'content'>)
    };
  } catch (error) {
    console.error(`Error loading post with slug ${slug}:`, error);
    return null;
  }
}
