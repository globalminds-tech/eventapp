import React from "react";
import { Clock } from "lucide-react";

// Convert 12-hour AM/PM string ("06:51 PM") to 24-hour HH:MM string ("18:51")
const formatTo24Hour = (time12) => {
  if (!time12) return "";
  const str = time12.trim();
  const match = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (!match) return "";
  let h = parseInt(match[1], 10);
  const m = match[2];
  const period = match[3]?.toUpperCase();

  if (period === "PM" && h < 12) h += 12;
  if (period === "AM" && h === 12) h = 0;

  return `${h.toString().padStart(2, "0")}:${m}`;
};

// Convert 24-hour HH:MM string ("18:51") to 12-hour AM/PM string ("06:51 PM")
const formatTo12Hour = (time24) => {
  if (!time24) return "";
  const match = time24.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return time24;
  let h = parseInt(match[1], 10);
  const m = match[2];
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h.toString().padStart(2, "0")}:${m} ${period}`;
};

const TimePickerClock = ({ value, onChange, hasError, isCustomStyle, disabled }) => {
  const value24 = formatTo24Hour(value) || value || "";

  const handleChange = (e) => {
    const rawVal = e.target.value;
    const formatted12 = formatTo12Hour(rawVal);
    if (onChange) {
      onChange(formatted12);
    }
  };

  if (isCustomStyle) {
    return (
      <div
        className={`w-full bg-white border rounded-xl shadow-sm flex items-center justify-between overflow-hidden h-14 transition-all ${
          hasError ? "border-red-500" : "border-slate-200 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20"
        } ${disabled ? "opacity-60 bg-slate-50 cursor-not-allowed" : ""}`}
      >
        <input
          type="time"
          value={value24}
          onChange={handleChange}
          disabled={disabled}
          className="px-4 text-sm font-semibold text-slate-800 bg-transparent outline-none w-full appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none cursor-pointer"
        />
        <div className="h-full w-12 bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 border-l border-slate-200 pointer-events-none">
          <Clock size={18} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full bg-slate-50 border rounded-xl px-3 py-1.5 flex items-center justify-between text-xs transition-all ${
        hasError ? "border-red-400 focus-within:ring-red-400" : "border-slate-200 focus-within:border-cyan-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-cyan-500"
      } ${disabled ? "opacity-60 bg-slate-100 cursor-not-allowed" : ""}`}
    >
      <input
        type="time"
        value={value24}
        onChange={handleChange}
        disabled={disabled}
        className="bg-transparent text-slate-900 font-semibold outline-none w-full text-xs appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none disabled:cursor-not-allowed cursor-pointer"
      />
      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1.5 pointer-events-none" />
    </div>
  );
};

export default TimePickerClock;