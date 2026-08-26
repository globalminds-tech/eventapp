import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = ({
  open = false,
  onClose,
  children,
  maxWidth = "max-w-lg",
  className = ""
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className={cn("relative w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-scaleUp", maxWidth, className)}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
        {children}
      </div>
    </div>
  );
};

export const DialogHeader = ({ children, className = "" }) => (
  <div className={cn("p-6 pb-4 border-b border-slate-100 flex flex-col gap-1", className)}>
    {children}
  </div>
);

export const DialogTitle = ({ children, className = "" }) => (
  <h2 className={cn("text-xl font-bold text-slate-900 tracking-tight", className)}>
    {children}
  </h2>
);

export const DialogDescription = ({ children, className = "" }) => (
  <p className={cn("text-xs text-slate-500 font-normal", className)}>
    {children}
  </p>
);

export const DialogContent = ({ children, className = "" }) => (
  <div className={cn("p-6", className)}>
    {children}
  </div>
);

export const DialogFooter = ({ children, className = "" }) => (
  <div className={cn("p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3", className)}>
    {children}
  </div>
);
