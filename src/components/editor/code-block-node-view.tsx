"use client";

import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LANGUAGES = [
  { value: "plaintext", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
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
  { value: "xml", label: "HTML/XML" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash" },
  { value: "powershell", label: "PowerShell" },
  { value: "dockerfile", label: "Dockerfile" },
  { value: "graphql", label: "GraphQL" },
];

export default function CodeBlockNodeView({
  node,
  updateAttributes,
}: NodeViewProps) {
  const [copied, setCopied] = useState(false);
  const language = node.attrs.language || "plaintext";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(node.textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <NodeViewWrapper className="code-block-wrapper relative group my-4 rounded-lg overflow-hidden border border-border not-prose">
      <div
        className="code-block-toolbar flex items-center justify-between px-3 py-2 bg-[#282c34] border-b border-white/10 select-none"
        contentEditable={false}
      >
        <Select
          value={language}
          onValueChange={(value) => updateAttributes({ language: value })}
        >
          <SelectTrigger className="h-7 w-auto min-w-[120px] px-2 text-xs bg-white/10 border-white/20 text-white/80 hover:bg-white/20 focus:ring-0 focus:ring-offset-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={handleCopy}
          className="h-7 px-2 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded flex items-center gap-1 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>

      <pre
        className={`code-block-pre overflow-x-auto bg-[#282c34] p-4 m-0 language-${language}`}
        data-language={language}
        spellCheck={false}
      >
        <code
          className={`code-block-code language-${language} outline-none block min-h-[1.5em]`}
          style={{
            fontFamily:
              "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
            fontSize: "0.875rem",
            lineHeight: "1.6",
            color: "#abb2bf",
            whiteSpace: "pre",
          }}
        >
          <NodeViewContent />
        </code>
      </pre>
    </NodeViewWrapper>
  );
}
