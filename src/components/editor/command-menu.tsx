import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  ChevronRight,
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
  Wand2,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

const commands: Command[] = [
  {
    id: "chat",
    label: "Ask AI anything",
    description: "Custom instructions",
    icon: <Sparkles size={14} />,
    group: "AI",
    shortcut: "⌘K",
  },
  {
    id: "ai-improve",
    label: "Improve Writing",
    description: "Fix grammar & clarity",
    icon: <Wand2 size={14} />,
    group: "AI",
  },
  {
    id: "ai-expand",
    label: "Expand Content",
    description: "Add more details",
    icon: <BookOpen size={14} />,
    group: "AI",
  },
  {
    id: "ai-continue",
    label: "Continue Writing",
    description: "AI writes next part",
    icon: <PenLine size={14} />,
    group: "AI",
  },
  {
    id: "heading1",
    label: "Heading 1",
    icon: <Heading1 size={14} />,
    group: "Text",
  },
  {
    id: "heading2",
    label: "Heading 2",
    icon: <Heading2 size={14} />,
    group: "Text",
  },
  {
    id: "heading3",
    label: "Heading 3",
    icon: <Heading3 size={14} />,
    group: "Text",
  },
  {
    id: "bulletList",
    label: "Bullet List",
    icon: <List size={14} />,
    group: "Lists",
  },
  {
    id: "orderedList",
    label: "Numbered List",
    icon: <ListOrdered size={14} />,
    group: "Lists",
  },
  {
    id: "blockquote",
    label: "Quote",
    icon: <Quote size={14} />,
    group: "Blocks",
  },
  {
    id: "divider",
    label: "Divider",
    icon: <Minus size={14} />,
    group: "Blocks",
  },
  {
    id: "image",
    label: "Image",
    icon: <ImageIcon size={14} />,
    group: "Media",
  },
  { id: "link", label: "Link", icon: <LinkIcon size={14} />, group: "Media" },
  { id: "callout", label: "Info", icon: <Info size={14} />, group: "Callouts" },
  {
    id: "callout-warning",
    label: "Warning",
    icon: <AlertTriangle size={14} />,
    group: "Callouts",
  },
  {
    id: "callout-success",
    label: "Success",
    icon: <CheckCircle size={14} />,
    group: "Callouts",
  },
  {
    id: "callout-error",
    label: "Error",
    icon: <XCircle size={14} />,
    group: "Callouts",
  },
  {
    id: "callout-tip",
    label: "Tip",
    icon: <Lightbulb size={14} />,
    group: "Callouts",
  },
  {
    id: "details",
    label: "Collapsible",
    icon: <ChevronRight size={14} />,
    group: "Blocks",
  },
];

export default function CommandMenu({
  position,
  onSelect,
  onClose,
}: CommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [search, setSearch] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

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
      className="fixed bg-card rounded-lg shadow-xl border border-border w-64 z-[9999] overflow-hidden animate-in"
      style={{ top: position.top, left: position.left }}
    >
      <div className="p-1.5 border-b border-border">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full px-2 py-1.5 text-xs bg-muted rounded focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
      <div ref={listRef} className="max-h-56 overflow-y-auto py-1">
        {Object.entries(groupedCommands).map(([group, cmds]) => (
          <div key={group}>
            <div className="px-2 py-1 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
              {group}
            </div>
            {cmds.map((command) => {
              const currentIndex = flatIndex++;
              const isAI = command.group === "AI";
              return (
                <button
                  key={command.id}
                  ref={(el) => {
                    itemRefs.current[currentIndex] = el;
                  }}
                  onClick={() => onSelect(command.id)}
                  onMouseEnter={() => setSelectedIndex(currentIndex)}
                  className={`w-full px-2 py-1.5 flex items-center justify-between text-left text-xs transition-colors ${
                    currentIndex === selectedIndex
                      ? isAI
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                        : "bg-foreground text-background"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        currentIndex === selectedIndex
                          ? isAI
                            ? "text-white"
                            : "text-background"
                          : isAI
                          ? "text-amber-500"
                          : "text-muted-foreground"
                      }
                    >
                      {command.icon}
                    </span>
                    <div>
                      <span className="font-medium">{command.label}</span>
                      {command.description && (
                        <span
                          className={`block text-[10px] ${
                            currentIndex === selectedIndex
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
                      className={`px-1 py-0.5 text-[9px] rounded ${
                        currentIndex === selectedIndex
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
          <div className="px-2 py-4 text-center text-xs text-muted-foreground">
            No commands found
          </div>
        )}
      </div>
      <div className="px-2 py-1.5 border-t border-border bg-muted/50">
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
