"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockRendererProps {
  language: string;
  code: string;
}

const LANGUAGE_NAMES: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  jsx: "JSX",
  tsx: "TSX",
  php: "PHP",
  python: "Python",
  java: "Java",
  go: "Go",
  rust: "Rust",
  sql: "SQL",
  bash: "Bash",
  css: "CSS",
  scss: "SCSS",
  json: "JSON",
  html: "HTML",
  xml: "XML",
  yaml: "YAML",
  markdown: "Markdown",
  graphql: "GraphQL",
  docker: "Dockerfile",
  plaintext: "Plain Text",
};

export default function CodeBlockRenderer({
  language,
  code,
}: CodeBlockRendererProps) {
  const [copied, setCopied] = useState(false);
  const displayLanguage = LANGUAGE_NAMES[language] || language || "Plain Text";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper relative group my-6 rounded-lg overflow-hidden border border-black/10 dark:border-white/10">
      <div className="flex items-center justify-between px-4 py-2 bg-[#282c34] border-b border-white/10">
        <span className="text-xs font-medium text-white/80 uppercase tracking-wide">
          {displayLanguage}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2 text-xs text-white/60 hover:text-white hover:bg-white/10"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "#282c34",
          fontSize: "0.875rem",
          lineHeight: "1.6",
        }}
        codeTagProps={{
          style: {
            fontFamily:
              'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
          },
        }}
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  );
}
