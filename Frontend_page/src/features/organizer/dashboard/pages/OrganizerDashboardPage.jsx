import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchEventsThunk } from "@/app/store/eventSlice";
import { eventApi } from "@/features/events/api/event.api";
import {
  Eye, Pencil, Search, PlusCircle, Calendar,
  QrCode, RefreshCw, ShieldCheck, PlayCircle,
  AlertCircle, CheckCircle2, Clock, ArrowUpRight, FileEdit, Store
} from "lucide-react";
import apiClient from "@/Services/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import Can from "@/components/Can";
import { ResponsiveTableView, MobileDataCard } from "@/components/ui/ResponsiveTableView";
import CreateEventButton from "@/components/ui/CreateEventButton";

export default function OrganizerDashboardPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const reduxUser = useSelector((state) => state.user);
  const eventsState = useSelector((state) => state.events?.list);
  const allEvents = Array.isArray(eventsState) ? eventsState : (Array.isArray(eventsState?.data) ? eventsState.data : []);
  const { loading: reduxLoading, loaded } = useSelector((state) => state.events);

  const organizerName = reduxUser.name || sessionStorage.getItem("name") || localStorage.getItem("name") || "Organizer";
  const organizerCompany = reduxUser.organization_name || sessionStorage.getItem("organization_name") || localStorage.getItem("organization_name") || "";
  const organizerKycStatus = reduxUser.kyc_status || reduxUser.organizer_kyc_status || sessionStorage.getItem("kyc_status") || "PENDING";

  const userId = reduxUser.id || sessionStorage.getItem("userId") || sessionStorage.getItem("id") || localStorage.getItem("userId") || localStorage.getItem("id") || "";

  // ── Table-specific state (API-driven) ──
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [tableEvents, setTableEvents] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const hasLoadedOnceRef = useRef(false);
  const latestRequestIdRef = useRef(0);
  const searchTimerRef = useRef(null);

  // ── Stall Applications state ──
  const [stallApplications, setStallApplications] = useState([]);
  const [loadingStalls, setLoadingStalls] = useState(true);

  const fetchStallApplications = useCallback(async () => {
    try {
      setLoadingStalls(true);
      const res = await apiClient.get('/api/v1/organizer/stalls/applications');
      const data = res?.data;
      if (data?.success && Array.isArray(data.data)) {
        setStallApplications(data.data);
      } else if (Array.isArray(data)) {
        setStallApplications(data);
      } else {
        setStallApplications([]);
      }
    } catch (err) {
      console.error("Error fetching stall applications for dashboard:", err);
      setStallApplications([]);
    } finally {
      setLoadingStalls(false);
    }
  }, []);

  useEffect(() => {
    fetchStallApplications();
  }, [fetchStallApplications]);

  // Fetch all events for KPI cards on mount
  useEffect(() => {
    if (userId) {
      dispatch(fetchEventsThunk({ organizerId: userId, force: true }));
    }
  }, [dispatch, userId]);

  // Debounce search input (300ms)
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery]);

  // API-driven table fetch on tab change or debounced search change
  const fetchTableEvents = useCallback(async () => {
    if (!userId) return;
    const currentRequestId = ++latestRequestIdRef.current;
    if (!hasLoadedOnceRef.current) {
      setInitialLoading(true);
    } else {
      setIsFiltering(true);
    }

    try {
      const data = await eventApi.getEventshow(userId, {
        search: debouncedSearch || undefined,
        status: selectedTab,
      });

      // Guard against race conditions from fast tab switching
      if (currentRequestId !== latestRequestIdRef.current) return;

      const arr = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      setTableEvents(arr);
      hasLoadedOnceRef.current = true;
    } catch (err) {
      if (currentRequestId === latestRequestIdRef.current) {
        console.error("[Dashboard] Table fetch error:", err);
        setTableEvents([]);
      }
    } finally {
      if (currentRequestId === latestRequestIdRef.current) {
        setInitialLoading(false);
        setIsFiltering(false);
      }
    }
  }, [userId, selectedTab, debouncedSearch]);

  useEffect(() => {
    fetchTableEvents();
  }, [fetchTableEvents]);

  // ── KPI Calculations (from Redux full events list) ──
  const getEventLifecycle = (e) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sDate = e?.event_date ? new Date(e.event_date) : (e?.start_date ? new Date(e.start_date) : null);
    const eDate = e?.end_date ? new Date(e.end_date) : (sDate ? new Date(sDate) : null);
    if (sDate) sDate.setHours(0, 0, 0, 0);
    if (eDate) eDate.setHours(23, 59, 59, 999);
    const rawSt = (e?.status || e?.approval_status || "").toUpperCase();
    if (rawSt === "DRAFT") return "Draft";
    if (eDate && today > eDate) return "Past";
    if (sDate && today < sDate) return "Upcoming";
    return "Active";
  };

  const totalEventsCount = allEvents.length;
  const activeEventsCount = allEvents.filter(e => getEventLifecycle(e) === "Active").length;
  const upcomingEventsList = allEvents.filter(e => getEventLifecycle(e) === "Upcoming");
  const upcomingEventsCount = upcomingEventsList.length;
  const pastEventsCount = allEvents.filter(e => getEventLifecycle(e) === "Past").length;
  const draftEventsCount = allEvents.filter(e => getEventLifecycle(e) === "Draft").length;
  const pendingApprovalCount = allEvents.filter(e => ["PENDING", "SUBMITTED"].includes((e?.status || "").toUpperCase())).length;

  const pendingActionsCount = draftEventsCount + pendingApprovalCount;

  // Next upcoming event
  const sortedUpcoming = [...upcomingEventsList].sort((a, b) => {
    const aDate = new Date(a.start_date || a.event_date);
    const bDate = new Date(b.start_date || b.event_date);
    return aDate - bDate;
  });
  const nextEvent = sortedUpcoming[0] || null;
  const nextEventName = nextEvent ? (nextEvent.name || nextEvent.event_name) : null;
  const nextEventDate = nextEvent ? (nextEvent.start_date || nextEvent.event_date) : null;
  const daysUntilNext = nextEventDate ? Math.max(0, Math.ceil((new Date(nextEventDate).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24))) : null;
  const pendingStallsCount = useMemo(() => {
    return stallApplications.filter(a => (a.status || '').toLowerCase() === 'pending').length;
  }, [stallApplications]);

  const approvedStallsCount = useMemo(() => {
    return stallApplications.filter(a => (a.status || '').toLowerCase() === 'approved').length;
  }, [stallApplications]);

  // ── Table helpers ──
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getEventTabStatus = (e) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sDate = e?.event_date ? new Date(e.event_date) : (e?.start_date ? new Date(e.start_date) : null);
    const eDate = e?.end_date ? new Date(e.end_date) : (sDate ? new Date(sDate) : null);
    if (sDate) sDate.setHours(0, 0, 0, 0);
    if (eDate) eDate.setHours(23, 59, 59, 999);
    const rawSt = (e?.status || e?.approval_status || "").toUpperCase();
    if (rawSt === "DRAFT") return "Draft";
    if (eDate && today > eDate) return "Past";
    if (sDate && today < sDate) return "Upcoming";
    return "Active";
  };

  const handleView = (evt) => {
    const rawSt = (evt.status || evt.approval_status || "").toUpperCase();
    if (rawSt === "DRAFT") {
      return handleEdit(evt);
    }
    const eventCode = evt.event_code || evt.code || evt.id;
    navigate(`/OrganizerHome/ViewEvent/${eventCode}`, { state: { mode: "view", isReadOnly: true, eventData: evt, eventId: evt.id } });
  };

  const handleEdit = (evt) => {
    const eventCode = evt.event_code || evt.code || evt.id;
    navigate(`/OrganizerHome/EditEvent/${eventCode}`, { state: { eventData: evt, eventId: evt.id } });
  };

  const handleGateScanner = (evt) => {
    const eventId = evt.id || evt.event_code || evt.code;
    navigate(`/OrganizerHome/EventCheckIn/${eventId}`, { state: { eventId, eventData: evt } });
  };

  const formatLakhs = (amount) => {
    const num = Math.round(Number(amount) || 0);
    if (num >= 100000) {
      const lakh = (num / 100000).toFixed(2);
      return `₹${lakh.endsWith(".00") ? lakh.slice(0, -3) : lakh} L`;
    }
    return `₹${num.toLocaleString("en-IN")}`;
  };

  return (
    <div className="space-y-6 pb-12 select-none text-slate-800 font-sans max-w-full">
      
      {/* ── 1. DASHBOARD HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome back, {organizerName}!
            </h1>
            {organizerCompany && (
              <Badge className="bg-cyan-50 text-cyan-800 border-cyan-200 font-bold text-[11px] px-2.5 py-0.5 flex items-center gap-1">
                <span>{organizerCompany}</span>
                <ShieldCheck size={13} className="text-cyan-600" />
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Your organizer command center — overview & quick actions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            onClick={() => {
              dispatch(fetchEventsThunk({ organizerId: userId, force: true }));
              fetchTableEvents();
              fetchStallApplications();
            }}
            variant="outline"
            className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs gap-1.5 cursor-pointer"
          >
            <RefreshCw size={14} className={(reduxLoading || isFiltering || initialLoading) ? "animate-spin text-cyan-600" : "text-slate-500"} />
            <span>Refresh Data</span>
          </Button>

          <CreateEventButton />
        </div>
      </div>

      {/* ── 2. ORGANIZER-LEVEL COMMON STAT CARDS (4 cards - Equally Aligned) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        
        {/* CARD 1 — TOTAL EVENTS */}
        <Card 
          onClick={() => setSelectedTab("all")}
          className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-4 h-[162px] flex flex-col justify-between relative overflow-hidden cursor-pointer hover:border-cyan-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Events</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 group-hover:scale-105 transition-transform">
              <Calendar size={18} />
            </div>
          </div>
          <div className="my-auto">
            <div className="text-3xl font-black text-slate-900 leading-none">{totalEventsCount}</div>
            <div className="h-5 flex items-center flex-wrap gap-1.5 mt-2 overflow-hidden">
              {activeEventsCount > 0 && (
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-md leading-none">
                  {activeEventsCount} Live
                </span>
              )}
              {upcomingEventsCount > 0 && (
                <span className="text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 px-1.5 py-0.5 rounded-md leading-none">
                  {upcomingEventsCount} Upcoming
                </span>
              )}
              {pastEventsCount > 0 && (
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded-md leading-none">
                  {pastEventsCount} Past
                </span>
              )}
              {draftEventsCount > 0 && (
                <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-md leading-none">
                  {draftEventsCount} Draft
                </span>
              )}
              {totalEventsCount === 0 && (
                <span className="text-[11px] font-medium text-slate-400">No events yet</span>
              )}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100/80 flex items-center gap-1 text-[10px] font-bold text-cyan-600 group-hover:text-cyan-700 transition-colors">
            <ArrowUpRight size={12} />
            <span>View all events</span>
          </div>
        </Card>

        {/* CARD 2 — NEXT UPCOMING EVENT */}
        <Card 
          onClick={() => {
            if (nextEvent) handleView(nextEvent);
            else navigate("/OrganizerHome/CreateEvent");
          }}
          className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-4 h-[162px] flex flex-col justify-between relative overflow-hidden cursor-pointer hover:border-indigo-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Next Upcoming</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
              <Clock size={18} />
            </div>
          </div>
          <div className="my-auto">
            {nextEvent ? (
              <>
                <div className="text-sm font-black text-slate-900 truncate leading-tight" title={nextEventName}>
                  {nextEventName}
                </div>
                <div className="h-5 flex items-center gap-1.5 text-[11px] text-slate-500 mt-2 overflow-hidden">
                  <span className="font-bold text-indigo-600">
                    {daysUntilNext === 0 ? "Starts today!" : daysUntilNext === 1 ? "Starts tomorrow" : `In ${daysUntilNext} days`}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-500 font-medium truncate">{formatDate(nextEventDate)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="text-3xl font-black text-slate-400 leading-none">0</div>
                <div className="h-5 flex items-center mt-2 text-[11px] font-medium text-slate-400">
                  No upcoming events
                </div>
              </>
            )}
          </div>
          <div className="pt-2 border-t border-slate-100/80 flex items-center gap-1 text-[10px] font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors">
            <ArrowUpRight size={12} />
            <span>{nextEvent ? "View details" : "Create event"}</span>
          </div>
        </Card>

        {/* CARD 3 — PENDING ACTIONS */}
        <Card 
          onClick={() => {
            if (draftEventsCount > 0) setSelectedTab("draft");
          }}
          className={`border-slate-200/80 shadow-xs bg-white rounded-2xl p-4 h-[162px] flex flex-col justify-between relative overflow-hidden transition-all group ${
            pendingActionsCount > 0 ? "hover:border-amber-400 ring-2 ring-amber-100/70 cursor-pointer" : "hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Actions</span>
            <div className={`p-2 rounded-xl ${pendingActionsCount > 0 ? "bg-amber-100 text-amber-700 animate-pulse" : "bg-emerald-50 text-emerald-600"}`}>
              <AlertCircle size={18} />
            </div>
          </div>
          <div className="my-auto">
            <div className="text-3xl font-black text-slate-900 leading-none">{pendingActionsCount}</div>
            <div className="h-5 flex items-center mt-2 overflow-hidden">
              {pendingActionsCount > 0 ? (
                <span className="text-[11px] font-bold text-amber-700 truncate">
                  {draftEventsCount > 0 ? `${draftEventsCount} draft${draftEventsCount > 1 ? 's' : ''} to complete` : `${pendingApprovalCount} awaiting approval`}
                </span>
              ) : (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={12} /> All caught up
                </span>
              )}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100/80 flex items-center gap-1 text-[10px] font-bold text-amber-600 group-hover:text-amber-700 transition-colors">
            <ArrowUpRight size={12} />
            <span>{pendingActionsCount > 0 ? "Resolve pending" : "No pending items"}</span>
          </div>
        </Card>

        {/* CARD 4 — PENDING STALL REQUESTS */}
        <Card 
          onClick={() => navigate("/OrganizerHome/Manage_Stall")}
          className={`border-slate-200/80 shadow-xs bg-white rounded-2xl p-4 h-[162px] flex flex-col justify-between relative overflow-hidden cursor-pointer transition-all group ${
            pendingStallsCount > 0 ? "hover:border-amber-400 ring-2 ring-amber-100/70" : "hover:border-cyan-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Stalls</span>
            <div className={`p-2 rounded-xl ${pendingStallsCount > 0 ? "bg-amber-100 text-amber-700 animate-pulse" : "bg-cyan-50 text-cyan-600"} group-hover:scale-105 transition-transform`}>
              <Store size={18} />
            </div>
          </div>
          <div className="my-auto">
            <div className="text-3xl font-black text-slate-900 leading-none">
              {loadingStalls ? "..." : pendingStallsCount}
            </div>
            <div className="h-5 flex items-center mt-2 overflow-hidden">
              {pendingStallsCount > 0 ? (
                <span className="text-[11px] font-bold text-amber-700 truncate">
                  {pendingStallsCount} waiting review · {stallApplications.length} total
                </span>
              ) : (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={12} /> All caught up ({stallApplications.length} total)
                </span>
              )}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100/80 flex items-center gap-1 text-[10px] font-bold text-cyan-600 group-hover:text-cyan-700 transition-colors">
            <ArrowUpRight size={12} />
            <span>Manage Stalls</span>
          </div>
        </Card>

      </div>

      {/* ── 3. MY EVENTS PORTFOLIO TABLE (API-DRIVEN) ── */}
      <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-900">My Events</h2>
            <Badge variant="outline" className="bg-slate-50 text-slate-700 font-bold border-slate-200">
              {tableEvents.length} Events
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              {[
                { label: "All", value: "all" },
                { label: "Active", value: "active" },
                { label: "Upcoming", value: "upcoming" },
                { label: "Past", value: "past" },
                { label: "Draft", value: "draft" },
              ].map((t) => {
                const isActive = selectedTab === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => setSelectedTab(t.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>{t.label}</span>
                    {isActive && isFiltering && (
                      <RefreshCw size={10} className="animate-spin text-cyan-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* ── TABLE CONTAINER WITH ZERO-FLICKER TRANSITION ── */}
        <div className="relative min-h-[360px]">
          {/* Subtle smooth progress bar during tab switch / search */}
          {isFiltering && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-100 overflow-hidden z-20 rounded-t-xl">
              <div className="w-full h-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 animate-pulse" />
            </div>
          )}

          <div className={`transition-opacity duration-200 ${isFiltering ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
            <ResponsiveTableView
              data={tableEvents}
              keyField="id"
              loading={initialLoading}
              columnCount={8}
              columns={[
                { header: "Event Details", className: "py-3 px-4" },
                { header: "Date & Time", className: "py-3 px-4" },
                { header: "Tickets Sold", className: "py-3 px-4" },
                { header: "Stalls Booked", className: "py-3 px-4" },
                { header: "Total Earnings", className: "py-3 px-4" },
                { header: "Approval Status", className: "py-3 px-4 text-center" },
                { header: "Lifecycle", className: "py-3 px-4 text-center" },
                { header: "Actions", className: "py-3 px-4 text-right" },
              ]}
              emptyMessage="No events found matching your criteria."
              emptyAction={
                <CreateEventButton size="sm" className="mt-2" />
              }
          renderDesktopTable={() => (
            <div className="rounded-xl border border-slate-200 overflow-hidden responsive-table-wrap">
              <table className="w-full text-left border-collapse min-w-[760px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider">
                    <th className="py-3 px-4">Event Details</th>
                    <th className="py-3 px-4">Date &amp; Time</th>
                    <th className="py-3 px-4">Tickets Sold</th>
                    <th className="py-3 px-4">Stalls Booked</th>
                    <th className="py-3 px-4">Total Earnings</th>
                    <th className="py-3 px-4 text-center">Approval Status</th>
                    <th className="py-3 px-4 text-center">Lifecycle</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {tableEvents.map((evt) => {
                    const eventStatus = getEventTabStatus(evt);
                    const sold = Number(evt.passesSold || evt.passes_sold || 0);
                    const capacity = Number(evt.totalCapacity || evt.capacity || evt.total_capacity || 500);
                    const stallsBooked = Number(evt.stalls_booked || evt.stallsBooked || 0);
                    const stallsTotal = Number(evt.total_stalls || 50);
                    const price = Number(evt.price_inr || evt.priceINR || evt.price || evt.pass_fee || 0);
                    const earnings = price * sold;

                    const rawSt = (evt.status || evt.approval_status || "PENDING").toUpperCase();
                    const isApproved = ["APPROVED", "ACTIVE", "LIVE", "PUBLISHED"].includes(rawSt);
                    const isSuspended = rawSt === "SUSPENDED";
                    const isRejected = rawSt === "REJECTED";
                    const isDraft = rawSt === "DRAFT";

                    return (
                      <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm hover:text-cyan-600 transition-colors cursor-pointer" onClick={() => handleView(evt)}>
                              {evt.name || evt.event_name || "Untitled Event"}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-bold text-slate-500">{evt.category || evt.main_category_name || "General"}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-[10px] text-slate-400">{evt.city || evt.venue || "Venue TBD"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-slate-900">
                          {formatDate(evt.event_date || evt.start_date)}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-bold text-slate-800">
                          {sold.toLocaleString()} / {capacity.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-bold text-purple-700">
                          {stallsBooked} / {stallsTotal}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-black text-slate-900">
                          {formatLakhs(earnings)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                            isApproved
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                              : isSuspended
                              ? "bg-rose-50 text-rose-800 border border-rose-300"
                              : isRejected
                              ? "bg-red-50 text-red-800 border border-red-300"
                              : isDraft
                              ? "bg-slate-100 text-slate-700 border border-slate-300"
                              : "bg-amber-50 text-amber-800 border border-amber-300"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              isApproved
                                ? "bg-emerald-500"
                                : isSuspended
                                ? "bg-rose-500"
                                : isRejected
                                ? "bg-red-500"
                                : isDraft
                                ? "bg-slate-400"
                                : "bg-amber-500 animate-pulse"
                            }`} />
                            {isApproved
                              ? "Approved & Live"
                              : isSuspended
                              ? "Suspended"
                              : isRejected
                              ? "Rejected"
                              : isDraft
                              ? "Draft"
                              : "Pending Approval"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                            eventStatus === "Active"
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : eventStatus === "Upcoming"
                              ? "bg-cyan-100 text-cyan-700 border border-cyan-200"
                              : eventStatus === "Draft"
                              ? "bg-amber-100 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${eventStatus === "Active" ? "bg-emerald-500 animate-pulse" : eventStatus === "Upcoming" ? "bg-cyan-500" : "bg-slate-400"}`} />
                            {eventStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isDraft ? (
                              <Can I="events.edit">
                                <button
                                  onClick={() => handleEdit(evt)}
                                  className="px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-extrabold inline-flex items-center gap-1.5 shadow-xs shadow-cyan-500/25 cursor-pointer transition-all active:scale-95"
                                  title="Resume Draft & Publish Event"
                                >
                                  <PlayCircle size={13} strokeWidth={2.5} />
                                  <span>Resume Setup</span>
                                </button>
                              </Can>
                            ) : (
                              <>
                                <Can I="events.view">
                                  <button
                                    onClick={() => handleView(evt)}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-cyan-50 text-slate-600 hover:text-cyan-600 transition-colors cursor-pointer border border-slate-200"
                                    title="View Event Details"
                                  >
                                    <Eye size={15} />
                                  </button>
                                </Can>
                                <Can I="events.edit">
                                  <button
                                    onClick={() => handleEdit(evt)}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer border border-slate-200"
                                    title="Edit Event"
                                  >
                                    <Pencil size={15} />
                                  </button>
                                </Can>
                                <Can anyOf={["checkin.view", "checkin.scan"]}>
                                  <button
                                    onClick={() => handleGateScanner(evt)}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer border border-slate-200"
                                    title="Gate Check In"
                                  >
                                    <QrCode size={15} />
                                  </button>
                                </Can>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          renderMobileCard={(evt) => {
            const eventStatus = getEventTabStatus(evt);
            const sold = Number(evt.passesSold || evt.passes_sold || 0);
            const capacity = Number(evt.totalCapacity || evt.capacity || evt.total_capacity || 500);
            const price = Number(evt.price_inr || evt.priceINR || evt.price || evt.pass_fee || 0);
            const earnings = price * sold;

            const rawSt = (evt.status || evt.approval_status || "PENDING").toUpperCase();
            const isApproved = ["APPROVED", "ACTIVE", "LIVE", "PUBLISHED"].includes(rawSt);
            const isSuspended = rawSt === "SUSPENDED";
            const isRejected = rawSt === "REJECTED";
            const isDraft = rawSt === "DRAFT";

            return (
              <MobileDataCard key={evt.id} highlightBorder={isApproved}>
                <MobileDataCard.Header
                  badge={
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-extrabold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
                        {evt.category || evt.main_category_name || "General"}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        📍 {evt.city || evt.venue || "Venue TBD"}
                      </span>
                    </div>
                  }
                  title={evt.name || evt.event_name || "Untitled Event"}
                  onTitleClick={() => handleView(evt)}
                  statusBadge={
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black inline-flex items-center gap-1 ${
                      isApproved
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                        : isSuspended
                        ? "bg-rose-50 text-rose-800 border border-rose-300"
                        : isRejected
                        ? "bg-red-50 text-red-800 border border-red-300"
                        : isDraft
                        ? "bg-slate-100 text-slate-700 border border-slate-300"
                        : "bg-amber-50 text-amber-800 border border-amber-300"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isApproved
                          ? "bg-emerald-500"
                          : isSuspended
                          ? "bg-rose-500"
                          : isRejected
                          ? "bg-red-500"
                          : isDraft
                          ? "bg-slate-400"
                          : "bg-amber-500 animate-pulse"
                      }`} />
                      {isApproved
                        ? "Approved"
                        : isSuspended
                        ? "Suspended"
                        : isRejected
                        ? "Rejected"
                        : isDraft
                        ? "Draft"
                        : "Pending"}
                    </span>
                  }
                />

                <MobileDataCard.Grid
                  columns={3}
                  items={[
                    { label: "Date", value: formatDate(evt.event_date || evt.start_date) },
                    { label: "Tickets", value: `${sold.toLocaleString()} / ${capacity.toLocaleString()}` },
                    { label: "Earnings", value: formatLakhs(earnings) },
                  ]}
                />

                <MobileDataCard.Actions>
                  {isDraft ? (
                    <Can I="events.edit">
                      <button
                        onClick={() => handleEdit(evt)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white text-xs font-extrabold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <PlayCircle size={13} strokeWidth={2.5} />
                        <span>Resume Setup</span>
                      </button>
                    </Can>
                  ) : (
                    <>
                      <Can I="events.view">
                        <button
                          onClick={() => handleView(evt)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-cyan-50 text-slate-700 text-xs font-extrabold inline-flex items-center gap-1 border border-slate-200 cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>
                      </Can>
                      <Can I="events.edit">
                        <button
                          onClick={() => handleEdit(evt)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 text-xs font-extrabold inline-flex items-center gap-1 border border-slate-200 cursor-pointer"
                        >
                          <Pencil size={13} />
                          <span>Edit</span>
                        </button>
                      </Can>
                      <Can anyOf={["checkin.view", "checkin.scan"]}>
                        <button
                          onClick={() => handleGateScanner(evt)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-extrabold inline-flex items-center gap-1.5 border border-emerald-200 cursor-pointer"
                        >
                          <QrCode size={13} />
                          <span>Gate Scan</span>
                        </button>
                      </Can>
                    </>
                  )}
                </MobileDataCard.Actions>
              </MobileDataCard>
            );
          }}
        />
          </div>
        </div>
      </Card>

    </div>
  );
}

export { OrganizerDashboardPage as Organizerdashboard };
