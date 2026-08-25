import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../Redux/userSlice";
import {
  LayoutDashboard, Utensils, LineChart, PlusCircle,
  Ticket, CheckSquare, Tag, Key, ClipboardList,
  QrCode, Milestone, Calendar, UserCheck, ShieldAlert,
  Users, FileText, Shield, UserCog, Store, FilePlus,
  FileLock, MapPin, Truck, Gift, Receipt, BarChart, Check,
  ChevronLeft, ChevronRight, LogOut, Search, Settings, User,
  Building, HelpCircle, Layers, Landmark, CheckCircle2, BarChart3
} from "lucide-react";

export default function WebSidebar({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openGroups, setOpenGroups] = useState({
    dashboards: true,
    wizard: false,
    scanners: false,
    programs: false,
    directories: false,
    master: false,
    billing: false
  });

  const username = useSelector((state) => state.user.name) || sessionStorage.getItem("userName") || "User";
  const profileImage = useSelector((state) => state.user.profile_image) || sessionStorage.getItem("profile_image");

  // Determine theme styling based on the active role
  const theme = {
    superuser: {
      primary: "bg-purple-600 text-white",
      hover: "hover:bg-purple-50 hover:text-purple-700",
      activeText: "text-purple-700 font-black bg-purple-50 border-r-4 border-purple-600",
      accent: "text-purple-600",
      bg: "bg-[#fdfcff]",
      badge: "bg-purple-100 text-purple-700",
      border: "border-purple-100",
      banner: "from-purple-900 to-indigo-950",
      roleLabel: "Super Admin",
      glow: "shadow-purple-500/10"
    },
    organizer: {
      primary: "bg-orange-500 text-white",
      hover: "hover:bg-orange-50 hover:text-orange-700",
      activeText: "text-orange-700 font-black bg-orange-50 border-r-4 border-orange-500",
      accent: "text-orange-500",
      bg: "bg-[#fffcf9]",
      badge: "bg-orange-100 text-orange-700",
      border: "border-orange-100",
      banner: "from-orange-600 to-red-700",
      roleLabel: "Organizer",
      glow: "shadow-orange-500/10"
    },
    exhibitor: {
      primary: "bg-emerald-600 text-white",
      hover: "hover:bg-emerald-50 hover:text-emerald-700",
      activeText: "text-emerald-700 font-black bg-emerald-50 border-r-4 border-emerald-600",
      accent: "text-emerald-500",
      bg: "bg-[#fafdfb]",
      badge: "bg-emerald-100 text-emerald-700",
      border: "border-emerald-100",
      banner: "from-emerald-800 to-teal-950",
      roleLabel: "Exhibitor",
      glow: "shadow-emerald-500/10"
    }
  }[role] || {
    primary: "bg-blue-600 text-white",
    hover: "hover:bg-blue-50 hover:text-blue-700",
    activeText: "text-blue-700 font-black bg-blue-50 border-r-4 border-blue-600",
    accent: "text-blue-500",
    bg: "bg-white",
    badge: "bg-blue-100 text-blue-700",
    border: "border-gray-100",
    banner: "from-blue-600 to-indigo-700",
    roleLabel: "Member",
    glow: "shadow-blue-500/10"
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("id");
    sessionStorage.removeItem("name");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("profile_image");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    dispatch(clearUser());
    navigate("/Login");
  };

  const toggleGroup = (group) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  // Determine active state of menu items, supporting path + search parameters
  const getIsActive = (path) => {
    const current = location.pathname + location.search;
    if (path.includes("?")) {
      return current === path;
    }
    return location.pathname === path && !location.search;
  };

  // Define sidebar navigation links by role
  const navigationItems = {
    superuser: [
      {
        title: "Governance",
        items: [
          { label: "Overview", path: "/superuser/dashboard?tab=overview", icon: BarChart3 },
          { label: "Approvals Queue", path: "/superuser/dashboard?tab=approvals", icon: CheckCircle2 },
          { label: "Category Master", path: "/superuser/dashboard?tab=categories", icon: Layers },
          { label: "KYC verification", path: "/superuser/dashboard?tab=kyc", icon: UserCheck },
          { label: "Payouts Queue", path: "/superuser/dashboard?tab=payouts", icon: Landmark },
        ]
      }
    ],
    exhibitor: [
      {
        title: "Stall Discovery",
        items: [
          { label: "Booth Dashboard", path: "/exhibitor/dashboard", icon: LayoutDashboard },
          { label: "My Stall Bookings", path: "/exhibitor/my-bookings", icon: Store },
          { label: "Upcoming Events", path: "/exhibitor/upcoming-events", icon: Calendar },
        ]
      }
    ],
    organizer: [
      {
        title: "Overview",
        groupKey: "dashboards",
        items: [
          { label: "Live Dashboard", path: "/OrganizerHome/livedashboard", icon: LayoutDashboard },
          { label: "Live Food", path: "/OrganizerHome/livedashfoodboard", icon: Utensils },
          { label: "Command Center", path: "/OrganizerHome/Organizerdashboard", icon: LineChart },
        ]
      },
      {
        title: "Event Wizard",
        groupKey: "wizard",
        items: [
          { label: "Create Event", path: "/OrganizerHome/CreateEvent", icon: PlusCircle },
          { label: "Spot Booking", path: "/OrganizerHome/Sportbooking", icon: Ticket },
          { label: "Verify Event", path: "/OrganizerHome/Verify_Event", icon: CheckSquare },
          { label: "Coupon Master", path: "/OrganizerHome/Coupon", icon: Tag },
          { label: "Gate Passes", path: "/OrganizerHome/pass", icon: Key },
          { label: "To-Do Planner", path: "/OrganizerHome/Todo_task", icon: ClipboardList },
        ]
      },
      {
        title: "Access Gates",
        groupKey: "scanners",
        items: [
          { label: "Event Scanner", path: "/OrganizerHome/EventCheckIn", icon: QrCode },
          { label: "Food Scanner", path: "/OrganizerHome/FoodCheckIn", icon: Utensils },
          { label: "Addon Scanner", path: "/OrganizerHome/AddonCheckIn", icon: Milestone },
        ]
      },
      {
        title: "Conferences",
        groupKey: "programs",
        items: [
          { label: "Create Program", path: "/OrganizerHome/CreateProgram", icon: Calendar },
          { label: "Program Check-In", path: "/OrganizerHome/ProgramCheckin", icon: UserCheck },
          { label: "Verify Program", path: "/OrganizerHome/ProgramVerification", icon: ShieldAlert },
          { label: "Bulk Passes", path: "/OrganizerHome/BulkPassPage", icon: Users },
          { label: "Abstract Queue", path: "/OrganizerHome/Abstract_Verification", icon: FileText },
        ]
      },
      {
        title: "User Directory",
        groupKey: "directories",
        items: [
          { label: "Role Editor", path: "/OrganizerHome/RoleScreen", icon: Shield },
          { label: "User Accounts", path: "/OrganizerHome/UserScreen", icon: UserCog },
          { label: "Attendee List", path: "/OrganizerHome/User", icon: Users },
          { label: "Exhibitor Directory", path: "/OrganizerHome/Exhibitor", icon: Store },
          { label: "Spot Stall Reg", path: "/OrganizerHome/ExhibitorSpotRegistration", icon: FilePlus },
        ]
      },
      {
        title: "Master Tables",
        groupKey: "master",
        items: [
          { label: "Policy Editor", path: "/OrganizerHome/PolicyPage", icon: FileLock },
          { label: "Venue Setup", path: "/OrganizerHome/Venu", icon: MapPin },
          { label: "Vendor Setup", path: "/OrganizerHome/Vendor", icon: Truck },
          { label: "Sponsor Setup", path: "/OrganizerHome/SponsorshipPage", icon: Gift },
        ]
      },
      {
        title: "Financials",
        groupKey: "billing",
        items: [
          { label: "Billings & Receipts", path: "/OrganizerHome/Receipt", icon: Receipt },
          { label: "Event Reports", path: "/OrganizerHome/EventReports", icon: BarChart },
          { label: "Admin Approvals", path: "/OrganizerHome/AdminApproval", icon: Check },
        ]
      }
    ]
  }[role] || [];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      
      {/* ── SIDEBAR CONTAINER (Collapsible sidebar-07 style) ── */}
      <aside
        className={`flex flex-col h-full border-r border-slate-200 bg-white transition-all duration-300 relative select-none z-30 ${
          isCollapsed ? "w-[72px]" : "w-[260px]"
        }`}
      >
        {/* Toggle Button (SidebarTrigger) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute -right-3 top-6 w-6 h-6 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all z-50`}
        >
          {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>

        {/* Header: Workspace Swapper / Brand Logo */}
        <div className="p-4 flex items-center gap-3 border-b border-slate-100">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${theme.banner} text-white shadow-md flex-shrink-0`}>
            <Building size={18} className="stroke-[2.2]" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none mb-1">
                BookMyEvent
              </h2>
              <span className={`text-[10px] font-bold ${theme.accent} uppercase tracking-wider block`}>
                {theme.roleLabel}
              </span>
            </div>
          )}
        </div>

        {/* Search Input Bar (Visible only when expanded) */}
        {!isCollapsed && (
          <div className="p-3">
            <div className="bg-slate-100/80 border border-slate-200/50 rounded-xl px-3 h-9 flex items-center gap-2">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                placeholder="Quick filter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xs font-bold text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>
        )}

        {/* Sidebar Nav Items List */}
        <div className="flex-1 overflow-y-auto py-3 px-3 no-scrollbar space-y-4">
          {navigationItems.map((group, groupIdx) => {
            // Filter group items by search query
            const filteredItems = group.items.filter(item =>
              item.label.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (filteredItems.length === 0) return null;

            return (
              <div key={groupIdx} className="space-y-1">
                {/* Group Title or Expand/Collapse Trigger */}
                {!isCollapsed && (
                  <button
                    onClick={() => group.groupKey && toggleGroup(group.groupKey)}
                    className="w-full text-left px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center justify-between hover:text-slate-600 bg-transparent border-none cursor-pointer"
                  >
                    <span>{group.title}</span>
                    {group.groupKey && (
                      <span className="text-[9px] text-slate-400 font-bold">
                        {openGroups[group.groupKey] ? "▼" : "▶"}
                      </span>
                    )}
                  </button>
                )}

                {/* Sub items */}
                {(!group.groupKey || openGroups[group.groupKey] || isCollapsed || searchQuery) && (
                  <div className="space-y-0.5">
                    {filteredItems.map((item, itemIdx) => {
                      const Icon = item.icon;
                      const isActive = getIsActive(item.path);

                      return (
                        <button
                          key={itemIdx}
                          onClick={() => navigate(item.path)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all border-none bg-transparent group relative ${
                            isActive ? theme.activeText : `text-slate-600 ${theme.hover}`
                          }`}
                        >
                          <Icon size={16} className={`stroke-[2.2] flex-shrink-0 ${isActive ? theme.accent : "text-slate-400 group-hover:text-slate-600"}`} />
                          {!isCollapsed && (
                            <span className="truncate leading-none mt-0.5">{item.label}</span>
                          )}

                          {/* Collapsed Tooltip */}
                          {isCollapsed && (
                            <div className="absolute left-16 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity shadow-md z-50 whitespace-nowrap">
                              {item.label}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer: Logged User info */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
            {/* User Profile Trigger */}
            <div
              onClick={() => navigate("/profile")}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-95 transition"
            >
              {profileImage ? (
                <img src={profileImage} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                username.charAt(0).toUpperCase()
              )}
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black text-slate-800 truncate leading-none mb-1">
                  {username}
                </h4>
                <p className="text-[10px] font-bold text-slate-400 truncate uppercase">
                  {theme.roleLabel}
                </p>
              </div>
            )}

            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition border-none bg-transparent"
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>

      </aside>

      {/* ── MAIN CONTENT CONTAINER (Renders the selected panel view) ── */}
      <main className="flex-1 h-full overflow-hidden flex flex-col bg-[#f8fafc]">
        {/* Sleek shadow header trigger helper */}
        <div className="h-2 bg-gradient-to-b from-slate-200/20 to-transparent flex-shrink-0 pointer-events-none z-10" />
        
        {/* Child Router Viewport */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          <Outlet />
        </div>
      </main>

    </div>
  );
}
