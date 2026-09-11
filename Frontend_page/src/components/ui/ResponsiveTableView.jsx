import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { cn } from "@/lib/utils";

/**
 * MobileDataCard
 * Subcomponent for building consistent, native-like cards on mobile screens.
 */
export const MobileDataCard = ({
  children,
  onClick,
  className = "",
  highlightBorder = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl border border-slate-200/85 p-4 shadow-2xs transition-all duration-200 space-y-3",
        onClick ? "cursor-pointer hover:border-slate-300 active:scale-[0.99]" : "",
        highlightBorder ? "border-l-4 border-l-cyan-500" : "",
        className
      )}
    >
      {children}
    </div>
  );
};

MobileDataCard.Header = ({ title, subtitle, badge, statusBadge, onTitleClick }) => (
  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
    <div className="min-w-0 flex-1">
      {badge && <div className="mb-1">{badge}</div>}
      <h4
        onClick={onTitleClick}
        className={cn(
          "font-black text-slate-900 text-sm line-clamp-1",
          onTitleClick ? "cursor-pointer hover:text-cyan-600 transition-colors" : ""
        )}
      >
        {title}
      </h4>
      {subtitle && (
        <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
          {subtitle}
        </p>
      )}
    </div>
    {statusBadge && <div className="shrink-0">{statusBadge}</div>}
  </div>
);

MobileDataCard.Grid = ({ items = [], columns = 2, className = "" }) => (
  <div
    className={cn(
      "grid gap-2 text-xs",
      columns === 3 ? "grid-cols-3" : "grid-cols-2",
      className
    )}
  >
    {items.map((item, idx) => (
      <div key={idx} className="space-y-0.5 min-w-0">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
          {item.label}
        </span>
        <div className="font-bold text-slate-800 text-xs truncate">
          {item.value}
        </div>
      </div>
    ))}
  </div>
);

MobileDataCard.Actions = ({ children, className = "" }) => (
  <div
    className={cn(
      "pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2 flex-wrap",
      className
    )}
    onClick={(e) => e.stopPropagation()}
  >
    {children}
  </div>
);

/**
 * TableSkeleton
 * Universal desktop table skeleton with customizable column count and realistic cell shapes.
 */
export const TableSkeleton = ({
  columns = [],
  columnCount = 5,
  rows = 4,
  className = "",
  tableClassName = "",
}) => {
  const effectiveCols =
    Array.isArray(columns) && columns.length > 0
      ? columns
      : Array.from({ length: Math.max(1, columnCount) }).map((_, idx) => {
          if (idx === 0) return { header: null, className: "w-1/3 min-w-[180px]" };
          if (idx === columnCount - 1) return { header: null, className: "w-24 text-right" };
          return { header: null, className: "w-1/5" };
        });

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs",
        className
      )}
    >
      <Table className={tableClassName}>
        <TableHeader>
          <TableRow className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-wider">
            {effectiveCols.map((col, idx) => (
              <TableHead key={idx} className={col.className}>
                {col.header ? (
                  col.header
                ) : (
                  <Skeleton
                    className={cn(
                      "h-3.5 rounded-md bg-slate-200/90",
                      idx === 0
                        ? "w-28"
                        : idx === effectiveCols.length - 1
                        ? "w-14 ml-auto"
                        : "w-20"
                    )}
                  />
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rIdx) => (
            <TableRow key={rIdx} className="animate-pulse">
              {effectiveCols.map((col, cIdx) => (
                <TableCell key={cIdx} className={col.className}>
                  {cIdx === 0 ? (
                    <div className="space-y-1.5 py-1">
                      <Skeleton className="h-4 w-40 rounded-md bg-slate-200/90" />
                      <Skeleton className="h-3 w-24 rounded bg-slate-200/60" />
                    </div>
                  ) : cIdx === effectiveCols.length - 1 ? (
                    <Skeleton className="h-7 w-20 rounded-xl ml-auto bg-slate-200/90" />
                  ) : cIdx % 2 === 1 ? (
                    <Skeleton className="h-5 w-20 rounded-full bg-slate-200/80" />
                  ) : (
                    <Skeleton className="h-4 w-28 rounded-md bg-slate-200/70" />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

/**
 * MobileDataCardSkeleton
 * Smooth, native-like mobile card skeleton matching MobileDataCard dimensions.
 */
export const MobileDataCardSkeleton = ({ count = 4, className = "" }) => (
  <div className={cn("md:hidden flex flex-col gap-3", className)}>
    {Array.from({ length: count }).map((_, idx) => (
      <div
        key={idx}
        className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3 shadow-2xs animate-pulse"
      >
        <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-2.5">
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3 w-16 rounded bg-slate-200/70" />
            <Skeleton className="h-4 w-36 rounded-md bg-slate-200/90" />
            <Skeleton className="h-3 w-24 rounded bg-slate-200/60" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full shrink-0 bg-slate-200/80" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Skeleton className="h-2.5 w-14 rounded bg-slate-200/60" />
            <Skeleton className="h-4 w-24 rounded bg-slate-200/80" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-2.5 w-14 rounded bg-slate-200/60" />
            <Skeleton className="h-4 w-20 rounded bg-slate-200/80" />
          </div>
        </div>
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <Skeleton className="h-7 w-24 rounded-xl bg-slate-200/80" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * ResponsiveTableView
 * Dual-rendering container:
 * - Desktop (>= 768px): Full-featured Shadcn data table
 * - Mobile (< 768px): Compact, native touch-optimized card list
 */
export const ResponsiveTableView = ({
  columns = [],
  columnCount = 5,
  data = [],
  keyField = "id",
  loading = false,
  loadingCount = 4,
  desktopSkeleton = null,
  mobileSkeleton = null,
  emptyMessage = "No records found.",
  emptyAction = null,
  onRowClick,
  renderMobileCard,
  renderDesktopTable,
  containerClassName = "",
  tableClassName = "",
  mobileContainerClassName = "",
}) => {
  // ── LOADING STATE ──
  if (loading) {
    return (
      <div className={cn("space-y-3", containerClassName)}>
        {/* Desktop Skeleton */}
        <div className="hidden md:block">
          {desktopSkeleton ? (
            typeof desktopSkeleton === "function" ? (
              desktopSkeleton({ loadingCount, columns, columnCount })
            ) : (
              desktopSkeleton
            )
          ) : (
            <TableSkeleton
              columns={columns}
              columnCount={
                columns && columns.length > 0 ? columns.length : columnCount
              }
              rows={loadingCount}
              tableClassName={tableClassName}
            />
          )}
        </div>

        {/* Mobile Skeleton Cards */}
        {mobileSkeleton ? (
          typeof mobileSkeleton === "function" ? (
            mobileSkeleton({ loadingCount })
          ) : (
            mobileSkeleton
          )
        ) : (
          <MobileDataCardSkeleton
            count={loadingCount}
            className={mobileContainerClassName}
          />
        )}
      </div>
    );
  }

  // ── EMPTY STATE ──
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-2xs space-y-3">
        <p className="text-slate-400 font-semibold text-xs sm:text-sm">
          {emptyMessage}
        </p>
        {emptyAction && <div className="pt-1">{emptyAction}</div>}
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      {/* ── DESKTOP VIEW (MD and up): TABLE ── */}
      <div className="hidden md:block">
        {renderDesktopTable ? (
          renderDesktopTable({ data, columns, onRowClick, loading, loadingCount })
        ) : (
          <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
            <Table className={tableClassName}>
              <TableHeader>
                <TableRow className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-wider">
                  {columns.map((col, idx) => (
                    <TableHead key={idx} className={col.className}>
                      {col.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, rIdx) => (
                  <TableRow
                    key={row[keyField] ?? rIdx}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={cn(
                      "hover:bg-slate-50/80 transition-colors",
                      onRowClick ? "cursor-pointer" : ""
                    )}
                  >
                    {columns.map((col, cIdx) => (
                      <TableCell key={cIdx} className={col.className}>
                        {typeof col.cell === "function"
                          ? col.cell(row, rIdx)
                          : typeof col.accessor === "function"
                          ? col.accessor(row)
                          : row[col.accessor] ?? "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* ── MOBILE VIEW (< MD): CARDS LIST ── */}
      <div className={cn("md:hidden flex flex-col gap-3", mobileContainerClassName)}>
        {data.map((row, rIdx) => {
          if (renderMobileCard) {
            return (
              <React.Fragment key={row[keyField] ?? rIdx}>
                {renderMobileCard(row, rIdx)}
              </React.Fragment>
            );
          }

          // Fallback Default Intelligent Mobile Card
          const primaryCol = columns.find((c) => c.isPrimary) || columns[0];
          const statusCol = columns.find((c) => c.isBadge);
          const actionCol = columns.find((c) => c.isAction || c.header === "Actions" || c.header === "Action");
          const detailCols = columns.filter(
            (c) => c !== primaryCol && c !== statusCol && c !== actionCol && !c.hideOnMobile
          );

          const primaryVal = primaryCol
            ? typeof primaryCol.cell === "function"
              ? primaryCol.cell(row, rIdx)
              : typeof primaryCol.accessor === "function"
              ? primaryCol.accessor(row)
              : row[primaryCol.accessor]
            : null;

          const statusVal = statusCol
            ? typeof statusCol.cell === "function"
              ? statusCol.cell(row, rIdx)
              : typeof statusCol.accessor === "function"
              ? statusCol.accessor(row)
              : row[statusCol.accessor]
            : null;

          const actionVal = actionCol
            ? typeof actionCol.cell === "function"
              ? actionCol.cell(row, rIdx)
              : typeof actionCol.accessor === "function"
              ? actionCol.accessor(row)
              : row[actionCol.accessor]
            : null;

          return (
            <MobileDataCard
              key={row[keyField] ?? rIdx}
              onClick={() => onRowClick && onRowClick(row)}
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="min-w-0 flex-1">{primaryVal}</div>
                {statusVal && <div className="shrink-0">{statusVal}</div>}
              </div>

              {detailCols.length > 0 && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {detailCols.map((c, idx) => (
                    <div key={idx} className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
                        {c.header}
                      </span>
                      <div className="font-bold text-slate-800 text-xs truncate">
                        {typeof c.cell === "function"
                          ? c.cell(row, rIdx)
                          : typeof c.accessor === "function"
                          ? c.accessor(row)
                          : row[c.accessor] ?? "—"}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {actionVal && (
                <div
                  className="pt-2 border-t border-slate-100 flex items-center justify-end"
                  onClick={(e) => e.stopPropagation()}
                >
                  {actionVal}
                </div>
              )}
            </MobileDataCard>
          );
        })}
      </div>
    </div>
  );
};

export default ResponsiveTableView;
