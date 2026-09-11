import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Filter,
  Check,
  Building2,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { categoryApi } from "@/features/catalog/api/category.api";

export default function CategoryRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [processingId, setProcessingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await categoryApi.getCategoryRequests();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setRequests(list);
    } catch (err) {
      console.warn("Failed to fetch category requests:", err);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleApprove = async (requestId) => {
    setProcessingId(requestId);
    try {
      await categoryApi.updateCategoryRequestStatus(requestId, { status: "Approved" });
      showNotification("Category request approved! Category has been added to master list.", "success");
      fetchRequests();
    } catch (err) {
      showNotification("Failed to approve category request", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    setProcessingId(requestId);
    try {
      await categoryApi.updateCategoryRequestStatus(requestId, { status: "Rejected" });
      showNotification("Category request has been rejected.", "success");
      fetchRequests();
    } catch (err) {
      showNotification("Failed to reject category request", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-extrabold text-[10px]">
            <CheckCircle2 size={11} />
            APPROVED
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-extrabold text-[10px]">
            <XCircle size={11} />
            REJECTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-extrabold text-[10px]">
            <Clock size={11} className="animate-pulse" />
            PENDING
          </span>
        );
    }
  };

  // Filtered requests
  const filteredRequests = requests.filter((r) => {
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesStatus;

    const matchesSearch =
      (r.organizer_name || "").toLowerCase().includes(query) ||
      (r.category_name || "").toLowerCase().includes(query) ||
      (r.subcategory_name || "").toLowerCase().includes(query) ||
      (r.reason || "").toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const approvedCount = requests.filter((r) => r.status === "Approved").length;
  const rejectedCount = requests.filter((r) => r.status === "Rejected").length;

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      {/* ── TOP BREADCRUMB & BACK NAVIGATION ── */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/superuser/categories")}
          className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 hover:text-purple-700 bg-white hover:bg-purple-50 px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Category Master</span>
        </button>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchRequests}
          disabled={isLoading}
          className="h-8 text-xs font-bold gap-1.5 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin text-purple-600" : "text-slate-500"} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0">
            <MessageSquare size={22} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Organizer Category Requests
              </h1>
              {pendingCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 bg-amber-500 text-white text-[11px] font-black rounded-full shadow-xs animate-pulse">
                  {pendingCount} Pending
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
              Review, approve, or reject new category and subcategory proposals submitted by event organizers.
            </p>
          </div>
        </div>
      </div>

      {/* ── METRIC CARDS STRIP ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setStatusFilter("All")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "All"
              ? "bg-purple-50/80 border-purple-300 ring-2 ring-purple-400/20 shadow-xs"
              : "bg-white border-slate-200/80 hover:border-slate-300"
          }`}
        >
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Total Requests</p>
          <p className="text-xl font-black text-slate-900 mt-1">{totalCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter("Pending")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "Pending"
              ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20 shadow-xs"
              : "bg-white border-slate-200/80 hover:border-slate-300"
          }`}
        >
          <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wide flex items-center gap-1.5">
            <Clock size={12} /> Pending Review
          </p>
          <p className="text-xl font-black text-amber-700 mt-1">{pendingCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter("Approved")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "Approved"
              ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400/20 shadow-xs"
              : "bg-white border-slate-200/80 hover:border-slate-300"
          }`}
        >
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide flex items-center gap-1.5">
            <CheckCircle2 size={12} /> Approved
          </p>
          <p className="text-xl font-black text-emerald-700 mt-1">{approvedCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter("Rejected")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "Rejected"
              ? "bg-rose-50/80 border-rose-300 ring-2 ring-rose-400/20 shadow-xs"
              : "bg-white border-slate-200/80 hover:border-slate-300"
          }`}
        >
          <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wide flex items-center gap-1.5">
            <XCircle size={12} /> Rejected
          </p>
          <p className="text-xl font-black text-rose-700 mt-1">{rejectedCount}</p>
        </div>
      </div>

      {/* ── TOAST NOTIFICATION ── */}
      {toast && (
        <div
          className={`p-3.5 rounded-xl text-xs font-extrabold flex items-center justify-between shadow-lg animate-fadeIn ${
            toast.type === "error"
              ? "bg-gradient-to-r from-rose-600 to-red-600 text-white"
              : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
          }`}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="border-none bg-transparent text-white font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by organizer, category, subcategory, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 pr-8 text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          </div>

          <div className="flex items-center gap-1.5">
            {["All", "Pending", "Approved", "Rejected"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  statusFilter === status
                    ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* ── TABLE VIEW ── */}
        <div className="responsive-table-wrap border border-slate-200/70 rounded-xl overflow-hidden">
          <table className="w-full min-w-[750px] text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/90 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="p-3.5 pl-5">Organizer</th>
                <th className="p-3.5">Requested Category</th>
                <th className="p-3.5">Subcategory</th>
                <th className="p-3.5">Reason / Justification</th>
                <th className="p-3.5">Submitted Date</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400 font-semibold text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={20} className="animate-spin text-purple-600" />
                      <span>Loading organizer requests...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 font-semibold text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                        <MessageSquare size={20} />
                      </div>
                      <p className="text-slate-700 font-bold">No requests found</p>
                      <p className="text-slate-400 text-[11px]">
                        {searchQuery || statusFilter !== "All"
                          ? "Try adjusting your search query or filter."
                          : "No organizer category requests have been submitted yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-extrabold flex items-center justify-center text-xs">
                          {(req.organizer_name || "O").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block leading-tight">
                            {req.organizer_name || "Organizer"}
                          </span>
                          <span className="text-[10px] text-slate-400">ID #{req.organizer_id || req.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 bg-purple-50 text-purple-800 border border-purple-200/80 rounded-lg font-bold text-xs inline-block">
                        {req.category_name}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {req.subcategory_name ? (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-[11px] font-semibold">
                          {req.subcategory_name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-600 max-w-[240px]">
                      <span className="line-clamp-2 text-[11px] leading-relaxed" title={req.reason}>
                        {req.reason || "—"}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500 text-[11px] font-semibold whitespace-nowrap">
                      {req.created_at
                        ? new Date(req.created_at).toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="p-3.5 text-center">{getStatusBadge(req.status)}</td>
                    <td className="p-3.5 pr-5 text-right">
                      {req.status === "Pending" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleApprove(req.id)}
                            disabled={processingId === req.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Approve & Add to Category Master"
                          >
                            <CheckCircle2 size={13} />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(req.id)}
                            disabled={processingId === req.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Reject Request"
                          >
                            <XCircle size={13} />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-semibold italic">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
