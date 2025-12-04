import { memo } from "react";

const ArticleSignature = memo(() => {
  return (
    <div className="mt-8 border-black/5 dark:border-white/5">
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <p className="text-xl text-black dark:text-white font-display font-bold">
            Terima kasih telah membaca!
          </p>
          <p className="text-sm text-black/60 dark:text-white/60">
            Jika Anda merasa artikel ini bermanfaat, pertimbangkan untuk
            membagikannya kepada orang lain yang mungkin juga mendapat manfaat
            darinya.
          </p>

          <div className="flex items-center justify-center gap-2 text-xs text-black/50 dark:text-white/50">
            <span>Ditulis oleh hibuno</span>
          </div>
        </div>
      </div>
    </div>
  );
});

ArticleSignature.displayName = "ArticleSignature";

export default ArticleSignature;
