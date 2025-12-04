import type { Editor } from "@tiptap/react";
import {
  Bold,
  Code,
  Italic,
  Link as LinkIcon,
  Palette,
  Sparkles,
  Strikethrough,
  Underline as UnderlineIcon,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface FloatingToolbarProps {
  editor: Editor;
  onLinkClick?: () => void;
  onAIClick: () => void;
}

const colors = [
  { name: "Default", text: null, bg: null },
  { name: "Red", text: "#b91c1c", bg: "#fef2f2" },
  { name: "Amber", text: "#b45309", bg: "#fffbeb" },
  { name: "Green", text: "#15803d", bg: "#f0fdf4" },
  { name: "Blue", text: "#1d4ed8", bg: "#eff6ff" },
];

export default function FloatingToolbar({
  editor,
  onLinkClick,
  onAIClick,
}: FloatingToolbarProps) {
  const [showToolbar, setShowToolbar] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [showColors, setShowColors] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateToolbar = () => {
      const { from, to, empty } = editor.state.selection;
      if (empty) {
        setShowToolbar(false);
        setShowColors(false);
        return;
      }

      const start = editor.view.coordsAtPos(from);
      const end = editor.view.coordsAtPos(to);
      const centerX = (start.left + end.left) / 2;
      const topY = Math.min(start.top, end.top);

      setPosition({ top: topY - 40, left: centerX });
      setShowToolbar(true);
    };

    editor.on("selectionUpdate", updateToolbar);
    editor.on("update", updateToolbar);
    return () => {
      editor.off("selectionUpdate", updateToolbar);
      editor.off("update", updateToolbar);
    };
  }, [editor]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(e.target as Node)
      ) {
        if (editor.state.selection.empty) setShowToolbar(false);
        setShowColors(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editor]);

  const Btn = ({
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
      className={`p-1 rounded transition-colors ${
        isActive
          ? "bg-white/20 text-white"
          : "text-white/70 hover:text-white hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );

  if (!showToolbar) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed bg-[oklch(0.18_0.01_60)] rounded-lg shadow-xl px-1 py-0.5 flex items-center gap-0.5 z-50 animate-in"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translateX(-50%)",
      }}
    >
      <button
        onClick={onAIClick}
        title="AI Assistant (⌘K)"
        className="p-1 rounded transition-all bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 hover:scale-110 hover:shadow-lg hover:shadow-amber-500/25"
      >
        <Sparkles size={13} />
      </button>

      <div className="w-px h-4 bg-white/20 mx-0.5" />

      <Btn
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Bold"
      >
        <Bold size={13} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Italic"
      >
        <Italic size={13} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title="Underline"
      >
        <UnderlineIcon size={13} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough size={13} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive("code")}
        title="Code"
      >
        <Code size={13} />
      </Btn>

      <div className="w-px h-4 bg-white/20 mx-0.5" />

      <div className="relative">
        <Btn
          onClick={() => setShowColors(!showColors)}
          title="Color"
          isActive={showColors}
        >
          <Palette size={13} />
        </Btn>
        {showColors && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-popover rounded-md shadow-lg border border-border p-1.5 z-50 min-w-[100px]">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => {
                  if (color.text) {
                    editor.chain().focus().setColor(color.text).run();
                    if (color.bg)
                      editor
                        .chain()
                        .focus()
                        .setHighlight({ color: color.bg })
                        .run();
                  } else {
                    editor.chain().focus().unsetColor().unsetHighlight().run();
                  }
                  setShowColors(false);
                }}
                className="w-full px-2 py-1 rounded flex items-center gap-2 hover:bg-muted transition-colors"
              >
                <span
                  className="w-3 h-3 rounded-full border border-border"
                  style={{ backgroundColor: color.bg || "#fff" }}
                />
                <span
                  className="text-[11px]"
                  style={{ color: color.text || "inherit" }}
                >
                  {color.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <Btn
        onClick={() => onLinkClick?.()}
        isActive={editor.isActive("link")}
        title="Link"
      >
        <LinkIcon size={13} />
      </Btn>
    </div>
  );
}
