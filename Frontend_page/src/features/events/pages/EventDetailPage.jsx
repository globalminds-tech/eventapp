import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Calendar, MapPin, Users, Tag,
  CheckCircle2, AlertCircle, Building2,
  Star, ShoppingBag, Loader2, Clock, Sparkles, ShieldCheck, Ticket, ArrowRight, Share2,
  Award, ThumbsUp, Utensils, Info, Compass, Layers, Store, Car
} from "lucide-react";
import { getFullEventDetails } from "@/Services/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id) { setError("No event ID provided"); setLoading(false); return; }
    getFullEventDetails(id)
      .then((res) => {
        setData(res);
      })
      .catch((e) => setError(e.message || "Failed to load event details"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none pb-12">
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-40 h-16 px-6 flex items-center justify-between">
        <Skeleton className="h-6 w-48 rounded-xl" />
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>
      <div className="max-w-7xl mx-auto px-6 w-full pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border-slate-200/80 p-6 space-y-4 rounded-3xl">
            <Skeleton className="w-full aspect-[16/7] rounded-2xl" />
            <Skeleton className="h-8 w-3/4 rounded-xl" />
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-5/6 rounded-lg" />
          </Card>
        </div>
        <div>
          <Card className="bg-white border-slate-200/80 p-6 space-y-4 rounded-3xl">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </Card>
        </div>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center">
      <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
      <p className="text-slate-800 font-extrabold text-base mb-4">{error || "Event details not found in database"}</p>
      <Button 
        className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-xl border-none cursor-pointer"
        onClick={() => navigate(-1)}
      >
        Go Back
      </Button>
    </div>
  );

  // Safely extract database payload
  const payload = data?.data || data;
  const ev = payload?.eventDetails || payload;
  const booking = payload?.booking || {};
  const vendors = payload?.vendors || payload?.vendorSponsor?.vendors || [];
  const sponsors = payload?.sponsors || payload?.vendorSponsor?.sponsors || [];
  const guests = payload?.guests || payload?.vendorSponsor?.guests || [];
  const terms = payload?.terms || payload?.termsDetails?.policies || [];
  const food_items = payload?.food_items || payload?.food || payload?.foodProvision?.foodItems || [];
  const layout = payload?.layout || {};
  const stalls = payload?.stalls || layout?.stalls || [];
  const vehicles = payload?.vehicles || payload?.vehicle_details || payload?.vehicleProvision?.vehicles || [];

  // Accurate banner extraction
  const bannerUrl = 
    payload?.banner_url || 
    payload?.banner || 
    payload?.image || 
    ev?.banner_url || 
    ev?.banner || 
    ev?.image || 
    payload?.documents?.bannerPreview || 
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800";

  // Accurate price extraction checking all possible DB keys (booking.priceINR, booking.price_inr, ev.pass_fee, ev.price, etc.)
  const rawPrice = 
    booking?.priceINR ?? 
    booking?.price_inr ?? 
    booking?.price ?? 
    ev?.pass_fee ?? 
    ev?.price ?? 
    ev?.price_inr ?? 
    payload?.pass_fee ?? 
    payload?.price ?? 
    payload?.price_inr ?? 
    0;

  const passFeeNum = Number(rawPrice);
  const chargeType = String(booking?.chargeType || booking?.charge_type || ev?.charge_type || ev?.entry_type || "").toLowerCase();
  const isPaid = (chargeType === "paid") || (passFeeNum > 0);
  const isFree = !isPaid;
  const priceDisplay = isPaid ? `₹ ${passFeeNum.toLocaleString('en-IN')}` : "FREE PASS";

  const handleProceedToBooking = () => {
    navigate(`/usersbooking/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none pb-16">
      
      {/* ── TOP WEB EXECUTIVE NAVBAR ── */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-xl cursor-pointer text-slate-600 transition border-none bg-transparent flex items-center gap-2 font-bold text-xs"
              title="Go Back"
            >
              <ArrowLeft size={18} />
              <span>Back to Events</span>
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <span className="text-base font-extrabold text-slate-900 line-clamp-1 tracking-tight">
              {ev?.event_name || ev?.eventName || payload?.event_name || "Event Showcase"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 font-extrabold text-xs px-3.5 py-1">
              Verified Event Pass
            </Badge>
          </div>
        </div>
      </div>

      {/* ── MAIN DESKTOP WEB CANVAS VIEWPORT ── */}
      <div className="max-w-7xl mx-auto px-6 w-full pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── LEFT MAIN SHOWCASE COLUMN (2 COLS) ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Hero Banner Container */}
            <Card className="bg-white border border-slate-200/80 shadow-xs rounded-3xl overflow-hidden">
              <div className="relative w-full aspect-[16/8] sm:aspect-[16/7] bg-slate-900 overflow-hidden">
                <img 
                  src={bannerUrl} 
                  alt={ev?.event_name || ev?.eventName || "Event Banner"} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                
                <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                  {(ev?.category || payload?.category) && (
                    <Badge className="bg-orange-500 text-white font-extrabold text-[11px] px-3.5 py-1 shadow-md border-none">
                      {ev?.category || payload?.category}
                    </Badge>
                  )}
                  {(ev?.sub_category || ev?.subCategory || payload?.sub_category) && (
                    <Badge className="bg-amber-500 text-white font-extrabold text-[11px] px-3 py-1 shadow-md border-none">
                      {ev?.sub_category || ev?.subCategory || payload?.sub_category}
                    </Badge>
                  )}
                  {(ev?.event_code || ev?.eventCode || payload?.event_code) && (
                    <Badge className="bg-slate-900/80 backdrop-blur-md text-white font-extrabold text-[11px] px-3.5 py-1 border border-white/20">
                      {ev?.event_code || ev?.eventCode || payload?.event_code}
                    </Badge>
                  )}
                </div>

                <div className="absolute bottom-6 left-6 right-6 text-white space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-amber-400">
                    <Star size={14} className="fill-amber-400" />
                    <span>Live Registered Event</span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                    {ev?.event_name || ev?.eventName || payload?.event_name}
                  </h1>
                </div>
              </div>

              <CardContent className="p-6 md:p-8 space-y-6">
                {/* Description */}
                {(ev?.description || payload?.description) && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Event Overview &amp; Highlights</h3>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                      {ev?.description || payload?.description}
                    </p>
                  </div>
                )}

                {/* Key Specs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-1">
                    <div className="flex items-center gap-2 text-orange-600 font-extrabold text-xs">
                      <Calendar size={16} />
                      <span className="uppercase tracking-wider text-[10px]">Date &amp; Schedule</span>
                    </div>
                    <p className="text-sm font-extrabold text-slate-900 mt-1">{ev?.start_date || ev?.startDate || payload?.start_date || 'Upcoming Date'}</p>
                    <p className="text-xs text-slate-500 font-medium">
                      {(ev?.start_time || payload?.start_time) ? `Timings: ${ev?.start_time || payload?.start_time}` : 'Full Day Event'}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-1">
                    <div className="flex items-center gap-2 text-orange-600 font-extrabold text-xs">
                      <MapPin size={16} />
                      <span className="uppercase tracking-wider text-[10px]">Venue Location</span>
                    </div>
                    <p className="text-sm font-extrabold text-slate-900 mt-1 line-clamp-1">{ev?.venue || payload?.venue || 'Exhibition Venue'}</p>
                    <p className="text-xs text-slate-500 font-medium line-clamp-1">{ev?.address || payload?.address || 'Chennai, India'}</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-1">
                    <div className="flex items-center gap-2 text-orange-600 font-extrabold text-xs">
                      <Ticket size={16} />
                      <span className="uppercase tracking-wider text-[10px]">Pass Status</span>
                    </div>
                    <p className="text-sm font-extrabold text-emerald-700 mt-1">{isFree ? 'Free Registration Open' : 'Paid Entry Pass'}</p>
                    <p className="text-xs text-slate-500 font-medium">Instant E-Ticket Delivery</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chief Guests Section (DB Driven) */}
            {guests && guests.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-orange-500" />
                  <h2 className="text-lg font-extrabold text-slate-900">Chief Guests &amp; Dignitaries</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {guests.map((g, i) => (
                    <Card key={i} className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs flex items-center gap-4">
                      {g.image ? (
                        <img src={g.image} alt={g.guest_name || g.name} className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-slate-100 shadow-xs" />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center font-black text-base shrink-0">
                          {(g.guest_name || g.name)?.[0]?.toUpperCase() || 'G'}
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">{g.guest_name || g.guestName || g.name}</h3>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{g.designation || 'Dignitary'}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Official Sponsors Section (DB Driven) */}
            {sponsors && sponsors.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500" />
                  <h2 className="text-lg font-extrabold text-slate-900">Official Event Partners &amp; Sponsors</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {sponsors.map((s, i) => (
                    <Card key={i} className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs text-center space-y-1">
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-extrabold text-[10px] mx-auto">
                        {s.sponsorship_type || s.sponsorshipType || s.sponsorship || 'Official Partner'}
                      </Badge>
                      <h3 className="text-xs font-extrabold text-slate-900 pt-1">{s.sponsor_name || s.sponsorName}</h3>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Exhibition Floor Plan & Presenting Stalls (DB Driven) */}
            {stalls && stalls.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Store size={18} className="text-purple-600" />
                  <h2 className="text-lg font-extrabold text-slate-900">Exhibition Stalls &amp; Floor Layout</h2>
                </div>

                <Card className="bg-white border border-slate-200/80 shadow-xs rounded-2xl p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {stalls.map((st, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-150 space-y-1">
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="bg-white text-purple-700 border-purple-200 font-extrabold text-[10px]">
                            {st.stall_name || st.stallName}
                          </Badge>
                          <span className="text-[10px] font-bold text-slate-400">{st.stall_size || st.size}</span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-900 pt-1">{st.stall_type || st.type || 'Exhibition Booth'}</h4>
                        {(st.price_inr || st.priceINR) && (
                          <p className="text-[11px] font-extrabold text-purple-700">₹ {Number(st.price_inr || st.priceINR).toLocaleString('en-IN')}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Food Provisions (DB Driven) */}
            {food_items && food_items.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Utensils size={18} className="text-emerald-600" />
                  <h2 className="text-lg font-extrabold text-slate-900">Catering &amp; Meal Provisions</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {food_items.map((f, i) => (
                    <Card key={i} className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-black shrink-0">
                        🍽️
                      </div>
                      <div>
                        <h3 className="text-xs font-extrabold text-slate-900">{f.caterer_name || f.catererName} — {f.meal_type || f.mealType}</h3>
                        <p className="text-[11px] font-semibold text-emerald-700">{f.food_type || f.foodType} {f.menu_details ? `(${f.menu_details})` : ''}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Vehicle Provisions (DB Driven) */}
            {vehicles && vehicles.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Car size={18} className="text-blue-600" />
                  <h2 className="text-lg font-extrabold text-slate-900">Vehicle Parking Passes</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {vehicles.map((v, i) => (
                    <Card key={i} className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs text-center space-y-1">
                      <span className="text-xs font-extrabold text-slate-900 block">{v.vehicle_type || v.vehicleType}</span>
                      <span className="text-xs font-black text-blue-700">₹ {Number(v.price_inr || v.priceINR || 0).toLocaleString('en-IN')}</span>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Terms & Policies (DB Driven) */}
            {terms && terms.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-slate-600" />
                  <h2 className="text-lg font-extrabold text-slate-900">Terms &amp; Policies</h2>
                </div>

                <Card className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs space-y-2 text-xs font-medium text-slate-700">
                  {terms.map((t, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{t.policy_name || t.policyName} ({t.policy_group || t.policyGroup})</span>
                    </div>
                  ))}
                </Card>
              </div>
            )}

          </div>

          {/* ── RIGHT DESKTOP WEB STICKY BOOKING CARD (1 COL) ── */}
          <div className="sticky top-20 space-y-6">
            <Card className="bg-white border border-slate-200/90 shadow-md rounded-3xl p-6 space-y-6">
              
              <div className="space-y-2 border-b border-slate-100 pb-5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Registration Fee</span>
                  <Badge className={isPaid ? "bg-orange-50 text-orange-700 border-orange-200 font-extrabold" : "bg-emerald-50 text-emerald-700 border-emerald-200 font-extrabold"}>
                    {isPaid ? "Paid Pass" : "Free Pass"}
                  </Badge>
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{priceDisplay}</h2>
              </div>

              {/* Event Location & Date Quick Info */}
              <div className="space-y-3 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block">{ev?.start_date || ev?.startDate || payload?.start_date || 'Upcoming Date'}</span>
                    <span className="text-[11px] text-slate-400">{(ev?.start_time || payload?.start_time) ? `Starts at ${ev?.start_time || payload?.start_time}` : 'Full Day Event'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block line-clamp-1">{ev?.venue || payload?.venue || 'Exhibition Venue'}</span>
                    <span className="text-[11px] text-slate-400 line-clamp-1">{ev?.address || payload?.address || 'Chennai, India'}</span>
                  </div>
                </div>
              </div>

              {/* CTA Action Button */}
              <Button
                onClick={handleProceedToBooking}
                className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-500 text-white font-extrabold text-sm py-4 rounded-2xl shadow-md border-none cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Proceed to Book Ticket</span>
                <ArrowRight size={18} />
              </Button>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-slate-400 font-semibold flex items-center justify-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Instant E-Pass Generation &amp; QR Access</span>
                </span>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
