import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      <button
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
        className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </button>
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
              i === currentPage
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
            }`}
            aria-label={`Go to page ${i + 1}`}
            aria-current={i === currentPage ? "page" : undefined}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <button
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
        className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
