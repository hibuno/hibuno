"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { memo, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  content?: string;
  published?: boolean;
  published_at: string;
  preview_enabled?: boolean | null;
};

const ANIMATION = {
  card: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" },
    whileHover: { y: -2 },
  },
  image: {
    whileHover: { scale: 1.02 },
    transition: { duration: 0.25, ease: "easeOut" },
  },
} as const;

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
    <div className="relative w-full h-full bg-white">
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
        className="absolute top-2 left-2 p-1.5 bg-background/90 backdrop-blur-sm border border-border rounded hover:bg-muted transition-colors"
        title="Reload preview"
      >
        <RotateCcw className="w-3 h-3 text-foreground" />
      </button>
    </div>
  );
});

CodePreviewThumbnail.displayName = "CodePreviewThumbnail";

const PostImage = memo(
  ({ post, isUnpublished }: { post: Post; isUnpublished: boolean }) => {
    const canPreview = useMemo(() => {
      if (!post.preview_enabled || !post.content) return false;
      const blocks = extractCodeBlocks(post.content);
      return hasPreviewableCode(blocks);
    }, [post.preview_enabled, post.content]);

    return (
      <div className="relative aspect-video overflow-hidden rounded-md mb-3">
        {canPreview ? (
          <CodePreviewThumbnail content={post.content!} />
        ) : (
          <motion.div
            whileHover={ANIMATION.image.whileHover}
            transition={ANIMATION.image.transition}
            className="w-full h-full"
          >
            <Image
              src={post.cover_image_url || "/placeholder.svg"}
              alt={post.title || "Blog post cover image"}
              className="w-full h-full object-cover"
              width={500}
              height={300}
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </motion.div>
        )}
        {isUnpublished && (
          <span className="absolute left-2 top-2 rounded bg-neutral-500/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
            Draft
          </span>
        )}
      </div>
    );
  }
);

PostImage.displayName = "PostImage";

// Format date consistently to avoid hydration mismatch
const formatDate = (date: Date): string => {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const PostMeta = memo(({ date }: { date: Date }) => (
  <div className="text-xs text-muted-foreground mb-1" suppressHydrationWarning>
    {formatDate(date)}
  </div>
));

PostMeta.displayName = "PostMeta";

export const PostCard = memo(({ post }: { post: Post }) => {
  const { date, isUnpublished } = useMemo(() => {
    const date = new Date(post.published_at);
    const isDev = process.env.NODE_ENV === "development";
    const isUnpublished = isDev && post.published === false;
    return { date, isUnpublished };
  }, [post.published_at, post.published]);

  return (
    <motion.div
      initial={ANIMATION.card.initial}
      animate={ANIMATION.card.animate}
      transition={ANIMATION.card.transition}
      whileHover={ANIMATION.card.whileHover}
      className="group"
    >
      <Link href={`/${post.slug}`} passHref>
        <article className="cursor-pointer h-full">
          <PostImage post={post} isUnpublished={isUnpublished} />
          <div className="space-y-1">
            <PostMeta date={date} />
            <h3 className="text-base sm:text-lg font-serif font-semibold group-hover:text-muted-foreground transition-colors leading-snug line-clamp-2">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {post.excerpt}
              </p>
            )}
          </div>
        </article>
      </Link>
    </motion.div>
  );
});

PostCard.displayName = "PostCard";
