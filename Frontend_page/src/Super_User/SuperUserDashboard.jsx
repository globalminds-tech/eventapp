import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Radio,
  Clock,
  CheckCircle2,
  Users,
  UserCheck,
  Building2,
  Store,
  IndianRupee,
  TrendingUp,
  Receipt,
  Landmark,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { getDashboardStats } from "@/Services/eventService";

const formatIndianCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return "—";
  const num = Math.round(Number(amount));
  if (num >= 10000000) {
    const cr = (num / 10000000).toFixed(2);
    return `₹${cr.endsWith(".00") ? cr.slice(0, -3) : cr} Cr`;
  }
  if (num >= 100000) {
    const lakh = (num / 100000).toFixed(2);
    return `₹${lakh.endsWith(".00") ? lakh.slice(0, -3) : lakh} L`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
};

const formatIndianNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return "—";
  return Number(num).toLocaleString("en-IN");
};

export default function SuperUserDashboard() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [financeLoading, setFinanceLoading] = useState(false);

  useEffect(() => {
    fetchStats(selectedPeriod, true);
  }, []);

  const fetchStats = async (period, isFullLoad = false) => {
    if (isFullLoad) {
      setLoading(true);
    } else {
      setFinanceLoading(true);
    }

    try {
      const res = await getDashboardStats(period);
      const data = res?.data || res;
      setStats(data);
    } catch (err) {
      console.error("Dashboard stats fetch error:", err);
      setStats({
        total_events: 0,
        live_events: 0,
        upcoming_events: 0,
        completed_events: 0,
        total_users: 0,
        total_attendees: 0,
        total_organizers: 0,
        total_exhibitors: 0,
        gross_gmv: 0,
        platform_revenue: 0,
        organizer_payable: 0,
        pending_payouts: 0
      });
    } finally {
      setLoading(false);
      setFinanceLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod) => {
    setSelectedPeriod(newPeriod);
    fetchStats(newPeriod, false);
  };

  const periodOptions = [
    { key: "today", label: "Today" },
    { key: "7d", label: "7 Days" },
    { key: "30d", label: "30 Days" },
    { key: "3m", label: "3 Months" },
    { key: "12m", label: "1 Year" },
  ];

  return (
    <div className="h-full flex-1 flex flex-col justify-between select-none text-slate-800 font-sans max-w-full gap-3">
      
      {/* ── CLEAN ELEGANT HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/70 pb-2.5 shrink-0">
        <div className="space-y-0.5">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Super Admin Executive Dashboard
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Real-time governance performance across events, platform users, and financial settlements.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchStats(selectedPeriod)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:border-slate-300 transition shadow-2xs cursor-pointer self-start sm:self-auto shrink-0"
        >
          <RefreshCw size={13} className={loading ? "animate-spin text-purple-600" : "text-slate-500"} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* ── EVENTS OVERVIEW (ROW 1 - STRETCHES VERTICALLY) ── */}
      <div className="flex-1 flex flex-col justify-between py-0.5 min-h-0">
        <div className="flex items-center justify-between px-0.5 mb-1.5 shrink-0">
          <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            Events Overview
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
          {/* Total Events */}
          <Card
            onClick={() => navigate("/superuser/approvals?tab=all")}
            className="group border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_-4px_rgba(147,51,234,0.1)] hover:border-purple-300 transition-all duration-200 cursor-pointer rounded-2xl bg-white p-4.5 flex flex-col justify-between h-full"
          >
            <CardContent className="p-0 flex flex-col justify-between h-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Events</span>
                <div className="p-1.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-100/80">
                  <Calendar size={16} />
                </div>
              </div>

              <div>
                {loading ? (
                  <Skeleton className="w-20 h-8 rounded-lg" />
                ) : (
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {formatIndianNumber(stats?.total_events)}
                  </h3>
                )}
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Total created events</p>
              </div>

              <div className="flex items-center justify-end text-[11px] pt-2 border-t border-slate-100">
                <span className="font-extrabold text-purple-600 group-hover:translate-x-0.5 flex items-center gap-1 transition">
                  <span>View Events</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Live Events */}
          <Card
            onClick={() => navigate("/superuser/approvals?tab=live")}
            className="group border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_-4px_rgba(239,68,68,0.1)] hover:border-red-300 transition-all duration-200 cursor-pointer rounded-2xl bg-white p-4.5 flex flex-col justify-between h-full"
          >
            <CardContent className="p-0 flex flex-col justify-between h-full space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Live Events</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                </div>
                <div className="p-1.5 bg-red-50 text-red-600 rounded-xl border border-red-100/80">
                  <Radio size={16} />
                </div>
              </div>

              <div>
                {loading ? (
                  <Skeleton className="w-16 h-8 rounded-lg" />
                ) : (
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {formatIndianNumber(stats?.live_events)}
                  </h3>
                )}
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Currently active shows</p>
              </div>

              <div className="flex items-center justify-end text-[11px] pt-2 border-t border-slate-100">
                <span className="font-extrabold text-purple-600 group-hover:translate-x-0.5 flex items-center gap-1 transition">
                  <span>View Events</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card
            onClick={() => navigate("/superuser/approvals?tab=upcoming")}
            className="group border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_-4px_rgba(16,185,129,0.1)] hover:border-emerald-300 transition-all duration-200 cursor-pointer rounded-2xl bg-white p-4.5 flex flex-col justify-between h-full"
          >
            <CardContent className="p-0 flex flex-col justify-between h-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Upcoming</span>
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100/80">
                  <Clock size={16} />
                </div>
              </div>

              <div>
                {loading ? (
                  <Skeleton className="w-16 h-8 rounded-lg" />
                ) : (
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {formatIndianNumber(stats?.upcoming_events)}
                  </h3>
                )}
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Approved & scheduled</p>
              </div>

              <div className="flex items-center justify-end text-[11px] pt-2 border-t border-slate-100">
                <span className="font-extrabold text-purple-600 group-hover:translate-x-0.5 flex items-center gap-1 transition">
                  <span>View Events</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Completed Events */}
          <Card
            onClick={() => navigate("/superuser/approvals?tab=completed")}
            className="group border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_-4px_rgba(100,116,139,0.1)] hover:border-slate-400 transition-all duration-200 cursor-pointer rounded-2xl bg-white p-4.5 flex flex-col justify-between h-full"
          >
            <CardContent className="p-0 flex flex-col justify-between h-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Completed</span>
                <div className="p-1.5 bg-slate-100 text-slate-600 rounded-xl border border-slate-200/80">
                  <CheckCircle2 size={16} />
                </div>
              </div>

              <div>
                {loading ? (
                  <Skeleton className="w-20 h-8 rounded-lg" />
                ) : (
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {formatIndianNumber(stats?.completed_events)}
                  </h3>
                )}
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Concluded show history</p>
              </div>

              <div className="flex items-center justify-end text-[11px] pt-2 border-t border-slate-100">
                <span className="font-extrabold text-purple-600 group-hover:translate-x-0.5 flex items-center gap-1 transition">
                  <span>View Events</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── PLATFORM USERS (ROW 2 - STRETCHES VERTICALLY) ── */}
      <div className="flex-1 flex flex-col justify-between py-0.5 min-h-0">
        <div className="flex items-center justify-between px-0.5 mb-1.5 shrink-0">
          <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            Platform Users
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
          {/* Total Users */}
          <Card
            onClick={() => navigate("/superuser/kyc?tab=all")}
            className="group border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_-4px_rgba(37,99,235,0.1)] hover:border-blue-300 transition-all duration-200 cursor-pointer rounded-2xl bg-white p-4.5 flex flex-col justify-between h-full"
          >
            <CardContent className="p-0 flex flex-col justify-between h-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Users</span>
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100/80">
                  <Users size={16} />
                </div>
              </div>

              <div>
                {loading ? (
                  <Skeleton className="w-24 h-8 rounded-lg" />
                ) : (
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {formatIndianNumber(stats?.total_users)}
                  </h3>
                )}
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Registered accounts</p>
              </div>

              <div className="flex items-center justify-end text-[11px] pt-2 border-t border-slate-100">
                <span className="font-extrabold text-purple-600 group-hover:translate-x-0.5 flex items-center gap-1 transition">
                  <span>View Users</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Attendees */}
          <Card
            onClick={() => navigate("/superuser/kyc?tab=attendees")}
            className="group border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_-4px_rgba(2,132,199,0.1)] hover:border-sky-300 transition-all duration-200 cursor-pointer rounded-2xl bg-white p-4.5 flex flex-col justify-between h-full"
          >
            <CardContent className="p-0 flex flex-col justify-between h-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Attendees</span>
                <div className="p-1.5 bg-sky-50 text-sky-600 rounded-xl border border-sky-100/80">
                  <UserCheck size={16} />
                </div>
              </div>

              <div>
                {loading ? (
                  <Skeleton className="w-24 h-8 rounded-lg" />
                ) : (
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {formatIndianNumber(stats?.total_attendees)}
                  </h3>
                )}
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Ticket buyers & visitors</p>
              </div>

              <div className="flex items-center justify-end text-[11px] pt-2 border-t border-slate-100">
                <span className="font-extrabold text-purple-600 group-hover:translate-x-0.5 flex items-center gap-1 transition">
                  <span>View Users</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Organizers */}
          <Card
            onClick={() => navigate("/superuser/kyc?tab=organizers")}
            className="group border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_-4px_rgba(79,70,229,0.1)] hover:border-indigo-300 transition-all duration-200 cursor-pointer rounded-2xl bg-white p-4.5 flex flex-col justify-between h-full"
          >
            <CardContent className="p-0 flex flex-col justify-between h-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Organizers</span>
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100/80">
                  <Building2 size={16} />
                </div>
              </div>

              <div>
                {loading ? (
                  <Skeleton className="w-20 h-8 rounded-lg" />
                ) : (
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {formatIndianNumber(stats?.total_organizers)}
                  </h3>
                )}
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Event hosts & creators</p>
              </div>

              <div className="flex items-center justify-end text-[11px] pt-2 border-t border-slate-100">
                <span className="font-extrabold text-purple-600 group-hover:translate-x-0.5 flex items-center gap-1 transition">
                  <span>View Orgs</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Exhibitors */}
          <Card
            onClick={() => navigate("/superuser/kyc?tab=exhibitors")}
            className="group border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_-4px_rgba(13,148,136,0.1)] hover:border-teal-300 transition-all duration-200 cursor-pointer rounded-2xl bg-white p-4.5 flex flex-col justify-between h-full"
          >
            <CardContent className="p-0 flex flex-col justify-between h-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Exhibitors</span>
                <div className="p-1.5 bg-teal-50 text-teal-600 rounded-xl border border-teal-100/80">
                  <Store size={16} />
                </div>
              </div>

              <div>
                {loading ? (
                  <Skeleton className="w-20 h-8 rounded-lg" />
                ) : (
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {formatIndianNumber(stats?.total_exhibitors)}
                  </h3>
                )}
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Stall vendors & partners</p>
              </div>

              <div className="flex items-center justify-end text-[11px] pt-2 border-t border-slate-100">
                <span className="font-extrabold text-purple-600 group-hover:translate-x-0.5 flex items-center gap-1 transition">
                  <span>View Exhib.</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── FINANCIAL OVERVIEW (ROW 3 - STRETCHES VERTICALLY) ── */}
      <div className="flex-1 flex flex-col justify-between py-0.5 min-h-0">
        <div className="flex items-center justify-between px-0.5 mb-1.5 shrink-0">
          <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            Financial Overview
          </h2>

          {/* Date Filter specifically for Financial metrics */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/80">
            {periodOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => handlePeriodChange(opt.key)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold transition-all border-none cursor-pointer ${
                  selectedPeriod === opt.key
                    ? "bg-purple-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
          {/* Gross GMV */}
          <Card
            onClick={() => navigate("/superuser/payouts?tab=gmv")}
            className="group border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_-4px_rgba(79,70,229,0.1)] hover:border-indigo-300 transition-all duration-200 cursor-pointer rounded-2xl bg-white p-4.5 flex flex-col justify-between h-full"
          >
            <CardContent className="p-0 flex flex-col justify-between h-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Gross GMV</span>
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100/80">
                  <IndianRupee size={16} />
                </div>
              </div>

              <div>
                {loading || financeLoading ? (
                  <Skeleton className="w-28 h-8 rounded-lg" />
                ) : (
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {formatIndianCurrency(stats?.gross_gmv)}
                  </h3>
                )}
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Total gross ticket sales</p>
              </div>

              <div className="flex items-center justify-end text-[11px] pt-2 border-t border-slate-100">
                <span className="font-extrabold text-purple-600 group-hover:translate-x-0.5 flex items-center gap-1 transition">
                  <span>View Finance</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Platform Revenue */}
          <Card
            onClick={() => navigate("/superuser/payouts?tab=revenue")}
            className="group border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_-4px_rgba(16,185,129,0.1)] hover:border-emerald-300 transition-all duration-200 cursor-pointer rounded-2xl bg-white p-4.5 flex flex-col justify-between h-full"
          >
            <CardContent className="p-0 flex flex-col justify-between h-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Platform Revenue</span>
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100/80">
                  <TrendingUp size={16} />
                </div>
              </div>

              <div>
                {loading || financeLoading ? (
                  <Skeleton className="w-24 h-8 rounded-lg" />
                ) : (
                  <h3 className="text-2xl sm:text-3xl font-black text-emerald-900 tracking-tight">
                    {formatIndianCurrency(stats?.platform_revenue)}
                  </h3>
                )}
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">BookMyEvent earned fees</p>
              </div>

              <div className="flex items-center justify-end text-[11px] pt-2 border-t border-slate-100">
                <span className="font-extrabold text-purple-600 group-hover:translate-x-0.5 flex items-center gap-1 transition">
                  <span>View Finance</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Organizer Payable */}
          <Card
            onClick={() => navigate("/superuser/payouts?tab=payables")}
            className="group border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_-4px_rgba(139,92,246,0.1)] hover:border-violet-300 transition-all duration-200 cursor-pointer rounded-2xl bg-white p-4.5 flex flex-col justify-between h-full"
          >
            <CardContent className="p-0 flex flex-col justify-between h-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Organizer Payable</span>
                <div className="p-1.5 bg-violet-50 text-violet-600 rounded-xl border border-violet-100/80">
                  <Receipt size={16} />
                </div>
              </div>

              <div>
                {loading || financeLoading ? (
                  <Skeleton className="w-28 h-8 rounded-lg" />
                ) : (
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {formatIndianCurrency(stats?.organizer_payable)}
                  </h3>
                )}
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Net amount owed to hosts</p>
              </div>

              <div className="flex items-center justify-end text-[11px] pt-2 border-t border-slate-100">
                <span className="font-extrabold text-purple-600 group-hover:translate-x-0.5 flex items-center gap-1 transition">
                  <span>View Payables</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Pending Payouts */}
          <Card
            onClick={() => navigate("/superuser/payouts?tab=pending")}
            className="group border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_-4px_rgba(245,158,11,0.1)] hover:border-amber-300 transition-all duration-200 cursor-pointer rounded-2xl bg-white p-4.5 flex flex-col justify-between h-full"
          >
            <CardContent className="p-0 flex flex-col justify-between h-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Pending Payouts</span>
                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100/80">
                  <Landmark size={16} />
                </div>
              </div>

              <div>
                {loading || financeLoading ? (
                  <Skeleton className="w-24 h-8 rounded-lg" />
                ) : (
                  <h3 className="text-2xl sm:text-3xl font-black text-amber-900 tracking-tight">
                    {formatIndianCurrency(stats?.pending_payouts)}
                  </h3>
                )}
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Awaiting settlement approval</p>
              </div>

              <div className="flex items-center justify-end text-[11px] pt-2 border-t border-slate-100">
                <span className="font-extrabold text-purple-600 group-hover:translate-x-0.5 flex items-center gap-1 transition">
                  <span>View Payouts</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
