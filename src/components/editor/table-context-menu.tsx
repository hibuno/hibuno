import type { Editor } from "@tiptap/react";
import { Merge, Minus, Plus, Split, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface TableContextMenuProps {
  editor: Editor;
  children: React.ReactNode;
}

export default function TableContextMenu({
  editor,
  children,
}: TableContextMenuProps) {
  const [isInTable, setIsInTable] = useState(false);
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

      // Check if right-click is on a table element
      const tableElement = target?.closest("table, td, th, tr");
      if (tableElement && target) {
        e.preventDefault();
        e.stopPropagation();
        setIsInTable(true);

        // Get cursor position relative to viewport
        const cursorX = e.clientX;
        const cursorY = e.clientY;

        // Calculate menu position - try to position it near the cursor
        const menuWidth = 200;
        const menuHeight = 320;

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
        setIsInTable(false);
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

  const canInsertRow =
    editor.can().addRowAfter() || editor.can().addRowBefore();
  const canInsertColumn =
    editor.can().addColumnAfter() || editor.can().addColumnBefore();
  const canDeleteRow = editor.can().deleteRow();
  const canDeleteColumn = editor.can().deleteColumn();
  const canMergeCells = editor.can().mergeCells();
  const canSplitCell = editor.can().splitCell();

  const handleAddRowBefore = () => {
    editor.chain().focus().addRowBefore().run();
    setShowCustomMenu(false);
  };

  const handleAddRowAfter = () => {
    editor.chain().focus().addRowAfter().run();
    setShowCustomMenu(false);
  };

  const handleAddColumnBefore = () => {
    editor.chain().focus().addColumnBefore().run();
    setShowCustomMenu(false);
  };

  const handleAddColumnAfter = () => {
    editor.chain().focus().addColumnAfter().run();
    setShowCustomMenu(false);
  };

  const handleDeleteRow = () => {
    editor.chain().focus().deleteRow().run();
    setShowCustomMenu(false);
  };

  const handleDeleteColumn = () => {
    editor.chain().focus().deleteColumn().run();
    setShowCustomMenu(false);
  };

  const handleDeleteTable = () => {
    editor.chain().focus().deleteTable().run();
    setShowCustomMenu(false);
  };

  const handleMergeCells = () => {
    editor.chain().focus().mergeCells().run();
    setShowCustomMenu(false);
  };

  const handleSplitCell = () => {
    editor.chain().focus().splitCell().run();
    setShowCustomMenu(false);
  };

  const handleToggleHeaderRow = () => {
    editor.chain().focus().toggleHeaderRow().run();
    setShowCustomMenu(false);
  };

  const handleToggleHeaderColumn = () => {
    editor.chain().focus().toggleHeaderColumn().run();
    setShowCustomMenu(false);
  };

  if (!isInTable || !showCustomMenu) {
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
          onClick={handleAddRowBefore}
          disabled={!canInsertRow}
          className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={14} />
          Insert Row Before
        </button>
        <button
          onClick={handleAddRowAfter}
          disabled={!canInsertRow}
          className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={14} />
          Insert Row After
        </button>
        <button
          onClick={handleDeleteRow}
          disabled={!canDeleteRow}
          className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus size={14} />
          Delete Row
        </button>

        <button
          onClick={handleAddColumnBefore}
          disabled={!canInsertColumn}
          className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={14} />
          Insert Column Before
        </button>
        <button
          onClick={handleAddColumnAfter}
          disabled={!canInsertColumn}
          className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={14} />
          Insert Column After
        </button>
        <button
          onClick={handleDeleteColumn}
          disabled={!canDeleteColumn}
          className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus size={14} />
          Delete Column
        </button>

        <div className="border-t border-gray-100 my-1"></div>

        <button
          onClick={handleMergeCells}
          disabled={!canMergeCells}
          className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Merge size={14} />
          Merge Cells
        </button>
        <button
          onClick={handleSplitCell}
          disabled={!canSplitCell}
          className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Split size={14} />
          Split Cell
        </button>

        <div className="border-t border-gray-100 my-1"></div>

        <button
          onClick={handleToggleHeaderRow}
          className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm hover:bg-gray-50"
        >
          Toggle Header Row
        </button>
        <button
          onClick={handleToggleHeaderColumn}
          className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm hover:bg-gray-50"
        >
          Toggle Header Column
        </button>
        <button
          onClick={handleDeleteTable}
          className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm hover:bg-gray-50 text-red-600"
        >
          <Trash2 size={14} />
          Delete Table
        </button>
      </div>
    </>
  );
}
