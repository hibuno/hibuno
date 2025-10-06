import "server-only";
import { cache } from "react";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkSmartypants from "remark-smartypants";
import { codeToHtml } from "shiki";
import { unified } from "unified";

export async function markdownToHtml(markdown: string) {
  // First, convert markdown to HTML without syntax highlighting
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkSmartypants)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      properties: { className: ["subtle-link"] },
    })
    .use(rehypeSanitize, {
      ...defaultSchema,
      attributes: {
        ...(defaultSchema.attributes || {}),
        h1: [...(defaultSchema.attributes?.h1 || []), "id", "className"],
        h2: [...(defaultSchema.attributes?.h2 || []), "id", "className"],
        h3: [...(defaultSchema.attributes?.h3 || []), "id", "className"],
        h4: [...(defaultSchema.attributes?.h4 || []), "id", "className"],
        h5: [...(defaultSchema.attributes?.h5 || []), "id", "className"],
        h6: [...(defaultSchema.attributes?.h6 || []), "id", "className"],
        a: [...(defaultSchema.attributes?.a || []), "className"],
        code: [...(defaultSchema.attributes?.code || []), "className"],
        pre: [...(defaultSchema.attributes?.pre || []), "className"],
        div: [...(defaultSchema.attributes?.div || []), "className", "style"],
        span: [...(defaultSchema.attributes?.span || []), "className", "style"],
        img: [
          ...(defaultSchema.attributes?.img || []),
          "className",
          "width",
          "height",
          "loading",
          "decoding",
          "dataInteractive",
        ],
        video: [
          ...(defaultSchema.attributes?.video || []),
          "src",
          "controls",
          "className",
          "width",
          "height",
          "preload",
          "poster",
          "dataInteractive",
        ],
      },
      tagNames: [
        ...(defaultSchema.tagNames || []),
        "div",
        "span",
        "pre",
        "code",
        "video",
      ],
    })
    .use(rehypeStringify)
    .process(markdown || "");

  let html = String(file);

  // Post-process the HTML to add Shiki syntax highlighting
  html = await addShikiHighlighting(html);

  return html;
}

// Function to post-process HTML and add Shiki highlighting
async function addShikiHighlighting(html: string): Promise<string> {
  // For server environment, we'll use a different approach
  // We'll manually find and replace code blocks with highlighted versions

  const codeBlockRegex =
    /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g;
  const matches = [...html.matchAll(codeBlockRegex)];

  if (matches.length === 0) {
    return html;
  }

  // Process each code block sequentially
  for (const match of matches) {
    const fullMatch = match[0];
    const language = match[1] || "text";
    const codeContent = match[2] || "";

    try {
      const highlighted = await codeToHtml(codeContent, {
        lang: language,
        theme: "github-dark",
      });

      const replacement = `<div class="shiki-container">${highlighted}</div>`;
      html = html.replace(fullMatch, replacement);
    } catch (error) {
      console.error("Error highlighting code:", error);
    }
  }

  return html;
}

export const renderMarkdown = cache(markdownToHtml);

export default async function MarkdownRenderer({
  markdown,
  className,
}: {
  markdown: string;
  className?: string;
}) {
  const html = await renderMarkdown(markdown || "");

  // Import the interactive component dynamically to avoid SSR issues
  const { InteractiveMarkdownRenderer } = await import(
    "./interactive-markdown-renderer"
  );

  return (
    <InteractiveMarkdownRenderer
      html={html}
      {...(className && { className })}
    />
  );
}
