"use client";

import { useTransition } from "react";
import { Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { localeNames, type Locale } from "@/i18n/config";
import type { PostTranslation } from "@/db/types";
import { setLocaleCookie } from "@/lib/locale-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface PostLanguageSwitcherProps {
  currentLocale: Locale | null;
  translations: PostTranslation[];
  currentSlug: string;
}

export function PostLanguageSwitcher({
  currentLocale,
  translations,
  currentSlug,
}: PostLanguageSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // If no translations available, don't show the switcher
  if (!translations || translations.length === 0) {
    return null;
  }

  const handleLanguageSwitch = (translation: PostTranslation) => {
    if (translation.slug === currentSlug || !translation.exists) {
      return;
    }

    startTransition(() => {
      // Update the locale cookie
      setLocaleCookie(translation.locale as Locale);

      // Navigate to the translated post
      router.push(`/${translation.slug}`);

      // Refresh to ensure server components re-render with new locale
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          aria-label="Switch language"
          disabled={isPending}
        >
          <Globe className="h-3.5 w-3.5" />
          <span>{currentLocale ? localeNames[currentLocale] : "Language"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {translations.map((t) => (
          <DropdownMenuItem
            key={t.locale}
            disabled={!t.exists || isPending}
            className={
              t.slug === currentSlug
                ? "bg-muted cursor-default"
                : "cursor-pointer"
            }
            onClick={(e) => {
              e.preventDefault();
              handleLanguageSwitch(t);
            }}
            onSelect={(e) => {
              e.preventDefault();
              handleLanguageSwitch(t);
            }}
          >
            {localeNames[t.locale as Locale]}
            {t.slug === currentSlug && (
              <span className="ml-2 text-xs text-muted-foreground">
                (current)
              </span>
            )}
            {!t.exists && (
              <span className="ml-2 text-xs text-muted-foreground">
                (unavailable)
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
