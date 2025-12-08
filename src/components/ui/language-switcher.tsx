"use client";

import { useState, useTransition } from "react";
import { Globe } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { setLocaleCookie } from "@/lib/locale-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface LanguageSwitcherProps {
  currentLocale: Locale;
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const [locale, setLocale] = useState<Locale>(currentLocale);
  const pathname = usePathname();
  const router = useRouter();

  const handleLocaleChange = async (newLocale: Locale) => {
    if (newLocale === locale) return;

    startTransition(async () => {
      setLocale(newLocale);
      setLocaleCookie(newLocale);

      // Check if we're on a post page (not /editor, /admin, /codes, etc.)
      const isPostPage =
        pathname &&
        pathname !== "/" &&
        !pathname.startsWith("/editor") &&
        !pathname.startsWith("/admin") &&
        !pathname.startsWith("/codes") &&
        !pathname.startsWith("/search") &&
        !pathname.startsWith("/api");

      if (isPostPage) {
        // Extract slug from pathname (remove leading slash)
        const currentSlug = pathname.slice(1);

        try {
          // Fetch the current post's translations (public endpoint)
          const response = await fetch(
            `/api/posts/${currentSlug}/translations`
          );
          if (response.ok) {
            const data = await response.json();

            // If post has a content_group_id, try to find translation
            if (data.post.content_group_id && data.translations) {
              const translation = data.translations.find(
                (t: any) => t.locale === newLocale && t.exists
              );

              if (translation && translation.slug) {
                // Redirect to the translated post
                router.push(`/${translation.slug}`);
                router.refresh();
                return;
              }
            }
          } else {
            console.error("Failed to fetch translations:", response.status);
          }
        } catch (error) {
          console.error("Error fetching translations:", error);
        }
      }

      // If not on a post page or no translation found, just reload
      window.location.reload();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          disabled={isPending}
          aria-label="Change language"
        >
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={locale === loc ? "bg-muted" : ""}
          >
            {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
