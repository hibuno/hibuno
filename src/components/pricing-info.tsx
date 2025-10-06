"use client";

import type { SelectPost } from "@/db/schema";

interface PricingInfoProps {
  post: SelectPost;
}

export function PricingInfo({ post }: PricingInfoProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-800 dark:to-emerald-700 rounded-lg border border-green-200 dark:border-green-600">
      {/* Free Offer Badge */}
      {post.offerFree && (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-md border border-green-300 dark:border-green-700">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
          <span className="text-sm font-medium">Free</span>
        </div>
      )}

      {/* Price Range */}
      {(post.minPrice || post.maxPrice) && (
        <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 rounded-md border border-green-200 dark:border-green-600">
          <svg
            className="w-4 h-4 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
          <div className="text-sm">
            {post.minPrice && post.maxPrice ? (
              <span className="font-medium text-green-700 dark:text-green-300">
                ${post.minPrice.toLocaleString()} - $
                {post.maxPrice.toLocaleString()}
              </span>
            ) : post.minPrice ? (
              <span className="font-medium text-green-700 dark:text-green-300">
                From ${post.minPrice.toLocaleString()}
              </span>
            ) : post.maxPrice ? (
              <span className="font-medium text-green-700 dark:text-green-300">
                Up to ${post.maxPrice.toLocaleString()}
              </span>
            ) : null}
          </div>
        </div>
      )}

      {/* Promotion Badge */}
      {post.inPromotion && (
        <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 rounded-md border border-orange-300 dark:border-orange-700">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
            />
          </svg>
          <span className="text-sm font-medium">On Sale</span>
        </div>
      )}

      {/* Previous Price (if different) */}
      {post.prevMinPrice &&
        post.prevMaxPrice &&
        (post.prevMinPrice !== post.minPrice ||
          post.prevMaxPrice !== post.maxPrice) && (
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md border border-gray-300 dark:border-gray-600">
            <span className="text-xs line-through">
              ${post.prevMinPrice.toLocaleString()}$
              {post.prevMaxPrice !== post.prevMinPrice
                ? ` - $${post.prevMaxPrice.toLocaleString()}`
                : ""}
            </span>
          </div>
        )}
    </div>
  );
}
