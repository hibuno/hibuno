import type { Metadata } from "next";
import type { SelectPost } from "@/db/schema";

export interface SEOProps {
	title?: string;
	description?: string;
	keywords?: string[];
	image?: string;
	url?: string;
	type?: "website" | "article";
	publishedTime?: string;
	modifiedTime?: string;
	author?: string;
	section?: string;
	tags?: string[];
}

const SITE_CONFIG = {
    name: "Hibuno",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://hibuno.com",
	description:
		"Stories and ideas to deepen your understanding. Read, learn, and subscribe for weekly updates on web development, TypeScript, and modern programming practices.",
	keywords: [
		"blog",
		"web development",
		"typescript",
		"programming",
		"tutorials",
	],
	authors: [{ name: "Hibuno Team" }],
	creator: "Hibuno",
	publisher: "Hibuno",
	twitterHandle: "@hibuno",
};

/**
 * Generate metadata for the site
 */
export function generateSiteMetadata(
	overrides: Partial<SEOProps> = {},
): Metadata {
	const { title, description, keywords, image, url } = overrides;

	return {
		title: {
			default: title ? `${title} | ${SITE_CONFIG.name}` : SITE_CONFIG.name,
			template: `%s | ${SITE_CONFIG.name}`,
		},
		description: description || SITE_CONFIG.description,
		keywords: [...SITE_CONFIG.keywords, ...(keywords || [])],
		authors: SITE_CONFIG.authors,
		creator: SITE_CONFIG.creator,
		publisher: SITE_CONFIG.publisher,
		metadataBase: new URL(SITE_CONFIG.url),
		alternates: {
			canonical: url || "/",
		},
		openGraph: {
			type: "website",
			locale: "en_US",
			url: url || SITE_CONFIG.url,
			title: title || SITE_CONFIG.name,
			description: description || SITE_CONFIG.description,
			siteName: SITE_CONFIG.name,
			images: image ? [{ url: image, alt: title || SITE_CONFIG.name }] : [],
		},
		twitter: {
			card: "summary_large_image",
			title: title || SITE_CONFIG.name,
			description: description || SITE_CONFIG.description,
			creator: SITE_CONFIG.twitterHandle,
			images: image ? [image] : [],
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
	};
}

/**
 * Generate metadata for a blog post
 */
export function generatePostMetadata(post: SelectPost): Metadata {
	const url = `${SITE_CONFIG.url}/${post.slug}`;
	const description =
		post.excerpt ||
		post.subtitle ||
		`Read this article by ${post.authorName} on ${SITE_CONFIG.name}`;

	return {
		title: `${post.title} | ${SITE_CONFIG.name}`,
		description,
		keywords: [
			...SITE_CONFIG.keywords,
			...(post.tags || []),
			post.category || "",
		].filter(Boolean),
		authors: [{ name: post.authorName }],
		creator: post.authorName,
		publisher: SITE_CONFIG.publisher,
		metadataBase: new URL(SITE_CONFIG.url),
		alternates: {
			canonical: url,
		},
		openGraph: {
			type: "article",
			locale: "en_US",
			url,
			title: post.title,
			description,
			siteName: SITE_CONFIG.name,
			images: post.coverImageUrl
				? [
					{
						url: post.coverImageUrl,
						alt: post.coverImageAlt || post.title,
						width: 1200,
						height: 630,
					},
				]
				: [],
			publishedTime: post.published_at
				? new Date(post.published_at).toISOString()
				: undefined,
			modifiedTime: post.updated_at
				? new Date(post.updated_at).toISOString()
				: undefined,
			authors: [post.authorName],
			section: post.category || undefined,
			tags: post.tags || undefined,
		},
		twitter: {
			card: "summary_large_image",
			title: post.title,
			description,
			creator: SITE_CONFIG.twitterHandle,
			images: post.coverImageUrl ? [post.coverImageUrl] : [],
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
	};
}

/**
 * Generate structured data (JSON-LD) for a blog post
 */
export function generatePostStructuredData(post: SelectPost) {
	const url = `${SITE_CONFIG.url}/${post.slug}`;

	return {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: post.title,
		description: post.excerpt || post.subtitle,
		image: post.coverImageUrl ? [post.coverImageUrl] : [],
		datePublished: post.published_at || undefined,
		dateModified: post.updated_at || undefined,
		author: {
			"@type": "Person",
			name: post.authorName,
			image: post.authorAvatarUrl,
			bio: post.authorBio,
		},
		publisher: {
			"@type": "Organization",
			name: SITE_CONFIG.name,
			logo: {
				"@type": "ImageObject",
				url: `${SITE_CONFIG.url}/logo.png`,
			},
		},
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": url,
		},
		wordCount: post.wordCount,
		timeRequired: post.readingTime ? `PT${post.readingTime}M` : undefined,
		keywords: post.tags?.join(", "),
		articleSection: post.category,
	};
}

/**
 * Generate structured data for the website
 */
export function generateWebsiteStructuredData() {
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: SITE_CONFIG.name,
		description: SITE_CONFIG.description,
		url: SITE_CONFIG.url,
		potentialAction: {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
			},
			"query-input": "required name=search_term_string",
		},
	};
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(
	items: Array<{ name: string; url: string }>,
) {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: item.url,
		})),
	};
}
