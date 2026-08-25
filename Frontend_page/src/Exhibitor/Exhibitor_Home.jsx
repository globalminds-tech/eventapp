import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  User,
  Users,
  TrendingUp,
  CheckCircle,
  Building,
  QrCode,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Store,
  Layers,
  MapPin,
  ClipboardList
} from "lucide-react";

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

const ExhibitorHome = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const location = useLocation();
  const [showToast, setShowToast] = useState(false);

  // Store user in session (fallback)
  useEffect(() => {
    if (user?.id && user?.name) {
      sessionStorage.setItem("userId", user.id);
      sessionStorage.setItem("userName", user.name);
    }
  }, [user]);

  useEffect(() => {
    if (location.state?.fromLogin) {
      setShowToast(true);
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const storedUser = {
    id: sessionStorage.getItem("userId"),
    name: sessionStorage.getItem("userName"),
  };

  const displayUser = user?.id ? user : storedUser;

  return (
    <div className="text-slate-800 flex flex-col font-sans antialiased pb-8">
      
      {/* 🟢 Dark Emerald Green Governance Banner Card */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white p-6 md:p-8 rounded-3xl shadow-lg mt-2">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase">Exhibitor Panel</h2>
            <p className="text-[#a7f3d0] font-bold text-[11px] tracking-wider mt-1.5 uppercase">
              Booth Reservations & Visitor Lead Intelligence
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex gap-6 items-center border border-white/15">
              <div>
                <p className="text-[10px] text-[#a7f3d0] font-bold uppercase tracking-wider">Total Leads</p>
                <h3 className="text-lg md:text-xl font-black text-white mt-0.5">428</h3>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div>
                <p className="text-[10px] text-[#a7f3d0] font-bold uppercase tracking-wider">Hot Leads</p>
                <h3 className="text-lg md:text-xl font-black text-white mt-0.5">86 🔥</h3>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div>
                <p className="text-[10px] text-[#a7f3d0] font-bold uppercase tracking-wider">Active Booths</p>
                <h3 className="text-lg md:text-xl font-black text-white mt-0.5">4 Stalls</h3>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* 🚀 Main Interface Area */}
      <div className="max-w-7xl w-full mx-auto px-6 md:px-12 py-10 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Quick Actions & Booth Info (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Welcome User Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm flex flex-col gap-3">
            <h4 className="font-extrabold text-slate-800 text-base">Welcome Back, Exhibitor!</h4>
            <p className="text-slate-500 text-sm">
              Hello, <span className="font-bold text-[#065f46]">{displayUser.name || "User"}</span>
            </p>
            <p className="text-slate-400 text-xs mt-1">Manage and trace your on-site booth reservations, scanner staff configuration, and buyers lead logs.</p>
          </div>

          {/* Quick Shortcuts */}
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 mb-4">Exhibitor Menu</h3>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/ExhibitorHome/Stall_Booking")}
                className="w-full p-4 flex items-center justify-between bg-white border border-slate-150 rounded-2xl hover:border-emerald-300 hover:bg-emerald-50 group transition-all text-left"
              >
                <div className="flex items-center gap-4 text-slate-700 font-bold text-sm group-hover:text-emerald-700">
                  <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-emerald-100 transition-colors">
                    <Store size={18} />
                  </div>
                  Book Stall Space
                </div>
                <ArrowUpRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-all" />
              </button>

              <button
                onClick={() => navigate("/ExhibitorHome/Mybooking")}
                className="w-full p-4 flex items-center justify-between bg-white border border-slate-150 rounded-2xl hover:border-emerald-300 hover:bg-emerald-50 group transition-all text-left"
              >
                <div className="flex items-center gap-4 text-slate-700 font-bold text-sm group-hover:text-emerald-700">
                  <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-emerald-100 transition-colors">
                    <ClipboardList size={18} />
                  </div>
                  My Booth Bookings
                </div>
                <ArrowUpRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-all" />
              </button>

              <button
                onClick={() => navigate("/ExhibitorHome/UpcomingEvent")}
                className="w-full p-4 flex items-center justify-between bg-white border border-slate-150 rounded-2xl hover:border-emerald-300 hover:bg-emerald-50 group transition-all text-left"
              >
                <div className="flex items-center gap-4 text-slate-700 font-bold text-sm group-hover:text-emerald-700">
                  <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-emerald-100 transition-colors">
                    <Calendar size={18} />
                  </div>
                  Upcoming Expos
                </div>
                <ArrowUpRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-all" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Dashboard (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Requires Your Attention */}
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2">
              <span>Requires Your Attention</span>
              <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-bold">
                Hot Actions
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="bg-white rounded-3xl p-6 border-l-[5px] border-l-sky-500 border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between h-36">
                <div>
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-slate-800 text-sm">Spot Visitor</h4>
                    <span className="bg-sky-50 text-sky-600 text-[10px] px-2 py-0.5 rounded-full font-black border border-sky-100">
                      NEW
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1.5 font-medium">Quickly register walk-in booth visitors and scan passes on site.</p>
                </div>
                <div className="flex items-center gap-1.5 text-sky-600 font-bold text-xs cursor-pointer">
                  <span>Add Lead</span>
                  <ArrowUpRight size={13} className="stroke-[2.5]" />
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border-l-[5px] border-l-[#ea580c] border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between h-36">
                <div>
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-slate-800 text-sm">Hot Leads</h4>
                    <span className="bg-orange-50 text-[#ea580c] text-[10px] px-2 py-0.5 rounded-full font-black border border-orange-100">
                      86 🔥
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1.5 font-medium">High intent buyers with detailed inquiries awaiting follow-up.</p>
                </div>
                <div className="flex items-center gap-1.5 text-[#ea580c] font-bold text-xs cursor-pointer">
                  <span>Follow Up</span>
                  <ArrowUpRight size={13} className="stroke-[2.5]" />
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border-l-[5px] border-l-emerald-500 border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between h-36">
                <div>
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-slate-800 text-sm">Staff Passes</h4>
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full font-black border border-emerald-100">
                      8 ACTIVE
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1.5 font-medium">Booth access helper passes issues. QR tags are active.</p>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs cursor-pointer">
                  <span>View Passes</span>
                  <ArrowUpRight size={13} className="stroke-[2.5]" />
                </div>
              </div>

              <div
                onClick={() => navigate("/ExhibitorHome/Stall_Booking")}
                className="bg-white rounded-3xl p-6 border-l-[5px] border-l-purple-500 border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between h-36"
              >
                <div>
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-slate-800 text-sm">Stall Space</h4>
                    <span className="bg-purple-50 text-purple-600 text-[10px] px-2 py-0.5 rounded-full font-black border border-purple-100">
                      2 EXPOS
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1.5 font-medium">Floor layout plans are open for reservation in 2 upcoming events.</p>
                </div>
                <div className="flex items-center gap-1.5 text-purple-600 font-bold text-xs">
                  <span>Book Stall</span>
                  <ArrowUpRight size={13} className="stroke-[2.5]" />
                </div>
              </div>

            </div>
          </div>

          {/* Exhibitor Key Performance Indicators */}
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 mb-4">Exhibitor Key Performance Indicators</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-500 text-xs">TOTAL LEADS</span>
                  <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Users size={14} className="stroke-[2.5]" />
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="text-xl font-black text-slate-900">428</h4>
                  <p className="text-emerald-600 text-[10px] font-bold mt-0.5">↑ 34.6% lead conversion</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-500 text-xs">HOT LEADS</span>
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#ea580c] flex items-center justify-center">
                    <TrendingUp size={14} className="stroke-[2.5]" />
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="text-xl font-black text-slate-900">86</h4>
                  <p className="text-slate-400 text-[10px] font-bold mt-0.5">High intent buyers</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-500 text-xs">QUALIFIED</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle size={14} className="stroke-[2.5]" />
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="text-xl font-black text-slate-900">186</h4>
                  <p className="text-slate-400 text-[10px] font-bold mt-0.5">Verified booth inquiries</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-500 text-xs">ACTIVE STALLS</span>
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Store size={14} className="stroke-[2.5]" />
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="text-xl font-black text-slate-900">4</h4>
                  <p className="text-slate-400 text-[10px] font-bold mt-0.5">Booked exhibition spaces</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-500 text-xs">STAFF PASSES</span>
                  <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                    <QrCode size={14} className="stroke-[2.5]" />
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="text-xl font-black text-slate-900">8</h4>
                  <p className="text-slate-400 text-[10px] font-bold mt-0.5">Active QR passes issued</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-500 text-xs">STALL SPEND</span>
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <DollarSign size={14} className="stroke-[2.5]" />
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="text-xl font-black text-slate-900">₹2.8L</h4>
                  <p className="text-slate-400 text-[10px] font-bold mt-0.5">Total layout investment</p>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[999] bg-[#065f46] border border-emerald-500 text-white shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</div>
          <span className="font-bold text-sm">Logged in successfully!</span>
        </div>
      )}

    </div>
  );
};

export default ExhibitorHome;