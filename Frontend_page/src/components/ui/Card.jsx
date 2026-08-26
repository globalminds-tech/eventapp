import React from "react";
import { cn } from "@/lib/utils";

export const Card = ({ children, className = "", ...props }) => (
  <div className={cn("bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden", className)} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = "", ...props }) => (
  <div className={cn("p-5 pb-3 border-b border-slate-100 flex flex-col gap-1", className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = "", ...props }) => (
  <h3 className={cn("text-lg font-bold text-slate-900 tracking-tight", className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = "", ...props }) => (
  <p className={cn("text-xs text-slate-500 font-normal", className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({ children, className = "", ...props }) => (
  <div className={cn("p-5", className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = "", ...props }) => (
  <div className={cn("p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between", className)} {...props}>
    {children}
  </div>
);
