import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { Plus } from "lucide-react";

export interface NodeHoverMenuOptions {
 HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
 interface Commands<ReturnType> {
  nodeHoverMenu: {
   showCommandMenu: (position: { top: number; left: number }) => ReturnType;
  };
 }
}

export const NodeHoverMenu = Extension.create<NodeHoverMenuOptions>({
 name: "nodeHoverMenu",

 addOptions() {
  return {
   HTMLAttributes: {},
  };
 },

 addCommands() {
  return {
   showCommandMenu:
    (position: { top: number; left: number }) =>
    ({ editor }) => {
     // Dispatch custom event to trigger command menu in main editor
     const showCommandEvent = new CustomEvent("showCommandMenu", {
      detail: position,
      bubbles: true,
     });
     document.dispatchEvent(showCommandEvent);
     return true;
    },
  };
 },

 addProseMirrorPlugins() {
  const pluginKey = new PluginKey("nodeHoverMenu");

  return [
   new Plugin({
    key: pluginKey,
    state: {
     init() {
      return DecorationSet.empty;
     },
     apply(tr, set) {
      // Create decorations for node boundaries
      const decorations: Decoration[] = [];
      const doc = tr.doc;

      // Walk through the document and add hover areas between block nodes
      let decorationCount = 0;

      // Track positions where we need to add hover areas
      const hoverPositions: number[] = [];

      // First, let's collect all block node positions
      const blockPositions: Array<{ node: any; pos: number }> = [];
      doc.descendants((node, pos) => {
       if (node.isBlock) {
        blockPositions.push({ node, pos });
       }
       return false;
      });

      // Create hover areas between consecutive block nodes
      for (let i = 0; i < blockPositions.length - 1; i++) {
       const currentBlock = blockPositions[i];
       const nextBlock = blockPositions[i + 1];

       if (currentBlock && nextBlock) {
        // Find the exact boundary position between nodes
        const boundaryPos = nextBlock.pos;
        if (!hoverPositions.includes(boundaryPos)) {
         hoverPositions.push(boundaryPos);
         decorationCount++;

         const decoration = Decoration.widget(
          boundaryPos,
          (view, getPos) => {
           const div = document.createElement("div");
           div.className = "node-hover-area";
           div.style.position = "relative";
           div.style.width = "100%";
           div.style.height = "24px"; // Increased height for easier hovering
           div.style.overflow = "visible";
           div.style.marginTop = "-12px";
           div.style.marginBottom = "-12px";
           div.style.zIndex = "10";

           // Create the hover bar
           const hoverBar = document.createElement("div");
           hoverBar.className = "node-hover-bar";
           hoverBar.style.position = "absolute";
           hoverBar.style.top = "50%";
           hoverBar.style.left = "50%";
           hoverBar.style.transform = "translate(-50%, -50%)";
           hoverBar.style.backgroundColor = "#ffffff";
           hoverBar.style.border = "1px solid #e5e7eb";
           hoverBar.style.borderRadius = "8px";
           hoverBar.style.padding = "8px 16px";
           hoverBar.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
           hoverBar.style.zIndex = "9999";
           hoverBar.style.cursor = "pointer";
           hoverBar.style.alignItems = "center";
           hoverBar.style.gap = "8px";
           hoverBar.style.fontSize = "13px";
           hoverBar.style.color = "#374151";
           hoverBar.style.fontWeight = "500";
           hoverBar.style.opacity = "0";
           hoverBar.style.pointerEvents = "none";
           hoverBar.style.transition = "all 0.2s ease-in-out";
           hoverBar.style.display = "flex";

           // Create the "+" button
           const plusButton = document.createElement("button");
           plusButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"></path></svg>`;
           plusButton.style.background = "none";
           plusButton.style.border = "none";
           plusButton.style.cursor = "pointer";
           plusButton.style.padding = "3px";
           plusButton.style.borderRadius = "4px";
           plusButton.style.display = "flex";
           plusButton.style.alignItems = "center";
           plusButton.style.justifyContent = "center";
           plusButton.style.color = "#3b82f6";
           plusButton.style.fontSize = "18px";
           plusButton.style.transition = "all 0.15s ease-in-out";

           // Add hover effect for the button
           plusButton.addEventListener("mouseenter", () => {
            plusButton.style.backgroundColor = "#eff6ff";
            plusButton.style.color = "#2563eb";
           });

           plusButton.addEventListener("mouseleave", () => {
            plusButton.style.backgroundColor = "transparent";
            plusButton.style.color = "#3b82f6";
           });

           // Add click handler
           plusButton.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Get the position where we want to insert the new node
            const insertPos = getPos();
            if (insertPos !== null && insertPos !== undefined) {
             // Get position for command menu immediately
             const rect = hoverBar.getBoundingClientRect();
             const editorRect = view.dom.getBoundingClientRect();
             const menuPosition = {
              top: rect.bottom - editorRect.top + 20,
              left: rect.left - editorRect.left + rect.width / 2,
             };

             // Dispatch custom event to trigger command menu in main editor
             const showCommandEvent = new CustomEvent("showCommandMenu", {
              detail: {
               position: menuPosition,
               insertPos: insertPos,
              },
              bubbles: true,
             });

             document.dispatchEvent(showCommandEvent);
            }
           });

           // Also handle mousedown to make it more responsive
           plusButton.addEventListener("mousedown", (e) => {
            e.preventDefault();
            e.stopPropagation();
           });

           hoverBar.appendChild(plusButton);
           hoverBar.appendChild(document.createTextNode("Add"));

           div.appendChild(hoverBar);

           // Show/hide hover bar based on mouse position
           let hoverTimeout: NodeJS.Timeout;

           div.addEventListener("mouseenter", () => {
            clearTimeout(hoverTimeout);
            hoverBar.style.opacity = "1";
            hoverBar.style.pointerEvents = "auto";
            hoverBar.style.transform = "translate(-50%, -50%) scale(1.05)";
           });

           div.addEventListener("mouseleave", () => {
            hoverTimeout = setTimeout(() => {
             hoverBar.style.opacity = "0";
             hoverBar.style.pointerEvents = "none";
             hoverBar.style.transform = "translate(-50%, -50%) scale(1)";
            }, 150);
           });

           return div;
          },
          {
           side: -1, // Render before the content
           stopEvent: () => {
            // Don't stop events by default - let them propagate
            return false;
           },
          }
         );

         decorations.push(decoration);
        }
       }
      }

      const decorationSet = DecorationSet.create(doc, decorations);

      return decorationSet;
     },
    },

    props: {
     decorations(state) {
      return this.getState(state);
     },
    },
   }),
  ];
 },
});
