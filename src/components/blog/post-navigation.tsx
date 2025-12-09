import "server-only";
import Link from "next/link";
import { getAdjacentPosts } from "@/db/server";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/config";

export default async function PostNavigation({
  published_at,
  locale,
}: {
  published_at: string | null;
  locale: Locale;
}) {
  try {
    const t = await getTranslations({ locale, namespace: "post" });
    const { newer, older } = getAdjacentPosts(published_at, locale);

    if (!newer && !older) return null;

    return (
      <div className="mt-6 sm:mt-8 grid gap-3 sm:gap-4 border-t pt-4 sm:pt-6 grid-cols-1 sm:grid-cols-2">
        <div>
          {older && (
            <Link
              href={`/${older.slug}`}
              className="block rounded-lg bg-muted/40 p-3 sm:p-4 hover:bg-muted transition-colors"
            >
              <div className="text-xs text-muted-foreground">
                {t("previous")}
              </div>
              <div className="line-clamp-2 text-sm sm:text-base font-medium">
                {older.title}
              </div>
            </Link>
          )}
        </div>
        <div className="sm:ml-auto sm:text-right">
          {newer && (
            <Link
              href={`/${newer.slug}`}
              className="block rounded-lg bg-muted/40 p-3 sm:p-4 hover:bg-muted transition-colors"
            >
              <div className="text-xs text-muted-foreground">{t("next")}</div>
              <div className="line-clamp-2 text-sm sm:text-base font-medium">
                {newer.title}
              </div>
            </Link>
          )}
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
