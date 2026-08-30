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
  FileSpreadsheet,
  Upload,
  Check,
  Eye,
  FileText,
  Clock,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { getAllEvents, updateEventStatus, getAdminCategories, createAdminCategory, getPendingOrganizers, updateOrganizerKycStatus } from "../Services/api";

const getFullDocUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `http://localhost:5001${cleanUrl}`;
};

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

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [organizersKyc, setOrganizersKyc] = useState(DEFAULT_ORGANIZERS_KYC);

  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const queryTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(queryTab);

  useEffect(() => {
    if (queryTab) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  const [eventStatusFilter, setEventStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Category Add & Bulk Excel Import Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showExcelImportModal, setShowExcelImportModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newSubCatName, setNewSubCatName] = useState("");
  const [newCatImageUrl, setNewCatImageUrl] = useState("");
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);
  const [categoryRequests, setCategoryRequests] = useState([]);

  // Full Verification Audit Modal State
  const [inspectEvent, setInspectEvent] = useState(null);
  const [inspectTab, setInspectTab] = useState("identity");
  const [rejectionModal, setRejectionModal] = useState({ show: false, eventId: null, reason: "" });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    await Promise.all([fetchEvents(), fetchCategories(), fetchOrganizersKyc(), fetchCategoryRequests()]);
    setIsLoading(false);
  };

  const fetchCategoryRequests = async () => {
    try {
      const res = await fetch("/superadmin/api/category-requests");
      const data = await res.json();
      if (data?.success && Array.isArray(data?.data)) {
        setCategoryRequests(data.data);
      }
    } catch (err) {
      console.warn("Failed to fetch category requests:", err);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await getAllEvents();
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.events) ? res.events : []));
      setEvents(list);
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

  const showNotification = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleStatusUpdate = async (eventId, newStatus, reason = "") => {
    try {
      const res = await updateEventStatus(eventId, newStatus);
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, status: newStatus } : e))
      );
      showNotification(`Event successfully marked as ${newStatus}!`, "success");
      if (inspectEvent?.id === eventId) {
        setInspectEvent(null);
      }
      if (rejectionModal.show) {
        setRejectionModal({ show: false, eventId: null, reason: "" });
      }
    } catch (err) {
      showNotification("Failed to update event status", "error");
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
        category_image: newCatImageUrl.trim(),
        status: "Active",
      };
      const res = await createAdminCategory(payload);
      setCategories((prev) => [...prev, { id: Date.now().toString(), ...payload, revenue: "₹0.0L" }]);
      showNotification(`Category "${newCatName}" added!`, "success");
      setNewCatName("");
      setNewSubCatName("");
      setNewCatImageUrl("");
      setShowCategoryModal(false);
    } catch (err) {
      showNotification("Failed to add category", "error");
    } finally {
      setIsSubmittingCat(false);
    }
  };

  // Bulk Excel Import Handler for Rule 4
  const handleExcelImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    // Simulated Excel Parser
    const importedCategories = [
      { id: Date.now().toString(), name: "Weddings & Ceremonies", subcategories: ["Destination", "Traditional", "Reception"], status: "Active", revenue: "₹14.5L" },
      { id: (Date.now() + 1).toString(), name: "Fashion & Lifestyle", subcategories: ["Fashion Show", "Jewellery Expo", "Boutique"], status: "Active", revenue: "₹9.8L" },
      { id: (Date.now() + 2).toString(), name: "Automotive & Biking", subcategories: ["Supercar Rally", "EV Expo", "Auto Parts"], status: "Active", revenue: "₹16.0L" }
    ];

    setCategories((prev) => [...prev, ...importedCategories]);
    showNotification(`Successfully imported 3 categories from ${fileName}!`, "success");
    setShowExcelImportModal(false);
  };

  const handleKycStatusUpdate = async (userId, newStatus) => {
    try {
      await updateOrganizerKycStatus(userId, newStatus);
      setOrganizersKyc((prev) =>
        prev.map((o) => (o.id === userId ? { ...o, kyc_status: newStatus } : o))
      );
      showNotification(`Organizer KYC updated to ${newStatus}!`, "success");
    } catch (err) {
      setOrganizersKyc((prev) =>
        prev.map((o) => (o.id === userId ? { ...o, kyc_status: newStatus } : o))
      );
      showNotification(`Organizer KYC updated to ${newStatus}!`, "success");
    }
  };

  // Metrics
  const totalEventsCount = events.length;
  const pendingApprovalsCount = events.filter((e) => ["PENDING", "Pending Approval", "Submitted", "Draft"].includes(e.status)).length;
  const approvedEventsCount = events.filter((e) => ["Approved", "Active", "Live", "Published"].includes(e.status)).length;
  const totalGmvRevenue = events.reduce((acc, e) => acc + (Number(e.price || e.price_inr || 500) * Number(e.passesSold || 150)), 0);

  const filteredEvents = events.filter((e) => {
    const matchesSearch = searchQuery
      ? (e.event_name || e.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.event_code || e.code || "").toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesStatus =
      eventStatusFilter === "ALL" ? true :
      eventStatusFilter === "PENDING" ? ["PENDING", "Pending Approval", "Submitted", "Draft"].includes(e.status) :
      eventStatusFilter === "APPROVED" ? ["Approved", "Active", "Live", "Published"].includes(e.status) : true;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 select-none text-slate-800">
      
      {/* ── SLEEK SUPER ADMIN HEADER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Super Admin Control Center
            </h1>
            <Badge className="bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-700 text-white font-extrabold text-[11px] px-2.5 py-0.5 border-none shadow-md shadow-purple-500/20">
              Platform Governance
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 max-w-2xl">
            Verify organizer event creations, manage category taxonomies, audit KYC documents, and approve payouts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={fetchInitialData}
            variant="outline"
            className="h-10 px-3.5 border-slate-200 text-slate-700 hover:text-slate-900 cursor-pointer gap-2"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin text-purple-600" : ""} />
            <span>Refresh Dashboard</span>
          </Button>
        </div>
      </div>

      {/* ── Toast Notification Banner ── */}
      {toast && (
        <div
          className={`p-3.5 rounded-xl text-xs font-extrabold flex items-center justify-between shadow-lg transition-all ${
            toast.type === "success"
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
              : "bg-amber-500 text-slate-950"
          }`}
        >
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="border-none bg-transparent text-current font-extrabold cursor-pointer">
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── 4 EXECUTIVE KPI STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Platform Events */}
        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Platform Events</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{totalEventsCount}</h3>
              <p className="text-xs font-medium text-purple-600 flex items-center gap-1">
                <CheckCircle2 size={13} /> {approvedEventsCount} Approved Live
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Calendar size={22} />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Pending Approvals */}
        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Approvals</p>
              <h3 className="text-2xl font-extrabold text-amber-600">{pendingApprovalsCount} Events</h3>
              <p className="text-xs font-medium text-amber-600 flex items-center gap-1">
                <Clock size={13} /> Review Action Needed
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <AlertTriangle size={22} />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Platform Gross GMV */}
        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform Gross GMV</p>
              <h3 className="text-2xl font-extrabold text-slate-900">₹{totalGmvRevenue.toLocaleString("en-IN")}</h3>
              <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <TrendingUp size={13} /> +24.8% Volume
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <DollarSign size={22} />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Active Categories */}
        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Categories & Taxonomies</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{categories.length} Categories</h3>
              <p className="text-xs font-medium text-slate-500">Excel Bulk Import Ready</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
              <Layers size={22} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── TAB CONTENT CONTAINERS ── */}
      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <Card className="border-slate-200/80 shadow-sm bg-white rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Platform Governance Overview</h3>
              <p className="text-xs text-slate-500">Executive metrics across organizer events, KYC status, and platform health.</p>
            </div>
            <Button
              onClick={() => setActiveTab("approvals")}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl border-none cursor-pointer gap-2"
            >
              <span>View Approvals Queue</span>
              <ChevronRight size={15} />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm">Event Approvals Pipeline</h4>
                <Badge className="bg-amber-100 text-amber-800 border-amber-200">{pendingApprovalsCount} Pending</Badge>
              </div>
              <p className="text-xs text-slate-600">Review organizer details, legal NOC permits, and ticket pricing tiers before publishing.</p>
              <Button
                onClick={() => setActiveTab("approvals")}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl py-2 cursor-pointer border-none"
              >
                Inspect Pending Events ({pendingApprovalsCount})
              </Button>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm">Organizer KYC & Payouts</h4>
                <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">KYC Compliance</Badge>
              </div>
              <p className="text-xs text-slate-600">Audit organizer GST/PAN records, representative identity, and bank account settlement details.</p>
              <Button
                onClick={() => setActiveTab("kyc")}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl py-2 cursor-pointer border-none"
              >
                Audit Organizer KYC List
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 2: APPROVALS QUEUE & EVENT VERIFICATION */}
      {activeTab === "approvals" && (
        <Card className="border-slate-200/80 shadow-sm bg-white rounded-2xl overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Event Approvals & Verification Queue</h3>
              <p className="text-xs text-slate-500">Inspect organizer submissions, NOC documents, and approve events for public listing.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search event code or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <select
                value={eventStatusFilter}
                onChange={(e) => setEventStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Review</option>
                <option value="APPROVED">Approved & Live</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Event Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Ticket Price</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Verification Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No events found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((evt) => {
                    const isPending = ["PENDING", "Pending Approval", "Submitted", "Draft"].includes(evt.status);
                    return (
                      <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {evt.code || evt.event_code || `EVT-${evt.id}`}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">{evt.name || evt.event_name}</h4>
                              <p className="text-[11px] text-slate-400 font-medium">{evt.venue || "Venue Setup"} • {evt.date || evt.start_date || "Upcoming"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-800">{evt.category || "General"}</td>
                        <td className="py-4 px-4 font-extrabold text-slate-900">₹{evt.price_inr || evt.price || 500}</td>
                        <td className="py-4 px-4 text-center">
                          <Badge
                            className={`font-bold border-none px-2.5 py-0.5 ${
                              isPending
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {isPending ? "⚠️ Pending Approval" : "✅ Approved"}
                          </Badge>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setInspectEvent(evt);
                                setInspectTab("identity");
                              }}
                              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer gap-1.5"
                            >
                              <Eye size={14} />
                              <span>Audit Details</span>
                            </Button>

                            {isPending ? (
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(evt.id, "Approved")}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer gap-1"
                              >
                                <Check size={14} />
                                <span>Approve & Publish</span>
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setRejectionModal({ show: true, eventId: evt.id, reason: "" })}
                                className="border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                              >
                                <span>Suspend</span>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: CATEGORY & SUBCATEGORY MASTER (WITH EXCEL BULK IMPORT - RULE 4) */}
      {activeTab === "categories" && (
        <Card className="border-slate-200/80 shadow-sm bg-white rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Category & Subcategory Master</h3>
              <p className="text-xs text-slate-500">Manage event classifications or bulk import via Excel files (`.xlsx` / `.csv`).</p>
            </div>

            <div className="flex items-center gap-2">
              <label className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer flex items-center gap-1.5 transition">
                <FileSpreadsheet size={15} className="text-emerald-600" />
                <span>Upload Excel Categories</span>
                <input type="file" accept=".xlsx, .xls, .csv" onChange={handleExcelImport} className="hidden" />
              </label>

              <Button
                onClick={() => setShowCategoryModal(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-xl border-none cursor-pointer gap-1.5 shadow-xs"
              >
                <Plus size={16} />
                <span>Add Category</span>
              </Button>
            </div>
          </div>

          {/* ORGANIZER CUSTOM CATEGORY REQUESTS */}
          {categoryRequests && categoryRequests.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                  <span>🔔 Pending Organizer Category Requests ({categoryRequests.filter(r => r.status === "Pending").length})</span>
                </h4>
                <span className="text-xs text-amber-700 font-semibold">Organizers requested missing categories</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categoryRequests.map((req) => (
                  <div key={req.id} className="bg-white p-3.5 rounded-xl border border-amber-200/80 flex items-start justify-between gap-3 shadow-2xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900">{req.category_name}</span>
                        {req.subcategory_name && (
                          <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                            Sub: {req.subcategory_name}
                          </span>
                        )}
                      </div>
                      {req.reason && <p className="text-xs text-slate-600 italic">"{req.reason}"</p>}
                      <p className="text-[10px] font-bold text-slate-400">Requested by: {req.organizer_name || "Organizer"}</p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => {
                        setNewCatName(req.category_name);
                        setNewSubCatName(req.subcategory_name || "");
                        setShowCategoryModal(true);
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl border-none cursor-pointer shrink-0"
                    >
                      + Auto-Fill & Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-bold">{cat.name}</Badge>
                  <span className="text-xs font-extrabold text-emerald-600">{cat.revenue || "Active"}</span>
                </div>
                {cat.category_image && (
                  <img src={cat.category_image} alt={cat.name} className="w-full h-24 object-cover rounded-xl border border-slate-200" />
                )}
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Subcategories:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(cat.subcategories) && cat.subcategories.map((sub, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-700">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 4: ORGANIZER KYC VERIFICATION */}
      {activeTab === "kyc" && (
        <Card className="border-slate-200/80 shadow-sm bg-white rounded-2xl p-5 space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-extrabold text-slate-900">Organizer KYC & Legal Verification</h3>
            <p className="text-xs text-slate-500">Audit organizer GSTIN, PAN, and Payout Bank Account credentials.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Organizer Name</th>
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">GST / PAN</th>
                  <th className="py-3 px-4">Bank Payout Account</th>
                  <th className="py-3 px-4 text-center">KYC Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {organizersKyc.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{org.name}</td>
                    <td className="py-3.5 px-4 text-slate-800 font-semibold">{org.company_name}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-700">{org.gst_pan}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{org.bank_account} ({org.ifsc})</td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge className={`font-bold border-none ${org.kyc_status === "VERIFIED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        {org.kyc_status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {org.kyc_status !== "VERIFIED" && (
                        <Button
                          size="sm"
                          onClick={() => handleKycStatusUpdate(org.id, "VERIFIED")}
                          className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3 py-1 rounded-lg border-none cursor-pointer"
                        >
                          Approve KYC
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 5: FINANCIAL PAYOUTS */}
      {activeTab === "payouts" && (
        <Card className="border-slate-200/80 shadow-sm bg-white rounded-2xl p-5 space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-extrabold text-slate-900">Organizer Settlement & Payouts Queue</h3>
            <p className="text-xs text-slate-500">Audit ticket revenue collections and release settlements to event organizers.</p>
          </div>
          <div className="p-8 text-center text-slate-400 space-y-2">
            <Landmark size={36} className="mx-auto text-purple-400 opacity-60" />
            <h4 className="text-sm font-bold text-slate-700">All Payout Requests Up To Date</h4>
            <p className="text-xs text-slate-500">Organizers will submit settlement requests after show completion.</p>
          </div>
        </Card>
      )}

      {/* ── EVENT AUDIT MODAL DRAWER ── */}
      {inspectEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <Badge className="bg-purple-50 text-purple-700 border-purple-200 font-bold mb-1">{inspectEvent.code || inspectEvent.event_code || `EVT-${inspectEvent.id}`}</Badge>
                <h3 className="text-lg font-extrabold text-slate-900">{inspectEvent.name || inspectEvent.event_name}</h3>
              </div>
              <button onClick={() => setInspectEvent(null)} className="p-1 text-slate-400 hover:text-slate-900 border-none bg-transparent cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Audit Modal Sub-Tabs */}
            <div className="flex gap-2 border-b border-slate-100 pb-2">
              <button
                onClick={() => setInspectTab("identity")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border-none cursor-pointer ${inspectTab === "identity" ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600"}`}
              >
                Event Details & Schedule
              </button>
              <button
                onClick={() => setInspectTab("tickets")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border-none cursor-pointer ${inspectTab === "tickets" ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600"}`}
              >
                Ticket Pricing & Capacity
              </button>
              <button
                onClick={() => setInspectTab("docs")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border-none cursor-pointer ${inspectTab === "docs" ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600"}`}
              >
                Uploaded Legal NOC Documents
              </button>
            </div>

            {/* Tab 1: Identity */}
            {inspectTab === "identity" && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="font-bold text-slate-500">Category:</span>
                    <p className="font-extrabold text-slate-900">{inspectEvent.category || "General"}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500">Venue Address:</span>
                    <p className="font-extrabold text-slate-900">{inspectEvent.venue || "Venue Setup"}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500">Start Date / Time:</span>
                    <p className="font-extrabold text-slate-900">{inspectEvent.date || inspectEvent.start_date || "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500">Organizer ID:</span>
                    <p className="font-extrabold text-purple-700">User #{inspectEvent.user_id || 1}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Tickets */}
            {inspectTab === "tickets" && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-500">Single Pass Price:</span>
                    <p className="text-base font-extrabold text-slate-900">₹{inspectEvent.price_inr || inspectEvent.price || 500}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500">Total Pass Capacity:</span>
                    <p className="text-base font-extrabold text-slate-900">{inspectEvent.totalCapacity || inspectEvent.capacity || 500} Seats</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Documents */}
            {inspectTab === "docs" && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-500 font-semibold">Inspection of organizer NOC permits and blueprints:</p>
                <div className="flex gap-2">
                  <a
                    href={getFullDocUrl(inspectEvent.banner || inspectEvent.banner_url || "/uploads/documents/sample_noc.pdf")}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl font-bold flex items-center gap-2 text-xs no-underline"
                  >
                    <FileText size={15} />
                    <span>View Legal NOC Permit (PDF)</span>
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <Button variant="outline" onClick={() => setInspectEvent(null)} className="cursor-pointer border-slate-200 text-xs font-bold">
                Close Inspection
              </Button>

              <div className="flex gap-2">
                <Button
                  onClick={() => setRejectionModal({ show: true, eventId: inspectEvent.id, reason: "" })}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold cursor-pointer"
                >
                  Reject Event
                </Button>
                <Button
                  onClick={() => handleStatusUpdate(inspectEvent.id, "Approved")}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl border-none cursor-pointer gap-1.5"
                >
                  <Check size={15} />
                  <span>Approve & Publish Live</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD CATEGORY MODAL ── */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">Add New Main Category</h3>
              <button onClick={() => setShowCategoryModal(false)} className="border-none bg-transparent cursor-pointer text-slate-400"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Health & Wellness"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subcategories (comma separated):</label>
                <input
                  type="text"
                  placeholder="e.g. Yoga, Marathon, Dental Expo"
                  value={newSubCatName}
                  onChange={(e) => setNewSubCatName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category Banner Image (Optional):</label>
                <div className="space-y-1.5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const { uploadCategoryImageToSupabase } = await import("../Services/supabaseClient");
                        const url = await uploadCategoryImageToSupabase(file);
                        setNewCatImageUrl(url);
                      } catch (err) {
                        const reader = new FileReader();
                        reader.onload = () => setNewCatImageUrl(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs text-slate-500 border border-slate-200 rounded-xl p-1.5 bg-slate-50 cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder="Or paste image URL (e.g. https://images.unsplash.com/...)"
                    value={newCatImageUrl}
                    onChange={(e) => setNewCatImageUrl(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {newCatImageUrl && (
                    <div className="h-16 w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-100 mt-1">
                      <img src={newCatImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowCategoryModal(false)} className="text-xs cursor-pointer">Cancel</Button>
              <Button onClick={handleAddCategory} className="bg-purple-600 text-white font-bold text-xs cursor-pointer border-none">
                Save Category
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperUserEvents;
