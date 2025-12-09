"use client";

import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

// Popular programming languages
const LANGUAGES = [
  { value: "plaintext", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "jsx", label: "JSX" },
  { value: "tsx", label: "TSX" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "json", label: "JSON" },
  { value: "xml", label: "XML" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash" },
  { value: "shell", label: "Shell" },
  { value: "powershell", label: "PowerShell" },
  { value: "dockerfile", label: "Dockerfile" },
  { value: "graphql", label: "GraphQL" },
];

export default function CodeBlockComponent({ node, updateAttributes }: any) {
  const t = useTranslations("editor");
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = async () => {
    const text = node.textContent;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLanguageChange = (language: string) => {
    updateAttributes({ language });
  };

  return (
    <NodeViewWrapper
      className="code-block-wrapper relative group my-4 rounded-lg overflow-hidden border border-black/10 dark:border-white/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Toolbar */}
      <div
        className={`flex items-center justify-between px-3 py-2 bg-[#282c34] border-b border-white/10 transition-opacity ${
          isHovered ? "opacity-100" : "opacity-80"
        }`}
      >
        <Select
          value={node.attrs.language}
          onValueChange={handleLanguageChange}
        >
          <SelectTrigger className="w-[180px] h-7 text-xs bg-white/10 border-white/20 text-white/80">
            <SelectValue placeholder={t("selectLanguage")} />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2 text-xs text-white/60 hover:text-white hover:bg-white/10"
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
      <pre
        className={`overflow-x-auto bg-[#282c34] p-4 m-0 language-${node.attrs.language}`}
        data-language={node.attrs.language}
      >
        <code className={`text-sm font-mono language-${node.attrs.language}`}>
          <NodeViewContent />
        </code>
      </pre>
    </NodeViewWrapper>
  );
}
