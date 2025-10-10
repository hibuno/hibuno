import { Editor } from "@tiptap/react";
import { useState, useEffect } from "react";
import {
 Bold,
 Italic,
 Underline as UnderlineIcon,
 Strikethrough,
 Code,
 Highlighter,
 AlignLeft,
 AlignCenter,
 AlignRight,
 List,
 ListOrdered,
 CheckSquare,
 Quote,
 Undo,
 Redo,
 Link as LinkIcon,
 Heading1,
 Heading2,
 Heading3,
 Image as ImageIcon,
 Palette,
 Columns as ColumnsIcon,
 TableIcon,
} from "lucide-react";

interface ToolbarProps {
 editor: Editor;
 onImageClick: () => void;
 onTableClick: () => void;
 onLinkClick: (initialData?: {
  href?: string;
  text?: string;
  title?: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
 }) => void;
}

export default function Toolbar({
 editor,
 onImageClick,
 onLinkClick,
 onTableClick,
}: ToolbarProps) {
 const [showTextColorPicker, setShowTextColorPicker] = useState(false);
 const [showBgColorPicker, setShowBgColorPicker] = useState(false);

 // Close color pickers when clicking outside
 useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
   const target = e.target as Element;
   const isClickInsideTextColorPicker = target.closest(".text-color-picker");
   const isClickInsideBgColorPicker = target.closest(".bg-color-picker");
   const isClickOnTextColorButton = target.closest('[title="Text Color"]');
   const isClickOnBgColorButton = target.closest('[title="Background Color"]');

   if (
    showTextColorPicker &&
    !isClickInsideTextColorPicker &&
    !isClickOnTextColorButton
   ) {
    setShowTextColorPicker(false);
   }
   if (
    showBgColorPicker &&
    !isClickInsideBgColorPicker &&
    !isClickOnBgColorButton
   ) {
    setShowBgColorPicker(false);
   }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
 }, [showTextColorPicker, showBgColorPicker]);

 const textColors = [
  { name: "Default", value: null },
  { name: "Black", value: "#000000" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
  { name: "Green", value: "#22c55e" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
  { name: "Gray", value: "#6b7280" },
  { name: "Dark Blue", value: "#1e40af" },
  { name: "Dark Green", value: "#059669" },
 ];

 const bgColors = [
  { name: "Default", value: null },
  { name: "Light Red", value: "#fef2f2" },
  { name: "Light Orange", value: "#fff7ed" },
  { name: "Light Yellow", value: "#fefce8" },
  { name: "Light Green", value: "#f0fdf4" },
  { name: "Light Blue", value: "#eff6ff" },
  { name: "Light Purple", value: "#faf5ff" },
  { name: "Light Pink", value: "#fdf2f8" },
  { name: "Light Gray", value: "#f9fafb" },
  { name: "Medium Yellow", value: "#fef3c7" },
  { name: "Medium Blue", value: "#dbeafe" },
  { name: "Medium Green", value: "#d1fae5" },
 ];
 const setLink = () => {
  const previousUrl = editor.getAttributes("link").href;
  const previousTitle = editor.getAttributes("link").title || "";
  const previousTarget =
   (editor.getAttributes("link").target as
    | "_blank"
    | "_self"
    | "_parent"
    | "_top") || "_blank";
  const previousText =
   editor.state.doc.textBetween(
    editor.state.selection.from,
    editor.state.selection.to
   ) || "";

  // Use the custom link dialog instead of native prompt
  onLinkClick({
   href: previousUrl,
   text: previousText,
   title: previousTitle,
   target: previousTarget,
  });
 };

 const ToolbarButton = ({
  onClick,
  isActive = false,
  children,
  title,
 }: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
 }) => (
  <button
   onClick={onClick}
   title={title}
   className={`p-2 rounded hover:bg-gray-100 transition-colors ${
    isActive ? "bg-gray-200 text-blue-600" : "text-gray-700"
   }`}
  >
   {children}
  </button>
 );

 return (
  <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
   <div className="flex flex-wrap items-center gap-1 px-4 py-2">
    <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
     <ToolbarButton
      onClick={() => editor.chain().focus().undo().run()}
      title="Undo (Ctrl+Z)"
     >
      <Undo size={18} />
     </ToolbarButton>
     <ToolbarButton
      onClick={() => editor.chain().focus().redo().run()}
      title="Redo (Ctrl+Y)"
     >
      <Redo size={18} />
     </ToolbarButton>
    </div>

    <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
     <ToolbarButton
      onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      isActive={editor.isActive("heading", { level: 1 })}
      title="Heading 1"
     >
      <Heading1 size={18} />
     </ToolbarButton>
     <ToolbarButton
      onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      isActive={editor.isActive("heading", { level: 2 })}
      title="Heading 2"
     >
      <Heading2 size={18} />
     </ToolbarButton>
     <ToolbarButton
      onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      isActive={editor.isActive("heading", { level: 3 })}
      title="Heading 3"
     >
      <Heading3 size={18} />
     </ToolbarButton>
    </div>

    <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
     <ToolbarButton
      onClick={() => editor.chain().focus().toggleBold().run()}
      isActive={editor.isActive("bold")}
      title="Bold (Ctrl+B)"
     >
      <Bold size={18} />
     </ToolbarButton>
     <ToolbarButton
      onClick={() => editor.chain().focus().toggleItalic().run()}
      isActive={editor.isActive("italic")}
      title="Italic (Ctrl+I)"
     >
      <Italic size={18} />
     </ToolbarButton>
     <ToolbarButton
      onClick={() => editor.chain().focus().toggleUnderline().run()}
      isActive={editor.isActive("underline")}
      title="Underline (Ctrl+U)"
     >
      <UnderlineIcon size={18} />
     </ToolbarButton>
     <ToolbarButton
      onClick={() => editor.chain().focus().toggleStrike().run()}
      isActive={editor.isActive("strike")}
      title="Strikethrough"
     >
      <Strikethrough size={18} />
     </ToolbarButton>
     <ToolbarButton
      onClick={() => editor.chain().focus().toggleCode().run()}
      isActive={editor.isActive("code")}
      title="Inline Code"
     >
      <Code size={18} />
     </ToolbarButton>
    </div>

    <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
     <ToolbarButton
      onClick={() => editor.chain().focus().setTextAlign("left").run()}
      isActive={editor.isActive({ textAlign: "left" })}
      title="Align Left"
     >
      <AlignLeft size={18} />
     </ToolbarButton>
     <ToolbarButton
      onClick={() => editor.chain().focus().setTextAlign("center").run()}
      isActive={editor.isActive({ textAlign: "center" })}
      title="Align Center"
     >
      <AlignCenter size={18} />
     </ToolbarButton>
     <ToolbarButton
      onClick={() => editor.chain().focus().setTextAlign("right").run()}
      isActive={editor.isActive({ textAlign: "right" })}
      title="Align Right"
     >
      <AlignRight size={18} />
     </ToolbarButton>
    </div>

    <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
     <ToolbarButton
      onClick={() => editor.chain().focus().toggleBulletList().run()}
      isActive={editor.isActive("bulletList")}
      title="Bullet List"
     >
      <List size={18} />
     </ToolbarButton>
     <ToolbarButton
      onClick={() => editor.chain().focus().toggleOrderedList().run()}
      isActive={editor.isActive("orderedList")}
      title="Numbered List"
     >
      <ListOrdered size={18} />
     </ToolbarButton>
     <ToolbarButton
      onClick={() => editor.chain().focus().toggleTaskList().run()}
      isActive={editor.isActive("taskList")}
      title="Task List"
     >
      <CheckSquare size={18} />
     </ToolbarButton>
     <ToolbarButton
      onClick={() => editor.chain().focus().toggleBlockquote().run()}
      isActive={editor.isActive("blockquote")}
      title="Quote"
     >
      <Quote size={18} />
     </ToolbarButton>
    </div>

    <div className="flex items-center gap-1 pr-2 border-r border-gray-300 relative">
     <div className="relative">
      <ToolbarButton
       onClick={() => setShowTextColorPicker(!showTextColorPicker)}
       title="Text Color"
      >
       <Palette size={18} />
      </ToolbarButton>
      {showTextColorPicker && (
       <div className="text-color-picker absolute top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-[9999] min-w-[200px]">
        <div className="text-xs font-medium text-gray-600 mb-3">Text Color</div>
        <div className="grid grid-cols-4 gap-2">
         {textColors.map((color) => (
          <button
           key={color.name}
           onClick={() => {
            if (color.value) {
             editor.chain().focus().setColor(color.value).run();
            } else {
             editor.chain().focus().unsetColor().run();
            }
            setShowTextColorPicker(false);
           }}
           className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-blue-400 hover:scale-105 transition-all duration-150 flex items-center justify-center group"
           style={{ backgroundColor: color.value || "#000000" }}
           title={color.name}
          >
           {color.value === null && (
            <span className="text-xs font-medium text-gray-600 group-hover:text-gray-800">
             Default
            </span>
           )}
          </button>
         ))}
        </div>
       </div>
      )}
     </div>
     <div className="relative">
      <ToolbarButton
       onClick={() => setShowBgColorPicker(!showBgColorPicker)}
       title="Background Color"
      >
       <Highlighter size={18} />
      </ToolbarButton>
      {showBgColorPicker && (
       <div className="bg-color-picker absolute top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-[9999] min-w-[200px]">
        <div className="text-xs font-medium text-gray-600 mb-3">
         Background Color
        </div>
        <div className="grid grid-cols-4 gap-2">
         {bgColors.map((color) => (
          <button
           key={color.name}
           onClick={() => {
            if (color.value) {
             // Set CSS variable for highlight color and apply highlight
             document.documentElement.style.setProperty(
              "--highlight-color",
              color.value
             );
             editor.chain().focus().setHighlight({ color: color.value }).run();
            } else {
             editor.chain().focus().unsetHighlight().run();
            }
            setShowBgColorPicker(false);
           }}
           className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-blue-400 hover:scale-105 transition-all duration-150 flex items-center justify-center group"
           style={{ backgroundColor: color.value || "#ffffff" }}
           title={color.name}
          >
           {color.value === null && (
            <span className="text-xs font-medium text-gray-600 group-hover:text-gray-800">
             Default
            </span>
           )}
          </button>
         ))}
        </div>
       </div>
      )}
     </div>
    </div>

    <div className="flex items-center gap-1">
     <ToolbarButton
      onClick={setLink}
      isActive={editor.isActive("link")}
      title="Insert Link"
     >
      <LinkIcon size={18} />
     </ToolbarButton>
     <ToolbarButton onClick={onImageClick} title="Insert Image">
      <ImageIcon size={18} />
     </ToolbarButton>
     <ToolbarButton
      onClick={() => editor.chain().focus().setTwoColumns().run()}
      title="Two Columns"
     >
      <ColumnsIcon size={18} />
     </ToolbarButton>
     <ToolbarButton onClick={() => onTableClick()} title="Insert Table">
      <TableIcon size={18} />
     </ToolbarButton>
    </div>
   </div>
  </div>
 );
}
