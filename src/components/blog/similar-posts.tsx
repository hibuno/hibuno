"use client";

import Image from "next/image";
import Link from "next/link";
import { memo, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

interface Post {
  slug: string;
  title: string;
  excerpt?: string | null | undefined;
  cover_image_url?: string | null | undefined;
  content?: string | null | undefined;
  published_at?: Date | string | null | undefined;
  preview_enabled?: boolean | null | undefined;
}

interface SimilarPostsProps {
  posts: Post[];
}

// Code preview utilities
interface CodeBlock {
  language: string;
  code: string;
}

function extractCodeBlocks(content: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const preRegex =
    /<pre[^>]*data-language="([^"]*)"[^>]*>[\s\S]*?<code[^>]*>([\s\S]*?)<\/code>[\s\S]*?<\/pre>/gi;

  let match: RegExpExecArray | null;
  while ((match = preRegex.exec(content)) !== null) {
    const language = match[1]?.toLowerCase() || "";
    let code = match[2] || "";
    code = code
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ");
    blocks.push({ language, code });
  }
  return blocks;
}

function hasPreviewableCode(blocks: CodeBlock[]): boolean {
  const languages = blocks.map((b) => b.language);
  return (
    languages.some((l) => ["html", "xml", "markup"].includes(l)) ||
    (languages.includes("css") &&
      languages.some((l) => ["html", "xml", "markup"].includes(l)))
  );
}

function combineCodeBlocks(blocks: CodeBlock[]): string {
  let htmlContent = "";
  let cssContent = "";
  let jsContent = "";

  for (const block of blocks) {
    const lang = block.language.toLowerCase();
    if (["html", "xml", "markup"].includes(lang)) {
      htmlContent += block.code + "\n";
    } else if (["css", "scss"].includes(lang)) {
      cssContent += block.code + "\n";
    } else if (["javascript", "js", "typescript", "ts"].includes(lang)) {
      jsContent += block.code + "\n";
    }
  }

  const hasDoctype = htmlContent.toLowerCase().includes("<!doctype");
  const hasHtmlTag = htmlContent.toLowerCase().includes("<html");

  if (hasDoctype || hasHtmlTag) {
    let result = htmlContent;
    if (cssContent.trim()) {
      const styleTag = `<style>\n${cssContent}</style>`;
      if (result.includes("</head>")) {
        result = result.replace("</head>", `${styleTag}\n</head>`);
      } else if (result.includes("<body")) {
        result = result.replace("<body", `${styleTag}\n<body`);
      } else {
        result = styleTag + "\n" + result;
      }
    }
    if (jsContent.trim()) {
      const scriptTag = `<script>\n${jsContent}</script>`;
      if (result.includes("</body>")) {
        result = result.replace("</body>", `${scriptTag}\n</body>`);
      } else {
        result = result + "\n" + scriptTag;
      }
    }
    return result;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
${cssContent}
  </style>
</head>
<body>
${htmlContent}
${jsContent.trim() ? `<script>\n${jsContent}</script>` : ""}
</body>
</html>`;
}

const CodePreviewThumbnail = memo(({ content }: { content: string }) => {
  const [key, setKey] = useState(0);

  const srcDoc = useMemo(() => {
    const blocks = extractCodeBlocks(content);
    return combineCodeBlocks(blocks);
  }, [content]);

  return (
    <div className="relative h-16 w-24 sm:h-20 sm:w-32 rounded-md overflow-hidden ring-1 ring-border shrink-0 bg-white">
      <iframe
        key={key}
        srcDoc={srcDoc}
        className="w-full h-full border-0 bg-white pointer-events-none"
        sandbox="allow-scripts"
        title="Code Preview"
      />
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setKey((k) => k + 1);
        }}
        className="absolute top-1 left-1 p-1 bg-background/90 backdrop-blur-sm border border-border rounded hover:bg-muted transition-colors"
        title="Reload preview"
      >
        <RotateCcw className="w-2.5 h-2.5 text-foreground" />
      </button>
    </div>
  );
});

CodePreviewThumbnail.displayName = "CodePreviewThumbnail";

// Memoized post item component
const PostItem = memo(({ post }: { post: Post }) => {
  const canPreview = useMemo(() => {
    if (!post.preview_enabled || !post.content) return false;
    const blocks = extractCodeBlocks(post.content);
    return hasPreviewableCode(blocks);
  }, [post.preview_enabled, post.content]);

  return (
    <li key={post.slug} className="group">
      <Link href={`/${post.slug}`} className="flex gap-3">
        {canPreview ? (
          <CodePreviewThumbnail content={post.content!} />
        ) : post.cover_image_url ? (
          <Image
            src={post.cover_image_url}
            alt=""
            width={128}
            height={80}
            className="h-16 w-24 sm:h-20 sm:w-32 rounded-md object-cover ring-1 ring-border shrink-0"
            loading="lazy"
          />
        ) : (
          <div className="h-16 w-24 sm:h-20 sm:w-32 rounded-md bg-muted shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <div className="line-clamp-2 text-sm sm:text-base font-medium group-hover:underline">
            {post.title}
          </div>
          {post.excerpt && (
            <p className="mt-1 line-clamp-2 text-xs sm:text-sm text-muted-foreground">
              {post.excerpt}
            </p>
          )}
        </div>
      </Link>
    </li>
  );
});

PostItem.displayName = "PostItem";

// Memoized posts grid component
const PostsGrid = memo(({ posts }: { posts: Post[] }) => (
  <ul className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
    {posts.map((post) => (
      <PostItem key={post.slug} post={post} />
    ))}
  </ul>
));

PostsGrid.displayName = "PostsGrid";

export default function SimilarPosts({ posts }: SimilarPostsProps) {
  const t = useTranslations("post");

  if (!posts?.length) {
    return null;
  }

  return (
    <section aria-label="Similar posts" className="mt-12">
      <h3 className="mb-4 text-lg font-semibold">{t("relatedArticles")}</h3>
      <PostsGrid posts={posts} />
    </section>
  );
}
