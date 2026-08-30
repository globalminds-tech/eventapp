import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchEventsThunk } from "@/app/store/eventSlice";
import {
  Eye, Pencil, Search, PlusCircle, Calendar, Ticket, IndianRupee, Users,
  QrCode, TrendingUp, Sparkles, MapPin, CheckCircle2, Clock,
  ArrowUpRight, Store, Filter, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

const getFullDocUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `http://localhost:5001${cleanUrl}`;
};

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
  const totalPassesSold = events.reduce((acc, e) => acc + Number(e?.passesSold || e?.booking?.capacity || 0), 0);
  const totalCapacitySum = events.reduce((acc, e) => acc + Number(e?.totalCapacity || e?.capacity || 0), 0);
  const totalGateScans = events.reduce((acc, e) => acc + Number(e?.gateScans || e?.arrived || 0), 0);
  const totalRevenueCalc = events.reduce((acc, e) => {
    const price = Number(e?.price_inr || e?.priceINR || e?.price || e?.booking?.priceINR || e?.pass_fee || 0);
    const sold = Number(e?.passesSold || 0);
    return acc + (price * sold);
  }, 0);

  const filteredEvents = events.filter((evt) => {
    if (!evt) return false;
    const evtName = evt.name || evt.event_name || "";
    const evtCode = evt.code || evt.event_code || "";
    const evtCat = evt.category || "";

    const matchesSearch = searchQuery === "" || 
      evtName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evtCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evtCat.toLowerCase().includes(searchQuery.toLowerCase());

    const status = (evt.status || evt.event_status || "").toLowerCase();
    if (selectedTab === "all") return matchesSearch;
    if (selectedTab === "live") return matchesSearch && ["live", "approved", "active", "published"].includes(status);
    if (selectedTab === "draft") return matchesSearch && ["draft", "pending"].includes(status);
    if (selectedTab === "completed") return matchesSearch && ["completed", "past"].includes(status);
    return matchesSearch;
  });

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
            onClick={() => dispatch(fetchEventsThunk(reduxUser.id || sessionStorage.getItem("userId")))}
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

      {/* ── EVENTS TABLE CONTAINER ── */}
      <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-900">Your Events Portfolio</h2>
            <Badge variant="outline" className="bg-slate-50 text-slate-700 font-bold border-slate-200">
              {filteredEvents.length} Events
            </Badge>
          </div>

          <div className="flex items-center gap-2">
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

        {/* Dynamic Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((evt) => (
            <div key={evt.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 hover:border-cyan-400 transition-all">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200 font-bold">{evt.category || "General"}</Badge>
                <span className="text-[10px] font-extrabold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-full">
                  {evt.status || "Live"}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{evt.name || evt.event_name || "Untitled Event"}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin size={12} className="text-slate-400" />
                  <span>{evt.city || evt.venue || "Chennai, TN"}</span>
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
                <span className="font-bold text-slate-700">₹{evt.price_inr || evt.priceINR || "0"} / ticket</span>
                <Button size="xs" onClick={() => navigate("/OrganizerHome/CreateEvent")} className="bg-slate-900 text-white font-bold text-[11px] rounded-lg cursor-pointer">
                  Manage Event
                </Button>
              </div>
            </div>
          ))}

          {filteredEvents.length === 0 && (
            <div className="col-span-full p-8 text-center text-slate-400 font-semibold text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No events found. Click "Create New Event" to launch your first exhibition.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export { OrganizerDashboardPage as Organizerdashboard };
