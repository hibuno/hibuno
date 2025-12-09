"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { memo, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { RotateCcw } from "lucide-react";
import type { SelectPost, SocialMediaLink } from "@/db/types";
import type { Locale } from "@/i18n/config";

interface CodesGridProps {
  posts: SelectPost[];
}

const ANIMATION = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  },
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

import {
  siYoutube,
  siTiktok,
  siInstagram,
  siX,
  siFacebook,
} from "simple-icons";

const PLATFORM_CONFIG = {
  tiktok: { label: "TikTok", icon: siTiktok.path },
  youtube: { label: "YouTube", icon: siYoutube.path },
  instagram: { label: "Instagram", icon: siInstagram.path },
  twitter: { label: "X", icon: siX.path },
  facebook: { label: "Facebook", icon: siFacebook.path },
};

const formatDate = (date: Date, locale: Locale): string => {
  return date.toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Code preview utilities (from code-preview.tsx)
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
  ({ post, links }: { post: SelectPost; links: SocialMediaLink[] }) => {
    const canPreview = useMemo(() => {
      if (!post.preview_enabled || !post.content) return false;
      const blocks = extractCodeBlocks(post.content);
      return hasPreviewableCode(blocks);
    }, [post.preview_enabled, post.content]);

    return (
      <div className="relative aspect-video overflow-hidden rounded-md mb-3">
        {canPreview ? (
          <CodePreviewThumbnail content={post.content} />
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
        {links.length > 0 && (
          <div className="absolute top-2 right-2 flex gap-1">
            {links.map((link, i) => {
              const p = PLATFORM_CONFIG[link.platform];
              return (
                <span
                  key={i}
                  className="px-2 py-1 rounded bg-background/90 backdrop-blur-sm border border-border"
                  title={p.label}
                >
                  <svg
                    role="img"
                    viewBox="0 0 24 24"
                    className="w-3 h-3 fill-current text-foreground"
                    aria-label={p.label}
                  >
                    <path d={p.icon} />
                  </svg>
                </span>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

PostImage.displayName = "PostImage";

const PostMeta = memo(({ date }: { date: Date }) => {
  const locale = useLocale() as Locale;
  return (
    <div
      className="text-xs text-muted-foreground mb-1"
      suppressHydrationWarning
    >
      {formatDate(date, locale)}
    </div>
  );
});

PostMeta.displayName = "PostMeta";

const CodeCard = memo(({ post }: { post: SelectPost }) => {
  const { date, links } = useMemo(() => {
    const date = new Date(post.published_at || post.created_at);
    const links = (post.social_media_links || []) as SocialMediaLink[];
    return { date, links };
  }, [post.published_at, post.created_at, post.social_media_links]);

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
          <PostImage post={post} links={links} />
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

CodeCard.displayName = "CodeCard";

const HeroSection = memo(() => {
  const t = useTranslations("codes");
  return (
    <motion.header className="mb-8 sm:mb-12" variants={ANIMATION.item}>
      <motion.h1
        className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold mb-3"
        variants={ANIMATION.item}
      >
        {t("title")}
      </motion.h1>
      <motion.p
        className="text-sm sm:text-base text-muted-foreground max-w-2xl"
        variants={ANIMATION.item}
      >
        {t("description")}
      </motion.p>
    </motion.header>
  );
});

HeroSection.displayName = "HeroSection";

const CodeGridItem = memo(
  ({ post, index }: { post: SelectPost; index: number }) => (
    <motion.div
      key={post.id}
      variants={ANIMATION.item}
      transition={{ delay: index * 0.05 }}
    >
      <CodeCard post={post} />
    </motion.div>
  )
);

CodeGridItem.displayName = "CodeGridItem";

const CodesGridContent = memo(({ posts }: { posts: SelectPost[] }) => {
  const postItems = useMemo(
    () =>
      posts.map((post, index) => (
        <CodeGridItem key={post.id} post={post} index={index} />
      )),
    [posts]
  );

  return (
    <motion.section aria-label="Content grid" variants={ANIMATION.item}>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        variants={ANIMATION.container}
      >
        {postItems}
      </motion.div>
    </motion.section>
  );
});

CodesGridContent.displayName = "CodesGridContent";

const EmptyState = memo(() => {
  const t = useTranslations("codes");
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold mb-2">{t("noContent")}</h2>
        <p className="text-muted-foreground mb-6">
          {t("noContentDescription")}
        </p>
        <a
          href="/"
          className="inline-block px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          {t("readArticles")}
        </a>
      </div>
    </main>
  );
});

EmptyState.displayName = "EmptyState";

export const CodesGrid = memo(({ posts }: CodesGridProps) => {
  if (!posts?.length) {
    return <EmptyState />;
  }

  return (
    <motion.main
      className="max-w-4xl mx-auto px-4 py-8 sm:py-12"
      variants={ANIMATION.container}
      initial="hidden"
      animate="visible"
    >
      <HeroSection />
      <CodesGridContent posts={posts} />
    </motion.main>
  );
});

CodesGrid.displayName = "CodesGrid";
