import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search, RefreshCw, AlertCircle, Store, CheckCircle2, Clock,
  Building2, Briefcase, Mail, Phone, Globe, Download, ExternalLink,
  MapPin, XCircle, Eye, ChevronRight, Layers, FileText, UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { StatCardSkeleton } from "@/components/ui/StatCardSkeleton";
import { ResponsiveTableView, MobileDataCard } from "@/components/ui/ResponsiveTableView";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/Select";
import apiClient from "@/Services/client";

const COLUMNS = [
  { key: "company_name", label: "Company & Brand" },
  { key: "industry_type", label: "Industry Sector" },
  { key: "name", label: "Primary Contact" },
  { key: "contact_info", label: "Contact Phone & Email" },
  { key: "location", label: "Location" },
  { key: "events_count", label: "Exhibitions" },
  { key: "status", label: "Status", badge: true },
  { key: "actions", label: "Action", align: "right" }
];

export default function ExhibitorDirectoryPage() {
  const [exhibitors, setExhibitors] = useState([]);
  const [stats, setStats] = useState({
    total_exhibitors: 0,
    active_stalls: 0,
    industries_count: 0,
    pending_applications: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await apiClient.get("/api/v1/organizer/exhibitors/directory");
      const data = res.data;
      if (data && data.success && data.data) {
        setExhibitors(data.data.exhibitors || []);
        if (data.data.stats) {
          setStats(data.data.stats);
        }
      } else {
        setExhibitors([]);
      }
    } catch (err) {
      console.error("Failed to load exhibitor directory:", err);
      setExhibitors([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Extract distinct industries for filter dropdown
  const industriesList = useMemo(() => {
    const set = new Set();
    exhibitors.forEach(e => {
      if (e.industry_type && e.industry_type.trim()) {
        set.add(e.industry_type.trim());
      }
    });
    return Array.from(set).sort();
  }, [exhibitors]);

  // Filtered Directory
  const filteredExhibitors = useMemo(() => {
    const q = search.toLowerCase();
    return exhibitors.filter(e => {
      const matchesSearch =
        search === "" ||
        (e.company_name || "").toLowerCase().includes(q) ||
        (e.name || "").toLowerCase().includes(q) ||
        (e.email || "").toLowerCase().includes(q) ||
        (e.mobile || "").toLowerCase().includes(q) ||
        (e.city || "").toLowerCase().includes(q) ||
        (e.industry_type || "").toLowerCase().includes(q) ||
        (e.events_participated || "").toLowerCase().includes(q);

      const matchesIndustry =
        selectedIndustry === "all" ||
        (e.industry_type || "").toLowerCase() === selectedIndustry.toLowerCase();

      return matchesSearch && matchesIndustry;
    });
  }, [exhibitors, search, selectedIndustry]);

  // CSV Export Utility
  const handleExportCSV = () => {
    if (exhibitors.length === 0) return;
    const headers = [
      "Company Name",
      "Company Type",
      "Industry Sector",
      "Representative Name",
      "Email",
      "Mobile",
      "Designation",
      "City",
      "State",
      "Country",
      "Events Participated",
      "Active Stalls",
      "Website",
      "Status"
    ];

    const rows = filteredExhibitors.map(e => [
      `"${(e.company_name || "").replace(/"/g, '""')}"`,
      `"${(e.company_type || "").replace(/"/g, '""')}"`,
      `"${(e.industry_type || "").replace(/"/g, '""')}"`,
      `"${(e.name || "").replace(/"/g, '""')}"`,
      `"${(e.email || "").replace(/"/g, '""')}"`,
      `"${(e.mobile || "").replace(/"/g, '""')}"`,
      `"${(e.designation || "").replace(/"/g, '""')}"`,
      `"${(e.city || "").replace(/"/g, '""')}"`,
      `"${(e.state || "").replace(/"/g, '""')}"`,
      `"${(e.country || "").replace(/"/g, '""')}"`,
      `"${(e.events_participated || "").replace(/"/g, '""')}"`,
      `"${e.active_stalls || 0}"`,
      `"${(e.company_website || "").replace(/"/g, '""')}"`,
      `"${e.status || "Registered"}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `exhibitor_directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage("✓ Exhibitor Directory exported to CSV successfully!");
    setTimeout(() => setToastMessage(""), 3500);
  };

  return (
    <div className="space-y-6 pb-12 w-full select-none font-sans text-slate-800">
      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── SLEEK PAGE HEADER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Exhibitor Directory
            </h1>
            <Badge className="bg-cyan-50 text-cyan-800 border-cyan-200 px-2.5 py-0.5 font-bold text-[11px]">
              Vendor CRM
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Master directory of exhibiting companies, brand profiles, primary contact representatives, and expo participation records.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            disabled={exhibitors.length === 0}
            className="h-9 px-3.5 rounded-xl border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer gap-1.5 text-xs font-bold"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </Button>

          <Button
            onClick={() => fetchData(true)}
            variant="outline"
            className="h-9 px-3.5 rounded-xl border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer gap-1.5 text-xs font-bold"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            <span>Sync</span>
          </Button>
        </div>
      </div>

      {/* ── 4 EXECUTIVE KPI CARDS (MATCHING USER REFERENCE) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <StatCardSkeleton count={4} />
        ) : (
          <>
            {/* Card 1: Total Exhibitors */}
            <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-5 flex flex-col justify-between transition hover:border-slate-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Exhibitors</span>
                <div className="w-9 h-9 bg-blue-50 rounded-xl text-blue-600 flex items-center justify-center border border-blue-100/70 shrink-0">
                  <Building2 size={18} />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {stats.total_exhibitors}
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">Unique registered vendor businesses</p>
              </div>
            </Card>

            {/* Card 2: Active Stalls Allocated */}
            <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-5 flex flex-col justify-between transition hover:border-slate-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Stalls Allocated</span>
                <div className="w-9 h-9 bg-emerald-50 rounded-xl text-emerald-600 flex items-center justify-center border border-emerald-100/70 shrink-0">
                  <Store size={18} />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
                  {stats.active_stalls}
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">Approved & confirmed booth spaces</p>
              </div>
            </Card>

            {/* Card 3: Industry Verticals */}
            <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-5 flex flex-col justify-between transition hover:border-slate-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Industry Verticals</span>
                <div className="w-9 h-9 bg-purple-50 rounded-xl text-purple-600 flex items-center justify-center border border-purple-100/70 shrink-0">
                  <Briefcase size={18} />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-600 tracking-tight">
                  {stats.industries_count}
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">Distinct commercial market sectors</p>
              </div>
            </Card>

            {/* Card 4: Pending Applications */}
            <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-5 flex flex-col justify-between transition hover:border-slate-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Applications</span>
                <div className="w-9 h-9 bg-amber-50 rounded-xl text-amber-600 flex items-center justify-center border border-amber-100/70 shrink-0">
                  <Clock size={18} />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {stats.pending_applications}
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">Vendors awaiting booth allocation</p>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* ── TOOLBAR: SEARCH & INDUSTRY FILTER ── */}
      <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-4 sm:p-5 !overflow-visible relative z-30">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vendor company, contact name, email, city..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 focus:ring-2 focus:ring-sky-500 outline-none text-xs font-semibold"
              />
            </div>

            {industriesList.length > 0 && (
              <div className="w-full sm:w-60 relative z-40">
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="w-full h-9 rounded-xl border-slate-200/80 bg-slate-50 text-xs font-semibold">
                    <SelectValue placeholder="All Industries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries ({industriesList.length})</SelectItem>
                    {industriesList.map((ind) => (
                      <SelectItem key={ind} value={ind}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="text-xs font-bold text-slate-500 self-end sm:self-auto">
            <span>Showing {filteredExhibitors.length} of {exhibitors.length} companies</span>
          </div>
        </div>
      </Card>

      {/* ── EXHIBITOR DATA TABLE ── */}
      <Card className="border-slate-200/80 shadow-sm bg-white rounded-2xl overflow-hidden">
        <div className="p-4">
          <ResponsiveTableView
            data={filteredExhibitors}
            keyField="id"
            loading={loading}
            columnCount={COLUMNS.length}
            columns={COLUMNS.map((c) => ({
              header: c.label,
              className: `py-3.5 px-4 ${c.align === "right" ? "text-right" : ""}`
            }))}
            emptyMessage="No exhibitors registered yet. Once exhibitors apply or book stalls, their profiles will automatically appear in this directory."
            renderDesktopTable={() => (
              <div className="responsive-table-wrap">
                <table className="w-full min-w-[800px] text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {COLUMNS.map((col) => (
                        <th key={col.key} className={`py-3.5 px-4 ${col.align === "right" ? "text-right" : ""}`}>
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                    {filteredExhibitors.map((comp) => {
                      const isApproved = comp.status === "Approved" || comp.active_stalls > 0;
                      return (
                        <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Company Name */}
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-extrabold text-xs shrink-0 border border-slate-200">
                                {(comp.company_name || "V").charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="truncate font-extrabold text-slate-900">{comp.company_name}</div>
                                <div className="text-[11px] font-medium text-slate-400 truncate">{comp.company_type || "Vendor Entity"}</div>
                              </div>
                            </div>
                          </td>

                          {/* Industry */}
                          <td className="py-3.5 px-4">
                            <Badge className="bg-slate-100 text-slate-700 border-slate-200 font-bold text-[10px]">
                              {comp.industry_type || "Exhibitions"}
                            </Badge>
                          </td>

                          {/* Primary Contact */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800">{comp.name}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{comp.designation || "Representative"}</div>
                          </td>

                          {/* Contact Info */}
                          <td className="py-3.5 px-4">
                            <div className="text-slate-800 font-semibold">{comp.mobile || "—"}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[150px]">{comp.email || "—"}</div>
                          </td>

                          {/* Location */}
                          <td className="py-3.5 px-4 text-slate-600">
                            {[comp.city, comp.state].filter(Boolean).join(", ") || comp.country || "—"}
                          </td>

                          {/* Events Participated */}
                          <td className="py-3.5 px-4">
                            <span className="font-extrabold text-indigo-700">
                              {comp.events_count || 1} {comp.events_count === 1 ? "Expo" : "Expos"}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {comp.active_stalls > 0 ? `${comp.active_stalls} Active Stalls` : "Pending Allocation"}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold inline-flex items-center gap-1 ${
                              isApproved
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isApproved ? "bg-emerald-500" : "bg-amber-500"}`} />
                              {isApproved ? "Approved Vendor" : "Registered"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedCompany(comp)}
                              className="h-8 px-2.5 rounded-xl border-slate-200 text-slate-700 hover:text-cyan-700 hover:bg-cyan-50 text-xs font-bold gap-1 cursor-pointer"
                              title="View Exhibitor Profile"
                            >
                              <Eye size={13} />
                              <span>Profile</span>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            renderMobileCard={(comp) => {
              const isApproved = comp.status === "Approved" || comp.active_stalls > 0;
              return (
                <MobileDataCard key={comp.id}>
                  <MobileDataCard.Header
                    title={comp.company_name}
                    subtitle={`Contact: ${comp.name} • ${comp.mobile || comp.email || ""}`}
                    statusBadge={
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                        isApproved ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}>
                        {isApproved ? "Approved" : "Registered"}
                      </span>
                    }
                  />

                  <MobileDataCard.Grid
                    items={[
                      { label: "Industry", value: <Badge className="bg-slate-100 text-slate-700 text-[10px]">{comp.industry_type || "Exhibitions"}</Badge> },
                      { label: "Location", value: [comp.city, comp.state].filter(Boolean).join(", ") || comp.country || "—" },
                      { label: "Expos Attended", value: `${comp.events_count || 1} Shows` },
                      { label: "Active Stalls", value: `${comp.active_stalls || 0} Booths` }
                    ]}
                  />

                  <MobileDataCard.Actions>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedCompany(comp)}
                      className="w-full text-xs font-bold gap-1.5 h-9 rounded-xl border-slate-200 hover:bg-cyan-50 hover:text-cyan-700"
                    >
                      <Eye size={14} />
                      <span>View Company Profile</span>
                    </Button>
                  </MobileDataCard.Actions>
                </MobileDataCard>
              );
            }}
          />
        </div>
      </Card>

      {/* ── COMPANY PROFILE SLIDE-OVER MODAL ── */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 text-cyan-700 flex items-center justify-center font-black text-lg">
                  {(selectedCompany.company_name || "V").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">{selectedCompany.company_name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedCompany.company_type || "Registered Vendor"} • Sector: {selectedCompany.industry_type || "Exhibitions"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCompany(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* Executive Contact Info */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2.5">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <UserCheck size={14} className="text-slate-500" />
                  <span>Primary Executive</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Name:</span>
                  <p className="font-bold text-slate-900">{selectedCompany.name}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{selectedCompany.designation || "Exhibitor Contact"}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Email:</span>
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Mail size={13} className="text-slate-400" />
                    <a href={`mailto:${selectedCompany.email}`} className="hover:underline">{selectedCompany.email}</a>
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Mobile:</span>
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-400" />
                    <a href={`tel:${selectedCompany.mobile}`} className="hover:underline">{selectedCompany.mobile}</a>
                  </p>
                </div>
              </div>

              {/* Company Address & Web */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2.5">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MapPin size={14} className="text-slate-500" />
                  <span>Headquarters & Web</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Address:</span>
                  <p className="font-bold text-slate-900">
                    {[selectedCompany.address, selectedCompany.city, selectedCompany.state, selectedCompany.country, selectedCompany.pin_code].filter(Boolean).join(", ") || "—"}
                  </p>
                </div>
                {selectedCompany.company_website && (
                  <div>
                    <span className="text-slate-400 font-medium">Website:</span>
                    <a
                      href={selectedCompany.company_website.startsWith("http") ? selectedCompany.company_website : `https://${selectedCompany.company_website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-cyan-600 hover:underline flex items-center gap-1"
                    >
                      <span>{selectedCompany.company_website}</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 font-medium">Products / Services:</span>
                  <p className="font-bold text-slate-800">{selectedCompany.products || "—"}</p>
                </div>
              </div>

              {/* Event Participation History */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2.5 md:col-span-2">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Store size={14} className="text-slate-500" />
                  <span>Expo Participation & Stalls History</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total Applications</span>
                    <p className="font-extrabold text-slate-900 mt-0.5">{selectedCompany.total_applications} Bookings</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Active Stalls</span>
                    <p className="font-extrabold text-emerald-600 mt-0.5">{selectedCompany.active_stalls} Confirmed</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Participated Expos</span>
                    <p className="font-extrabold text-indigo-600 mt-0.5">{selectedCompany.events_count} Events</p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="text-slate-400 font-medium">Expos Participated:</span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(selectedCompany.events_list || []).map((evt, idx) => (
                      <span key={idx} className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-800 shadow-2xs">
                        {evt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setSelectedCompany(null)}
                className="text-xs font-bold rounded-xl h-10 px-4 cursor-pointer"
              >
                Close Drawer
              </Button>

              <div className="flex items-center gap-2">
                {selectedCompany.email && (
                  <a
                    href={`mailto:${selectedCompany.email}`}
                    className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition"
                  >
                    <Mail size={14} />
                    <span>Email Vendor</span>
                  </a>
                )}
                {selectedCompany.mobile && (
                  <a
                    href={`tel:${selectedCompany.mobile}`}
                    className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white text-xs font-extrabold hover:brightness-110 transition shadow-xs"
                  >
                    <Phone size={14} />
                    <span>Call Vendor</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}