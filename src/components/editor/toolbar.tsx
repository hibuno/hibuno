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
  Sparkles,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo,
  Video,
} from "lucide-react";

interface ToolbarProps {
  editor: Editor;
  onImageClick: () => void;
  onVideoClick: () => void;
  onLinkClick: (initialData?: {
    href?: string;
    text?: string;
    title?: string;
    target?: "_blank" | "_self" | "_parent" | "_top";
  }) => void;
  onAIClick?: () => void;
}

export default function Toolbar({
  editor,
  onImageClick,
  onVideoClick,
  onLinkClick,
  onAIClick,
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
    ariaLabel,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
    ariaLabel?: string;
  }) => (
    <button
      onClick={onClick}
      title={title}
      aria-label={ariaLabel || title}
      aria-pressed={isActive}
      className={`p-1.5 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
        isActive
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );

  const Divider = () => (
    <div
      className="w-px h-4 bg-border mx-0.5"
      role="separator"
      aria-orientation="vertical"
    />
  );

  return (
    <div
      className="sticky top-11 z-10 bg-card border-b border-border"
      role="toolbar"
      aria-label="Text formatting toolbar"
    >
      <div className="flex items-center gap-0.5 px-2 py-1 overflow-x-auto scrollbar-hide">
        <button
          onClick={onAIClick}
          title="AI Assistant (⌘K)"
          aria-label="Open AI Assistant, keyboard shortcut Command K"
          className="p-1.5 rounded transition-all bg-gradient-to-r from-neutral-700 to-neutral-800 text-white hover:from-neutral-800 hover:to-neutral-950 hover:shadow-md hover:shadow-neutral-500/20 flex items-center gap-1 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        >
          <Sparkles size={14} aria-hidden="true" />
        </button>

        <Divider />

        <Btn
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
          ariaLabel="Undo last action"
        >
          <Undo size={14} aria-hidden="true" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
          ariaLabel="Redo last action"
        >
          <Redo size={14} aria-hidden="true" />
        </Btn>

        <Divider />

        <Btn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
          ariaLabel="Toggle heading level 1"
        >
          <Heading1 size={14} aria-hidden="true" />
        </Btn>
        <Btn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
          ariaLabel="Toggle heading level 2"
        >
          <Heading2 size={14} aria-hidden="true" />
        </Btn>
        <Btn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
          ariaLabel="Toggle heading level 3"
        >
          <Heading3 size={14} aria-hidden="true" />
        </Btn>

        <Divider />

        <Btn
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold"
          ariaLabel="Toggle bold formatting"
        >
          <Bold size={14} aria-hidden="true" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic"
          ariaLabel="Toggle italic formatting"
        >
          <Italic size={14} aria-hidden="true" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline"
          ariaLabel="Toggle underline formatting"
        >
          <UnderlineIcon size={14} aria-hidden="true" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Strikethrough"
          ariaLabel="Toggle strikethrough formatting"
        >
          <Strikethrough size={14} aria-hidden="true" />
        </Btn>

        <Divider />

        {/* Hide alignment on mobile to save space */}
        <div
          className="hidden sm:flex items-center gap-0.5"
          role="group"
          aria-label="Text alignment"
        >
          <Btn
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            title="Align Left"
            ariaLabel="Align text left"
          >
            <AlignLeft size={14} aria-hidden="true" />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
            title="Align Center"
            ariaLabel="Align text center"
          >
            <AlignCenter size={14} aria-hidden="true" />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
            title="Align Right"
            ariaLabel="Align text right"
          >
            <AlignRight size={14} aria-hidden="true" />
          </Btn>
          <Divider />
        </div>

        <Btn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
          ariaLabel="Toggle bullet list"
        >
          <List size={14} aria-hidden="true" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Numbered List"
          ariaLabel="Toggle numbered list"
        >
          <ListOrdered size={14} aria-hidden="true" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Quote"
          ariaLabel="Toggle blockquote"
        >
          <Quote size={14} aria-hidden="true" />
        </Btn>

        <Divider />

        <Btn
          onClick={setLink}
          isActive={editor.isActive("link")}
          title="Link"
          ariaLabel="Insert or edit link"
        >
          <LinkIcon size={14} aria-hidden="true" />
        </Btn>
        <Btn onClick={onImageClick} title="Image" ariaLabel="Insert image">
          <ImageIcon size={14} aria-hidden="true" />
        </Btn>
        <Btn onClick={onVideoClick} title="Video" ariaLabel="Insert video">
          <Video size={14} aria-hidden="true" />
        </Btn>

        <Divider />

        <Btn
          onClick={() => {
            editor.chain().focus().setHorizontalRule().run();
          }}
          title="Divider"
          ariaLabel="Insert horizontal divider"
        >
          <Minus size={14} aria-hidden="true" />
        </Btn>
        <Btn
          onClick={() => {
            editor.chain().focus().setCallout({ type: "info" }).run();
          }}
          title="Callout"
          ariaLabel="Insert callout block"
        >
          <AlertCircle size={14} aria-hidden="true" />
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
          ariaLabel="Insert collapsible section"
        >
          <FoldVertical size={14} aria-hidden="true" />
        </Btn>
      </div>
    </div>
  );
}
