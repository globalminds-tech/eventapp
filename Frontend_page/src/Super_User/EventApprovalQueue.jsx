import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, Eye, Check, X, Clock, FileText, Calendar, Filter, RefreshCw, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { getAllEvents, updateEventStatus } from "@/Services/api";

export default function EventApprovalQueue() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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
      const res = await getAllEvents();
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
      await updateEventStatus(eventId, newStatus);
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
      
      {/* ── CLEAN EXECUTIVE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/70 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Event Management & Approvals Queue
            </h1>
            <Badge className="bg-purple-600 text-white font-extrabold text-[11px] px-2.5 py-0.5 border-none shadow-md shadow-purple-500/20">
              Governance Hub
            </Badge>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Review event listings across all stages: audit guidelines, venue compliance, and live publish status.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchEvents}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:border-slate-300 transition shadow-2xs cursor-pointer self-start sm:self-auto shrink-0"
        >
          <RefreshCw size={13} className={loading ? "animate-spin text-purple-600" : "text-slate-500"} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {toast && (
        <div className={`p-3.5 rounded-xl text-xs font-extrabold flex items-center justify-between shadow-lg text-white ${
          toast.type === "error" ? "bg-red-600" : "bg-gradient-to-r from-purple-600 to-indigo-600"
        }`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="border-none bg-transparent text-white font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* ── CARD CONTAINER WITH NON-SCROLLABLE FLEX-WRAP TABS & SEARCH ROWS ── */}
      <Card className="border-slate-200/80 shadow-sm bg-white rounded-2xl p-5 space-y-4">
        
        {/* ── ROW 1: NON-SCROLLABLE FLEX-WRAP STATUS FILTER TABS ── */}
        <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-slate-100">
          {tabList.map((t) => {
            const count = events.filter((e) => checkMatchesTab(e.status, t.key)).length;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setActiveTab(t.key);
                  setSearchParams({ tab: t.key.toLowerCase() });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border-none cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-slate-100/90 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                }`}
              >
                <span>{t.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? "bg-purple-700 text-white" : "bg-slate-200 text-slate-700"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── ROW 2: SEPARATE SEARCH ROW BELOW ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by event title, code, category, or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="text-[11px] font-bold text-slate-500 self-start sm:self-auto">
            Showing <span className="text-slate-900 font-extrabold">{filteredEvents.length}</span> of {events.length} events
          </div>
        </div>

        {/* ── ROW 3: EVENTS DATA TABLE WITH SKELETON LOADING ── */}
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Event Code</th>
                <th className="py-3 px-4">Event Title & Category</th>
                <th className="py-3 px-4">Date & Venue</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-24 rounded-md" /></td>
                    <td className="py-3.5 px-4 space-y-1.5">
                      <Skeleton className="h-4 w-48 rounded-md" />
                      <Skeleton className="h-3 w-28 rounded-md" />
                    </td>
                    <td className="py-3.5 px-4 space-y-1.5">
                      <Skeleton className="h-4 w-32 rounded-md" />
                      <Skeleton className="h-3 w-24 rounded-md" />
                    </td>
                    <td className="py-3.5 px-4 text-center"><Skeleton className="h-5 w-20 rounded-full mx-auto" /></td>
                    <td className="py-3.5 px-4 text-right"><Skeleton className="h-7 w-24 rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No events found for tab "<span className="font-bold">{activeTab}</span>".
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => {
                  const st = (evt.status || "ACTIVE").toUpperCase();
                  const eventCode = evt.event_code || evt.code || evt.id;
                  return (
                    <tr key={evt.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-mono font-bold text-purple-700">
                        {evt.event_code || evt.code || `EVT-${evt.id}`}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{evt.event_name || evt.name || "Untitled Event"}</div>
                        <div className="text-[11px] text-slate-400 font-medium">{evt.category || "General"} {evt.sub_category ? `• ${evt.sub_category}` : ""}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{evt.start_date || evt.date || "TBD"}</div>
                        <div className="text-[11px] text-slate-400">{evt.venue || "Venue Setup"}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                          ["ACTIVE", "LIVE", "APPROVED"].includes(st)
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : ["PENDING", "SUBMITTED"].includes(st)
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                          {st}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => navigate(`/superuser/event/${eventCode}`)}
                          className="px-2.5 py-1 text-[11px] font-bold border-slate-200 hover:bg-purple-50 hover:text-purple-700"
                        >
                          <Eye size={12} className="mr-1" /> Inspect Event
                        </Button>
                        {["PENDING", "DRAFT", "SUBMITTED"].includes(st) && (
                          <>
                            <Button
                              size="xs"
                              onClick={() => handleStatusUpdate(evt.id, "Approved")}
                              className="px-2.5 py-1 text-[11px] font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <Check size={12} className="mr-1" /> Approve
                            </Button>
                            <Button
                              size="xs"
                              variant="destructive"
                              onClick={() => handleStatusUpdate(evt.id, "Rejected")}
                              className="px-2.5 py-1 text-[11px] font-extrabold"
                            >
                              <X size={12} className="mr-1" /> Reject
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
