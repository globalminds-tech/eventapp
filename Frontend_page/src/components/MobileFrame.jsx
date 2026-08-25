import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Compass, Home as HomeIcon, Calendar, User, Wifi, Battery, ShieldAlert } from "lucide-react";

export default function MobileFrame({ children }) {
  const location = useLocation();
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      setTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Determine page type to adjust styling (e.g. padding/backgrounds)
  const isAuthPage = 
    location.pathname === "/Login" || 
    location.pathname === "/Register" || 
    location.pathname === "/reset-password";

  return (
    <div className="min-h-screen w-full bg-[#0a0f1d] flex items-center justify-center font-sans antialiased text-white relative py-0 sm:py-6 select-none overflow-hidden">
      {/* Dynamic atmospheric background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[130px] pointer-events-none hidden sm:block" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-orange-500/10 blur-[130px] pointer-events-none hidden sm:block" />

      {/* Interactive Mobile Device Shell */}
      <div className="w-full sm:w-[412px] h-screen sm:h-[840px] bg-[#0f172a] sm:rounded-[44px] sm:border-[8px] sm:border-slate-800 shadow-2xl relative flex flex-col overflow-hidden sm:ring-2 sm:ring-slate-700/50">
        
        {/* iOS / Android Top Notch Simulator (Desktop only) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-[110] flex items-center justify-center gap-1.5 pointer-events-none hidden sm:flex">
          <div className="w-10 h-1 bg-slate-800 rounded-full" />
          <div className="w-2.5 h-2.5 bg-slate-950 rounded-full border border-slate-800/30" />
        </div>

        {/* Mobile Status Bar */}
        <div className="w-full h-11 bg-transparent px-5 flex items-center justify-between z-50 text-[11px] font-bold select-none text-slate-350 absolute top-0 pointer-events-none">
          <div className="flex items-center gap-1">
            <span>{time || "12:00 PM"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi size={11} className="text-slate-350" />
            <span className="text-[9px]">5G</span>
            <Battery size={13} className="text-slate-350" />
          </div>
        </div>

        {/* Dynamic App Content Body (Dark Slate matching mobile app theme) */}
        <div className="flex-1 overflow-y-auto no-scrollbar pt-11 bg-[#0f172a] relative">
          {children}
        </div>

        {/* Bottom Home Indicator Bar (iOS style) */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-700 rounded-full z-50 pointer-events-none hidden sm:block" />
      </div>
    </div>
  );
}
