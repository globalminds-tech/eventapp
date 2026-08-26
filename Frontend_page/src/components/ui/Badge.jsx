import React from "react";
import { cn } from "@/lib/utils";

export const Badge = ({ children, variant = "default", className = "", ...props }) => {
  const base = "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full transition-colors select-none";

  const variants = {
    default: "bg-sky-100 text-sky-800 border border-sky-200",
    secondary: "bg-slate-100 text-slate-700 border border-slate-200",
    success: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    warning: "bg-amber-100 text-amber-800 border border-amber-200",
    destructive: "bg-red-100 text-red-800 border border-red-200",
    purple: "bg-purple-100 text-purple-800 border border-purple-200",
  };

  return (
    <span className={cn(base, variants[variant] || variants.default, className)} {...props}>
      {children}
    </span>
  );
};
