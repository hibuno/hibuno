import Color from "@tiptap/extension-color";
import Dropcursor from "@tiptap/extension-dropcursor";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import { Gapcursor } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import {
  editorDialogState,
  editorDialogActions,
} from "@/lib/editor-dialog-store";
import CommandMenu from "./command-menu";
import { CustomImage } from "./image-extension";
import { CustomVideo } from "./video-extension";
import { Callout } from "./callout-extension";
import { Details } from "./details-extension";
import ImageDialog from "./image-dialog";
import VideoDialog from "./video-dialog";
import LinkDialog from "./link-dialog";
import Toolbar from "./toolbar";
import FloatingToolbar from "./floating-toolbar";
import AICommandMenu from "./ai-command-menu";
import { uploadImage, uploadVideo } from "./editor-utils";
import InlineSuggestion from "@sereneinserenade/tiptap-inline-suggestion";
import { generateContent } from "@/lib/ai-service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

// Keyboard shortcuts configuration
const KEYBOARD_SHORTCUTS = [
  { keys: ["⌘", "S"], description: "Save post", category: "General" },
  { keys: ["⌘", "K"], description: "Open AI assistant", category: "AI" },
  { keys: ["⌘", "/"], description: "Open command menu", category: "General" },
  {
    keys: ["⌘", "?"],
    description: "Show keyboard shortcuts",
    category: "General",
  },
  { keys: ["⌘", "B"], description: "Bold", category: "Formatting" },
  { keys: ["⌘", "I"], description: "Italic", category: "Formatting" },
  { keys: ["⌘", "U"], description: "Underline", category: "Formatting" },
  { keys: ["⌘", "E"], description: "Code", category: "Formatting" },
  {
    keys: ["⌘", "⇧", "S"],
    description: "Strikethrough",
    category: "Formatting",
  },
  { keys: ["⌘", "⇧", "H"], description: "Highlight", category: "Formatting" },
  { keys: ["⌘", "⇧", "L"], description: "Insert link", category: "Insert" },
  { keys: ["⌘", "⇧", "I"], description: "Insert image", category: "Insert" },
  { keys: ["⌘", "⇧", "7"], description: "Ordered list", category: "Blocks" },
  { keys: ["⌘", "⇧", "8"], description: "Bullet list", category: "Blocks" },
  { keys: ["⌘", "⇧", "B"], description: "Blockquote", category: "Blocks" },
  { keys: ["⌘", "⌥", "1"], description: "Heading 1", category: "Blocks" },
  { keys: ["⌘", "⌥", "2"], description: "Heading 2", category: "Blocks" },
  { keys: ["⌘", "⌥", "3"], description: "Heading 3", category: "Blocks" },
  { keys: ["⌘", "Z"], description: "Undo", category: "History" },
  { keys: ["⌘", "⇧", "Z"], description: "Redo", category: "History" },
  { keys: ["→"], description: "Accept AI suggestion", category: "AI" },
  {
    keys: ["Esc"],
    description: "Dismiss suggestion/menu",
    category: "General",
  },
];

// Debounce and cancellation for inline suggestions
let suggestionAbortController: AbortController | null = null;
let suggestionDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let lastSuggestionQuery = "";

const ensureValidHtml = (content: string) => {
  if (!content) return "";
  if (content.trim().startsWith("<")) return content;
  if (!content.includes("<") && !content.includes(">") && content.trim()) {
    return `<p>${content.replace(/\n/g, "</p><p>")}</p>`;
  }
  return content;
};

export default function RichTextEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (html: string) => void;
}) {
  const editorState = useSnapshot(editorDialogState);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [editingLink, setEditingLink] = useState<{
    href?: string;
    text?: string;
    title?: string;
    target?: "_blank" | "_self" | "_parent" | "_top";
  } | null>(null);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [aiMenuPosition, setAIMenuPosition] = useState({ top: 0, left: 0 });
  const [selectedTextForAI, setSelectedTextForAI] = useState<
    string | undefined
  >();
  const [initialAIAction, setInitialAIAction] = useState<
    "improve" | "expand" | "summarize" | "continue" | "chat" | null
  >(null);
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);

  // Save handler - dispatch custom event for parent to handle
  const handleSave = useCallback(() => {
    window.dispatchEvent(new CustomEvent("editor:save"));
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      Gapcursor,
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Callout,
      Details,
      Placeholder.configure({
        placeholder: ({ node }) =>
          node.type.name === "heading"
            ? "Heading"
            : "Type '/' for commands, use → for autocomplete...",
      }),
      Typography,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "underline decoration-[var(--gold)]",
          style: "cursor: pointer;",
        },
      }),
      Dropcursor.configure({ color: "var(--gold)", width: 2 }),
      CustomImage,
      CustomVideo,
      InlineSuggestion.configure({
        fetchAutocompletion: async (query: string) => {
          // Cancel any pending request
          if (suggestionAbortController) {
            suggestionAbortController.abort();
          }
          if (suggestionDebounceTimer) {
            clearTimeout(suggestionDebounceTimer);
          }

          // Skip if same query or too short
          if (query === lastSuggestionQuery || query.length < 30) return "";

          // Check if content ends with a sentence or paragraph
          const trimmed = query.trim();
          const lastChar = trimmed.slice(-1);
          const endsWithPunctuation = [".", "!", "?", ":", ","].includes(
            lastChar
          );

          if (!endsWithPunctuation) return "";

          // Debounce: wait 800ms before making request
          return new Promise((resolve) => {
            suggestionDebounceTimer = setTimeout(async () => {
              try {
                lastSuggestionQuery = query;
                suggestionAbortController = new AbortController();

                // Get the last 1500 characters for context
                const contextText =
                  trimmed.length > 1500 ? trimmed.slice(-1500) : trimmed;

                const response = await generateContent({
                  type: "continue",
                  content: contextText,
                });

                // Check if request was aborted
                if (suggestionAbortController?.signal.aborted) {
                  resolve("");
                  return;
                }

                if (response.result) {
                  // Clean up the result - get first sentence or phrase
                  let suggestion = response.result.trim();

                  // Remove HTML tags for inline display
                  suggestion = suggestion.replace(/<[^>]*>/g, "");

                  // Get first sentence or limit to ~100 chars
                  const firstSentenceEnd = suggestion.search(/[.!?]/);
                  if (firstSentenceEnd > 0 && firstSentenceEnd < 150) {
                    suggestion = suggestion.slice(0, firstSentenceEnd + 1);
                  } else if (suggestion.length > 100) {
                    suggestion = suggestion.slice(0, 100) + "...";
                  }

                  resolve(suggestion);
                  return;
                }

                resolve("");
              } catch (err) {
                if ((err as Error).name !== "AbortError") {
                  console.error("Failed to fetch AI suggestion:", err);
                }
                resolve("");
              }
            }, 800);
          });
        },
      }),
    ],
    content: ensureValidHtml(content),
    editorProps: {
      attributes: {
        class:
          "prose max-w-none w-full focus:outline-none min-h-[400px] px-4 py-3",
      },
      handleClick: (_view, _pos, event) => {
        const { target } = event;
        if (target && (target as HTMLElement).tagName === "A") {
          event.preventDefault();
          handleLinkEdit(target as HTMLElement);
          return true;
        }
        return false;
      },
      handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer?.files?.[0]) {
          const file = event.dataTransfer.files[0];
          const pos = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });

          if (file.type.startsWith("image/")) {
            event.preventDefault();
            uploadImage(file)
              .then((url) => {
                if (pos && view.state.schema.nodes.customImage) {
                  view.dispatch(
                    view.state.tr.insert(
                      pos.pos,
                      view.state.schema.nodes.customImage.create({
                        src: url,
                        alignment: "center",
                        width: "100%",
                      })
                    )
                  );
                }
              })
              .catch(console.error);
            return true;
          }

          if (file.type.startsWith("video/")) {
            event.preventDefault();
            uploadVideo(file)
              .then((url) => {
                if (pos && view.state.schema.nodes.customVideo) {
                  view.dispatch(
                    view.state.tr.insert(
                      pos.pos,
                      view.state.schema.nodes.customVideo.create({
                        src: url,
                        alignment: "center",
                        width: "100%",
                      })
                    )
                  );
                }
              })
              .catch(console.error);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const { from } = editor.state.selection;
      const textBeforeCursor = editor.state.doc.textBetween(0, from);
      const lines = textBeforeCursor.split("\n");
      const currentLine = lines[lines.length - 1];

      if (currentLine?.endsWith("/")) {
        const { $from } = editor.state.selection;
        const coords = editor.view.coordsAtPos($from.pos);
        editorDialogActions.openCommandMenu({
          position: { top: coords.top + 24, left: coords.left },
        });
      } else if (editorState.commandMenu.open && !currentLine?.endsWith("/")) {
        editorDialogActions.closeCommandMenu();
      }
      if (onChange) onChange(editor.getHTML());
    },
  });

  // Update editor content when content prop changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      const { from, to } = editor.state.selection;
      editor.commands.setContent(ensureValidHtml(content), {
        emitUpdate: false,
      });
      // Restore cursor position if possible
      if (from === to) {
        editor.commands.setTextSelection(
          Math.min(from, editor.state.doc.content.size)
        );
      }
    }
  }, [content, editor]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && editorState.commandMenu.open) {
        editorDialogActions.closeCommandMenu();
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editorState.commandMenu.open]);

  const handleCommand = (command: string) => {
    if (!editor) return;
    const insertPos = (window as any).nodeHoverInsertPos;
    delete (window as any).nodeHoverInsertPos;

    if (insertPos !== undefined) {
      editor.chain().focus().setTextSelection(insertPos).run();
    } else {
      const { from } = editor.state.selection;
      const textBeforeCursor = editor.state.doc.textBetween(0, from);
      const lines = textBeforeCursor.split("\n");
      const currentLine = lines[lines.length - 1];
      if (currentLine) {
        const slashIndex = currentLine.lastIndexOf("/");
        if (slashIndex !== -1) {
          const deleteFrom = from - (currentLine.length - slashIndex);
          editor
            .chain()
            .focus()
            .deleteRange({ from: deleteFrom, to: from })
            .run();
        }
      }
    }

    switch (command) {
      case "heading1":
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case "heading2":
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case "heading3":
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case "bulletList":
        editor.chain().focus().toggleBulletList().run();
        break;
      case "orderedList":
        editor.chain().focus().toggleOrderedList().run();
        break;
      case "blockquote":
        editor.chain().focus().toggleBlockquote().run();
        break;
      case "divider":
        editor.chain().focus().setHorizontalRule().run();
        break;
      case "image":
        editorDialogActions.openImageDialog({
          src: "",
          alt: "",
          caption: "",
          width: "100%",
          alignment: "center",
        });
        break;
      case "video":
        editorDialogActions.openVideoDialog({
          src: "",
          title: "",
          width: "100%",
          alignment: "center",
        });
        break;
      case "link":
        setShowLinkDialog(true);
        break;
      case "callout":
      case "callout-info":
        editor.chain().focus().setCallout({ type: "info" }).run();
        break;
      case "callout-warning":
        editor.chain().focus().setCallout({ type: "warning" }).run();
        break;
      case "callout-success":
        editor.chain().focus().setCallout({ type: "success" }).run();
        break;
      case "callout-error":
        editor.chain().focus().setCallout({ type: "error" }).run();
        break;
      case "callout-tip":
        editor.chain().focus().setCallout({ type: "tip" }).run();
        break;
      case "details":
      case "collapse":
        editor
          .chain()
          .focus()
          .setDetails({ summary: "Click to expand", open: false })
          .run();
        break;
      case "chat":
      case "ai-improve":
      case "ai-expand":
      case "ai-continue": {
        // Open AI menu with specific action
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, " ");
        setSelectedTextForAI(selectedText || undefined);

        const coords = editor.view.coordsAtPos(from);
        setAIMenuPosition({ top: coords.top + 24, left: coords.left });

        // Map command to action
        const actionMap: Record<
          string,
          "improve" | "expand" | "continue" | "chat"
        > = {
          chat: "chat",
          "ai-improve": "improve",
          "ai-expand": "expand",
          "ai-continue": "continue",
        };
        setInitialAIAction(actionMap[command] || null);
        setShowAIMenu(true);
        break;
      }
    }
    editorDialogActions.closeCommandMenu();
  };

  const handleImageInsert = (data: {
    src: string;
    alt?: string;
    caption?: string;
    width?: string;
    alignment?: "left" | "center" | "right";
  }) => {
    if (editor) editor.chain().focus().setImage(data).run();
  };

  const handleLinkInsert = (data: {
    href: string;
    text?: string;
    title?: string;
    target?: "_blank" | "_self" | "_parent" | "_top";
  }) => {
    if (editor) {
      if (data.href)
        editor
          .chain()
          .focus()
          .setLink({ href: data.href, target: data.target || null })
          .run();
      else editor.chain().focus().unsetLink().run();
    }
  };

  const handleLinkEdit = (linkElement: HTMLElement) => {
    setEditingLink({
      href: linkElement.getAttribute("href") || "",
      text: linkElement.textContent || "",
      title: linkElement.getAttribute("title") || "",
      target:
        (linkElement.getAttribute("target") as
          | "_blank"
          | "_self"
          | "_parent"
          | "_top") || "_blank",
    });
    setShowLinkDialog(true);
  };

  const handleImageEdit = (imageElement: HTMLElement) => {
    const src = imageElement.getAttribute("src") || "";
    editorDialogActions.openImageDialog({
      src,
      alt: imageElement.getAttribute("alt") || "",
      caption: imageElement.getAttribute("data-caption") || "",
      width: imageElement.getAttribute("width") || "100%",
      alignment:
        (imageElement.getAttribute("data-alignment") as
          | "left"
          | "center"
          | "right") || "center",
    });
    if (editor) {
      let imagePos: number | null = null;
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "customImage" && node.attrs.src === src) {
          imagePos = pos;
          return false;
        }
        return true;
      });
      if (imagePos !== null)
        setTimeout(() => editor.commands.setNodeSelection(imagePos!), 0);
    }
  };

  const handleImageDelete = () => {
    if (editor) {
      const { from } = editor.state.selection;
      const node = editor.state.doc.nodeAt(from);
      if (node?.type.name === "customImage") {
        const tr = editor.state.tr.delete(from, from + node.nodeSize);
        editor.view.dispatch(tr);
        editor.commands.focus();
      }
    }
    editorDialogActions.closeImageDialog();
  };

  const handleImageUpdate = (data: {
    src: string;
    alt?: string;
    caption?: string;
    width?: string;
    alignment?: "left" | "center" | "right";
  }) => {
    if (editor) {
      const { from } = editor.state.selection;
      const node = editor.state.doc.nodeAt(from);
      if (node?.type.name === "customImage") {
        editor.chain().focus().setImage(data).run();
      } else {
        let imagePos: number | null = null;
        editor.state.doc.descendants((node, pos) => {
          if (node.type.name === "customImage" && node.attrs.src === data.src) {
            imagePos = pos;
            return false;
          }
          return true;
        });
        if (imagePos !== null) {
          editor.commands.setNodeSelection(imagePos);
          editor.chain().focus().setImage(data).run();
        } else {
          editor.chain().focus().setImage(data).run();
        }
      }
    }
  };

  const handleVideoInsert = (data: {
    src: string;
    title?: string;
    width?: string;
    alignment?: "left" | "center" | "right";
  }) => {
    if (editor) editor.chain().focus().setVideo(data).run();
  };

  const handleVideoDelete = () => {
    if (editor) {
      const { from } = editor.state.selection;
      const node = editor.state.doc.nodeAt(from);
      if (node?.type.name === "customVideo")
        editor.chain().focus().deleteSelection().run();
    }
    editorDialogActions.closeVideoDialog();
  };

  const handleVideoUpdate = (data: {
    src: string;
    title?: string;
    width?: string;
    alignment?: "left" | "center" | "right";
  }) => {
    if (editor) {
      const { from } = editor.state.selection;
      const node = editor.state.doc.nodeAt(from);
      if (node?.type.name === "customVideo") {
        editor.chain().focus().setVideo(data).run();
      } else {
        editor.chain().focus().setVideo(data).run();
      }
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + K - AI assistant
      if (isMod && e.key === "k") {
        e.preventDefault();
        if (editor) {
          const { from, to } = editor.state.selection;
          const selectedText = editor.state.doc.textBetween(from, to, " ");
          setSelectedTextForAI(selectedText || undefined);

          const coords = editor.view.coordsAtPos(from);
          setAIMenuPosition({ top: coords.top + 24, left: coords.left });
          setShowAIMenu(true);
        }
        return;
      }

      // Cmd/Ctrl + S - Save
      if (isMod && e.key === "s") {
        e.preventDefault();
        handleSave();
        return;
      }

      // Cmd/Ctrl + / - Open command menu
      if (isMod && e.key === "/") {
        e.preventDefault();
        if (editor) {
          const { from } = editor.state.selection;
          const coords = editor.view.coordsAtPos(from);
          editorDialogActions.openCommandMenu({
            position: { top: coords.top + 24, left: coords.left },
          });
        }
        return;
      }

      // Cmd/Ctrl + ? (Shift + /) - Show shortcuts help
      if (isMod && e.shiftKey && e.key === "?") {
        e.preventDefault();
        setShowShortcutsDialog(true);
        return;
      }

      // Cmd/Ctrl + Shift + L - Insert link
      if (isMod && e.shiftKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setShowLinkDialog(true);
        return;
      }

      // Cmd/Ctrl + Shift + I - Insert image
      if (isMod && e.shiftKey && e.key.toLowerCase() === "i") {
        e.preventDefault();
        editorDialogActions.openImageDialog({
          src: "",
          alt: "",
          caption: "",
          width: "100%",
          alignment: "center",
        });
        return;
      }

      // Cmd/Ctrl + Shift + H - Highlight
      if (isMod && e.shiftKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        editor?.chain().focus().toggleHighlight().run();
        return;
      }

      // Cmd/Ctrl + Shift + B - Blockquote
      if (isMod && e.shiftKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        editor?.chain().focus().toggleBlockquote().run();
        return;
      }

      // Cmd/Ctrl + Alt + 1/2/3 - Headings
      if (isMod && e.altKey && ["1", "2", "3"].includes(e.key)) {
        e.preventDefault();
        const level = parseInt(e.key) as 1 | 2 | 3;
        editor?.chain().focus().toggleHeading({ level }).run();
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editor, handleSave]);

  if (!editor) return null;

  return (
    <div
      className="relative w-full h-full"
      role="application"
      aria-label="Rich text editor"
    >
      <Toolbar
        editor={editor}
        onImageClick={() =>
          editorDialogActions.openImageDialog({
            src: "",
            alt: "",
            caption: "",
            width: "100%",
            alignment: "center",
          })
        }
        onVideoClick={() =>
          editorDialogActions.openVideoDialog({
            src: "",
            title: "",
            width: "100%",
            alignment: "center",
          })
        }
        onLinkClick={(initialData) => {
          if (initialData?.href) setEditingLink(initialData);
          setShowLinkDialog(true);
        }}
        onAIClick={() => {
          const { from, to } = editor.state.selection;
          const selectedText = editor.state.doc.textBetween(from, to, " ");
          setSelectedTextForAI(selectedText || undefined);

          const coords = editor.view.coordsAtPos(from);
          setAIMenuPosition({ top: coords.top + 24, left: coords.left });
          setShowAIMenu(true);
        }}
      />
      <div className="relative bg-card">
        <FloatingToolbar
          editor={editor}
          onLinkClick={() => setShowLinkDialog(true)}
          onAIClick={() => {
            const { from, to } = editor.state.selection;
            const selectedText = editor.state.doc.textBetween(from, to, " ");
            setSelectedTextForAI(selectedText || undefined);

            const coords = editor.view.coordsAtPos(from);
            setAIMenuPosition({ top: coords.top + 24, left: coords.left });
            setShowAIMenu(true);
          }}
        />
        <EditorContent
          editor={editor}
          aria-label="Post content editor. Type / for commands, use arrow right for autocomplete suggestions."
          onClick={(e) => {
            const target = e.target as HTMLElement;
            const imgElement =
              target.tagName === "IMG"
                ? target
                : (target.closest(".image-wrapper img") as HTMLElement | null);
            if (imgElement) {
              e.preventDefault();
              e.stopPropagation();
              handleImageEdit(imgElement);
            }
          }}
          onDoubleClick={(e) => {
            const target = e.target as HTMLElement;
            const linkElement =
              target.tagName === "A"
                ? target
                : (target.closest("a") as HTMLElement | null);
            if (linkElement) {
              e.preventDefault();
              e.stopPropagation();
              handleLinkEdit(linkElement);
            }
          }}
        />

        {/* AI Command Menu */}
        {showAIMenu && (
          <AICommandMenu
            editor={editor}
            position={aiMenuPosition}
            onClose={() => {
              setShowAIMenu(false);
              setInitialAIAction(null);
            }}
            selectedText={selectedTextForAI}
            initialAction={initialAIAction}
          />
        )}

        {editorState.commandMenu.open && (
          <CommandMenu
            position={
              editorState.commandMenu.data?.position || { top: 0, left: 0 }
            }
            onSelect={handleCommand}
            onClose={() => editorDialogActions.closeCommandMenu()}
          />
        )}
        {editorState.imageDialog.open && (
          <ImageDialog
            open={editorState.imageDialog.open}
            onClose={() => editorDialogActions.closeImageDialog()}
            onInsert={
              editorState.imageDialog.data
                ? handleImageUpdate
                : handleImageInsert
            }
            {...(editorState.imageDialog.data && {
              onDelete: handleImageDelete,
              initialData: editorState.imageDialog.data,
            })}
          />
        )}
        {editorState.videoDialog.open && (
          <VideoDialog
            open={editorState.videoDialog.open}
            onClose={() => editorDialogActions.closeVideoDialog()}
            onInsert={
              editorState.videoDialog.data
                ? handleVideoUpdate
                : handleVideoInsert
            }
            {...(editorState.videoDialog.data && {
              onDelete: handleVideoDelete,
              initialData: editorState.videoDialog.data,
            })}
          />
        )}
        {showLinkDialog && (
          <LinkDialog
            open={showLinkDialog}
            onClose={() => {
              setShowLinkDialog(false);
              setEditingLink(null);
            }}
            onInsert={handleLinkInsert}
            {...(editingLink && { initialData: editingLink })}
          />
        )}
      </div>

      {/* Help button - floating bottom right */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg bg-background/80 backdrop-blur-sm hover:bg-background"
        onClick={() => setShowShortcutsDialog(true)}
        aria-label="Show keyboard shortcuts"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>

      {/* Keyboard shortcuts dialog */}
      <Dialog open={showShortcutsDialog} onOpenChange={setShowShortcutsDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4 px-4">
            {["General", "Formatting", "Blocks", "Insert", "AI", "History"].map(
              (category) => {
                const shortcuts = KEYBOARD_SHORTCUTS.filter(
                  (s) => s.category === category
                );
                if (shortcuts.length === 0) return null;
                return (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      {category}
                    </h3>
                    <div className="space-y-1">
                      {shortcuts.map((shortcut, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50"
                        >
                          <span className="text-sm">
                            {shortcut.description}
                          </span>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, keyIdx) => (
                              <kbd
                                key={keyIdx}
                                className="px-2 py-0.5 text-xs font-medium bg-muted rounded border border-border"
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-4 px-4 mb-4">
            Tip: Type{" "}
            <kbd className="px-1 py-0.5 text-xs bg-muted rounded border">/</kbd>{" "}
            in the editor to open the command menu.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
