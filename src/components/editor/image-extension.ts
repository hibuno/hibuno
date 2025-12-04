import { mergeAttributes } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import { editorDialogActions } from "@/lib/editor-dialog-store";

export interface ImageOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, any>;
}

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
    };
  }
}

export const CustomImage = Image.extend({
  name: "customImage",

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: "100%",
        parseHTML: (element: Element) => {
          const htmlElement = element as HTMLElement;
          return (
            htmlElement.getAttribute("width") ||
            htmlElement.style.width ||
            "100%"
          );
        },
        renderHTML: (attributes: any) => {
          return {
            width: attributes.width,
          };
        },
      },
      caption: {
        default: null,
        parseHTML: (element: Element) => element.getAttribute("data-caption"),
        renderHTML: (attributes: any) => {
          if (!attributes.caption) return {};
          return {
            "data-caption": attributes.caption,
          };
        },
      },
      alignment: {
        default: "center",
        parseHTML: (element: Element) =>
          element.getAttribute("data-alignment") || "center",
        renderHTML: (attributes: any) => {
          return {
            "data-alignment": attributes.alignment,
          };
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

  renderHTML({ HTMLAttributes }: { HTMLAttributes: any }) {
    const alignment = HTMLAttributes["data-alignment"] || "center";
    const caption = HTMLAttributes["data-caption"];
    const width = HTMLAttributes["width"];

    const alignmentClass =
      alignment === "left"
        ? "float-left mr-4"
        : alignment === "right"
        ? "float-right ml-4"
        : "mx-auto block";

    // Apply width as style attribute if specified
    const imgAttributes: any = {
      class: `rounded-lg shadow-md ${alignmentClass}`,
    };

    if (width && width !== "100%") {
      imgAttributes.style = `width: ${width}; height: auto;`;
    }

    const children: any[] = [
      [
        "img",
        mergeAttributes(
          this.options.HTMLAttributes,
          HTMLAttributes,
          imgAttributes
        ),
      ],
    ];

    if (caption) {
      children.push([
        "p",
        { class: "text-sm text-gray-600 italic mt-2" },
        caption,
      ]);
    }

    return [
      "div",
      {
        class: `image-wrapper my-4 ${
          alignment === "center" ? "text-center" : ""
        }`,
      },
      ...children,
    ];
  },

  addCommands() {
    return {
      setImage:
        (options: any) =>
        ({ commands, editor }: { commands: any; editor: any }) => {
          // Check if we're updating an existing image
          const { from } = editor.state.selection;
          const node = editor.state.doc.nodeAt(from);

          if (node && node.type.name === "customImage") {
            // Update existing image
            return commands.updateAttributes(this.name, options);
          } else {
            // Insert new image
            return commands.insertContent({
              type: this.name,
              attrs: options,
            });
          }
        },
    };
  },

  addNodeView() {
    return ({
      node,
      getPos,
      editor,
    }: {
      node: any;
      getPos: () => number | undefined;
      editor: any;
    }) => {
      const dom = document.createElement("div");
      dom.className = `image-wrapper my-4 ${
        node.attrs.alignment === "center" ? "text-center" : ""
      }`;

      const img = document.createElement("img");
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || "";
      img.className = "rounded-lg shadow-md";

      // Apply alignment
      const alignment = node.attrs.alignment || "center";
      if (alignment === "left") {
        img.className += " float-left mr-4";
      } else if (alignment === "right") {
        img.className += " float-right ml-4";
      } else {
        img.className += " mx-auto block";
      }

      // Apply width
      const width = node.attrs.width;
      if (width && width !== "100%") {
        img.style.width = width;
        img.style.height = "auto";
      }

      // Add caption if present
      if (node.attrs.caption) {
        const caption = document.createElement("p");
        caption.className = "text-sm text-gray-600 italic mt-2";
        caption.textContent = node.attrs.caption;
        dom.appendChild(img);
        dom.appendChild(caption);
      } else {
        dom.appendChild(img);
      }

      // Add click handler for editing
      const handleEdit = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();

        if (getPos !== undefined) {
          const pos = getPos();
          editor.commands.setNodeSelection(pos);
        }

        // Use Valtio state to trigger image edit dialog
        editorDialogActions.openImageDialog({
          src: node.attrs.src,
          alt: node.attrs.alt,
          caption: node.attrs.caption,
          width: node.attrs.width,
          alignment: node.attrs.alignment,
          pos: getPos(),
          nodeType: node.type,
        });
      };

      img.addEventListener("click", handleEdit);

      // Add keyboard accessibility
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", node.attrs.alt || "Edit image");

      img.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleEdit(e);
        }
      });

      // Make image cursor pointer to indicate it's clickable
      img.style.cursor = "pointer";

      return {
        dom,
        update: (updatedNode: any) => {
          if (updatedNode.type !== node.type) {
            return false;
          }

          // Update image attributes
          img.src = updatedNode.attrs.src;
          img.alt = updatedNode.attrs.alt || "";

          // Update alignment class
          img.className = img.className.replace(/float-(left|right)/g, "");
          const newAlignment = updatedNode.attrs.alignment || "center";
          if (newAlignment === "left") {
            img.className += " float-left mr-4";
          } else if (newAlignment === "right") {
            img.className += " float-right ml-4";
          } else {
            img.className += " mx-auto block";
          }

          // Update width
          if (updatedNode.attrs.width && updatedNode.attrs.width !== "100%") {
            img.style.width = updatedNode.attrs.width;
          } else {
            img.style.width = "";
          }

          // Update caption
          const existingCaption = dom.querySelector("p");
          if (updatedNode.attrs.caption) {
            if (existingCaption) {
              existingCaption.textContent = updatedNode.attrs.caption;
            } else {
              const caption = document.createElement("p");
              caption.className = "text-sm text-gray-600 italic mt-2";
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
