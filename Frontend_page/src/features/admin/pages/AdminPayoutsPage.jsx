import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  ArrowRight,
  Copy,
  Check,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import axiosClient from "@/shared/api/axiosClient";

export const AdminPayoutsPage = () => {
  const [queue, setQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [manualUtr, setManualUtr] = useState("");
  const [disbursementMode, setDisbursementMode] = useState("API"); // "API" | "MANUAL"
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedField, setCopiedField] = useState("");

  const fetchPayoutQueue = async () => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get("/api/v1/finances/admin/payouts");
      if (res.data && res.data.success) {
        setQueue(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load admin payout queue:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayoutQueue();
  }, []);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const handleOpenPayout = (org) => {
    setSelectedOrg(org);
    setPayoutAmount(org.available_balance.toString());
    setManualUtr("");
    setDisbursementMode("API");
  };

  const handleExecutePayout = async () => {
    if (!selectedOrg || !payoutAmount || Number(payoutAmount) <= 0) return;
    setIsProcessing(true);
    try {
      const res = await axiosClient.post("/api/v1/finances/admin/disburse-payout", {
        organizer_id: selectedOrg.organizer_id,
        amount: Number(payoutAmount),
        manual_utr: disbursementMode === "MANUAL" ? manualUtr : null
      });

      if (res.data && res.data.success) {
        alert(`Payout of ₹${payoutAmount} Disbursed Successfully! UTR: ${res.data.payout.utr_number}`);
        setSelectedOrg(null);
        fetchPayoutQueue();
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to disburse payout");
    } finally {
      setIsProcessing(false);
    }
  };

  const totalEscrow = queue.reduce((acc, curr) => acc + (curr.available_balance || 0), 0);
  const totalSettled = queue.reduce((acc, curr) => acc + (curr.settled_amount || 0), 0);

  const filteredQueue = queue.filter(item =>
    (item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.company_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Super Admin Payouts & Settlement Center
            </h1>
            <Badge className="bg-purple-50 text-purple-800 border-purple-200 px-2.5 py-0.5 font-bold text-[11px]">
              Platform Escrow
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Audit organizer KYC verification, monitor cleared escrow funds, and trigger automated API payouts or record manual bank UTR transfers.
          </p>
        </div>
      </div>

      {/* ── ESCROW KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Cleared Escrow</span>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            ₹{totalEscrow.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] font-medium text-slate-500 mt-1">Pending payout disbursement</p>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Settled via Platform</span>
          <div className="text-2xl font-black text-purple-600 mt-2">
            ₹{totalSettled.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] font-medium text-slate-500 mt-1">Disbursed to organizer bank accounts</p>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Organizers in Queue</span>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {queue.length}
          </div>
          <p className="text-[11px] font-medium text-slate-500 mt-1">With active or past balances</p>
        </Card>
      </div>

      {/* ── QUEUE TABLE ── */}
      <Card className="border-slate-200/80 shadow-sm bg-white rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
            <input
              placeholder="Search organizer or company..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 focus:ring-2 focus:ring-sky-500 outline-none text-xs font-semibold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="responsive-table-wrap">
          <table className="w-full min-w-[760px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Organizer / Company</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">KYC Status</th>
                <th className="py-3.5 px-4">Bank Account</th>
                <th className="py-3.5 px-4">IFSC</th>
                <th className="py-3.5 px-4">Cleared Balance</th>
                <th className="py-3.5 px-4">Total Settled</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Clock size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold">No organizers in payout queue</p>
                  </td>
                </tr>
              ) : (
                filteredQueue.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">
                      <div>{item.name}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{item.company_name}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">{item.email}</td>
                    <td className="py-4 px-4">
                      <Badge className={item.kyc_status === "VERIFIED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                        {item.kyc_status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 font-mono font-semibold text-slate-800">{item.bank_account}</td>
                    <td className="py-4 px-4 font-mono text-slate-600">{item.ifsc}</td>
                    <td className="py-4 px-4 font-extrabold text-emerald-600">
                      ₹{item.available_balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-800">
                      ₹{item.settled_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Button
                        size="sm"
                        disabled={item.available_balance <= 0 || item.kyc_status !== "VERIFIED"}
                        onClick={() => handleOpenPayout(item)}
                        className="h-8 gap-1.5 text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        <span>Disburse</span>
                        <ArrowRight size={14} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── PAYOUT DISBURSEMENT MODAL ── */}
      {selectedOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">Disburse Organizer Payout</h3>
                <p className="text-xs text-slate-500">Transfer funds from platform escrow to verified bank account</p>
              </div>
              <button onClick={() => setSelectedOrg(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            {/* Bank Snapshot Box */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Beneficiary:</span>
                <span className="font-bold text-slate-900">{selectedOrg.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Bank Account:</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                  <span>{selectedOrg.bank_account}</span>
                  <button onClick={() => handleCopy(selectedOrg.bank_account, "acc")} className="text-sky-600 hover:text-sky-700">
                    {copiedField === "acc" ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">IFSC Code:</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                  <span>{selectedOrg.ifsc}</span>
                  <button onClick={() => handleCopy(selectedOrg.ifsc, "ifsc")} className="text-sky-600 hover:text-sky-700">
                    {copiedField === "ifsc" ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Mode Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Disbursement Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDisbursementMode("API")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    disbursementMode === "API"
                      ? "border-sky-500 bg-sky-50 text-sky-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  ⚡ Automated API (RazorpayX)
                </button>
                <button
                  onClick={() => setDisbursementMode("MANUAL")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    disbursementMode === "MANUAL"
                      ? "border-sky-500 bg-sky-50 text-sky-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  🏦 Manual Bank Transfer (UTR)
                </button>
              </div>
            </div>

            {/* Payout Amount */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Payout Amount (INR)</label>
              <input
                type="number"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                max={selectedOrg.available_balance}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-sky-500"
              />
              <span className="text-[11px] text-slate-400">Max available: ₹{selectedOrg.available_balance.toLocaleString("en-IN")}</span>
            </div>

            {/* Manual UTR Input if Mode == MANUAL */}
            {disbursementMode === "MANUAL" && (
              <div className="space-y-1.5 animate-in fade-in">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Bank UTR / Ref Number *</label>
                <input
                  placeholder="e.g. HDFC260909123456"
                  value={manualUtr}
                  onChange={(e) => setManualUtr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setSelectedOrg(null)} className="cursor-pointer">
                Cancel
              </Button>
              <Button
                disabled={isProcessing || !payoutAmount || Number(payoutAmount) <= 0 || (disbursementMode === "MANUAL" && !manualUtr)}
                onClick={handleExecutePayout}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold cursor-pointer"
              >
                {isProcessing ? "Processing Payout..." : "Confirm & Disburse"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
