import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Info,
  Lightbulb,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  PenLine,
  Quote,
  Sparkles,
  Video,
  Wand2,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

interface CommandMenuProps {
  position: { top: number; left: number };
  onSelect: (command: string) => void;
  onClose: () => void;
}

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  group: string;
  shortcut?: string;
}

const getCommands = (t: any): Command[] => [
  {
    id: "chat",
    label: t("commands.askAI"),
    description: t("commands.customInstructions"),
    icon: <Sparkles size={14} />,
    group: t("ai"),
    shortcut: "⌘K",
  },
  {
    id: "ai-improve",
    label: t("commands.improveWriting"),
    description: t("commands.fixGrammar"),
    icon: <Wand2 size={14} />,
    group: t("ai"),
  },
  {
    id: "ai-expand",
    label: t("commands.expandContent"),
    description: t("commands.addDetails"),
    icon: <BookOpen size={14} />,
    group: t("ai"),
  },
  {
    id: "ai-continue",
    label: t("commands.continueWriting"),
    description: t("commands.aiWritesNext"),
    icon: <PenLine size={14} />,
    group: t("ai"),
  },
  {
    id: "heading1",
    label: t("heading1"),
    icon: <Heading1 size={14} />,
    group: t("commands.text"),
  },
  {
    id: "heading2",
    label: t("heading2"),
    icon: <Heading2 size={14} />,
    group: t("commands.text"),
  },
  {
    id: "heading3",
    label: t("heading3"),
    icon: <Heading3 size={14} />,
    group: t("commands.text"),
  },
  {
    id: "bulletList",
    label: t("commands.bulletList"),
    icon: <List size={14} />,
    group: t("commands.lists"),
  },
  {
    id: "orderedList",
    label: t("commands.numberedList"),
    icon: <ListOrdered size={14} />,
    group: t("commands.lists"),
  },
  {
    id: "blockquote",
    label: t("commands.quote"),
    icon: <Quote size={14} />,
    group: t("blocks"),
  },
  {
    id: "divider",
    label: t("commands.divider"),
    icon: <Minus size={14} />,
    group: t("blocks"),
  },
  {
    id: "codeBlock",
    label: t("codeBlock"),
    icon: <Code size={14} />,
    group: t("blocks"),
  },
  {
    id: "image",
    label: t("commands.image"),
    icon: <ImageIcon size={14} />,
    group: t("commands.media"),
  },
  {
    id: "video",
    label: t("commands.video"),
    icon: <Video size={14} />,
    group: t("commands.media"),
  },
  {
    id: "link",
    label: t("commands.link"),
    icon: <LinkIcon size={14} />,
    group: t("commands.media"),
  },
  {
    id: "callout",
    label: t("commands.info"),
    icon: <Info size={14} />,
    group: t("commands.callouts"),
  },
  {
    id: "callout-warning",
    label: t("commands.warning"),
    icon: <AlertTriangle size={14} />,
    group: t("commands.callouts"),
  },
  {
    id: "callout-success",
    label: t("commands.success"),
    icon: <CheckCircle size={14} />,
    group: t("commands.callouts"),
  },
  {
    id: "callout-error",
    label: t("commands.error"),
    icon: <XCircle size={14} />,
    group: t("commands.callouts"),
  },
  {
    id: "callout-tip",
    label: t("commands.tip"),
    icon: <Lightbulb size={14} />,
    group: t("commands.callouts"),
  },
  {
    id: "details",
    label: t("commands.collapsible"),
    icon: <ChevronRight size={14} />,
    group: t("blocks"),
  },
];

export default function CommandMenu({
  position,
  onSelect,
  onClose,
}: CommandMenuProps) {
  const t = useTranslations("editor");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [search, setSearch] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const commands = getCommands(t);

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(search.toLowerCase()) ||
      cmd.group.toLowerCase().includes(search.toLowerCase())
  );

  // Scroll selected item into view
  useEffect(() => {
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
  }, [selectedIndex]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) =>
            (prev - 1 + filteredCommands.length) % filteredCommands.length
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        const cmd = filteredCommands[selectedIndex];
        if (cmd) onSelect(cmd.id);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, filteredCommands, onSelect, onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const groupedCommands = filteredCommands.reduce<Record<string, Command[]>>(
    (acc, cmd) => {
      (acc[cmd.group] ??= []).push(cmd);
      return acc;
    },
    {}
  );

  let flatIndex = 0;

  return (
    <div
      ref={menuRef}
      role="dialog"
      aria-modal="true"
      aria-label="Command menu"
      className="fixed bg-card rounded-lg shadow-xl border border-border w-64 z-[9999] overflow-hidden animate-in"
      style={{ top: position.top, left: position.left }}
    >
      <div className="p-1.5 border-b border-border">
        <label htmlFor="command-search" className="sr-only">
          Search commands
        </label>
        <input
          id="command-search"
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          aria-controls="command-list"
          aria-activedescendant={
            filteredCommands[selectedIndex]
              ? `command-${filteredCommands[selectedIndex].id}`
              : undefined
          }
          className="w-full px-2 py-1.5 text-xs bg-muted rounded focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
      <div
        ref={listRef}
        id="command-list"
        role="listbox"
        aria-label="Available commands"
        className="max-h-56 overflow-y-auto py-1"
      >
        {Object.entries(groupedCommands).map(([group, cmds]) => (
          <div key={group} role="group" aria-labelledby={`group-${group}`}>
            <div
              id={`group-${group}`}
              className="px-2 py-1 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider"
              role="presentation"
            >
              {group}
            </div>
            {cmds.map((command) => {
              const currentIndex = flatIndex++;
              const isAI = command.group === "AI";
              const isSelected = currentIndex === selectedIndex;
              return (
                <button
                  key={command.id}
                  id={`command-${command.id}`}
                  ref={(el) => {
                    itemRefs.current[currentIndex] = el;
                  }}
                  role="option"
                  aria-selected={isSelected}
                  aria-describedby={
                    command.description ? `desc-${command.id}` : undefined
                  }
                  onClick={() => onSelect(command.id)}
                  onMouseEnter={() => setSelectedIndex(currentIndex)}
                  className={`w-full px-2 py-1.5 flex items-center justify-between text-left text-xs transition-colors focus:outline-none ${
                    isSelected
                      ? isAI
                        ? "bg-gradient-to-r from-neutral-700 to-neutral-800 text-white"
                        : "bg-foreground text-background"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={
                        isSelected
                          ? isAI
                            ? "text-white"
                            : "text-background"
                          : isAI
                          ? "text-neutral-500"
                          : "text-muted-foreground"
                      }
                    >
                      {command.icon}
                    </span>
                    <div>
                      <span className="font-medium">{command.label}</span>
                      {command.description && (
                        <span
                          id={`desc-${command.id}`}
                          className={`block text-[10px] ${
                            isSelected
                              ? isAI
                                ? "text-white/70"
                                : "text-background/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {command.description}
                        </span>
                      )}
                    </div>
                  </div>
                  {command.shortcut && (
                    <kbd
                      aria-label={`Keyboard shortcut: ${command.shortcut}`}
                      className={`px-1 py-0.5 text-[9px] rounded ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {command.shortcut}
                    </kbd>
                  )}
                </button>
              );
            })}
          </div>
        ))}
        {filteredCommands.length === 0 && (
          <div
            className="px-2 py-4 text-center text-xs text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            No commands found
          </div>
        )}
      </div>
      <div
        className="px-2 py-1.5 border-t border-border bg-muted/50"
        aria-hidden="true"
      >
        <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
          <kbd className="px-1 py-0.5 bg-card border border-border rounded">
            ↑↓
          </kbd>
          <span>Navigate</span>
          <kbd className="px-1 py-0.5 bg-card border border-border rounded ml-1">
            ↵
          </kbd>
          <span>Select</span>
        </div>
      </div>
    </div>
  );
}
