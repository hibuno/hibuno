import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export interface NodeInserterOptions {
  className: string;
  // Custom node types that should show the insert line
  customNodeTypes: string[];
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    nodeInserter: {
      insertParagraphAt: (pos: number) => ReturnType;
    };
  }
}

// Built-in text/block nodes that should NOT show the insert line
const BUILT_IN_NODE_TYPES = [
  "paragraph",
  "text",
  "heading",
  "bulletList",
  "orderedList",
  "listItem",
  "blockquote",
  "hardBreak",
  "doc",
];

// Store the current insert position globally so click handler can access it
let currentInsertPos: number | null = null;
let currentInsertLine: HTMLElement | null = null;

export const NodeInserter = Extension.create<NodeInserterOptions>({
  name: "nodeInserter",

  addOptions() {
    return {
      className: "node-inserter-line",
      // Custom node types that should show the insert line
      customNodeTypes: [
        "customImage",
        "customVideo",
        "codeBlock",
        "callout",
        "details",
        "horizontalRule",
      ],
    };
  },

  addCommands() {
    return {
      insertParagraphAt:
        (pos: number) =>
        ({ chain }) => {
          return chain()
            .insertContentAt(pos, { type: "paragraph" })
            .setTextSelection(pos + 1)
            .run();
        },
    };
  },

  addProseMirrorPlugins() {
    const { editor } = this;

    // Click handler function
    const handleInsertClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (currentInsertPos === null) return;

      const pos = currentInsertPos;

      // Remove the line
      if (currentInsertLine) {
        currentInsertLine.remove();
        currentInsertLine = null;
      }
      currentInsertPos = null;

      // Insert paragraph and focus
      editor
        .chain()
        .focus()
        .insertContentAt(pos, { type: "paragraph" })
        .setTextSelection(pos + 1)
        .run();
    };

    return [
      new Plugin({
        key: new PluginKey("nodeInserter"),
        props: {
          handleDOMEvents: {
            mousemove(view, event) {
              const { state } = view;
              const editorRect = view.dom.getBoundingClientRect();
              const mouseY = event.clientY;
              const mouseX = event.clientX;

              // Don't remove line if mouse is over it
              const target = event.target as HTMLElement;
              if (target?.classList?.contains("node-insert-line")) {
                return false;
              }

              // Remove existing insert lines (except current one)
              const existingLines =
                view.dom.parentElement?.querySelectorAll(".node-insert-line");
              existingLines?.forEach((line) => {
                if (line !== currentInsertLine) {
                  line.remove();
                }
              });

              // Check if mouse is within editor bounds
              if (
                mouseY < editorRect.top ||
                mouseY > editorRect.bottom ||
                mouseX < editorRect.left ||
                mouseX > editorRect.right
              ) {
                if (currentInsertLine) {
                  currentInsertLine.remove();
                  currentInsertLine = null;
                  currentInsertPos = null;
                }
                return false;
              }

              // Find the position at the mouse coordinates
              const pos = view.posAtCoords({ left: mouseX, top: mouseY });
              if (!pos) return false;

              try {
                // Resolve position safely
                const $pos = state.doc.resolve(pos.pos);

                // Skip if at document root level
                if ($pos.depth < 1) return false;

                // Find the top-level block node (depth 1)
                const depth = Math.min($pos.depth, 1);
                if (depth < 1) return false;

                const nodeStart = $pos.before(depth);
                const nodeEnd = $pos.after(depth);

                // Get the node at this position
                const node = state.doc.nodeAt(nodeStart);
                if (!node) return false;

                // Only show insert line for custom nodes, not built-in text nodes
                const isCustomNode = !BUILT_IN_NODE_TYPES.includes(
                  node.type.name
                );
                if (!isCustomNode) {
                  if (currentInsertLine) {
                    currentInsertLine.remove();
                    currentInsertLine = null;
                    currentInsertPos = null;
                  }
                  return false;
                }

                // Get the DOM node
                const domNode = view.nodeDOM(nodeStart);
                if (!domNode || !(domNode instanceof HTMLElement)) return false;

                const nodeRect = domNode.getBoundingClientRect();
                const threshold = 24; // pixels from edge to show insert line

                // Check if near top or bottom of node (removed middle detection)
                const nearTop = mouseY < nodeRect.top + threshold;
                const nearBottom = mouseY > nodeRect.bottom - threshold;

                if (!nearTop && !nearBottom) {
                  if (currentInsertLine) {
                    currentInsertLine.remove();
                    currentInsertLine = null;
                    currentInsertPos = null;
                  }
                  return false;
                }

                // Calculate position and insert point
                let insertPos: number;
                let topPosition: number;
                if (nearTop) {
                  topPosition = nodeRect.top - editorRect.top - 2;
                  insertPos = nodeStart;
                } else {
                  topPosition = nodeRect.bottom - editorRect.top - 2;
                  insertPos = nodeEnd;
                }

                // Update global position
                currentInsertPos = insertPos;

                // Reuse existing line or create new one
                if (!currentInsertLine) {
                  const insertLine = document.createElement("div");
                  insertLine.className = "node-insert-line";
                  insertLine.style.cssText = `
                    position: absolute;
                    left: 16px;
                    right: 16px;
                    height: 4px;
                    background: var(--border, #d4a853);
                    border-radius: 2px;
                    opacity: 0.7;
                    cursor: pointer;
                    z-index: 100;
                    pointer-events: auto;
                    transition: height 0.1s, opacity 0.1s;
                  `;

                  insertLine.addEventListener("mouseenter", () => {
                    insertLine.style.opacity = "1";
                    insertLine.style.height = "6px";
                  });

                  insertLine.addEventListener("mouseleave", () => {
                    insertLine.style.opacity = "0.7";
                    insertLine.style.height = "4px";
                  });

                  insertLine.addEventListener("click", handleInsertClick);

                  currentInsertLine = insertLine;

                  // Add to editor container
                  const editorContainer = view.dom.parentElement;
                  if (editorContainer) {
                    editorContainer.style.position = "relative";
                    editorContainer.appendChild(insertLine);
                  }
                }

                // Update position
                currentInsertLine.style.top = `${topPosition}px`;
              } catch {
                // Silently ignore any position errors
                return false;
              }

              return false;
            },
            mouseleave(view, event) {
              // Don't remove if moving to the insert line
              const relatedTarget = event.relatedTarget as HTMLElement;
              if (relatedTarget?.classList?.contains("node-insert-line")) {
                return false;
              }

              const existingLines =
                view.dom.parentElement?.querySelectorAll(".node-insert-line");
              existingLines?.forEach((line) => line.remove());
              currentInsertLine = null;
              currentInsertPos = null;
              return false;
            },
          },
        },
      }),
    ];
  },
});
