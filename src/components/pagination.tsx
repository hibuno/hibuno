"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
 currentPage: number;
 totalPages: number;
 onPageChange: (page: number) => void;
 className?: string;
 showPages?: number; // Number of page buttons to show
}

export function Pagination({
 currentPage,
 totalPages,
 onPageChange,
 className,
 showPages = 5,
}: PaginationProps) {
 if (totalPages <= 1) return null;

 const getVisiblePages = () => {
  const halfVisible = Math.floor(showPages / 2);
  let startPage = Math.max(currentPage - halfVisible, 1);
  const endPage = Math.min(startPage + showPages - 1, totalPages);

  if (endPage - startPage + 1 < showPages) {
   startPage = Math.max(endPage - showPages + 1, 1);
  }

  return Array.from(
   { length: endPage - startPage + 1 },
   (_, i) => startPage + i
  );
 };

 const visiblePages = getVisiblePages();

 return (
  <nav
   className={cn("flex items-center justify-center space-x-2", className)}
   aria-label="Navigasi Paginasi"
  >
   {/* Previous button */}
   <Button
    variant="outline"
    size="sm"
    onClick={() => onPageChange(currentPage - 1)}
    disabled={currentPage <= 1}
    aria-label="Ke halaman sebelumnya"
   >
    <ChevronLeft className="h-4 w-4" />
   </Button>

   {/* Page numbers */}
   {visiblePages.length > 0 && (
    <>
     {visiblePages[0]! > 1 && (
      <>
       <Button
        variant={currentPage === 1 ? "default" : "outline"}
        size="sm"
        onClick={() => onPageChange(1)}
       >
        1
       </Button>
       {visiblePages[0]! > 2 && (
        <span className="px-2 text-muted-foreground">
         <MoreHorizontal className="h-4 w-4" />
        </span>
       )}
      </>
     )}

     {visiblePages.map((page) => (
      <Button
       key={page}
       variant={currentPage === page ? "default" : "outline"}
       size="sm"
       onClick={() => onPageChange(page)}
       aria-label={`Ke halaman ${page}`}
       aria-current={currentPage === page ? "page" : undefined}
      >
       {page}
      </Button>
     ))}

     {visiblePages[visiblePages.length - 1]! < totalPages && (
      <>
       {visiblePages[visiblePages.length - 1]! < totalPages - 1 && (
        <span className="px-2 text-muted-foreground">
         <MoreHorizontal className="h-4 w-4" />
        </span>
       )}
       <Button
        variant={currentPage === totalPages ? "default" : "outline"}
        size="sm"
        onClick={() => onPageChange(totalPages)}
       >
        {totalPages}
       </Button>
      </>
     )}
    </>
   )}

   {/* Next button */}
   <Button
    variant="outline"
    size="sm"
    onClick={() => onPageChange(currentPage + 1)}
    disabled={currentPage >= totalPages}
    aria-label="Ke halaman berikutnya"
   >
    <ChevronRight className="h-4 w-4" />
   </Button>
  </nav>
 );
}

// Load more button for infinite scroll pattern
interface LoadMoreProps {
 onLoadMore: () => void;
 isLoading?: boolean;
 hasMore?: boolean;
 className?: string;
}

export function LoadMoreButton({
 onLoadMore,
 isLoading = false,
 hasMore = true,
 className,
}: LoadMoreProps) {
 if (!hasMore) return null;

 return (
  <div className={cn("flex justify-center py-8", className)}>
   <Button
    onClick={onLoadMore}
    disabled={isLoading}
    variant="outline"
    className="gap-2"
   >
    {isLoading ? (
     <>
      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      Memuat...
     </>
    ) : (
     "Muat Lebih Banyak Postingan"
    )}
   </Button>
  </div>
 );
}
