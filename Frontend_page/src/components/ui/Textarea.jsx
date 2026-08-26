import React from "react";

export const Textarea = React.forwardRef(({
  className = "",
  error = false,
  label,
  helperText,
  rows = 3,
  ...props
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-slate-700 tracking-tight">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`flex w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${
          error ? "border-red-500 focus-visible:ring-red-500" : ""
        } ${className}`}
        {...props}
      />
      {helperText && (
        <span className={`text-[11px] ${error ? "text-red-500 font-medium" : "text-slate-500"}`}>
          {helperText}
        </span>
      )}
    </div>
  );
});

Textarea.displayName = "Textarea";
