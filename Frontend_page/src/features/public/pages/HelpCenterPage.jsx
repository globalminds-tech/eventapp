import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function Help() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#1f2937] flex flex-col font-sans select-none pb-24">
      {/* Navigation Header bar matching web home layout style */}
      <div className="h-14 px-4 border-b border-gray-200 flex items-center gap-3 bg-white sticky top-0 z-30 shadow-sm">
        <button
          onClick={() => navigate("/")}
          className="p-1 hover:bg-slate-100 rounded-full cursor-pointer text-slate-500 hover:text-slate-900 border-none bg-transparent"
        >
          <ChevronLeft size={22} />
        </button>
        <span className="text-base font-bold tracking-tight text-slate-800">Help Center</span>
      </div>

      <div className="max-w-3xl mx-auto w-full px-6 py-8">
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-150 shadow-md">
          <h1 className="text-2xl md:text-3xl font-bold text-[#134e4a] text-center mb-3">
            Book My Event Help & Documentation
          </h1>
          <div className="h-px bg-gray-200 mb-8" />

          {/* Grid Layout of Help Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Getting Started Block */}
            <div className="bg-[#f0fdfa] border border-[#ccfbf1] p-5 rounded-2xl flex flex-col items-center text-center">
              <span className="text-3xl mb-3">🚀</span>
              <h2 className="font-bold text-[#115e59] text-base mb-2">Getting Started</h2>
              <p className="text-xs text-[#0d9488] leading-relaxed">
                New to the platform? Start here for a quick tour.
              </p>
            </div>

            {/* User Manual Block */}
            <div className="bg-[#eff6ff] border border-[#dbeafe] p-5 rounded-2xl flex flex-col items-center text-center">
              <span className="text-3xl mb-3">📖</span>
              <h2 className="font-bold text-[#1e40af] text-base mb-2">User Manual</h2>
              <p className="text-xs text-[#2563eb] leading-relaxed">
                Detailed guides for every module and feature.
              </p>
            </div>

            {/* Troubleshooting Block */}
            <div className="bg-[#fffbeb] border border-[#fef3c7] p-5 rounded-2xl flex flex-col items-center text-center">
              <span className="text-3xl mb-3">🔧</span>
              <h2 className="font-bold text-[#92400e] text-base mb-2">Troubleshooting</h2>
              <p className="text-xs text-[#d97706] leading-relaxed">
                Common issues and how to resolve them.
              </p>
            </div>
          </div>

          {/* Detailed instruction section 1 */}
          <div className="mb-8">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 underline decoration-[#5eead4] decoration-2">
              How to use Check-In/Out
            </h2>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              The Check-In module allows you to track visitor arrivals in real-time. Simply search for a visitor code or name and click the check-in button. The status will update instantly on the dashboard.
            </p>
          </div>

          {/* Detailed instruction section 2 */}
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 underline decoration-[#5eead4] decoration-2">
              Bulk Uploading Data
            </h2>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              You can upload bulk visitor registrations using the provided Excel template. Ensure all required fields (Name, Email, Phone) are filled before uploading to avoid validation errors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}