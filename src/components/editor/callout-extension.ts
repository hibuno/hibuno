import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import CalloutComponent from "./callout-node-view";

export interface CalloutOptions {
  HTMLAttributes: Record<string, any>;
}

export interface CalloutAttributes {
  type: "info" | "warning" | "success" | "error" | "tip";
  title?: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (attributes?: Partial<CalloutAttributes>) => ReturnType;
      toggleCallout: (attributes?: Partial<CalloutAttributes>) => ReturnType;
      updateCallout: (attributes: Partial<CalloutAttributes>) => ReturnType;
    };
  }
}

export const Callout = Node.create<CalloutOptions>({
  name: "callout",

  group: "block",

  content: "block+",

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      type: {
        default: "info",
        parseHTML: (element) =>
          element.getAttribute("data-type") || "info",
        renderHTML: (attributes) => ({
          "data-type": attributes.type,
        }),
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-title"),
        renderHTML: (attributes) => {
          if (!attributes.title) return {};
          return {
            "data-title": attributes.title,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="info"]',
        priority: 51,
      },
      {
        tag: 'div[data-type="warning"]',
        priority: 51,
      },
      {
        tag: 'div[data-type="success"]',
        priority: 51,
      },
      {
        tag: 'div[data-type="error"]',
        priority: 51,
      },
      {
        tag: 'div[data-type="tip"]',
        priority: 51,
      },
      {
        tag: "div.callout",
        getAttrs: (element) => {
          if (typeof element === "string") return false;
          const type = element.getAttribute("data-type");
          if (!type) return false;
          return { type };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: `callout callout-${HTMLAttributes["data-type"]}`,
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutComponent);
  },

  addCommands() {
    return {
      setCallout:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
            content: [
              {
                type: "paragraph",
              },
            ],
          });
        },
      toggleCallout:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, attributes);
        },
      updateCallout:
        (attributes) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, attributes);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-c": () => this.editor.commands.toggleCallout({ type: "info" }),
    };
  },
});
