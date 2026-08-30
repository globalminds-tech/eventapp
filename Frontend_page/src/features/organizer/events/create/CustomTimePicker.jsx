import React, { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";

const TimeDropdownPicker = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState("01");
  const [minute, setMinute] = useState("24");
  const [period, setPeriod] = useState("PM");

  const ref = useRef();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update parent
  useEffect(() => {
    onChange(`${hour}:${minute} ${period}`);
  }, [hour, minute, period]);

  const inc = (val, setter, max, min = 1) => {
    let num = parseInt(val);
    num = num >= max ? min : num + 1;
    setter(num.toString().padStart(2, "0"));
  };

  const dec = (val, setter, max, min = 1) => {
    let num = parseInt(val);
    num = num <= min ? max : num - 1;
    setter(num.toString().padStart(2, "0"));
  };

  return (
    <div className="relative w-full" ref={ref}>
      
      {/* INPUT BOX */}
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between border border-gray-300 rounded-lg overflow-hidden cursor-pointer"
      >
        <span className="px-3 py-2 text-gray-500">
          {value || "Event Start Time"}
        </span>

        <div className="bg-blue-600 px-3 py-2">
          <Clock className="text-white w-4 h-4" />
        </div>
      </div>

      {/* DROPDOWN PICKER */}
      {open && (
        <div className="absolute z-50 mt-2 bg-gray-100 border rounded-xl shadow-lg p-4 w-full">

          {/* TOP */}
          <div className="flex justify-between px-6 text-gray-500">
            <button onClick={() => inc(hour, setHour, 12)}>▲</button>
            <button onClick={() => inc(minute, setMinute, 59, 0)}>▲</button>
            <button onClick={() => setPeriod(period === "AM" ? "PM" : "AM")}>▲</button>
          </div>

          {/* TIME */}
          <div className="flex justify-center items-center gap-2 text-xl font-bold my-2">
            <span>{hour}</span>
            <span>:</span>
            <span>{minute}</span>
            <span className="ml-2">{period}</span>
          </div>

          {/* BOTTOM */}
          <div className="flex justify-between px-6 text-gray-500">
            <button onClick={() => dec(hour, setHour, 12)}>▼</button>
            <button onClick={() => dec(minute, setMinute, 59, 0)}>▼</button>
            <button onClick={() => setPeriod(period === "AM" ? "PM" : "AM")}>▼</button>
          </div>

        </div>
      )}
    </div>
  );
};

export default TimeDropdownPicker;