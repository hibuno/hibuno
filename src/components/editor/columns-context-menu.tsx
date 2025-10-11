import type { Editor } from "@tiptap/react";
import { Minus, Move, Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface ColumnsContextMenuProps {
  editor: Editor;
  children: React.ReactNode;
}

export default function ColumnsContextMenu({
  editor,
  children,
}: ColumnsContextMenuProps) {
  const [isInColumns, setIsInColumns] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [showCustomMenu, setShowCustomMenu] = useState(false);

  useEffect(() => {
    const editorElement = editor.view.dom;

    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Only handle context menu if it's within the editor
      if (!editorElement.contains(target)) {
        return;
      }

      // Check if right-click is on a column element
      const columnElement = target?.closest('[data-type="column"]');
      if (columnElement && target) {
        e.preventDefault();
        e.stopPropagation();
        setIsInColumns(true);

        // Get cursor position relative to viewport
        const cursorX = e.clientX;
        const cursorY = e.clientY;

        // Calculate menu position - try to position it near the cursor
        const menuWidth = 200;
        const menuHeight = 160;

        // Check if there's space to the right of cursor
        let menuX = cursorX;
        if (cursorX + menuWidth > window.innerWidth) {
          // Position to the left of cursor
          menuX = cursorX - menuWidth;
        }

        // Check if there's space below cursor
        let menuY = cursorY;
        if (cursorY + menuHeight > window.innerHeight) {
          // Position above cursor
          menuY = cursorY - menuHeight;
        }

        // Final safety check - ensure menu is within viewport
        menuX = Math.max(5, Math.min(menuX, window.innerWidth - menuWidth - 5));
        menuY = Math.max(
          5,
          Math.min(menuY, window.innerHeight - menuHeight - 5),
        );

        setContextMenuPosition({ x: menuX, y: menuY });
        setShowCustomMenu(true);
      } else {
        setIsInColumns(false);
        setShowCustomMenu(false);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Only close if clicking outside the context menu
      if (!target.closest(".context-menu")) {
        setShowCustomMenu(false);
      }
    };

    editorElement.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("click", handleClick);

    return () => {
      editorElement.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("click", handleClick);
    };
  }, [editor]);

  const canAddColumn = editor.can().addColumn();
  const canRemoveColumn = editor.can().removeColumn();

  const handleAddColumn = () => {
    editor.chain().focus().addColumn().run();
    setShowCustomMenu(false);
  };

  const handleRemoveColumn = () => {
    editor.chain().focus().removeColumn().run();
    setShowCustomMenu(false);
  };

  if (!isInColumns || !showCustomMenu) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <div
        className="context-menu fixed bg-white border border-gray-200 rounded-lg shadow-xl py-2 px-1 min-w-[200px] z-[9999] animate-in fade-in slide-in-from-top-2 duration-200"
        style={{
          top: contextMenuPosition.y,
          left: contextMenuPosition.x,
        }}
      >
        <button
          onClick={handleAddColumn}
          disabled={!canAddColumn}
          className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={14} />
          Add Column
        </button>
        <button
          onClick={handleRemoveColumn}
          disabled={!canRemoveColumn}
          className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus size={14} />
          Remove Column
        </button>
        <div className="border-t border-gray-100 my-1"></div>
        <div className="px-3 py-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Move size={12} />
            Drag resize handle to resize
          </div>
        </div>
      </div>
    </>
  );
}
