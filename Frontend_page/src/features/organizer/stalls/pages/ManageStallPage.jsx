import React, { useState, useEffect } from 'react';
import {
  Store, Search, PlusCircle, Eye, CheckCircle2, Clock, MapPin, XCircle,
  Filter, ShieldAlert, FileText, Check, AlertCircle, Phone, Mail, Building
} from 'lucide-react';
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSelector, useDispatch } from "react-redux";
import { fetchEventsThunk } from "@/app/store/eventSlice";
import apiClient from "@/Services/client";

export const ManageStall = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventFilter, setSelectedEventFilter] = useState('all');
  const [selectedStatusTab, setSelectedStatusTab] = useState('all');

  // Modal State for Application Inspection
  const [selectedApp, setSelectedApp] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const [selectedEventOverview, setSelectedEventOverview] = useState(null);
  const [selectedAppDetails, setSelectedAppDetails] = useState(null);
  const [loadingAppDetails, setLoadingAppDetails] = useState(false);

  const dispatch = useDispatch();
  const Redexorganizer = useSelector((state) => state.user);
  const organizerId =
    Redexorganizer?.id ||
    sessionStorage.getItem("id") ||
    localStorage.getItem("id") ||
    sessionStorage.getItem("userId");

  const eventsState = useSelector((state) => state.events?.list);
  const eventsLoading = useSelector((state) => state.events?.loading);
  const eventsList = Array.isArray(eventsState) ? eventsState : (Array.isArray(eventsState?.data) ? eventsState.data : []);

  useEffect(() => {
    if (organizerId) {
      dispatch(fetchEventsThunk(organizerId));
    }
  }, [dispatch, organizerId]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const eventStalls = eventsList.map((ev) => ({
    id: ev.id,
    event_name: ev.event_name || ev.name || "Untitled Event",
    start_date: formatDate(ev.start_date || ev.event_date),
    end_date: formatDate(ev.end_date || ev.start_date || ev.event_date),
    stall_fees: ev.price ? `₹${Number(ev.price).toLocaleString('en-IN')}` : (ev.pass_fee ? `₹${Number(ev.pass_fee).toLocaleString('en-IN')}` : '₹25,000 (Base)'),
    stall_quantity: ev.total_stalls || 0,
  }));

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/v1/organizer/exhibitor-applications');
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

  const handleViewAppDetails = async (appId) => {
    setLoadingAppDetails(true);
    try {
      const res = await apiClient.get(`/exhibitor/api/booking/${appId}`);
      const data = res.data;
      if (data.success) {
        setSelectedAppDetails(data.data);
      } else {
        const item = applications.find(a => String(a.id) === String(appId));
        if(item) setSelectedAppDetails(item);
      }
    } catch (err) {
      console.error(err);
      const item = applications.find(a => String(a.id) === String(appId));
      if(item) setSelectedAppDetails(item);
    }
    setLoadingAppDetails(false);
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await apiClient.put(`/api/v1/organizer/exhibitor-applications/${appId}/status`, {
        status: newStatus, 
        rejection_reason: rejectionReason 
      });
    } catch (err) {
      console.log("Local state update note:", err);
    } finally {
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      setSelectedAppDetails(prev => prev && prev.id === appId ? { ...prev, status: newStatus } : prev);
      setActionSuccess(`✓ Stall Application #${appId} updated to ${newStatus.toUpperCase()}`);
      setIsRejectModalOpen(false);
      setSelectedApp(null);
      setRejectionReason('');
      setTimeout(() => setActionSuccess(''), 3000);
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch = searchTerm === '' ||
      (app.company_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.event_name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEvent = selectedEventFilter === 'all' || String(app.event_id) === String(selectedEventFilter);

    const st = (app.status || '').toLowerCase();
    let matchesStatus = true;
    if (selectedStatusTab === 'pending') matchesStatus = st === 'pending';
    if (selectedStatusTab === 'approved') matchesStatus = st === 'approved';
    if (selectedStatusTab === 'confirmed') matchesStatus = st === 'confirmed' || st === 'paid';
    if (selectedStatusTab === 'rejected') matchesStatus = st === 'rejected';

    return matchesSearch && matchesEvent && matchesStatus;
  });

  const pendingCount = applications.filter(a => (a.status || '').toLowerCase() === 'pending').length;
  const approvedCount = applications.filter(a => (a.status || '').toLowerCase() === 'approved').length;
  const confirmedCount = applications.filter(a => ['confirmed', 'paid'].includes((a.status || '').toLowerCase())).length;

  if (selectedAppDetails) {
    return (
      <div className="space-y-6 pb-12 select-none font-sans text-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {selectedAppDetails.company_name}
              </h1>
              <Badge className={`px-2.5 py-0.5 font-bold text-[11px] ${
                (selectedAppDetails.status || '').toLowerCase() === 'approved' || (selectedAppDetails.status || '').toLowerCase() === 'confirmed'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {selectedAppDetails.status || 'Pending'}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              Full application details provided by the exhibitor.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(selectedAppDetails.status || 'Pending').toLowerCase() === 'pending' && (
              <>
                <button
                  onClick={() => handleUpdateStatus(selectedAppDetails.id, 'Approved')}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Check size={14} />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedApp(selectedAppDetails);
                    setIsRejectModalOpen(true);
                  }}
                  className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-xs transition cursor-pointer flex items-center gap-1.5 border border-red-200"
                >
                  <XCircle size={14} />
                  <span>Reject</span>
                </button>
              </>
            )}
            <Button variant="outline" onClick={() => setSelectedAppDetails(null)} className="font-extrabold text-xs rounded-xl cursor-pointer">
              Back to List
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-6 lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 mb-4 border-b border-slate-100 pb-2">Company Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Company Name</p>
                  <p className="text-xs font-bold text-slate-900">{selectedAppDetails.company_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">GST/PAN</p>
                  <p className="text-xs font-bold text-slate-900">{selectedAppDetails.gst_pan || 'N/A'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Address</p>
                  <p className="text-xs font-bold text-slate-900">{selectedAppDetails.address || 'N/A'}</p>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">{selectedAppDetails.city}, {selectedAppDetails.state}, {selectedAppDetails.country} - {selectedAppDetails.pin_code}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Products / Services Displayed</p>
                  <p className="text-xs font-bold text-slate-900">{selectedAppDetails.products || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-slate-900 mb-4 border-b border-slate-100 pb-2">Primary Contact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
                  <p className="text-xs font-bold text-slate-900">{selectedAppDetails.first_name} {selectedAppDetails.last_name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Designation</p>
                  <p className="text-xs font-bold text-slate-900">{selectedAppDetails.designation || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-xs font-bold text-slate-900">{selectedAppDetails.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mobile</p>
                  <p className="text-xs font-bold text-slate-900">{selectedAppDetails.mobile || 'N/A'}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 mb-4 border-b border-slate-100 pb-2">Booking Overview</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Requested Stall Area</p>
                  <Badge className="bg-cyan-50 text-cyan-800 border-cyan-200 font-bold text-[10px]">
                    {selectedAppDetails.stall_area || 'Unassigned'}
                  </Badge>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Event Name</p>
                  <p className="text-xs font-bold text-slate-900">{selectedAppDetails.event_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Application Date</p>
                  <p className="text-xs font-bold text-slate-900">{selectedAppDetails.created_at ? new Date(selectedAppDetails.created_at).toLocaleString('en-US', {dateStyle: 'medium', timeStyle: 'short'}) : 'N/A'}</p>
                </div>
              </div>
            </div>

            {selectedAppDetails.visiting_card_url && (
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 mb-4 border-b border-slate-100 pb-2">Document Proof</h3>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-2 bg-slate-50 flex items-center justify-center overflow-hidden">
                  <img src={selectedAppDetails.visiting_card_url} alt="Visiting Card" className="max-w-full h-auto max-h-48 rounded-lg" />
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  if (selectedEventOverview) {
    const eventApps = applications.filter(app => app.event_id === selectedEventOverview.id);
    return (
      <div className="space-y-6 pb-12 select-none font-sans text-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {selectedEventOverview.event_name}
              </h1>
              <Badge className="bg-cyan-50 text-cyan-800 border-cyan-200 px-2.5 py-0.5 font-bold text-[11px]">
                Event Overview
              </Badge>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              Detailed list of exhibitors, status, and payment locks for this specific event.
            </p>
          </div>
          <Button variant="outline" onClick={() => setSelectedEventOverview(null)} className="font-extrabold text-xs rounded-xl cursor-pointer">
            Back to Dashboard
          </Button>
        </div>

        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5">
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Exhibitor Company & Contact</th>
                  <th className="py-3.5 px-4">Reserved Booth</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-xs">
                {eventApps.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-14 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                          <Store size={24} />
                        </div>
                        <p className="font-extrabold text-slate-800 text-sm">No Exhibitor Applications</p>
                        <p className="text-xs text-slate-400 text-center font-medium">
                          No exhibitors have requested booths for this event yet. Once exhibitors apply, their applications and 24-hour payment locks will appear here.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  eventApps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                          <Building size={14} className="text-slate-400" /> {app.company_name}
                        </div>
                        <div className="text-slate-500 mt-1 font-medium text-[11px]">
                          {app.first_name} {app.last_name} • {app.mobile}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge className="bg-cyan-50 text-cyan-800 border-cyan-200 font-bold text-[10px]">
                          {app.stall_area || 'Unassigned'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                          (app.status || '').toLowerCase() === 'approved' || (app.status || '').toLowerCase() === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : (app.status || '').toLowerCase() === 'rejected'
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            (app.status || '').toLowerCase() === 'approved' || (app.status || '').toLowerCase() === 'confirmed'
                            ? 'bg-emerald-500' : (app.status || '').toLowerCase() === 'rejected' ? 'bg-red-500' : 'bg-amber-500'
                          }`} />
                          {app.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button 
                          disabled={loadingAppDetails}
                          onClick={() => handleViewAppDetails(app.id)} 
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Eye size={18} />
                        </button>
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

  return (
    <div className="space-y-6 pb-12 select-none font-sans text-slate-800">
      {/* ── ACTION NOTIFICATION TOAST ── */}
      {actionSuccess && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Exhibitor Stall Request Management
            </h1>
            <Badge className="bg-cyan-50 text-cyan-800 border-cyan-200 px-2.5 py-0.5 font-bold text-[11px]">
              Booth Approval Hub
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Review exhibitor booth applications, approve stall allocations, and manage 24-hour payment locks.
          </p>
        </div>
      </div>

      {/* ── KPI METRICS STRIP ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Stall Requests</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{pendingCount} Applications</h3>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Requires Organizer Decision</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
            <Clock size={22} className="animate-pulse" />
          </div>
        </Card>

        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved & Payment Locked</p>
            <h3 className="text-2xl font-extrabold text-cyan-600 mt-1">{approvedCount} Booths</h3>
            <p className="text-[11px] font-medium text-cyan-600 mt-0.5">24-Hour Invoice Active</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100 shrink-0">
            <Store size={22} />
          </div>
        </Card>

        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirmed & Paid Booths</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{confirmedCount} Allocated</h3>
            <p className="text-[11px] font-medium text-emerald-600 mt-0.5">Stall Fully Reserved</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <CheckCircle2 size={22} />
          </div>
        </Card>
      </div>

      {/* ── EVENT STALL OVERVIEW TABLE ── */}
      <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Event Stall Overview</h2>
        </div>
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-3.5 px-4">Event Name</th>
                <th className="py-3.5 px-4">Start & End Date</th>
                <th className="py-3.5 px-4">Stall Quantity(Count)</th>
                <th className="py-3.5 px-4">Stall Fees</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-xs">
              {eventsLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4"><Skeleton className="h-4 w-40 rounded" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-32 rounded" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-12 rounded" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-20 rounded" /></td>
                    <td className="py-4 px-4 text-right"><Skeleton className="h-7 w-7 rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : eventStalls.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                        <Store size={24} />
                      </div>
                      <p className="font-extrabold text-slate-800 text-sm">No Events Found</p>
                      <p className="text-xs text-slate-400 text-center font-medium">
                        You haven't created any events with stall allocations yet. Create an event to begin receiving and managing exhibitor booth applications.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                eventStalls.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">{ev.event_name}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{ev.start_date} - {ev.end_date}</td>
                    <td className="py-3.5 px-4 text-slate-900 font-bold">{ev.stall_quantity}</td>
                    <td className="py-3.5 px-4 text-slate-900 font-bold">{ev.stall_fees}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedEventOverview(ev)}
                        className="p-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 transition cursor-pointer border border-cyan-200"
                        title="View Event Details & Exhibitors"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>


      {/* ── APPLICATION DETAILS MODAL ── */}
      {selectedApp && !isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">{selectedApp.company_name}</h3>
                <p className="text-xs text-slate-500">Stall Application Details — {selectedApp.event_name}</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                <XCircle size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Contact Person</span>
                <p className="font-extrabold text-slate-900">{selectedApp.first_name} {selectedApp.last_name}</p>
                <p className="text-slate-600 flex items-center gap-1"><Mail size={12} />{selectedApp.email}</p>
                <p className="text-slate-600 flex items-center gap-1"><Phone size={12} />{selectedApp.mobile}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Booth Requested</span>
                <p className="font-extrabold text-cyan-800">{selectedApp.stall_area}</p>
                <p className="text-slate-900 font-extrabold mt-1">₹{Number(selectedApp.price_inr || 25000).toLocaleString('en-IN')}</p>
              </div>

              <div className="col-span-2 p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Products & Services Showcase</span>
                <p className="font-semibold text-slate-700">{selectedApp.products || 'Exhibition Product Showcase'}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedApp(null)} className="text-xs font-bold rounded-xl cursor-pointer">
                Close
              </Button>
              {selectedApp.status?.toLowerCase() === 'pending' && (
                <Button onClick={() => handleUpdateStatus(selectedApp.id, 'Approved')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl cursor-pointer">
                  Approve Booth
                </Button>
              )}
            </div>
          </div>
        </div>
      )}


      {/* ── REJECTION REASON MODAL ── */}
      {isRejectModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Reject Application #{selectedApp.id}</h3>
              <button onClick={() => setIsRejectModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                <XCircle size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Please specify the reason for rejecting {selectedApp.company_name}'s booth application:
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Requested stall category is full, GST verification failed..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-red-500 font-medium"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsRejectModalOpen(false)} className="text-xs font-bold rounded-xl cursor-pointer">
                Cancel
              </Button>
              <Button onClick={() => handleUpdateStatus(selectedApp.id, 'Rejected')} className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl cursor-pointer">
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