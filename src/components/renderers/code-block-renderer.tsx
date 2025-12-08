"use client";

import { useState, useEffect, useRef } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-php";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-swift";
import "prismjs/components/prism-kotlin";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-scss";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-powershell";
import "prismjs/components/prism-docker";
import "prismjs/components/prism-graphql";

interface CodeBlockRendererProps {
  language: string;
  code: string;
}

// Language display names (most are language-agnostic)
const getLanguageNames = (t: any): Record<string, string> => ({
  javascript: "JavaScript",
  typescript: "TypeScript",
  jsx: "JSX",
  tsx: "TSX",
  python: "Python",
  java: "Java",
  c: "C",
  cpp: "C++",
  csharp: "C#",
  php: "PHP",
  ruby: "Ruby",
  go: "Go",
  rust: "Rust",
  swift: "Swift",
  kotlin: "Kotlin",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  json: "JSON",
  xml: "XML",
  yaml: "YAML",
  markdown: "Markdown",
  sql: "SQL",
  bash: "Bash",
  shell: "Shell",
  powershell: "PowerShell",
  dockerfile: "Dockerfile",
  graphql: "GraphQL",
  plaintext: t("plainText"),
});

export default function CodeBlockRenderer({
  language,
  code,
}: CodeBlockRendererProps) {
  const t = useTranslations("editor");
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  const LANGUAGE_NAMES = getLanguageNames(t);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayLanguage = LANGUAGE_NAMES[language] || language;

  // Apply syntax highlighting
  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  return (
    <div className="code-block-wrapper relative group my-6 rounded-lg overflow-hidden border border-black/10 dark:border-white/10">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10">
        <span className="text-xs font-medium text-black/60 dark:text-white/60">
          {displayLanguage}
        </span>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              {t("copied")}
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              {t("copy")}
            </>
          )}
        </Button>
      </div>

      {/* Code Content */}
      <pre className="overflow-x-auto bg-black/2 dark:bg-white/2 p-4 m-0">
        <code
          ref={codeRef}
          className={`language-${language} text-sm font-mono block`}
        >
          {code}
        </code>
      </pre>
    </div>
  );
}
