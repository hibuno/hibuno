export async function uploadImage(
  file: File,
  postId?: string,
): Promise<string> {
  // Create form data
  const formData = new FormData();
  formData.append("file", file);
  if (postId) {
    formData.append("postId", postId);
  }

  // Upload using admin API route
  const response = await fetch("/api/admin/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to upload image");
  }

  const data = await response.json();
  return data.url;
}

// Convert markdown to HTML for Tiptap editor
export function markdownToHtml(markdown: string): string {
  if (!markdown) return "";

  // Basic markdown conversions for common elements
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    // Bold
    .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.*)\*/gim, "<em>$1</em>")
    // Code blocks
    .replace(/```([\s\S]*?)```/gim, "<pre><code>$1</code></pre>")
    // Inline code
    .replace(/`([^`]+)`/gim, "<code>$1</code>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" />')
    // Lists
    .replace(/^\* (.*$)/gim, "<ul><li>$1</li></ul>")
    .replace(/^- (.*$)/gim, "<ul><li>$1</li></ul>")
    .replace(/^\d+\. (.*$)/gim, "<ol><li>$1</li></ol>")
    // Blockquotes
    .replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>")
    // Line breaks
    .replace(/\n\n/gim, "</p><p>")
    .replace(/\n/gim, "<br>");

  // Wrap in paragraph tags if not already wrapped
  if (
    !html.startsWith("<h") &&
    !html.startsWith("<p") &&
    !html.startsWith("<ul") &&
    !html.startsWith("<ol") &&
    !html.startsWith("<blockquote") &&
    !html.startsWith("<pre")
  ) {
    html = "<p>" + html + "</p>";
  }

  return html;
}
