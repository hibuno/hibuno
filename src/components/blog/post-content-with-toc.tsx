import "server-only";
import { extractHeadingsFromHtml } from "./table-of-contents";

interface DynamicTOCPostContentProps {
  post: {
    content: string;
  };
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

  // Extract headings for TOC from HTML content
  const tocItems = await extractHeadingsFromHtml(post.content);

  // Content is already HTML, use directly
  return <HtmlRendererWithTOC html={post.content} tocItems={tocItems} />;
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
  const htmlWithTOC = insertTOCAfterFirstParagraph(html, tocItems);

  return <InteractiveMarkdownRenderer html={htmlWithTOC} />;
}

function insertTOCAfterFirstParagraph(
  html: string,
  tocItems: Array<{ depth: number; text: string; id: string }>
): string {
  // Pattern to match first paragraph
  const firstParagraphRegex = /<p[^>]*>(.*?)<\/p>/i;

  const tocHtml = generateTOCHTML(tocItems);

  if (firstParagraphRegex.test(html)) {
    // Insert TOC after first paragraph
    return html.replace(firstParagraphRegex, `$&${tocHtml}`);
  } else {
    // If no paragraph found, insert at the beginning
    return tocHtml + html;
  }
}

function generateTOCHTML(
  tocItems: Array<{ depth: number; text: string; id: string }>
): string {
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
          Dalam artikel ini
        </h3>
        <ol class="space-y-2">
${tocListItems}
        </ol>
      </div>
    </nav>`;
}
