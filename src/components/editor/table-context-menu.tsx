import { Editor } from "@tiptap/react";
import { useState, useEffect } from "react";
import { Plus, Minus, Trash2, Merge, Split } from "lucide-react";

interface TableContextMenuProps {
 editor: Editor;
 children: React.ReactNode;
}

export default function TableContextMenu({
 editor,
 children,
}: TableContextMenuProps) {
 const [isInTable, setIsInTable] = useState(false);
 const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
 const [showCustomMenu, setShowCustomMenu] = useState(false);

 useEffect(() => {
  const handleContextMenu = (e: MouseEvent) => {
   const target = e.target as HTMLElement;

   // Check if right-click is on a table element
   const tableElement = target?.closest("table, td, th, tr");
   if (tableElement && target) {
    e.preventDefault();
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
    menuY = Math.max(5, Math.min(menuY, window.innerHeight - menuHeight - 5));

    setContextMenuPosition({ x: menuX, y: menuY });
    setShowCustomMenu(true);
   } else {
    setIsInTable(false);
   }
  };

  const handleClick = () => {
   setShowCustomMenu(false);
  };

  document.addEventListener("contextmenu", handleContextMenu);
  document.addEventListener("click", handleClick);

  return () => {
   document.removeEventListener("contextmenu", handleContextMenu);
   document.removeEventListener("click", handleClick);
  };
 }, []);

 const canInsertRow = editor.can().addRowAfter();
 const canInsertColumn = editor.can().addColumnAfter();
 const canDeleteRow = editor.can().deleteRow();
 const canDeleteColumn = editor.can().deleteColumn();

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
    className="fixed bg-white border border-gray-200 rounded-lg shadow-xl py-2 px-1 min-w-[200px] z-[9999] animate-in fade-in slide-in-from-top-2 duration-200"
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
     className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm hover:bg-gray-50"
    >
     <Merge size={14} />
     Merge Cells
    </button>
    <button
     onClick={handleSplitCell}
     className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm hover:bg-gray-50"
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
