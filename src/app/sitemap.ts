import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Define the base URL for the site
const baseUrl = 'https://hibuno.com';

// Define the allowed changeFrequency values
type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

// Get all blog posts from the content directory
const getBlogPosts = () => {
	const contentDir = path.join(process.cwd(), 'src/content');
	const files = fs.readdirSync(contentDir);

	return files
		.filter(file => file.endsWith('.mdx'))
		.map(file => {
			const filePath = path.join(contentDir, file);
			const fileContent = fs.readFileSync(filePath, 'utf8');
			const { data } = matter(fileContent);

			// Extract slug from filename (remove the numeric prefix and extension)
			const slug = file.replace(/^\d+-/, '').replace(/\.mdx$/, '');

			return {
				url: `${baseUrl}/blog/${slug}`,
				lastModified: new Date(data.date || new Date()),
				changeFrequency: 'weekly' as ChangeFrequency,
				priority: 0.8,
			};
		});
};

// Define all text tool pages
const getTextToolPages = () => {
	const textTools = [
		'lowercase',
		'uppercase',
		'randomcase',
		'titlecase',
		'invertcase',
		'capitalize',
		'reverse',
		'trim',
		'sort-lines',
		'reverse-lines',
		'shuffle-lines',
		'number-lines',
		'delete-empty-lines',
		'delete-duplicate-lines',
		'remove-whitespace',
		'remove-duplicate-spaces',
		'remove-punctuation',
		'strip-html',
		'extract-emails',
		'extract-urls',
		'extract-numbers',
		'word-frequency',
		'base64-encode',
		'base64-decode',
		'compare-texts',
	];

	return textTools.map(tool => ({
		url: `${baseUrl}/tools/text-tools/${tool}`,
		lastModified: new Date(),
		changeFrequency: 'monthly' as ChangeFrequency,
		priority: 0.7,
	}));
};

// Generate the sitemap
export default function sitemap(): MetadataRoute.Sitemap {
	// Static pages
	const staticPages = [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: 'weekly' as ChangeFrequency,
			priority: 1.0,
		},
		{
			url: `${baseUrl}/blog`,
			lastModified: new Date(),
			changeFrequency: 'weekly' as ChangeFrequency,
			priority: 0.9,
		},
		{
			url: `${baseUrl}/tools/background-removal`,
			lastModified: new Date(),
			changeFrequency: 'monthly' as ChangeFrequency,
			priority: 0.8,
		},
		{
			url: `${baseUrl}/tools/image-compression`,
			lastModified: new Date(),
			changeFrequency: 'monthly' as ChangeFrequency,
			priority: 0.8,
		},
	];

	// Combine all pages
	return [
		...staticPages,
		...getBlogPosts(),
		...getTextToolPages(),
	];
}
