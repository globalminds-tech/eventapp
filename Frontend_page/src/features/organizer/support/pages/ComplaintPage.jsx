import React, { useState, useEffect } from "react";
import { getComplaints, getApprovedEvents, createComplaint, deleteComplaint } from "@/Services/api";
import { Select, SelectItem } from "@/components/ui/Select";
import {
  Trash2,
  Plus,
  Search,
  ArrowLeft,
  Star,
  AlertCircle,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

function StarRating({ rating, setRating }) {
  return (
    <div className="flex gap-1 cursor-pointer">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={22}
          onClick={() => setRating(star)}
          className={`transition-colors ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

function Toast({ isOpen, type, message, onClose }) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isSuccess = type === "success";

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
      <div className="fixed top-6 right-6 z-[9999] animate-slideIn">
        <div className={`flex items-center gap-4 px-6 py-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border-l-4 transform transition-all ${isSuccess ? "bg-white border-green-500 text-green-800" : "bg-white border-red-500 text-red-800"
          }`}>
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isSuccess ? "bg-green-50" : "bg-red-50"
            }`}>
            {isSuccess ? (
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <AlertCircle className="w-6 h-6 text-red-500" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900">{isSuccess ? "Success" : "Notification"}</p>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

export default function ComplaintPage() {
  const [showForm, setShowForm] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [viewingComplaint, setViewingComplaint] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [event, setEvent] = useState("");
  const [explanation, setExplanation] = useState("");
  const [errors, setErrors] = useState({});

  const [ratings, setRatings] = useState({
    infrastructure: 0,
    amenities: 0,
    experience: 0,
    venue: 0,
    transport: 0,
    convenience: 0
  });

  const [toast, setToast] = useState({ isOpen: false, type: "", message: "" });

  const showToast = (type, message) => {
    setToast({ isOpen: true, type, message });
  };

  const closeToast = () => {
    setToast({ ...toast, isOpen: false });
  };

  useEffect(() => {
    loadComplaints();
    loadEvents();
  }, []);

  const loadComplaints = async () => {
    try {
      const data = await getComplaints();
      setComplaints(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadEvents = async () => {
    try {
      const data = await getApprovedEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await deleteComplaint(deletingId);
      if (res.success) {
        showToast("success", "Complaint deleted successfully");
        loadComplaints();
      } else {
        showToast("error", "Failed to delete");
      }
    } catch (err) {
      showToast("error", "Error deleting complaint");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDelete = (id) => {
    setDeletingId(id);
  };

  const submitComplaint = async () => {
    let newErrors = {};
    if (!event) newErrors.event = "Please select an event";
    if (!explanation.trim()) newErrors.explanation = "Please provide an explanation";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      const payload = {
        event_id: event,
        explanation: explanation,
        infrastructure_rating: ratings.infrastructure,
        amenities_rating: ratings.amenities,
        overall_experience_rating: ratings.experience,
        venue_locations_rating: ratings.venue,
        transportation_rating: ratings.transport,
        convenience_rating: ratings.convenience
      };

      const res = await createComplaint(payload);

      if (res.success) {
        showToast("success", "Complaint submitted successfully");
        setShowForm(false);
        loadComplaints();
        resetForm();
      } else {
        showToast("error", "Failed: " + (res.error || "Unknown error"));
      }
    } catch (err) {
      showToast("error", "Failed to submit complaint");
    }
  };

  const resetForm = () => {
    setEvent("");
    setExplanation("");
    setErrors({});
    setRatings({
      infrastructure: 0,
      amenities: 0,
      experience: 0,
      venue: 0,
      transport: 0,
      convenience: 0
    });
  };

  const filteredComplaints = complaints.filter(c =>
    c.complaint_code.toLowerCase().includes(search.toLowerCase()) ||
    c.event_name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const currentComplaints = filteredComplaints.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  if (showForm) {
    return (
      <div className="min-h-screen bg-[#fafafa] p-8 font-sans">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setShowForm(false)}
              className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all text-gray-600"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
              New Support Complaint
            </h2>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Left Column: Event & Explanation */}
                <div className="space-y-8">
                  <div>
                    <Select
                      label="Event Reference *"
                      value={event}
                      onValueChange={(val) => { setEvent(val); setErrors(prev => ({ ...prev, event: "" })); }}
                      placeholder="Select Target Event"
                      triggerClassName={`w-full bg-gray-50 rounded-2xl h-14 text-sm font-medium ${errors.event ? "border-red-500 ring-1 ring-red-500" : "border-gray-200"}`}
                    >
                      {events.map((e) => (
                        <SelectItem key={e.id} value={String(e.id)}>{e.event_name}</SelectItem>
                      ))}
                    </Select>
                    {errors.event && (
                      <p className="text-red-500 text-xs font-bold mt-2 ml-2 flex items-center gap-1.5 animate-pulse">
                        <AlertCircle size={14} />
                        {errors.event}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-600  tracking-widest mb-3 ml-1">
                      Detailed Explanation <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className={`w-full bg-gray-50 border ${errors.explanation ? "border-red-500 ring-1 ring-red-500" : "border-gray-200"} rounded-3xl px-8 py-6 h-56 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none font-medium text-gray-700 leading-relaxed`}
                      placeholder="Describe your issue in detail..."
                      value={explanation}
                      onChange={(e) => { setExplanation(e.target.value); setErrors(prev => ({ ...prev, explanation: "" })); }}
                    />
                    {errors.explanation && (
                      <p className="text-red-500 text-xs font-bold mt-2 ml-2 flex items-center gap-1.5 animate-pulse">
                        <AlertCircle size={14} />
                        {errors.explanation}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column: Ratings */}
                <div className="bg-blue-50/30 rounded-3xl p-8 border border-blue-50">
                  <h3 className="text-sm font-black text-sky-600  tracking-widest mb-8 text-center">
                    Service Ratings
                  </h3>
                  <div className="space-y-4">
                    {Object.keys(ratings).map((key) => (
                      <div key={key} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-sky-100 shadow-sm transition-all hover:shadow-md">
                        <span className="text-sm font-bold text-slate-600 capitalize">
                          {key}
                        </span>
                        <StarRating
                          rating={ratings[key]}
                          setRating={(val) => setRatings(prev => ({ ...prev, [key]: val }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-4 mt-12 pt-8 border-t border-gray-100">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-8 py-4 rounded-2xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={submitComplaint}
                  className="px-12 py-4 rounded-2xl bg-sky-600 text-white font-black hover:bg-sky-700 active:scale-95 transition-all shadow-2xl shadow-sky-200 tracking-wide flex items-center gap-3"
                >
                  Submit Complaint
                </button>
              </div>
            </div>
          </div>
        </div>

        <Toast isOpen={toast.isOpen} type={toast.type} message={toast.message} onClose={closeToast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-sky-900 tracking-tight">
              Complaint Management
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
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
                className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-sky-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-50 transition-all shadow-sm"
              />
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 rounded-xl flex gap-2 items-center justify-center font-bold shadow-lg shadow-sky-200 transition-all hover:scale-105 active:scale-95 text-sm"
            >
              <Plus size={18} />
              Raise Complaint
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-sky-600 text-white">
                  <th className="px-6 py-4 text-center text-xs font-bold text-white  tracking-wider">Actions</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white  tracking-wider">Complaint Code</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white  tracking-wider">Event Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white  tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white  tracking-wider">Created On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentComplaints.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                          <Search size={28} className="text-gray-300" />
                        </div>
                        <p className="text-xl font-bold text-gray-400">No complaints found</p>
                        <p className="text-gray-400 font-medium">Try a different search term or raise a new complaint</p>
                      </div>
                    </td>
                  </tr>
                ) : currentComplaints.map(row => (
                  <tr key={row.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setViewingComplaint(row)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-sm">
                        {row.complaint_code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-700 truncate max-w-[200px]">
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
                      {row.created_on}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* PAGINATION */}
        {filteredComplaints.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 mb-12 gap-4">
            <div className="flex items-center gap-4">
              <p className="text-slate-500 text-sm font-medium">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredComplaints.length)} of {filteredComplaints.length} entries
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

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Complaint?</h3>
              <p className="text-gray-500 font-medium">This action cannot be undone. Are you sure you want to remove this record?</p>
            </div>

            <div className="flex border-t border-gray-100">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 px-6 py-4 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-4 bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast isOpen={toast.isOpen} type={toast.type} message={toast.message} onClose={closeToast} />

      {/* View Modal */}
      {viewingComplaint && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Complaint Details</h3>
                <p className="text-sm text-blue-600 font-mono mt-1">{viewingComplaint.complaint_code}</p>
              </div>
              <button
                onClick={() => setViewingComplaint(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <XCircle size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Event Name</label>
                    <p className="text-lg font-bold text-gray-900">{viewingComplaint.event_name}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Explanation</label>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-gray-700 leading-relaxed italic">
                      "{viewingComplaint.explanation}"
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                  <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4">Ratings Received</h4>
                  <div className="space-y-4">
                    {[
                      { label: 'Infrastructure', val: viewingComplaint.infrastructure_rating },
                      { label: 'Amenities', val: viewingComplaint.amenities_rating },
                      { label: 'Experience', val: viewingComplaint.overall_experience_rating },
                      { label: 'Venue', val: viewingComplaint.venue_locations_rating },
                      { label: 'Transport', val: viewingComplaint.transportation_rating },
                      { label: 'Convenience', val: viewingComplaint.convenience_rating },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-600">{item.label}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              className={`${star <= item.val ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setViewingComplaint(null)}
                className="px-8 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        .animate-scale-up { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}

