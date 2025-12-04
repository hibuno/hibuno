import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import DetailsComponent from "./details-node-view";

export interface DetailsOptions {
  HTMLAttributes: Record<string, any>;
}

export interface DetailsAttributes {
  summary: string;
  open: boolean;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    details: {
      setDetails: (attributes?: Partial<DetailsAttributes>) => ReturnType;
      toggleDetails: () => ReturnType;
      updateDetails: (attributes: Partial<DetailsAttributes>) => ReturnType;
    };
  }
}

export const Details = Node.create<DetailsOptions>({
  name: "details",

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
      summary: {
        default: "Click to expand",
        parseHTML: (element) =>
          element.getAttribute("data-summary") || "Click to expand",
        renderHTML: (attributes) => ({
          "data-summary": attributes.summary,
        }),
      },
      open: {
        default: false,
        parseHTML: (element) => element.hasAttribute("open"),
        renderHTML: (attributes) => {
          if (attributes.open) {
            return { open: "" };
          }
          return {};
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "details",
        priority: 51,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "details",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "collapsible",
      }),
      ["summary", {}, HTMLAttributes["data-summary"] || "Click to expand"],
      ["div", { class: "collapsible-content" }, 0],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DetailsComponent);
  },

  addCommands() {
    return {
      setDetails:
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
      toggleDetails:
        () =>
        ({ commands }) => {
          return commands.toggleWrap(this.name);
        },
      updateDetails:
        (attributes) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, attributes);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-d": () =>
        this.editor.commands.setDetails({ summary: "Click to expand", open: false }),
    };
  },
});
