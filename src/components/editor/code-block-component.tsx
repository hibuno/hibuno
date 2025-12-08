import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { useState, useRef, useEffect } from "react";
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

// Popular programming languages (labels are language-agnostic)
const getLanguages = (t: any) => [
  { value: "plaintext", label: t("plainText") },
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
  const contentRef = useRef<HTMLDivElement>(null);
  const LANGUAGES = getLanguages(t);

  const handleCopy = async () => {
    const text = node.textContent;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLanguageChange = (language: string) => {
    updateAttributes({ language });
  };

  // Apply syntax highlighting when content changes
  useEffect(() => {
    if (contentRef.current) {
      const codeElement = contentRef.current.querySelector("code");
      if (codeElement) {
        Prism.highlightElement(codeElement);
      }
    }
  }, [node.textContent, node.attrs.language]);

  return (
    <NodeViewWrapper
      className="code-block-wrapper relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Toolbar */}
      <div
        className={`flex items-center justify-between px-3 py-2 bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 transition-opacity ${
          isHovered ? "opacity-100" : "opacity-60"
        }`}
      >
        <Select
          value={node.attrs.language}
          onValueChange={handleLanguageChange}
        >
          <SelectTrigger className="w-[180px] h-7 text-xs">
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
          className="h-7 px-2 text-xs"
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
        className="relative overflow-x-auto bg-black/2 dark:bg-white/2 p-4 rounded-b-lg"
        data-language={node.attrs.language}
      >
        <code
          ref={contentRef}
          className={`language-${node.attrs.language} text-sm font-mono`}
        >
          <NodeViewContent />
        </code>
      </pre>
    </NodeViewWrapper>
  );
}
