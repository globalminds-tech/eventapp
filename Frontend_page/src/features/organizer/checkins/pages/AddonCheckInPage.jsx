import React, { useState, useEffect } from "react";
import { Search, Eye, ChevronLeft, ChevronRight, RefreshCw, Layers } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getAddonCheckins } from "@/Services/miscService";

export default function AddonCheckIn() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [addonsData, setAddonsData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAddons();
  }, []);

  const fetchAddons = async () => {
    setLoading(true);
    try {
      const res = await getAddonCheckins();
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setAddonsData(list);
    } catch {
      setAddonsData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = addonsData.filter((row) =>
    (row.visitor || "").toLowerCase().includes(search.toLowerCase()) ||
    (row.code || "").toLowerCase().includes(search.toLowerCase()) ||
    (row.addon || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Add-On Check-In & Validation
            </h1>
            <Badge className="bg-cyan-50 text-cyan-800 border-cyan-200 px-2.5 py-0.5 font-bold text-[11px]">
              Access Control
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Monitor workshop passes, special access tags, and VIP add-on redemptions from database.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={fetchAddons}
            variant="outline"
            className="h-10 px-3.5 border-slate-200 text-slate-700 hover:text-slate-900 cursor-pointer gap-2"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            <span>Refresh Records</span>
          </Button>
        </div>
      </div>

      <Card className="border-slate-200/80 shadow-sm bg-white rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by visitor, code, or add-on..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-sky-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-xs font-bold text-slate-500">
            Total Records: <span className="text-slate-900 font-extrabold">{addonsData.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Add-On Name</th>
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-5">Event / Visitor</th>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Layers className="text-slate-300 w-8 h-8" />
                      <p className="font-semibold text-xs">
                        {loading ? "Loading add-ons from database..." : "No add-on records found in database."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5 font-bold text-slate-900">{row.addon}</td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 font-bold">
                        {row.code}
                      </Badge>
                    </td>
                    <td className="py-4 px-5 text-slate-700">{row.visitor}</td>
                    <td className="py-4 px-4 text-slate-500">{row.time || "---"}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          row.status === "Checked-In" || row.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {row.status || "Active"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredData.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-5 py-4 border-t border-slate-100 gap-4">
            <div className="flex items-center gap-4">
              <p className="text-slate-500 text-xs font-medium">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
              </p>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-xs font-medium">Per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronLeft size={16} className="text-slate-600" />
                </button>
                <span className="px-3 text-xs font-bold text-slate-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronRight size={16} className="text-slate-600" />
                </button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}