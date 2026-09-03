import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchEventsThunk } from "@/app/store/eventSlice";
import {
  Eye, Pencil, Search, PlusCircle, Calendar, Ticket, IndianRupee, Users,
  QrCode, MapPin, Clock, RefreshCw, Trash2, Store, Utensils, Bell,
  ChevronDown, ArrowUpRight, CheckCircle2, AlertCircle, X, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Select, SelectItem } from "@/components/ui/Select";

export default function OrganizerDashboardPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const reduxUser = useSelector((state) => state.user);
  const eventsState = useSelector((state) => state.events?.list);
  const events = Array.isArray(eventsState) ? eventsState : (Array.isArray(eventsState?.data) ? eventsState.data : []);
  const { loading, loaded } = useSelector((state) => state.events);
  
  const organizerName = reduxUser.name || sessionStorage.getItem("name") || localStorage.getItem("name") || "Organizer";
  const organizerCompany = reduxUser.organization_name || sessionStorage.getItem("organization_name") || localStorage.getItem("organization_name") || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedEventId, setSelectedEventId] = useState("all");
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    const userId = reduxUser.id || sessionStorage.getItem("userId") || sessionStorage.getItem("id") || localStorage.getItem("userId") || localStorage.getItem("id") || "";
    dispatch(fetchEventsThunk(userId));
  }, [dispatch, reduxUser.id]);

  // Filter events by selected scope dropdown
  const scopedEvents = selectedEventId === "all" 
    ? events 
    : events.filter(e => String(e.id) === String(selectedEventId) || String(e.event_code) === String(selectedEventId));

  const selectedEventObj = events.find(e => String(e.id) === String(selectedEventId));

  // --- Dynamic KPI Calculations ---
  const totalCapacitySum = scopedEvents.reduce((acc, e) => acc + Number(e?.totalCapacity || e?.capacity || e?.total_capacity || 500), 0);
  const totalPassesSold = scopedEvents.reduce((acc, e) => acc + Number(e?.passesSold || e?.passes_sold || e?.booking?.capacity || 0), 0);
  const ticketsPercentage = totalCapacitySum > 0 ? Math.min(100, Math.round((totalPassesSold / totalCapacitySum) * 100)) : 0;

  const ticketRevenue = scopedEvents.reduce((acc, e) => {
    const price = Number(e?.price_inr || e?.priceINR || e?.price || e?.pass_fee || 0);
    const sold = Number(e?.passesSold || e?.passes_sold || 0);
    return acc + (price * sold);
  }, 0);

  const stallsCapacitySum = scopedEvents.reduce((acc, e) => acc + Number(e?.total_stalls || e?.stalls_capacity || 50), 0);
  const stallsBookedCount = scopedEvents.reduce((acc, e) => acc + Number(e?.stalls_booked || e?.stallsBooked || e?.reserved_stalls || (e?.stalls ? e.stalls.length : 0)), 0);
  const stallsAvailable = Math.max(0, stallsCapacitySum - stallsBookedCount);
  const stallsPercentage = stallsCapacitySum > 0 ? Math.min(100, Math.round((stallsBookedCount / stallsCapacitySum) * 100)) : 0;

  const stallRevenue = scopedEvents.reduce((acc, e) => acc + Number(e?.stall_revenue || e?.stallRevenue || 0), 0);
  const totalGrossRevenue = ticketRevenue + stallRevenue;

  const totalGateScans = scopedEvents.reduce((acc, e) => acc + Number(e?.gateScans || e?.arrived || 0), 0);
  const checkInPercentage = totalPassesSold > 0 ? Math.min(100, Math.round((totalGateScans / totalPassesSold) * 100)) : 0;

  const mealsGivenCount = scopedEvents.reduce((acc, e) => acc + Number(e?.food_passes || e?.foodPasses || e?.food_issued || (e?.food ? totalPassesSold : 0)), 0);
  const totalMealPassesSum = totalPassesSold > 0 ? totalPassesSold : 1500;
  const mealsPercentage = totalMealPassesSum > 0 ? Math.min(100, Math.round((mealsGivenCount / totalMealPassesSum) * 100)) : 0;

  const upcomingEventsList = events.filter((e) => {
    const sDate = e?.event_date ? new Date(e.event_date) : (e?.start_date ? new Date(e.start_date) : null);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sDate && sDate >= today;
  });

  const nextUpcomingEvent = upcomingEventsList.length > 0 
    ? (upcomingEventsList[0].name || upcomingEventsList[0].event_name) 
    : null;

  const pendingApprovalsCount = events.filter((e) => ["Pending", "Draft"].includes(e?.status || e?.event_status)).length;
  const thingsToDoCount = pendingApprovalsCount > 0 ? pendingApprovalsCount : 0;

  // Format Lakhs helper (e.g. ₹8.42 L or ₹45,000)
  const formatLakhs = (amount) => {
    const num = Math.round(Number(amount) || 0);
    if (num >= 100000) {
      const lakh = (num / 100000).toFixed(2);
      return `₹${lakh.endsWith(".00") ? lakh.slice(0, -3) : lakh} L`;
    }
    return `₹${num.toLocaleString("en-IN")}`;
  };

  const getEventTabStatus = (e) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sDate = e?.event_date ? new Date(e.event_date) : (e?.start_date ? new Date(e.start_date) : null);
    const eDate = e?.end_date ? new Date(e.end_date) : (sDate ? new Date(sDate) : null);

    if (sDate) sDate.setHours(0, 0, 0, 0);
    if (eDate) eDate.setHours(23, 59, 59, 999);

    if (e?.status === "Draft") return "Draft";
    if (eDate && today > eDate) return "Past";
    if (sDate && today < sDate) return "Upcoming";
    return "Active";
  };

  const filteredEvents = scopedEvents.filter((evt) => {
    if (!evt) return false;
    const evtName = evt.name || evt.event_name || "";
    const evtCode = evt.code || evt.event_code || "";
    const evtCat = evt.category || evt.main_category_name || "";
    const evtCity = evt.city || evt.venue || "";

    const matchesSearch = searchQuery === "" || 
      evtName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evtCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evtCat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evtCity.toLowerCase().includes(searchQuery.toLowerCase());

    const tabStatus = getEventTabStatus(evt).toLowerCase();
    if (selectedTab === "all") return matchesSearch;
    if (selectedTab === "active") return matchesSearch && tabStatus === "active";
    if (selectedTab === "upcoming") return matchesSearch && tabStatus === "upcoming";
    if (selectedTab === "past") return matchesSearch && tabStatus === "past";
    if (selectedTab === "draft") return matchesSearch && tabStatus === "draft";
    return matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleView = (evt) => {
    const eventCode = evt.event_code || evt.code || evt.id;
    navigate(`/OrganizerHome/ViewEvent/${eventCode}`, { state: { mode: "view", isReadOnly: true, eventData: evt, eventId: evt.id } });
  };

  const handleEdit = (evt) => {
    const eventCode = evt.event_code || evt.code || evt.id;
    navigate(`/OrganizerHome/EditEvent/${eventCode}`, { state: { eventData: evt, eventId: evt.id } });
  };

  const handleGateScanner = (evt) => {
    const eventId = evt.id || evt.event_id || 1;
    navigate(`/validate-booking/${eventId}`);
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
            Here's how your events are doing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Event Scope Selector Dropdown */}
          <Select
            value={selectedEventId}
            onValueChange={(val) => setSelectedEventId(val)}
            className="w-auto min-w-[210px]"
            triggerClassName="h-9 font-extrabold text-xs bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-2xs rounded-xl focus:ring-cyan-500 focus:border-cyan-500"
          >
            <SelectItem value="all">Overview — All Events</SelectItem>
            {events.map((e) => (
              <SelectItem key={e.id} value={String(e.id)}>
                {e.name || e.event_name || `Event #${e.id}`}
              </SelectItem>
            ))}
          </Select>

          <Button
            onClick={() => dispatch(fetchEventsThunk({ organizerId: reduxUser.id || sessionStorage.getItem("userId") || localStorage.getItem("id"), force: true }))}
            variant="outline"
            className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs gap-1.5 cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-cyan-600" : "text-slate-500"} />
            <span>Refresh Data</span>
          </Button>

          <Button
            onClick={() => navigate("/OrganizerHome/CreateEvent")}
            className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl border-none cursor-pointer gap-2 shadow-md shadow-cyan-500/25 hover:opacity-95 transition-all"
          >
            <PlusCircle size={16} />
            <span>+ Create New Event</span>
          </Button>
        </div>
      </div>

      {/* ── 2. 8 HUMAN-READABLE KPI CARDS GRID (4x2 Desktop, 2x4 Tablet, 1x8 Mobile) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1 — TICKETS SOLD */}
        <Card 
          onClick={() => setActiveModal('tickets')}
          className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-4 space-y-2.5 relative overflow-hidden cursor-pointer hover:border-blue-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tickets Sold</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
              <Ticket size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalPassesSold.toLocaleString()}</div>
          <p className="text-[11px] font-semibold text-slate-500">{ticketsPercentage}% of available tickets</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${ticketsPercentage}%` }} />
          </div>
        </Card>

        {/* CARD 2 — MONEY COLLECTED */}
        <Card 
          onClick={() => setActiveModal('money')}
          className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-4 space-y-2.5 relative overflow-hidden cursor-pointer hover:border-emerald-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Money Collected</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <IndianRupee size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{formatLakhs(ticketRevenue)}</div>
          <p className="text-[11px] font-semibold text-emerald-600">From ticket sales</p>
        </Card>

        {/* CARD 3 — STALLS BOOKED */}
        <Card 
          onClick={() => setActiveModal('stalls')}
          className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-4 space-y-2.5 relative overflow-hidden cursor-pointer hover:border-purple-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stalls Booked</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
              <Store size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stallsBookedCount} / {stallsCapacitySum}</div>
          <p className="text-[11px] font-semibold text-purple-600">{stallsAvailable} stalls still available</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${stallsPercentage}%` }} />
          </div>
        </Card>

        {/* CARD 4 — TOTAL EARNINGS */}
        <Card 
          onClick={() => setActiveModal('earnings')}
          className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-4 space-y-2.5 relative overflow-hidden cursor-pointer hover:border-emerald-400 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Earnings</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 group-hover:scale-105 transition-transform">
              <IndianRupee size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{formatLakhs(totalGrossRevenue)}</div>
          <p className="text-[11px] font-semibold text-emerald-700">Tickets + stall bookings</p>
        </Card>

        {/* CARD 5 — PEOPLE CHECKED IN (CONTEXT-AWARE) */}
        <Card 
          onClick={() => setActiveModal('checkin')}
          className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-4 space-y-2.5 relative overflow-hidden cursor-pointer hover:border-cyan-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">People Checked In</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 group-hover:scale-105 transition-transform">
              <QrCode size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalGateScans.toLocaleString()}</div>
          <p className="text-[11px] font-semibold text-slate-500">
            {totalPassesSold > 0 ? `${totalGateScans.toLocaleString()} / ${totalPassesSold.toLocaleString()} checked in (${checkInPercentage}%)` : "Event check-in ready"}
          </p>
        </Card>

        {/* CARD 6 — MEALS GIVEN OUT */}
        <Card 
          onClick={() => setActiveModal('meals')}
          className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-4 space-y-2.5 relative overflow-hidden cursor-pointer hover:border-amber-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Meals Given Out</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
              <Utensils size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{mealsGivenCount.toLocaleString()}</div>
          <p className="text-[11px] font-semibold text-amber-600">{mealsPercentage}% of meal passes used</p>
        </Card>

        {/* CARD 7 — UPCOMING EVENTS */}
        <Card 
          onClick={() => { setSelectedTab("upcoming"); }}
          className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-4 space-y-2.5 relative overflow-hidden cursor-pointer hover:border-indigo-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upcoming Events</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
              <Calendar size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{upcomingEventsList.length}</div>
          <p className="text-[11px] font-semibold text-indigo-600 truncate">
            {nextUpcomingEvent ? `Next: ${nextUpcomingEvent}` : "No upcoming events"}
          </p>
        </Card>

        {/* CARD 8 — THINGS TO DO (ALERT / ZERO STATE) */}
        <Card 
          onClick={() => setActiveModal('tasks')}
          className={`border-slate-200/80 shadow-xs bg-white rounded-2xl p-4 space-y-2.5 relative overflow-hidden cursor-pointer transition-all group ${
            thingsToDoCount > 0 ? "hover:border-amber-400 ring-2 ring-amber-100" : "hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Things To Do</span>
            <div className={`p-2 rounded-xl ${thingsToDoCount > 0 ? "bg-amber-100 text-amber-700 animate-pulse" : "bg-emerald-50 text-emerald-600"}`}>
              <Bell size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{thingsToDoCount}</div>
          <p className={`text-[11px] font-bold ${thingsToDoCount > 0 ? "text-amber-700" : "text-emerald-600"}`}>
            {thingsToDoCount > 0 ? `${thingsToDoCount} item${thingsToDoCount > 1 ? 's' : ''} needs your attention` : "You're all caught up ✓"}
          </p>
        </Card>

      </div>

      {/* ── 3. MY EVENTS PORTFOLIO SECTION ── */}
      <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-900">My Events</h2>
            <Badge variant="outline" className="bg-slate-50 text-slate-700 font-bold border-slate-200">
              {filteredEvents.length} Events
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
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setSelectedTab(t.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    selectedTab === t.value
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {t.label}
                </button>
              ))}
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

        {/* Dynamic Events Table / Mobile Cards */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4">Event Details</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Tickets Sold</th>
                <th className="py-3 px-4">Stalls Booked</th>
                <th className="py-3 px-4">Total Earnings</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading && !loaded ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center">
                    <Skeleton className="w-full h-10 rounded-lg" />
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-500 font-semibold text-xs bg-slate-50/50">
                    <div className="max-w-xs mx-auto space-y-3">
                      <p className="font-bold text-slate-700">No events found</p>
                      <p className="text-[11px] text-slate-400">Create your first event to start managing registrations, tickets, and exhibitors.</p>
                      <Button
                        onClick={() => navigate("/OrganizerHome/CreateEvent")}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl border-none cursor-pointer"
                      >
                        + Create New Event
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => {
                  const eventStatus = getEventTabStatus(evt);
                  const sold = Number(evt.passesSold || evt.passes_sold || 0);
                  const capacity = Number(evt.totalCapacity || evt.capacity || evt.total_capacity || 500);
                  const stallsBooked = Number(evt.stalls_booked || evt.stallsBooked || 0);
                  const stallsTotal = Number(evt.total_stalls || 50);
                  const price = Number(evt.price_inr || evt.priceINR || evt.price || evt.pass_fee || 0);
                  const earnings = price * sold;

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
                      <td className="py-3.5 px-4">
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
                          <button
                            onClick={() => handleView(evt)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-cyan-50 text-slate-600 hover:text-cyan-600 transition-colors cursor-pointer border border-slate-200"
                            title="View Event Details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleEdit(evt)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer border border-slate-200"
                            title="Edit Event"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleGateScanner(evt)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer border border-slate-200"
                            title="Gate Check In"
                          >
                            <QrCode size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── 4. INTERACTIVE CARD DETAIL MODAL ── */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X size={18} />
            </button>

            {activeModal === 'tickets' && (
              <div className="space-y-3">
                <h3 className="text-lg font-black text-slate-900">Ticket Sales Details</h3>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">Total Tickets Sold</span>
                    <span className="font-extrabold text-slate-900">{totalPassesSold.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">Tickets Available</span>
                    <span className="font-extrabold text-slate-900">{totalCapacitySum.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">Remaining Tickets</span>
                    <span className="font-extrabold text-cyan-600">{Math.max(0, totalCapacitySum - totalPassesSold).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'money' && (
              <div className="space-y-3">
                <h3 className="text-lg font-black text-slate-900">Ticket Revenue Details</h3>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">Ticket Revenue</span>
                    <span className="font-extrabold text-emerald-600">{formatLakhs(ticketRevenue)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">Platform Convenience Fees</span>
                    <span className="font-extrabold text-slate-600">₹0.00 (Zero Fee)</span>
                  </div>
                  <div className="flex justify-between py-1.5 pt-3 font-extrabold text-sm border-t border-slate-200">
                    <span>Final Collected Amount</span>
                    <span className="text-emerald-700">{formatLakhs(ticketRevenue)}</span>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'stalls' && (
              <div className="space-y-3">
                <h3 className="text-lg font-black text-slate-900">Stalls & Exhibitors</h3>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">Booked Stalls</span>
                    <span className="font-extrabold text-purple-700">{stallsBookedCount}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">Available Stalls</span>
                    <span className="font-extrabold text-slate-900">{stallsAvailable}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">Floor Space Occupancy</span>
                    <span className="font-extrabold text-purple-600">{stallsPercentage}% Booked</span>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'earnings' && (
              <div className="space-y-3">
                <h3 className="text-lg font-black text-slate-900">Earnings & Payments Breakdown</h3>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">Ticket Sales</span>
                    <span className="font-extrabold text-slate-900">{formatLakhs(ticketRevenue)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">Stall Bookings</span>
                    <span className="font-extrabold text-purple-700">{formatLakhs(stallRevenue)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 pt-3 font-extrabold text-sm border-t border-slate-200">
                    <span>Total Earnings</span>
                    <span className="text-emerald-600">{formatLakhs(totalGrossRevenue)}</span>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'checkin' && (
              <div className="space-y-3">
                <h3 className="text-lg font-black text-slate-900">Event Check-In Gate Details</h3>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">Checked-in People</span>
                    <span className="font-extrabold text-cyan-600">{totalGateScans.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">Not Checked In Yet</span>
                    <span className="font-extrabold text-slate-900">{Math.max(0, totalPassesSold - totalGateScans).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">Check-In Conversion</span>
                    <span className="font-extrabold text-cyan-700">{checkInPercentage}% Arrived</span>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'meals' && (
              <div className="space-y-3">
                <h3 className="text-lg font-black text-slate-900">Food & Catering Distribution</h3>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">Total Meals Given Out</span>
                    <span className="font-extrabold text-amber-600">{mealsGivenCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">Pass Utilization</span>
                    <span className="font-extrabold text-slate-900">{mealsPercentage}% Used</span>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'tasks' && (
              <div className="space-y-3">
                <h3 className="text-lg font-black text-slate-900">Things To Do</h3>
                {thingsToDoCount === 0 ? (
                  <p className="text-xs font-bold text-emerald-600 py-4 text-center bg-emerald-50 rounded-xl">
                    You're all caught up ✓
                  </p>
                ) : (
                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 font-bold flex justify-between">
                      <span>Events Awaiting Approval</span>
                      <span>{pendingApprovalsCount}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 text-right">
              <Button onClick={() => setActiveModal(null)} className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export { OrganizerDashboardPage as Organizerdashboard };
