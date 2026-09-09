import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft, Calendar, MapPin, Users, Tag,
  CheckCircle2, AlertCircle, Building2,
  Star, ShoppingBag, Loader2, Clock, Sparkles, ShieldCheck, Ticket, ArrowRight, Share2,
  Award, ThumbsUp, Utensils, Info, Compass, Layers, Store, Car, ExternalLink, Check, Copy
} from "lucide-react";
import { getFullEventDetails } from "@/Services/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import AuthBookingModal from "@/features/events/components/AuthBookingModal";
import { isEventConcluded } from "@/shared/utils/eventDateUtils";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Auth resolution
  const auth = useSelector((state) => state.auth);
  const token = auth?.accessToken || sessionStorage.getItem("token") || localStorage.getItem("token");
  const isAuthenticated = Boolean(auth?.isAuthenticated || (token && !token.includes("-session-token")));

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
            <Skeleton className="h-12 w-full rounded-xl" />
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
        className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-extrabold rounded-xl border-none cursor-pointer"
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

  const parseAmenitiesList = (raw) => {
    if (!raw) return [];
    let parsed = raw;
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
        try {
          parsed = JSON.parse(trimmed);
        } catch {
          parsed = raw;
        }
      } else {
        return trimmed.split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
      }
    }

    if (Array.isArray(parsed)) {
      const items = [];
      parsed.forEach((item) => {
        if (typeof item === "string") {
          items.push(...item.split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean));
        } else if (item && typeof item === "object") {
          const val = item.amenity || item.amenities || item.name || item.title;
          if (val) {
            if (Array.isArray(val)) {
              items.push(...val.map(String));
            } else {
              items.push(...String(val).split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean));
            }
          } else if (item.stallName) {
            items.push(String(item.stallName));
          }
        }
      });
      return Array.from(new Set(items)).filter((s) => !s.startsWith("{") && !s.startsWith("[") && s.length > 0);
    }

    if (parsed && typeof parsed === "object") {
      const val = parsed.amenity || parsed.amenities || parsed.name;
      if (val) return parseAmenitiesList(val);
      return Object.values(parsed).filter((v) => typeof v === "string");
    }

    return String(parsed).split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
  };

  const parsedAmenities = parseAmenitiesList(ev?.amenities || payload?.amenities || layout?.amenities);

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

  // Accurate price extraction checking all possible DB keys
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
  const eventTitle = ev?.event_name || ev?.eventName || payload?.event_name || "Event Showcase";
  const eventCategory = ev?.category || payload?.category || "Live Event";
  const eventSubCategory = ev?.sub_category || ev?.subCategory || payload?.sub_category;
  const eventVenue = ev?.venue || payload?.venue || "Exhibition Centre";
  const eventAddress = ev?.address || payload?.address || "City Centre, India";
  const eventDate = ev?.start_date || ev?.startDate || payload?.start_date || "Upcoming Date";
  const eventTime = ev?.start_time || payload?.start_time;

  const isConcluded = isEventConcluded(ev || payload);

  const handleProceedToBooking = () => {
    if (isConcluded) return;
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    navigate(`/usersbooking/${id}`);
  };

  const handleLoginSuccess = () => {
    setIsAuthModalOpen(false);
    if (isConcluded) return;
    navigate(`/usersbooking/${id}`);
  };

  const handleShare = async () => {
    const shareData = {
      title: eventTitle,
      text: `Check out ${eventTitle} on BookMyEvent!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // Fallback to clipboard if user dismissed native share
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  };

  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${eventVenue} ${eventAddress}`)}`;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none pb-24 lg:pb-16">
      
      {/* ── TOP WEB EXECUTIVE NAVBAR & BREADCRUMBS ── */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-xl cursor-pointer text-slate-600 transition border-none bg-transparent flex items-center gap-1.5 font-bold text-xs shrink-0"
              title="Go Back"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="h-5 w-px bg-slate-200 shrink-0" />

            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate">
              <Link to="/" className="hover:text-orange-600 transition-colors shrink-0">Home</Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-500 shrink-0">{eventCategory}</span>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-slate-900 truncate">{eventTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="h-9 px-3 text-xs font-bold text-slate-700 border-slate-200 hover:bg-slate-50 rounded-xl gap-1.5 cursor-pointer"
            >
              {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
              <span className="hidden sm:inline">{copiedLink ? "Link Copied!" : "Share"}</span>
            </Button>

            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 font-extrabold text-[11px] px-3 py-1 gap-1 hidden sm:flex">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>Official Event</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* ── MAIN CANVAS VIEWPORT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-6 sm:pt-8">
        {isConcluded && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/90 flex items-center justify-between gap-4 text-amber-900 shadow-xs animate-in fade-in duration-300">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
                <AlertCircle size={22} />
              </div>
              <div>
                <p className="font-extrabold text-sm leading-tight text-amber-950">This Event Has Concluded</p>
                <p className="text-xs text-amber-800 font-medium mt-0.5">The event schedule has passed. Ticket bookings and pass reservations are closed.</p>
              </div>
            </div>
            <Badge className="bg-amber-200/80 text-amber-900 border border-amber-300 font-black text-[11px] px-3 py-1 shrink-0 uppercase tracking-wider">
              Archived
            </Badge>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── LEFT MAIN SHOWCASE COLUMN (2 COLS) ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Cinematic Hero Banner Container */}
            <Card className="bg-white border border-slate-200/80 shadow-xs rounded-3xl overflow-hidden">
              <div className="relative w-full aspect-[16/8] sm:aspect-[16/7] bg-slate-950 overflow-hidden group">
                <img 
                  src={bannerUrl} 
                  alt={eventTitle} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                
                {/* Top Badges Overlay */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-orange-500 text-white font-extrabold text-[11px] px-3.5 py-1 shadow-md border-none">
                      {eventCategory}
                    </Badge>
                    {eventSubCategory && (
                      <Badge className="bg-amber-500 text-white font-extrabold text-[11px] px-3 py-1 shadow-md border-none">
                        {eventSubCategory}
                      </Badge>
                    )}
                  </div>

                  {(ev?.event_code || payload?.event_code) && (
                    <Badge className="bg-slate-900/80 backdrop-blur-md text-white font-mono text-[11px] px-3 py-1 border border-white/20">
                      ID: {ev?.event_code || payload?.event_code}
                    </Badge>
                  )}
                </div>

                {/* Bottom Overlay Title & Live Pulse */}
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-amber-300">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span>Live Bookings Open</span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
                    {eventTitle}
                  </h1>
                </div>
              </div>

              <CardContent className="p-6 sm:p-8 space-y-6">
                {/* Key Specs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-150 space-y-1">
                    <div className="flex items-center gap-2 text-orange-600 font-extrabold text-xs">
                      <Calendar size={16} />
                      <span className="uppercase tracking-wider text-[10px]">Date &amp; Schedule</span>
                    </div>
                    <p className="text-sm font-extrabold text-slate-900 mt-1">{eventDate}</p>
                    <p className="text-xs text-slate-500 font-medium">
                      {eventTime ? `Starts at ${eventTime}` : 'Full Day Schedule'}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-150 space-y-1">
                    <div className="flex items-center gap-2 text-orange-600 font-extrabold text-xs">
                      <MapPin size={16} />
                      <span className="uppercase tracking-wider text-[10px]">Venue Location</span>
                    </div>
                    <p className="text-sm font-extrabold text-slate-900 mt-1 line-clamp-1">{eventVenue}</p>
                    <p className="text-xs text-slate-500 font-medium line-clamp-1">{eventAddress}</p>
                  </div>

                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-150 space-y-1">
                    <div className="flex items-center gap-2 text-orange-600 font-extrabold text-xs">
                      <Ticket size={16} />
                      <span className="uppercase tracking-wider text-[10px]">Pass Status</span>
                    </div>
                    <p className="text-sm font-extrabold text-emerald-700 mt-1">{isFree ? 'Free Pass Available' : 'Paid Entry Pass'}</p>
                    <p className="text-xs text-slate-500 font-medium">Instant E-Pass &amp; QR Delivery</p>
                  </div>
                </div>

                {/* Description & Overview */}
                {(ev?.description || payload?.description) && (
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h2 className="text-sm font-black uppercase text-slate-400 tracking-wider">About The Event</h2>
                    <p className="text-sm text-slate-700 font-normal leading-relaxed whitespace-pre-wrap">
                      {ev?.description || payload?.description}
                    </p>
                  </div>
                )}

                {/* Amenities & Tags */}
                {parsedAmenities && parsedAmenities.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Venue Amenities</h3>
                    <div className="flex gap-2 flex-wrap">
                      {parsedAmenities.map((amenity, idx) => (
                        <Badge key={idx} variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-semibold text-xs py-1 px-3">
                          ✓ {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chief Guests Section */}
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
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{g.designation || 'Special Guest'}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Official Sponsors Section */}
            {sponsors && sponsors.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500" />
                  <h2 className="text-lg font-extrabold text-slate-900">Official Partners &amp; Sponsors</h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {sponsors.map((s, i) => (
                    <Card key={i} className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs text-center space-y-1">
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-extrabold text-[10px] mx-auto">
                        {s.sponsorship_type || s.sponsorshipType || s.sponsorship || 'Official Sponsor'}
                      </Badge>
                      <h3 className="text-xs font-extrabold text-slate-900 pt-1">{s.sponsor_name || s.sponsorName}</h3>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Exhibition Stalls & Floor Layout */}
            {stalls && stalls.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Store size={18} className="text-purple-600" />
                  <h2 className="text-lg font-extrabold text-slate-900">Exhibition Stalls &amp; Booths</h2>
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

            {/* Food Provisions */}
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

            {/* Vehicle Parking Provisions */}
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

            {/* Venue Map & Directions Action */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-orange-600" />
                <h2 className="text-lg font-extrabold text-slate-900">Venue &amp; Location Guide</h2>
              </div>

              <Card className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">{eventVenue}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{eventAddress}</p>
                  </div>
                  <a
                    href={mapSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition shrink-0 no-underline"
                  >
                    <span>Get Directions</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </Card>
            </div>

            {/* Terms & Policies */}
            {terms && terms.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-slate-600" />
                  <h2 className="text-lg font-extrabold text-slate-900">Event Terms &amp; Policies</h2>
                </div>

                <Card className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs space-y-2 text-xs font-medium text-slate-700">
                  {terms.map((t, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{t.policy_name || t.policyName} {t.policy_group ? `(${t.policy_group})` : ''}</span>
                    </div>
                  ))}
                </Card>
              </div>
            )}

          </div>

          {/* ── RIGHT DESKTOP STICKY BOOKING CARD (1 COL) ── */}
          <div className="sticky top-20 space-y-6">
            <Card className="bg-white border border-slate-200/90 shadow-lg rounded-3xl p-6 space-y-6">
              
              <div className="space-y-2 border-b border-slate-100 pb-5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Registration Pass</span>
                  <div className="flex items-center gap-1.5">
                    {String(booking?.pass_type || booking?.passType || "").toLowerCase().includes("group") ? (
                      <Badge className="bg-amber-50 text-amber-800 border-amber-200 font-extrabold text-[10px]">
                        Group Pass (2-{booking?.group_member_limit || booking?.groupMemberLimit || 5})
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-50 text-orange-700 border-orange-200 font-extrabold text-[10px]">
                        Single Pass
                      </Badge>
                    )}
                    <Badge className={isPaid ? "bg-orange-50 text-orange-700 border-orange-200 font-extrabold text-[10px]" : "bg-emerald-50 text-emerald-700 border-emerald-200 font-extrabold text-[10px]"}>
                      {isPaid ? "Paid Pass" : "Free Pass"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{priceDisplay}</h2>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {String(booking?.pass_type || "").toLowerCase().includes("group") ? "/ group pass" : "/ attendee"}
                  </span>
                </div>
              </div>

              {/* Booking Window & Capacity Badges */}
              {(() => {
                if (isConcluded) {
                  return (
                    <div className="p-3.5 bg-amber-50 border border-amber-200/90 rounded-2xl flex items-center gap-2.5 text-amber-900 text-xs font-bold shadow-xs">
                      <AlertCircle size={16} className="text-amber-600 shrink-0" />
                      <span>Event Concluded • Ticket bookings are closed</span>
                    </div>
                  );
                }

                const today = new Date().toISOString().split("T")[0];
                const bStart = booking?.booking_start_date;
                const bEnd = booking?.booking_end_date;
                const notStarted = bStart && today < bStart;
                const ended = bEnd && today > bEnd;

                if (notStarted) {
                  return (
                    <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl flex items-center gap-2 text-sky-800 text-xs font-bold">
                      <Clock size={16} className="text-sky-600 shrink-0" />
                      <span>Sales start on {bStart}</span>
                    </div>
                  );
                }
                if (ended) {
                  return (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-800 text-xs font-bold">
                      <AlertCircle size={16} className="text-rose-600 shrink-0" />
                      <span>Ticket booking closed</span>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Event Location & Date Quick Info */}
              <div className="space-y-3 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block">{eventDate}</span>
                    <span className="text-[11px] text-slate-400">{eventTime ? `Starts at ${eventTime}` : 'Full Day Entry'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block line-clamp-1">{eventVenue}</span>
                    <span className="text-[11px] text-slate-400 line-clamp-1">{eventAddress}</span>
                  </div>
                </div>
              </div>

              {/* Inclusions Checklist */}
              <div className="space-y-2 py-2 border-t border-slate-100 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span>Verified digital QR entry pass</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span>Turnstile scanner gate check-in</span>
                </div>
                {ev?.food == 1 && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    <span>Food catering &amp; meal vouchers available</span>
                  </div>
                )}
                {ev?.vehicle_pass == 1 && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    <span>Reserved vehicle parking passes</span>
                  </div>
                )}
              </div>

              {/* CTA Action Button */}
              {(() => {
                const today = new Date().toISOString().split("T")[0];
                const bStart = booking?.booking_start_date;
                const bEnd = booking?.booking_end_date;
                const notStarted = bStart && today < bStart;
                const ended = bEnd && today > bEnd;
                const isClosed = isConcluded || notStarted || ended;

                return (
                  <Button
                    onClick={handleProceedToBooking}
                    disabled={isClosed}
                    className={`w-full font-extrabold text-sm py-4 rounded-2xl shadow-md border-none flex items-center justify-center gap-2 transition ${
                      isClosed
                        ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-500 text-white cursor-pointer"
                    }`}
                  >
                    <span>
                      {isConcluded
                        ? "Event Concluded"
                        : notStarted
                        ? `Booking Opens ${bStart}`
                        : ended
                        ? "Booking Closed"
                        : isPaid
                        ? "Proceed to Book Ticket"
                        : "Get Free Entry Pass"}
                    </span>
                    {!isClosed && <ArrowRight size={18} />}
                  </Button>
                );
              })()}

              <div className="pt-1 text-center">
                <span className="text-[11px] text-slate-400 font-semibold flex items-center justify-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Official Guaranteed Pass • Instant Confirmation</span>
                </span>
              </div>
            </Card>
          </div>

        </div>
      </div>

      {/* ── MOBILE STICKY BOTTOM BOOKING BAR ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3.5 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl z-40 flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Registration Fee</span>
          <span className="text-lg font-black text-slate-900">{priceDisplay}</span>
        </div>
        <Button
          onClick={handleProceedToBooking}
          disabled={isConcluded}
          className={`${
            isConcluded
              ? "bg-slate-300 text-slate-500 cursor-not-allowed"
              : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white cursor-pointer"
          } font-extrabold text-xs px-5 py-3 rounded-xl shadow-md border-none flex items-center gap-1.5 shrink-0`}
        >
          <span>{isConcluded ? "Event Concluded" : isPaid ? "Book Ticket" : "Get Pass"}</span>
          {!isConcluded && <ArrowRight size={15} />}
        </Button>
      </div>

      {/* ── SMOOTH AUTHENTICATION DIALOG ── */}
      <AuthBookingModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        event={ev}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
