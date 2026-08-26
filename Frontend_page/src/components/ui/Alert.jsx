import React from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

export const Alert = ({
  children,
  variant = "info",
  title,
  className = "",
  ...props
}) => {
  const variants = {
    info: {
      bg: "bg-sky-50 border-sky-200 text-sky-900",
      icon: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
    },
    success: {
      bg: "bg-emerald-50 border-emerald-200 text-emerald-900",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    },
    warning: {
      bg: "bg-amber-50 border-amber-200 text-amber-900",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    },
    destructive: {
      bg: "bg-red-50 border-red-200 text-red-900",
      icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
    },
  };

  const style = variants[variant] || variants.info;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-xl border ${style.bg} ${className}`}
      {...props}
    >
      {style.icon}
      <div className="flex flex-col gap-0.5">
        {title && <h5 className="text-xs font-bold tracking-tight">{title}</h5>}
        <div className="text-xs font-medium leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
};
