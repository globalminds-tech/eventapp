import React, { useState } from "react";
import { Plus, Search, Eye, Filter, ChevronLeft, ChevronRight } from "lucide-react";

export default function AddonCheckIn() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const dummyData = [
    { id: 1, addon: "Lunch Buffet", code: "AD-101", visitor: "John Doe", time: "10:30 AM", status: "Checked-In" },
    { id: 2, addon: "Networking Dinner", code: "AD-102", visitor: "Jane Smith", time: "06:15 PM", status: "Pending" },
    { id: 3, addon: "Workshop Access", code: "AD-103", visitor: "Alice Brown", time: "09:00 AM", status: "Checked-In" },
  ];

  const filteredData = dummyData.filter(row =>
    row.visitor.toLowerCase().includes(search.toLowerCase()) ||
    row.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Add-On Check-In / Check-Out</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Search by visitor or code..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            <Plus className="w-5 h-5" />
            Add New Entry
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-sky-600 text-white">
                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Add-On Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Code</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Visitor</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Time</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Search className="text-gray-300" size={32} />
                      <p className="text-gray-400 font-bold italic">No records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentData.map((row) => (
                  <tr key={row.id} className="hover:bg-sky-50/50 transition-colors duration-200 group">
                    <td className="px-6 py-4 text-center">
                      <button className="text-blue-600 hover:text-blue-800 transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="px-6 py-4 font-medium text-sky-900">{row.addon}</td>
                    <td className="px-6 py-4 text-slate-700">{row.code}</td>
                    <td className="px-6 py-4 text-slate-600">{row.visitor}</td>
                    <td className="px-6 py-4 text-slate-600">{row.time}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${row.status === "Checked-In" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                        {row.status}
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
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 mb-4 gap-4">
            <div className="flex items-center gap-4">
              <p className="text-slate-500 text-sm font-medium">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
              </p>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-sm font-medium">Records per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer shadow-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-sky-50 disabled:opacity-40 transition-all shadow-sm"
                >
                  <ChevronLeft size={20} className="text-slate-600" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === i + 1 ? "bg-sky-600 text-white shadow-lg shadow-sky-200" : "bg-white text-slate-600 border border-slate-200 hover:bg-sky-50"}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-sky-50 disabled:opacity-40 transition-all shadow-sm"
                >
                  <ChevronRight size={20} className="text-slate-600" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}