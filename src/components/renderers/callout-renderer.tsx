"use client";

import {
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lightbulb,
} from "lucide-react";
import type { ReactNode } from "react";

const calloutConfig = {
  info: {
    icon: Info,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    label: "Info",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    label: "Warning",
  },
  success: {
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
    label: "Success",
  },
  error: {
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
    label: "Error",
  },
  tip: {
    icon: Lightbulb,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800",
    label: "Tip",
  },
};

interface CalloutRendererProps {
  type: keyof typeof calloutConfig;
  title?: string;
  children: ReactNode;
}

export default function CalloutRenderer({
  type,
  title,
  children,
}: CalloutRendererProps) {
  const config = calloutConfig[type] || calloutConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={`callout ${config.bgColor} ${config.borderColor} border-l-4 rounded-r-lg p-4 my-4`}
      data-type={type}
    >
      <div className="flex gap-3">
        <div className={`flex-shrink-0 ${config.color} mt-0.5`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <div className={`font-semibold mb-1 ${config.color}`}>{title}</div>
          )}
          <div className="callout-content prose prose-sm dark:prose-invert max-w-none">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
