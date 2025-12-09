import "server-only";
import { extractHeadingsFromHtml } from "./table-of-contents";
import GithubSlugger from "github-slugger";
import { getTranslations } from "next-intl/server";

interface DynamicTOCPostContentProps {
  post: {
    content: string;
  };
}

// Add IDs to headings in HTML content
function addHeadingIds(html: string): string {
  const slugger = new GithubSlugger();

  return html.replace(
    /<h([1-3])([^>]*)>(.*?)<\/h[1-3]>/gi,
    (match, level, attrs, content) => {
      // Check if heading already has an id
      if (/\bid\s*=/.test(attrs)) {
        return match;
      }

      // Extract text content (remove HTML tags)
      const text = content.replace(/<[^>]*>/g, "").trim();
      const id = slugger.slug(text);

      return `<h${level}${attrs} id="${id}">${content}</h${level}>`;
    }
  );
}

export default async function DynamicTOCPostContent({
  post,
}: DynamicTOCPostContentProps) {
  if (!post.content) {
    return (
      <div className="prose prose-lg max-w-none">
        <p>Content coming soon</p>
      </div>
    );
  }

  // Add IDs to headings first
  const contentWithIds = addHeadingIds(post.content);

  // Extract headings for TOC from HTML content
  const tocItems = await extractHeadingsFromHtml(contentWithIds);

  // Content is already HTML, use directly
  return <HtmlRendererWithTOC html={contentWithIds} tocItems={tocItems} />;
}

interface HtmlRendererWithTOCProps {
  html: string;
  tocItems: Array<{ depth: number; text: string; id: string }>;
}

async function HtmlRendererWithTOC({
  html,
  tocItems,
}: HtmlRendererWithTOCProps) {
  // Import the interactive component dynamically to avoid SSR issues
  const { InteractiveMarkdownRenderer } = await import("./markdown-renderer");

  // If no TOC items, render normally
  if (tocItems.length === 0) {
    return <InteractiveMarkdownRenderer html={html} />;
  }

  // Insert TOC after first paragraph in HTML
  const htmlWithTOC = await insertTOCAfterFirstParagraph(html, tocItems);

  return <InteractiveMarkdownRenderer html={htmlWithTOC} />;
}

async function insertTOCAfterFirstParagraph(
  html: string,
  tocItems: Array<{ depth: number; text: string; id: string }>
): Promise<string> {
  // Pattern to match first paragraph
  const firstParagraphRegex = /<p[^>]*>(.*?)<\/p>/i;

  const tocHtml = await generateTOCHTML(tocItems);

  if (firstParagraphRegex.test(html)) {
    // Insert TOC after first paragraph
    return html.replace(firstParagraphRegex, `$&${tocHtml}`);
  } else {
    // If no paragraph found, insert at the beginning
    return tocHtml + html;
  }
}

async function generateTOCHTML(
  tocItems: Array<{ depth: number; text: string; id: string }>
): Promise<string> {
  const t = await getTranslations("common");
  const tocListItems = tocItems
    .map((item) => {
      // Use data attributes for handling clicks in the InteractiveMarkdownRenderer
      return `              <li class="text-sm">
                <a href="#${item.id}" class="no-underline hover:underline transition-all duration-200 toc-link" data-heading-id="${item.id}">${item.text}</a>
              </li>`;
    })
    .join("\n");

  return `
    <nav aria-label="In this article">
      <div class="rounded-xl border bg-background/40 p-4 prose-custom prose max-w-none">
        <h3 class="mb-2 text-sm font-semibold text-muted-foreground">
          ${t("toc")}
        </h3>
        <ol class="space-y-2">
${tocListItems}
        </ol>
      </div>
    </nav>`;
}
