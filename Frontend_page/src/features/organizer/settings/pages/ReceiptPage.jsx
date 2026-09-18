import React, { useState, useEffect, useMemo } from "react";
import {
  Eye,
  Search,
  Receipt as ReceiptIcon,
  Download,
  IndianRupee,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Filter,
  X,
  RefreshCw,
  Calendar,
  Ticket,
  Store,
  Layers,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { StatCardSkeleton } from "@/components/ui/StatCardSkeleton";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/Select";
import axiosClient from "@/shared/api/axiosClient";
import { ResponsiveTableView, MobileDataCard } from "@/components/ui/ResponsiveTableView";

export const Receipt = () => {
  const [activeTab, setActiveTab] = useState("inward"); // "inward" | "payouts"
  const [searchTerm, setSearchTerm] = useState("");
  const [personFilter, setPersonFilter] = useState("ALL"); // "ALL" | "ATTENDEE" | "EXHIBITOR"
  const [eventFilter, setEventFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL"); // "ALL" | "TODAY" | "THIS_WEEK" | "THIS_MONTH"
  const [statusFilter, setStatusFilter] = useState("ALL"); // "ALL" | "SUCCESS" | "FAILED"
  const [isLoading, setIsLoading] = useState(true);
  const [financialData, setFinancialData] = useState({
    gross_gmv: 0,
    platform_deductions: 0,
    available_in_escrow: 0,
    settled_payouts: 0,
    transactions: [],
    payouts: []
  });

  const fetchLedger = async () => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get("/api/v1/finances/organizer/ledger");
      if (res.data && res.data.success) {
        setFinancialData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load organizer finances:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  // Compute total collections separated by Attendee vs Exhibitor across all transactions
  const totalsByType = useMemo(() => {
    let attendeeGross = 0;
    let exhibitorGross = 0;
    let attendeeNet = 0;
    let exhibitorNet = 0;
    let attendeeDeductions = 0;
    let exhibitorDeductions = 0;
    let attendeeCount = 0;
    let exhibitorCount = 0;

    (financialData.transactions || []).forEach((t) => {
      const g = Number(t.grossAmount || 0);
      const d = Number(t.platformFee || 0);
      const n = Number(t.netAmount || 0);
      const pType = (t.personType || "").toUpperCase();

      if (pType === "ATTENDEE") {
        attendeeGross += g;
        attendeeDeductions += d;
        attendeeNet += n;
        attendeeCount += 1;
      } else {
        exhibitorGross += g;
        exhibitorDeductions += d;
        exhibitorNet += n;
        exhibitorCount += 1;
      }
    });

    return {
      attendeeGross,
      exhibitorGross,
      attendeeNet,
      exhibitorNet,
      attendeeDeductions,
      exhibitorDeductions,
      attendeeCount,
      exhibitorCount
    };
  }, [financialData.transactions]);

  // Extract distinct event names from the ledger
  const eventOptions = useMemo(() => {
    const set = new Set();
    (financialData.transactions || []).forEach((t) => {
      if (t.eventName) set.add(t.eventName);
    });
    return Array.from(set).sort();
  }, [financialData.transactions]);

  // Comprehensive Income Filters
  const filteredTransactions = useMemo(() => {
    return (financialData.transactions || []).filter((item) => {
      // 1. Text Search Filter
      const term = searchTerm.trim().toLowerCase();
      if (term) {
        const matchesSearch =
          (item.invoiceNo || "").toLowerCase().includes(term) ||
          (item.billingName || "").toLowerCase().includes(term) ||
          (item.eventName || "").toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }

      // 2. Person Type (Attendee vs Exhibitor)
      if (personFilter !== "ALL") {
        const pType = (item.personType || "").toUpperCase();
        if (personFilter === "ATTENDEE" && pType !== "ATTENDEE") return false;
        if (personFilter === "EXHIBITOR" && pType !== "EXHIBITOR") return false;
      }

      // 3. Event Filter
      if (eventFilter !== "ALL") {
        if (item.eventName !== eventFilter) return false;
      }

      // 4. Status Filter
      if (statusFilter !== "ALL") {
        const s = (item.status || "").toUpperCase();
        if (statusFilter === "SUCCESS" && s !== "SUCCESS" && s !== "PAID") return false;
        if (statusFilter === "FAILED" && (s === "SUCCESS" || s === "PAID")) return false;
      }

      // 5. Date Period Filter
      if (dateFilter !== "ALL" && item.date) {
        const itemDate = new Date(item.date);
        const now = new Date();
        now.setHours(23, 59, 59, 999);

        if (dateFilter === "TODAY") {
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          if (itemDate < startOfToday) return false;
        } else if (dateFilter === "THIS_WEEK") {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          sevenDaysAgo.setHours(0, 0, 0, 0);
          if (itemDate < sevenDaysAgo) return false;
        } else if (dateFilter === "THIS_MONTH") {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          if (itemDate < startOfMonth) return false;
        }
      }

      return true;
    });
  }, [financialData.transactions, searchTerm, personFilter, eventFilter, statusFilter, dateFilter]);

  // Filtered Payouts
  const filteredPayouts = useMemo(() => {
    return (financialData.payouts || []).filter((item) =>
      (item.payout_ref || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.utr_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.bank_name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [financialData.payouts, searchTerm]);

  // Dynamic Filtered Income Metrics
  const filteredSummary = useMemo(() => {
    let gross = 0;
    let deductions = 0;
    let net = 0;
    let attendeeSales = 0;
    let exhibitorSales = 0;

    filteredTransactions.forEach((t) => {
      const g = Number(t.grossAmount || 0);
      const d = Number(t.platformFee || 0);
      const n = Number(t.netAmount || 0);
      gross += g;
      deductions += d;
      net += n;

      if ((t.personType || "").toUpperCase() === "ATTENDEE") {
        attendeeSales += g;
      } else {
        exhibitorSales += g;
      }
    });

    return {
      gross,
      deductions,
      net,
      attendeeSales,
      exhibitorSales,
      count: filteredTransactions.length
    };
  }, [filteredTransactions]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    personFilter !== "ALL" ||
    eventFilter !== "ALL" ||
    dateFilter !== "ALL" ||
    statusFilter !== "ALL";

  const clearAllFilters = () => {
    setSearchTerm("");
    setPersonFilter("ALL");
    setEventFilter("ALL");
    setDateFilter("ALL");
    setStatusFilter("ALL");
  };

  // CSV Export
  const exportToCSV = () => {
    if (filteredTransactions.length === 0) return;
    const headers = [
      "Invoice / Ref",
      "Date",
      "Person Type",
      "Customer Name",
      "Event",
      "Gross Sales (INR)",
      "Deductions (INR)",
      "Net Earned (INR)",
      "Status"
    ];
    const rows = filteredTransactions.map((t) => [
      `"${t.invoiceNo || ""}"`,
      `"${t.date || ""}"`,
      `"${t.personType || ""}"`,
      `"${(t.billingName || "").replace(/"/g, '""')}"`,
      `"${(t.eventName || "").replace(/"/g, '""')}"`,
      t.grossAmount || 0,
      t.platformFee || 0,
      t.netAmount || 0,
      `"${t.status || ""}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Income_Receipts_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* ── SLEEK PAGE HEADER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Billings &amp; Financial Receipts
            </h1>
            <Badge className="bg-cyan-50 text-cyan-800 border-cyan-200 px-2.5 py-0.5 font-bold text-[11px]">
              Automated Ledger
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Real-time sales collection, platform deductions, escrow balances, and bank payout receipts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLedger}
            className="rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs gap-1.5"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin text-cyan-600" : "text-slate-500"} />
            <span>Refresh</span>
          </Button>

          {activeTab === "inward" && (
            <Button
              size="sm"
              onClick={exportToCSV}
              disabled={filteredTransactions.length === 0}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm gap-1.5 border-none cursor-pointer disabled:opacity-50"
            >
              <Download size={13} />
              <span>Export CSV ({filteredTransactions.length})</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── 4 EXECUTIVE FINANCIAL KPI CARDS WITH ATTENDEE VS EXHIBITOR SEPARATION ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <StatCardSkeleton count={4} />
        ) : (
          <>
            {/* CARD 1: MONEY COLLECTED (WITH DUAL-STREAM ATTENDEE & EXHIBITOR BREAKDOWN) */}
            <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-5 flex flex-col justify-between transition hover:border-slate-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {personFilter === "ATTENDEE" ? "Attendee Money Collected" : personFilter === "EXHIBITOR" ? "Exhibitor Money Collected" : "Total Money Collected"}
                </span>
                <div className="w-9 h-9 bg-blue-50 rounded-xl text-blue-600 flex items-center justify-center border border-blue-100/70 shrink-0">
                  <IndianRupee size={18} />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  ₹{(personFilter === "ATTENDEE"
                    ? totalsByType.attendeeGross
                    : personFilter === "EXHIBITOR"
                    ? totalsByType.exhibitorGross
                    : financialData.gross_gmv
                  ).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>

                {/* Stream Separation Badges */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setPersonFilter(personFilter === "ATTENDEE" ? "ALL" : "ATTENDEE")}
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border transition cursor-pointer flex items-center gap-1 ${
                      personFilter === "ATTENDEE"
                        ? "bg-sky-500 text-white border-sky-600 shadow-2xs"
                        : "bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100"
                    }`}
                  >
                    <Ticket size={11} />
                    <span>Attendee: ₹{totalsByType.attendeeGross.toLocaleString("en-IN")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPersonFilter(personFilter === "EXHIBITOR" ? "ALL" : "EXHIBITOR")}
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border transition cursor-pointer flex items-center gap-1 ${
                      personFilter === "EXHIBITOR"
                        ? "bg-purple-600 text-white border-purple-700 shadow-2xs"
                        : "bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100"
                    }`}
                  >
                    <Store size={11} />
                    <span>Exhibitor: ₹{totalsByType.exhibitorGross.toLocaleString("en-IN")}</span>
                  </button>
                </div>
              </div>
            </Card>

            {/* CARD 2: PLATFORM DEDUCTIONS */}
            <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-5 flex flex-col justify-between transition hover:border-slate-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Platform Deductions</span>
                <div className="w-9 h-9 bg-amber-50 rounded-xl text-amber-600 flex items-center justify-center border border-amber-100/70 shrink-0">
                  <TrendingDown size={18} />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  ₹{(personFilter === "ATTENDEE"
                    ? totalsByType.attendeeDeductions
                    : personFilter === "EXHIBITOR"
                    ? totalsByType.exhibitorDeductions
                    : financialData.platform_deductions
                  ).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">Platform commission &amp; gateway fees</p>
              </div>
            </Card>

            {/* CARD 3: IN ESCROW (AVAILABLE) */}
            <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-5 flex flex-col justify-between transition hover:border-slate-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">In Escrow (Available)</span>
                <div className="w-9 h-9 bg-emerald-50 rounded-xl text-emerald-600 flex items-center justify-center border border-emerald-100/70 shrink-0">
                  <Clock size={18} />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
                  ₹{(personFilter === "ATTENDEE"
                    ? totalsByType.attendeeNet
                    : personFilter === "EXHIBITOR"
                    ? totalsByType.exhibitorNet
                    : financialData.available_in_escrow
                  ).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">Net cleared funds ready for payout</p>
              </div>
            </Card>

            {/* CARD 4: SETTLED PAYOUTS */}
            <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-5 flex flex-col justify-between transition hover:border-slate-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Settled Payouts</span>
                <div className="w-9 h-9 bg-purple-50 rounded-xl text-purple-600 flex items-center justify-center border border-purple-100/70 shrink-0">
                  <ShieldCheck size={18} />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-600 tracking-tight">
                  ₹{financialData.settled_payouts.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">Transferred directly to bank account</p>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* ── TABS SELECTOR ── */}
      <div className="flex items-center gap-2 sm:gap-3 border-b border-slate-200/80 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("inward")}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "inward"
              ? "bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Inward Sales Receipts ({financialData.transactions?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("payouts")}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "payouts"
              ? "bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Bank Payout Settlements ({financialData.payouts?.length || 0})
        </button>
      </div>

      {/* ── ADVANCED INCOME FILTERS TOOLBAR WITH SHADCN DROPDOWNS (Inward Tab Only) ── */}
      {activeTab === "inward" && (
        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-4 space-y-4 overflow-visible relative z-30">
          
          {/* Row 1: Filter Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 flex-wrap relative z-20">
            
            {/* Person Type Pill Buttons */}
            <div className="flex items-center bg-slate-100/80 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setPersonFilter("ALL")}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition cursor-pointer ${
                  personFilter === "ALL"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Sales (₹{Number(financialData.gross_gmv || 0).toLocaleString("en-IN")})
              </button>

              <button
                type="button"
                onClick={() => setPersonFilter("ATTENDEE")}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  personFilter === "ATTENDEE"
                    ? "bg-sky-50 text-sky-800 border border-sky-200 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Ticket size={13} className="text-sky-600" />
                <span>Attendee Tickets (₹{totalsByType.attendeeGross.toLocaleString("en-IN")})</span>
              </button>

              <button
                type="button"
                onClick={() => setPersonFilter("EXHIBITOR")}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  personFilter === "EXHIBITOR"
                    ? "bg-purple-50 text-purple-800 border border-purple-200 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Store size={13} className="text-purple-600" />
                <span>Exhibitor Stalls (₹{totalsByType.exhibitorGross.toLocaleString("en-IN")})</span>
              </button>
            </div>

            {/* SHADCN DROPDOWN FILTERS & SEARCH */}
            <div className="flex items-center gap-2.5 flex-wrap">
              
              {/* SHADCN DROPDOWN 1: Event Filter */}
              <div className="w-48 sm:w-56">
                <Select
                  value={eventFilter}
                  onValueChange={(val) => setEventFilter(val)}
                >
                  <SelectTrigger className="h-8 text-xs font-bold bg-slate-50 border-slate-200 rounded-xl">
                    <div className="flex items-center gap-1.5 truncate">
                      <Layers size={13} className="text-slate-400 shrink-0" />
                      <SelectValue placeholder="All Events" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl z-50">
                    <SelectItem value="ALL">All Events ({eventOptions.length})</SelectItem>
                    {eventOptions.map((ev) => (
                      <SelectItem key={ev} value={ev}>
                        {ev}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* SHADCN DROPDOWN 2: Date Period Filter */}
              <div className="w-36">
                <Select
                  value={dateFilter}
                  onValueChange={(val) => setDateFilter(val)}
                >
                  <SelectTrigger className="h-8 text-xs font-bold bg-slate-50 border-slate-200 rounded-xl">
                    <div className="flex items-center gap-1.5 truncate">
                      <Calendar size={13} className="text-slate-400 shrink-0" />
                      <SelectValue placeholder="Date Period" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl z-50">
                    <SelectItem value="ALL">All Time</SelectItem>
                    <SelectItem value="TODAY">Today</SelectItem>
                    <SelectItem value="THIS_WEEK">Last 7 Days</SelectItem>
                    <SelectItem value="THIS_MONTH">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* SHADCN DROPDOWN 3: Status Filter */}
              <div className="w-36">
                <Select
                  value={statusFilter}
                  onValueChange={(val) => setStatusFilter(val)}
                >
                  <SelectTrigger className="h-8 text-xs font-bold bg-slate-50 border-slate-200 rounded-xl">
                    <div className="flex items-center gap-1.5 truncate">
                      <CheckCircle2 size={13} className="text-slate-400 shrink-0" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl z-50">
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="SUCCESS">Success / Paid</SelectItem>
                    <SelectItem value="FAILED">Pending / Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Search invoice, customer..."
                  className="pl-8 pr-7 py-1.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none text-xs font-semibold w-44 sm:w-48 h-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer p-0"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Clear All Filters Button */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs font-extrabold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer px-1 py-1"
                >
                  <X size={13} />
                  <span>Reset</span>
                </button>
              )}
            </div>

          </div>

          {/* Row 2: Dynamic Filtered Income Summary Strip */}
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/70 flex flex-wrap items-center justify-between gap-3 text-xs relative z-10">
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">
                  {personFilter === "ATTENDEE" ? "Attendee Sales:" : personFilter === "EXHIBITOR" ? "Exhibitor Sales:" : "Filtered Sales:"}
                </span>
                <span className="font-extrabold text-slate-900 text-sm">
                  ₹{filteredSummary.gross.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="h-4 w-px bg-slate-200 hidden sm:block" />

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Deductions:</span>
                <span className="font-bold text-amber-700">
                  -₹{filteredSummary.deductions.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="h-4 w-px bg-slate-200 hidden sm:block" />

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Net Earned:</span>
                <span className="font-extrabold text-emerald-600 text-sm">
                  ₹{filteredSummary.net.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
              <span>Showing {filteredSummary.count} of {financialData.transactions?.length || 0} transactions</span>
              {hasActiveFilters && (
                <span className="bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-md font-extrabold">
                  ● Filter Active
                </span>
              )}
            </div>
          </div>

        </Card>
      )}

      {/* ── SHADCN DATA TABLE ── */}
      <Card className="border-slate-200/80 shadow-sm bg-white rounded-2xl overflow-hidden">
        {activeTab === "payouts" && (
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
              <input
                placeholder="Search UTR or payout ref..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 focus:ring-2 focus:ring-sky-500 outline-none text-xs font-semibold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="p-4">
          {activeTab === "inward" ? (
            <ResponsiveTableView
              data={filteredTransactions}
              keyField="invoiceNo"
              loading={isLoading}
              columnCount={9}
              columns={[
                { header: "Invoice / Ref", className: "py-3.5 px-4" },
                { header: "Date", className: "py-3.5 px-4" },
                { header: "Person", className: "py-3.5 px-4" },
                { header: "Customer Name", className: "py-3.5 px-4" },
                { header: "Event", className: "py-3.5 px-4" },
                { header: "Gross Sales", className: "py-3.5 px-4" },
                { header: "Deductions", className: "py-3.5 px-4" },
                { header: "Net Earned", className: "py-3.5 px-4" },
                { header: "Status", className: "py-3.5 px-4 text-center" },
              ]}
              emptyMessage={
                hasActiveFilters
                  ? "No transactions match your filter criteria. Try resetting filters."
                  : "No inward transactions recorded yet."
              }
              renderDesktopTable={() => (
                <div className="overflow-x-auto responsive-table-wrap">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Invoice / Ref</th>
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4">Person</th>
                        <th className="py-3.5 px-4">Customer Name</th>
                        <th className="py-3.5 px-4">Event</th>
                        <th className="py-3.5 px-4">Gross Sales</th>
                        <th className="py-3.5 px-4">Deductions</th>
                        <th className="py-3.5 px-4">Net Earned</th>
                        <th className="py-3.5 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                      {filteredTransactions.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-4 font-mono font-bold text-slate-900">{item.invoiceNo}</td>
                          <td className="py-4 px-4 text-slate-600">{item.date}</td>
                          <td className="py-4 px-4">
                            <Badge className={item.personType === "Exhibitor" ? "bg-purple-100 text-purple-800 border-purple-200 font-bold" : "bg-sky-100 text-sky-800 border-sky-200 font-bold"}>
                              {item.personType}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 font-bold text-slate-900">{item.billingName}</td>
                          <td className="py-4 px-4 font-semibold text-slate-800">{item.eventName}</td>
                          <td className="py-4 px-4 font-bold text-slate-900">₹{item.grossAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                          <td className="py-4 px-4 text-amber-600 font-semibold">-₹{item.platformFee.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                          <td className="py-4 px-4 font-extrabold text-emerald-600">₹{item.netAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                          <td className="py-4 px-4 text-center">
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 px-2.5 py-0.5 font-bold">
                              {item.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              renderMobileCard={(item) => (
                <MobileDataCard key={item.invoiceNo || Math.random()}>
                  <MobileDataCard.Header
                    title={item.billingName || "Customer"}
                    subtitle={`${item.invoiceNo} • ${item.eventName || "Event"}`}
                    statusBadge={
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 px-2.5 py-0.5 font-bold text-[10px]">
                        {item.status || "Completed"}
                      </Badge>
                    }
                  />
                  <MobileDataCard.Grid
                    items={[
                      { label: "Date", value: item.date },
                      { label: "Person", value: <Badge className={item.personType === "Exhibitor" ? "bg-purple-100 text-purple-800" : "bg-sky-100 text-sky-800"}>{item.personType}</Badge> },
                      { label: "Gross", value: `₹${Number(item.grossAmount || 0).toLocaleString("en-IN")}` },
                      { label: "Net Earned", value: <span className="font-extrabold text-emerald-600">₹{Number(item.netAmount || 0).toLocaleString("en-IN")}</span> }
                    ]}
                  />
                </MobileDataCard>
              )}
            />
          ) : (
            <ResponsiveTableView
              data={filteredPayouts}
              keyField="payout_ref"
              loading={isLoading}
              columnCount={8}
              columns={[
                { header: "Payout Ref", className: "py-3.5 px-4" },
                { header: "Settled Date", className: "py-3.5 px-4" },
                { header: "Bank Account", className: "py-3.5 px-4" },
                { header: "IFSC", className: "py-3.5 px-4" },
                { header: "Bank UTR Number", className: "py-3.5 px-4" },
                { header: "Mode", className: "py-3.5 px-4" },
                { header: "Amount", className: "py-3.5 px-4" },
                { header: "Status", className: "py-3.5 px-4 text-center" },
              ]}
              emptyMessage="No bank payout settlements recorded yet."
              renderDesktopTable={() => (
                <div className="overflow-x-auto responsive-table-wrap">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Payout Ref</th>
                        <th className="py-3.5 px-4">Settled Date</th>
                        <th className="py-3.5 px-4">Bank Account</th>
                        <th className="py-3.5 px-4">IFSC</th>
                        <th className="py-3.5 px-4">Bank UTR Number</th>
                        <th className="py-3.5 px-4">Mode</th>
                        <th className="py-3.5 px-4">Amount</th>
                        <th className="py-3.5 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                      {filteredPayouts.map((payout, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-4 font-mono font-bold text-slate-900">{payout.payout_ref}</td>
                          <td className="py-4 px-4 text-slate-600">{payout.settled_at ? payout.settled_at.substring(0, 10) : "Pending"}</td>
                          <td className="py-4 px-4 font-semibold text-slate-800">{payout.bank_name} ({payout.account_number_masked})</td>
                          <td className="py-4 px-4 font-mono text-slate-600">{payout.ifsc_code}</td>
                          <td className="py-4 px-4 font-mono font-bold text-blue-600">{payout.utr_number || "—"}</td>
                          <td className="py-4 px-4">
                            <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                              {payout.disbursement_mode}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 font-extrabold text-slate-900">₹{payout.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                          <td className="py-4 px-4 text-center">
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 px-2.5 py-0.5 font-bold">
                              {payout.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              renderMobileCard={(payout) => (
                <MobileDataCard key={payout.payout_ref || Math.random()}>
                  <MobileDataCard.Header
                    title={payout.bank_name || "Bank Settlement"}
                    subtitle={`${payout.payout_ref} • ${payout.account_number_masked || ""}`}
                    statusBadge={
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 px-2.5 py-0.5 font-bold text-[10px]">
                        {payout.status || "Settled"}
                      </Badge>
                    }
                  />
                  <MobileDataCard.Grid
                    items={[
                      { label: "Date", value: payout.settled_at ? payout.settled_at.substring(0, 10) : "Pending" },
                      { label: "Bank UTR", value: <span className="font-mono text-blue-600 font-bold">{payout.utr_number || "—"}</span> },
                      { label: "Disbursement Mode", value: payout.disbursement_mode || "NEFT" },
                      { label: "Amount Settled", value: <span className="font-extrabold text-slate-900">₹{Number(payout.amount || 0).toLocaleString("en-IN")}</span> }
                    ]}
                  />
                </MobileDataCard>
              )}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default Receipt;