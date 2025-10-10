import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Gapcursor } from "@tiptap/extensions";
import Link from "@tiptap/extension-link";
import { TextStyle, Color } from "@tiptap/extension-text-style";
import Dropcursor from "@tiptap/extension-dropcursor";
import { useEffect, useState } from "react";
import Toolbar from "./toolbar";
import CommandMenu from "./command-menu";
import ImageDialog from "./image-dialog";
import LinkDialog from "./link-dialog";
import TableContextMenu from "./table-context-menu";
import TableTemplateSelector from "./table-template-selector";
import { CustomImage } from "./extensions/custom-image";
import { Columns, Column } from "./extensions/columns";
import { TableKit } from "./extensions/table";
import { uploadImage } from "./utils";
import { createTableHTML, advancedTableTemplates } from "./table-utils";
import "./table-styles.css";

// Simplified HTML content handler - no markdown conversion needed
const ensureValidHtml = (content: string) => {
 if (!content) return "";

 // If content is already HTML, return as-is
 if (content.trim().startsWith("<")) {
  return content;
 }

 // If content appears to be plain text, wrap in paragraph
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
 const [showCommandMenu, setShowCommandMenu] = useState(false);
 const [commandMenuPosition, setCommandMenuPosition] = useState({
  top: 0,
  left: 0,
 });
 const [showImageDialog, setShowImageDialog] = useState(false);
 const [showLinkDialog, setShowLinkDialog] = useState(false);
 const [showTableTemplateSelector, setShowTableTemplateSelector] =
  useState(false);
 const [editingImage, setEditingImage] = useState<{
  src?: string;
  alt?: string;
  caption?: string;
  width?: string;
  alignment?: "left" | "center" | "right";
 } | null>(null);
 const [editingLink, setEditingLink] = useState<{
  href?: string;
  text?: string;
  title?: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
 } | null>(null);

 const editor = useEditor({
  immediatelyRender: false,
  extensions: [
   Gapcursor,
   StarterKit.configure({
    heading: {
     levels: [1, 2, 3],
    },
   }),
   Placeholder.configure({
    placeholder: ({ node }) => {
     if (node.type.name === "heading") {
      return "Heading";
     }
     return "Type '/' for commands or start writing...";
    },
   }),
   Typography,
   Underline,
   TextAlign.configure({
    types: ["heading", "paragraph"],
   }),
   Highlight.configure({
    multicolor: true,
    HTMLAttributes: {
     style: "background-color: var(--highlight-color);",
    },
   }),
   TextStyle,
   TaskList,
   TaskItem.configure({
    nested: true,
   }),
   Link.configure({
    openOnClick: false,
    HTMLAttributes: {
     class: "text-blue-600 hover:text-blue-800 underline",
     style: "cursor: pointer;",
    },
   }),
   Color,
   Dropcursor.configure({
    color: "#3b82f6",
    width: 2,
    class: "custom-dropcursor",
   }),
   CustomImage,
   Columns,
   Column,
   TableKit.table,
   TableKit.tableRow,
   TableKit.tableHeader,
   TableKit.tableCell,
  ],
  content: ensureValidHtml(content),
  editorProps: {
   attributes: {
    class:
     "prose max-w-none w-full focus:outline-none max-h-[calc(100vh-12rem)] overflow-y-auto px-6 py-2 relative group",
   },
   handleClick: (view, pos, event) => {
    const { target } = event;
    if (target && (target as HTMLElement).tagName === "A") {
     event.preventDefault();
     event.stopPropagation();
     handleLinkEdit(target as HTMLElement);
     return true;
    }
    return false;
   },
   handleDrop: (view, event, slice, moved) => {
    if (
     !moved &&
     event.dataTransfer &&
     event.dataTransfer.files &&
     event.dataTransfer.files[0]
    ) {
     const file = event.dataTransfer.files[0];
     if (file.type.startsWith("image/")) {
      event.preventDefault();
      const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });

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
       .catch((err) => {
        console.error("Failed to upload image:", err);
       });

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

   // Check if current line ends with "/" (for slash commands)
   if (currentLine && currentLine.endsWith("/")) {
    const { $from } = editor.state.selection;
    const coords = editor.view.coordsAtPos($from.pos);
    setCommandMenuPosition({ top: coords.top + 30, left: coords.left });
    setShowCommandMenu(true);
   } else if (showCommandMenu && (!currentLine || !currentLine.endsWith("/"))) {
    setShowCommandMenu(false);
   }

   if (onChange) {
    const html = editor.getHTML();
    onChange(html);
   }
  },
 });

 useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
   if (e.key === "Escape" && showCommandMenu) {
    setShowCommandMenu(false);
    e.preventDefault();
   }
  };

  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
 }, [showCommandMenu]);

 const handleCommand = (command: string) => {
  if (!editor) return;

  const { from } = editor.state.selection;
  const textBeforeCursor = editor.state.doc.textBetween(0, from);
  const lines = textBeforeCursor.split("\n");
  const currentLine = lines[lines.length - 1];

  if (currentLine) {
   const slashIndex = currentLine.lastIndexOf("/");
   if (slashIndex !== -1) {
    const deleteFrom = from - (currentLine.length - slashIndex);
    editor.chain().focus().deleteRange({ from: deleteFrom, to: from }).run();
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
   case "taskList":
    editor.chain().focus().toggleTaskList().run();
    break;
   case "blockquote":
    editor.chain().focus().toggleBlockquote().run();
    break;
   case "codeBlock":
    editor.chain().focus().toggleCodeBlock().run();
    break;
   case "divider":
    editor.chain().focus().setHorizontalRule().run();
    break;
   case "image":
    setShowImageDialog(true);
    break;
   case "link":
    setShowLinkDialog(true);
    break;
   case "twoColumns":
    editor.chain().focus().setTwoColumns().run();
    break;
   case "table":
    editor.chain().focus().insertContent(createTableHTML(3, 3)).run();
    break;
   case "table-2x2":
    editor.chain().focus().insertContent(createTableHTML(2, 2)).run();
    break;
   case "table-3x3":
    editor.chain().focus().insertContent(createTableHTML(3, 3)).run();
    break;
   case "table-large":
    editor.chain().focus().insertContent(createTableHTML(5, 5)).run();
    break;
  }

  setShowCommandMenu(false);
 };

 const handleImageInsert = (data: {
  src: string;
  alt?: string;
  caption?: string;
  width?: string;
  alignment?: "left" | "center" | "right";
 }) => {
  if (editor) {
   editor.chain().focus().setImage(data).run();
  }
 };

 const handleTableTemplateSelect = (templateId: string) => {
  if (editor) {
   const template = advancedTableTemplates[templateId];
   if (template && template.data) {
    // Create table using Tiptap's table commands
    const { rows, cols } = template.template;

    // Insert empty table first
    editor
     .chain()
     .focus()
     .insertTable({ rows, cols, withHeaderRow: true })
     .run();

    // For now, just create the table structure
    // TODO: Add logic to populate cells with template data
    console.log("Template selected:", templateId, "Data:", template.data);
   } else {
    // Fallback for basic table creation based on template ID
    let rows = 3;
    let cols = 3;

    switch (templateId) {
     case "table-2x2":
      rows = 2;
      cols = 2;
      break;
     case "table-3x3":
      rows = 3;
      cols = 3;
      break;
     case "table-large":
      rows = 5;
      cols = 5;
      break;
     default:
      rows = 3;
      cols = 3;
    }

    editor
     .chain()
     .focus()
     .insertTable({ rows, cols, withHeaderRow: true })
     .run();
   }
  }
 };

 const handleLinkInsert = (data: {
  href: string;
  text?: string;
  title?: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
 }) => {
  if (editor) {
   if (data.href) {
    editor
     .chain()
     .focus()
     .setLink({ href: data.href, target: data.target || null })
     .run();
   } else {
    editor.chain().focus().unsetLink().run();
   }
  }
 };

 const handleLinkEdit = (linkElement: HTMLElement) => {
  const href = linkElement.getAttribute("href") || "";
  const title = linkElement.getAttribute("title") || "";
  const target =
   (linkElement.getAttribute("target") as
    | "_blank"
    | "_self"
    | "_parent"
    | "_top") || "_blank";
  const text = linkElement.textContent || "";

  setEditingLink({
   href,
   text,
   title,
   target,
  });
  setShowLinkDialog(true);
 };

 const handleImageEdit = (imageElement: HTMLElement) => {
  const src = imageElement.getAttribute("src") || "";
  const alt = imageElement.getAttribute("alt") || "";
  const width = imageElement.getAttribute("width") || "100%";
  const alignment =
   (imageElement.getAttribute("data-alignment") as
    | "left"
    | "center"
    | "right") || "center";
  const caption = imageElement.getAttribute("data-caption") || "";

  setEditingImage({
   src,
   alt,
   caption,
   width,
   alignment,
  });
  setShowImageDialog(true);

  // Find and select the image node for proper updating
  if (editor) {
   // Search for the image node by src attribute
   let imagePos = null;
   editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "customImage" && node.attrs.src === src) {
     imagePos = pos;
     return false; // Stop searching
    }
   });

   if (imagePos !== null) {
    editor.commands.setNodeSelection(imagePos);
   }
  }
 };

 const handleImageUpdate = (data: {
  src: string;
  alt?: string;
  caption?: string;
  width?: string;
  alignment?: "left" | "center" | "right";
 }) => {
  if (editor) {
   // For image updates, we need to find and replace the existing image
   // Since the selection might not be properly set, we'll search for the image by src
   const { from } = editor.state.selection;

   // First, try to find the image node at current position
   const node = editor.state.doc.nodeAt(from);
   if (node && node.type.name === "customImage") {
    // We're positioned on an image node, update it
    editor.chain().focus().setImage(data).run();
    return;
   }

   // If not at current position, search for the image by src attribute
   let imagePos = null;
   let imageNode = null;

   editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "customImage" && node.attrs.src === data.src) {
     imagePos = pos;
     imageNode = node;
     return false; // Stop searching
    }
   });

   if (imagePos !== null && imageNode) {
    // Select the found image and update it
    editor.commands.setNodeSelection(imagePos);
    editor.chain().focus().setImage(data).run();
   } else {
    // Fallback: if image not found, this might be a new image
    editor.chain().focus().setImage(data).run();
   }
  }
 };

 if (!editor) {
  return null;
 }

 return (
  <div className="relative w-full h-full">
   <Toolbar
    editor={editor}
    onImageClick={() => setShowImageDialog(true)}
    onTableClick={() => setShowTableTemplateSelector(true)}
    onLinkClick={(initialData) => {
     if (initialData?.href) {
      setEditingLink(initialData);
     }
     setShowLinkDialog(true);
    }}
   />
   <div className="relative bg-white">
    <TableContextMenu editor={editor}>
     <EditorContent
      editor={editor}
      onDoubleClick={(e) => {
       const target = e.target as HTMLElement;
       if (target && target.tagName === "IMG") {
        e.preventDefault();
        e.stopPropagation();
        handleImageEdit(target);
       } else if (target && target.tagName === "A") {
        e.preventDefault();
        e.stopPropagation();
        handleLinkEdit(target);
       }
      }}
     />
    </TableContextMenu>
    {showCommandMenu && (
     <CommandMenu
      position={commandMenuPosition}
      onSelect={handleCommand}
      onClose={() => setShowCommandMenu(false)}
     />
    )}
    {showImageDialog && (
     <ImageDialog
      open={showImageDialog}
      onClose={() => {
       setShowImageDialog(false);
       setEditingImage(null);
      }}
      onInsert={editingImage ? handleImageUpdate : handleImageInsert}
      {...(editingImage && { initialData: editingImage })}
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
    {showTableTemplateSelector && (
     <TableTemplateSelector
      open={showTableTemplateSelector}
      onClose={() => setShowTableTemplateSelector(false)}
      onSelect={handleTableTemplateSelect}
     />
    )}
   </div>
  </div>
 );
}
