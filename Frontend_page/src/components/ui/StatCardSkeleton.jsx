import React from "react";
import { Card } from "@/components/ui/Card";

export const StatCardSkeleton = ({ count = 3, className = "" }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <Card
          key={idx}
          className={`border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 flex items-center justify-between animate-pulse ${className}`}
        >
          <div className="space-y-2.5 flex-1 pr-4">
            <div className="h-3 w-28 bg-slate-200 rounded-md" />
            <div className="h-7 w-24 bg-slate-200 rounded-lg mt-1" />
            <div className="h-2.5 w-36 bg-slate-100 rounded-md" />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 shrink-0" />
        </Card>
      ))}
    </>
  );
};

export default StatCardSkeleton;
