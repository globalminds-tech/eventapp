import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Download,
  IndianRupee,
  Building2,
  CheckCircle2,
  Receipt,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import axiosClient from "@/shared/api/axiosClient";

export const ExhibitorBillingPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get("/api/v1/finances/exhibitor/invoices");
      if (res.data && res.data.success) {
        setInvoices(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load exhibitor invoices:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter(item =>
    (item.invoice_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.billing_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSpent = invoices.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Exhibitor Billings & Invoices
            </h1>
            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 px-2.5 py-0.5 font-bold text-[11px]">
              GST Tax Invoices
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Download formal GST Tax Invoices for exhibition stall rentals to claim corporate Input Tax Credit (ITC).
          </p>
        </div>
      </div>

      {/* ── KPI METRICS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Stall Spend</span>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ₹{totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] font-medium text-slate-500 mt-1">Paid for exhibition space & amenities</p>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Invoices</span>
          <div className="text-2xl font-black text-purple-600 mt-2">
            {invoices.length}
          </div>
          <p className="text-[11px] font-medium text-slate-500 mt-1">Stall payment receipts generated</p>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">GST Input Credit Status</span>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg mt-2">
            <CheckCircle2 size={20} />
            <span>Eligible for 18% ITC</span>
          </div>
          <p className="text-[11px] font-medium text-slate-500 mt-1">Tax breakdown itemized on each invoice</p>
        </Card>
      </div>

      {/* ── INVOICES TABLE ── */}
      <Card className="border-slate-200/80 shadow-sm bg-white rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
            <input
              placeholder="Search invoice number..."
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
                <th className="py-3.5 px-4">Invoice No</th>
                <th className="py-3.5 px-4">Invoice Date</th>
                <th className="py-3.5 px-4">Billed Company</th>
                <th className="py-3.5 px-4">Base Amount</th>
                <th className="py-3.5 px-4">CGST (9%)</th>
                <th className="py-3.5 px-4">SGST (9%)</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Receipt size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold">No stall invoices found</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-slate-900">{inv.invoice_number}</td>
                    <td className="py-4 px-4 text-slate-600">{inv.created_at ? inv.created_at.substring(0, 10) : ""}</td>
                    <td className="py-4 px-4 font-bold text-slate-900">{inv.billing_name}</td>
                    <td className="py-4 px-4 font-semibold text-slate-800">₹{inv.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    <td className="py-4 px-4 text-slate-600">₹{inv.cgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    <td className="py-4 px-4 text-slate-600">₹{inv.sgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    <td className="py-4 px-4 font-extrabold text-emerald-600">₹{inv.total_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    <td className="py-4 px-4 text-center">
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 px-2.5 py-0.5 font-bold">
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => alert(`Downloading GST Tax Invoice ${inv.invoice_number}`)}
                        className="h-8 gap-1.5 text-xs font-bold text-slate-700 hover:text-sky-600 rounded-lg cursor-pointer"
                      >
                        <Download size={14} />
                        <span>PDF</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
