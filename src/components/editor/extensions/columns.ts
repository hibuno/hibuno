import { mergeAttributes, Node } from "@tiptap/core";

export interface ColumnsOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    columns: {
      setColumns: (count?: 2 | 3 | 4 | 5 | 6) => ReturnType;
      setTwoColumns: () => ReturnType;
      setThreeColumns: () => ReturnType;
      setFourColumns: () => ReturnType;
      setFiveColumns: () => ReturnType;
      setSixColumns: () => ReturnType;
      addColumn: (position?: number) => ReturnType;
      removeColumn: (position?: number) => ReturnType;
      resizeColumn: (position: number, width: string) => ReturnType;
    };
  }
}

export const Columns = Node.create<ColumnsOptions>({
  name: "columns",

  group: "block",

  content: "column{1,6}",

  isolating: false,

  addAttributes() {
    return {
      count: {
        default: 2,
        parseHTML: (element) =>
          parseInt(element.getAttribute("data-count") || "2"),
        renderHTML: (attributes) => {
          return {
            "data-count": attributes.count,
          };
        },
      },
      widths: {
        default: null,
        parseHTML: (element) => {
          const widths = element.getAttribute("data-widths");
          return widths ? JSON.parse(widths) : null;
        },
        renderHTML: (attributes) => {
          if (attributes.widths) {
            return {
              "data-widths": JSON.stringify(attributes.widths),
            };
          }
          return {};
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="columns"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const count = HTMLAttributes["data-count"] || 2;
    const widths = HTMLAttributes["data-widths"];

    let gridTemplateColumns = "";
    if (widths && Array.isArray(widths) && widths.length === count) {
      gridTemplateColumns = widths.join(" ");
    } else {
      gridTemplateColumns = `repeat(${count}, 1fr)`;
    }

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "columns",
        class: "columns-wrapper grid gap-4 my-4",
        style: `grid-template-columns: ${gridTemplateColumns}`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setColumns:
        (count = 2) =>
        ({ commands, editor }) => {
          // Check if we're updating existing columns
          const { from } = editor.state.selection;
          const node = editor.state.doc.nodeAt(from);

          if (node && node.type.name === "columns") {
            // Update existing columns
            return commands.updateAttributes(this.name, { count });
          } else {
            // Insert new columns
            const columns = Array.from({ length: count }, () => ({
              type: "column",
              content: [{ type: "paragraph" }],
            }));

            return commands.insertContent({
              type: this.name,
              attrs: { count },
              content: columns,
            });
          }
        },
      setTwoColumns:
        () =>
        ({ commands }) => {
          return commands.setColumns(2);
        },
      setThreeColumns:
        () =>
        ({ commands }) => {
          return commands.setColumns(3);
        },
      setFourColumns:
        () =>
        ({ commands }) => {
          return commands.setColumns(4);
        },
      setFiveColumns:
        () =>
        ({ commands }) => {
          return commands.setColumns(5);
        },
      setSixColumns:
        () =>
        ({ commands }) => {
          return commands.setColumns(6);
        },
      addColumn:
        (_position) =>
        ({ commands: _commands, editor, tr, dispatch }) => {
          const { from } = editor.state.selection;
          const node = editor.state.doc.nodeAt(from);

          if (node && node.type.name === "columns") {
            const currentCount = node.attrs.count || 2;
            const newCount = Math.min(currentCount + 1, 6);

            if (newCount > currentCount && dispatch) {
              // Create new content with additional column
              const newColumns = Array.from(
                { length: newCount },
                (_, index) => {
                  if (index < node.childCount) {
                    // Keep existing column
                    return node.child(index).toJSON();
                  } else {
                    // Add new column
                    return {
                      type: "column",
                      content: [{ type: "paragraph" }],
                    };
                  }
                },
              );

              // Replace the entire node with new content
              const columnsNodeType = editor.state.schema.nodes.columns;
              if (!columnsNodeType) return false;

              const newNode = columnsNodeType.create(
                { count: newCount },
                newColumns,
              );

              tr.replaceWith(from, from + node.nodeSize, newNode);
              dispatch(tr);
              return true;
            }
          }

          return false;
        },
      removeColumn:
        (_position) =>
        ({ commands: _commands, editor, tr, dispatch }) => {
          const { from } = editor.state.selection;
          const node = editor.state.doc.nodeAt(from);

          if (node && node.type.name === "columns") {
            const currentCount = node.attrs.count || 2;
            const newCount = Math.max(currentCount - 1, 1);

            if (newCount < currentCount && dispatch) {
              // Create new content with one less column
              const newColumns = Array.from(
                { length: newCount },
                (_, index) => {
                  if (index < node.childCount - 1) {
                    // Keep existing column
                    return node.child(index).toJSON();
                  }
                },
              );

              // Replace the entire node with new content
              const columnsNodeType = editor.state.schema.nodes.columns;
              if (!columnsNodeType) return false;

              const newNode = columnsNodeType.create(
                { count: newCount },
                newColumns,
              );

              tr.replaceWith(from, from + node.nodeSize, newNode);
              dispatch(tr);
              return true;
            }
          }

          return false;
        },
      resizeColumn:
        (position, width) =>
        ({ commands, editor }) => {
          const { from } = editor.state.selection;
          const node = editor.state.doc.nodeAt(from);

          if (node && node.type.name === "columns") {
            const currentWidths = node.attrs.widths || [];
            const newWidths = [...currentWidths];

            if (position >= 0 && position < newWidths.length) {
              newWidths[position] = width;
              return commands.updateAttributes(this.name, {
                widths: newWidths,
              });
            } else if (position >= 0 && position < node.attrs.count) {
              // Initialize widths array if it doesn't exist
              const widths = Array(node.attrs.count).fill("1fr");
              widths[position] = width;
              return commands.updateAttributes(this.name, { widths });
            }
          }

          return false;
        },
    };
  },
});

export const Column = Node.create({
  name: "column",

  content: "block+",

  isolating: false,

  addAttributes() {
    return {
      width: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute("data-width") || element.style.width || null,
        renderHTML: (attributes) => {
          if (attributes.width) {
            return {
              "data-width": attributes.width,
              style: `width: ${attributes.width}`,
            };
          }
          return {};
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="column"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "column",
        class:
          "column p-4 border border-gray-200 rounded-lg bg-gray-50 min-h-[100px] relative",
      }),
      0,
    ];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement("div");
      dom.className =
        "column p-4 border border-gray-200 rounded-lg bg-gray-50 min-h-[100px] relative group flex-1";

      // Add resize handle
      const resizeHandle = document.createElement("div");
      resizeHandle.className =
        "absolute -right-1 top-0 bottom-0 w-2 bg-blue-500 opacity-0 group-hover:opacity-100 cursor-col-resize transition-opacity z-10";
      resizeHandle.style.opacity = "0";

      let isResizing = false;
      let startX = 0;
      let startWidth = 0;

      const handleMouseDown = (e: MouseEvent) => {
        isResizing = true;
        startX = e.clientX;
        startWidth = dom.offsetWidth;
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
        e.preventDefault();
        e.stopPropagation();
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing) return;

        const diff = e.clientX - startX;
        const newWidth = Math.max(100, startWidth + diff);

        dom.style.width = `${newWidth}px`;
        dom.style.flexBasis = `${newWidth}px`;
        dom.style.flexShrink = "0";
        dom.style.flexGrow = "0";

        e.preventDefault();
        e.stopPropagation();
      };

      const handleMouseUp = () => {
        if (isResizing) {
          isResizing = false;
          document.body.style.cursor = "";
          document.body.style.userSelect = "";

          // Update the node attributes with the new width
          if (getPos !== undefined) {
            const currentWidth = dom.style.width;
            if (currentWidth) {
              editor.commands.resizeColumn(0, currentWidth);
            }
          }
        }
      };

      resizeHandle.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      dom.appendChild(resizeHandle);

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type !== node.type) {
            return false;
          }

          // Update width if changed
          if (
            updatedNode.attrs.width &&
            updatedNode.attrs.width !== node.attrs.width
          ) {
            dom.style.width = updatedNode.attrs.width;
            dom.style.flexBasis = updatedNode.attrs.width;
          }

          return true;
        },
        destroy: () => {
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
        },
      };
    };
  },
});
