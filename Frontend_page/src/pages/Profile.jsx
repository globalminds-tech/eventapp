import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HelpCircle, Gift, Tag, CreditCard, Utensils,
  Home, Settings, Shield, Share2, ThumbsUp,
  FileText, User, X, LogOut, ChevronRight, Edit3,
  ArrowLeft, Info
} from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [showDevRoleModal, setShowDevRoleModal] = useState(false);
  const [userName, setUserName] = useState("Sneha");

  useEffect(() => {
    const storedName = localStorage.getItem("name") || sessionStorage.getItem("name");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("name");
    navigate("/Login");
  };

  const handleRoleSwitch = (role, targetRoute) => {
    if (role === "public") {
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("token");
    } else {
      sessionStorage.setItem("role", role);
      sessionStorage.setItem("token", "dev-token-session");
      localStorage.setItem("role", role);
      localStorage.setItem("token", "dev-token-session");
    }
    setShowDevRoleModal(false);
    navigate(targetRoute);
  };

  const menuGroup1 = [
    { title: "Help Centre", icon: HelpCircle, path: "/Help_Center" },
    { title: "Rewards", icon: Gift, path: null },
    { title: "Offers", icon: Tag, path: null },
    { title: "Gift Cards", icon: CreditCard, path: null },
    { title: "Food & Beverages", icon: Utensils, path: null },
  ];

  const menuGroup2 = [
    { title: "Partner with Us (List Show / Book Booth)", icon: Home, isHighlight: true, path: "/OrganizerHome" },
    { title: "Account & Profile Settings", icon: Settings, path: null },
    { title: "⚡ Developer Role Switcher", icon: Shield, action: () => setShowDevRoleModal(true) },
  ];

  const menuGroup3 = [
    { title: "Share", icon: Share2, action: () => alert("Sharing BookMyEvent link...") },
    { title: "Rate Us", icon: ThumbsUp, action: () => alert("Thank you for rating us 5 stars!") },
    { title: "Terms & Conditions", icon: FileText, path: "/Terms" },
    { title: "Privacy Policy", icon: Shield, path: "/Cancellation" },
  ];

  const handleRowClick = (item) => {
    if (item.action) {
      item.action();
      
    } else if (item.path) {
      navigate(item.path);
    } else {
      alert(`${item.title} feature coming soon!`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans pb-12 select-none">
      
      {/* Sleek Web-Style Top Header Navbar */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer border-none bg-transparent font-bold text-xs"
            >
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </button>
            <div className="w-px h-6 bg-slate-200" />
            <h1 className="text-base font-black text-slate-900 uppercase tracking-wider">Account Control Panel</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-extrabold text-xs rounded-xl cursor-pointer bg-transparent transition-all shadow-sm"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="max-w-6xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Profile Identity Card (lg:col-span-4) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col items-center text-center">
            
            {/* Large Avatar container with premium glow */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-600 p-1 shadow-lg flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-slate-700">
                  <User size={48} className="stroke-[1.5]" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border border-slate-100 shadow-md flex items-center justify-center text-slate-500 cursor-pointer hover:text-indigo-600 transition">
                <Edit3 size={14} />
              </div>
            </div>

            <h2 className="text-2xl font-black text-slate-900 mt-5 leading-none">{userName}</h2>
            <p className="text-[#be123c] font-bold text-xs uppercase tracking-widest mt-2 px-3 py-1 bg-[#be123c]/5 rounded-full">
              Platform Member
            </p>

            <div className="w-full h-px bg-slate-100 my-6" />

            {/* Quick summary points */}
            <div className="w-full flex justify-around text-center gap-2">
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase">Bookings</span>
                <span className="text-lg font-black text-slate-800">12</span>
              </div>
              <div className="w-px h-8 bg-slate-100" />
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase">Rewards</span>
                <span className="text-lg font-black text-slate-800">4</span>
              </div>
              <div className="w-px h-8 bg-slate-100" />
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase">Stalls</span>
                <span className="text-lg font-black text-slate-800">2</span>
              </div>
            </div>
          </div>

          {/* Quick Support / Feedback box */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-950 text-white rounded-[2rem] p-6 shadow-md">
            <h3 className="font-extrabold text-[15px] mb-2 flex items-center gap-2">
              <Info size={16} className="text-indigo-400" />
              Need Assistance?
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              If you have questions regarding event check-ins, ticketing payouts, or vendor assignments, reach out to our dedicated support.
            </p>
            <button
              onClick={() => navigate("/Help_Center")}
              className="mt-4 w-full py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl border border-white/10 transition cursor-pointer"
            >
              Contact Support
            </button>
          </div>
        </section>

        {/* Right Side: Options Grid (lg:col-span-8) */}
        <section className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Quick Actions (Partner, Switching) */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
              Role switches & Partners
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuGroup2.map((item, i) => {
                const Icon = item.icon;
                const isSwitcher = item.title.includes("Switcher");
                return (
                  <div
                    key={i}
                    onClick={() => handleRowClick(item)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                      isSwitcher 
                        ? "border-[#7c3aed]/20 bg-[#f5f3ff] hover:bg-[#ede9fe] shadow-sm animate-pulse"
                        : item.isHighlight
                          ? "border-rose-100 bg-rose-50 hover:bg-rose-100/70"
                          : "border-slate-100 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSwitcher
                        ? "bg-[#7c3aed]/10 text-[#7c3aed]"
                        : item.isHighlight
                          ? "bg-rose-100 text-rose-600"
                          : "bg-slate-100 text-slate-600"
                    }`}>
                      <Icon size={18} className="stroke-[2.2]" />
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-sm font-extrabold ${
                        isSwitcher
                          ? "text-[#7c3aed]"
                          : item.isHighlight
                            ? "text-rose-700"
                            : "text-slate-800"
                      }`}>{item.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {isSwitcher ? "Access switchboard" : "Manage operations"}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-slate-400" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Account Services */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
              Account services
            </h3>
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
              {menuGroup1.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    onClick={() => handleRowClick(item)}
                    className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center">
                      <Icon size={16} />
                    </div>
                    <span className="flex-1 text-sm font-bold text-slate-700">{item.title}</span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legal & Sharing */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
              Application & Policies
            </h3>
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
              {menuGroup3.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    onClick={() => handleRowClick(item)}
                    className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center">
                      <Icon size={16} />
                    </div>
                    <span className="flex-1 text-sm font-bold text-slate-700">{item.title}</span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </div>
                );
              })}
            </div>
          </div>

        </section>
      </main>

      {/* Developer Role Switcher Modal (Bottom Sheet style) */}
      {showDevRoleModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end animate-fadeIn">
          <div className="absolute inset-0 z-0" onClick={() => setShowDevRoleModal(false)} />
          
          <div className="bg-white rounded-t-[32px] p-6 max-h-[85vh] overflow-y-auto relative z-10 shadow-2xl border-t border-slate-100 flex flex-col gap-4 animate-slideUp max-w-2xl mx-auto w-full">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                ⚡ Developer Role Switcher Hub
              </span>
              <button
                onClick={() => setShowDevRoleModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full cursor-pointer text-slate-500 hover:text-black border-none bg-transparent"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-3.5 my-2">
              <div
                onClick={() => handleRoleSwitch("superuser", "/superuser/dashboard")}
                className="p-4 rounded-2xl border-2 border-[#8b5cf6] bg-[#f5f3ff] hover:bg-[#ede9fe] cursor-pointer transition-colors"
              >
                <h4 className="font-extrabold text-[#7c3aed] text-[15px] mb-1">👑 Super Admin Portal</h4>
                <p className="text-xs text-[#6d28d9] leading-relaxed">Category Master, Event Approvals Queue, Platform Payouts</p>
              </div>

              <div
                onClick={() => handleRoleSwitch("organizer", "/OrganizerHome")}
                className="p-4 rounded-2xl border-2 border-[#0284c7] bg-[#f0f9ff] hover:bg-[#e0f2fe] cursor-pointer transition-colors"
              >
                <h4 className="font-extrabold text-[#0369a1] text-[15px] mb-1">🎪 Organizer Command Center</h4>
                <p className="text-xs text-[#0369a1] leading-relaxed">7-Step Event Wizard, Live Gate Scanners, Live Sales Analytics</p>
              </div>

              <div
                onClick={() => handleRoleSwitch("exhibitor", "/exhibitor/dashboard")}
                className="p-4 rounded-2xl border-2 border-[#10b981] bg-[#ecfdf5] hover:bg-[#d1fae5] cursor-pointer transition-colors"
              >
                <h4 className="font-extrabold text-[#047857] text-[15px] mb-1">🏬 Exhibitor Portal</h4>
                <p className="text-xs text-[#047857] leading-relaxed">Stall Discovery, Floor Plan Booth Booking, Lead Capture</p>
              </div>

              <div
                onClick={() => handleRoleSwitch("public", "/")}
                className="p-4 rounded-2xl border-2 border-[#f97316] bg-[#fff7ed] hover:bg-[#ffedd5] cursor-pointer transition-colors"
              >
                <h4 className="font-extrabold text-[#c2410c] text-[15px] mb-1">🎟️ Public / Attendee View</h4>
                <p className="text-xs text-[#c2410c] leading-relaxed">Category Event Discovery, Ticket Booking, QR Passes</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
