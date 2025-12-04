import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import {
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lightbulb,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Using WCAG AA compliant colors for accessibility
const calloutConfig = {
  info: {
    icon: Info,
    color: "text-blue-700", // Darker blue for better contrast (WCAG AA compliant)
    bgColor: "bg-blue-50",
    borderColor: "border-blue-400",
    label: "Info",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-neutral-800", // Darker neutral for better contrast (WCAG AA compliant)
    bgColor: "bg-neutral-50",
    borderColor: "border-neutral-400",
    label: "Warning",
  },
  success: {
    icon: CheckCircle,
    color: "text-green-700", // Darker green for better contrast (WCAG AA compliant)
    bgColor: "bg-green-50",
    borderColor: "border-green-400",
    label: "Success",
  },
  error: {
    icon: XCircle,
    color: "text-red-700", // Darker red for better contrast (WCAG AA compliant)
    bgColor: "bg-red-50",
    borderColor: "border-red-400",
    label: "Error",
  },
  tip: {
    icon: Lightbulb,
    color: "text-purple-700", // Darker purple for better contrast (WCAG AA compliant)
    bgColor: "bg-purple-50",
    borderColor: "border-purple-400",
    label: "Tip",
  },
};

export default function CalloutComponent({
  node,
  updateAttributes,
  editor,
  getPos,
}: NodeViewProps) {
  const type = node.attrs.type as keyof typeof calloutConfig;
  const config = calloutConfig[type] || calloutConfig.info;
  const Icon = config.icon;

  const handleTypeChange = (newType: keyof typeof calloutConfig) => {
    updateAttributes({ type: newType });
  };

  const handleDelete = () => {
    const pos = typeof getPos === "function" ? getPos() : null;
    if (pos !== null && pos !== undefined) {
      editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + node.nodeSize })
        .run();
    }
  };

  return (
    <NodeViewWrapper
      className={`callout ${config.bgColor} ${config.borderColor} border-l-4 rounded-r-lg p-4 my-4 relative group`}
    >
      <div className="flex gap-3">
        <div className={`flex-shrink-0 ${config.color} mt-0.5`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <NodeViewContent className="callout-content" />
        </div>
      </div>

      {/* Hover menu */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
              {config.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {Object.entries(calloutConfig).map(([key, value]) => (
              <DropdownMenuItem
                key={key}
                onClick={() =>
                  handleTypeChange(key as keyof typeof calloutConfig)
                }
              >
                <value.icon className={`w-4 h-4 mr-2 ${value.color}`} />
                {value.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={handleDelete}
        >
          Delete
        </Button>
      </div>
    </NodeViewWrapper>
  );
}
