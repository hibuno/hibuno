"use client";

import type { Editor } from "@tiptap/react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  FileText,
  Loader2,
  MessageSquare,
  PenLine,
  RefreshCw,
  Send,
  Sparkles,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { generateContent, chat, type GenerationType } from "@/lib/ai-service";

interface AICommandMenuProps {
  editor: Editor;
  position: { top: number; left: number };
  onClose: () => void;
  selectedText?: string | undefined;
  initialAction?:
    | "improve"
    | "expand"
    | "summarize"
    | "continue"
    | "chat"
    | null;
}

type Mode = "actions" | "chat" | "result" | "tone";

interface AIAction {
  id: GenerationType | "chat" | "tone";
  label: string;
  description: string;
  icon: React.ReactNode;
  shortcut?: string;
  requiresSelection?: boolean;
}

const TONE_OPTIONS = [
  { id: "professional", label: "Professional", emoji: "💼" },
  { id: "casual", label: "Casual", emoji: "😊" },
  { id: "formal", label: "Formal", emoji: "📜" },
  { id: "friendly", label: "Friendly", emoji: "🤝" },
  { id: "confident", label: "Confident", emoji: "💪" },
  { id: "empathetic", label: "Empathetic", emoji: "💝" },
];

const AI_ACTIONS: AIAction[] = [
  {
    id: "improve",
    label: "Improve writing",
    description: "Fix grammar, clarity & flow",
    icon: <Wand2 size={14} />,
    shortcut: "1",
    requiresSelection: true,
  },
  {
    id: "expand",
    label: "Make longer",
    description: "Add details & examples",
    icon: <BookOpen size={14} />,
    shortcut: "2",
    requiresSelection: true,
  },
  {
    id: "summarize",
    label: "Make shorter",
    description: "Condense to key points",
    icon: <FileText size={14} />,
    shortcut: "3",
    requiresSelection: true,
  },
  {
    id: "tone",
    label: "Change tone",
    description: "Adjust writing style",
    icon: <Zap size={14} />,
    shortcut: "4",
    requiresSelection: true,
  },
  {
    id: "continue",
    label: "Continue writing",
    description: "AI writes the next part",
    icon: <PenLine size={14} />,
    shortcut: "5",
    requiresSelection: false,
  },
  {
    id: "chat",
    label: "Ask AI anything",
    description: "Custom instructions",
    icon: <MessageSquare size={14} />,
    shortcut: "6",
    requiresSelection: false,
  },
];

// Request controller for cancellation
let activeRequestController: AbortController | null = null;

export default function AICommandMenu({
  editor,
  position,
  onClose,
  selectedText,
  initialAction = null,
}: AICommandMenuProps) {
  const [mode, setMode] = useState<Mode>("actions");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [lastActionParams, setLastActionParams] = useState<{
    actionId: string;
    content: string;
    tone?: string;
  } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Get text content helper
  const getTextContent = useCallback(() => {
    if (selectedText && selectedText.trim()) return selectedText;
    const { from, to, empty } = editor.state.selection;
    if (!empty) {
      const text = editor.state.doc.textBetween(from, to, " ");
      if (text.trim()) return text;
    }
    return "";
  }, [selectedText, editor]);

  const hasSelection = getTextContent().length > 0;
  const selectionPreview = getTextContent().slice(0, 60);

  // Execute initial action immediately if provided
  useEffect(() => {
    if (initialAction) {
      // Small delay to ensure component is mounted
      const timer = setTimeout(() => {
        handleAction(initialAction as GenerationType | "chat");
      }, 50);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []); // Only run once on mount

  // Scroll selected item into view
  useEffect(() => {
    if (mode === "actions") {
      const selectedItem = itemRefs.current[selectedIndex];
      if (selectedItem && listRef.current) {
        const listRect = listRef.current.getBoundingClientRect();
        const itemRect = selectedItem.getBoundingClientRect();

        if (itemRect.bottom > listRect.bottom) {
          selectedItem.scrollIntoView({ block: "nearest", behavior: "smooth" });
        } else if (itemRect.top < listRect.top) {
          selectedItem.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }
    }
  }, [selectedIndex, mode]);

  // Focus management
  useEffect(() => {
    if (mode === "chat") {
      chatInputRef.current?.focus();
    }
  }, [mode]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        if (!loading) onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [loading, onClose]);

  // Keyboard navigation
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
      } else if (mode === "tone") {
        if (e.key === "Escape") {
          e.preventDefault();
          setMode("actions");
        } else if (e.key >= "1" && e.key <= String(TONE_OPTIONS.length)) {
          e.preventDefault();
          const index = parseInt(e.key) - 1;
          if (TONE_OPTIONS[index]) {
            handleToneSelect(TONE_OPTIONS[index].id);
          }
        }
      } else if (mode === "result") {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          applyResult();
        } else if (e.key === "Escape") {
          e.preventDefault();
          discardResult();
        } else if (e.key === "r" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          handleRegenerate();
        }
      } else if (mode === "chat") {
        if (e.key === "Escape") {
          e.preventDefault();
          setMode("actions");
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mode, selectedIndex, onClose, lastActionParams]);

  // Cancel any pending request on unmount
  useEffect(() => {
    return () => {
      if (activeRequestController) {
        activeRequestController.abort();
      }
    };
  }, []);

  const cancelRequest = () => {
    if (activeRequestController) {
      activeRequestController.abort();
      activeRequestController = null;
    }
    setLoading(false);
    setError("Request cancelled");
  };

  const handleAction = async (actionId: GenerationType | "chat" | "tone") => {
    if (actionId === "chat") {
      setMode("chat");
      return;
    }

    if (actionId === "tone") {
      const text = getTextContent();
      if (!text) {
        setError("Please select text to change its tone");
        return;
      }
      setMode("tone");
      return;
    }

    const text = getTextContent();
    const action = AI_ACTIONS.find((a) => a.id === actionId);

    // Check if selection is required
    if (action?.requiresSelection && !text) {
      setError(
        hasSelection
          ? "Please select the text you want to modify"
          : "Select some text first, then try again"
      );
      return;
    }

    // For continue action
    if (actionId === "continue") {
      await executeGeneration(actionId, "");
      return;
    }

    await executeGeneration(actionId as GenerationType, text);
  };

  const handleToneSelect = async (toneId: string) => {
    const text = getTextContent();
    if (!text) return;

    setLastActionParams({ actionId: "rewrite", content: text, tone: toneId });
    setLoading(true);
    setActiveAction("rewrite");
    setError(null);

    try {
      activeRequestController = new AbortController();

      const tone = TONE_OPTIONS.find((t) => t.id === toneId);
      const response = await chat([
        {
          role: "system",
          content: `Rewrite the text in a ${tone?.label.toLowerCase()} tone.
Rules:
- Output ONLY the rewritten content in clean HTML
- NO greetings, NO explanations
- Use HTML tags: <p>, <strong>, <em>, <ul>, <li>
- Preserve the meaning, change only the tone/style
- Start directly with the content`,
        },
        { role: "user", content: text },
      ]);

      if (activeRequestController?.signal.aborted) return;

      setResult(response.trim());
      setMode("result");
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(err instanceof Error ? err.message : "Failed to generate");
      }
    } finally {
      setLoading(false);
    }
  };

  const executeGeneration = async (actionId: GenerationType, text: string) => {
    setLoading(true);
    setActiveAction(actionId);
    setError(null);

    try {
      activeRequestController = new AbortController();

      let content = text;

      if (actionId === "continue") {
        const { from } = editor.state.selection;
        content = editor.state.doc.textBetween(0, from, " ");
        const textContent = content.replace(/<[^>]*>/g, "").trim();

        if (!textContent || textContent.length < 10) {
          setError("Write a few sentences first, then use 'Continue writing'");
          setLoading(false);
          return;
        }

        if (content.length > 2000) {
          content = content.slice(-2000);
        }
      }

      setLastActionParams({ actionId, content });

      const response = await generateContent({
        type: actionId,
        content,
      });

      if (activeRequestController?.signal.aborted) return;

      setResult(response.result);
      setMode("result");
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(err instanceof Error ? err.message : "Failed to generate");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;

    setLoading(true);
    setError(null);
    setActiveAction("chat");

    try {
      activeRequestController = new AbortController();
      const text = getTextContent();

      setLastActionParams({
        actionId: "chat",
        content: chatInput,
      });

      const systemPrompt = text
        ? `You are a writing assistant. The user selected this text:\n\n"${text}"\n\nRules:
- Output ONLY the requested content in clean HTML
- NO greetings, NO explanations, NO "Here is..."
- Use HTML tags: <p>, <strong>, <em>, <ul>, <li>, <h2>, <h3>
- NO markdown syntax
- Start directly with the content`
        : `You are a writing assistant.
Rules:
- Output ONLY the requested content in clean HTML
- NO greetings, NO explanations, NO "Here is..."
- Use HTML tags: <p>, <strong>, <em>, <ul>, <li>, <h2>, <h3>
- NO markdown syntax
- Start directly with the content`;

      const response = await chat([
        { role: "system", content: systemPrompt },
        { role: "user", content: chatInput },
      ]);

      if (activeRequestController?.signal.aborted) return;

      let cleanedResponse = response
        .trim()
        .replace(
          /^(Here'?s?|Here is|Below is|Sure[,!]?|Certainly[,!]?)[^<\n]*[:.]?\s*/i,
          ""
        )
        .replace(
          /^(The improved|The expanded|The rewritten)[^<\n]*[:.]?\s*/i,
          ""
        );

      setResult(cleanedResponse);
      setMode("result");
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(err instanceof Error ? err.message : "Failed to get response");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!lastActionParams) return;

    if (lastActionParams.tone) {
      await handleToneSelect(lastActionParams.tone);
    } else if (lastActionParams.actionId === "chat") {
      await handleChat();
    } else {
      await executeGeneration(
        lastActionParams.actionId as GenerationType,
        lastActionParams.content
      );
    }
  };

  const applyResult = () => {
    if (!result) return;

    const { from, to, empty } = editor.state.selection;

    let cleanedResult = result.trim();
    if (cleanedResult && !cleanedResult.startsWith("<")) {
      cleanedResult = `<p>${cleanedResult}</p>`;
    }
    cleanedResult = cleanedResult
      .replace(/>\s+</g, "><")
      .replace(/<p>\s*<\/p>/g, "")
      .replace(/<br\s*\/?>\s*<br\s*\/?>/g, "</p><p>");

    if (activeAction === "continue" || activeAction === "chat") {
      editor
        .chain()
        .focus()
        .insertContentAt(empty ? from : to, cleanedResult, {
          parseOptions: { preserveWhitespace: false },
        })
        .run();
    } else if (!empty) {
      editor
        .chain()
        .focus()
        .deleteRange({ from, to })
        .insertContentAt(from, cleanedResult, {
          parseOptions: { preserveWhitespace: false },
        })
        .run();
    }

    onClose();
  };

  const discardResult = () => {
    setResult(null);
    setMode("actions");
    setActiveAction(null);
  };

  // Position adjustment
  const adjustedPosition = { ...position };
  if (typeof window !== "undefined") {
    const dialogWidth = mode === "result" ? 520 : 340;
    const dialogHeight = 450;

    if (adjustedPosition.left + dialogWidth > window.innerWidth - 20) {
      adjustedPosition.left = window.innerWidth - dialogWidth - 20;
    }
    if (adjustedPosition.left < 20) {
      adjustedPosition.left = 20;
    }
    if (adjustedPosition.top + dialogHeight > window.innerHeight - 20) {
      adjustedPosition.top = window.innerHeight - dialogHeight - 20;
    }
    if (adjustedPosition.top < 20) {
      adjustedPosition.top = 20;
    }
  }

  const getActionLabel = () => {
    if (activeAction === "chat") return "AI Response";
    if (activeAction === "rewrite" && lastActionParams?.tone) {
      const tone = TONE_OPTIONS.find((t) => t.id === lastActionParams.tone);
      return `${tone?.emoji} ${tone?.label} tone`;
    }
    return AI_ACTIONS.find((a) => a.id === activeAction)?.label || "Result";
  };

  const dialogTitleId = "ai-assistant-title";
  const dialogDescId = "ai-assistant-desc";

  return (
    <div
      ref={menuRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={dialogTitleId}
      aria-describedby={
        hasSelection && mode === "actions" ? dialogDescId : undefined
      }
      className={`fixed bg-card rounded-xl shadow-2xl border border-border overflow-hidden z-[9999] transition-all duration-200 ${
        mode === "result" ? "w-[520px]" : "w-[340px]"
      }`}
      style={{
        top: adjustedPosition.top,
        left: adjustedPosition.left,
        animation: "slideIn 0.15s ease-out",
      }}
    >
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border bg-gradient-to-r from-neutral-50 to-neutral-50 dark:from-neutral-950/30 dark:to-neutral-950/30">
        <div className="flex items-center gap-2">
          <div
            className="p-1 rounded-md bg-gradient-to-br from-neutral-400 to-neutral-800"
            aria-hidden="true"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <span id={dialogTitleId} className="text-sm font-medium">
              AI Assistant
            </span>
            {hasSelection && mode === "actions" && (
              <p
                id={dialogDescId}
                className="text-[10px] text-muted-foreground truncate max-w-[200px]"
              >
                "{selectionPreview}
                {getTextContent().length > 60 ? "..." : ""}"
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close AI Assistant"
          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        </button>
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto">
        {error && (
          <div className="px-3 py-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/30 border-b border-red-100 dark:border-red-900 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {loading ? (
          <div
            className="flex flex-col items-center justify-center py-16 px-4"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="relative" aria-hidden="true">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neutral-400 to-neutral-800 blur-lg opacity-30 animate-pulse" />
              <Loader2 className="w-8 h-8 animate-spin text-neutral-500 relative" />
            </div>
            <span className="mt-4 text-sm text-muted-foreground">
              {activeAction === "chat"
                ? "Thinking..."
                : activeAction === "continue"
                ? "Writing..."
                : "Improving your text..."}
            </span>
            <button
              onClick={cancelRequest}
              aria-label="Cancel AI request"
              className="mt-3 px-3 py-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Cancel
            </button>
          </div>
        ) : mode === "actions" ? (
          <div
            ref={listRef}
            role="listbox"
            aria-label="AI actions"
            className="py-1"
          >
            {AI_ACTIONS.map((action, index) => {
              const isDisabled = action.requiresSelection && !hasSelection;
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={action.id}
                  id={`ai-action-${action.id}`}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={isDisabled}
                  aria-describedby={`ai-action-desc-${action.id}`}
                  onClick={() => !isDisabled && handleAction(action.id)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  disabled={isDisabled}
                  className={`w-full px-3 py-2.5 flex items-center justify-between text-left transition-all focus:outline-none ${
                    isDisabled
                      ? "opacity-40 cursor-not-allowed"
                      : isSelected
                      ? "bg-foreground text-background"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={`p-1.5 rounded-md ${
                        isSelected ? "bg-background/20" : "bg-muted"
                      }`}
                    >
                      {action.icon}
                    </span>
                    <div>
                      <div className="text-sm font-medium">{action.label}</div>
                      <div
                        id={`ai-action-desc-${action.id}`}
                        className={`text-[11px] ${
                          isSelected
                            ? "text-background/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {action.description}
                      </div>
                    </div>
                  </div>
                  {action.shortcut && (
                    <kbd
                      aria-label={`Keyboard shortcut: ${action.shortcut}`}
                      className={`px-1.5 py-0.5 text-[10px] rounded font-mono ${
                        isSelected
                          ? "bg-background/20 text-background"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {action.shortcut}
                    </kbd>
                  )}
                </button>
              );
            })}
          </div>
        ) : mode === "tone" ? (
          <div className="p-3">
            <button
              onClick={() => setMode("actions")}
              aria-label="Go back to actions"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              <ArrowLeft size={12} aria-hidden="true" />
              Back
            </button>
            <p
              id="tone-instructions"
              className="text-xs text-muted-foreground mb-3"
            >
              Choose a tone for your text:
            </p>
            <div
              className="grid grid-cols-2 gap-2"
              role="listbox"
              aria-labelledby="tone-instructions"
            >
              {TONE_OPTIONS.map((tone, index) => (
                <button
                  key={tone.id}
                  role="option"
                  aria-selected={false}
                  onClick={() => handleToneSelect(tone.id)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border hover:border-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-950/20 transition-all text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="text-lg" aria-hidden="true">
                    {tone.emoji}
                  </span>
                  <div>
                    <div className="text-sm font-medium">{tone.label}</div>
                    <div
                      className="text-[10px] text-muted-foreground"
                      aria-label={`Press ${index + 1} to select`}
                    >
                      Press {index + 1}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : mode === "chat" ? (
          <div className="p-3 space-y-3">
            <button
              onClick={() => setMode("actions")}
              aria-label="Go back to actions"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              <ArrowLeft size={12} aria-hidden="true" />
              Back
            </button>
            <label htmlFor="ai-chat-input" className="sr-only">
              {hasSelection
                ? "What would you like to do with the selected text?"
                : "What would you like me to write?"}
            </label>
            <textarea
              id="ai-chat-input"
              ref={chatInputRef}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={
                hasSelection
                  ? "What would you like to do with the selected text?"
                  : "What would you like me to write?"
              }
              rows={4}
              aria-describedby="chat-hint"
              className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-neutral-500/20 focus:border-neutral-500"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleChat();
                }
              }}
            />
            <p id="chat-hint" className="sr-only">
              Press Enter to send, Shift+Enter for new line
            </p>
            <button
              onClick={handleChat}
              disabled={!chatInput.trim()}
              aria-disabled={!chatInput.trim()}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-neutral-700 to-neutral-800 text-white text-sm font-medium rounded-lg hover:from-neutral-800 hover:to-neutral-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              Send
            </button>
          </div>
        ) : mode === "result" ? (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" aria-hidden="true" />
                <span className="text-sm font-medium" id="result-label">
                  {getActionLabel()}
                </span>
              </div>
              <button
                onClick={discardResult}
                aria-label="Go back to actions"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                <ArrowLeft size={12} aria-hidden="true" />
                Back
              </button>
            </div>

            <div
              className="max-h-[280px] overflow-y-auto p-4 bg-muted/30 rounded-lg border border-border"
              role="region"
              aria-labelledby="result-label"
              aria-live="polite"
            >
              <div
                className="text-sm leading-relaxed prose prose-sm max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2"
                dangerouslySetInnerHTML={{ __html: result || "" }}
              />
            </div>

            <div
              className="flex gap-2 pt-1"
              role="group"
              aria-label="Result actions"
            >
              <button
                onClick={applyResult}
                aria-label="Apply AI result to editor"
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-neutral-700 to-neutral-800 text-white text-sm font-medium rounded-lg hover:from-neutral-800 hover:to-neutral-950 transition-all flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Check className="w-4 h-4" aria-hidden="true" />
                Apply
              </button>
              <button
                onClick={handleRegenerate}
                aria-label="Regenerate result, keyboard shortcut Command R"
                className="px-4 py-2.5 bg-muted text-foreground text-sm font-medium rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                title="Regenerate (⌘R)"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                onClick={discardResult}
                aria-label="Discard result"
                className="px-4 py-2.5 border border-border text-foreground text-sm font-medium rounded-lg hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Discard
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Footer */}
      {!loading && (
        <div
          className="px-3 py-2 border-t border-border bg-muted/30"
          aria-hidden="true"
        >
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            {mode === "actions" && (
              <span>↑↓ Navigate • Enter Select • 1-6 Quick select</span>
            )}
            {mode === "result" && (
              <span>Enter Apply • ⌘R Regenerate • Esc Back</span>
            )}
            {mode === "chat" && <span>Enter Send • Shift+Enter New line</span>}
            {mode === "tone" && <span>1-6 Quick select • Esc Back</span>}
            <span className="text-neutral-500">⌘K</span>
          </div>
        </div>
      )}
    </div>
  );
}
