import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, Eye, Check, X, Clock, FileText, Calendar, Filter, RefreshCw, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { approvalApi } from "../api/approval.api";

export default function EventApprovalQueuePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") || "all").toUpperCase();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(initialTab);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const queryTab = (searchParams.get("tab") || "all").toUpperCase();
    setActiveTab(queryTab);
  }, [searchParams]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await approvalApi.getEvents();
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setEvents(list);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleStatusUpdate = async (eventId, newStatus) => {
    try {
      await approvalApi.updateEventStatus(eventId, newStatus);
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, status: newStatus } : e))
      );
      showNotification(`Event marked as ${newStatus}!`, "success");
    } catch (err) {
      showNotification("Failed to update event status", "error");
    }
  };

  const checkMatchesTab = (eventStatus, tab) => {
    const st = (eventStatus || "").toUpperCase();
    if (tab === "ALL") return true;
    if (tab === "LIVE") return ["LIVE", "ACTIVE"].includes(st);
    if (tab === "UPCOMING") return ["UPCOMING", "APPROVED", "PUBLISHED"].includes(st);
    if (tab === "COMPLETED") return ["COMPLETED", "PAST"].includes(st);
    if (tab === "PENDING") return ["PENDING", "PENDING APPROVAL", "SUBMITTED", "DRAFT"].includes(st);
    if (tab === "APPROVED") return ["APPROVED", "ACTIVE", "LIVE", "PUBLISHED"].includes(st);
    if (tab === "REJECTED") return ["REJECTED"].includes(st);
    if (tab === "SUSPENDED") return ["SUSPENDED"].includes(st);
    return true;
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch = searchQuery
      ? (e.event_name || e.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.event_code || e.code || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.venue || "").toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesSearch && checkMatchesTab(e.status, activeTab);
  });

  const tabList = [
    { key: "ALL", label: "All Events" },
    { key: "LIVE", label: "Live Events" },
    { key: "UPCOMING", label: "Upcoming" },
    { key: "COMPLETED", label: "Completed" },
    { key: "PENDING", label: "Pending Approval" },
    { key: "APPROVED", label: "Approved" },
    { key: "REJECTED", label: "Rejected" },
    { key: "SUSPENDED", label: "Suspended" },
  ];

  return (
    <div className="space-y-5 pb-12 select-none text-slate-800 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/70 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Event Approvals & Audit Queue
            </h1>
            <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-[11px] px-2.5 py-0.5 border-none shadow-md shadow-purple-500/20">
              Super Admin Verification
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Review event proposals, perform 360° compliance inspection, and publish to live platform.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={fetchEvents} variant="outline" className="text-xs font-bold gap-1.5 rounded-xl cursor-pointer">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {toast && (
        <div className="p-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-between shadow-lg">
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="border-none bg-transparent text-white font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* ── FILTER TABS BAR ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {tabList.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border-none whitespace-nowrap ${
                activeTab === t.key
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-500/30"
                  : "bg-transparent text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Filter by name, code, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* ── EVENTS DATA TABLE ── */}
      <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="p-3.5 pl-5">Event Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Venue / City</th>
                <th className="p-3.5">Dates</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredEvents.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 pl-5">
                    <div className="font-extrabold text-slate-900 text-sm">{ev.event_name || ev.name || "Untitled Event"}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Code: {ev.event_code || ev.code || `EVT-${ev.id}`}</div>
                  </td>
                  <td className="p-3.5">
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-bold text-[10px]">
                      {ev.category || "General"}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-slate-600 font-semibold">{ev.venue || ev.city || "Chennai, TN"}</td>
                  <td className="p-3.5 text-slate-500 text-[11px] font-semibold">{ev.start_date || "Oct 24, 2026"}</td>
                  <td className="p-3.5 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                      ["APPROVED", "LIVE", "ACTIVE"].includes((ev.status || "").toUpperCase())
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : ["REJECTED"].includes((ev.status || "").toUpperCase())
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {(ev.status || "PENDING").toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3.5 pr-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => navigate(`/superuser/inspection/${ev.id}`)}
                        className="text-[11px] font-bold gap-1 cursor-pointer"
                      >
                        <Eye size={12} /> Inspect
                      </Button>
                      <Button
                        size="xs"
                        onClick={() => handleStatusUpdate(ev.id, "APPROVED")}
                        className="bg-emerald-600 text-white font-bold text-[11px] cursor-pointer border-none"
                      >
                        <Check size={12} /> Approve
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleStatusUpdate(ev.id, "REJECTED")}
                        className="text-red-600 border-red-200 font-bold text-[11px] cursor-pointer"
                      >
                        <X size={12} /> Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredEvents.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold text-xs">
                    No events found in this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
