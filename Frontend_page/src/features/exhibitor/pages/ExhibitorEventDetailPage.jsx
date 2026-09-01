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

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEventDetail();
  }, [id]);

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
    } catch (err) {
      console.error("Failed to fetch event details:", err);
      setError("Failed to load event details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReserveBooth = () => {
    navigate(`/book-stall/${id}`, { state: { event: { id, title: event?.event_name || event?.eventDetails?.event_name } } });
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

      {/* ── Back breadcrumb ── */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Upcoming Events
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-bold text-slate-700 truncate max-w-[260px]">{d?.event_name || ed?.event_name}</span>
      </div>

      {/* ── Hero Banner ── */}
      {banner && (
        <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          <img
            src={banner}
            alt={d?.event_name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className="bg-emerald-500 text-white font-extrabold text-[10px] px-2.5 py-1 shadow">
                {ed?.category || d?.category || "Exhibition"}
              </Badge>
              <Badge className={`font-extrabold text-[10px] px-2.5 py-1 shadow ${d?.status === "APPROVED" ? "bg-cyan-500 text-white" : "bg-amber-500 text-white"
                }`}>
                {d?.status || "Active"}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {d?.event_name || ed?.event_name}
            </h1>
          </div>
        </div>
      )}

      {!banner && (
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge className="bg-emerald-500 text-white font-extrabold text-[10px] px-2.5 py-1">
              {ed?.category || d?.category || "Exhibition"}
            </Badge>
            <Badge className="bg-cyan-500 text-white font-extrabold text-[10px] px-2.5 py-1">
              {d?.status || "Active"}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {d?.event_name || ed?.event_name}
          </h1>
        </div>
      )}

      {/* ── Key Details Grid ── */}
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

      {/* ── Description ── */}
      {(ed?.description || d?.description) && (
        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl">
          <CardContent className="p-5">
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">About This Event</p>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {ed?.description || d?.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Stalls Available ── */}
      {stalls.length > 0 && (
        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Store className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <p className="text-sm font-extrabold text-slate-800">Available Stalls</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stalls.map((stall, i) => (
                <div key={i} className="rounded-xl border border-emerald-100 bg-emerald-50 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-extrabold text-slate-800">{stall.stall_name || stall.stallName}</p>
                    {stall.prime_seat && (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-bold text-[9px] gap-0.5">
                        <Star className="w-2.5 h-2.5" /> Prime
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Size: <span className="font-bold text-slate-700">{stall.stall_size || stall.size || "—"}</span>
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stall.stall_type === "Paid" ? "bg-sky-100 text-sky-700" : "bg-emerald-100 text-emerald-700"
                      }`}>
                      {stall.stall_type || stall.type || "Paid"}
                    </span>
                    <p className="text-xs font-extrabold text-emerald-700">
                      ₹{Number(stall.price_inr || stall.priceINR || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                  {stall.prime_seat && stall.prime_price_inr && (
                    <p className="text-[11px] text-slate-500 font-medium">
                      Prime Seat: <span className="font-bold text-amber-600">₹{Number(stall.prime_price_inr || stall.primePriceINR).toLocaleString("en-IN")}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Bottom grid: Amenities + Food + Vehicles ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Amenities */}
        {amenities.length > 0 && (
          <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-violet-500" />
                <p className="text-xs font-extrabold text-slate-800">Stall Amenities</p>
              </div>
              <div className="space-y-2">
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

        {/* Food */}
        {foodItems.length > 0 && (
          <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Utensils className="w-4 h-4 text-orange-500" />
                <p className="text-xs font-extrabold text-slate-800">Food Provision</p>
              </div>
              {foodItems.map((f, i) => (
                <div key={i} className="space-y-1 text-xs">
                  <p className="font-bold text-slate-800">{f.caterer_name || f.catererName}</p>
                  <p className="text-slate-500">{f.meal_type || f.mealType} · {f.food_type || f.foodType}</p>
                  <p className="text-slate-500">Menu: {f.menu_details || f.menuDetails}</p>
                  <p className="font-extrabold text-orange-600">₹{Number(f.price_inr || f.priceINR || 0).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Vehicles */}
        {vehicles.length > 0 && (
          <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Car className="w-4 h-4 text-sky-500" />
                <p className="text-xs font-extrabold text-slate-800">Vehicle Pass</p>
              </div>
              {vehicles.map((v, i) => (
                <div key={i} className="space-y-1 text-xs">
                  <p className="font-bold text-slate-800">{v.vehicle_type || v.vehicleType}</p>
                  <p className="font-extrabold text-sky-600">₹{Number(v.price_inr || v.priceINR || 0).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Guests, Sponsors, Vendors ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {guests.length > 0 && (
          <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-teal-500" />
                <p className="text-xs font-extrabold text-slate-800">Guests</p>
              </div>
              <div className="space-y-2">
                {guests.map((g, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-[10px] font-black shrink-0">
                      {(g.guest_name || g.guestName || g.name || "?")[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{g.guest_name || g.guestName || g.name}</p>
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
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-amber-500" />
                <p className="text-xs font-extrabold text-slate-800">Sponsors</p>
              </div>
              <div className="space-y-2">
                {sponsors.map((s, i) => (
                  <div key={i} className="text-xs">
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
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <p className="text-xs font-extrabold text-slate-800">Vendors</p>
              </div>
              <div className="space-y-2">
                {vendors.map((v, i) => (
                  <div key={i} className="text-xs">
                    <p className="font-bold text-slate-800">{v.vendor_name || v.vendorName}</p>
                    <p className="text-[10px] text-slate-400">{v.vendor_type || v.vendorType}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Sticky Reserve Booth CTA ── */}
      <div className="sticky bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-slate-200 shadow-xl rounded-t-2xl px-5 py-4 flex items-center justify-between gap-4 mt-6 -mx-2">
        <div>
          <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Ready to Exhibit?</p>
          <p className="text-sm font-extrabold text-slate-900 leading-tight mt-0.5">
            Secure your booth at <span className="text-emerald-600">{d?.event_name || ed?.event_name}</span>
          </p>
        </div>
        <Button
          onClick={handleReserveBooth}
          className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm px-6 py-2.5 rounded-xl shadow-lg border-none cursor-pointer gap-2 shrink-0"
        >
          <Store className="w-4 h-4" />
          Reserve Booth
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ExhibitorEventDetailPage;
