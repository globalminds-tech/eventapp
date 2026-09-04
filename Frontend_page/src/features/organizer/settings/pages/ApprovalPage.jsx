import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  getEventshow,
  getBookingsByEvent,
  getapprovalBookingById,
  updateBookingStatus,
} from "@/Services/api";
import {
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Search,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ClipboardList,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

const AdminApproval = () => {
  const [items, setItems] = useState([]); // Can be events or bookings
  const [viewMode, setViewMode] = useState("events"); // 'events' or 'bookings'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Status Dropdown State
  const [openStatusId, setOpenStatusId] = useState(null);

  const Redexorganizer = useSelector((state) => state.user);
  const storedUser = {
    id: sessionStorage.getItem("userId"),
    name: sessionStorage.getItem("userName"),
  };
  const organizer = Redexorganizer?.id ? Redexorganizer : storedUser;

  useEffect(() => {
    if (viewMode === "events") {
      fetchEvents();
    }
  }, [viewMode, organizer?.id]);

  const fetchEvents = async () => {
    if (!organizer?.id) return;
    try {
      setLoading(true);
      const data = await getEventshow(organizer.id);
      setItems(data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleViewRequestedStalls = async (event) => {
    try {
      setLoading(true);
      const data = await getBookingsByEvent(event.id);
      setSelectedEvent(event);
      setItems(data || []);
      setViewMode("bookings");
      setSearch("");
      setCurrentPage(1);
      setOpenMenuId(null);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Failed to fetch requested stalls");
    }
  };

  const handleBackToEvents = () => {
    setViewMode("events");
    setSelectedEvent(null);
    setSearch("");
    setCurrentPage(1);
  };

  const handleViewBooking = async (id) => {
    try {
      setLoading(true);
      const data = await getapprovalBookingById(id);
      setSelectedBooking(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Failed to fetch details");
    }
  };

  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const handleStatusChange = (id, newStatus) => {
    setPendingUpdate({ id, newStatus });
    setShowConfirmModal(true);
  };

  const confirmStatusUpdate = async () => {
    if (!pendingUpdate) return;
    const { id, newStatus } = pendingUpdate;
    try {
      setIsUpdating(true);
      await updateBookingStatus(id, newStatus);

      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );

      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }

      showNotification(`Status updated to ${newStatus} successfully!`, "success");
      setShowConfirmModal(false);
      setPendingUpdate(null);
    } catch (err) {
      console.error(err);
      showNotification("Status update failed", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
      case "rejected":
        return "bg-red-100 text-red-700 border border-red-200";
      case "pending":
        return "bg-amber-100 text-amber-700 border border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const getStatusSelectColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "text-emerald-700 border-emerald-300 focus:border-emerald-500 focus:ring-emerald-200";
      case "rejected":
        return "text-red-700 border-red-300 focus:border-red-500 focus:ring-red-200";
      case "pending":
        return "text-amber-700 border-amber-300 focus:border-amber-500 focus:ring-amber-200";
      default:
        return "text-gray-700 border-gray-300 focus:border-gray-500 focus:ring-gray-200";
    }
  };

  const filteredItems = items.filter((item) => {
    const searchLower = search.toLowerCase();
    if (viewMode === "events") {
      return (item.event_name || "").toLowerCase().includes(searchLower) ||
        (item.venue || "").toLowerCase().includes(searchLower);
    } else {
      const fullName = `${item.first_name || ""} ${item.last_name || ""}`.toLowerCase();
      return fullName.includes(searchLower) ||
        (item.mobile || "").toLowerCase().includes(searchLower) ||
        (item.company_name || "").toLowerCase().includes(searchLower);
    }
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`fixed top-10 right-10 z-[250] px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-10 duration-500 flex items-center gap-4 border ${toast.type === "success"
          ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-200"
          : "bg-rose-600 text-white border-rose-500 shadow-rose-200"
          }`}>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
            {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          </div>
          <p className="font-bold text-sm tracking-wide">{toast.message}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {viewMode === "bookings" && (
            <button
              onClick={handleBackToEvents}
              className="p-2 hover:bg-white rounded-xl transition-all text-gray-600 shadow-sm border border-transparent hover:border-gray-200"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <h1 className="text-3xl font-bold text-gray-800">
            {viewMode === "events" ? "Select Event for Approval" : `Bookings for ${selectedEvent?.event_name}`}
          </h1>
        </div>
        <div className="bg-sky-50 px-4 py-2 rounded-lg border border-sky-100">
          <p className="text-sm font-medium text-sky-900">
            Total {viewMode === "events" ? "Events" : "Bookings"}: <span className="font-bold text-lg">{filteredItems.length}</span>
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-96">
            <input
              type="text"
              placeholder={`Search ${viewMode === "events" ? "Events" : "Bookings"}...`}
              className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-sky-500 transition-all border-gray-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {!loading && filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <ClipboardList className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 text-base font-bold">No {viewMode} found</p>
            <p className="text-slate-400 text-xs mt-1">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100">
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-3.5 text-center font-semibold tracking-wider">Actions</th>
                    {viewMode === "events" ? (
                      <>
                        <th className="px-6 py-3.5 text-left font-semibold tracking-wider">Event Name</th>
                        <th className="px-6 py-3.5 text-left font-semibold tracking-wider">Start Date</th>
                        <th className="px-6 py-3.5 text-left font-semibold tracking-wider">Time</th>
                        <th className="px-6 py-3.5 text-left font-semibold tracking-wider">Place</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-3.5 text-left font-semibold tracking-wider">Name</th>
                        <th className="px-6 py-3.5 text-left font-semibold tracking-wider">Mobile Number</th>
                        <th className="px-6 py-3.5 text-left font-semibold tracking-wider">Company</th>
                        <th className="px-6 py-3.5 text-center font-semibold tracking-wider">Status</th>
                      </>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-50 text-xs">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="px-4 py-3.5 text-center">
                          <Skeleton className="h-8 w-8 rounded-lg mx-auto" />
                        </td>
                        <td className="px-6 py-3.5">
                          <Skeleton className="h-4 w-36 rounded" />
                        </td>
                        <td className="px-6 py-3.5">
                          <Skeleton className="h-4 w-24 rounded" />
                        </td>
                        <td className="px-6 py-3.5">
                          <Skeleton className="h-4 w-20 rounded" />
                        </td>
                        <td className="px-6 py-3.5">
                          <Skeleton className="h-4 w-28 rounded" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    currentItems.map((item) => (
                    <tr key={item.id} className="hover:bg-sky-50/50 transition-colors duration-200 group">
                      <td className="px-4 py-4 text-center relative">
                        {viewMode === "events" ? (
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleViewRequestedStalls(item)}
                              className="w-9 h-9 flex items-center justify-center mx-auto rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white transition-all duration-200 shadow-sm"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleViewBooking(item.id)}
                            className="w-9 h-9 flex items-center justify-center mx-auto rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white transition-all duration-200 shadow-sm"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                      </td>

                      {viewMode === "events" ? (
                        <>
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                              {item.event_name}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                              <Calendar size={14} className="text-sky-500" />
                              {item.start_date}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                              <Clock size={14} className="text-sky-500" />
                              {item.start_time}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                              <MapPin size={14} className="text-sky-500" />
                              {item.venue}
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 font-bold text-slate-900">
                            {item.first_name} {item.last_name}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-600">
                            {item.mobile}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-600">
                            {item.company_name}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="relative flex justify-center">
                              <button
                                onClick={() => setOpenStatusId(openStatusId === item.id ? null : item.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 border shadow-sm ${item.status?.toLowerCase() === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    item.status?.toLowerCase() === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                      'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}
                              >
                                <span className={`w-2 h-2 rounded-full ${item.status?.toLowerCase() === 'approved' ? 'bg-emerald-500' :
                                    item.status?.toLowerCase() === 'rejected' ? 'bg-rose-500' :
                                      'bg-amber-500'
                                  } animate-pulse`}></span>
                                {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
                                <ChevronDown size={14} className={`transition-transform duration-300 ${openStatusId === item.id ? 'rotate-180' : ''}`} />
                              </button>

                              {openStatusId === item.id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setOpenStatusId(null)}
                                  ></div>
                                  <div className="absolute top-full mt-2 right-0 w-40 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-2 animate-in fade-in zoom-in slide-in-from-top-2 duration-200">
                                    {[
                                      { value: 'pending', label: 'Pending', color: 'text-amber-600', hover: 'hover:bg-amber-50', icon: <Clock size={14} /> },
                                      { value: 'approved', label: 'Approved', color: 'text-emerald-600', hover: 'hover:bg-emerald-50', icon: <CheckCircle size={14} /> },
                                      { value: 'rejected', label: 'Rejected', color: 'text-rose-600', hover: 'hover:bg-rose-50', icon: <X size={14} /> }
                                    ].map((opt) => (
                                      <button
                                        key={opt.value}
                                        onClick={() => {
                                          handleStatusChange(item.id, opt.value);
                                          setOpenStatusId(null);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors ${opt.color} ${opt.hover}`}
                                      >
                                        {opt.icon}
                                        {opt.label}
                                      </button>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredItems.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 mb-12 gap-4 px-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <div className="flex items-center gap-6">
            <p className="text-slate-500 text-sm font-medium">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length} {viewMode}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-sm font-medium">Per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer shadow-sm"
              >
                {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
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

      {/* Modal Overlay */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6 py-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto transform transition-all animate-in zoom-in slide-in-from-bottom-8 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-slate-900">
                Booking Details
              </h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-900"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="w-10 h-10 border-4 border-sky-100 border-t-sky-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium animate-pulse">Fetching information...</p>
              </div>
            ) : (
              <div className="px-8 py-6 space-y-8">
                {/* Personal Information Section */}
                <div>
                  <h3 className="text-xs font-bold text-sky-600  tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 bg-sky-600 rounded-full"></div>
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1  tracking-tighter">Full Name</label>
                      <p className="text-slate-900 font-bold text-lg">{selectedBooking.first_name} {selectedBooking.last_name}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1  tracking-tighter">Email Address</label>
                      <p className="text-slate-900 font-medium text-sm break-all">{selectedBooking.email}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1  tracking-tighter">Mobile Number</label>
                      <p className="text-slate-900 font-bold font-mono">{selectedBooking.mobile}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1  tracking-tighter">Designation</label>
                      <p className="text-slate-900 font-medium">{selectedBooking.designation}</p>
                    </div>
                  </div>
                </div>

                {/* Company Information Section */}
                <div className="border-t border-slate-100 pt-8">
                  <h3 className="text-xs font-bold text-sky-600  tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 bg-sky-600 rounded-full"></div>
                    Company Information
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1  tracking-tighter">Company Name</label>
                      <p className="text-slate-900 font-bold">{selectedBooking.company_name}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1  tracking-tighter">Product Category</label>
                      <p className="text-slate-900 font-medium">{selectedBooking.products}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-400 mb-1  tracking-tighter">Event Applied For</label>
                      <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
                        <p className="text-sky-900 font-bold text-sm flex items-center gap-2">
                          <Calendar size={14} />
                          {selectedBooking.eventName}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Information Section */}
                <div className="border-t border-slate-100 pt-8">
                  <h3 className="text-xs font-bold text-sky-600  tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 bg-sky-600 rounded-full"></div>
                    Address Details
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1  tracking-tighter">Country</label>
                      <p className="text-slate-900 font-medium">{selectedBooking.country}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1  tracking-tighter">State / Region</label>
                      <p className="text-slate-900 font-medium">{selectedBooking.state}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1  tracking-tighter">City</label>
                      <p className="text-slate-900 font-medium">{selectedBooking.city}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1  tracking-tighter">Pin Code</label>
                      <p className="text-slate-900 font-bold font-mono">{selectedBooking.pin_code}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-400 mb-1  tracking-tighter">Street Address</label>
                      <p className="text-slate-900 font-medium">{selectedBooking.address}</p>
                    </div>
                  </div>
                </div>

                {/* Booking Details Section */}
                <div className="border-t border-slate-100 pt-8">
                  <h3 className="text-xs font-bold text-sky-600  tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 bg-sky-600 rounded-full"></div>
                    Requirements
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-sm font-bold text-slate-500">Stall Area Size</span>
                      <span className="text-lg font-black text-slate-900">{selectedBooking.stall_area}</span>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1  tracking-tighter">Exhibitor Message</label>
                      <p className="text-slate-900 font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100 italic text-sm">
                        "{selectedBooking.messages || "No message provided by exhibitor"}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-8">
                  <h3 className="text-xs font-bold text-sky-600  tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 bg-sky-600 rounded-full"></div>
                    Manage Approval
                  </h3>
                  <div className="flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-100 shadow-sm relative">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400  tracking-widest">Current Status</span>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit ${getStatusBadgeColor(selectedBooking.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${selectedBooking.status?.toLowerCase() === 'approved' ? 'bg-emerald-500' :
                            selectedBooking.status?.toLowerCase() === 'rejected' ? 'bg-rose-500' :
                              'bg-amber-500'
                          }`}></span>
                        {selectedBooking.status}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {[
                        { value: 'pending', label: 'Pending', bg: 'bg-amber-100', text: 'text-amber-700', icon: <Clock size={16} /> },
                        { value: 'approved', label: 'Approve', bg: 'bg-emerald-100', text: 'text-emerald-700', icon: <CheckCircle size={16} /> },
                        { value: 'rejected', label: 'Reject', bg: 'bg-rose-100', text: 'text-rose-700', icon: <X size={16} /> }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleStatusChange(selectedBooking.id, opt.value)}
                          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 hover:scale-105 active:scale-95 ${selectedBooking.status === opt.value
                              ? `${opt.bg} ${opt.text} ring-2 ring-offset-2 ring-slate-100`
                              : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                            }`}
                        >
                          {opt.icon}
                          <span className="hidden sm:inline">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Visiting Card Section */}
                {selectedBooking.visiting_card_url && (
                  <div className="border-t border-slate-100 pt-8">
                    <h3 className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <div className="w-1 h-4 bg-sky-600 rounded-full"></div>
                      Uploaded Visiting Card
                    </h3>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 overflow-hidden shadow-inner group">
                      <img
                        src={selectedBooking.visiting_card_url}
                        alt="visiting card"
                        className="w-full h-auto rounded-xl object-contain max-h-[400px] shadow-sm group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modal Footer */}
            <div className="sticky bottom-0 border-t border-slate-100 bg-white/80 backdrop-blur-md px-8 py-6 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-8 py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl transition-all shadow-xl active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 relative flex flex-col items-center text-center border border-gray-100">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Status Change</h2>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to change the status to <span className="font-bold text-gray-900 uppercase">{pendingUpdate?.newStatus}</span>? This will update the exhibitor's booking status.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingUpdate(null);
                }}
                disabled={isUpdating}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusUpdate}
                disabled={isUpdating}
                className={`flex-1 px-4 py-2.5 text-white font-semibold rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 ${pendingUpdate?.newStatus === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' :
                    pendingUpdate?.newStatus === 'rejected' ? 'bg-rose-600 hover:bg-rose-700' :
                      'bg-amber-600 hover:bg-amber-700'
                  }`}
              >
                {isUpdating ? "Updating..." : "Yes, Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApproval;