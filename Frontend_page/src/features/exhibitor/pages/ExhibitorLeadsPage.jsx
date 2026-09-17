import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from "react-redux";
import {
  Users, QrCode, Search, Filter, Download, PlusCircle, CheckCircle2, Clock, Mail, Phone,
  Building, ShieldCheck, Sparkles, Send, Eye, XCircle, ArrowLeft, ArrowRight, Store, Loader2,
  Tag, Briefcase, FileText
} from 'lucide-react';
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatCardSkeleton } from "@/components/ui/StatCardSkeleton";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/Select";
import {
  fetchExhibitorBookings,
  fetchExhibitorLeads,
  createExhibitorLead
} from "@/app/store/exhibitorSlice";
import { getAuthUserId } from "@/shared/services/authHelper";
import { ResponsiveTableView, MobileDataCard } from "@/components/ui/ResponsiveTableView";

export const ExhibitorLeadsPage = () => {
  const dispatch = useDispatch();
  const reduxAuthUser = useSelector((state) => state.auth?.user);
  const reduxUser = useSelector((state) => state.user);
  const effectiveUserId = getAuthUserId(reduxAuthUser || reduxUser);

  const bookingsList = useSelector((state) => state.exhibitor.bookings.list);
  const loadingBookings = useSelector((state) => state.exhibitor.bookings.loading);
  const leadsByEvent = useSelector((state) => state.exhibitor.leadsByEvent);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [formError, setFormError] = useState('');

  const [newLead, setNewLead] = useState({
    title: 'Mr.',
    name: '',
    designation: '',
    company: '',
    email: '',
    mobile: '',
    interest: 'Hot Intent',
    products: '',
    notes: ''
  });

  // Load bookings if not already loaded
  useEffect(() => {
    if (effectiveUserId && bookingsList.length === 0) {
      dispatch(fetchExhibitorBookings({ userId: effectiveUserId }));
    }
  }, [dispatch, effectiveUserId]);

  const activeBookings = useMemo(() => {
    return bookingsList.filter(b => (b.status || "").toLowerCase() !== "rejected");
  }, [bookingsList]);

  // If a booking is selected, fetch its leads
  const activeEventId = selectedEvent?.event_id || selectedEvent?.id;
  const currentLeadsState = activeEventId ? leadsByEvent[activeEventId] : null;
  const leads = currentLeadsState?.list || [];
  const loadingLeads = currentLeadsState?.loading ?? false;

  useEffect(() => {
    if (activeEventId) {
      dispatch(fetchExhibitorLeads({ eventId: activeEventId, search: searchTerm }));
    }
  }, [dispatch, activeEventId]);

  // Debounced search for leads
  useEffect(() => {
    if (!activeEventId) return;
    const timer = setTimeout(() => {
      dispatch(fetchExhibitorLeads({ eventId: activeEventId, search: searchTerm }));
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm, activeEventId]);

  const [intentFilter, setIntentFilter] = useState('all'); // 'all' | 'hot' | 'warm' | 'cold'

  const hotLeadsCount = useMemo(() => {
    return leads.filter(l => (l.buying_intent || "").toLowerCase().includes("hot") || (l.buying_intent || "").toLowerCase().includes("high")).length;
  }, [leads]);

  const warmLeadsCount = useMemo(() => {
    return leads.filter(l => (l.buying_intent || "").toLowerCase().includes("warm") || (l.buying_intent || "").toLowerCase().includes("evaluating")).length;
  }, [leads]);

  const coldLeadsCount = useMemo(() => {
    return leads.filter(l => (l.buying_intent || "").toLowerCase().includes("cold") || (l.buying_intent || "").toLowerCase().includes("info")).length;
  }, [leads]);

  const displayedLeads = useMemo(() => {
    if (intentFilter === 'all') return leads;
    if (intentFilter === 'hot') {
      return leads.filter(l => (l.buying_intent || "").toLowerCase().includes("hot") || (l.buying_intent || "").toLowerCase().includes("high"));
    }
    if (intentFilter === 'warm') {
      return leads.filter(l => (l.buying_intent || "").toLowerCase().includes("warm") || (l.buying_intent || "").toLowerCase().includes("evaluating"));
    }
    if (intentFilter === 'cold') {
      return leads.filter(l => (l.buying_intent || "").toLowerCase().includes("cold") || (l.buying_intent || "").toLowerCase().includes("info"));
    }
    return leads;
  }, [leads, intentFilter]);

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = ["Visitor Name", "Company", "Designation", "Email", "Mobile", "Buying Intent", "Notes", "Logged Date"];
    const rows = leads.map(l => [
      `"${l.visitor_name || l.name || ""}"`,
      `"${l.company_name || l.company || ""}"`,
      `"${l.designation || ""}"`,
      `"${l.email || ""}"`,
      `"${l.mobile || ""}"`,
      `"${l.buying_intent || ""}"`,
      `"${(l.notes || "").replace(/"/g, '""')}"`,
      `"${l.created_at ? new Date(l.created_at).toLocaleDateString() : ""}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `visitor_leads_${(selectedEvent?.event_name || "export").replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage("✓ Leads exported to CSV successfully!");
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAddLeadSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!newLead.name.trim() || !newLead.email.trim() || !selectedEvent) {
      setFormError('Visitor name and email address are required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newLead.email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (newLead.mobile.trim()) {
      const mobileRegex = /^[0-9]{10}$/;
      if (!mobileRegex.test(newLead.mobile.trim())) {
        setFormError('Mobile number must be exactly 10 digits.');
        return;
      }
    }

    setIsSubmittingLead(true);
    try {
      const payload = {
        event_id: String(activeEventId),
        user_id: String(effectiveUserId || selectedEvent.user_id),
        visitor_name: `${newLead.title} ${newLead.name}`.trim(),
        designation: newLead.designation.trim(),
        company_name: newLead.company.trim(),
        email: newLead.email.trim(),
        mobile: newLead.mobile.trim(),
        buying_intent: newLead.interest,
        products_interested: newLead.products.trim(),
        notes: newLead.notes.trim() || "On-site visitor lead captured at booth"
      };

      const resultAction = await dispatch(createExhibitorLead(payload));
      if (createExhibitorLead.fulfilled.match(resultAction)) {
        setToastMessage("✓ New visitor lead logged successfully!");
        setTimeout(() => setToastMessage(''), 3000);
        setIsAddLeadModalOpen(false);
        setNewLead({
          title: 'Mr.',
          name: '',
          designation: '',
          company: '',
          email: '',
          mobile: '',
          interest: 'Hot Intent',
          products: '',
          notes: ''
        });
        // Refresh leads list
        dispatch(fetchExhibitorLeads({ eventId: activeEventId, force: true }));
      } else {
        setFormError(resultAction.payload || 'Failed to add lead. Please try again.');
      }
    } catch (err) {
      console.error("Failed to add lead:", err);
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  // --- View 1: Event Selection View ---
  if (!selectedEvent) {
    const filteredEvents = activeBookings.filter((b) => {
      return searchTerm === "" ||
        (b.event_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.company_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.stall_area || "").toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
      <div className="space-y-6 pb-12 select-none font-sans text-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Visitor Leads
              </h1>
              <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 px-2.5 py-0.5 font-bold text-[11px]">
                Event Selection
              </Badge>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              Select an active exhibition stall reservation to manage buyer inquiries and lead intelligence.
            </p>
          </div>
        </div>

        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search booked events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="responsive-table-wrap rounded-xl border border-slate-200 bg-white shadow-2xs">
            <table className="w-full min-w-[550px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Event Details</th>
                  <th className="py-3.5 px-4">Reserved Stall</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-xs">
                {loadingBookings ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-3.5 px-4 space-y-2">
                        <div className="w-44 h-4 bg-slate-200 rounded" />
                        <div className="w-32 h-3 bg-slate-100 rounded" />
                      </td>
                      <td className="py-3.5 px-4 space-y-2">
                        <div className="w-28 h-4 bg-slate-200 rounded" />
                        <div className="w-20 h-3 bg-slate-100 rounded" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="w-24 h-8 bg-slate-200 rounded-xl ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-12 text-center text-slate-400 font-semibold">
                      No active stall reservations found. Book an exhibition stall to start capturing leads.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-xs sm:text-sm">{b.event_name}</div>
                        <div className="text-[11px] text-slate-400 font-medium mt-0.5">Booking ID: #{b.id?.substring(0, 8)}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 font-bold text-[11px]">
                          {b.stall_area || "Standard Booth"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          onClick={() => { setSelectedEvent(b); setSearchTerm(''); }}
                          className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-xs border-none cursor-pointer gap-1.5 inline-flex"
                        >
                          <span>Open Leads Portal</span>
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
      </div>
    );
  }

  // --- View 2: Visitor Leads Portal View (When selectedEvent is active) ---
  return (
    <div className="space-y-6 pb-12 select-none font-sans text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back Button */}
      <div>
        <button
          onClick={() => { setSelectedEvent(null); setSearchTerm(''); setIntentFilter('all'); }}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition mb-2 cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Events List
        </button>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {selectedEvent.event_name} Leads
            </h1>
            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 px-2.5 py-0.5 font-bold text-[11px]">
              {selectedEvent.stall_area || 'Booth'}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Track on-site visitor leads, record discussion notes, and qualify buyer interest for your exhibition booth.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={leads.length === 0}
            className="bg-white hover:bg-slate-50 border-slate-200 rounded-xl text-xs font-bold gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Download size={14} className="text-slate-600" />
            <span>Export CSV</span>
          </Button>
          <Button
            onClick={() => setIsAddLeadModalOpen(true)}
            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-900/20 border-none cursor-pointer gap-2"
          >
            <PlusCircle size={18} />
            <span>Add Spot Lead</span>
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loadingLeads && leads.length === 0 ? (
          <StatCardSkeleton count={3} />
        ) : (
          <>
            <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">TOTAL LEADS LOGGED</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{leads.length} Buyers</h3>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Scanned &amp; recorded on-site</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <Users size={22} />
              </div>
            </Card>

            <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">HOT INTENT LEADS</p>
                <h3 className="text-2xl font-extrabold text-orange-600 mt-1">
                  {hotLeadsCount} High Intent
                </h3>
                <p className="text-[11px] font-medium text-orange-600 mt-0.5">Ready for immediate quotation</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shrink-0">
                <Sparkles size={22} />
              </div>
            </Card>

            <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">WARM / EVALUATING</p>
                <h3 className="text-2xl font-extrabold text-teal-600 mt-1">{warmLeadsCount} Prospects</h3>
                <p className="text-[11px] font-medium text-teal-600 mt-0.5">Demo &amp; comparison scope</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 shrink-0">
                <CheckCircle2 size={22} />
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Leads Table Card with Intent Filters */}
      <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Intent Filter Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 flex-wrap gap-1">
            <button
              onClick={() => setIntentFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                intentFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Leads ({leads.length})
            </button>
            <button
              onClick={() => setIntentFilter('hot')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                intentFilter === 'hot' ? 'bg-white text-orange-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🔥 Hot ({hotLeadsCount})
            </button>
            <button
              onClick={() => setIntentFilter('warm')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                intentFilter === 'warm' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚡ Warm ({warmLeadsCount})
            </button>
            <button
              onClick={() => setIntentFilter('cold')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                intentFilter === 'cold' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ❄️ Cold ({coldLeadsCount})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search leads by name, firm, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Visitor Leads Table View */}
        <ResponsiveTableView
          data={displayedLeads}
          keyField="id"
          loading={loadingLeads}
          columnCount={5}
          columns={[
            { header: "Visitor & Company", className: "py-3.5 px-4" },
            { header: "Contact Info", className: "py-3.5 px-4" },
            { header: "Buying Intent", className: "py-3.5 px-4" },
            { header: "Logged Notes & Products", className: "py-3.5 px-4" },
            { header: "Logged Time", className: "py-3.5 px-4 text-right" },
          ]}
          emptyMessage={intentFilter !== 'all' ? `No ${intentFilter} leads found.` : "No buyer leads scanned or logged yet for this expo."}
          renderDesktopTable={() => (
            <div className="responsive-table-wrap rounded-xl border border-slate-200 bg-white shadow-2xs">
              <table className="w-full min-w-[650px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Visitor & Company</th>
                    <th className="py-3.5 px-4">Contact Info</th>
                    <th className="py-3.5 px-4">Buying Intent</th>
                    <th className="py-3.5 px-4">Logged Notes & Products</th>
                    <th className="py-3.5 px-4 text-right">Logged Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-xs">
                  {displayedLeads.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">{l.visitor_name || l.name}</h4>
                          <p className="text-[11px] font-semibold text-slate-500">{l.company_name || l.company || "Independent Buyer"}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-600 space-y-0.5">
                          <p className="flex items-center gap-1 font-semibold text-[11px]"><Mail size={11} />{l.email}</p>
                          {l.mobile && <p className="flex items-center gap-1 text-slate-500 text-[11px]"><Phone size={11} />{l.mobile}</p>}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border inline-flex items-center gap-1 ${
                          (l.buying_intent || "").toLowerCase().includes("hot") || (l.buying_intent || "").toLowerCase().includes("high")
                            ? "bg-orange-100 text-orange-800 border-orange-200"
                            : (l.buying_intent || "").toLowerCase().includes("warm") || (l.buying_intent || "").toLowerCase().includes("evaluating")
                            ? "bg-teal-100 text-teal-800 border-teal-200"
                            : "bg-blue-100 text-blue-800 border-blue-200"
                        }`}>
                          <Sparkles size={11} /> {l.buying_intent || "Warm Lead"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium max-w-xs truncate">
                        {l.notes || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-400 text-[11px]">
                        {l.created_at ? new Date(l.created_at).toLocaleDateString() : "Just now"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          renderMobileCard={(l) => (
            <MobileDataCard key={l.id}>
              <MobileDataCard.Header
                title={l.visitor_name || l.name}
                subtitle={l.company_name || l.company}
                statusBadge={
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border inline-flex items-center gap-1 ${
                    (l.buying_intent || "").toLowerCase().includes("hot") || (l.buying_intent || "").toLowerCase().includes("high")
                      ? "bg-orange-100 text-orange-800 border-orange-200"
                      : "bg-teal-100 text-teal-800 border-teal-200"
                  }`}>
                    <Sparkles size={10} /> {l.buying_intent || "Warm Lead"}
                  </span>
                }
              />
              <MobileDataCard.Grid
                items={[
                  { label: "Email", value: l.email },
                  { label: "Mobile", value: l.mobile || "—" },
                  { label: "Notes", value: l.notes || "—" },
                  { label: "Time", value: l.created_at ? new Date(l.created_at).toLocaleDateString() : "—" }
                ]}
              />
            </MobileDataCard>
          )}
        />
      </Card>

      {/* ── COMPREHENSIVE ADD SPOT LEAD MODAL DIALOG ──────────────────── */}
      {isAddLeadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <form onSubmit={handleAddLeadSubmit} className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                  <PlusCircle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Add Spot Visitor Lead</h3>
                  <p className="text-[11px] font-medium text-slate-500">Capture attendee details & inquiries on-site</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setIsAddLeadModalOpen(false); setFormError(''); }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-2">
                <XCircle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              {/* Row 1: Salutation & Full Name */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="font-extrabold text-slate-700 block mb-1 uppercase text-[10px] tracking-wider">Title</label>
                  <Select
                    value={newLead.title}
                    onValueChange={(val) => setNewLead({ ...newLead, title: val })}
                  >
                    <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-xl h-10 font-semibold text-xs focus:ring-2 focus:ring-emerald-500">
                      <SelectValue placeholder="Title" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mr.">Mr.</SelectItem>
                      <SelectItem value="Ms.">Ms.</SelectItem>
                      <SelectItem value="Mrs.">Mrs.</SelectItem>
                      <SelectItem value="Dr.">Dr.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-3">
                  <label className="font-extrabold text-slate-700 block mb-1 uppercase text-[10px] tracking-wider">Visitor Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={newLead.name}
                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Row 2: Designation & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1 uppercase text-[10px] tracking-wider">Designation / Role</label>
                  <input
                    type="text"
                    value={newLead.designation}
                    onChange={(e) => setNewLead({ ...newLead, designation: e.target.value })}
                    placeholder="e.g. VP Operations"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1 uppercase text-[10px] tracking-wider">Company / Firm Name</label>
                  <input
                    type="text"
                    value={newLead.company}
                    onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                    placeholder="e.g. Matrix Corp"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Row 3: Email & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1 uppercase text-[10px] tracking-wider">Email Address <span className="text-rose-500">*</span></label>
                  <input
                    type="email"
                    required
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    placeholder="name@company.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1 uppercase text-[10px] tracking-wider">Mobile Number</label>
                  <input
                    type="text"
                    maxLength="10"
                    value={newLead.mobile}
                    onChange={(e) => setNewLead({ ...newLead, mobile: e.target.value.replace(/\D/g, '') })}
                    placeholder="9876543210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Row 4: Buying Intent & Products of Interest */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1 uppercase text-[10px] tracking-wider">Buying Intent Level</label>
                  <Select
                    value={newLead.interest}
                    onValueChange={(val) => setNewLead({ ...newLead, interest: val })}
                  >
                    <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-xl h-10 font-semibold text-xs focus:ring-2 focus:ring-emerald-500">
                      <SelectValue placeholder="Select intent level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hot Intent">🔥 Hot Intent (Ready to Buy)</SelectItem>
                      <SelectItem value="Warm Lead">⚡ Warm Lead (Evaluating)</SelectItem>
                      <SelectItem value="Cold Inquiry">❄️ Cold Inquiry (General Info)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1 uppercase text-[10px] tracking-wider">Products of Interest</label>
                  <input
                    type="text"
                    value={newLead.products}
                    onChange={(e) => setNewLead({ ...newLead, products: e.target.value })}
                    placeholder="e.g. Cloud Security, ERP"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Row 5: Discussion Notes */}
              <div>
                <label className="font-extrabold text-slate-700 block mb-1 uppercase text-[10px] tracking-wider">Discussion Notes &amp; Follow-up Scope</label>
                <textarea
                  rows="2"
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  placeholder="Requested corporate demo and quotation for 50 licenses..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setIsAddLeadModalOpen(false); setFormError(''); }}
                className="text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingLead}
                className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-md shadow-emerald-900/20 border-none flex items-center gap-1.5"
              >
                {isSubmittingLead ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving Lead…</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    <span>Save Visitor Lead</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ExhibitorLeadsPage;
