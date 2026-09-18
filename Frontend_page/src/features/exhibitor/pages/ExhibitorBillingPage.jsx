import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FileText,
  Search,
  Download,
  IndianRupee,
  Building2,
  CheckCircle2,
  Receipt,
  Calendar,
  Eye,
  Printer,
  XCircle,
  Sparkles,
  Store,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { StatCardSkeleton } from "@/components/ui/StatCardSkeleton";
import { fetchExhibitorInvoices } from "@/app/store/exhibitorSlice";
import { ResponsiveTableView, MobileDataCard } from "@/components/ui/ResponsiveTableView";

export const ExhibitorBillingPage = () => {
  const dispatch = useDispatch();
  const { list: invoices, loading: isLoading } = useSelector((state) => state.exhibitor.invoices);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingInvoice, setViewingInvoice] = useState(null);

  useEffect(() => {
    dispatch(fetchExhibitorInvoices());
  }, [dispatch]);

  const filteredInvoices = (invoices || []).filter(item =>
    (item.invoice_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.billing_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.event_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paidInvoices = (invoices || []).filter(item => (item.status || "").toUpperCase() === "PAID");
  const pendingInvoices = (invoices || []).filter(item => (item.status || "").toUpperCase() !== "PAID");
  const totalSpent = paidInvoices.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 w-full select-none font-sans text-slate-800">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Exhibitor Billings &amp; Invoices
            </h1>
            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 px-2.5 py-0.5 font-bold text-[11px]">
              GST Tax Invoices
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Download formal GST Tax Invoices for exhibition stall rentals to claim corporate Input Tax Credit (ITC).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(fetchExhibitorInvoices({ force: true }))}
            className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs"
          >
            Refresh Invoices
          </Button>
        </div>
      </div>

      {/* ── 4 EXECUTIVE KPI METRICS (MATCHING REFERENCE DESIGN) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading && invoices.length === 0 ? (
          <StatCardSkeleton count={4} />
        ) : (
          <>
            {/* Card 1: Total Stall Spend */}
            <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-5 flex flex-col justify-between transition hover:border-slate-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Stall Spend</span>
                <div className="w-9 h-9 bg-emerald-50 rounded-xl text-emerald-600 flex items-center justify-center border border-emerald-100/70 shrink-0">
                  <IndianRupee size={18} />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  ₹{totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">Paid for exhibition stalls</p>
              </div>
            </Card>

            {/* Card 2: Settled Invoices */}
            <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-5 flex flex-col justify-between transition hover:border-slate-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Paid Invoices</span>
                <div className="w-9 h-9 bg-sky-50 rounded-xl text-sky-600 flex items-center justify-center border border-sky-100/70 shrink-0">
                  <Receipt size={18} />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {paidInvoices.length}
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">Payment receipts confirmed</p>
              </div>
            </Card>

            {/* Card 3: Pending Invoices */}
            <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-5 flex flex-col justify-between transition hover:border-slate-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Settlements</span>
                <div className="w-9 h-9 bg-amber-50 rounded-xl text-amber-600 flex items-center justify-center border border-amber-100/70 shrink-0">
                  <Clock size={18} className="animate-pulse" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {pendingInvoices.length}
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">Awaiting invoice payment</p>
              </div>
            </Card>

            {/* Card 4: Total Invoices */}
            <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-5 flex flex-col justify-between transition hover:border-slate-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Invoices</span>
                <div className="w-9 h-9 bg-purple-50 rounded-xl text-purple-600 flex items-center justify-center border border-purple-100/70 shrink-0">
                  <FileText size={18} />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {invoices.length}
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">Generated billing receipts</p>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* ── INVOICES TABLE ── */}
      <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              placeholder="Search invoice number or event..."
              className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ResponsiveTableView
          data={filteredInvoices}
          keyField="invoice_number"
          loading={isLoading}
          columnCount={9}
          columns={[
            { header: "Invoice No", className: "py-3.5 px-4" },
            { header: "Invoice Date", className: "py-3.5 px-4" },
            { header: "Event & Billed Company", className: "py-3.5 px-4" },
            { header: "Base Amount", className: "py-3.5 px-4" },
            { header: "CGST (9%)", className: "py-3.5 px-4" },
            { header: "SGST (9%)", className: "py-3.5 px-4" },
            { header: "Total Amount", className: "py-3.5 px-4" },
            { header: "Status", className: "py-3.5 px-4 text-center" },
            { header: "Action", className: "py-3.5 px-4 text-center" },
          ]}
          emptyMessage="No stall invoices found."
          renderDesktopTable={() => (
            <div className="responsive-table-wrap rounded-xl border border-slate-200 bg-white shadow-2xs">
              <table className="w-full min-w-[760px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Invoice No</th>
                    <th className="py-3.5 px-4">Invoice Date</th>
                    <th className="py-3.5 px-4">Event &amp; Company</th>
                    <th className="py-3.5 px-4">Base Amount</th>
                    <th className="py-3.5 px-4">CGST (9%)</th>
                    <th className="py-3.5 px-4">SGST (9%)</th>
                    <th className="py-3.5 px-4">Total Amount</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredInvoices.map((inv, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{inv.invoice_number}</td>
                      <td className="py-3.5 px-4 text-slate-600">{inv.created_at ? String(inv.created_at).substring(0, 10) : "—"}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900">{inv.event_name || inv.billing_name}</div>
                        <div className="text-[11px] text-slate-500 font-semibold">{inv.stall_area || inv.billing_name}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">₹{(Number(inv.subtotal) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td className="py-3.5 px-4 text-slate-600">₹{(Number(inv.cgst) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td className="py-3.5 px-4 text-slate-600">₹{(Number(inv.sgst) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td className="py-3.5 px-4 font-extrabold text-emerald-700">₹{(Number(inv.total_amount) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge className={`px-2.5 py-0.5 font-bold text-[10px] ${
                          (inv.status || "").toUpperCase() === "PAID"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : "bg-amber-100 text-amber-800 border-amber-200"
                        }`}>
                          {inv.status || "PAID"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingInvoice(inv)}
                          className="h-8 gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>View Invoice</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          renderMobileCard={(inv) => (
            <MobileDataCard key={inv.invoice_number || Math.random()}>
              <MobileDataCard.Header
                title={inv.event_name || inv.billing_name}
                subtitle={`Inv: ${inv.invoice_number} • ${inv.created_at ? String(inv.created_at).substring(0, 10) : ""}`}
                statusBadge={
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                    {inv.status || "PAID"}
                  </Badge>
                }
              />
              <MobileDataCard.Grid
                items={[
                  { label: "Stall", value: inv.stall_area || "Standard Booth" },
                  { label: "Base Amount", value: `₹${(Number(inv.subtotal) || 0).toLocaleString("en-IN")}` },
                  { label: "Total (incl GST)", value: <span className="font-bold text-emerald-700">₹{(Number(inv.total_amount) || 0).toLocaleString("en-IN")}</span> }
                ]}
              />
              <MobileDataCard.Actions>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewingInvoice(inv)}
                  className="text-xs font-bold w-full"
                >
                  View Tax Invoice
                </Button>
              </MobileDataCard.Actions>
            </MobileDataCard>
          )}
        />
      </Card>

      {/* ── FORMAL GST TAX INVOICE MODAL ── */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">GST Commercial Tax Invoice</h3>
                  <p className="text-[11px] font-semibold text-slate-500 font-mono">Invoice #{viewingInvoice.invoice_number}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingInvoice(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Invoice Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Invoice Date</span>
                <p className="font-extrabold text-slate-800 mt-0.5">{viewingInvoice.created_at ? String(viewingInvoice.created_at).substring(0, 10) : "2026-09-17"}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">GSTIN / Tax ID</span>
                <p className="font-extrabold text-slate-800 mt-0.5">{viewingInvoice.gstin || "33AAAAA0000A1Z5"}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Payment Status</span>
                <div className="mt-0.5">
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                    {viewingInvoice.status || "PAID"}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">ITC Claim Eligibility</span>
                <p className="font-extrabold text-emerald-700 mt-0.5">100% Eligible</p>
              </div>
            </div>

            {/* Billed To */}
            <div className="p-4 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Billed Recipient / Exhibitor</span>
              <p className="font-black text-sm text-slate-900">{viewingInvoice.billing_name || "Registered Exhibitor"}</p>
              <p className="text-slate-500 font-medium">Event: <strong className="text-slate-800">{viewingInvoice.event_name}</strong></p>
              <p className="text-slate-500 font-medium">Allocation: <strong className="text-slate-800">{viewingInvoice.stall_area}</strong></p>
            </div>

            {/* Itemized Calculation */}
            <div className="border border-slate-200/80 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Line Item Description</th>
                    <th className="py-2.5 px-4 text-right">Taxable Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">Commercial Exhibition Stall Rental</div>
                      <div className="text-[11px] text-slate-500">{viewingInvoice.stall_area} • HSN / SAC Code: 998555</div>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                      ₹{(Number(viewingInvoice.subtotal) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-600">Central GST (CGST @ 9%)</td>
                    <td className="py-2.5 px-4 text-right text-slate-600">₹{(Number(viewingInvoice.cgst) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-600">State GST (SGST @ 9%)</td>
                    <td className="py-2.5 px-4 text-right text-slate-600">₹{(Number(viewingInvoice.sgst) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr className="bg-emerald-50/70 border-t border-emerald-200">
                    <td className="py-3 px-4 font-black text-slate-900 text-sm">Total Invoice Amount (INR)</td>
                    <td className="py-3 px-4 text-right font-black text-emerald-800 text-base">
                      ₹{(Number(viewingInvoice.total_amount) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">
                Official electronic tax receipt generated by BookMyEvent platform
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setViewingInvoice(null)}
                  className="rounded-xl text-xs font-bold"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={handlePrintInvoice}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-900/20 border-none cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print / Save PDF</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExhibitorBillingPage;
