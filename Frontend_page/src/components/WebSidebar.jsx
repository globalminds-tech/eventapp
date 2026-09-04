import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "@/app/store/userSlice";
import {
  LayoutDashboard, LineChart, PlusCircle,
  QrCode, Utensils, Store, Users, MapPin, Receipt,
  ChevronLeft, ChevronRight, LogOut, Layers, Landmark, CheckCircle2, BarChart3, Calendar, UserCheck, User,
  ArrowLeftRight, Shield, X, ChevronsUpDown, Check, CalendarDays, Building2, Compass, Ticket, Loader2
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

import { performLogout, getUserAvailableRoles, switchWorkspaceRole } from "@/shared/services/authHelper";

export default function WebSidebar({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const reduxAuthUser = useSelector((state) => state.auth?.user);
  const reduxUser = useSelector((state) => state.user);
  const userObj = { ...(reduxAuthUser || {}), ...(reduxUser || {}) };
  const username = userObj.name || sessionStorage.getItem("userName") || "User";
  const profileImage = userObj.profile_image || sessionStorage.getItem("profile_image");
  const availableRoles = getUserAvailableRoles(userObj);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(null);

  const activeRoleKey = (role === "superadmin" || role === "superuser") ? "superuser" : role;
  const isSuperAdmin = activeRoleKey === "superuser" || String(role).toLowerCase() === "superadmin" || String(role).toLowerCase() === "superuser";
  const currentRoleNormalized = String(activeRoleKey || role || "").toLowerCase();
  const switchableRoles = isSuperAdmin ? [] : availableRoles.filter((r) => {
    const rLower = String(r).toLowerCase();
    return !["superuser", "superadmin", "admin"].includes(rLower) && rLower !== currentRoleNormalized;
  });

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
    ],
    organizer: [
      { label: "Dashboard", path: "/OrganizerHome/Organizerdashboard", icon: LayoutDashboard },
      { label: "Gate Scanner", path: "/OrganizerHome/EventCheckIn", icon: QrCode },
      { label: "Food Check-In", path: "/OrganizerHome/FoodCheckIn", icon: Utensils },
      { label: "Manage Stalls", path: "/OrganizerHome/Manage_Stall", icon: Store },
      { label: "Exhibitor Directory", path: "/OrganizerHome/Exhibitor", icon: Users },
      { label: "Team & Roles", path: "/OrganizerHome/TeamManagement", icon: Shield },
      { label: "Billings & Receipts", path: "/OrganizerHome/Receipt", icon: Receipt },
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
        {/* Footer: Logged User Profile Trigger & Workspace Switcher */}
        <div className="relative p-2.5 border-t border-slate-800/80 bg-slate-950/40">
          <div
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className={`flex items-center gap-2.5 p-2 rounded-xl transition-all hover:bg-slate-800/60 cursor-pointer group ${
              isCollapsed ? "justify-center" : ""
            }`}
            title="Account & Workspace Settings"
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
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-slate-100 truncate leading-tight group-hover:text-cyan-300 transition-colors">
                    {username}
                  </h4>
                  <ChevronsUpDown size={13} className="text-slate-400 group-hover:text-cyan-300 transition-colors shrink-0" />
                </div>
                <p className="text-[10px] font-semibold text-slate-400 truncate uppercase tracking-wider mt-0.5">
                  {theme.roleLabel}
                </p>
              </div>
            )}
          </div>

          {/* Sleek Workspace Switcher Popover (Linear / Supabase Style, Zero Emojis) */}
          {showRoleSwitcher && (
            <>
              {/* Clean transparent backdrop to dismiss on outside click */}
              <div
                onClick={() => setShowRoleSwitcher(false)}
                className="fixed inset-0 z-40 bg-transparent"
              />

              <div className="fixed bottom-20 left-3 w-80 z-50 overflow-hidden rounded-2xl border border-slate-700/80 bg-[#0c1322] shadow-2xl ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-150">
                {/* Popover Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 px-3.5 py-2.5 bg-slate-900/40">
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                      Workspaces & Portals
                    </span>
                  </div>
                  <button
                    onClick={() => setShowRoleSwitcher(false)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Current Active Workspace Indicator */}
                <div className="px-3.5 py-2 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-slate-400">Current Portal:</span>
                    <span className="text-[11px] font-bold text-white capitalize">{theme.roleLabel}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                    <Check size={10} className="stroke-[3]" />
                    Active
                  </span>
                </div>

                {/* Portals List (Only other switchable destinations, current portal excluded) */}
                {switchableRoles.length > 0 && (
                  <div className="p-2 space-y-1.5">
                    <div className="px-1.5 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Switch To
                    </div>
                    {switchableRoles.map((r) => {
                      const roleKey = r.toLowerCase();

                      const roleMeta = {
                        organizer: {
                          icon: CalendarDays,
                          title: "Organizer Console",
                          description: "Manage events, ticketing & stalls",
                          iconContainer: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
                        },
                        exhibitor: {
                          icon: Building2,
                          title: "Exhibitor Portal",
                          description: "Book stalls, leads & booth staff",
                          iconContainer: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                        },
                        user: {
                          icon: Compass,
                          title: "Attendee Portal",
                          description: "Explore events, bookings & passes",
                          iconContainer: "bg-violet-500/10 border-violet-500/20 text-violet-400",
                        },
                      }[roleKey] || {
                        icon: User,
                        title: `${r.charAt(0).toUpperCase() + r.slice(1)} Portal`,
                        description: "Access role workspace",
                        iconContainer: "bg-slate-800 border-slate-700 text-slate-300",
                      };

                      const RoleIcon = roleMeta.icon;

                      const isCurrentSwitching = switchingRole === roleKey;

                      return (
                        <div
                          key={roleKey}
                          onClick={async () => {
                            if (switchingRole) return;
                            setSwitchingRole(roleKey);
                            setShowRoleSwitcher(false);
                            await switchWorkspaceRole(roleKey, dispatch, navigate);
                            setSwitchingRole(null);
                          }}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                            isCurrentSwitching
                              ? "border-cyan-500/80 bg-cyan-950/40 text-white"
                              : "border-slate-800/80 bg-slate-900/40 hover:border-cyan-500/50 hover:bg-slate-800/70 text-slate-300 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${roleMeta.iconContainer}`}>
                              {isCurrentSwitching ? (
                                <Loader2 size={16} className="animate-spin text-cyan-400" />
                              ) : (
                                <RoleIcon size={16} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5 group-hover:text-cyan-300 transition-colors">
                                {roleMeta.title}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                {isCurrentSwitching ? "Switching portal..." : roleMeta.description}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 pl-1">
                            {isCurrentSwitching ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400">
                                <Loader2 size={12} className="animate-spin" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                                <span>Switch</span>
                                <ChevronRight size={13} />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Popover Footer: Quick Actions */}
                <div className="p-1.5 border-t border-slate-800/80 bg-slate-950/50 flex flex-col gap-0.5">
                  {!isSuperAdmin && (
                    <button
                      onClick={() => {
                        setShowRoleSwitcher(false);
                        navigate("/profile");
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
                    >
                      <User size={13} className="text-slate-400" />
                      <span>Account Profile & KYC</span>
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      setShowRoleSwitcher(false);
                      handleLogout(e);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition"
                  >
                    <LogOut size={13} className="text-slate-400" />
                    <span>Sign Out</span>
                  </button>
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
