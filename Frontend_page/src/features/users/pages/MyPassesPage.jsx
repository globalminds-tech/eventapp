import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Ticket, MapPin, Calendar, Clock, ArrowLeft, QrCode, Search,
  Printer, Sparkles, AlertCircle, CheckCircle2, User, LogOut as LogOutIcon,
  ShieldCheck, Loader2, X, ExternalLink, FileText
} from "lucide-react";
import apiClient from "@/shared/api/axiosClient";
import { getUserProfile } from "@/Services/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { isEventConcluded } from "@/shared/utils/eventDateUtils";
import PrintableTicketPass from "@/features/users/components/PrintableTicketPass";

export default function MyPassesPage() {
  const navigate = useNavigate();
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Print Modal State
  const [selectedPrintPass, setSelectedPrintPass] = useState(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  // 1. Debounce Search Input (350ms) for smooth API-driven search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // 2. Fetch Passes from Backend with API Search Query
  const fetchPasses = useCallback(async (searchTerm = "") => {
    try {
      if (searchTerm.trim()) {
        setIsSearching(true);
      } else {
        setLoading(true);
      }

      // Get profile if not already cached
      let currentUser = user;
      if (!currentUser) {
        try {
          const profRes = await getUserProfile();
          currentUser = profRes?.data || profRes || {};
          setUser(currentUser);
        } catch (e) {
          console.warn("Using cached profile for passes:", e);
        }
      }

      const rawUid = currentUser?.id || currentUser?.user_id || localStorage.getItem("userId") || "";
      const userId = (rawUid && rawUid !== "null" && rawUid !== "undefined") ? String(rawUid).trim() : "";
      const email = currentUser?.email || localStorage.getItem("email") || localStorage.getItem("user_email") || "";

      const queryParams = [];
      if (userId) queryParams.push(`user_id=${encodeURIComponent(userId)}`);
      if (email) queryParams.push(`email=${encodeURIComponent(email)}`);
      if (searchTerm.trim()) queryParams.push(`search=${encodeURIComponent(searchTerm.trim())}`);

      const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";

      let res;
      try {
        res = await apiClient.get(`/api/v1/user/my-bookings${queryString}`);
      } catch (fetchErr) {
        if (fetchErr?.response?.status === 404) {
          res = await apiClient.get(`/user/my-bookings${queryString}`);
        } else {
          throw fetchErr;
        }
      }

      const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
      setPasses(list);
    } catch (err) {
      console.error("Failed to fetch passes:", err);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [user]);

  // Fetch when debounced search term changes
  useEffect(() => {
    fetchPasses(debouncedSearch);
  }, [debouncedSearch, fetchPasses]);

  // Open Print Modal for selected pass
  const handleOpenPrintModal = (pass) => {
    setSelectedPrintPass(pass);
    setPrintModalOpen(true);
  };

  // Trigger Browser Print Dialog
  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none pb-24">
      
      {/* ── PRINT-SPECIFIC CSS STYLES ── */}
      <style>{`
        @media print {
          /* Hide all application elements */
          body * {
            visibility: hidden !important;
          }
          /* Show ONLY the designated printable ticket pass */
          #printable-ticket-wrapper,
          #printable-ticket-wrapper * {
            visibility: visible !important;
          }
          #printable-ticket-wrapper {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 8mm !important;
            display: flex !important;
            align-items: flex-start !important;
            justify-content: center !important;
            background: #ffffff !important;
            z-index: 9999999 !important;
          }
          @page {
            size: A4 portrait;
            margin: 6mm 8mm;
          }
        }
      `}</style>

      {/* Top Navbar */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/profile")}
              className="p-2 hover:bg-slate-100 rounded-xl cursor-pointer text-slate-600 border-none bg-transparent transition flex items-center gap-2 font-bold text-xs"
            >
              <ArrowLeft size={18} />
              <span>Back to Profile</span>
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Ticket className="text-orange-500" size={20} />
              <span>My Ticket Passes</span>
            </h1>
          </div>

          {user && (
            <Badge className="bg-orange-50 text-orange-700 border-orange-200 font-extrabold text-xs px-3.5 py-1 gap-1">
              <User size={13} />
              <span>{user.full_name || user.name || user.email}</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-5 sm:pt-8 space-y-6">
        
        {/* Header Banner & API-driven Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-xl">
          <div className="space-y-1">
            <Badge className="bg-orange-500 text-white font-extrabold text-[10px] border-none">
              Verified Digital Passes
            </Badge>
            <h2 className="text-2xl font-black text-white">Your Confirmed Entry Passes</h2>
            <p className="text-xs text-slate-300 font-medium">
              Present your QR code at the venue gate for instant turnstile check-in.
            </p>
          </div>

          {/* API-driven Search Input */}
          <div className="relative shrink-0 w-full md:w-80">
            {isSearching ? (
              <Loader2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400 animate-spin" size={16} />
            ) : (
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            )}
            <input
              type="text"
              placeholder="Search event, venue, ticket code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 bg-white/10 border border-white/20 rounded-2xl pl-10 pr-9 text-xs text-white placeholder-slate-400 font-medium outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white bg-transparent border-none cursor-pointer p-0.5 rounded-full"
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Skeleton Loaders during Initial Load */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Card key={i} className="bg-white border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-sm">
                <Skeleton className="h-40 w-full rounded-2xl" />
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-lg" />
              </Card>
            ))}
          </div>
        )}

        {/* Empty State - No Passes at All */}
        {!loading && passes.length === 0 && !debouncedSearch && (
          <Card className="bg-white border-slate-200/90 shadow-sm rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto my-8">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Ticket size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-900">No Entry Passes Found</h3>
            <p className="text-xs text-slate-500 font-medium">
              You haven't booked any event passes yet. Browse upcoming music shows, expos, and festivals!
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-md border-none cursor-pointer gap-1.5"
            >
              <Sparkles size={16} />
              <span>Discover Events</span>
            </Button>
          </Card>
        )}

        {/* Empty State - Search Query Filter Found 0 Passes */}
        {!loading && passes.length === 0 && debouncedSearch && (
          <Card className="bg-white border-slate-200/90 shadow-sm rounded-3xl p-10 text-center space-y-3 max-w-md mx-auto my-8">
            <div className="w-14 h-14 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto">
              <Search size={26} />
            </div>
            <h3 className="text-base font-black text-slate-900">No Passes Match Your Search</h3>
            <p className="text-xs text-slate-500 font-medium">
              No booked passes found matching <strong className="text-slate-800">"{debouncedSearch}"</strong>. Try checking your spelling or searching by venue.
            </p>
            <Button
              variant="outline"
              onClick={() => setSearch("")}
              className="rounded-xl text-xs font-bold border-slate-200 text-slate-700 cursor-pointer"
            >
              Clear Search Filter
            </Button>
          </Card>
        )}

        {/* Passes Grid */}
        {!loading && passes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {passes.map((pass) => {
              const qrSrc = pass.qr_code
                ? (pass.qr_code.startsWith("data:") ? pass.qr_code : `data:image/png;base64,${pass.qr_code}`)
                : null;
              const banner = pass.banner_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800";

              return (
                <Card key={pass.id} className="bg-white border-slate-200/90 shadow-md rounded-3xl overflow-hidden hover:shadow-xl transition-all">
                  
                  {/* Top Banner Header */}
                  <div className="relative h-32 bg-slate-900">
                    <img
                      src={banner}
                      alt={pass.event_name}
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                      <div>
                        <Badge className="bg-orange-500 text-white font-black text-[10px] border-none mb-1">
                          {pass.category || "Live Event"}
                        </Badge>
                        <h3 className="text-base font-black text-white line-clamp-1">{pass.event_name || pass.eventName}</h3>
                      </div>
                      <span className="text-[10px] font-mono text-amber-300 font-bold bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/10">
                        {pass.ticket_code || (pass.id ? `BKG-#${String(pass.id).replace(/-/g, '').slice(0, 6).toUpperCase()}` : "CONFIRMED")}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <CardContent className="p-6 space-y-4">
                    
                    {/* Booking Safety Notice for Suspended Events */}
                    {(pass.is_suspended || pass.event_status === "SUSPENDED") && (
                      <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-3 text-amber-950 shadow-xs animate-fadeIn">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                          <ShieldCheck size={18} />
                        </div>
                        <div className="space-y-1 text-xs flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-amber-950">Your Booking is Safe &amp; Confirmed</span>
                            <Badge className="bg-amber-200 text-amber-800 border-amber-300 font-extrabold text-[9px]">
                              New Registrations Paused
                            </Badge>
                          </div>
                          <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                            The event organizer has temporarily paused new registrations. <strong>Your existing pass and entry reservation remain 100% secure.</strong> In the event of any issue or cancellation, you are protected by our attendee guarantee and will receive a full 100% refund.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Live Turnstile Status Badge & Pass Type */}
                    <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isEventConcluded(pass) ? (
                          <Badge className="bg-slate-100 text-slate-600 border-slate-300 text-[10px] font-black gap-1">
                            <Clock size={12} />
                            <span>EVENT CONCLUDED</span>
                          </Badge>
                        ) : pass.is_checked_in ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-black gap-1">
                            <CheckCircle2 size={12} />
                            <span>INSIDE VENUE</span>
                          </Badge>
                        ) : pass.is_checked_out ? (
                          <Badge className="bg-slate-100 text-slate-700 border-slate-300 text-[10px] font-bold gap-1">
                            <LogOutIcon size={12} />
                            <span>CHECKED OUT</span>
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-50 text-orange-800 border-orange-200 text-[10px] font-black gap-1">
                            <Sparkles size={12} />
                            <span>VALID ENTRY PASS</span>
                          </Badge>
                        )}

                        {pass.pass_type === "Group Pass" ? (
                          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-black">
                            Group of {pass.group_size || 2}
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] font-bold">
                            Single Pass
                          </Badge>
                        )}

                        <Badge className={pass.entry_type === "Multi Entry" ? "bg-purple-50 text-purple-800 border-purple-200 text-[10px] font-extrabold" : "bg-cyan-50 text-cyan-800 border-cyan-200 text-[10px] font-extrabold"}>
                          {pass.entry_type || "Single Entry"}
                        </Badge>

                        <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] font-bold">
                          {pass.entry_type === "Single Entry"
                            ? `Scans: ${pass.total_checkins || 0}/1`
                            : (pass.max_reentries && pass.max_reentries !== "Unlimited"
                              ? `Scans: ${pass.total_checkins || 0}/${pass.max_reentries}`
                              : `Scans: ${pass.total_checkins || 0} (Unlimited)`)}
                        </Badge>
                      </div>
                      <span className="text-[11px] font-mono font-black text-slate-700">
                        {pass.ticket_code || (pass.id ? `REF-${String(pass.id).replace(/-/g, '').slice(0, 6).toUpperCase()}` : "CONFIRMED")}
                      </span>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-2 text-xs font-semibold text-slate-600 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2 text-slate-800">
                        <MapPin size={15} className="text-orange-500 shrink-0" />
                        <span className="line-clamp-1">{pass.venue || "Venue Details"}, {pass.address || ""}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-slate-400" />
                          <span>{pass.start_date || "Confirmed"}</span>
                        </span>
                        {pass.start_time && (
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} className="text-slate-400" />
                            <span>{pass.start_time}</span>
                          </span>
                        )}
                        <span className="font-extrabold text-emerald-700">
                          {Number(pass.amount_paid) > 0 ? `₹ ${Number(pass.amount_paid).toLocaleString('en-IN')}` : 'FREE PASS'}
                        </span>
                      </div>
                    </div>

                    {/* QR Code & Attendee Info */}
                    <div className="flex items-center gap-5">
                      <div className="p-2.5 bg-white border border-slate-200 rounded-2xl shadow-xs shrink-0 flex flex-col items-center justify-center">
                        {qrSrc ? (
                          <img
                            src={qrSrc}
                            alt="QR Ticket Code"
                            className="w-28 h-28 block object-contain"
                          />
                        ) : (
                          <div className="w-28 h-28 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 gap-1">
                            <QrCode size={32} />
                            <span className="text-[9px] font-bold">QR Code</span>
                          </div>
                        )}
                        <span className="text-[9px] font-mono font-bold text-slate-500 mt-1 max-w-[120px] truncate">
                          {pass.ticket_code || (pass.id ? `PASS-${String(pass.id).replace(/-/g, '').slice(0, 6).toUpperCase()}` : "ACTIVE")}
                        </span>
                        <span className="text-[8.5px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-1.5 py-0.5 rounded-md mt-1 text-center">
                          {pass.entry_type === "Single Entry" ? "Single Entry (1-Use)" : `Multi-Entry (${pass.max_reentries || "Unlimited"})`}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs flex-1">
                        <div>
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase">Attendee Name</span>
                          <p className="font-extrabold text-slate-900">{pass.name}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase">Seats Reserved</span>
                          <p className="font-bold text-slate-800">
                            {pass.ticket_count || 1} Pass ({((pass.pass_type === 'Group Pass' ? (pass.group_size || 2) : 1) * (pass.ticket_count || 1))} Seats)
                          </p>
                        </div>

                        {/* Meal Badges */}
                        {pass.food_details && pass.food_details !== "None" && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                              🍽️ Meal Included
                            </Badge>
                          </div>
                        )}

                        {/* Vehicle Badges */}
                        {(pass.vehicle_details || pass.vehicle_number) && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
                              🚗 Parking Pass {pass.vehicle_number ? `(${pass.vehicle_number})` : ''}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2 flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => handleOpenPrintModal(pass)}
                        className="flex-1 rounded-xl text-xs font-bold py-2.5 border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer gap-1.5 transition"
                      >
                        <Printer size={14} />
                        <span>Print Ticket</span>
                      </Button>
                      <Button
                        onClick={() => navigate(`/event-detail/${pass.event_id}`)}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold py-2.5 border-none cursor-pointer transition"
                      >
                        Event Details
                      </Button>
                    </div>

                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

      </div>

      {/* ── INTERACTIVE TICKET PRINT & PREVIEW MODAL ── */}
      {selectedPrintPass && (
        <Dialog
          open={printModalOpen}
          onClose={() => setPrintModalOpen(false)}
          maxWidth="max-w-4xl"
          className="p-0 overflow-hidden"
        >
          <div className="flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Printer className="text-orange-500" size={18} />
                  <h3 className="font-extrabold text-slate-900 text-base">Print Official Admission Ticket</h3>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  High-resolution digital voucher formatted for clean A4 printing and turnstile scanning.
                </p>
              </div>
            </div>

            {/* Scrollable Pass Preview */}
            <div className="p-6 overflow-y-auto bg-slate-100/70 flex justify-center">
              <div className="w-full shadow-lg rounded-3xl overflow-hidden bg-white">
                <PrintableTicketPass pass={selectedPrintPass} id="modal-preview-pass" />
              </div>
            </div>

            {/* Modal Action Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
                💡 <span className="text-slate-700 font-bold">Tip:</span> In print settings, choose <strong>A4 Portrait</strong> and enable <strong>Background Graphics</strong>.
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setPrintModalOpen(false)}
                  className="flex-1 sm:flex-none rounded-xl text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Close
                </Button>
                <Button
                  onClick={handleTriggerPrint}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md border-none cursor-pointer px-5 py-2.5"
                >
                  <Printer size={15} />
                  <span>Print Ticket Now</span>
                </Button>
              </div>
            </div>

          </div>
        </Dialog>
      )}

      {/* ── DEDICATED PRINT-ONLY CONTAINER (Hidden on screen, Visible on Print) ── */}
      {selectedPrintPass && (
        <div id="printable-ticket-wrapper" className="hidden print:block">
          <PrintableTicketPass pass={selectedPrintPass} id="printable-pass-target" />
        </div>
      )}

    </div>
  );
}
