import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Landmark, IndianRupee, TrendingUp, Receipt, Clock, CheckCircle2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { getDashboardStats, getAllEvents } from "@/Services/api";

const formatIndianCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return "₹0";
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

export default function PayoutsQueue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") || "gmv").toLowerCase();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qTab = (searchParams.get("tab") || "gmv").toLowerCase();
    setActiveTab(qTab);
  }, [searchParams]);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      const [statsRes, eventsRes] = await Promise.all([
        getDashboardStats("30d"),
        getAllEvents()
      ]);
      setStats(statsRes?.data || statsRes);
      const evList = Array.isArray(eventsRes) ? eventsRes : (Array.isArray(eventsRes?.data) ? eventsRes.data : []);
      setEvents(evList);
    } catch (err) {
      console.warn("Failed to fetch financial stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: "gmv", label: "Gross GMV Transactions", icon: IndianRupee },
    { key: "revenue", label: "Platform Revenue", icon: TrendingUp },
    { key: "payables", label: "Organizer Payables", icon: Receipt },
    { key: "pending", label: "Pending Payouts", icon: Landmark },
  ];

  return (
    <div className="space-y-6 pb-12 select-none text-slate-800 font-sans">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Financial Management & Settlements Queue
            </h1>
            <Badge className="bg-purple-600 text-white font-extrabold text-[11px] px-2.5 py-0.5 border-none shadow-md shadow-purple-500/20">
              Financial Governance
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Audit Gross GMV ticket sales, track BookMyEvent platform revenue commissions (6.5%), and process organizer payouts.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchFinancialData}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:border-slate-300 transition shadow-2xs cursor-pointer self-start sm:self-auto shrink-0"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-purple-600" : "text-slate-500"} />
          <span>Refresh Finance</span>
        </button>
      </div>

      {/* ── CARD WITH TABS & FINANCIAL BREAKDOWN ── */}
      <Card className="border-slate-200/80 shadow-sm bg-white rounded-2xl p-5 space-y-4">
        
        {/* Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto scrollbar-none">
          {tabs.map((t) => {
            const isActive = activeTab === t.key;
            const IconComp = t.icon;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setActiveTab(t.key);
                  setSearchParams({ tab: t.key });
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border-none cursor-pointer flex items-center gap-2 shrink-0 ${
                  isActive
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <IconComp size={14} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: GROSS GMV ── */}
        {activeTab === "gmv" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100 gap-2">
              <div>
                <h4 className="font-extrabold text-indigo-950 text-sm">Gross Merchandise Value (GMV)</h4>
                <p className="text-xs text-indigo-700">Total gross value of confirmed ticket sales across platform</p>
              </div>
              {loading ? (
                <Skeleton className="w-32 h-8 rounded-lg" />
              ) : (
                <span className="text-2xl sm:text-3xl font-black text-indigo-950">
                  {formatIndianCurrency(stats?.gross_gmv)}
                </span>
              )}
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Event Code</th>
                    <th className="py-3 px-4">Event Name</th>
                    <th className="py-3 px-4">Pass Fee</th>
                    <th className="py-3 px-4">Passes Sold</th>
                    <th className="py-3 px-4 text-right">Gross Sales Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {loading ? (
                    [1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-3.5 px-4"><Skeleton className="h-4 w-24 rounded-md" /></td>
                        <td className="py-3.5 px-4"><Skeleton className="h-4 w-44 rounded-md" /></td>
                        <td className="py-3.5 px-4"><Skeleton className="h-4 w-20 rounded-md" /></td>
                        <td className="py-3.5 px-4"><Skeleton className="h-4 w-16 rounded-md" /></td>
                        <td className="py-3.5 px-4 text-right"><Skeleton className="h-4 w-28 rounded-md ml-auto" /></td>
                      </tr>
                    ))
                  ) : events.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No transactions recorded in database.
                      </td>
                    </tr>
                  ) : (
                    events.map((e) => {
                      const price = floatVal(e.price || e.price_inr || e.pass_fee || 0);
                      const sold = intVal(e.passesSold || e.passes_sold || 0);
                      const totalVal = price * sold;
                      return (
                        <tr key={e.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 px-4 font-mono font-bold text-purple-700">{e.event_code || e.code || `EVT-${e.id}`}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{e.event_name || e.name}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800">₹{price.toLocaleString("en-IN")}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{sold}</td>
                          <td className="py-3 px-4 text-right font-black text-indigo-950">₹{totalVal.toLocaleString("en-IN")}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 2: PLATFORM REVENUE ── */}
        {activeTab === "revenue" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-emerald-50 p-4 rounded-xl border border-emerald-100 gap-2">
              <div>
                <h4 className="font-extrabold text-emerald-950 text-sm">BookMyEvent Platform Revenue</h4>
                <p className="text-xs text-emerald-700">Earned platform service fees and ticketing commissions (6.5%)</p>
              </div>
              {loading ? (
                <Skeleton className="w-32 h-8 rounded-lg" />
              ) : (
                <span className="text-2xl sm:text-3xl font-black text-emerald-950">
                  {formatIndianCurrency(stats?.platform_revenue)}
                </span>
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Revenue Breakdown Formula</h5>
              <p className="text-xs text-slate-600">
                • Commission Fee: <span className="font-bold text-purple-700">6.5% per ticket booking</span>
              </p>
              <p className="text-xs text-slate-600">
                • Total Gross GMV: <span className="font-bold text-slate-900">{formatIndianCurrency(stats?.gross_gmv)}</span>
              </p>
              <p className="text-xs text-slate-600">
                • Net Platform Commission Earned: <span className="font-black text-emerald-700">{formatIndianCurrency(stats?.platform_revenue)}</span>
              </p>
            </div>
          </div>
        )}

        {/* ── TAB 3: ORGANIZER PAYABLES ── */}
        {activeTab === "payables" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-violet-50 p-4 rounded-xl border border-violet-100 gap-2">
              <div>
                <h4 className="font-extrabold text-violet-950 text-sm">Total Organizer Payables Liability</h4>
                <p className="text-xs text-violet-700">Net ticket sales owed to organizers after deducting 6.5% fees</p>
              </div>
              {loading ? (
                <Skeleton className="w-32 h-8 rounded-lg" />
              ) : (
                <span className="text-2xl sm:text-3xl font-black text-violet-950">
                  {formatIndianCurrency(stats?.organizer_payable)}
                </span>
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Settlement Calculation</h5>
              <p className="text-xs text-slate-600">
                • Gross GMV Sales: <span className="font-bold text-slate-900">{formatIndianCurrency(stats?.gross_gmv)}</span>
              </p>
              <p className="text-xs text-slate-600">
                • Less Platform Commission (6.5%): <span className="font-bold text-emerald-700">-{formatIndianCurrency(stats?.platform_revenue)}</span>
              </p>
              <p className="text-xs text-slate-600">
                • Net Payable to Hosts: <span className="font-black text-violet-700">{formatIndianCurrency(stats?.organizer_payable)}</span>
              </p>
            </div>
          </div>
        )}

        {/* ── TAB 4: PENDING PAYOUTS ── */}
        {activeTab === "pending" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-amber-50 p-4 rounded-xl border border-amber-100 gap-2">
              <div>
                <h4 className="font-extrabold text-amber-950 text-sm">Pending Payout Approvals Queue</h4>
                <p className="text-xs text-amber-700">Organizer payout requests awaiting bank transfer clearance</p>
              </div>
              {loading ? (
                <Skeleton className="w-32 h-8 rounded-lg" />
              ) : (
                <span className="text-2xl sm:text-3xl font-black text-amber-950">
                  {formatIndianCurrency(stats?.pending_payouts)}
                </span>
              )}
            </div>

            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/60 text-xs text-amber-900 font-medium">
              ⚡ All payouts require mandatory KYC status = <span className="font-extrabold">VERIFIED</span> before bank clearance.
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

const floatVal = (v) => (v && !isNaN(v) ? parseFloat(v) : 0);
const intVal = (v) => (v && !isNaN(v) ? parseInt(v, 10) : 0);
