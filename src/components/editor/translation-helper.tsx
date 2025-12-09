"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { localeNames, type Locale } from "@/i18n/config";
import type { PostTranslation } from "@/db/types";

interface TranslationHelperProps {
  currentLocale: Locale | null;
  translations: PostTranslation[];
  onLoadTranslation: (slug: string) => void;
}

export function TranslationHelper({
  currentLocale,
  translations,
  onLoadTranslation,
}: TranslationHelperProps) {
  // Find the other translation (not current)
  const otherTranslation = translations.find(
    (t) => t.exists && t.locale !== currentLocale
  );

  if (!otherTranslation) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          View {localeNames[otherTranslation.locale as Locale]}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>
            {localeNames[otherTranslation.locale as Locale]} Version
          </SheetTitle>
          <SheetDescription>
            Reference the original content while translating
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {otherTranslation.title}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLoadTranslation(otherTranslation.slug)}
            >
              Switch to this version
            </Button>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              The full content of the{" "}
              {localeNames[otherTranslation.locale as Locale]} version will be
              loaded here for reference. You can copy sections to help with
              translation.
            </p>
          </div>

          <div className="text-xs text-muted-foreground">
            Tip: Use this panel to reference the original content while writing
            your translation.
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface TranslationReferenceProps {
  sourceContent: string;
  sourceTitle: string;
  sourceExcerpt?: string;
  sourceLocale: Locale;
}

export function TranslationReference({
  sourceContent,
  sourceTitle,
  sourceExcerpt,
  sourceLocale,
}: TranslationReferenceProps) {
  const t = useTranslations("editor");
  const [isVisible, setIsVisible] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="gap-2 w-full border-0 border-b py-4 rounded-none cursor-pointer"
      >
        <Eye className="h-4 w-4" />
        {t("showReference", { language: localeNames[sourceLocale] })}
      </Button>
    );
  }

  return (
    <div className="p-4 border-b space-y-4 bg-muted/30">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
            {localeNames[sourceLocale]}
          </span>
          {t("translationReference")}
        </h3>
        <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
          <EyeOff className="h-4 w-4" />
        </Button>
      </div>

      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">
            {t("title")}
          </label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCopy(sourceTitle, "title")}
            className="h-6 px-2"
          >
            {copiedField === "title" ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
        <p className="text-sm">{sourceTitle}</p>
      </div>

      {/* Excerpt */}
      {sourceExcerpt && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">
              {t("excerpt")}
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(sourceExcerpt, "excerpt")}
              className="h-6 px-2"
            >
              {copiedField === "excerpt" ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{sourceExcerpt}</p>
        </div>
      )}

      {/* Content Preview */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">
            {t("contentPreview")}
          </label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCopy(sourceContent, "content")}
            className="h-6 px-2"
          >
            {copiedField === "content" ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
        <div
          className="text-sm text-muted-foreground prose prose-sm max-w-none line-clamp-6"
          dangerouslySetInnerHTML={{
            __html: sourceContent.substring(0, 500) + "...",
          }}
        />
      </div>
    </div>
  );
}
