import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Calendar,
  CheckCircle,
  Clock,
  PlusCircle,
  Settings,
  ArrowRight,
  Ticket,
  Layout,
  TrendingUp,
  Users,
  X,
  User,
  ArrowUpRight,
  ShieldCheck,
  UserCheck,
  Landmark,
  ShieldX,
  TrendingDown,
  Activity,
  AlertCircle
} from "lucide-react";
import { getEventshow } from "../Services/api";

const BrandLogo = () => (
  <div className="flex items-center gap-2">
    <div className="flex items-center gap-0.5">
      <div className="w-2.5 h-7 bg-[#3b82f6] rounded-full transform -rotate-12"></div>
      <div className="w-2.5 h-7 bg-[#f97316] rounded-full transform rotate-6"></div>
      <div className="w-2.5 h-7 bg-[#10b981] rounded-full transform -rotate-6"></div>
    </div>
    <span className="text-2xl font-black text-white tracking-tight">BookMyEvent</span>
  </div>
);

export const OrganizerWelcome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [showToast, setShowToast] = useState(false);

  const Redexorganizer = useSelector((state) => state.user);
  const storedUser = {
    id: sessionStorage.getItem("userId"),
    name: sessionStorage.getItem("userName"),
  };
  const organizer = Redexorganizer?.id ? Redexorganizer : storedUser;

  useEffect(() => {
    if (organizer?.id) {
      fetchEvents();
    }
    if (location.state?.fromLogin) {
      setShowToast(true);
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [organizer?.id, location.state]);

  const fetchEvents = async () => {
    if (!organizer?.id) return;
    try {
      const data = await getEventshow(organizer.id);
      setEvents(data);
    } catch (err) {
      console.error(err);
    }
  };

  const totalEvents = events.length || 6;
  const approvedEvents = events.filter(e => e.status === "APPROVED" || e.status === "APPROVED").length;
  const pendingEvents = events.filter(e => e.status === "PENDING" || e.status === "Pending").length;

  const quickActions = [
    { name: "Create New Event", icon: <PlusCircle size={18} />, path: "/OrganizerHome/CreateEvent" },
    { name: "Manage Venues", icon: <Settings size={18} />, path: "/OrganizerHome/Venu" },
    { name: "Ticketing & Passes", icon: <Ticket size={18} />, path: "/OrganizerHome/BulkPassPage" },
  ];

  return (
    <div className="text-slate-800 flex flex-col font-sans antialiased pb-8">
      
      {/* 🍊 Vibrant Orange Governance Banner Card */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 md:p-8 rounded-3xl shadow-lg mt-2">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase">Organizer Console</h2>
            <p className="text-[#ffedd5] font-bold text-[11px] tracking-wider mt-1.5 uppercase">
              Production Host & Live Operations Command
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex gap-6 items-center border border-white/15">
              <div>
                <p className="text-[10px] text-[#fed7aa] font-bold uppercase tracking-wider">Gross Revenue</p>
                <h3 className="text-lg md:text-xl font-black text-white mt-0.5">₹12.8L</h3>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div>
                <p className="text-[10px] text-[#fed7aa] font-bold uppercase tracking-wider">Tickets Sold</p>
                <h3 className="text-lg md:text-xl font-black text-white mt-0.5">4,820</h3>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div>
                <p className="text-[10px] text-[#fed7aa] font-bold uppercase tracking-wider">Occupancy</p>
                <h3 className="text-lg md:text-xl font-black text-white mt-0.5">80.3%</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 Main Interface Area */}
      <div className="max-w-7xl w-full mx-auto px-6 md:px-12 py-10 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Quick Actions & Recent Activity (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Quick Actions Panel */}
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 mb-4">Quick Shortcuts</h3>
            <div className="flex flex-col gap-3">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => navigate(action.path)}
                  className="w-full p-4 flex items-center justify-between bg-white border border-slate-150 rounded-2xl hover:border-orange-300 hover:bg-orange-50 group transition-all"
                >
                  <div className="flex items-center gap-4 text-slate-700 font-bold text-sm group-hover:text-orange-700">
                    <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-orange-100 transition-colors">
                      {action.icon}
                    </div>
                    {action.name}
                  </div>
                  <ArrowRight size={18} className="text-slate-300 group-hover:text-orange-500 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Recent Events Listings */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-extrabold text-slate-800">Your Productions</h3>
              <button
                onClick={() => navigate("/OrganizerHome/Organizerdashboard")}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 transition"
              >
                View Dashboard
              </button>
            </div>
            
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden divide-y divide-slate-100 shadow-sm">
              {events.slice(0, 3).map((e, i) => (
                <div key={i} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition cursor-pointer">
                  <div
                    className="w-11 h-11 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold border-2 border-white shadow-sm overflow-hidden bg-cover bg-center"
                    style={{ backgroundImage: e.banner_url ? `url(${e.banner_url})` : "none" }}
                  >
                    {!e.banner_url && (i + 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-slate-800 text-sm truncate">{e.event_name}</h4>
                    <p className="text-slate-400 text-xs truncate mt-0.5">{e.venue || "TBA Venue"}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase ${
                    e.status === "APPROVED" || e.status === "LIVE"
                      ? "bg-green-50 text-green-700 border border-green-100"
                      : "bg-orange-50 text-orange-700 border border-orange-100"
                  }`}>
                    {e.status || "PENDING"}
                  </span>
                </div>
              ))}
              {events.length === 0 && (
                <div className="p-8 text-center text-sm font-semibold text-slate-400">
                  No productions configured. Create an event to begin.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Dashboard Layout (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Needs Your Attention */}
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2">
              <span>Needs Your Attention</span>
              <span className="bg-orange-100 text-orange-700 text-xs px-2.5 py-1 rounded-full font-bold">
                3 Action Items
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div
                onClick={() => navigate("/profile")}
                className="bg-white rounded-3xl p-6 border-l-[5px] border-l-orange-500 border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between h-36"
              >
                <div>
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-slate-800 text-sm">Account KYC</h4>
                    <span className="bg-orange-50 text-orange-600 text-[10px] px-2 py-0.5 rounded-full font-black border border-orange-100">
                      ACTION
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1.5 font-medium">Submit host banking details for settlement setup.</p>
                </div>
                <div className="flex items-center gap-1.5 text-orange-600 font-bold text-xs">
                  <span>Complete KYC</span>
                  <ArrowUpRight size={13} className="stroke-[2.5]" />
                </div>
              </div>

              <div
                onClick={() => navigate("/OrganizerHome/BulkPassPage")}
                className="bg-white rounded-3xl p-6 border-l-[5px] border-l-red-500 border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between h-36"
              >
                <div>
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-slate-800 text-sm">VIP Tickets</h4>
                    <span className="bg-red-50 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-black border border-red-100">
                      96% SOLD
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1.5 font-medium">482 / 500 premium tickets sold. Tier adjust suggested.</p>
                </div>
                <div className="flex items-center gap-1.5 text-red-600 font-bold text-xs">
                  <span>Manage Tiers</span>
                  <ArrowUpRight size={13} className="stroke-[2.5]" />
                </div>
              </div>

              <div
                onClick={() => navigate("/OrganizerHome/Organizerdashboard")}
                className="bg-white rounded-3xl p-6 border-l-[5px] border-l-purple-500 border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between h-36"
              >
                <div>
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-slate-800 text-sm">Gate Staff</h4>
                    <span className="bg-purple-50 text-purple-600 text-[10px] px-2 py-0.5 rounded-full font-black border border-purple-100">
                      2 UNASSIGNED
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1.5 font-medium">Main entrance scanners require staff assignment.</p>
                </div>
                <div className="flex items-center gap-1.5 text-purple-600 font-bold text-xs">
                  <span>Assign Staff</span>
                  <ArrowUpRight size={13} className="stroke-[2.5]" />
                </div>
              </div>

              <div
                onClick={() => navigate("/OrganizerHome/livedashfoodboard")}
                className="bg-white rounded-3xl p-6 border-l-[5px] border-l-emerald-500 border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between h-36"
              >
                <div>
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-slate-800 text-sm">Food Passes</h4>
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full font-black border border-emerald-100">
                      LUNCH READY
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1.5 font-medium">2,940 VIP meal vouchers served. Scans operational.</p>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                  <span>Food Scan</span>
                  <ArrowUpRight size={13} className="stroke-[2.5]" />
                </div>
              </div>

            </div>
          </div>

          {/* Event Key Performance Indicators */}
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 mb-4">Event Key Performance Indicators</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-500 text-xs">TOTAL REVENUE</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp size={14} className="stroke-[2.5]" />
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="text-xl font-black text-slate-900">₹12.8L</h4>
                  <p className="text-slate-400 text-[10px] font-bold mt-0.5">Gross ticket sales</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-500 text-xs">TICKETS SOLD</span>
                  <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Ticket size={14} className="stroke-[2.5]" />
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="text-xl font-black text-slate-900">4,820</h4>
                  <p className="text-slate-400 text-[10px] font-bold mt-0.5">Out of 6,000 capacity</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-500 text-xs">OCCUPANCY</span>
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                    <Activity size={14} className="stroke-[2.5]" />
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="text-xl font-black text-slate-900">80.3%</h4>
                  <p className="text-orange-600 text-[10px] font-bold mt-0.5">High ticket demand</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-500 text-xs">CHECKED IN</span>
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <UserCheck size={14} className="stroke-[2.5]" />
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="text-xl font-black text-slate-900">3,842</h4>
                  <p className="text-purple-600 text-[10px] font-bold mt-0.5">79.7% gate attendance</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-500 text-xs">UPCOMING EVENTS</span>
                  <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                    <Calendar size={14} className="stroke-[2.5]" />
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="text-xl font-black text-slate-900">{totalEvents}</h4>
                  <p className="text-slate-400 text-[10px] font-bold mt-0.5">1 live production</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-500 text-xs">PENDING PAYOUT</span>
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Landmark size={14} className="stroke-[2.5]" />
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="text-xl font-black text-slate-900">₹3.2L</h4>
                  <p className="text-slate-400 text-[10px] font-bold mt-0.5">Awaiting settlement</p>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[999] bg-[#ea580c] border border-orange-500 text-white shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</div>
          <span className="font-bold text-sm">Logged in successfully!</span>
        </div>
      )}

    </div>
  );
};
