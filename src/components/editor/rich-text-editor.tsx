import Dropcursor from "@tiptap/extension-dropcursor";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import { Gapcursor } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
import ColumnsContextMenu from "./columns-context-menu";
import CommandMenu from "./command-menu";
import { Bibliography, Citation, Footnote } from "./extensions/bibliography";
import { Column, Columns } from "./extensions/columns";
import { CustomImage } from "./extensions/custom-image";
import { MathLatex } from "./extensions/math-latex";
import { NodeHoverMenu } from "./extensions/node-hover-menu";
import { TableKit } from "./extensions/table";
import ImageDialog from "./image-dialog";
import LinkDialog from "./link-dialog";
import TableContextMenu from "./table-context-menu";
import TableTemplateSelector from "./table-template-selector";
import { advancedTableTemplates, createTableHTML } from "./table-utils";
import Toolbar from "./toolbar";
import ToolbarCitationDialog from "./toolbar-citation-dialog";
import ToolbarFootnoteDialog from "./toolbar-footnote-dialog";
import ToolbarLaTeXDialog from "./toolbar-latex-dialog";
import { uploadImage } from "./utils";
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
 const [showLaTeXDialog, setShowLaTeXDialog] = useState(false);
 const [showCitationDialog, setShowCitationDialog] = useState(false);
 const [showFootnoteDialog, setShowFootnoteDialog] = useState(false);
 const [editingMathLatex, setEditingMathLatex] = useState<{
  latex: string;
  inline: boolean;
  pos?: number;
  nodeType?: any;
 } | null>(null);
 const [editingCitation, setEditingCitation] = useState<{
  id: string;
  text: string;
  url: string;
  pos?: number;
  nodeType?: any;
 } | null>(null);
 const [editingFootnote, setEditingFootnote] = useState<{
  id: string;
  text: string;
  pos?: number;
  nodeType?: any;
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
   MathLatex,
   Citation,
   Footnote,
   Bibliography,
   NodeHoverMenu,
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
      const pos = view.posAtCoords({
       left: event.clientX,
       top: event.clientY,
      });

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

  const handleImageEdit = (e: CustomEvent) => {
   const imageData = e.detail;
   setEditingImage(imageData);
   setShowImageDialog(true);
  };

  const handleMathLatexEdit = (e: CustomEvent) => {
   const mathData = e.detail;
   setEditingMathLatex(mathData);
   setShowLaTeXDialog(true);
  };

  const handleCitationEdit = (e: CustomEvent) => {
   const citationData = e.detail;
   setEditingCitation(citationData);
   setShowCitationDialog(true);
  };

  const handleFootnoteEdit = (e: CustomEvent) => {
   const footnoteData = e.detail;
   setEditingFootnote(footnoteData);
   setShowFootnoteDialog(true);
  };

  const handleShowCommandMenu = (e: any) => {
   const { position, insertPos } = e.detail;

   // Store the insert position for use when executing commands
   if (insertPos !== undefined) {
    (window as any).nodeHoverInsertPos = insertPos;
   }

   if (position && position.top !== undefined && position.left !== undefined) {
    setCommandMenuPosition(position);
    setShowCommandMenu(true);
   } else {
    console.error("Invalid position data received:", position);
   }
  };

  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("imageEdit", handleImageEdit as EventListener);
  document.addEventListener(
   "editMathLatex",
   handleMathLatexEdit as EventListener
  );
  document.addEventListener(
   "editCitation",
   handleCitationEdit as EventListener
  );
  document.addEventListener(
   "editFootnote",
   handleFootnoteEdit as EventListener
  );
  document.addEventListener("showCommandMenu", handleShowCommandMenu);

  return () => {
   document.removeEventListener("keydown", handleKeyDown);
   document.removeEventListener("imageEdit", handleImageEdit as EventListener);
   document.removeEventListener(
    "editMathLatex",
    handleMathLatexEdit as EventListener
   );
   document.removeEventListener(
    "editCitation",
    handleCitationEdit as EventListener
   );
   document.removeEventListener(
    "editFootnote",
    handleFootnoteEdit as EventListener
   );
   document.removeEventListener("showCommandMenu", handleShowCommandMenu);
  };
 }, [showCommandMenu]);

 const handleCommand = (command: string) => {
  if (!editor) return;

  // Check if we have a specific insert position from node hover menu
  const insertPos = (window as any).nodeHoverInsertPos;

  // Clean up the stored position
  delete (window as any).nodeHoverInsertPos;

  if (insertPos !== undefined) {
   // Use the specific insert position from node hover menu

   // Set selection at the insert position
   editor.chain().focus().setTextSelection(insertPos).run();
  } else {
   // Handle slash command cleanup for regular slash commands
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
   case "mathLatex":
    setShowLaTeXDialog(true);
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
   case "threeColumns":
    editor.chain().focus().setThreeColumns().run();
    break;
   case "fourColumns":
    editor.chain().focus().setFourColumns().run();
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
   case "citation":
    setShowCitationDialog(true);
    break;
   case "footnote":
    setShowFootnoteDialog(true);
    break;
   case "bibliography":
    editor.chain().focus().setBibliography().run();
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
   let imagePos: number | null = null;
   editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "customImage" && node.attrs.src === src) {
     imagePos = pos;
     return false; // Stop searching
    }
   });

   if (imagePos !== null) {
    // Use setTimeout to ensure the dialog state is set before selecting the node
    setTimeout(() => {
     editor.commands.setNodeSelection(imagePos!);
    }, 0);
   }
  }
 };

 const handleImageDelete = () => {
  if (editor) {
   // Delete the currently selected image node
   const { from } = editor.state.selection;
   const node = editor.state.doc.nodeAt(from);

   if (node && node.type.name === "customImage") {
    editor.chain().focus().deleteSelection().run();
   }
  }
  setShowImageDialog(false);
  setEditingImage(null);
 };

 const handleImageUpdate = (data: {
  src: string;
  alt?: string;
  caption?: string;
  width?: string;
  alignment?: "left" | "center" | "right";
 }) => {
  if (editor) {
   // Check if we're currently on an image node (from double-click selection)
   const { from } = editor.state.selection;
   const node = editor.state.doc.nodeAt(from);

   if (node && node.type.name === "customImage") {
    // We're positioned on an image node, update it directly
    editor.chain().focus().setImage(data).run();
   } else {
    // Fallback: search for the image by src attribute
    // This handles cases where the selection might not be perfect
    let imagePos: number | null = null;
    editor.state.doc.descendants((node, pos) => {
     if (node.type.name === "customImage" && node.attrs.src === data.src) {
      imagePos = pos;
      return false; // Stop searching
     }
    });

    if (imagePos !== null) {
     // Select the found image and update it
     editor.commands.setNodeSelection(imagePos);
     editor.chain().focus().setImage(data).run();
    } else {
     // If no existing image found, insert as new image
     editor.chain().focus().setImage(data).run();
    }
   }
  }
 };

 const handleLaTeXInsert = (latex: string, inline?: boolean) => {
  if (editor) {
   editor
    .chain()
    .focus()
    .setMathLatex({ latex, inline: inline || false })
    .run();
  }
 };

 const handleCitationInsert = (data: {
  id: string;
  text: string;
  url?: string;
 }) => {
  if (editor) {
   editor.chain().focus().setCitation(data).run();
  }
 };

 const handleFootnoteInsert = (data: { id: string; text: string }) => {
  if (editor) {
   editor.chain().focus().setFootnote(data).run();
  }
 };

 const handleMathLatexUpdate = (latex: string, inline?: boolean) => {
  if (editor && editingMathLatex) {
   const { pos, nodeType } = editingMathLatex;
   if (typeof pos === "number") {
    editor
     .chain()
     .focus()
     .setNodeSelection(pos)
     .updateAttributes(nodeType, { latex, inline: inline || false })
     .run();
   }
  }
 };

 const handleCitationUpdate = (data: {
  id: string;
  text: string;
  url?: string;
 }) => {
  if (editor && editingCitation) {
   const { pos, nodeType } = editingCitation;
   if (typeof pos === "number") {
    editor
     .chain()
     .focus()
     .setNodeSelection(pos)
     .updateAttributes(nodeType, data)
     .run();
   }
  }
 };

 const handleFootnoteUpdate = (data: { id: string; text: string }) => {
  if (editor && editingFootnote) {
   const { pos, nodeType } = editingFootnote;
   if (typeof pos === "number") {
    editor
     .chain()
     .focus()
     .setNodeSelection(pos)
     .updateAttributes(nodeType, data)
     .run();
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
     <ColumnsContextMenu editor={editor}>
      <EditorContent
       editor={editor}
       onClick={(e) => {
        const target = e.target as HTMLElement;
        // Check if the target is an image or is inside an image wrapper
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
     </ColumnsContextMenu>
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
      {...(editingImage && { onDelete: handleImageDelete })}
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
    {showLaTeXDialog && (
     <ToolbarLaTeXDialog
      open={showLaTeXDialog}
      onClose={() => {
       setShowLaTeXDialog(false);
       setEditingMathLatex(null);
      }}
      onInsert={editingMathLatex ? handleMathLatexUpdate : handleLaTeXInsert}
      {...(editingMathLatex && {
       initialData: {
        latex: editingMathLatex.latex,
        inline: editingMathLatex.inline,
       },
      })}
     />
    )}
    {showCitationDialog && (
     <ToolbarCitationDialog
      open={showCitationDialog}
      onClose={() => {
       setShowCitationDialog(false);
       setEditingCitation(null);
      }}
      onInsert={editingCitation ? handleCitationUpdate : handleCitationInsert}
      {...(editingCitation && {
       initialData: {
        id: editingCitation.id,
        text: editingCitation.text,
        url: editingCitation.url,
       },
      })}
     />
    )}
    {showFootnoteDialog && (
     <ToolbarFootnoteDialog
      open={showFootnoteDialog}
      onClose={() => {
       setShowFootnoteDialog(false);
       setEditingFootnote(null);
      }}
      onInsert={editingFootnote ? handleFootnoteUpdate : handleFootnoteInsert}
      {...(editingFootnote && {
       initialData: {
        id: editingFootnote.id,
        text: editingFootnote.text,
       },
      })}
     />
    )}
   </div>
  </div>
 );
}
