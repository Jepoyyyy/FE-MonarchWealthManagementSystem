import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  maxVisiblePages?: number;
}

/**
 * Calculate which page numbers to display in pagination control.
 * Returns array with page numbers (0-indexed) and null for ellipsis.
 */
function calculatePageRange(
  currentPage: number,
  totalPages: number,
  maxVisiblePages: number = 7
): (number | null)[] {
  // Show all pages if they fit within max
  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const pages: (number | null)[] = [];
  const firstPage = 0;
  const lastPage = totalPages - 1;

  // Reserve 2 slots for first and last page
  const middleSlots = maxVisiblePages - 2;
  const sidePages = Math.floor(middleSlots / 2);

  let startPage = Math.max(firstPage + 1, currentPage - sidePages);
  let endPage = Math.min(lastPage - 1, currentPage + sidePages);

  // Adjust window if near boundaries to show maximum pages
  const totalMiddlePages = endPage - startPage + 1;
  if (totalMiddlePages < middleSlots) {
    const shortage = middleSlots - totalMiddlePages;
    if (startPage === firstPage + 1) {
      endPage = Math.min(lastPage - 1, endPage + shortage);
    } else if (endPage === lastPage - 1) {
      startPage = Math.max(firstPage + 1, startPage - shortage);
    }
  }

  // Always add first page
  pages.push(firstPage);

  // Add left ellipsis if gap exists
  if (startPage > firstPage + 1) {
    pages.push(null);
  }

  // Add middle pages
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Add right ellipsis if gap exists
  if (endPage < lastPage - 1) {
    pages.push(null);
  }

  // Always add last page (unless same as first)
  if (lastPage !== firstPage) {
    pages.push(lastPage);
  }

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  maxVisiblePages = 7,
}: PaginationProps) {
  if (totalPages < 1) return null;

  // Auto-correction: if currentPage exceeds totalPages, navigate to last page
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      onPageChange(totalPages - 1);
    }
  }, [currentPage, totalPages, onPageChange]);

  const handlePageClick = (newPage: number) => {
    // Clamp to valid range
    const clampedPage = Math.max(0, Math.min(newPage, totalPages - 1));
    onPageChange(clampedPage);
  };

  const pageRange = calculatePageRange(currentPage, totalPages, maxVisiblePages);

  return (
    <nav data-testid="pagination" aria-label="pagination" className={`flex items-center justify-center gap-1 ${className}`}>
      <span data-testid="page-info" className="sr-only">
        Page {currentPage + 1} of {totalPages}
      </span>
      <button
        disabled={currentPage === 0}
        onClick={() => handlePageClick(currentPage - 1)}
        className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </button>
      <div className="flex items-center gap-1">
        {pageRange.map((pageNum, idx) =>
          pageNum === null ? (
            <span
              key={`ellipsis-${idx}`}
              className="min-w-[36px] h-9 flex items-center justify-center text-muted-foreground"
              aria-hidden="true"
            >
              ⋯
            </span>
          ) : (
            <button
              key={pageNum}
              onClick={() => handlePageClick(pageNum)}
              className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
                pageNum === currentPage
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
              }`}
              aria-label={`Go to page ${pageNum + 1}`}
              aria-current={pageNum === currentPage ? "page" : undefined}
            >
              {pageNum + 1}
            </button>
          )
        )}
      </div>
      <button
        disabled={currentPage >= totalPages - 1}
        onClick={() => handlePageClick(currentPage + 1)}
        className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}
