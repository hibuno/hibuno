import { memo } from "react";
import { useTranslations } from "next-intl";

const ArticleSignature = memo(() => {
  const t = useTranslations("post");

  return (
    <div className="mt-8 border-black/5 dark:border-white/5">
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <p className="text-xl text-black dark:text-white font-display font-bold">
            {t("thanksTitle")}
          </p>
          <p className="text-sm text-black/60 dark:text-white/60">
            {t("thanksDescription")}
          </p>

          <div className="flex items-center justify-center gap-2 text-xs text-black/50 dark:text-white/50">
            <span>{t("writtenBy")}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

ArticleSignature.displayName = "ArticleSignature";

export default ArticleSignature;
