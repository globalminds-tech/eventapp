import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  BarChart3,
  Calendar,
  Ticket,
  Users,
  CheckCircle2,
  ShieldCheck,
  ShieldX,
  LogOut,
  Layers,
  Plus,
  Tag,
  AlertCircle,
  Building2,
  UserCheck,
  Landmark,
  TrendingUp,
  Search,
  ChevronRight,
  User,
  DollarSign,
  Filter,
  RefreshCw,
  AlertTriangle,
  ArrowUpRight,
  ChevronLeft,
  X,
  LayoutGrid,
  Grid,
  LayoutList,
  List,
  Menu
} from "lucide-react";
import { getAllEvents, updateEventStatus, getAdminCategories, createAdminCategory, getPendingOrganizers, updateOrganizerKycStatus } from "../Services/api";
import CreateEvent from "../Organizer/MyEvent/CreateEvent/CreateEvent";

// Beautiful SVG/CSS Brand Logo matching the mobile screens
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

const DEFAULT_CATEGORIES = [
  { id: "1", name: "Music & Concerts", subcategories: ["Rock", "Pop", "EDM", "Classical", "Jazz"], status: "Active", revenue: "₹18.2L" },
  { id: "2", name: "Tech & Business Expos", subcategories: ["AI & Tech", "Startups", "Web3", "Finance"], status: "Active", revenue: "₹10.4L" },
  { id: "3", name: "Sports & Fitness", subcategories: ["Football", "Cricket", "Marathon", "Esports"], status: "Active", revenue: "₹8.7L" },
  { id: "4", name: "Food & Culinary", subcategories: ["Food Fest", "Wine Tasting", "Baking Workshop"], status: "Active", revenue: "₹3.2L" },
  { id: "5", name: "Arts & Theatre", subcategories: ["Standup Comedy", "Drama", "Art Gallery"], status: "Active", revenue: "₹2.0L" },
];

const DEFAULT_ORGANIZERS_KYC = [
  { id: "101", name: "Ashok Babu", email: "pashokbabu.38@gmail.com", mobile: "+91 7010085577", company_name: "EventCorp India Ltd", gst_pan: "33ABCDE1234F1Z5", bank_account: "918237465012", ifsc: "HDFC0001234", kyc_status: "PENDING" },
  { id: "102", name: "Robert Downey", email: "robert@starkevents.com", mobile: "+91 9876543210", company_name: "Stark Expo LLC", gst_pan: "27AAAAA0000A1Z5", bank_account: "102938475601", ifsc: "ICIC0005678", kyc_status: "VERIFIED" },
];

const SuperUserEvents = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [organizersKyc, setOrganizersKyc] = useState(DEFAULT_ORGANIZERS_KYC);

  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const queryTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(queryTab); // "overview" | "approvals" | "categories" | "kyc" | "payouts"

  useEffect(() => {
    if (queryTab) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  const [selectedPeriod, setSelectedPeriod] = useState("30D");

  // Advanced Filters
  const [eventStatusFilter, setEventStatusFilter] = useState("ALL");
  const [selectedCatFilter, setSelectedCatFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Category Add Modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newSubCatName, setNewSubCatName] = useState("");
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  // Selected event view
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [fullData, setFullData] = useState(null);

  const [toast, setToast] = useState(null);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [statusConfirm, setStatusConfirm] = useState({ show: false, id: null, status: null });
  const [viewMode, setViewMode] = useState("medium"); // large, medium, small, compact, list
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    await Promise.all([fetchEvents(), fetchCategories(), fetchOrganizersKyc()]);
    setIsLoading(false);
  };

  const fetchEvents = async () => {
    try {
      const res = await getAllEvents();
      if (res?.events) {
        setEvents(res.events);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getAdminCategories();
      if (res?.success && res?.categories?.length > 0) {
        setCategories(res.categories);
      }
    } catch (err) {
      console.warn("Failed to fetch API categories:", err);
    }
  };

  const fetchOrganizersKyc = async () => {
    try {
      const res = await getPendingOrganizers();
      if (res?.success && res?.organizers?.length > 0) {
        setOrganizersKyc(res.organizers);
      }
    } catch (err) {
      console.warn("Failed to fetch API organizers KYC:", err);
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) {
      showNotification("Please enter a category name.", "error");
      return;
    }
    setIsSubmittingCat(true);
    try {
      const payload = {
        name: newCatName.trim(),
        subcategories: newSubCatName ? newSubCatName.split(",").map((s) => s.trim()) : [],
        status: "Active",
      };
      const res = await createAdminCategory(payload);
      if (res?.success) {
        showNotification(`Category "${newCatName}" created!`, "success");
        fetchCategories();
      } else {
        setCategories((prev) => [...prev, { id: Date.now().toString(), ...payload, revenue: "₹0.0L" }]);
        showNotification(`Category "${newCatName}" added locally!`, "success");
      }
      setNewCatName("");
      setNewSubCatName("");
      setShowCategoryModal(false);
    } catch (err) {
      showNotification("Failed to add category", "error");
    } finally {
      setIsSubmittingCat(false);
    }
  };

  const handleStatusUpdate = async (eventId, newStatus) => {
    try {
      const res = await updateEventStatus(eventId, newStatus);
      if (res?.success) {
        showNotification(`Event successfully marked as ${newStatus.toLowerCase()}!`, "success");
        fetchEvents();
      } else {
        showNotification("Failed to update status", "error");
      }
    } catch (err) {
      showNotification("Failed to update status", "error");
    }
  };

  const handleKycStatusUpdate = async (userId, newStatus) => {
    try {
      await updateOrganizerKycStatus(userId, newStatus);
      setOrganizersKyc(prev => prev.map(o => o.id === userId ? { ...o, kyc_status: newStatus } : o));
      showNotification(`Organizer KYC status updated to ${newStatus.toLowerCase()}!`, "success");
    } catch (err) {
      showNotification("Failed to update KYC status", "error");
    }
  };

  const showNotification = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Stats Breakdown
  const totalEventsCount = events.length || 284;
  const liveEventsCount = events.filter((e) => e.status === "LIVE" || e.status === "APPROVED").length || 42;
  const upcomingEventsCount = events.filter((e) => e.status === "UPCOMING").length || 84;
  const pastEventsCount = events.filter((e) => e.status === "COMPLETED" || e.status === "PAST").length || 136;
  const pendingEventsCount = events.filter((e) => e.status === "PENDING" || e.status === "REVIEW").length || 17;
  const pendingKycCount = organizersKyc.filter(o => o.kyc_status === "PENDING").length || 1;

  // Filters logic
  const filteredEvents = events.filter((e) => {
    const matchesSearch = searchQuery
      ? (e.event_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.event_code || "").toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesStatus =
      eventStatusFilter === "ALL" ? true :
      eventStatusFilter === "LIVE" ? (e.status === "LIVE" || e.status === "APPROVED") :
      eventStatusFilter === "UPCOMING" ? e.status === "UPCOMING" :
      eventStatusFilter === "PAST" ? (e.status === "PAST" || e.status === "COMPLETED") :
      eventStatusFilter === "PENDING" ? (e.status === "PENDING" || e.status === "REVIEW") : true;

    const matchesCat =
      selectedCatFilter === "ALL" ? true :
      (e.category || "").toLowerCase() === selectedCatFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCat;
  });

  // Pagination Helper
  const getEventsPerPage = () => {
    if (viewMode === "large") return 4;
    if (viewMode === "medium") return 6;
    return 8;
  };
  const eventsPerPage = getEventsPerPage();
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const currentEvents = filteredEvents.slice((currentPage - 1) * eventsPerPage, currentPage * eventsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const navItems = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "approvals", label: "Approvals", icon: CheckCircle2 },
    { key: "categories", label: "Categories", icon: Layers },
    { key: "kyc", label: "KYC Queue", icon: UserCheck },
    { key: "payouts", label: "Payouts", icon: Landmark },
  ];

  return (
    <div className="text-slate-800 flex flex-col font-sans antialiased pb-8">
      
      {/* 👑 Royal Purple Governance Banner Card */}
      <div className="bg-gradient-to-br from-purple-800 to-indigo-950 text-white p-6 md:p-8 rounded-3xl shadow-lg mt-2">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase">Super Admin Portal</h2>
            <p className="text-[#c084fc] font-bold text-[11px] tracking-wider mt-1.5 uppercase">
              Platform Governance & Executive Analytics
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex gap-6 items-center border border-white/15">
              <div>
                <p className="text-[10px] text-[#d8b4fe] font-bold uppercase tracking-wider">Platform Revenue</p>
                <h3 className="text-lg md:text-xl font-black text-white mt-0.5">₹48.6L</h3>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div>
                <p className="text-[10px] text-[#d8b4fe] font-bold uppercase tracking-wider">Total Events</p>
                <h3 className="text-lg md:text-xl font-black text-white mt-0.5">{totalEventsCount}</h3>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div>
                <p className="text-[10px] text-[#d8b4fe] font-bold uppercase tracking-wider">Attendees</p>
                <h3 className="text-lg md:text-xl font-black text-white mt-0.5">38,420</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 Main Interface Area */}
      <div className="max-w-7xl w-full mx-auto py-10 flex-grow flex flex-col gap-8">
        
        {/* Dynamic Content Panel */}
        <main className="flex-1 min-w-0">
          
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-8 animate-in fade-in duration-500">
              
              {/* Event Lifecycle Breakdown Card Grid */}
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                  <span>Event Lifecycle Breakdown</span>
                  <span className="bg-purple-100 text-purple-700 text-xs px-2.5 py-1 rounded-full font-bold">
                    {totalEventsCount} Total Shows
                  </span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  <div
                    onClick={() => { setActiveTab("approvals"); setEventStatusFilter("LIVE"); }}
                    className="bg-white rounded-3xl p-6 border-l-[6px] border-l-red-500 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-800 text-sm">Live Events</span>
                      <span className="bg-red-50 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-black border border-red-100">
                        🔴 LIVE
                      </span>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-3xl font-black text-slate-900">{liveEventsCount}</h4>
                      <p className="text-slate-500 text-xs font-semibold mt-1">Active production shows</p>
                    </div>
                  </div>

                  <div
                    onClick={() => { setActiveTab("approvals"); setEventStatusFilter("UPCOMING"); }}
                    className="bg-white rounded-3xl p-6 border-l-[6px] border-l-emerald-500 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-800 text-sm">Future Events</span>
                      <span className="bg-emerald-50 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full font-black border border-emerald-100">
                        🟢 FUTURE
                      </span>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-3xl font-black text-slate-900">{upcomingEventsCount}</h4>
                      <p className="text-slate-500 text-xs font-semibold mt-1">Upcoming booked dates</p>
                    </div>
                  </div>

                  <div
                    onClick={() => { setActiveTab("approvals"); setEventStatusFilter("PAST"); }}
                    className="bg-white rounded-3xl p-6 border-l-[6px] border-l-slate-400 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-800 text-sm">Past Events</span>
                      <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-black border border-slate-200">
                        ⚪ PAST
                      </span>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-3xl font-black text-slate-900">{pastEventsCount}</h4>
                      <p className="text-slate-500 text-xs font-semibold mt-1">Completed shows history</p>
                    </div>
                  </div>

                  <div
                    onClick={() => { setActiveTab("approvals"); setEventStatusFilter("PENDING"); }}
                    className="bg-white rounded-3xl p-6 border-l-[6px] border-l-orange-500 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-800 text-sm">Pending Review</span>
                      <span className="bg-orange-50 text-orange-600 text-[10px] px-2 py-0.5 rounded-full font-black border border-orange-100">
                        🟠 PENDING
                      </span>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-3xl font-black text-slate-900">{pendingEventsCount}</h4>
                      <p className="text-slate-500 text-xs font-semibold mt-1">DIY event submissions</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Requires Your Attention Grid */}
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                  <span>Requires Your Attention</span>
                  <span className="bg-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-full font-bold">
                    {pendingEventsCount + pendingKycCount} Items
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div
                    onClick={() => { setActiveTab("approvals"); setEventStatusFilter("PENDING"); }}
                    className="bg-white rounded-3xl p-6 border-l-[5px] border-l-orange-500 border border-slate-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all cursor-pointer flex flex-col justify-between h-40"
                  >
                    <div>
                      <div className="flex justify-between items-center">
                        <h4 className="font-extrabold text-slate-800 text-base">Events Review</h4>
                        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                          {pendingEventsCount}
                        </span>
                      </div>
                      <p className="text-slate-500 text-sm mt-1.5">Newly submitted event listings awaiting portal verification.</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-orange-600 font-bold text-sm">
                      <span>Review Queue</span>
                      <ArrowUpRight size={15} className="stroke-[2.5]" />
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab("kyc")}
                    className="bg-white rounded-3xl p-6 border-l-[5px] border-l-purple-500 border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all cursor-pointer flex flex-col justify-between h-40"
                  >
                    <div>
                      <div className="flex justify-between items-center">
                        <h4 className="font-extrabold text-slate-800 text-base">Organizer KYC</h4>
                        <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
                          {pendingKycCount}
                        </span>
                      </div>
                      <p className="text-slate-500 text-sm mt-1.5">Host verification papers and payouts details awaiting audit.</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-purple-600 font-bold text-sm">
                      <span>Review KYC</span>
                      <ArrowUpRight size={15} className="stroke-[2.5]" />
                    </div>
                  </div>

                </div>
              </div>

              {/* Platform Metrics & Revenue by Category Side-by-Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Platform Key Metrics */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-extrabold text-slate-800">Platform Key Metrics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-500 text-sm">TOTAL REVENUE</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <TrendingUp size={16} className="stroke-[2.5]" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <h4 className="text-2xl font-black text-slate-900">₹48.6L</h4>
                        <p className="text-emerald-600 text-xs font-bold mt-1">↑ 18.4% vs last month</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-500 text-sm">COMMISSION</span>
                        <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                          <DollarSign size={16} className="stroke-[2.5]" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <h4 className="text-2xl font-black text-slate-900">₹4.86L</h4>
                        <p className="text-sky-600 text-xs font-bold mt-1">↑ 12.6% platform fee</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Revenue by Category */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-extrabold text-slate-800">Revenue by Category</h3>
                    <div className="flex bg-slate-200/60 p-0.5 rounded-xl text-xs font-bold text-[#581c87]">
                      {["7D", "30D", "3M", "1Y"].map((period) => (
                        <button
                          key={period}
                          onClick={() => setSelectedPeriod(period)}
                          className={`px-3 py-1 rounded-lg transition-all ${
                            selectedPeriod === period ? "bg-[#581c87] text-white" : "text-slate-600"
                          }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
                    {categories.slice(0, 4).map((c, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-b-0 last:pb-0">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{c.name}</p>
                          <p className="text-slate-400 text-xs font-medium mt-0.5">
                            {Array.isArray(c.subcategories) ? c.subcategories.slice(0, 3).join(", ") : ""}
                          </p>
                        </div>
                        <h5 className="font-extrabold text-[#581c87] text-base">{c.revenue}</h5>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Platform Control Shortcuts */}
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 mb-4">Platform Control Shortcuts</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  
                  <button
                    onClick={() => setShowCategoryModal(true)}
                    className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center gap-3 hover:bg-[#581c87]/5 transition"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#581c87] flex items-center justify-center">
                      <Plus size={20} className="stroke-[2.5]" />
                    </div>
                    <span className="font-bold text-slate-700 text-xs">Add Category</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("approvals"); setEventStatusFilter("PENDING"); }}
                    className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center gap-3 hover:bg-[#581c87]/5 transition"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                      <CheckCircle2 size={20} className="stroke-[2.5]" />
                    </div>
                    <span className="font-bold text-slate-700 text-xs">Review Events ({pendingEventsCount})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("kyc")}
                    className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center gap-3 hover:bg-[#581c87]/5 transition"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                      <UserCheck size={20} className="stroke-[2.5]" />
                    </div>
                    <span className="font-bold text-slate-700 text-xs">Review KYC ({pendingKycCount})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("payouts")}
                    className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center gap-3 hover:bg-[#581c87]/5 transition"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Landmark size={20} className="stroke-[2.5]" />
                    </div>
                    <span className="font-bold text-slate-700 text-xs">Settlements</span>
                  </button>

                </div>
              </div>

            </div>
          )}

          {/* TAB 2: EVENT APPROVALS & LIFECYCLE */}
          {activeTab === "approvals" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
              
              <div className="flex justify-between items-center gap-4 flex-wrap">
                <h3 className="text-xl font-extrabold text-slate-800">Event Approval Queue</h3>
                
                <div className="flex items-center gap-3">
                  <div className="flex border border-slate-200 rounded-2xl bg-white p-0.5">
                    <button
                      onClick={() => setViewMode("medium")}
                      className={`p-2 rounded-xl transition ${viewMode === "medium" ? "bg-slate-100 text-[#581c87]" : "text-slate-400"}`}
                      title="Grid View"
                    >
                      <Grid size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-xl transition ${viewMode === "list" ? "bg-slate-100 text-[#581c87]" : "text-slate-400"}`}
                      title="List View"
                    >
                      <List size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Filters Panel */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-5">
                <div className="relative flex items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3">
                  <Search size={18} className="text-slate-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Search events by name or code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-800 outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "ALL", label: "All" },
                      { key: "LIVE", label: "Live / Approved" },
                      { key: "UPCOMING", label: "Upcoming" },
                      { key: "PAST", label: "Past" },
                      { key: "PENDING", label: "Pending" }
                    ].map((s) => (
                      <button
                        key={s.key}
                        onClick={() => { setEventStatusFilter(s.key); setCurrentPage(1); }}
                        className={`text-xs px-3.5 py-1.5 rounded-full font-bold border transition ${
                          eventStatusFilter === s.key
                            ? "bg-[#581c87] text-white border-[#581c87]"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Events Listing */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-10 h-10 border-4 border-[#581c87] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-semibold text-slate-400">Loading events...</span>
                </div>
              ) : currentEvents.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm flex flex-col items-center gap-4">
                  <Calendar size={48} className="text-slate-300" />
                  <h4 className="font-extrabold text-slate-800 text-lg">No Events Found</h4>
                  <p className="text-slate-400 text-sm max-w-sm">No events match the selected filter conditions. Change the query or tab and try again.</p>
                </div>
              ) : (
                <div className={viewMode === "list" ? "flex flex-col gap-4" : "grid grid-cols-1 md:grid-cols-2 gap-6"}>
                  {currentEvents.map((e) => (
                    <div key={e.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <h4 className="font-black text-slate-800 text-base">{e.event_name}</h4>
                            <p className="text-xs text-slate-400 font-semibold mt-1">Code: {e.event_code || "EVT-2026"}</p>
                          </div>
                          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                            e.status === "APPROVED" || e.status === "LIVE"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : e.status === "REJECTED"
                              ? "bg-rose-50 text-rose-600 border-rose-100"
                              : "bg-orange-50 text-orange-600 border-orange-100"
                          }`}>
                            {e.status || "PENDING"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4 text-xs font-semibold text-slate-500">
                          <div>📍 {e.location || "Venue TBA"}</div>
                          <div>📅 {e.start_date || "Date TBA"}</div>
                          <div>🏷️ Category: {e.category || "General"}</div>
                          <div>👤 Host ID: {e.created_by || "DIY Organizer"}</div>
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end border-t border-slate-50 pt-4 mt-2">
                        {e.status !== "REJECTED" && (
                          <button
                            onClick={() => handleStatusUpdate(e.id, "REJECTED")}
                            className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-4 py-2.5 rounded-xl border border-rose-100 transition"
                          >
                            Reject
                          </button>
                        )}
                        {e.status !== "APPROVED" && e.status !== "LIVE" && (
                          <button
                            onClick={() => handleStatusUpdate(e.id, "APPROVED")}
                            className="text-xs font-bold text-white bg-[#581c87] hover:bg-purple-800 px-4 py-2.5 rounded-xl shadow transition"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-9 h-9 rounded-xl font-bold text-xs transition ${
                        currentPage === i + 1 ? "bg-[#581c87] text-white" : "bg-white text-slate-600 border border-slate-200"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: CATEGORIES */}
          {activeTab === "categories" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
              <div className="flex justify-between items-center gap-4 flex-wrap">
                <h3 className="text-xl font-extrabold text-slate-800">Category & Subcategory Master</h3>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="bg-[#581c87] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow hover:bg-purple-800 transition flex items-center gap-2"
                >
                  <Plus size={16} /> Add Category
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((c) => (
                  <div key={c.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2 text-[#581c87]">
                          <Tag size={16} />
                          <h4 className="font-extrabold text-slate-800 text-base">{c.name}</h4>
                        </div>
                        <span className="bg-emerald-50 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full font-black border border-emerald-100">
                          Active
                        </span>
                      </div>

                      <div className="mt-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subcategories:</p>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(c.subcategories) ? (
                            c.subcategories.map((sub, idx) => (
                              <span key={idx} className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-lg font-bold border border-slate-200">
                                {sub}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-xs">None configured</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-50 pt-4 mt-2 flex justify-between items-center">
                      <span className="text-xs text-slate-400 font-semibold">Revenue Share:</span>
                      <span className="font-black text-[#581c87] text-base">{c.revenue || "₹0.0L"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: KYC QUEUE */}
          {activeTab === "kyc" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
              <h3 className="text-xl font-extrabold text-slate-800">Organizer Account Verification</h3>

              <div className="flex flex-col gap-6">
                {organizersKyc.map((org) => (
                  <div key={org.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-start gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#581c87] flex items-center justify-center">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-800 text-base">{org.company_name}</h4>
                          <p className="text-xs text-slate-400 font-semibold mt-0.5">Representative: {org.name} ({org.email})</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                        org.kyc_status === "VERIFIED"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-orange-50 text-orange-600 border-orange-100"
                      }`}>
                        {org.kyc_status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl text-xs font-semibold text-slate-500">
                      <div>📱 Mobile: {org.mobile}</div>
                      <div>📜 GST / PAN: {org.gst_pan}</div>
                      <div>🏦 Account: {org.bank_account}</div>
                      <div>🏢 IFSC: {org.ifsc}</div>
                    </div>

                    {org.kyc_status === "PENDING" && (
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => handleKycStatusUpdate(org.id, "REJECTED")}
                          className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-4 py-2.5 rounded-xl border border-rose-100 transition"
                        >
                          Reject Setup
                        </button>
                        <button
                          onClick={() => handleKycStatusUpdate(org.id, "VERIFIED")}
                          className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 rounded-xl shadow transition"
                        >
                          Verify Account
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PAYOUT SETTLEMENTS */}
          {activeTab === "payouts" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
              <h3 className="text-xl font-extrabold text-slate-800">Organizer Payout Settlements</h3>

              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm max-w-2xl flex flex-col gap-6">
                <div>
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-slate-800 text-lg">Batch Settlement Release</h4>
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] px-2.5 py-1 rounded-full font-black border border-emerald-100">
                      READY FOR RELEASE
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1">Unified payout direct bank transfer scheduling dashboard.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 border-y border-slate-100 py-6 text-sm font-semibold text-slate-600">
                  <div className="flex justify-between">
                    <span>Gross Platform Ticket Sales:</span>
                    <span className="font-black text-slate-800">₹48,50,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Commission (10% Fee):</span>
                    <span className="font-black text-slate-800">₹4,85,000</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span>Net Organizer Remittance:</span>
                    <span className="font-black text-emerald-600">₹43,65,000</span>
                  </div>
                </div>

                <button
                  onClick={() => showNotification("Direct Bank Payout Batch Released successfully!", "success")}
                  className="w-full py-4 bg-[#581c87] hover:bg-purple-800 text-white font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Landmark size={18} /> Release Direct Bank Payout Batch
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Toast popup */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[999] bg-[#581c87] border border-purple-500 text-white shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs">
            ✓
          </div>
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col gap-6 animate-in zoom-in-95">
            <div>
              <h3 className="font-black text-slate-800 text-lg">Add Main Category</h3>
              <p className="text-slate-400 text-xs mt-1">Configure new platform event category and nested subcategories.</p>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Main Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Esports, Tech Expos, Classical Music"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Subcategories (Comma-separated)</label>
                <textarea
                  placeholder="e.g. Valorant, BGMI, FIFA, Console Arena"
                  value={newSubCatName}
                  onChange={(e) => setNewSubCatName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none h-24 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-xs font-bold text-slate-500 hover:bg-slate-50 px-4 py-2.5 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={isSubmittingCat}
                className="text-xs font-bold text-white bg-[#581c87] hover:bg-purple-800 px-4 py-2.5 rounded-xl shadow transition"
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperUserEvents;
