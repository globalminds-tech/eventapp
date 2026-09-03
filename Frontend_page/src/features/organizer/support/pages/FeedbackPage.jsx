import { useState, useEffect, useCallback } from "react";
import {
  getFeedbacks,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  getApprovedEvents
} from "@/Services/api";
import { Select, SelectItem } from "@/components/ui/Select";
import {
  Plus,
  Search,
  ArrowLeft,
  Trash2,
  FileText,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  AlertCircle
} from "lucide-react";

// ── HELPER: format TIMESTAMP or DATE → "DD/MM/YYYY" ────────────────────────
const formatDate = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d)) return val;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export default function FeedbackModule() {
  const [page, setPage] = useState("list");
  const [editId, setEditId] = useState(null);

  // delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // list
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loadingList, setLoadingList] = useState(false);

  // form
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [explanation, setExplanation] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // toast
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch feedbacks ───────────────
  const fetchList = useCallback(async () => {
    setLoadingList(true);
    try {
      const data = await getFeedbacks();
      setRows(data);
    } catch {
      showToast("Failed to load feedbacks", "error");
    } finally {
      setLoadingList(false);
    }
  }, []);

  // ── Fetch events for dropdown ─────────────────────────────────────────────
  const fetchEvents = useCallback(async () => {
    try {
      const data = await getApprovedEvents();
      setEvents(data);
    } catch {
      showToast("Failed to load events", "error");
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  // ── Open new form ─────────────────────────────────────────────────────────
  const openNew = async () => {
    setEditId(null);
    setEventId("");
    setExplanation("");
    setFormError("");
    await fetchEvents();
    setPage("form");
  };

  // ── Open edit form ────────────────────────────────────────────────────────
  const openEdit = async (row) => {
    setEditId(row.id);
    setEventId(String(row.event_id));
    setExplanation(row.explanation || "");
    setFormError("");
    await fetchEvents();
    setPage("form");
  };

  // ── Save (POST or PUT) ────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!eventId) { setFormError("Event is required."); return; }
    setFormError("");
    setSaving(true);

    const selectedEvent = events.find(e => String(e.id) === String(eventId));
    const body = {
      event_id: eventId,
      event_name: selectedEvent ? selectedEvent.event_name : "",
      explanation
    };

    try {
      if (editId) {
        await updateFeedback(editId, body);
      } else {
        await createFeedback(body);
      }
      showToast(editId ? "Feedback updated!" : "Feedback saved!");
      await fetchList();
      setPage("list");
    } catch {
      showToast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const openDeleteModal = (id) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await deleteFeedback(itemToDelete);
      showToast("Deleted.");
      await fetchList();
      setDeleteModalOpen(false);
      setItemToDelete(null);
      if (page === "form") setPage("list");
    } catch {
      showToast("Delete failed", "error");
    }
  };

  // ── Filter + paginate ─────────────────────────────────────────────────────
  const filtered = rows.filter(r =>
    !search ||
    r.feedback_code?.toLowerCase().includes(search.toLowerCase()) ||
    r.event_name?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // ── RENDER LIST ───────────────────────────────────────────────────────────
  const renderList = () => (
    <div className="min-h-screen bg-[#fafafa] p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-sky-900 tracking-tight">
              Feedback Management
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative group flex-1 sm:flex-initial">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-sky-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-50 transition-all"
              />
            </div>

            <button
              onClick={openNew}
              className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 rounded-xl flex gap-2 items-center justify-center font-bold shadow-lg shadow-sky-200 transition-all hover:scale-105 active:scale-95 text-sm"
            >
              <Plus size={18} />
              Add Feedback
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* HEADER */}
              <thead>
                <tr className="bg-sky-600 text-white">
                  <th className="px-6 py-4 text-center text-xs font-bold text-white  tracking-wider">
                    Actions
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white  tracking-wider">
                    Feedback Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white  tracking-wider">
                    Event Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white  tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white  tracking-wider">
                    Created On
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white tracking-wider">
                    Modified On
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loadingList ? (
                  <tr><td colSpan="6" className="px-6 py-20 text-center text-gray-400 font-medium">Loading feedback...</td></tr>
                ) : paged.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <Search size={40} className="text-gray-200 mb-4" />
                        <p className="text-gray-400 font-bold">No feedback records found</p>
                      </div>
                    </td>
                  </tr>
                ) : paged.map(row => (
                  <tr key={row.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(row)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(row.id)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-sm">
                        {row.feedback_code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-700 truncate max-w-[150px]">
                        {row.event_name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${row.status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                          }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {formatDate(row.modified_on)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* PAGINATION */}
        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 mb-12 gap-4">
            <div className="flex items-center gap-4">
              <p className="text-slate-500 text-sm font-medium">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries
              </p>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-sm font-medium">Records per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
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

  // ── RENDER FORM ───────────────────────────────────────────────────────────
  const renderForm = () => (
    <div className="min-h-screen bg-[#fafafa] p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setPage("list")}
            className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all text-gray-600"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
            {editId ? "Edit Feedback Details" : "New Feedback Submission"}
          </h2>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="p-10">
            <div className="grid grid-cols-1 gap-10">
              <div className="space-y-6">
                <div>
                  <Select
                    label="Event Reference *"
                    value={eventId}
                    onValueChange={(val) => { setEventId(val); setFormError(""); }}
                    placeholder="Select Target Event"
                    triggerClassName={`w-full bg-gray-50 rounded-2xl h-14 text-sm font-medium ${formError ? "border-red-500 ring-1 ring-red-500" : "border-gray-200"}`}
                  >
                    {events.map((ev) => (
                      <SelectItem key={ev.id} value={String(ev.id)}>{ev.event_name}</SelectItem>
                    ))}
                  </Select>
                  {formError && (
                    <p className="text-red-500 text-xs font-bold mt-2 ml-2 flex items-center gap-1.5 animate-pulse">
                      <AlertCircle size={14} />
                      {formError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600  tracking-widest mb-3 ml-1">Detailed Explanation</label>
                  <textarea
                    className="w-full bg-gray-50 border border-gray-200 rounded-3xl px-8 py-6 h-56 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none font-medium text-gray-700 leading-relaxed"
                    placeholder="Tell us about your experience..."
                    value={explanation}
                    onChange={e => setExplanation(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end items-center gap-4 mt-12 pt-8 border-t border-gray-100">
              {editId && (
                <button
                  onClick={() => openDeleteModal(editId)}
                  className="flex items-center gap-2 px-6 py-4 text-red-600 font-bold hover:bg-red-50 rounded-2xl transition-all mr-auto"
                >
                  <Trash2 size={20} />
                  Delete Entry
                </button>
              )}
              <button
                onClick={() => setPage("list")}
                className="px-8 py-4 rounded-2xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-12 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 active:scale-95 transition-all shadow-2xl shadow-blue-200 tracking-wide flex items-center gap-3 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  editId ? "Update Feedback" : "Submit Feedback"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {page === "list" ? renderList() : renderForm()}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-[100] flex items-center gap-4 px-8 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 duration-300 ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
          }`}>
          <div className="bg-white/20 p-1.5 rounded-lg">
            {toast.type === "success" ? <Edit size={20} /> : <AlertCircle size={20} />}
          </div>
          <span className="font-bold tracking-tight">{toast.msg}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <Trash2 size={32} className="text-red-600" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Delete Feedback?</h3>
            <p className="text-sm text-slate-500 mb-8 font-medium">
              Are you sure you want to delete this feedback? This action cannot be undone.
            </p>
            <div className="flex w-full gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-3.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}