import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "@/app/store/userSlice";
import {
  LayoutDashboard, LineChart, PlusCircle,
  QrCode, Utensils, Store, Users, MapPin, Receipt,
  ChevronLeft, ChevronRight, LogOut, Layers, Landmark, CheckCircle2, BarChart3, Calendar, UserCheck, Home, User
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

import { performLogout } from "@/shared/services/authHelper";

export default function WebSidebar({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const username = useSelector((state) => state.user.name) || sessionStorage.getItem("userName") || "User";
  const profileImage = useSelector((state) => state.user.profile_image) || sessionStorage.getItem("profile_image");

  // Determine theme styling based on the active role
  const theme = {
    superuser: {
      active: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-900/40",
      activeIcon: "text-white",
      inactiveIcon: "text-slate-400 group-hover:text-purple-400",
      hover: "hover:bg-slate-800/80 hover:text-white",
      roleLabel: "Super Admin",
    },
    organizer: {
      active: "bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-bold shadow-md shadow-cyan-500/25",
      activeIcon: "text-white",
      inactiveIcon: "text-slate-400 group-hover:text-cyan-400",
      hover: "hover:bg-slate-800/80 hover:text-white",
      roleLabel: "Organizer",
    },
    exhibitor: {
      active: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-900/40",
      activeIcon: "text-white",
      inactiveIcon: "text-slate-400 group-hover:text-emerald-400",
      hover: "hover:bg-slate-800/80 hover:text-white",
      roleLabel: "Exhibitor",
    }
  }[role] || {
    active: "bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-bold shadow-md shadow-cyan-500/25",
    activeIcon: "text-white",
    inactiveIcon: "text-slate-400 group-hover:text-cyan-400",
    hover: "hover:bg-slate-800/80 hover:text-white",
    roleLabel: "Member",
  };

  const handleLogout = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    performLogout(dispatch, navigate);
  };

  // Determine active state of menu items
  const getIsActive = (path) => {
    const current = location.pathname + location.search;
    if (path.includes("?")) {
      return current === path;
    }
    if (path === "/OrganizerHome/Organizerdashboard") {
      return (
        location.pathname === "/OrganizerHome/Organizerdashboard" ||
        location.pathname === "/OrganizerHome" ||
        location.pathname === "/OrganizerHome/CreateEvent" ||
        location.pathname.startsWith("/OrganizerHome/CreateEvent")
      );
    }
    return location.pathname === path && !location.search;
  };

  // Flat sidebar navigation items without 7-step item (event creation is launched from Dashboard button)
  const navigationItems = {
    superuser: [
      { label: "Overview", path: "/superuser/dashboard", icon: BarChart3 },
      { label: "Approvals Queue", path: "/superuser/approvals", icon: CheckCircle2 },
      { label: "Category Master", path: "/superuser/categories", icon: Layers },
      { label: "KYC Verification", path: "/superuser/kyc", icon: UserCheck },
      { label: "Payouts Queue", path: "/superuser/payouts", icon: Landmark },
      { label: "User Home", path: "/", icon: Home },
    ],
    exhibitor: [
      { label: "Booth Dashboard", path: "/exhibitor/dashboard", icon: LayoutDashboard },
      { label: "My Stall Bookings", path: "/exhibitor/my-bookings", icon: Store },
      { label: "Upcoming Expos", path: "/exhibitor/upcoming-events", icon: Calendar },
      { label: "Visitor Leads & Staff", path: "/exhibitor/leads", icon: Users },
      { label: "User Home", path: "/", icon: Home },
    ],
    organizer: [
      { label: "Dashboard", path: "/OrganizerHome/Organizerdashboard", icon: LayoutDashboard },
      { label: "Gate Scanner", path: "/OrganizerHome/EventCheckIn", icon: QrCode },
      { label: "Food Check-In", path: "/OrganizerHome/FoodCheckIn", icon: Utensils },
      { label: "Manage Stalls", path: "/OrganizerHome/Manage_Stall", icon: Store },
      { label: "Exhibitor Directory", path: "/OrganizerHome/Exhibitor", icon: Users },
      { label: "Billings & Receipts", path: "/OrganizerHome/Receipt", icon: Receipt },
      { label: "User Home", path: "/", icon: Home },
    ]
  }[role] || [];

  const mainDashboardPath = role === "organizer" 
    ? "/OrganizerHome/Organizerdashboard" 
    : role === "superuser" 
    ? "/superuser/dashboard" 
    : "/exhibitor/dashboard";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      
      {/* ── SIDEBAR CONTAINER (Deep Dark Slate #0f172a theme) ── */}
      <aside
        className={`flex flex-col h-full border-r border-slate-800 bg-[#0f172a] text-slate-300 transition-all duration-300 relative select-none z-30 ${
          isCollapsed ? "w-[72px]" : "w-[250px]"
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 w-6 h-6 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all z-50"
        >
          {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>

        {/* Header: Clickable Brand Logo navigating to Main Dashboard */}
        <div
          onClick={() => navigate(mainDashboardPath)}
          className="p-4 py-4 flex items-center justify-between border-b border-slate-800/80 cursor-pointer hover:bg-slate-800/50 transition-colors"
          title="Go to Main Dashboard"
        >
          <BrandLogo isCollapsed={isCollapsed} roleLabel={theme.roleLabel} textColor="text-white" />
        </div>

        {/* Flat Navigation Menu List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar space-y-1.5">
          {navigationItems.map((item, itemIdx) => {
            const Icon = item.icon;
            const isActive = getIsActive(item.path);

            return (
              <button
                key={itemIdx}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs cursor-pointer transition-all border-none bg-transparent group relative ${
                  isCollapsed ? "justify-center px-0" : ""
                } ${
                  isActive
                    ? `${theme.active}`
                    : `text-slate-300 font-semibold ${theme.hover}`
                }`}
              >
                {/* Icon */}
                <Icon
                  size={18}
                  className={`stroke-[2] flex-shrink-0 transition-colors ${
                    isActive ? `${theme.activeIcon}` : `${theme.inactiveIcon}`
                  }`}
                />

                {/* Text Label */}
                {!isCollapsed && (
                  <span
                    className={`truncate leading-snug py-0.5 ${
                      isActive ? "text-white font-bold" : "text-slate-300 font-semibold"
                    }`}
                  >
                    {item.label}
                  </span>
                )}

                {/* Hover Tooltip when Sidebar is Collapsed */}
                {isCollapsed && (
                  <div className="fixed left-16 bg-slate-950 text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 whitespace-nowrap flex items-center gap-1.5 border border-slate-800">
                    <span>{item.label}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer: Logged User Profile Trigger */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div
            onClick={() => navigate("/profile")}
            className={`flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-800/60 transition-all cursor-pointer group ${isCollapsed ? "justify-center" : ""}`}
            title="Account Overview & Workspaces"
          >
            {/* User Profile Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md overflow-hidden group-hover:scale-105 transition-transform">
                {profileImage ? (
                  <img src={profileImage} alt="User Avatar" className="w-full h-full object-cover" />
                ) : (
                  username.charAt(0).toUpperCase()
                )}
              </div>
              {/* Notification Badge Dot */}
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-[#0f172a] animate-pulse" />
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-100 truncate leading-tight group-hover:text-cyan-300 transition-colors">
                  {username}
                </h4>
                <p className="text-[10px] font-semibold text-slate-400 truncate uppercase tracking-wider mt-0.5">
                  {theme.roleLabel}
                </p>
              </div>
            )}
          </div>
        </div>

      </aside>

      {/* ── MAIN CONTENT CONTAINER (FULL CANVAS VIEWPORT) ── */}
      <main className="flex-1 h-full overflow-hidden flex flex-col bg-[#f8fafc]">
        {/* Child Router Viewport */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col h-full">
          <Outlet />
        </div>
      </main>

    </div>
  );
}
