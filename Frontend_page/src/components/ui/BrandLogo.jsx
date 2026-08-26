import React from "react";
import { cn } from "@/lib/utils";

export const BrandLogo = ({
  isCollapsed = false,
  roleLabel = "",
  textColor = "text-slate-900",
  className = ""
}) => {
  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      {/* 3-Pill Dynamic Mobile Logo Mark (No dark background box) */}
      <div className="flex items-center gap-1 shrink-0 px-0.5">
        <span className="w-2 h-5 bg-[#3b82f6] rounded-full -rotate-12 transform shadow-sm" />
        <span className="w-2 h-5 bg-[#f97316] rounded-full rotate-12 transform shadow-sm" />
        <span className="w-2 h-5 bg-[#22c55e] rounded-full -rotate-6 transform shadow-sm" />
      </div>

      {!isCollapsed && (
        <div className="flex flex-col min-w-0">
          <h2 className={cn("text-base font-[900] tracking-[--letter-spacing,-0.04em] leading-none", textColor)}>
            BookMyEvent
          </h2>
          {roleLabel && (
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1 block truncate">
              {roleLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
