import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Calendar, MapPin, Clock, Store, ArrowRight, ArrowLeft,
  Tag, Users, CheckCircle2, Utensils, Car, ShieldCheck,
  Building2, Star, Loader2, AlertCircle, Package, Eye
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import apiClient from "@/shared/api/axiosClient";
import { isEventConcluded } from "@/shared/utils/eventDateUtils";
import { useSelector } from "react-redux";
import { getAuthUserId } from "@/shared/services/authHelper";
import { getEventBookingStatus } from "@/shared/services/bookingService";

/* ── Helpers ────────────────────────────────────────────── */
const fmt = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
};
const fmtTime = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
};

const InfoChip = ({ icon: Icon, label, value, color = "slate" }) => (
  <div className={`flex items-start gap-2.5 p-3 rounded-xl bg-${color}-50 border border-${color}-100`}>
    <div className={`p-1.5 rounded-lg bg-${color}-100 shrink-0`}>
      <Icon className={`w-3.5 h-3.5 text-${color}-600`} />
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-xs font-semibold text-slate-800 mt-0.5">{value}</p>
    </div>
  </div>
);

/* ── Main Component ─────────────────────────────────────── */
const ExhibitorEventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const reduxAuthUser = useSelector((state) => state.auth?.user);
  const reduxUser = useSelector((state) => state.user);
  const effectiveUserId = getAuthUserId(reduxAuthUser || reduxUser);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [existingBooking, setExistingBooking] = useState(null);

  useEffect(() => {
    fetchEventDetail();
  }, [id, effectiveUserId]);

  const fetchEventDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/superadmin/api/event-detail/${id}`);
      if (res.data?.success && res.data?.data) {
        setEvent(res.data.data);
      } else {
        setError("Event details not found.");
      }

      if (effectiveUserId) {
        try {
          const bStatus = await getEventBookingStatus(id, effectiveUserId);
          if (bStatus?.has_booking && bStatus?.booking) {
            setExistingBooking(bStatus.booking);
          } else {
            setExistingBooking(null);
          }
        } catch (bErr) {
          console.warn("Could not check event booking status:", bErr);
        }
      }
    } catch (err) {
      console.error("Failed to fetch event details:", err);
      setError("Failed to load event details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReserveBooth = () => {
    if (existingBooking) {
      navigate(`/exhibitor/my-bookings/${existingBooking.id}`);
      return;
    }
    const ed = event?.eventDetails || {};
    if (isEventConcluded(ed?.id ? ed : event)) return;
    navigate(`/exhibitor/book-stall/${id}`, { state: { event: { id, title: event?.event_name || event?.eventDetails?.event_name } } });
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="space-y-6 pb-16 select-none font-sans animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <div className="w-20 sm:w-32 h-4 bg-slate-200 rounded-md" />
        <div className="w-4 h-4 bg-slate-200 rounded-md shrink-0" />
        <div className="w-32 sm:w-48 h-4 bg-slate-200 rounded-md" />
      </div>

      {/* Hero Banner skeleton */}
      <div className="w-full h-56 sm:h-64 md:h-80 rounded-2xl bg-slate-200 border border-slate-100 shadow-sm" />

      {/* Key Details Grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 sm:h-20 rounded-xl bg-slate-200 border border-slate-100" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-16 sm:h-20 rounded-xl bg-slate-200 border border-slate-100" />
        ))}
      </div>

      {/* Description / About skeleton */}
      <div className="h-32 sm:h-40 rounded-2xl bg-slate-200 border border-slate-100 shadow-sm" />

      {/* Stalls grid skeleton */}
      <div className="h-56 sm:h-64 rounded-2xl bg-slate-200 border border-slate-100 shadow-sm" />
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-red-500" />
      </div>
      <p className="text-sm font-semibold text-slate-700">{error}</p>
      <Button onClick={() => navigate(-1)} variant="outline" className="rounded-xl text-xs font-bold gap-1.5">
        <ArrowLeft className="w-3.5 h-3.5" /> Go Back
      </Button>
    </div>
  );

  const d = event;
  const ed = d?.eventDetails || {};
  const isConcluded = isEventConcluded(ed?.id ? ed : d);
  const isSuspended = (ed?.status || d?.status || "").toUpperCase() === "SUSPENDED";
  const layout = d?.layout || {};
  const stalls = d?.stalls || layout?.stalls || [];
  const amenities = d?.amenities || [];
  const foodItems = d?.food || [];
  const vehicles = d?.vehicles || [];
  const vendors = d?.vendors || [];
  const sponsors = d?.sponsors || [];
  const guests = d?.vendorSponsor?.guests || d?.guests || [];
  const banner = d?.banner_url || d?.banner || d?.image || ed?.banner_url || "";

  return (
    <div className="space-y-6 pb-16 select-none font-sans text-slate-800">

      {/* ── Top Header & Navigation ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/exhibitor/upcoming-events")}
            className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs gap-1.5 shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>Upcoming Events</span>
          </Button>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-bold text-slate-700 truncate max-w-[260px]">{d?.event_name || ed?.event_name}</span>
        </div>

        {/* Top Reserve Booth CTA */}
        {existingBooking ? (
          <Button
            onClick={() => navigate(`/exhibitor/my-bookings/${existingBooking.id}`)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md shadow-amber-500/20 gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Application Submitted ({(existingBooking.status || "Pending").toUpperCase()})</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : !isConcluded && !isSuspended && (
          <Button
            onClick={handleReserveBooth}
            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md shadow-emerald-500/20 gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <Store className="w-4 h-4" />
            <span>Reserve Booth</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* ── Concluded Notice Banner ── */}
      {isConcluded && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3.5 text-amber-900 shadow-xs animate-fadeIn">
          <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-amber-950 text-sm">Exhibition Event Has Concluded</span>
              <Badge className="bg-amber-200 text-amber-900 border-amber-300 font-extrabold text-[10px]">
                Reservations Closed
              </Badge>
            </div>
            <p className="text-amber-800 font-medium leading-relaxed text-xs">
              The dates for this exhibition have passed. Stall reservations and booth applications are permanently closed.
            </p>
          </div>
        </div>
      )}

      {/* ── Suspended Notice Banner ── */}
      {isSuspended && !isConcluded && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3.5 text-amber-900 shadow-xs animate-fadeIn">
          <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-amber-950 text-sm">Booth Reservations Temporarily Paused</span>
              <Badge className="bg-amber-200 text-amber-900 border-amber-300 font-extrabold text-[10px]">
                Currently Not Taking Bookings
              </Badge>
            </div>
            <p className="text-amber-800 font-medium leading-relaxed text-xs">
              The event organizer or platform administrator has temporarily paused new stall reservations for this event. No new exhibitor booth bookings are being accepted at this time.
            </p>
          </div>
        </div>
      )}

      {/* ── Hero Banner ── */}
      {banner ? (
        <div className="relative w-full h-56 sm:h-72 rounded-3xl overflow-hidden border border-slate-200/80 shadow-md">
          <img
            src={banner}
            alt={d?.event_name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/35 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 shadow">
                  {ed?.category || d?.category || "Exhibition"}
                </Badge>
                <Badge className="bg-white/20 backdrop-blur-md text-white border border-white/30 font-bold text-[10px] px-2.5 py-0.5">
                  {ed?.event_type || d?.event_type || "Expo"}
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                {d?.event_name || ed?.event_name}
              </h1>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 font-bold text-[10px] px-2.5 py-0.5 shadow-2xs">
              {ed?.category || d?.category || "Exhibition"}
            </Badge>
            <Badge className="bg-slate-100 text-slate-700 border-slate-200 font-bold text-[10px] px-2.5 py-0.5">
              {ed?.event_type || d?.event_type || "Expo"}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {d?.event_name || ed?.event_name}
          </h1>
        </div>
      )}

      {/* ── 2-Column Responsive Workspace Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ══ LEFT MAIN SECTION (8 COLS) ══ */}
        <div className="lg:col-span-8 space-y-6">

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <InfoChip icon={Calendar} label="Start Date" value={fmt(ed?.start_date || d?.start_date)} color="emerald" />
            <InfoChip icon={Calendar} label="End Date" value={fmt(ed?.end_date || d?.end_date)} color="teal" />
            <InfoChip icon={Clock} label="Timing" value={`${fmtTime(ed?.start_time)} – ${fmtTime(ed?.end_time)}`} color="sky" />
            <InfoChip icon={Tag} label="Event Type" value={ed?.event_type || d?.event_type || "OneTime"} color="violet" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoChip icon={Building2} label="Venue" value={d?.venue || ed?.venue || "—"} color="amber" />
            <InfoChip icon={MapPin} label="Address" value={d?.address || ed?.address || "—"} color="rose" />
          </div>

          {/* Description */}
          {(ed?.description || d?.description) && (
            <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl">
              <CardContent className="p-5">
                <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">About This Exhibition</p>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {ed?.description || d?.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Available Stalls */}
          {stalls.length > 0 && (
            <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Store className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">Available Stall Configurations</p>
                      <p className="text-[11px] text-slate-500">Commercial booths open for exhibitor reservations</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 font-bold text-xs">
                    {stalls.length} Configurations
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {stalls.map((stall, i) => {
                    const priceVal = Number(stall.price_inr || stall.priceINR || stall.price || 0);
                    const qtyVal = parseInt(stall.quantity !== undefined ? stall.quantity : (stall.stallQty !== undefined ? stall.stallQty : (stall.qty !== undefined ? stall.qty : 1)), 10) || 1;
                    return (
                      <div
                        key={i}
                        className="rounded-2xl border border-slate-200/90 hover:border-emerald-300 bg-slate-50/50 hover:bg-emerald-50/20 p-4 space-y-2.5 transition-all shadow-2xs group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-black text-slate-900 group-hover:text-emerald-900 transition-colors">
                              {stall.stall_name || stall.stallName || `Stall #${i + 1}`}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                              Size: <span className="font-bold text-slate-700">{stall.stall_size || stall.size || "10x10 Feet"}</span>
                            </p>
                          </div>
                          {stall.prime_seat && (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-black text-[9px] gap-1 shrink-0">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Prime
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stall.stall_type === "Paid" ? "bg-sky-100 text-sky-700" : "bg-emerald-100 text-emerald-700"}`}>
                            {stall.stall_type || stall.type || "Paid"}
                          </span>
                          <div className="text-right">
                            <p className="text-sm font-black text-emerald-700">
                              ₹{priceVal.toLocaleString("en-IN")}{Boolean(layout?.day_based || layout?.dayBased) ? " / day" : ""}
                            </p>
                            <span className="text-[10px] font-semibold text-slate-400">
                              {qtyVal} Units Configured
                            </span>
                          </div>
                        </div>

                        {stall.prime_seat && stall.prime_price_inr && (
                          <div className="text-[10px] bg-amber-50/80 px-2 py-1 rounded-lg border border-amber-200/60 text-amber-900 flex items-center justify-between">
                            <span>Prime Placement Add-on:</span>
                            <span className="font-extrabold">+₹{Number(stall.prime_price_inr || stall.primePriceINR).toLocaleString("en-IN")}</span>
                          </div>
                        )}

                        {existingBooking ? (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => navigate(`/exhibitor/my-bookings/${existingBooking.id}`)}
                            className="w-full h-8 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs gap-1.5 shadow-2xs transition-colors cursor-pointer"
                          >
                            <span>View Your Application</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        ) : !isConcluded && !isSuspended && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleReserveBooth}
                            className="w-full h-8 rounded-xl bg-white hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200/80 font-bold text-xs gap-1.5 shadow-2xs transition-colors cursor-pointer"
                          >
                            <span>Book This Stall</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Amenities + Food + Vehicles Strip */}
          {(amenities.length > 0 || foodItems.length > 0 || vehicles.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {amenities.length > 0 && (
                <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2.5">
                      <Package className="w-4 h-4 text-violet-600" />
                      <p className="text-xs font-extrabold text-slate-800">Stall Amenities</p>
                    </div>
                    <div className="space-y-1.5">
                      {amenities.map((a, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-medium">{a.amenity}</span>
                          <span className="font-extrabold text-slate-800">×{a.qty}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {foodItems.length > 0 && (
                <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2.5">
                      <Utensils className="w-4 h-4 text-orange-600" />
                      <p className="text-xs font-extrabold text-slate-800">Food Catering</p>
                    </div>
                    <div className="space-y-2">
                      {foodItems.map((f, i) => (
                        <div key={i} className="text-xs">
                          <p className="font-bold text-slate-800">{f.caterer_name || f.catererName}</p>
                          <p className="text-[11px] text-slate-500">{f.meal_type || f.mealType} · {f.food_type || f.foodType}</p>
                          <p className="font-extrabold text-orange-600 text-xs">₹{Number(f.price_inr || f.priceINR || 0).toLocaleString("en-IN")}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {vehicles.length > 0 && (
                <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2.5">
                      <Car className="w-4 h-4 text-sky-600" />
                      <p className="text-xs font-extrabold text-slate-800">Vehicle Pass</p>
                    </div>
                    <div className="space-y-2">
                      {vehicles.map((v, i) => (
                        <div key={i} className="text-xs">
                          <p className="font-bold text-slate-800">{v.vehicle_type || v.vehicleType}</p>
                          <p className="font-extrabold text-sky-600 text-xs">₹{Number(v.price_inr || v.priceINR || 0).toLocaleString("en-IN")}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Guests, Sponsors, Vendors */}
          {(guests.length > 0 || sponsors.length > 0 || vendors.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {guests.length > 0 && (
                <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2.5">
                      <Users className="w-4 h-4 text-teal-600" />
                      <p className="text-xs font-extrabold text-slate-800">VIP Guests</p>
                    </div>
                    <div className="space-y-2">
                      {guests.map((g, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-black shrink-0">
                            {(g.guest_name || g.guestName || g.name || "?")[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{g.guest_name || g.guestName || g.name}</p>
                            {g.designation && <p className="text-[10px] text-slate-400">{g.designation}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {sponsors.length > 0 && (
                <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2.5">
                      <Star className="w-4 h-4 text-amber-500" />
                      <p className="text-xs font-extrabold text-slate-800">Sponsors</p>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      {sponsors.map((s, i) => (
                        <div key={i}>
                          <p className="font-bold text-slate-800">{s.sponsor_name || s.sponsorName}</p>
                          <p className="text-[10px] text-slate-400">{s.sponsorship_type || s.sponsorshipType}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {vendors.length > 0 && (
                <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <p className="text-xs font-extrabold text-slate-800">Vendors</p>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      {vendors.map((v, i) => (
                        <div key={i}>
                          <p className="font-bold text-slate-800">{v.vendor_name || v.vendorName}</p>
                          <p className="text-[10px] text-slate-400">{v.vendor_type || v.vendorType}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

        </div>

        {/* ══ RIGHT SIDEBAR ACTION COLUMN (4 COLS) ══ */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-4">

          {/* In-Flow "Ready to Exhibit?" Card (Clean Light Theme) */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-emerald-100 ring-1 ring-emerald-500/10 space-y-5">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[10px] font-black uppercase tracking-wider">
                <Store className="w-3.5 h-3.5 text-emerald-600" />
                Exhibitor Booth Booking
              </span>
              <h3 className="text-xl font-black text-slate-900">Ready to Exhibit?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Secure your commercial space at <span className="text-emerald-700 font-bold">{d?.event_name || ed?.event_name}</span>. Immediate slot validation.
              </p>
            </div>

            {/* Pricing / Floor Specs Preview */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Floor Structure:</span>
                <span className="font-extrabold text-slate-900">{layout?.floor_type || layout?.floorType || "Stall"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Staff Badges:</span>
                <span className="font-extrabold text-emerald-700">{parseInt(layout?.person_pass || layout?.personPass || 2, 10)} Badges / Stall</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Booking Model:</span>
                <span className="font-extrabold text-slate-900">{Boolean(layout?.day_based || layout?.dayBased) ? "Daily Selection" : "Full Event"}</span>
              </div>
            </div>

            {/* Action Button */}
            {existingBooking ? (
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-800 font-extrabold text-xs">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Application Under Review</span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    You have already applied for this event ({existingBooking.stall_area || "Reserved Stall"}). Status: <strong className="uppercase">{(existingBooking.status || "Pending")}</strong>
                  </p>
                </div>
                <Button
                  onClick={() => navigate(`/exhibitor/my-bookings/${existingBooking.id}`)}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-sm shadow-md shadow-amber-500/20 border-none cursor-pointer flex items-center justify-center gap-2 transition-all transform active:scale-98"
                >
                  <span>View Your Booking Application</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ) : isConcluded ? (
              <Button
                disabled
                className="w-full h-12 rounded-xl bg-slate-100 text-slate-400 font-black text-xs cursor-not-allowed border border-slate-200"
              >
                Event Concluded
              </Button>
            ) : isSuspended ? (
              <Button
                disabled
                className="w-full h-12 rounded-xl bg-slate-100 text-slate-400 font-black text-xs cursor-not-allowed border border-slate-200"
              >
                Bookings Paused
              </Button>
            ) : (
              <Button
                onClick={handleReserveBooth}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 hover:from-emerald-500 hover:to-green-500 text-white font-black text-sm shadow-md shadow-emerald-600/25 border-none cursor-pointer flex items-center justify-center gap-2 transition-all transform active:scale-98"
              >
                <Store className="w-4 h-4" />
                <span>Reserve Booth Now</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}

            <p className="text-[10px] text-slate-400 text-center leading-tight">
              Verified platform booking · Commercial invoice generated on organizer confirmation
            </p>
          </div>

          {/* Venue & Location Specs Card */}
          <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <p className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Event Location</p>
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-extrabold text-slate-900">{d?.venue || ed?.venue || "Exhibition Grounds"}</p>
              <p className="text-slate-500 leading-relaxed">{d?.address || ed?.address || "Address details on confirmation"}</p>
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
};

export default ExhibitorEventDetailPage;
