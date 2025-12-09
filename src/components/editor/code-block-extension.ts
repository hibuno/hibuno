import TiptapCodeBlock from "@tiptap/extension-code-block";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { findChildren } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import type { Node as ProsemirrorNode } from "@tiptap/pm/model";
import { common, createLowlight } from "lowlight";
import CodeBlockNodeView from "./code-block-node-view";

// Create lowlight instance with common languages
const lowlight = createLowlight(common);

export interface CodeBlockOptions {
  HTMLAttributes?: Record<string, unknown>;
  defaultLanguage: string | null | undefined;
}

const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  rb: "ruby",
  sh: "bash",
  shell: "bash",
  yml: "yaml",
  docker: "dockerfile",
  html: "xml",
  markup: "xml",
  svg: "xml",
};

// One Dark theme colors
function getTokenStyle(classes: string[]): string {
  if (
    classes.some((c) =>
      ["comment", "prolog", "doctype", "cdata", "hljs-comment"].includes(c)
    )
  ) {
    return "color: #5c6370; font-style: italic;";
  }
  if (
    classes.some((c) =>
      [
        "keyword",
        "atrule",
        "attr-value",
        "hljs-keyword",
        "hljs-selector-tag",
      ].includes(c)
    )
  ) {
    return "color: #c678dd;";
  }
  if (
    classes.some((c) =>
      ["function", "class-name", "hljs-title", "hljs-section"].includes(c)
    )
  ) {
    return "color: #61afef;";
  }
  if (
    classes.some((c) =>
      [
        "string",
        "char",
        "builtin",
        "inserted",
        "selector",
        "attr-name",
        "hljs-string",
        "hljs-addition",
      ].includes(c)
    )
  ) {
    return "color: #98c379;";
  }
  if (
    classes.some((c) =>
      [
        "number",
        "boolean",
        "constant",
        "symbol",
        "deleted",
        "hljs-number",
        "hljs-literal",
      ].includes(c)
    )
  ) {
    return "color: #d19a66;";
  }
  if (
    classes.some((c) =>
      ["operator", "entity", "url", "hljs-operator"].includes(c)
    )
  ) {
    return "color: #56b6c2;";
  }
  if (
    classes.some((c) =>
      [
        "variable",
        "regex",
        "important",
        "hljs-variable",
        "hljs-template-variable",
      ].includes(c)
    )
  ) {
    return "color: #e06c75;";
  }
  if (
    classes.some((c) =>
      ["property", "tag", "hljs-attr", "hljs-attribute"].includes(c)
    )
  ) {
    return "color: #e06c75;";
  }
  if (classes.some((c) => ["punctuation", "hljs-punctuation"].includes(c))) {
    return "color: #abb2bf;";
  }
  if (classes.some((c) => ["hljs-built_in", "hljs-type"].includes(c))) {
    return "color: #e5c07b;";
  }
  if (classes.some((c) => ["hljs-params"].includes(c))) {
    return "color: #abb2bf;";
  }
  return "";
}

interface HastNode {
  type: "element" | "text";
  tagName?: string;
  properties?: { className?: string[] };
  children?: HastNode[];
  value?: string;
}

function flattenNodes(
  nodes: HastNode[],
  classes: string[] = []
): { text: string; classes: string[] }[] {
  const result: { text: string; classes: string[] }[] = [];

  for (const node of nodes) {
    if (node.type === "text" && node.value) {
      result.push({ text: node.value, classes: [...classes] });
    } else if (node.type === "element" && node.children) {
      const newClasses = [...classes, ...(node.properties?.className || [])];
      result.push(...flattenNodes(node.children, newClasses));
    }
  }

  return result;
}

function getDecorations(
  doc: ProsemirrorNode,
  name: string,
  defaultLanguage: string | null | undefined
): DecorationSet {
  const decorations: Decoration[] = [];

  findChildren(doc, (node) => node.type.name === name).forEach((block) => {
    let from = block.pos + 1;
    const language =
      block.node.attrs.language || defaultLanguage || "plaintext";
    const textContent = block.node.textContent;

    if (!textContent || language === "plaintext") return;

    const lang = LANGUAGE_ALIASES[language] || language;

    // Check if language is registered
    if (!lowlight.registered(lang)) return;

    let tree: { children: HastNode[] };
    try {
      tree = lowlight.highlight(lang, textContent) as { children: HastNode[] };
    } catch {
      return;
    }

    const tokens = flattenNodes(tree.children);

    for (const token of tokens) {
      const to = from + token.text.length;
      if (token.classes.length > 0 && from < to && to <= doc.content.size + 1) {
        const style = getTokenStyle(token.classes);
        if (style) {
          decorations.push(
            Decoration.inline(from, to, {
              class: token.classes.join(" "),
              style,
            })
          );
        }
      }
      from = to;
    }
  });

  return DecorationSet.create(doc, decorations);
}

export const CodeBlock = TiptapCodeBlock.extend<CodeBlockOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      defaultLanguage: "javascript",
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      language: {
        default: this.options.defaultLanguage || "plaintext",
        parseHTML: (element) =>
          element.getAttribute("data-language") ||
          element.querySelector("code")?.getAttribute("data-language") ||
          element
            .querySelector("code")
            ?.className.match(/language-(\w+)/)?.[1] ||
          this.options.defaultLanguage ||
          "plaintext",
        renderHTML: (attributes) => ({
          "data-language": attributes.language,
          class: `language-${attributes.language}`,
        }),
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockNodeView);
  },

  addProseMirrorPlugins() {
    const plugins = this.parent?.() || [];
    const extensionName = this.name;
    const defaultLang = this.options.defaultLanguage;

    if (typeof window !== "undefined") {
      const pluginKey = new PluginKey("lowlight-highlight");
      const highlightPlugin: Plugin<DecorationSet> = new Plugin({
        key: pluginKey,
        state: {
          init: (_, { doc }) => getDecorations(doc, extensionName, defaultLang),
          apply: (transaction, decorationSet, _oldState, newState) => {
            if (transaction.docChanged || transaction.steps.length > 0) {
              return getDecorations(newState.doc, extensionName, defaultLang);
            }
            return decorationSet.map(transaction.mapping, transaction.doc);
          },
        },
        props: {
          decorations(state): DecorationSet | undefined {
            return pluginKey.getState(state);
          },
        },
      });
      plugins.push(highlightPlugin);
    }

    return plugins;
  },
});
