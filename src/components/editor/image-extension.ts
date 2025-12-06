import { mergeAttributes, Node } from "@tiptap/core";
import { editorDialogActions } from "@/lib/editor-dialog-store";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customImage: {
      setImage: (options: {
        src: string;
        alt?: string;
        title?: string;
        width?: string;
        caption?: string;
        alignment?: "left" | "center" | "right";
      }) => ReturnType;
      deleteImage: (src: string) => ReturnType;
    };
  }
}

export const CustomImage = Node.create({
  name: "customImage",

  group: "block",

  atom: true,

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute("src"),
        renderHTML: (attributes) => {
          if (!attributes.src) return {};
          return { src: attributes.src };
        },
      },
      alt: {
        default: null,
        parseHTML: (element) => element.getAttribute("alt"),
        renderHTML: (attributes) => {
          if (!attributes.alt) return {};
          return { alt: attributes.alt };
        },
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute("title"),
        renderHTML: (attributes) => {
          if (!attributes.title) return {};
          return { title: attributes.title };
        },
      },
      width: {
        default: "100%",
        parseHTML: (element) => {
          return element.getAttribute("data-width") || "100%";
        },
        renderHTML: (attributes) => {
          return { "data-width": attributes.width };
        },
      },
      caption: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-caption"),
        renderHTML: (attributes) => {
          if (!attributes.caption) return {};
          return { "data-caption": attributes.caption };
        },
      },
      alignment: {
        default: "center",
        parseHTML: (element) =>
          element.getAttribute("data-alignment") || "center",
        renderHTML: (attributes) => {
          return { "data-alignment": attributes.alignment };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes)];
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands, editor }) => {
          const { from } = editor.state.selection;
          const node = editor.state.doc.nodeAt(from);

          if (node && node.type.name === "customImage") {
            return commands.updateAttributes(this.name, options);
          }

          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
      deleteImage:
        (src) =>
        ({ chain, state }) => {
          let nodePos: number | null = null;

          state.doc.descendants((node, pos) => {
            if (
              nodePos === null &&
              node.type.name === "customImage" &&
              node.attrs.src === src
            ) {
              nodePos = pos;
              return false;
            }
            return true;
          });

          if (nodePos === null) return false;

          return chain().setNodeSelection(nodePos).deleteSelection().run();
        },
    };
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement("div");
      dom.className = `image-wrapper my-4 ${
        node.attrs.alignment === "center" ? "text-center" : ""
      }`;
      dom.contentEditable = "false";

      const img = document.createElement("img");
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || node.attrs.caption || "Image";
      img.className = "rounded-lg shadow-md";
      img.loading = "lazy";
      img.decoding = "async";

      const alignment = node.attrs.alignment || "center";
      if (alignment === "left") {
        img.className += " float-left mr-4";
      } else if (alignment === "right") {
        img.className += " float-right ml-4";
      } else {
        img.className += " mx-auto block";
      }

      const width = node.attrs.width;
      if (width && width !== "100%") {
        img.style.width = width;
        img.style.height = "auto";
      }

      if (node.attrs.caption) {
        const caption = document.createElement("p");
        caption.className = "text-sm text-neutral-600 italic mt-2";
        caption.textContent = node.attrs.caption;
        dom.appendChild(img);
        dom.appendChild(caption);
      } else {
        dom.appendChild(img);
      }

      const handleEdit = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();

        const pos = typeof getPos === "function" ? getPos() : undefined;
        if (pos !== undefined) {
          editor.commands.setNodeSelection(pos);
        }

        editorDialogActions.openImageDialog({
          src: node.attrs.src,
          alt: node.attrs.alt,
          caption: node.attrs.caption,
          width: node.attrs.width,
          alignment: node.attrs.alignment,
          pos: pos !== undefined ? pos : undefined,
        });
      };

      img.addEventListener("click", handleEdit);
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", node.attrs.alt || "Edit image");
      img.style.cursor = "pointer";

      img.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleEdit(e);
        }
      });

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== "customImage") {
            return false;
          }

          img.src = updatedNode.attrs.src;
          img.alt = updatedNode.attrs.alt || "";

          img.className = "rounded-lg shadow-md";
          const newAlignment = updatedNode.attrs.alignment || "center";
          if (newAlignment === "left") {
            img.className += " float-left mr-4";
          } else if (newAlignment === "right") {
            img.className += " float-right ml-4";
          } else {
            img.className += " mx-auto block";
          }

          if (updatedNode.attrs.width && updatedNode.attrs.width !== "100%") {
            img.style.width = updatedNode.attrs.width;
          } else {
            img.style.width = "";
          }

          const existingCaption = dom.querySelector("p");
          if (updatedNode.attrs.caption) {
            if (existingCaption) {
              existingCaption.textContent = updatedNode.attrs.caption;
            } else {
              const caption = document.createElement("p");
              caption.className = "text-sm text-neutral-600 italic mt-2";
              caption.textContent = updatedNode.attrs.caption;
              dom.appendChild(caption);
            }
          } else if (existingCaption) {
            existingCaption.remove();
          }

          return true;
        },
      };
    };
  },
});
