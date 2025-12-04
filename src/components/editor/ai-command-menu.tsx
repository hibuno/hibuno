"use client";

import type { Editor } from "@tiptap/react";
import {
  BookOpen,
  FileText,
  Loader2,
  MessageSquare,
  PenLine,
  RefreshCw,
  Send,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { generateContent, chat, type GenerationType } from "@/lib/ai-service";

interface AICommandMenuProps {
  editor: Editor;
  position: { top: number; left: number };
  onClose: () => void;
  selectedText?: string | undefined;
}

type Mode = "actions" | "chat" | "result";

interface AIAction {
  id: GenerationType | "chat";
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
}

const AI_ACTIONS: AIAction[] = [
  {
    id: "improve",
    label: "Improve writing",
    icon: <Wand2 size={14} />,
    shortcut: "1",
  },
  {
    id: "expand",
    label: "Make longer",
    icon: <BookOpen size={14} />,
    shortcut: "2",
  },
  {
    id: "summarize",
    label: "Make shorter",
    icon: <FileText size={14} />,
    shortcut: "3",
  },
  {
    id: "rewrite",
    label: "Rewrite",
    icon: <RefreshCw size={14} />,
    shortcut: "4",
  },
  {
    id: "continue",
    label: "Continue writing",
    icon: <PenLine size={14} />,
    shortcut: "5",
  },
  {
    id: "chat",
    label: "Ask AI anything...",
    icon: <MessageSquare size={14} />,
    shortcut: "6",
  },
];

export default function AICommandMenu({
  editor,
  position,
  onClose,
  selectedText,
}: AICommandMenuProps) {
  const [mode, setMode] = useState<Mode>("actions");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (mode === "chat") {
      chatInputRef.current?.focus();
    } else if (mode === "actions") {
      inputRef.current?.focus();
    }
  }, [mode]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        if (!loading) onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [loading, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === "actions") {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % AI_ACTIONS.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex(
            (prev) => (prev - 1 + AI_ACTIONS.length) % AI_ACTIONS.length
          );
        } else if (e.key === "Enter") {
          e.preventDefault();
          const action = AI_ACTIONS[selectedIndex];
          if (action) handleAction(action.id);
        } else if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        } else if (e.key >= "1" && e.key <= "6") {
          e.preventDefault();
          const index = parseInt(e.key) - 1;
          if (AI_ACTIONS[index]) {
            handleAction(AI_ACTIONS[index].id);
          }
        }
      } else if (mode === "result") {
        if (e.key === "Enter") {
          e.preventDefault();
          applyResult();
        } else if (e.key === "Escape") {
          e.preventDefault();
          discardResult();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mode, selectedIndex, onClose]);

  const getTextContent = () => {
    // First check if selectedText prop was passed
    if (selectedText && selectedText.trim()) return selectedText;

    // Then try to get from current selection
    const { from, to, empty } = editor.state.selection;
    if (!empty) {
      const text = editor.state.doc.textBetween(from, to, " ");
      if (text.trim()) return text;
    }

    return "";
  };

  const getFullContent = () => {
    const fullText = editor.state.doc.textContent;
    return fullText.trim();
  };

  const handleAction = async (actionId: GenerationType | "chat") => {
    if (actionId === "chat") {
      setMode("chat");
      return;
    }

    const text = getTextContent();

    // For continue action, we don't need selected text
    if (actionId === "continue") {
      setLoading(true);
      setActiveAction(actionId);
      setError(null);

      try {
        const { from } = editor.state.selection;
        let content = editor.state.doc.textBetween(0, from, " ");

        // Remove HTML tags and check for actual content
        const textContent = content.replace(/<[^>]*>/g, "").trim();

        if (!textContent || textContent.length < 10) {
          setError(
            "Please write at least a few sentences before using 'Continue writing'"
          );
          setLoading(false);
          return;
        }

        if (content.length > 2000) {
          content = content.slice(-2000);
        }

        const response = await generateContent({
          type: actionId,
          content,
        });

        setResult(response.result);
        setMode("result");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate");
      } finally {
        setLoading(false);
      }
      return;
    }

    // For other actions, we need selected text
    if (!text) {
      const fullContent = getFullContent();
      if (fullContent && fullContent.length > 10) {
        setError("Please select the text you want to improve");
      } else {
        setError(
          "Please write some content first, then select the text you want to improve"
        );
      }
      return;
    }

    setLoading(true);
    setActiveAction(actionId);
    setError(null);

    try {
      const response = await generateContent({
        type: actionId,
        content: text,
      });

      setResult(response.result);
      setMode("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const text = getTextContent();
      const systemPrompt = text
        ? `You are a helpful writing assistant. The user has selected the following text:\n\n"${text}"\n\nHelp them with their request. If they ask for changes, provide the modified text in HTML format.`
        : "You are a helpful writing assistant. Help the user with their writing request. Provide responses in HTML format when appropriate.";

      const response = await chat([
        { role: "system", content: systemPrompt },
        { role: "user", content: chatInput },
      ]);

      setResult(response);
      setMode("result");
      setActiveAction("chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get response");
    } finally {
      setLoading(false);
    }
  };

  const applyResult = () => {
    if (!result) return;

    const { from, to, empty } = editor.state.selection;

    if (activeAction === "continue" || activeAction === "chat") {
      editor
        .chain()
        .focus()
        .insertContentAt(empty ? from : to, result)
        .run();
    } else if (!empty) {
      editor
        .chain()
        .focus()
        .deleteRange({ from, to })
        .insertContentAt(from, result)
        .run();
    }

    onClose();
  };

  const discardResult = () => {
    setResult(null);
    setMode("actions");
    setActiveAction(null);
  };

  // Adjust position to keep dialog on screen
  const adjustedPosition = { ...position };
  if (typeof window !== "undefined") {
    const dialogWidth = mode === "result" ? 500 : 320;
    const dialogHeight = 400;

    // Keep within horizontal bounds
    if (adjustedPosition.left + dialogWidth > window.innerWidth - 20) {
      adjustedPosition.left = window.innerWidth - dialogWidth - 20;
    }
    if (adjustedPosition.left < 20) {
      adjustedPosition.left = 20;
    }

    // Keep within vertical bounds
    if (adjustedPosition.top + dialogHeight > window.innerHeight - 20) {
      adjustedPosition.top = window.innerHeight - dialogHeight - 20;
    }
    if (adjustedPosition.top < 20) {
      adjustedPosition.top = 20;
    }
  }

  return (
    <div
      ref={menuRef}
      className={`fixed bg-card rounded-lg shadow-xl border border-border overflow-hidden animate-in z-[9999] ${
        mode === "result" ? "w-[500px]" : "w-80"
      }`}
      style={{ top: adjustedPosition.top, left: adjustedPosition.left }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-medium">AI Assistant</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <X className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div
        className={
          mode === "result"
            ? "max-h-[500px] overflow-y-auto"
            : "max-h-96 overflow-y-auto"
        }
      >
        {error && (
          <div className="px-3 py-2 text-xs text-red-600 bg-red-50 border-b border-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
            <span className="ml-2 text-sm text-muted-foreground">
              {activeAction === "chat" ? "Thinking..." : "Generating..."}
            </span>
          </div>
        ) : mode === "actions" ? (
          <div className="py-1">
            {AI_ACTIONS.map((action, index) => (
              <button
                key={action.id}
                onClick={() => handleAction(action.id)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full px-3 py-2 flex items-center justify-between text-left transition-colors ${
                  index === selectedIndex
                    ? "bg-foreground text-background"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={
                      index === selectedIndex
                        ? "text-background"
                        : "text-muted-foreground"
                    }
                  >
                    {action.icon}
                  </span>
                  <span className="text-sm">{action.label}</span>
                </div>
                {action.shortcut && (
                  <kbd
                    className={`px-1.5 py-0.5 text-[10px] rounded ${
                      index === selectedIndex
                        ? "bg-background/20 text-background"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {action.shortcut}
                  </kbd>
                )}
              </button>
            ))}
          </div>
        ) : mode === "chat" ? (
          <div className="p-3 space-y-3">
            <textarea
              ref={chatInputRef}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask AI anything about your content..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-input rounded-md bg-transparent resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleChat();
                }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleChat}
                disabled={!chatInput.trim()}
                className="flex-1 px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
              >
                <Send className="w-3 h-3" />
                Send
              </button>
              <button
                onClick={() => setMode("actions")}
                className="px-3 py-1.5 bg-muted text-foreground text-xs font-medium rounded hover:bg-muted/80 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        ) : mode === "result" ? (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-muted-foreground">
                {activeAction === "chat"
                  ? "AI Response:"
                  : `${
                      AI_ACTIONS.find((a) => a.id === activeAction)?.label
                    } result:`}
              </div>
              <button
                onClick={discardResult}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ← Back
              </button>
            </div>
            <div className="max-h-[350px] overflow-y-auto p-4 bg-muted/30 rounded-md border border-border">
              <div
                className="text-sm leading-relaxed prose prose-sm max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2"
                dangerouslySetInnerHTML={{ __html: result || "" }}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={applyResult}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-md hover:from-amber-600 hover:to-orange-600 transition-all"
              >
                ✓ Apply (Enter)
              </button>
              <button
                onClick={discardResult}
                className="px-4 py-2 bg-muted text-foreground text-sm font-medium rounded-md hover:bg-muted/80 transition-colors"
              >
                Discard (Esc)
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>↑↓ Navigate • Enter Select • Esc Close</span>
        </div>
      </div>
    </div>
  );
}
