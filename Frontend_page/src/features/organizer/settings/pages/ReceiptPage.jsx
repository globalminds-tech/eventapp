import React, { useState, useEffect } from "react";
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
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import axiosClient from "@/shared/api/axiosClient";
import { ResponsiveTableView, MobileDataCard } from "@/components/ui/ResponsiveTableView";

export const Receipt = () => {
  const [activeTab, setActiveTab] = useState("inward"); // "inward" | "payouts"
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredTransactions = (financialData.transactions || []).filter(item =>
    (item.invoiceNo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.billingName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.eventName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPayouts = (financialData.payouts || []).filter(item =>
    (item.payout_ref || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.utr_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.bank_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* ── SLEEK PAGE HEADER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Billings & Financial Receipts
            </h1>
            <Badge className="bg-cyan-50 text-cyan-800 border-cyan-200 px-2.5 py-0.5 font-bold text-[11px]">
              Automated Ledger
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Real-time sales collection, platform deductions, escrow balances, and bank payout receipts.
          </p>
        </div>
      </div>

      {/* ── 4 EXECUTIVE FINANCIAL KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Money Collected</span>
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <IndianRupee size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{financialData.gross_gmv.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] font-medium text-slate-500 mt-1">Gross sales from tickets & stalls</p>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Platform Deductions</span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{financialData.platform_deductions.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] font-medium text-slate-500 mt-1">Platform commission & gateway fees</p>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">In Escrow (Available)</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            ₹{financialData.available_in_escrow.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] font-medium text-slate-500 mt-1">Net cleared funds ready for payout</p>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Settled Payouts</span>
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600">
            ₹{financialData.settled_payouts.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] font-medium text-slate-500 mt-1">Transferred directly to bank account</p>
        </Card>
      </div>

      {/* ── TABS SELECTOR ── */}
      <div className="flex items-center gap-2 sm:gap-3 border-b border-slate-200/80 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("inward")}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "inward"
              ? "bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Inward Sales Receipts ({filteredTransactions.length})
        </button>

        <button
          onClick={() => setActiveTab("payouts")}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "payouts"
              ? "bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Bank Payout Settlements ({filteredPayouts.length})
        </button>
      </div>

      {/* ── SHADCN DATA TABLE ── */}
      <Card className="border-slate-200/80 shadow-sm bg-white rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
            <input
              placeholder={activeTab === "inward" ? "Search invoice no or name..." : "Search UTR or payout ref..."}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 focus:ring-2 focus:ring-sky-500 outline-none text-xs font-semibold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

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
              emptyMessage="No inward transactions recorded yet."
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
                            <Badge className={item.personType === "Exhibitor" ? "bg-purple-100 text-purple-800" : "bg-sky-100 text-sky-800"}>
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
                      { label: "Date", value: item.date || "—" },
                      { label: "Buyer Type", value: <Badge className={item.personType === "Exhibitor" ? "bg-purple-100 text-purple-800 text-[10px]" : "bg-sky-100 text-sky-800 text-[10px]"}>{item.personType || "Attendee"}</Badge> },
                      { label: "Gross Amount", value: `₹${Number(item.grossAmount || 0).toLocaleString("en-IN")}` },
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
                { header: "Date", className: "py-3.5 px-4" },
                { header: "Bank Account", className: "py-3.5 px-4" },
                { header: "IFSC", className: "py-3.5 px-4" },
                { header: "Bank UTR Number", className: "py-3.5 px-4" },
                { header: "Mode", className: "py-3.5 px-4" },
                { header: "Amount", className: "py-3.5 px-4" },
                { header: "Status", className: "py-3.5 px-4 text-center" },
              ]}
              emptyMessage="No bank payouts recorded yet."
              renderDesktopTable={() => (
                <div className="overflow-x-auto responsive-table-wrap">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Payout Ref</th>
                        <th className="py-3.5 px-4">Date</th>
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