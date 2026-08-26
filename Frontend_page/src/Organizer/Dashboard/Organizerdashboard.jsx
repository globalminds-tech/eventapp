import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { getevent } from "@/Services/api";
import {
  Eye, Search, PlusCircle, Calendar, Ticket, IndianRupee, Users,
  QrCode, TrendingUp, Sparkles, MapPin, CheckCircle2, Clock,
  ArrowUpRight, Store, Filter, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

export const Organizerdashboard = () => {
  const navigate = useNavigate();
  const reduxUser = useSelector((state) => state.user);
  
  const organizerName = reduxUser.name || sessionStorage.getItem("name") || localStorage.getItem("name") || "Organizer";
  const organizerCompany = reduxUser.organization_name || sessionStorage.getItem("organization_name") || localStorage.getItem("organization_name") || "";

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");

  // Fallback demo dataset if backend API is not ready
  const fallbackEvents = [
    {
      id: 1,
      code: "EVT-25",
      name: "MRC Grand Music & Cultural Fest 2026",
      category: "Music & Concerts",
      date: "2026-09-15",
      time: "06:00 PM",
      venue: "MRC Center, Chennai",
      status: "Live",
      price: "₹499",
      passesSold: 420,
      totalCapacity: 500,
      banner: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 2,
      code: "EVT-22",
      name: "Valluvar Kottam Craft & Food Expo",
      category: "Expo & Exhibition",
      date: "2026-09-20",
      time: "10:00 AM",
      venue: "Valluvar Kottam Ground",
      status: "Upcoming",
      price: "₹150",
      passesSold: 850,
      totalCapacity: 1200,
      banner: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 3,
      code: "EVT-9",
      name: "Furniture & Home Decor Products Expo",
      category: "Business Expo",
      date: "2026-10-05",
      time: "11:00 AM",
      venue: "Trade Center Hall B",
      status: "Upcoming",
      price: "Free",
      passesSold: 310,
      totalCapacity: 800,
      banner: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 4,
      code: "EVT-12",
      name: "LOGMAT Industrial Logistics Expo 2026",
      category: "Tech & Corporate",
      date: "2026-10-12",
      time: "09:30 AM",
      venue: "Codissia Complex",
      status: "Draft",
      price: "₹999",
      passesSold: 0,
      totalCapacity: 1500,
      banner: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 5,
      code: "EVT-11",
      name: "District Leadership Conference 2026",
      category: "Conference",
      date: "2026-10-25",
      time: "08:00 AM",
      venue: "Grand Palace Auditorium",
      status: "Upcoming",
      price: "₹1,200",
      passesSold: 190,
      totalCapacity: 250,
      banner: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 6,
      code: "EVT-10",
      name: "Global Tech Startup Networking Night",
      category: "Networking",
      date: "2026-11-02",
      time: "07:00 PM",
      venue: "Hyatt Regency Hall",
      status: "Published",
      price: "₹750",
      passesSold: 145,
      totalCapacity: 200,
      banner: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80"
    }
  ];

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await getevent();
      if (res && Array.isArray(res) && res.length > 0) {
        setEvents(res);
      } else {
        setEvents(fallbackEvents);
      }
    } catch {
      setEvents(fallbackEvents);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events based on tab and search query
  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.category && evt.category.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedTab === "all") return matchesSearch;
    if (selectedTab === "live") return matchesSearch && evt.status === "Live";
    if (selectedTab === "upcoming") return matchesSearch && (evt.status === "Upcoming" || evt.status === "Published");
    if (selectedTab === "draft") return matchesSearch && evt.status === "Draft";
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
            onClick={() => navigate("/OrganizerHome/CreateEvent")}
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
              onClick={fetchEvents}
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
              {filteredEvents.length === 0 ? (
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
                        {evt.banner ? (
                          <img
                            src={evt.banner}
                            alt={evt.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
                            {evt.code || "EVT"}
                          </div>
                        )}
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border-indigo-200 px-1.5 py-0">
                              {evt.code}
                            </Badge>
                            {evt.category && (
                              <span className="text-[11px] font-semibold text-slate-400 truncate">
                                {evt.category}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm truncate max-w-xs">
                            {evt.name}
                          </h4>
                        </div>
                      </div>
                    </td>

                    {/* Date & Venue */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                          <Calendar size={13} className="text-slate-400 flex-shrink-0" />
                          <span>{evt.date || "2026-09-15"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                          <span className="truncate max-w-[140px]">{evt.venue || "Venue Setup"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Pricing */}
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {evt.price || "₹499"}
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
                          onClick={() => navigate("/OrganizerHome/CreateEvent")}
                          className="h-8 w-8 p-0 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                          title="View & Edit Event"
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