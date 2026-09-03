import React, { useState, useEffect } from "react";
import { Eye, ChevronLeft, ChevronRight, Search, X, Calendar, Receipt as ReceiptIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Select, SelectItem } from "@/components/ui/Select";

export const Receipt = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([
    {
      invoiceNo: "INV-2026-001",
      date: "2026-09-15",
      type: "Ticket Payout",
      personType: "Attendee",
      billingName: "Rahul Kumar",
      visitorName: "Rahul Kumar",
      vehicleNo: "TN-01-AB-1234",
      eventName: "MRC Grand Music Fest 2026",
      amount: "1,996",
      status: "Paid",
      createdBy: "Organizer System",
      createdOn: "2026-09-15"
    },
    {
      invoiceNo: "INV-2026-002",
      date: "2026-09-18",
      type: "Stall Registration",
      personType: "Exhibitor",
      billingName: "TechCorp Solutions",
      visitorName: "Suresh Raina",
      vehicleNo: "TN-09-XY-9876",
      eventName: "Valluvar Kottam Craft Expo",
      amount: "12,500",
      status: "Paid",
      createdBy: "Admin Approval",
      createdOn: "2026-09-18"
    }
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredData = data.filter(item =>
    (item.invoiceNo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.billingName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.eventName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
              Financial Ledger
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Download payment receipts, invoice history, payout settlements, and transaction logs.
          </p>
        </div>
      </div>

      {/* ── FILTER SECTION ── */}
      <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              From Date
            </label>
            <input
              type="date"
              id="fromDate"
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200/80 focus:ring-2 focus:ring-sky-500 outline-none text-slate-800 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              To Date
            </label>
            <input
              type="date"
              id="toDate"
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200/80 focus:ring-2 focus:ring-sky-500 outline-none text-slate-800 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <Select
              label="Transaction Type"
              defaultValue="All Transactions"
              triggerClassName="py-2 px-3 rounded-xl bg-slate-50 border-slate-200/80 text-xs font-semibold h-[38px] focus:ring-sky-500"
            >
              <SelectItem value="All Transactions">All Transactions</SelectItem>
              <SelectItem value="Ticket Sales Payout">Ticket Sales Payout</SelectItem>
              <SelectItem value="Stall Registration Fee">Stall Registration Fee</SelectItem>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Select
              label="Event Selection"
              defaultValue="All Events"
              triggerClassName="py-2 px-3 rounded-xl bg-slate-50 border-slate-200/80 text-xs font-semibold h-[38px] focus:ring-sky-500"
            >
              <SelectItem value="All Events">All Events</SelectItem>
              <SelectItem value="MRC Grand Music Fest 2026">MRC Grand Music Fest 2026</SelectItem>
              <SelectItem value="Valluvar Kottam Craft Expo">Valluvar Kottam Craft Expo</SelectItem>
            </Select>
          </div>
        </div>
      </Card>

      {/* ── SHADCN RECEIPT DATA TABLE ── */}
      <Card className="border-slate-200/80 shadow-sm bg-white rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative w-72">
            <Search className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
            <input
              placeholder="Search invoice no or name..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 focus:ring-2 focus:ring-sky-500 outline-none text-xs font-semibold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center">Action</th>
                <th className="py-3.5 px-4">Invoice No</th>
                <th className="py-3.5 px-4">Invoice Date</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Billing Name</th>
                <th className="py-3.5 px-4">Event Name</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <ReceiptIcon size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold">No receipts found matching your filter</p>
                  </td>
                </tr>
              ) : (
                currentData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => alert(`Downloading Invoice ${item.invoiceNo}`)}
                        className="h-8 w-8 p-0 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg cursor-pointer"
                        title="Download Receipt PDF"
                      >
                        <Eye size={16} />
                      </Button>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-900">{item.invoiceNo}</td>
                    <td className="py-4 px-4 text-slate-600">{item.date}</td>
                    <td className="py-4 px-4 text-slate-600">{item.type}</td>
                    <td className="py-4 px-4 font-bold text-slate-900">{item.billingName}</td>
                    <td className="py-4 px-4 font-semibold text-slate-800">{item.eventName}</td>
                    <td className="py-4 px-4 font-extrabold text-slate-900">₹{item.amount}</td>
                    <td className="py-4 px-4 text-center">
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 px-2.5 py-0.5 font-bold">
                        {item.status}
                      </Badge>
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