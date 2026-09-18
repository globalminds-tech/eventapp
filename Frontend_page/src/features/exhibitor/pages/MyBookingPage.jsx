import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchExhibitorBookings } from "@/app/store/exhibitorSlice";
import { getAuthUserId } from "@/shared/services/authHelper";
import {
  Store, Search, CheckCircle2, Clock, Eye, Pencil, CreditCard,
  MapPin, XCircle, Phone, Mail, Building, AlertCircle, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatCardSkeleton } from "@/components/ui/StatCardSkeleton";
import { ResponsiveTableView, MobileDataCard } from "@/components/ui/ResponsiveTableView";

const MyBookings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const reduxAuthUser = useSelector((state) => state.auth?.user);
  const reduxUser = useSelector((state) => state.user);
  const effectiveUserId = getAuthUserId(reduxAuthUser || reduxUser);

  const { list: bookings, loading, statusFilter, search } = useSelector((state) => state.exhibitor.bookings);
  const [searchTerm, setSearchTerm] = useState(search || "");
  const [selectedStatusTab, setSelectedStatusTab] = useState(statusFilter || "all");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (effectiveUserId) {
      dispatch(fetchExhibitorBookings({
        userId: effectiveUserId,
        status: selectedStatusTab,
        search: searchTerm
      }));
    }
  }, [dispatch, effectiveUserId, selectedStatusTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (effectiveUserId) {
        dispatch(fetchExhibitorBookings({
          userId: effectiveUserId,
          status: selectedStatusTab,
          search: searchTerm
        }));
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handlePayNow = (b) => {
    setToastMessage(`✓ Redirecting to payment portal for ${b.event_name}...`);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = searchTerm === "" ||
      (b.event_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.company_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.stall_area || "").toLowerCase().includes(searchTerm.toLowerCase());

    const st = (b.status || "pending").toLowerCase();
    let matchesStatus = true;
    if (selectedStatusTab === "pending") matchesStatus = st === "pending";
    if (selectedStatusTab === "approved") matchesStatus = st === "approved";
    if (selectedStatusTab === "confirmed") matchesStatus = st === "confirmed" || st === "paid";
    if (selectedStatusTab === "rejected") matchesStatus = st === "rejected";

    return matchesSearch && matchesStatus;
  });

  const totalCount = bookings.length;
  const pendingCount = bookings.filter(b => (b.status || "").toLowerCase() === "pending").length;
  const approvedCount = bookings.filter(b => (b.status || "").toLowerCase() === "approved").length;
  const confirmedCount = bookings.filter(b => ["confirmed", "paid"].includes((b.status || "").toLowerCase())).length;

  return (
    <div className="space-y-6 pb-12 select-none font-sans text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              My Stall Bookings
            </h1>
            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 px-2.5 py-0.5 font-bold text-[11px]">
              Exhibitor Reservation Hub
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Track your booth applications, view 24-hour payment lock countdowns, and complete invoice settlements.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={() => navigate("/exhibitor/upcoming-events")}
            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-900/20 border-none cursor-pointer gap-2"
          >
            <Store size={18} />
            <span>Book New Stall</span>
          </Button>
        </div>
      </div>

      {/* ── 4 EXECUTIVE KPI STAT CARDS (MATCHING REFERENCE DESIGN) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading && bookings.length === 0 ? (
          <StatCardSkeleton count={4} />
        ) : (
          <>
            {/* Card 1: Total Applications */}
            <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-5 flex flex-col justify-between transition hover:border-slate-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Applications</span>
                <div className="w-9 h-9 bg-blue-50 rounded-xl text-blue-600 flex items-center justify-center border border-blue-100/70 shrink-0">
                  <Store size={18} />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {totalCount}
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">Across active expos</p>
              </div>
            </Card>

            {/* Card 2: Pending Approval */}
            <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-5 flex flex-col justify-between transition hover:border-slate-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Review</span>
                <div className="w-9 h-9 bg-amber-50 rounded-xl text-amber-600 flex items-center justify-center border border-amber-100/70 shrink-0">
                  <Clock size={18} className="animate-pulse" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {pendingCount}
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">Requires organizer approval</p>
              </div>
            </Card>

            {/* Card 3: Approved & Payment Locked */}
            <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-5 flex flex-col justify-between transition hover:border-slate-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Approved &amp; Locked</span>
                <div className="w-9 h-9 bg-sky-50 rounded-xl text-sky-600 flex items-center justify-center border border-sky-100/70 shrink-0">
                  <CreditCard size={18} />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {approvedCount}
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">24-hour payment lock active</p>
              </div>
            </Card>

            {/* Card 4: Confirmed & Paid */}
            <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-5 flex flex-col justify-between transition hover:border-slate-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Confirmed &amp; Allocated</span>
                <div className="w-9 h-9 bg-emerald-50 rounded-xl text-emerald-600 flex items-center justify-center border border-emerald-100/70 shrink-0">
                  <ShieldCheck size={18} />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {confirmedCount}
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">Stall space secured</p>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Main Table Card (Shadcn Table standard matching Screenshot 4) */}
      <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center overflow-x-auto touch-scroll bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 max-w-full">
            {[
              { label: "All Bookings", value: "all" },
              { label: "Pending Approval", value: "pending" },
              { label: "Approved (24h Lock)", value: "approved" },
              { label: "Confirmed & Paid", value: "confirmed" },
              { label: "Rejected", value: "rejected" },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setSelectedStatusTab(t.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  selectedStatusTab === t.value
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search event code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Table / Mobile Cards View */}
        <ResponsiveTableView
          data={filteredBookings}
          keyField="id"
          loading={loading}
          columnCount={5}
          columns={[
            { header: "Event Details", className: "py-3.5 px-4" },
            { header: "Stall & Location", className: "py-3.5 px-4" },
            { header: "Booking Fee", className: "py-3.5 px-4" },
            { header: "Status & Payment Lock", className: "py-3.5 px-4" },
            { header: "Actions", className: "py-3.5 px-4 text-right" },
          ]}
          emptyMessage="No stall bookings found matching the selected filter."
          renderDesktopTable={() => (
            <div className="responsive-table-wrap rounded-xl border border-slate-200 bg-white shadow-2xs">
              <table className="w-full min-w-[650px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Event Details</th>
                    <th className="py-3.5 px-4">Stall &amp; Location</th>
                    <th className="py-3.5 px-4">Booking Fee</th>
                    <th className="py-3.5 px-4">Status &amp; Payment Lock</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-xs">
                  {filteredBookings.map((b) => {
                    const status = (b.status || "Pending").toLowerCase();
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 font-bold text-[10px]">
                                {b.company_name || 'Exhibitor Firm'}
                              </Badge>
                              {(b.is_suspended || (b.event_status && b.event_status.toUpperCase() === "SUSPENDED")) && (
                                <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-extrabold text-[9px] gap-1 inline-flex items-center">
                                  <ShieldCheck size={11} className="text-amber-700 shrink-0" />
                                  <span>Stall Safe • Event Paused</span>
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm mt-1">{b.event_name}</h4>
                            {(b.is_suspended || (b.event_status && b.event_status.toUpperCase() === "SUSPENDED")) && (
                              <p className="text-[10px] text-amber-800 font-medium mt-1 bg-amber-50/80 border border-amber-200/80 rounded-lg p-1.5 leading-tight">
                                🛡️ <strong>Booking Safe:</strong> New booth registrations are paused. If this event is cancelled or rescheduled, your booking is guaranteed a 100% full refund.
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-600 space-y-0.5">
                            <p className="font-bold text-slate-800 text-xs">{b.stall_area || 'Standard Booth'}</p>
                            <p className="text-[11px] text-slate-500 font-medium">{b.city || 'Chennai'}, {b.state || 'TN'}</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 text-xs">
                          ₹{Number(b.total_price || b.rental_price || b.price || b.price_paid || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4">
                          {status === 'pending' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                              <Clock size={12} className="animate-pulse" /> Pending Approval
                            </span>
                          )}
                          {status === 'approved' && (
                            <div>
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-cyan-100 text-cyan-800 border border-cyan-200 inline-flex items-center gap-1">
                                <CheckCircle2 size={12} /> Approved (24h Lock)
                              </span>
                              <span className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold mt-0.5">
                                <Clock size={10} className="text-cyan-600" /> Payment lock active
                              </span>
                            </div>
                          )}
                          {(status === 'confirmed' || status === 'paid') && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                              <CheckCircle2 size={12} /> Confirmed &amp; Paid
                            </span>
                          )}
                          {status === 'rejected' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-200 inline-flex items-center gap-1">
                              <XCircle size={12} /> Rejected
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => navigate(`/exhibitor/my-bookings/${b.id}`)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer border border-slate-200"
                              title="View Booking Details"
                            >
                              <Eye size={14} />
                            </button>

                            {status === 'approved' && (
                              <button
                                onClick={() => handlePayNow(b)}
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-[11px] transition cursor-pointer flex items-center gap-1 shadow-sm"
                              >
                                <CreditCard size={13} />
                                <span>Pay Now</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          renderMobileCard={(b) => {
            const status = (b.status || "Pending").toLowerCase();
            const isSuspended = b.is_suspended || (b.event_status && b.event_status.toUpperCase() === "SUSPENDED");

            return (
              <MobileDataCard key={b.id} highlightBorder={status === 'approved'}>
                <MobileDataCard.Header
                  badge={
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 font-bold text-[10px]">
                        {b.company_name || 'Exhibitor Firm'}
                      </Badge>
                      {isSuspended && (
                        <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-extrabold text-[9px] gap-1 inline-flex items-center">
                          <ShieldCheck size={11} className="text-amber-700 shrink-0" />
                          <span>Stall Safe</span>
                        </Badge>
                      )}
                    </div>
                  }
                  title={b.event_name}
                  onTitleClick={() => navigate(`/exhibitor/my-bookings/${b.id}`)}
                  statusBadge={
                    status === 'pending' ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                        <Clock size={11} className="animate-pulse" /> Pending
                      </span>
                    ) : status === 'approved' ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-cyan-100 text-cyan-800 border border-cyan-200 inline-flex items-center gap-1">
                        <CheckCircle2 size={11} /> 24h Lock Active
                      </span>
                    ) : (status === 'confirmed' || status === 'paid') ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                        <CheckCircle2 size={11} /> Confirmed
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-red-100 text-red-800 border border-red-200 inline-flex items-center gap-1">
                        <XCircle size={11} /> Rejected
                      </span>
                    )
                  }
                />

                {isSuspended && (
                  <p className="text-[10px] text-amber-800 font-medium bg-amber-50/90 border border-amber-200/80 rounded-xl p-2 leading-tight">
                    🛡️ <strong>Booking Safe:</strong> Registrations paused. 100% full refund guarantee.
                  </p>
                )}

                <MobileDataCard.Grid
                  columns={2}
                  items={[
                    { label: "Booth Space", value: b.stall_area || 'Standard Booth' },
                    { label: "Location", value: `${b.city || 'Chennai'}, ${b.state || 'TN'}` },
                    { label: "Booth Fee", value: `₹${Number(b.total_price || b.rental_price || b.price || b.price_paid || 0).toLocaleString('en-IN')}` },
                    { label: "Status Info", value: status === 'approved' ? "Pay before lock expires" : (b.status || 'Active') },
                  ]}
                />

                <MobileDataCard.Actions>
                  <button
                    onClick={() => navigate(`/exhibitor/my-bookings/${b.id}`)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold inline-flex items-center gap-1 border border-slate-200 cursor-pointer"
                  >
                    <Eye size={13} />
                    <span>View Details</span>
                  </button>
                  {status === 'approved' && (
                    <button
                      onClick={() => handlePayNow(b)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs inline-flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <CreditCard size={13} />
                      <span>Pay Now</span>
                    </button>
                  )}
                </MobileDataCard.Actions>
              </MobileDataCard>
            );
          }}
        />
      </Card>


    </div>
  );
};

export default MyBookings;
