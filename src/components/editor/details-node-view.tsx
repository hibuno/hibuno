import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DetailsComponent({
  node,
  updateAttributes,
  editor,
}: NodeViewProps) {
  const [isOpen, setIsOpen] = useState(node.attrs.open as boolean);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [summaryText, setSummaryText] = useState(node.attrs.summary as string);

  const handleToggle = () => {
    const newOpen = !isOpen;
    setIsOpen(newOpen);
    updateAttributes({ open: newOpen });
  };

  const handleSummaryEdit = () => {
    setIsEditingSummary(true);
  };

  const handleSummaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSummaryText(e.target.value);
  };

  const handleSummaryBlur = () => {
    setIsEditingSummary(false);
    if (summaryText.trim()) {
      updateAttributes({ summary: summaryText });
    } else {
      setSummaryText(node.attrs.summary);
    }
  };

  const handleSummaryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSummaryBlur();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setSummaryText(node.attrs.summary);
      setIsEditingSummary(false);
    }
  };

  const handleDelete = () => {
    const { from } = editor.state.selection;
    const pos = editor.view.posAtDOM(editor.view.domAtPos(from).node, 0);
    editor.commands.deleteRange({ from: pos, to: pos + node.nodeSize });
  };

  return (
    <NodeViewWrapper className="collapsible border border-gray-200 rounded-lg my-4 overflow-hidden group">
      <div className="relative">
        <div
          className="collapsible-summary flex items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
          onClick={handleToggle}
        >
          <button
            type="button"
            className="flex-shrink-0 text-gray-600 hover:text-gray-900 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
          >
            {isOpen ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>

          {isEditingSummary ? (
            <Input
              type="text"
              value={summaryText}
              onChange={handleSummaryChange}
              onBlur={handleSummaryBlur}
              onKeyDown={handleSummaryKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 h-8"
              autoFocus
            />
          ) : (
            <span
              className="flex-1 font-medium text-gray-900"
              onDoubleClick={(e) => {
                e.stopPropagation();
                handleSummaryEdit();
              }}
            >
              {node.attrs.summary}
            </span>
          )}
        </div>

        {/* Hover menu */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              handleSummaryEdit();
            }}
          >
            Edit Title
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="collapsible-content p-4 bg-white border-t border-gray-200">
          <NodeViewContent />
        </div>
      )}
    </NodeViewWrapper>
  );
}
