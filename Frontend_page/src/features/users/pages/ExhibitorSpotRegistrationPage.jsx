import { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function PassGeneration() {
  const [search, setSearch] = useState("");

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Pass Generation
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Search Keyword..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-sky-600 text-white">
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    Event Code
                    <span className="flex flex-col gap-[1px]">
                      <svg width="8" height="5" viewBox="0 0 8 5" fill="none"><path d="M4 0L7.5 4.5H0.5L4 0Z" fill="#94a3b8" /></svg>
                      <svg width="8" height="5" viewBox="0 0 8 5" fill="none"><path d="M4 5L0.5 0.5H7.5L4 5Z" fill="#94a3b8" /></svg>
                    </span>
                  </span>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    Event Name
                    <span className="flex flex-col gap-[1px]">
                      <svg width="8" height="5" viewBox="0 0 8 5" fill="none"><path d="M4 0L7.5 4.5H0.5L4 0Z" fill="#94a3b8" /></svg>
                      <svg width="8" height="5" viewBox="0 0 8 5" fill="none"><path d="M4 5L0.5 0.5H7.5L4 5Z" fill="#94a3b8" /></svg>
                    </span>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <tr className="hover:bg-sky-50/50 transition-colors duration-200 group">
                <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">
                  No Data Found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 mb-4 gap-4 px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <p className="text-slate-500 text-sm font-medium">
              Showing 0 to 0 of 0 entries
            </p>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-sm font-medium">Records per page:</span>
              <select
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer shadow-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              disabled
              className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-sky-50 disabled:opacity-40 transition-all shadow-sm"
            >
              <ChevronLeft size={20} className="text-slate-600" />
            </button>
            <button
              disabled
              className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-sky-50 disabled:opacity-40 transition-all shadow-sm"
            >
              <ChevronRight size={20} className="text-slate-600" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}