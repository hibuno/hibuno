export default function ArticleSignature() {
 return (
  <div className="mt-8 border-black/5 dark:border-white/5">
   <div className="text-center space-y-4">
    <div className="space-y-2">
     <p className="text-xl text-black dark:text-white font-display font-bold">
      Thanks for reading!
     </p>
     <p className="text-sm text-black/60 dark:text-white/60">
      If you found this article helpful, consider sharing it with others who
      might benefit from it.
     </p>

     <div className="flex items-center justify-center gap-2 text-xs text-black/50 dark:text-white/50">
      <span>Written by hibuno</span>
      <span>•</span>
      <span>Sharing knowledge, one post at a time</span>
     </div>
    </div>
   </div>
  </div>
 );
}
