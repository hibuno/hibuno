import type * as React from "react";
import { cn } from "../../lib/utils";

interface ContextMenuProps {
  children: React.ReactNode;
}

interface ContextMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface ContextMenuContentProps {
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
}

interface ContextMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ children }) => {
  return <>{children}</>;
};

export const ContextMenuTrigger: React.FC<ContextMenuTriggerProps> = ({
  children,
  asChild = false,
}) => {
  if (asChild) {
    return <>{children}</>;
  }
  return <>{children}</>;
};

export const ContextMenuContent: React.FC<ContextMenuContentProps> = ({
  children,
  align = "start",
  className,
}) => {
  return (
    <div
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-gray-950 shadow-md animate-in fade-in-80",
        align === "center" && "text-center",
        align === "end" && "text-right",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const ContextMenuItem: React.FC<ContextMenuItemProps> = ({
  children,
  onClick,
  disabled = false,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
};

export const ContextMenuSeparator = () => {
  return <div className="h-px my-1 bg-gray-200" />;
};
