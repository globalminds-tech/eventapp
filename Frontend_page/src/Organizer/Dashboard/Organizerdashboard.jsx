import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchEventsThunk } from "@/Redux/eventSlice";
import {
  Eye, Pencil, Search, PlusCircle, Calendar, Ticket, IndianRupee, Users,
  QrCode, TrendingUp, Sparkles, MapPin, CheckCircle2, Clock,
  ArrowUpRight, Store, Filter, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export const Organizerdashboard = () => {
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
    const userId = reduxUser.id || sessionStorage.getItem("userId");
    if (userId) {
      dispatch(fetchEventsThunk(userId));
    }
  }, [dispatch, reduxUser.id]);

  // Filter events based on tab and search query
  const filteredEvents = events.filter((evt) => {
    if (!evt) return false;
    const evtName = evt.name || evt.event_name || "";
    const evtCode = evt.code || evt.event_code || "";
    const evtCategory = evt.category || "";
    const evtStatus = evt.status || "Active";

    const matchesSearch =
      evtName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evtCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evtCategory.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedTab === "all") return matchesSearch;
    if (selectedTab === "live") return matchesSearch && (evtStatus === "Live" || evtStatus === "APPROVED" || evtStatus === "Active");
    if (selectedTab === "upcoming") return matchesSearch && (evtStatus === "Upcoming" || evtStatus === "Published" || evtStatus === "Active");
    if (selectedTab === "draft") return matchesSearch && (evtStatus === "Draft" || evtStatus === "PENDING");
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* ── SLEEK PAGE HEADER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome, {organizerName} {organizerCompany && <span className="text-cyan-600 font-bold text-lg sm:text-xl">({organizerCompany})</span>}
            </h1>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Operations
            </span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 max-w-2xl">
            Monitor real-time ticket sales, gate check-in scanners, stall floor plans, and manage event schedules.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={() => navigate("/OrganizerHome/CreateEvent", { state: { mode: "create" } })}
            className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-4.5 py-2.5 rounded-xl shadow-md shadow-cyan-500/25 border-none cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] gap-2 text-xs sm:text-sm"
          >
            <PlusCircle size={18} />
            <span>Create New Event</span>
          </Button>
        </div>
      </div>

      {/* ── 4 KPI STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue */}
        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Ticket Sales</p>
              <h3 className="text-2xl font-extrabold text-slate-900">₹3,84,500</h3>
              <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <TrendingUp size={13} /> +18.4% this month
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <IndianRupee size={22} />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Passes Sold */}
        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Passes Issued</p>
              <h3 className="text-2xl font-extrabold text-slate-900">2,840</h3>
              <p className="text-xs font-medium text-slate-500">
                Out of 3,500 max capacity
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <Ticket size={22} />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Active Events */}
        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Shows</p>
              <h3 className="text-2xl font-extrabold text-slate-900">6 Events</h3>
              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 1 Show Live Today
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
              <Calendar size={22} />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Gate Check-ins */}
        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gate Scans Today</p>
              <h3 className="text-2xl font-extrabold text-slate-900">1,420</h3>
              <p className="text-xs font-medium text-indigo-600">
                89% Attendance verified
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <QrCode size={22} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── EVENTS SECTION ── */}
      <Card className="border-slate-200/80 shadow-sm bg-white rounded-2xl overflow-hidden">
        {/* Card Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: "all", label: "All Events" },
              { id: "live", label: "Live Now" },
              { id: "upcoming", label: "Upcoming" },
              { id: "draft", label: "Drafts" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                  selectedTab === tab.id
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 bg-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search event name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const userId = reduxUser.id || sessionStorage.getItem("userId");
                if (userId) dispatch(fetchEventsThunk(userId));
              }}
              className="h-9 px-3 border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
              title="Refresh Events"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Event Details</th>
                <th className="py-3.5 px-4">Date & Venue</th>
                <th className="py-3.5 px-4">Ticket Pricing</th>
                <th className="py-3.5 px-4">Passes Sold</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {loading && !loaded ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <div className="space-y-2">
                          <Skeleton className="w-16 h-3" />
                          <Skeleton className="w-36 h-4" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4"><Skeleton className="w-28 h-4" /></td>
                    <td className="py-4 px-4"><Skeleton className="w-16 h-4" /></td>
                    <td className="py-4 px-4"><Skeleton className="w-24 h-4" /></td>
                    <td className="py-4 px-4"><Skeleton className="w-16 h-6 rounded-full mx-auto" /></td>
                    <td className="py-4 px-5 text-right"><Skeleton className="w-20 h-8 rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold">No events found matching your search</p>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Event Banner + Title + Category */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        {(evt.banner || evt.banner_url || evt.image || evt.banner_preview) ? (
                          <img
                            src={evt.banner || evt.banner_url || evt.image || evt.banner_preview}
                            alt={evt.name || evt.event_name || "Event"}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0 text-xs">
                            {evt.code || evt.event_code || `EVT-${evt.id}`}
                          </div>
                        )}
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border-indigo-200 px-1.5 py-0">
                              {evt.code || evt.event_code || `EVT-${evt.id}`}
                            </Badge>
                            {evt.category && (
                              <span className="text-[11px] font-semibold text-slate-400 truncate">
                                {evt.category}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm truncate max-w-xs">
                            {evt.name || evt.event_name}
                          </h4>
                        </div>
                      </div>
                    </td>

                    {/* Date & Venue */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-xs">
                          <Calendar size={13} className="text-slate-400 flex-shrink-0" />
                          <span>{evt.date || evt.start_date || "Upcoming"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                          <span className="truncate max-w-[140px]">{evt.venue || "Venue Setup"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Pricing */}
                    <td className="py-4 px-4 font-bold text-slate-900 text-xs">
                      {evt.price || (evt.pass_fee ? `₹${evt.pass_fee}` : "Free")}
                    </td>

                    {/* Passes Sold & Progress */}
                    <td className="py-4 px-4">
                      <div className="space-y-1.5 w-32">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span className="text-slate-800">{evt.passesSold || 0} sold</span>
                          <span className="text-slate-400">/{evt.totalCapacity || 500}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round(((evt.passesSold || 0) / (evt.totalCapacity || 500)) * 100)
                              )}%`
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 text-center">
                      {evt.status === "Live" ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 px-2.5 py-0.5 font-bold animate-pulse">
                          ● Live
                        </Badge>
                      ) : evt.status === "Draft" ? (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 px-2.5 py-0.5 font-semibold">
                          Draft
                        </Badge>
                      ) : (
                        <Badge className="bg-sky-100 text-sky-800 border-sky-200 px-2.5 py-0.5 font-semibold">
                          Upcoming
                        </Badge>
                      )}
                    </td>

                    {/* Quick Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const eventCode = evt.slug || evt.event_code || evt.code || evt.eventCode || evt.id;
                            navigate(`/OrganizerHome/EditEvent/${eventCode}`, { state: { mode: "edit", isReadOnly: false, eventId: evt.id, eventData: evt } });
                          }}
                          className="h-8 w-8 p-0 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
                          title="Edit Event Details"
                        >
                          <Pencil size={16} />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const eventCode = evt.slug || evt.event_code || evt.code || evt.eventCode || evt.id;
                            navigate(`/OrganizerHome/ViewEvent/${eventCode}`, { state: { mode: "view", isReadOnly: true, eventId: evt.id, eventData: evt } });
                          }}
                          className="h-8 w-8 p-0 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                          title="View Details (Read-Only)"
                        >
                          <Eye size={16} />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate("/OrganizerHome/EventCheckIn")}
                          className="h-8 w-8 p-0 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                          title="Open Gate Scanner"
                        >
                          <QrCode size={16} />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate("/OrganizerHome/Manage_Stall")}
                          className="h-8 w-8 p-0 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer"
                          title="Manage Stall Floor Plan"
                        >
                          <Store size={16} />
                        </Button>
                      </div>
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
};