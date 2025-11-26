import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductTablePaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function ProductTablePagination({
  totalPages,
  currentPage,
  onPageChange,
}: ProductTablePaginationProps) {
  const getPaginationRange = (
    totalPages: number,
    currentPage: number,
    siblingCount = 1
  ): (number | string)[] => {
    const totalPageNumbers = siblingCount * 2 + 5;
    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSibling = Math.max(currentPage - siblingCount, 1);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages);
    const showLeftDots = leftSibling > 2;
    const showRightDots = rightSibling < totalPages - 2;

    if (!showLeftDots && showRightDots) {
      const range = Array.from({ length: 3 + siblingCount * 2 }, (_, i) => i + 1);
      return [...range, "...", totalPages];
    }

    if (showLeftDots && !showRightDots) {
      const range = Array.from({ length: 3 + siblingCount * 2 }, (_, i) =>
        totalPages - (2 + siblingCount * 2) + i
      );
      return [1, "...", ...range];
    }

    if (showLeftDots && showRightDots) {
      const range = Array.from(
        { length: rightSibling - leftSibling + 1 },
        (_, i) => leftSibling + i
      );
      return [1, "...", ...range, "...", totalPages];
    }

    return [];
  };

  return (
    <div className="mt-4 flex justify-between items-center flex-wrap gap-4">
      {/* BÊN TRÁI */}
      <p className="text-sm text-gray-700">Trang {currentPage} / {totalPages}</p>

      {/* BÊN PHẢI */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Prev */}
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page numbers */}
        {getPaginationRange(totalPages, currentPage).map((page, index) => (
          <button
            key={index}
            disabled={page === "..."}
            onClick={() => typeof page === "number" && onPageChange(page)}
            className={`w-8 h-8 text-sm flex items-center justify-center rounded-md
              ${page === currentPage ? "text-blue-600 underline font-semibold" : "text-gray-800 hover:bg-gray-100"}
              ${page === "..." ? "cursor-default text-gray-400" : ""}
            `}
          >
            {page}
          </button>
        ))}

        {/* Next */}
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
