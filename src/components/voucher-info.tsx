"use client";

import { useState } from "react";

interface VoucherInfoProps {
  voucherCodes: string[];
}

export function VoucherInfo({ voucherCodes }: VoucherInfoProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy voucher code:", err);
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-100 dark:from-purple-800 dark:to-pink-700 rounded-lg border border-purple-200 dark:border-purple-600">
      <svg
        className="w-5 h-5 text-purple-600 dark:text-purple-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      </svg>
      <span className="text-sm font-medium text-purple-700 dark:text-purple-300 mr-2">
        Voucher Codes:
      </span>
      <div className="flex flex-wrap gap-2">
        {voucherCodes.map((code, index) => (
          <button
            key={index}
            onClick={() => copyToClipboard(code, index)}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-300 rounded-md border border-purple-200 dark:border-purple-600 hover:border-purple-300 dark:hover:border-purple-500 transition-colors group"
          >
            <span className="text-sm font-mono font-medium">{code}</span>
            {copiedIndex === index ? (
              <svg
                className="w-4 h-4 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 group-hover:text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
