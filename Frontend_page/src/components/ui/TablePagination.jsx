import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Reusable Enterprise Table Pagination Component
 *
 * @param {Object} pagination - { page, limit, total, total_pages, has_next, has_prev }
 * @param {Function} onPageChange - Callback when user navigates page (newPage: number)
 * @param {Function} onLimitChange - Optional callback when user changes limit (newLimit: number)
 * @param {string} className - Optional container styling
 */
export function TablePagination({
  pagination,
  onPageChange,
  onLimitChange,
  className = "",
}) {
  if (!pagination || pagination.total === undefined) return null;

  const { page = 1, limit = 20, total = 0, total_pages = 1, has_next = false, has_prev = false } = pagination;

  const startRecord = total === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  return (
    <div className={`p-3 sm:p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white ${className}`}>
      {/* Records range indicator */}
      <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
        <span>
          Showing <strong className="text-slate-900 font-bold">{startRecord}–{endRecord}</strong> of <strong className="text-slate-900 font-bold">{total}</strong> records
        </span>

        {onLimitChange && (
          <div className="hidden sm:flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-3">
            <span className="text-[11px] text-slate-400">Per page:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="h-7 px-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}
      </div>

      {/* Page navigation controls */}
      <div className="flex items-center gap-1.5">
        <Button
          size="xs"
          variant="outline"
          disabled={!has_prev || page <= 1}
          onClick={() => onPageChange && onPageChange(page - 1)}
          className="h-8 px-2.5 rounded-xl text-xs font-extrabold gap-1 text-slate-700 border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
        >
          <ChevronLeft size={14} />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <span className="px-3 py-1 text-xs font-extrabold text-slate-700 bg-slate-50 rounded-xl border border-slate-200/60">
          Page {page} of {Math.max(1, total_pages)}
        </span>

        <Button
          size="xs"
          variant="outline"
          disabled={!has_next || page >= total_pages}
          onClick={() => onPageChange && onPageChange(page + 1)}
          className="h-8 px-2.5 rounded-xl text-xs font-extrabold gap-1 text-slate-700 border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}

export default TablePagination;
