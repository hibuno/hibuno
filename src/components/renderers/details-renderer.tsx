"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

interface DetailsRendererProps {
  summary: string;
  open?: boolean;
  children: ReactNode;
}

export default function DetailsRenderer({
  summary,
  open = false,
  children,
}: DetailsRendererProps) {
  const [isOpen, setIsOpen] = useState(open);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="collapsible border border-neutral-200 dark:border-neutral-700 rounded-lg my-4 overflow-hidden">
      <button
        type="button"
        className="collapsible-summary w-full flex items-center gap-2 p-4 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer transition-colors text-left"
        onClick={handleToggle}
      >
        <span className="flex-shrink-0 text-neutral-600 dark:text-neutral-400 transition-transform duration-200">
          {isOpen ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </span>
        <span className="flex-1 font-medium text-neutral-900 dark:text-neutral-100">
          {summary}
        </span>
      </button>

      <div
        className={`collapsible-content transition-all duration-300 ease-in-out ${
          isOpen
            ? "max-h-[5000px] opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 prose prose-sm dark:prose-invert max-w-none">
          {children}
        </div>
      </div>
    </div>
  );
}
