import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchEventsThunk } from "@/app/store/eventSlice";
import {
  Eye, Pencil, Search, PlusCircle, Calendar, Ticket, IndianRupee, Users,
  QrCode, MapPin, Clock, RefreshCw, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

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

  useEffect(() => {
    const userId = reduxUser.id || sessionStorage.getItem("userId") || sessionStorage.getItem("id") || localStorage.getItem("userId") || localStorage.getItem("id") || "";
    dispatch(fetchEventsThunk(userId));
  }, [dispatch, reduxUser.id]);

  const activeEventsCount = events.filter((e) => ["Live", "Approved", "Active", "Published"].includes(e?.status || e?.event_status)).length;
  const totalPassesSold = events.reduce((acc, e) => acc + Number(e?.passesSold || e?.passes_sold || e?.booking?.capacity || 0), 0);
  const totalCapacitySum = events.reduce((acc, e) => acc + Number(e?.totalCapacity || e?.capacity || e?.total_capacity || 0), 0);
  const totalGateScans = events.reduce((acc, e) => acc + Number(e?.gateScans || e?.arrived || 0), 0);
  const totalRevenueCalc = events.reduce((acc, e) => {
    const price = Number(e?.price_inr || e?.priceINR || e?.price || e?.pass_fee || 0);
    const sold = Number(e?.passesSold || e?.passes_sold || 0);
    return acc + (price * sold);
  }, 0);

  const getEventTabStatus = (e) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sDate = e?.event_date ? new Date(e.event_date) : (e?.start_date ? new Date(e.start_date) : null);
    const eDate = e?.end_date ? new Date(e.end_date) : (sDate ? new Date(sDate) : null);

    if (sDate) sDate.setHours(0, 0, 0, 0);
    if (eDate) eDate.setHours(23, 59, 59, 999);

    if (eDate && today > eDate) return "Past";
    if (sDate && today < sDate) return "Upcoming";
    return "Active";
  };

  const filteredEvents = events.filter((evt) => {
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

    const tabStatus = getEventTabStatus(evt);
    if (selectedTab === "all") return matchesSearch;
    if (selectedTab === "active") return matchesSearch && tabStatus === "Active";
    if (selectedTab === "upcoming") return matchesSearch && tabStatus === "Upcoming";
    if (selectedTab === "past") return matchesSearch && tabStatus === "Past";
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

  return (
    <div className="space-y-6 pb-12 select-none text-slate-800 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome back, {organizerName}!
            </h1>
            <Badge className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-extrabold text-[11px] px-2.5 py-0.5 border-none shadow-md shadow-cyan-500/20">
              {organizerCompany || "Verified Organizer"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Monitor real-time event analytics, ticket sales, gate entries, and manage your exhibition portfolio.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => dispatch(fetchEventsThunk({ organizerId: reduxUser.id || sessionStorage.getItem("userId") || localStorage.getItem("id"), force: true }))}
            variant="outline"
            className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs gap-1.5 cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-cyan-600" : "text-slate-500"} />
            <span>Refresh</span>
          </Button>

          <Button
            onClick={() => navigate("/OrganizerHome/CreateEvent")}
            className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl border-none cursor-pointer gap-2 shadow-md shadow-cyan-500/25 hover:opacity-95 transition-all"
          >
            <PlusCircle size={16} />
            <span>Create New Event</span>
          </Button>
        </div>
      </div>

      {/* ── KPI METRICS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-4 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Events</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
              <Calendar size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{activeEventsCount}</div>
          <p className="text-[11px] font-semibold text-slate-400">Total events published & live</p>
        </Card>

        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-4 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Passes Sold</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Ticket size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalPassesSold.toLocaleString()}</div>
          <p className="text-[11px] font-semibold text-emerald-600">Out of {totalCapacitySum.toLocaleString()} total capacity</p>
        </Card>

        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-4 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gate Scans (Check-ins)</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <QrCode size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalGateScans.toLocaleString()}</div>
          <p className="text-[11px] font-semibold text-slate-400">Real-time attendee check-ins</p>
        </Card>

        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-4 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Ticket Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <IndianRupee size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">₹{totalRevenueCalc.toLocaleString('en-IN')}</div>
          <p className="text-[11px] font-semibold text-emerald-600">Calculated from verified bookings</p>
        </Card>
      </div>

      {/* ── EVENTS PORTFOLIO TABLE CONTAINER ── */}
      <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-900">Your Events Portfolio</h2>
            <Badge variant="outline" className="bg-slate-50 text-slate-700 font-bold border-slate-200">
              {filteredEvents.length} Events
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              {[
                { label: "All", value: "all" },
                { label: "Active", value: "active" },
                { label: "Upcoming", value: "upcoming" },
                { label: "Past", value: "past" },
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
                placeholder="Search event name, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Events Table */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4">Event Details</th>
                <th className="py-3 px-4">Category & Venue</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Ticket Price</th>
                <th className="py-3 px-4">Passes Sold</th>
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
                  <td colSpan="7" className="p-12 text-center text-slate-400 font-semibold text-xs bg-slate-50/50">
                    No events found. Click "Create New Event" to launch your first exhibition.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => {
                  const eventStatus = getEventTabStatus(evt);
                  return (
                    <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm hover:text-cyan-600 transition-colors cursor-pointer" onClick={() => handleView(evt)}>
                            {evt.name || evt.event_name || "Untitled Event"}
                          </h3>
                          <span className="text-[10px] font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 inline-block mt-0.5">
                            {evt.code || evt.event_code || `EVT-${evt.id}`}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs">
                          <span className="font-bold text-slate-800 block">{evt.category || evt.main_category_name || "General"}</span>
                          <span className="text-slate-500 flex items-center gap-1 mt-0.5 text-[11px]">
                            <MapPin size={12} className="text-cyan-600 shrink-0" />
                            {evt.city || evt.venue || "Venue TBD"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs">
                          <span className="font-semibold text-slate-900 flex items-center gap-1 text-[11px]">
                            <Calendar size={12} className="text-cyan-600 shrink-0" />
                            {formatDate(evt.event_date || evt.start_date)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-xs text-slate-900">
                        ₹{evt.price_inr || evt.priceINR || evt.price || evt.pass_fee || "0"}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                        {evt.passesSold || evt.passes_sold || 0} / {evt.totalCapacity || evt.capacity || evt.total_capacity || 500}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                          eventStatus === "Active"
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : eventStatus === "Upcoming"
                            ? "bg-cyan-100 text-cyan-700 border border-cyan-200"
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
    </div>
  );
}

export { OrganizerDashboardPage as Organizerdashboard };
