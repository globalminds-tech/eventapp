import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "@/app/store/userSlice";
import {
  LayoutDashboard, LineChart, PlusCircle,
  QrCode, Utensils, Store, Users, MapPin, Receipt,
  ChevronLeft, ChevronRight, LogOut, Layers, Landmark, CheckCircle2, BarChart3, Calendar, UserCheck, Home, User,
  ArrowLeftRight, Shield, X
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

import { performLogout, getUserAvailableRoles, switchWorkspaceRole } from "@/shared/services/authHelper";

export default function WebSidebar({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const username = useSelector((state) => state.user.name) || sessionStorage.getItem("userName") || "User";
  const profileImage = useSelector((state) => state.user.profile_image) || sessionStorage.getItem("profile_image");
  const userObj = useSelector((state) => state.user);
  const availableRoles = getUserAvailableRoles(userObj);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const activeRoleKey = (role === "superadmin" || role === "superuser") ? "superuser" : role;
  const isSuperAdmin = activeRoleKey === "superuser" || String(role).toLowerCase() === "superadmin" || String(role).toLowerCase() === "superuser";
  const switchableRoles = availableRoles.filter(
    (r) => !["superuser", "superadmin", "admin"].includes(String(r).toLowerCase())
  );

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
  }[activeRoleKey] || {
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
      { label: "Team & Roles", path: "/OrganizerHome/TeamManagement", icon: Shield },
      { label: "Billings & Receipts", path: "/OrganizerHome/Receipt", icon: Receipt },
      { label: "User Home", path: "/", icon: Home },
    ]
  }[activeRoleKey] || [];

  const mainDashboardPath = activeRoleKey === "organizer" 
    ? "/OrganizerHome/Organizerdashboard" 
    : activeRoleKey === "superuser" 
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

        {/* Footer: Logged User Profile Trigger & Logout */}
        <div className="relative p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div
            onClick={() => {
              if (!isSuperAdmin) {
                navigate("/profile");
              }
            }}
            className={`flex items-center gap-3 p-1.5 rounded-xl transition-all ${
              isSuperAdmin
                ? "cursor-default"
                : "hover:bg-slate-800/60 cursor-pointer group"
            } ${isCollapsed ? "justify-center" : ""}`}
            title={isSuperAdmin ? "Super Administrator" : "Account Overview & Workspaces"}
          >
            {/* User Profile Avatar */}
            <div className="relative flex-shrink-0">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-md overflow-hidden group-hover:scale-105 transition-transform ${
                activeRoleKey === "superuser"
                  ? "bg-gradient-to-br from-purple-600 via-indigo-600 to-slate-900 text-white border border-purple-400/30"
                  : "bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 text-white"
              }`}>
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
                <div className="flex items-center justify-between gap-1 mt-0.5">
                  <p className="text-[10px] font-semibold text-slate-400 truncate uppercase tracking-wider">
                    {theme.roleLabel}
                  </p>
                  {!isSuperAdmin && switchableRoles.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowRoleSwitcher(!showRoleSwitcher);
                      }}
                      className="text-[10px] flex items-center gap-1 text-cyan-300 hover:text-white bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 px-2 py-0.5 rounded-lg shadow-xs transition"
                      title="Switch Workspace Role"
                    >
                      <ArrowLeftRight size={11} />
                      <span className="font-bold">Switch</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Sign Out Action Button in Sidebar */}
          <div className="mt-2 pt-2 border-t border-slate-800/60">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition group ${
                isCollapsed ? "justify-center px-0" : ""
              }`}
              title="Sign Out"
            >
              <LogOut size={15} className="text-slate-400 group-hover:text-red-400 transition" />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          </div>

          {/* Premium Workspace Switcher Modal / Flyout */}
          {!isSuperAdmin && showRoleSwitcher && switchableRoles.length > 1 && (
            <>
              {/* Subtle backdrop overlay to dismiss */}
              <div
                onClick={() => setShowRoleSwitcher(false)}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs"
              />

              <div className="fixed bottom-20 left-4 w-84 z-50 overflow-hidden rounded-2xl border border-slate-700/90 bg-slate-900/95 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-950/60">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                      <ArrowLeftRight className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">Switch Workspace</h3>
                      <p className="text-[10px] text-slate-400">Select your active role</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRoleSwitcher(false)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Role Options Cards */}
                <div className="p-3 space-y-2">
                  {switchableRoles.map((r) => {
                    const roleKey = r.toLowerCase();
                    const isActive = (role || "").toLowerCase() === roleKey;

                    const roleMeta = {
                      organizer: {
                        icon: "🎪",
                        title: "Organizer Portal",
                        description: "Manage events, ticketing & stalls",
                        gradient: "from-cyan-500/20 to-blue-600/20 border-cyan-500/40 text-cyan-300",
                        activeBadge: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
                      },
                      exhibitor: {
                        icon: "🏢",
                        title: "Exhibitor Portal",
                        description: "Book stalls, booth staff & leads",
                        gradient: "from-emerald-500/20 to-teal-600/20 border-emerald-500/40 text-emerald-300",
                        activeBadge: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
                      },
                      user: {
                        icon: "🎟️",
                        title: "Attendee Portal",
                        description: "Explore events & access passes",
                        gradient: "from-purple-500/20 to-indigo-600/20 border-purple-500/40 text-purple-300",
                        activeBadge: "bg-purple-500/20 text-purple-300 border-purple-400/40",
                      },
                    }[roleKey] || {
                      icon: "👤",
                      title: `${r} Portal`,
                      description: "Access account portal",
                      gradient: "from-slate-700/40 to-slate-800/40 border-slate-600 text-white",
                      activeBadge: "bg-slate-800 text-slate-300 border-slate-700",
                    };

                    return (
                      <div
                        key={roleKey}
                        onClick={() => {
                          if (!isActive) {
                            setShowRoleSwitcher(false);
                            switchWorkspaceRole(roleKey, dispatch, navigate);
                          }
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isActive
                            ? "border-cyan-500/60 bg-cyan-950/40 shadow-sm"
                            : "border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xl shrink-0">{roleMeta.icon}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              {roleMeta.title}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {roleMeta.description}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300">
                              Switch →
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
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
