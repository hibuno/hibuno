import type { Editor } from "@tiptap/react";
import {
  AlertCircle,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  FoldVertical,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo,
} from "lucide-react";

interface ToolbarProps {
  editor: Editor;
  onImageClick: () => void;
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
}: ToolbarProps) {
  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const previousTarget = editor.getAttributes("link").target || "_blank";
    const previousText =
      editor.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to
      ) || "";
    onLinkClick({
      href: previousUrl,
      text: previousText,
      target: previousTarget,
    });
  };

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
      className={`p-1.5 rounded transition-colors ${
        isActive
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-4 bg-border mx-0.5" />;

  return (
    <div
      className="sticky top-0 z-10 bg-card border-b border-border"
      role="toolbar"
    >
      <div className="flex items-center gap-0.5 px-2 py-1">
        <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo size={14} />
        </Btn>

        <Divider />

        <Btn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 size={14} />
        </Btn>
        <Btn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={14} />
        </Btn>
        <Btn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={14} />
        </Btn>

        <Divider />

        <Btn
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold"
        >
          <Bold size={14} />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic"
        >
          <Italic size={14} />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon size={14} />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough size={14} />
        </Btn>

        <Divider />

        <Btn
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft size={14} />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter size={14} />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <AlignRight size={14} />
        </Btn>

        <Divider />

        <Btn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List size={14} />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered size={14} />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Quote"
        >
          <Quote size={14} />
        </Btn>

        <Divider />

        <Btn onClick={setLink} isActive={editor.isActive("link")} title="Link">
          <LinkIcon size={14} />
        </Btn>
        <Btn onClick={onImageClick} title="Image">
          <ImageIcon size={14} />
        </Btn>

        <Divider />

        <Btn
          onClick={() => {
            editor.chain().focus().setHorizontalRule().run();
          }}
          title="Divider"
        >
          <Minus size={14} />
        </Btn>
        <Btn
          onClick={() => {
            editor.chain().focus().setCallout({ type: "info" }).run();
          }}
          title="Image"
        >
          <AlertCircle size={14} />
        </Btn>
        <Btn
          onClick={() => {
            editor
              .chain()
              .focus()
              .setDetails({ summary: "Click to expand", open: false })
              .run();
          }}
          title="Collapsible"
        >
          <FoldVertical size={14} />
        </Btn>
      </div>
    </div>
  );
}
