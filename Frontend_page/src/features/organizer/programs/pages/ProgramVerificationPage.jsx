import React, { useState, useEffect } from "react";
import { getProgramVerificationEvents } from "@/Services/api";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
export const ProgramVerification = () => {
  const [page, setPage] = useState("list");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await getProgramVerificationEvents();
      const formatted = res.map((item) => ({
        code: item.event_code,
        name: item.event_name,
        inprocess: 0,
        approved: 0,
        rejected: 0,
        id: item.id
      }));
      setData(formatted);
    } catch (err) {
      console.error("Error fetching program verification events:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(item =>
    (item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.code || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      {/* ================= PAGE 1 ================= */}

      {page === "list" && (
        <>
          <h1 className="text-3xl font-semibold text-gray-700 mb-6">
            Program Verification
          </h1>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <input
                type="text"
                placeholder="Search"
                className="border px-4 py-2 w-72 rounded outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-sky-600 text-white">
                    <th className="px-6 py-4 text-left text-sm font-bold text-white tracking-wider">Action</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white tracking-wider">Event Code </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white tracking-wider">Event Name</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-white tracking-wider">In-Progress</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-white tracking-wider">Approved</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-white tracking-wider">Rejected</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-50">
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-gray-400 italic font-medium">
                        No events found matching your criteria
                      </td>
                    </tr>
                  ) : (
                    currentData.map((item, index) => (
                      <tr key={index} className="hover:bg-sky-50/50 transition-colors duration-200 group bg-white">
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setPage("details")}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Eye size={20} />
                          </button>
                        </td>

                        <td className="px-6 py-4 text-slate-700">{item.code}</td>

                        <td className="px-6 py-4 text-slate-700 text-left">{item.name}</td>

                        <td className="px-6 py-4 text-slate-700 text-center">{item.inprocess}</td>

                        <td className="px-6 py-4 text-slate-700 text-center">{item.approved}</td>

                        <td className="px-6 py-4 text-slate-700 text-center">{item.rejected}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredData.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-8 mb-12 gap-4">
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
        </>
      )}

      {/* ================= PAGE 2 ================= */}

      {page === "details" && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold text-gray-700">
              Program Verification
            </h1>

            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search by Program Names"
                className="border px-4 py-2 rounded"
              />

              <select className="border px-3 py-2 rounded">
                <option>All</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>

              <button className="border px-4 py-2 rounded">🔍</button>
            </div>
          </div>

          <button
            onClick={() => setPage("list")}
            className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Back
          </button>
        </>
      )}
    </div>
  );
};