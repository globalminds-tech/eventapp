import React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef(({
  className = "",
  type = "text",
  error = false,
  label,
  helperText,
  ...props
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-slate-700 tracking-tight flex items-center justify-between">
          {label}
        </label>
      )}
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        {...props}
      />
      {helperText && (
        <span className={cn("text-[11px]", error ? "text-red-500 font-medium" : "text-slate-500")}>
          {helperText}
        </span>
      )}
    </div>
  );
});

Input.displayName = "Input";
