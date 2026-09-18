import React, { useState, useEffect, useMemo } from 'react';
import {
  Store, Search, PlusCircle, Eye, CheckCircle2, Clock, MapPin, XCircle,
  Filter, ShieldAlert, FileText, Check, AlertCircle, Phone, Mail, Building,
  Layers, ExternalLink, Calendar, Download, Globe, UserCheck
} from 'lucide-react';
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
import { useSelector, useDispatch } from "react-redux";
import { fetchEventsThunk } from "@/app/store/eventSlice";
import apiClient from "@/Services/client";
import { ResponsiveTableView, MobileDataCard } from "@/components/ui/ResponsiveTableView";
import CreateEventButton from "@/components/ui/CreateEventButton";

export const ManageStall = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventFilter, setSelectedEventFilter] = useState('all');
  const [selectedStatusTab, setSelectedStatusTab] = useState('all');

  // Modal State for Detailed Application Inspection
  const [selectedApp, setSelectedApp] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionToast, setActionToast] = useState('');

  const dispatch = useDispatch();
  const Redexorganizer = useSelector((state) => state.user);
  const organizerId =
    Redexorganizer?.id ||
    sessionStorage.getItem("id") ||
    localStorage.getItem("id") ||
    sessionStorage.getItem("userId");

  const eventsState = useSelector((state) => state.events?.list);
  const eventsList = Array.isArray(eventsState) ? eventsState : (Array.isArray(eventsState?.data) ? eventsState.data : []);

  useEffect(() => {
    if (organizerId) {
      dispatch(fetchEventsThunk(organizerId));
    }
  }, [dispatch, organizerId]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/v1/organizer/stalls/applications');
      const data = res.data;
      if (data.success && Array.isArray(data.data)) {
        setApplications(data.data);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.error("Error fetching exhibitor applications:", err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (appId, newStatus, customReason = '') => {
    try {
      const res = await apiClient.put(`/api/v1/organizer/stalls/applications/${appId}/status`, {
        status: newStatus,
        rejection_reason: customReason || rejectionReason
      });
      if (!res?.data?.success) throw new Error("Status update failed");

      // Update local applications list
      setApplications(prev =>
        prev.map(a => (String(a.id) === String(appId) ? { ...a, status: newStatus, rejection_reason: customReason || rejectionReason } : a))
      );

      if (selectedApp && String(selectedApp.id) === String(appId)) {
        setSelectedApp(prev => ({ ...prev, status: newStatus, rejection_reason: customReason || rejectionReason }));
      }

      setActionToast(`✓ Stall application marked as ${newStatus.toUpperCase()}`);
      setTimeout(() => setActionToast(''), 3500);
    } catch (err) {
      console.error("Status update failed:", err);
      setActionToast(`✗ Failed to update status. Please try again.`);
      setTimeout(() => setActionToast(''), 3500);
    } finally {
      setIsRejectModalOpen(false);
      setRejectionReason('');
    }
  };

  // Dynamic Calculated Metrics
  const pendingCount = useMemo(() => {
    return applications.filter(a => (a.status || '').toLowerCase() === 'pending').length;
  }, [applications]);

  const approvedCount = useMemo(() => {
    return applications.filter(a => (a.status || '').toLowerCase() === 'approved').length;
  }, [applications]);

  const confirmedCount = useMemo(() => {
    return applications.filter(a => ['confirmed', 'paid'].includes((a.status || '').toLowerCase())).length;
  }, [applications]);

  const rejectedCount = useMemo(() => {
    return applications.filter(a => (a.status || '').toLowerCase() === 'rejected').length;
  }, [applications]);

  const totalCapacity = useMemo(() => {
    const sum = eventsList.reduce((acc, ev) => acc + (Number(ev.total_stalls) || Number(ev.stall_quantity) || 0), 0);
    return sum > 0 ? sum : 25; // Sensible floor default if events have not specified count
  }, [eventsList]);

  const occupancyRate = useMemo(() => {
    const allocated = approvedCount + confirmedCount;
    return totalCapacity > 0 ? Math.min(100, Math.round((allocated / totalCapacity) * 100)) : 0;
  }, [approvedCount, confirmedCount, totalCapacity]);

  // Filtered Applications Pipeline
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === '' ||
        (app.company_name || '').toLowerCase().includes(q) ||
        (app.name || '').toLowerCase().includes(q) ||
        (app.email || '').toLowerCase().includes(q) ||
        (app.mobile || '').toLowerCase().includes(q) ||
        (app.stall_area || '').toLowerCase().includes(q) ||
        (app.products || '').toLowerCase().includes(q) ||
        (app.event_name || '').toLowerCase().includes(q);

      const matchesEvent =
        selectedEventFilter === 'all' ||
        String(app.event_id) === String(selectedEventFilter);

      const st = (app.status || 'pending').toLowerCase();
      let matchesStatus = true;
      if (selectedStatusTab === 'pending') matchesStatus = st === 'pending';
      if (selectedStatusTab === 'approved') matchesStatus = st === 'approved';
      if (selectedStatusTab === 'confirmed') matchesStatus = ['confirmed', 'paid'].includes(st);
      if (selectedStatusTab === 'rejected') matchesStatus = st === 'rejected';

      return matchesSearch && matchesEvent && matchesStatus;
    });
  }, [applications, searchTerm, selectedEventFilter, selectedStatusTab]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getAppRentalPrice = (app) => {
    if (!app) return 10000;
    if (app.price) return Number(app.price);
    if (app.rental_price) return Number(app.rental_price);
    if (app.messages) {
      const m = app.messages.match(/\[Estimated Cost:\s*[₹Rs\.\?]*\s*([0-9,]+)\]/);
      if (m && m[1]) {
        return Number(m[1].replace(/,/g, ''));
      }
    }
    return 10000;
  };

  return (
    <div className="space-y-6 pb-12 select-none font-sans text-slate-800">
      {/* ── ACTION NOTIFICATION TOAST ── */}
      {actionToast && (
        <div className={`fixed top-5 right-5 z-50 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2 animate-in fade-in slide-in-from-top-3 ${
          actionToast.startsWith('✗') ? 'bg-red-700 border-red-600' : 'bg-slate-900 border-slate-700'
        }`}>
          {actionToast.startsWith('✗') ? <AlertCircle size={16} className="text-red-300 shrink-0" /> : <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
          <span>{actionToast}</span>
        </div>
      )}

      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Manage Stalls
            </h1>
            <Badge className="bg-cyan-50 text-cyan-800 border-cyan-200 px-2.5 py-0.5 font-bold text-[11px]">
              Booth Operations & Approval Hub
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Review incoming exhibitor booth applications, verify company credentials, approve floor allocations, and track stall occupancy.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <CreateEventButton size="sm" />
        </div>
      </div>

      {/* ── 4 EXECUTIVE KPI STAT CARDS (MATCHING USER REFERENCE) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
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
                  {applications.length}
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">Across all organizer expos</p>
              </div>
            </Card>

            {/* Card 2: Pending Review */}
            <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-5 flex flex-col justify-between transition hover:border-slate-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Review</span>
                <div className="w-9 h-9 bg-amber-50 rounded-xl text-amber-600 flex items-center justify-center border border-amber-100/70 shrink-0">
                  <Clock size={18} />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {pendingCount}
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">Requires organizer approval</p>
              </div>
            </Card>

            {/* Card 3: Approved & Active */}
            <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-5 flex flex-col justify-between transition hover:border-slate-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Approved & Active</span>
                <div className="w-9 h-9 bg-emerald-50 rounded-xl text-emerald-600 flex items-center justify-center border border-emerald-100/70 shrink-0">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
                  {approvedCount + confirmedCount}
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">{confirmedCount} Paid • {approvedCount} Awaiting Payment</p>
              </div>
            </Card>

            {/* Card 4: Stall Occupancy */}
            <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white p-5 flex flex-col justify-between transition hover:border-slate-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Stall Occupancy</span>
                <div className="w-9 h-9 bg-purple-50 rounded-xl text-purple-600 flex items-center justify-center border border-purple-100/70 shrink-0">
                  <Layers size={18} />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-600 tracking-tight">
                  {occupancyRate}%
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">{approvedCount + confirmedCount} allocated of {totalCapacity} total stalls</p>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* ── TOOLBAR: EVENT SELECTOR, SEARCH, STATUS PILLS ── */}
      <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4 !overflow-visible relative z-30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Search input & Event Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by company, contact person, booth space, product..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 focus:ring-2 focus:ring-sky-500 outline-none text-xs font-semibold"
              />
            </div>

            {/* Event Filter Select */}
            <div className="w-full sm:w-60 relative z-40">
              <Select value={selectedEventFilter} onValueChange={setSelectedEventFilter}>
                <SelectTrigger className="w-full h-9 rounded-xl border-slate-200/80 bg-slate-50 text-xs font-semibold">
                  <SelectValue placeholder="All Events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events ({eventsList.length})</SelectItem>
                  {eventsList.map((ev) => (
                    <SelectItem key={ev.id} value={String(ev.id)}>
                      {ev.event_name || ev.name || "Untitled Expo"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right: Quick Total Count Badge */}
          <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5 self-end lg:self-auto">
            <span>Showing {filteredApplications.length} of {applications.length} applications</span>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedStatusTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedStatusTab === 'all'
                ? 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Applications ({applications.length})
          </button>
          <button
            onClick={() => setSelectedStatusTab('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedStatusTab === 'pending'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pending Review ({pendingCount})
          </button>
          <button
            onClick={() => setSelectedStatusTab('approved')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedStatusTab === 'approved'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setSelectedStatusTab('confirmed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedStatusTab === 'confirmed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Confirmed & Paid ({confirmedCount})
          </button>
          <button
            onClick={() => setSelectedStatusTab('rejected')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedStatusTab === 'rejected'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Rejected ({rejectedCount})
          </button>
        </div>
      </Card>

      {/* ── APPLICATIONS DATA TABLE ── */}
      <Card className="border-slate-200/80 shadow-sm bg-white rounded-2xl overflow-hidden">
        <div className="p-4">
          <ResponsiveTableView
            data={filteredApplications}
            keyField="id"
            loading={loading}
            columnCount={7}
            columns={[
              { header: "Company & Brand", className: "py-3.5 px-4" },
              { header: "Contact Executive", className: "py-3.5 px-4" },
              { header: "Expo Event", className: "py-3.5 px-4" },
              { header: "Requested Booth", className: "py-3.5 px-4" },
              { header: "Products / Category", className: "py-3.5 px-4" },
              { header: "Status", className: "py-3.5 px-4" },
              { header: "Actions", className: "py-3.5 px-4 text-right" },
            ]}
            emptyMessage="No stall applications found matching the selected filter criteria."
            renderDesktopTable={() => (
              <div className="responsive-table-wrap">
                <table className="w-full min-w-[850px] text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Company & Brand</th>
                      <th className="py-3.5 px-4">Contact Executive</th>
                      <th className="py-3.5 px-4">Expo Event</th>
                      <th className="py-3.5 px-4">Requested Booth</th>
                      <th className="py-3.5 px-4">Products / Category</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                    {filteredApplications.map((app) => {
                      const st = (app.status || 'pending').toLowerCase();
                      const isApproved = st === 'approved';
                      const isConfirmed = ['confirmed', 'paid'].includes(st);
                      const isRejected = st === 'rejected';

                      return (
                        <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-extrabold text-xs shrink-0 border border-slate-200">
                                {(app.company_name || 'C').charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="truncate font-extrabold text-slate-900">{app.company_name || app.name || '—'}</div>
                                <div className="text-[11px] font-medium text-slate-400 truncate">{app.company_type || ''}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800">{app.name}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                              {app.mobile && <span>{app.mobile}</span>}
                              {app.email && <span className="truncate max-w-[140px]">• {app.email}</span>}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 max-w-[180px] truncate" title={app.event_name}>
                              {app.event_name || 'Exhibition Expo'}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{formatDate(app.created_at)}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <Badge className="bg-cyan-50 text-cyan-800 border-cyan-200 font-bold text-[11px]">
                              {app.stall_area || 'Standard Booth'}
                            </Badge>
                            {app.price > 0 && (
                              <div className="text-[11px] font-extrabold text-slate-800 mt-1">
                                ₹{Number(app.price).toLocaleString('en-IN')}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="max-w-[160px] truncate font-medium text-slate-700" title={app.products || app.industry_type}>
                              {app.products || app.industry_type || 'Exhibition Goods'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold inline-flex items-center gap-1 ${
                              isConfirmed
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isApproved
                                ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                : isRejected
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                isConfirmed ? 'bg-emerald-500' : isApproved ? 'bg-sky-500' : isRejected ? 'bg-red-500' : 'bg-amber-500'
                              }`} />
                              {isConfirmed ? 'Confirmed & Paid' : isApproved ? 'Approved (Locked)' : isRejected ? 'Rejected' : 'Pending Review'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedApp(app)}
                                className="h-8 px-2.5 rounded-xl border-slate-200 text-slate-700 hover:text-cyan-700 hover:bg-cyan-50 text-xs font-bold gap-1 cursor-pointer"
                                title="Inspect Full Application"
                              >
                                <Eye size={13} />
                                <span>Details</span>
                              </Button>

                              {st === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateStatus(app.id, 'Approved')}
                                    className="h-8 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold gap-1 cursor-pointer shadow-2xs"
                                    title="Approve Application"
                                  >
                                    <Check size={13} />
                                    <span>Approve</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedApp(app);
                                      setIsRejectModalOpen(true);
                                    }}
                                    className="h-8 px-2.5 rounded-xl border-red-200 bg-red-50/60 text-red-600 hover:bg-red-100 text-xs font-bold gap-1 cursor-pointer"
                                    title="Reject Application"
                                  >
                                    <XCircle size={13} />
                                    <span>Reject</span>
                                  </Button>
                                </>
                              )}

                              {isApproved && (
                                <span className="h-8 px-2.5 rounded-xl bg-sky-50 border border-sky-200/80 text-sky-700 text-xs font-bold gap-1 inline-flex items-center">
                                  <Clock size={12} className="text-sky-500 animate-pulse" />
                                  <span>Awaiting Payment</span>
                                </span>
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
            renderMobileCard={(app) => {
              const st = (app.status || 'pending').toLowerCase();
              const isApproved = st === 'approved';
              const isConfirmed = ['confirmed', 'paid'].includes(st);
              const isRejected = st === 'rejected';

              return (
                <MobileDataCard key={app.id}>
                  <MobileDataCard.Header
                    title={app.company_name || app.name || '—'}
                    subtitle={`${app.name} • ${app.mobile || app.email || ''}`}
                    statusBadge={
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                        isConfirmed
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isApproved
                          ? 'bg-sky-100 text-sky-800 border border-sky-200'
                          : isRejected
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {isConfirmed ? 'Confirmed & Paid' : isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Pending Review'}
                      </span>
                    }
                  />

                  <MobileDataCard.Grid
                    items={[
                      { label: "Expo Event", value: app.event_name || "General Expo" },
                      { label: "Booth Area", value: <Badge className="bg-cyan-50 text-cyan-800 font-bold text-[10px]">{app.stall_area || 'Standard'}</Badge> },
                      { label: "Products", value: app.products || app.industry_type || "—" },
                      { label: "Applied On", value: formatDate(app.created_at) }
                    ]}
                  />

                  <MobileDataCard.Actions>
                    <div className="flex items-center gap-2 w-full">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedApp(app)}
                        className="flex-1 text-xs font-bold rounded-xl border-slate-200 h-9"
                      >
                        <Eye size={14} className="mr-1" />
                        Details
                      </Button>
                      {st === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(app.id, 'Approved')}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl h-9"
                        >
                          <Check size={14} className="mr-1" />
                          Approve
                        </Button>
                      )}
                    </div>
                  </MobileDataCard.Actions>
                </MobileDataCard>
              );
            }}
          />
        </div>
      </Card>

      {/* ── RICH APPLICATION REVIEW SLIDE-OVER MODAL ── */}
      {selectedApp && !isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-black text-slate-900">{selectedApp.company_name}</h2>
                  <Badge className={`font-bold text-[11px] px-2.5 py-0.5 ${
                    (selectedApp.status || '').toLowerCase() === 'approved'
                      ? 'bg-sky-50 text-sky-800 border-sky-200'
                      : ['confirmed', 'paid'].includes((selectedApp.status || '').toLowerCase())
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : (selectedApp.status || '').toLowerCase() === 'rejected'
                      ? 'bg-red-50 text-red-800 border-red-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {selectedApp.status ? selectedApp.status.toUpperCase() : 'PENDING REVIEW'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Applied on {formatDate(selectedApp.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Application Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* Box 1: Company Profile */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2.5">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Building size={14} className="text-slate-500" />
                  <span>Company Credentials</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Business Entity:</span>
                  <p className="font-bold text-slate-900">{selectedApp.company_name || '—'} {selectedApp.company_type ? `(${selectedApp.company_type})` : ''}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Industry Sector:</span>
                  <p className="font-bold text-slate-800">{selectedApp.industry_type || selectedApp.products || '—'}</p>
                </div>
                {selectedApp.company_website && (
                  <div>
                    <span className="text-slate-400 font-medium">Official Website:</span>
                    <a
                      href={selectedApp.company_website.startsWith('http') ? selectedApp.company_website : `https://${selectedApp.company_website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-cyan-600 hover:underline flex items-center gap-1"
                    >
                      <span>{selectedApp.company_website}</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 font-medium">Location:</span>
                  <p className="font-semibold text-slate-700">
                    {[selectedApp.address, selectedApp.city, selectedApp.state, selectedApp.country, selectedApp.pin_code].filter(Boolean).join(', ') || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Box 2: Contact Executive */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2.5">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <UserCheck size={14} className="text-slate-500" />
                  <span>Primary Representative</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Name & Title:</span>
                  <p className="font-bold text-slate-900">{[selectedApp.title, selectedApp.name].filter(Boolean).join(" ") || '—'}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{selectedApp.designation || '—'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Email Address:</span>
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Mail size={13} className="text-slate-400" />
                    <a href={`mailto:${selectedApp.email}`} className="hover:underline">{selectedApp.email}</a>
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Mobile Phone:</span>
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-400" />
                    <a href={`tel:${selectedApp.mobile}`} className="hover:underline">{selectedApp.mobile}</a>
                  </p>
                </div>
              </div>

              {/* Box 3: Booth Requirements */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2.5 md:col-span-2">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Store size={14} className="text-slate-500" />
                  <span>Stall Allocation & Showcase Specs</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Target Expo</span>
                    <p className="font-extrabold text-slate-900 mt-0.5">{selectedApp.event_name}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Requested Stall Area</span>
                    <p className="font-extrabold text-cyan-700 mt-0.5">{selectedApp.stall_area || 'Standard 10×10 ft'}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Stall Rental Price</span>
                    <p className="font-extrabold text-slate-900 mt-0.5">
                      ₹{Number(selectedApp.price || selectedApp.total_price || selectedApp.base_price || 0).toLocaleString('en-IN')}
                      {selectedApp.prime_price > 0 && (
                        <span className="text-[11px] font-semibold text-cyan-700 block">
                          (Base: ₹{Number(selectedApp.base_price).toLocaleString('en-IN')} + Prime: ₹{Number(selectedApp.prime_price).toLocaleString('en-IN')})
                        </span>
                      )}
                      <span className="text-slate-400 text-xs font-normal"> + GST</span>
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">Products & Solutions to Exhibit:</span>
                  <p className="font-semibold text-slate-800 mt-0.5 bg-white p-3 rounded-xl border border-slate-200/70">
                    {selectedApp.products || selectedApp.business_description || '—'}
                  </p>
                </div>

                {selectedApp.rejection_reason && (
                  <div className="rounded-xl bg-red-50 p-3 border border-red-200 text-red-700">
                    <span className="font-bold">Rejection Reason: </span>
                    <span>{selectedApp.rejection_reason}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setSelectedApp(null)}
                className="text-xs font-bold rounded-xl h-10 px-4 cursor-pointer"
              >
                Close View
              </Button>

              <div className="flex items-center gap-2">
                {(selectedApp.status || '').toLowerCase() === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setIsRejectModalOpen(true)}
                      className="text-xs font-bold rounded-xl h-10 px-4 border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <XCircle size={14} className="mr-1.5" />
                      Reject
                    </Button>

                    <Button
                      onClick={() => handleUpdateStatus(selectedApp.id, 'Approved')}
                      className="text-xs font-extrabold rounded-xl h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
                    >
                      <Check size={14} className="mr-1.5" />
                      Approve Application
                    </Button>
                  </>
                )}

                {(selectedApp.status || '').toLowerCase() === 'approved' && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full p-3 bg-sky-50 border border-sky-200 rounded-2xl">
                    <div className="flex items-center gap-2 text-xs text-sky-800 font-bold">
                      <Clock size={15} className="text-sky-600 shrink-0 animate-pulse" />
                      <span>Approved (24h Lock Active) — Waiting for Exhibitor payment checkout.</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedApp.id, 'Confirmed')}
                      className="text-[11px] font-bold rounded-xl border-slate-300 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer h-8 px-3 shrink-0"
                      title="Only click if payment was received directly offline via cash or bank transfer"
                    >
                      Record Offline Payment
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── REJECTION REASON DIALOG ── */}
      {isRejectModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Reject Stall Application</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedApp.company_name}</p>
              </div>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <XCircle size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Please enter the reason for rejecting this application. This note will be recorded and communicated to the applicant:
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Requested stall category is fully booked, company documents incomplete..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-red-500 font-medium"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setIsRejectModalOpen(false)}
                className="text-xs font-bold rounded-xl h-9 px-4 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleUpdateStatus(selectedApp.id, 'Rejected')}
                className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl h-9 px-4 cursor-pointer shadow-xs"
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStall;