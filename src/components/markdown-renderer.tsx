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
import { unified } from "unified";

export async function markdownToHtml(markdown: string) {
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
    img: [
     ...(defaultSchema.attributes?.img || []),
     "className",
     "width",
     "height",
     "loading",
     "decoding",
    ],
   },
  })
  .use(rehypeStringify)
  .process(markdown || "");
 return String(file);
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
 return (
  <article
   className={[
    "prose prose-zinc dark:prose-invert max-w-none prose-custom",
    className,
   ]
    .filter(Boolean)
    .join(" ")}
   // biome-ignore lint/security/noDangerouslySetInnerHtml: Markdown content is sanitized
   dangerouslySetInnerHTML={{ __html: html }}
  />
 );
}
