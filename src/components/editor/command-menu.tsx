import { useState, useEffect, useRef } from "react";
import {
 Heading1,
 Heading2,
 Heading3,
 List,
 ListOrdered,
 CheckSquare,
 Quote,
 Code,
 Minus,
 Sparkles,
 Image as ImageIcon,
 Columns as ColumnsIcon,
 Link as LinkIcon,
 Table,
} from "lucide-react";

interface CommandMenuProps {
 position: { top: number; left: number };
 onSelect: (command: string) => void;
 onClose: () => void;
}

interface Command {
 id: string;
 label: string;
 icon: React.ReactNode;
 keywords: string[];
}

export default function CommandMenu({
 position,
 onSelect,
 onClose,
}: CommandMenuProps) {
 const [selectedIndex, setSelectedIndex] = useState(0);
 const menuRef = useRef<HTMLDivElement>(null);

 const commands: Command[] = [
  {
   id: "heading1",
   label: "Heading 1",
   icon: <Heading1 size={18} />,
   keywords: ["h1", "heading", "title"],
  },
  {
   id: "heading2",
   label: "Heading 2",
   icon: <Heading2 size={18} />,
   keywords: ["h2", "heading", "subtitle"],
  },
  {
   id: "heading3",
   label: "Heading 3",
   icon: <Heading3 size={18} />,
   keywords: ["h3", "heading", "subheading"],
  },
  {
   id: "bulletList",
   label: "Bullet List",
   icon: <List size={18} />,
   keywords: ["ul", "list", "bullet", "unordered"],
  },
  {
   id: "orderedList",
   label: "Numbered List",
   icon: <ListOrdered size={18} />,
   keywords: ["ol", "list", "numbered", "ordered"],
  },
  {
   id: "taskList",
   label: "Task List",
   icon: <CheckSquare size={18} />,
   keywords: ["todo", "task", "checklist", "checkbox"],
  },
  {
   id: "blockquote",
   label: "Quote",
   icon: <Quote size={18} />,
   keywords: ["quote", "blockquote", "cite"],
  },
  {
   id: "codeBlock",
   label: "Code Block",
   icon: <Code size={18} />,
   keywords: ["code", "snippet", "programming"],
  },
  {
   id: "divider",
   label: "Divider",
   icon: <Minus size={18} />,
   keywords: ["hr", "divider", "separator", "line"],
  },
  {
   id: "image",
   label: "Image",
   icon: <ImageIcon size={18} />,
   keywords: ["image", "picture", "photo", "img"],
  },
  {
   id: "twoColumns",
   label: "Two Columns",
   icon: <ColumnsIcon size={18} />,
   keywords: ["columns", "layout", "grid", "two"],
  },
  {
   id: "link",
   label: "Link",
   icon: <LinkIcon size={18} />,
   keywords: ["link", "url", "hyperlink", "anchor"],
  },
 ];

 useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
   if (e.key === "ArrowDown") {
    e.preventDefault();
    setSelectedIndex((prev) => (prev + 1) % commands.length);
   } else if (e.key === "ArrowUp") {
    e.preventDefault();
    setSelectedIndex((prev) => (prev - 1 + commands.length) % commands.length);
   } else if (e.key === "Enter") {
    e.preventDefault();
    const command = commands[selectedIndex];
    if (command) {
     onSelect(command.id);
    }
   }
  };

  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
 }, [selectedIndex, commands, onSelect]);

 useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
   if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
    onClose();
   }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
 }, [onClose]);

 return (
  <div
   ref={menuRef}
   className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-64 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200"
   style={{ top: position.top, left: position.left }}
  >
   <div className="px-3 py-2 text-xs font-medium text-gray-500 flex items-center gap-2">
    <Sparkles size={14} className="text-blue-500" />
    AI-Powered Commands
   </div>
   <div className="max-h-80 overflow-y-auto">
    {commands.map((command, index) => (
     <button
      key={command.id}
      onClick={() => onSelect(command.id)}
      onMouseEnter={() => setSelectedIndex(index)}
      className={`w-full px-3 py-2 flex items-center gap-3 text-left transition-colors ${
       index === selectedIndex
        ? "bg-blue-50 text-blue-700"
        : "text-gray-700 hover:bg-gray-50"
      }`}
     >
      <span
       className={index === selectedIndex ? "text-blue-600" : "text-gray-400"}
      >
       {command.icon}
      </span>
      <span className="font-medium">{command.label}</span>
     </button>
    ))}
   </div>
   <div className="px-3 py-2 mt-1 border-t border-gray-100">
    <p className="text-xs text-gray-500">
     Use{" "}
     <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">↑</kbd>{" "}
     <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">↓</kbd> to
     navigate,{" "}
     <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">
      Enter
     </kbd>{" "}
     to select
    </p>
   </div>
  </div>
 );
}
