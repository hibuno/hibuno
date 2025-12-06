import { Node, mergeAttributes } from "@tiptap/core";
import { editorDialogActions } from "@/lib/editor-dialog-store";

export interface VideoOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customVideo: {
      setVideo: (options: {
        src: string;
        title?: string;
        width?: string;
        alignment?: "left" | "center" | "right";
      }) => ReturnType;
      deleteVideo: (src: string) => ReturnType;
    };
  }
}

export const CustomVideo = Node.create<VideoOptions>({
  name: "customVideo",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: {
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
          return { width: attributes.width };
        },
      },
      alignment: {
        default: "center",
        parseHTML: (element: Element) =>
          element.getAttribute("data-alignment") || "center",
        renderHTML: (attributes: any) => {
          return { "data-alignment": attributes.alignment };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "video[src]",
      },
      {
        tag: "div[data-video-wrapper] video",
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: any }) {
    const alignment = HTMLAttributes["data-alignment"] || "center";
    const width = HTMLAttributes["width"] || "100%";

    const alignmentClass =
      alignment === "left"
        ? "mr-auto"
        : alignment === "right"
        ? "ml-auto"
        : "mx-auto";

    return [
      "div",
      {
        class: `video-wrapper my-4 ${
          alignment === "center" ? "text-center" : ""
        }`,
        "data-video-wrapper": "true",
      },
      [
        "video",
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
          class: `rounded-lg shadow-md ${alignmentClass}`,
          style: `width: ${width}; max-width: 100%;`,
          controls: "true",
          preload: "metadata",
        }),
      ],
    ];
  },

  addCommands() {
    return {
      setVideo:
        (options: any) =>
        ({ commands, editor }: { commands: any; editor: any }) => {
          const { from } = editor.state.selection;
          const node = editor.state.doc.nodeAt(from);

          if (node && node.type.name === "customVideo") {
            return commands.updateAttributes(this.name, options);
          } else {
            return commands.insertContent({
              type: this.name,
              attrs: options,
            });
          }
        },
      deleteVideo:
        (src: string) =>
        ({ commands, state }: { commands: any; state: any }) => {
          let nodePos: number | null = null;

          state.doc.descendants((node: any, pos: number) => {
            if (
              nodePos === null &&
              node.type.name === "customVideo" &&
              node.attrs.src === src
            ) {
              nodePos = pos;
              return false;
            }
            return true;
          });

          if (nodePos === null) return false;

          // Select the node and delete it using built-in commands
          return (
            commands.setNodeSelection(nodePos) && commands.deleteSelection()
          );
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
      dom.className = `video-wrapper my-4 ${
        node.attrs.alignment === "center" ? "text-center" : ""
      }`;
      dom.setAttribute("data-video-wrapper", "true");

      const video = document.createElement("video");
      video.src = node.attrs.src;
      video.controls = true;
      video.preload = "metadata";
      video.className = "rounded-lg shadow-md";

      const alignment = node.attrs.alignment || "center";
      if (alignment === "left") {
        video.className += " mr-auto";
      } else if (alignment === "right") {
        video.className += " ml-auto";
      } else {
        video.className += " mx-auto block";
      }

      const width = node.attrs.width || "100%";
      video.style.width = width;
      video.style.maxWidth = "100%";

      dom.appendChild(video);

      // Add click handler for editing (on wrapper, not video to avoid conflicts with controls)
      const handleEdit = (e: Event) => {
        // Only trigger edit on double-click to avoid conflicts with video controls
        if (e.type !== "dblclick") return;

        e.preventDefault();
        e.stopPropagation();

        if (getPos !== undefined) {
          const pos = getPos();
          editor.commands.setNodeSelection(pos);
        }

        editorDialogActions.openVideoDialog({
          src: node.attrs.src,
          title: node.attrs.title,
          width: node.attrs.width,
          alignment: node.attrs.alignment,
          pos: getPos !== undefined ? getPos() : undefined,
        });
      };

      dom.addEventListener("dblclick", handleEdit);

      return {
        dom,
        update: (updatedNode: any) => {
          if (updatedNode.type.name !== "customVideo") {
            return false;
          }

          video.src = updatedNode.attrs.src;

          video.className = "rounded-lg shadow-md";
          const newAlignment = updatedNode.attrs.alignment || "center";
          if (newAlignment === "left") {
            video.className += " mr-auto";
          } else if (newAlignment === "right") {
            video.className += " ml-auto";
          } else {
            video.className += " mx-auto block";
          }

          video.style.width = updatedNode.attrs.width || "100%";

          dom.className = `video-wrapper my-4 ${
            newAlignment === "center" ? "text-center" : ""
          }`;

          return true;
        },
      };
    };
  },
});
