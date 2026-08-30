import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const roles = ["Event Manager", "Super Admin"];
const users = ["John Smith", "Jane Doe", "Alice Johnson", "Bob Williams", "Carol White"];
const modules = ["Dashboard", "Event", "Program", "Approval", "Accounts", "Sponsership", "User settings", "User", "Master", "Help & Support", "Stall Management", "Report"];




const permissions = ["create", "update", "delete", "view", "print", "approval"];

const rows = []; // Placeholder data

export default function UserWiseScreenMapping() {
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [headerChecks, setHeaderChecks] = useState({
    create: false, update: false, delete: false, view: false, print: false, approval: false,
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.ceil(rows.length / pageSize) || 1;

  const toggleHeader = (perm) => {
    setHeaderChecks((prev) => ({ ...prev, [perm]: !prev[perm] }));
  };

  const handleSave = () => alert("Saved!");
  const handleDelete = () => alert("Deleted!");

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">User Wise Screen Mapping</h1>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="p-2 border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-600"
            title="Save"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h8l4 4v12a2 2 0 01-2 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 21v-6h6v6M9 3v4h6" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-2 border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-600"
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex gap-4">
        {/* Left Panel */}
        <div className="w-72 bg-white rounded border border-gray-200 p-5 flex-shrink-0">
          <h2 className="text-blue-600 font-semibold text-lg mb-4">User Details</h2>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Role Name</label>
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-500 appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">Role Name</option>
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">User Name</label>
            <div className="relative">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-500 appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">User Name</option>
                {users.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Module Name</label>
            <div className="relative">
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-500 appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">Module Name</option>
                {modules.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>

        </div>


        {/* Right Panel */}
        <div className="flex-1 bg-white rounded border border-gray-200 p-5">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
            <tr className="bg-sky-600 text-white">
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Module</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Screen</th>
                  {permissions.map((perm) => (
                    <th key={perm} className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider border border-gray-200 w-20">
                      <div className="flex flex-col items-center gap-1">
                        <span className="capitalize">{perm.charAt(0).toUpperCase() + perm.slice(1)}</span>
                        <input
                          type="checkbox"
                          checked={headerChecks[perm]}
                          onChange={() => toggleHeader(perm)}
                          className="w-4 h-4 cursor-pointer accent-blue-600"
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={8} className="border border-gray-200 px-4 py-6 text-center text-gray-400">
                    No Data Found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 mb-4 gap-4 px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <p className="text-slate-500 text-sm font-medium">
                Showing {rows.length === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, rows.length)} of {rows.length} entries
              </p>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-sm font-medium">Records per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
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
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-sky-50 disabled:opacity-40 transition-all shadow-sm"
                >
                  <ChevronLeft size={20} className="text-slate-600" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-xl font-bold transition-all ${page === i + 1 ? "bg-sky-600 text-white shadow-lg shadow-sky-200" : "bg-white text-slate-600 border border-slate-200 hover:bg-sky-50"}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-sky-50 disabled:opacity-40 transition-all shadow-sm"
                >
                  <ChevronRight size={20} className="text-slate-600" />
                </button>
              </div>
            )}
          </div>
          <div className="hidden">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="p-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
            >
              «
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
            >
              ‹
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
            >
              ›
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="p-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
            >
              »
            </button>
            <div className="relative ml-2">
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="border border-gray-300 rounded px-3 py-1 text-sm appearance-none bg-white focus:outline-none pr-7"
              >
                {[5, 10, 20, 50].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}