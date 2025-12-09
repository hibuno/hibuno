"use client";

import { useMemo, useState } from "react";
import { Maximize2, Minimize2, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

interface CodePreviewProps {
  content: string;
}

interface CodeBlock {
  language: string;
  code: string;
}

// Extract code blocks from HTML content
function extractCodeBlocks(content: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];

  // Match <pre data-language="..."><code>...</code></pre> patterns
  const preRegex =
    /<pre[^>]*data-language="([^"]*)"[^>]*>[\s\S]*?<code[^>]*>([\s\S]*?)<\/code>[\s\S]*?<\/pre>/gi;

  let match;
  while ((match = preRegex.exec(content)) !== null) {
    const language = match[1]?.toLowerCase() || "";
    // Decode HTML entities
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

// Check if content has previewable code (HTML + CSS or just HTML)
function hasPreviewableCode(blocks: CodeBlock[]): boolean {
  const languages = blocks.map((b) => b.language);
  return (
    languages.some((l) => ["html", "xml", "markup"].includes(l)) ||
    (languages.includes("css") &&
      languages.some((l) => ["html", "xml", "markup"].includes(l)))
  );
}

// Combine code blocks into a single HTML document
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

  // Check if HTML already has full document structure
  const hasDoctype = htmlContent.toLowerCase().includes("<!doctype");
  const hasHtmlTag = htmlContent.toLowerCase().includes("<html");

  if (hasDoctype || hasHtmlTag) {
    // Full HTML document - inject CSS and JS appropriately
    let result = htmlContent;

    // Inject CSS before </head> or at the start
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

    // Inject JS before </body> or at the end
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

  // Build a complete HTML document
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

export default function CodePreview({ content }: CodePreviewProps) {
  const t = useTranslations("common");
  const [isExpanded, setIsExpanded] = useState(false);
  const [key, setKey] = useState(0);

  const codeBlocks = useMemo(() => extractCodeBlocks(content), [content]);
  const canPreview = useMemo(
    () => hasPreviewableCode(codeBlocks),
    [codeBlocks]
  );
  const combinedHtml = useMemo(
    () => combineCodeBlocks(codeBlocks),
    [codeBlocks]
  );

  if (!canPreview) {
    return null;
  }

  const srcDoc = combinedHtml;

  return (
    <div className="mb-8 rounded-lg border border-black/10 dark:border-white/10 overflow-hidden bg-white dark:bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10">
        <span className="text-xs font-medium text-black/60 dark:text-white/60 uppercase tracking-wide">
          {t("preview")}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setKey((k) => k + 1)}
            className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
            title="Reload preview"
          >
            <RotateCcw className="w-3.5 h-3.5 text-black/60 dark:text-white/60" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
            title={isExpanded ? "Minimize" : "Expand"}
          >
            {isExpanded ? (
              <Minimize2 className="w-3.5 h-3.5 text-black/60 dark:text-white/60" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-black/60 dark:text-white/60" />
            )}
          </button>
        </div>
      </div>

      {/* Iframe */}
      <div
        className={`transition-all duration-300 ${
          isExpanded ? "h-[80vh]" : "h-[300px] sm:h-[400px]"
        }`}
      >
        <iframe
          key={key}
          srcDoc={srcDoc}
          className="w-full h-full border-0 bg-white"
          sandbox="allow-scripts"
          title="Code Preview"
        />
      </div>
    </div>
  );
}
