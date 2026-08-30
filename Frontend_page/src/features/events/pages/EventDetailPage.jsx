import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Calendar, MapPin, Users, Tag,
  CheckCircle, AlertCircle, Building2,
  Star, ShoppingBag, Loader2
} from "lucide-react";
import { getFullEventDetails } from "@/Services/api";

const StatusBadge = ({ status }) => {
  const colors = {
    APPROVED: { bg: "bg-emerald-950", text: "text-emerald-400", label: "Approved" },
    PENDING:  { bg: "bg-amber-950", text: "text-amber-400", label: "Pending"  },
    REJECTED: { bg: "bg-red-950", text: "text-red-400", label: "Rejected" },
  };
  const c = colors[status] || colors.PENDING;
  return (
    <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.bg} ${c.text}`}>
      {c.label}
    </div>
  );
};

const SectionCard = ({ title, children }) => (
  <div className="bg-[#0f172a] rounded-2xl p-5 border border-[#1e293b] mb-4">
    <h3 className="text-[#0ea5e9] text-xs font-bold uppercase tracking-wider pb-2.5 mb-3 border-b border-[#1e293b]">
      {title}
    </h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const InfoRow = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="text-slate-400 mt-0.5" />
      <div className="flex-1">
        <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider leading-none mb-1">{label}</p>
        <p className="text-slate-200 text-sm font-semibold">{String(value)}</p>
      </div>
    </div>
  );
};

const Chip = ({ label, color = "#0ea5e9" }) => (
  <span 
    className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border"
    style={{ borderColor: color + "60", backgroundColor: color + "20", color }}
  >
    {label}
  </span>
);

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id) { setError("No event ID provided"); setLoading(false); return; }
    getFullEventDetails(id)
      .then(setData)
      .catch((e) => setError(e.message || "Failed to load event details"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-[#94a3b8]">
      <Loader2 className="w-10 h-10 text-[#f97316] animate-spin mb-4" />
      <p className="text-sm font-bold tracking-widest uppercase">Loading event details...</p>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
      <AlertCircle className="w-14 h-14 text-red-500 mb-4" />
      <p className="text-red-400 font-bold mb-4">{error || "Event not found"}</p>
      <button 
        className="px-6 py-2.5 bg-[#f97316] text-white font-bold rounded-full hover:bg-[#ea580c] transition-colors cursor-pointer border-none"
        onClick={() => navigate(-1)}
      >
        Go Back
      </button>
    </div>
  );

  const { eventDetails: ev, organizer, booking, vendors, sponsors, guests, terms, food_items, layout } = data;

  const bannerUrl = ev?.banner_url || ev?.banner || ev?.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800";
  const entryType = booking?.charge_type || "Free";
  const isPaid    = entryType?.toLowerCase() === "paid";

  return (
    <div className="min-h-screen bg-[#020617] text-[#f8fafc] flex flex-col font-sans select-none pb-12">
      {/* Sticky Header */}
      <div className="h-14 px-4 border-b border-[#1e293b] flex items-center gap-3 bg-[#0f172a] sticky top-0 z-30 shadow-md">
        <button
          onClick={() => navigate(-1)}
          className="p-1 hover:bg-slate-800 rounded-full cursor-pointer text-slate-400 hover:text-white border-none bg-transparent"
        >
          <ArrowLeft size={22} />
        </button>
        <span className="text-base font-bold tracking-tight flex-1 line-clamp-1">{ev?.event_name || "Event Details"}</span>
        <StatusBadge status={ev?.status} />
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 md:px-0 mt-4">
        {/* Banner Card */}
        <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden bg-slate-900 border border-[#1e293b] relative mb-6">
          <img 
            src={bannerUrl} 
            alt={ev?.event_name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
        </div>

        {/* Title Block */}
        <div className="mb-6">
          <div className="flex gap-2 mb-3.5 flex-wrap">
            {ev?.category && <Chip label={ev.category} color="#f97316" />}
            {ev?.event_code && <Chip label={ev.event_code} color="#0ea5e9" />}
          </div>
          <h2 className="text-2xl font-black leading-snug mb-3">{ev?.event_name}</h2>
          {ev?.description && (
            <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{ev.description}</p>
          )}
        </div>

        {/* Date, Time, Venue */}
        <SectionCard title="Event Info">
          <InfoRow icon={Calendar} label="Start"    value={ev?.start_date ? `${ev.start_date}  ${ev?.start_time || ""}` : null} />
          <InfoRow icon={Calendar} label="End"      value={ev?.end_date   ? `${ev.end_date}  ${ev?.end_time   || ""}` : null} />
          <InfoRow icon={MapPin}   label="Venue"    value={ev?.venue}   />
          <InfoRow icon={MapPin}   label="Address"  value={ev?.address} />
          <InfoRow icon={Tag}      label="Type"     value={ev?.event_type} />
          <InfoRow icon={Calendar} label="Occurrence" value={ev?.occurrence} />
          {ev?.visibility && <InfoRow icon={CheckCircle} label="Visibility" value={ev.visibility} />}
        </SectionCard>

        {/* Booking */}
        {booking && (
          <SectionCard title="Booking Details">
            <InfoRow icon={Calendar} label="Booking Open"    value={booking.booking_start_date} />
            <InfoRow icon={Calendar} label="Booking Close"   value={booking.booking_end_date}   />
            <InfoRow icon={Users}    label="Capacity"        value={booking.capacity}            />
            <InfoRow icon={Tag}      label="Pass Type"       value={booking.pass_type}           />
            <InfoRow icon={Tag}      label="Entry Type"      value={booking.charge_type}         />
            <InfoRow icon={Tag}      label="Max Passes"      value={booking.max_pass}            />
            {isPaid && booking.price_type && (
              <InfoRow icon={Tag} label="Price" value={`${booking.currency || "INR"} — ${booking.price_type}`} />
            )}
          </SectionCard>
        )}

        {/* Vendors */}
        {vendors && vendors.length > 0 && (
          <SectionCard title="Vendors">
            {vendors.map((v, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-[#1e293b] last:border-b-0">
                <ShoppingBag size={14} className="text-[#0ea5e9]" />
                <div className="flex-1">
                  <p className="text-slate-200 text-sm font-bold leading-none mb-1">{v.vendor_name}</p>
                  <p className="text-slate-500 text-xs">{v.vendor_type} · {v.pass_count || 0} passes</p>
                </div>
              </div>
            ))}
          </SectionCard>
        )}

        {/* Sponsors */}
        {sponsors && sponsors.length > 0 && (
          <SectionCard title="Sponsors">
            {sponsors.map((s, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-[#1e293b] last:border-b-0">
                <Star size={14} className="text-yellow-500" />
                <div className="flex-1">
                  <p className="text-slate-200 text-sm font-bold leading-none mb-1">{s.sponsor_name}</p>
                  <p className="text-slate-500 text-xs">{s.sponsorship_type}</p>
                </div>
              </div>
            ))}
          </SectionCard>
        )}

        {/* Guests */}
        {guests && guests.length > 0 && (
          <SectionCard title="Special Guests">
            {guests.map((g, i) => (
              <div key={i} className="flex items-center gap-3.5 py-2.5 border-b border-[#1e293b] last:border-b-0">
                {g.image ? (
                  <img src={g.image} alt={g.guest_name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold">
                    {g.guest_name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-slate-200 text-sm font-bold leading-none mb-1">{g.guest_name}</p>
                  <p className="text-slate-500 text-xs">{g.designation} · {g.contact}</p>
                </div>
              </div>
            ))}
          </SectionCard>
        )}

        {/* Terms */}
        {terms && terms.length > 0 && (
          <SectionCard title="Terms & Policies">
            {terms.map((t, i) => (
              <div key={i} className="flex items-start gap-2.5 py-1">
                <CheckCircle size={14} className="text-emerald-405 mt-0.5" />
                <div className="flex-1">
                  <p className="text-slate-200 text-sm font-semibold">{t.policy_name}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{t.policy_group} — {t.policy_type}</p>
                </div>
              </div>
            ))}
          </SectionCard>
        )}

        {/* Food */}
        {food_items && food_items.length > 0 && (
          <SectionCard title="Food Provisions">
            {food_items.map((f, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-[#1e293b] last:border-b-0">
                <span className="text-base">🍽️</span>
                <div className="flex-1">
                  <p className="text-slate-200 text-sm font-bold leading-none mb-1">{f.caterer_name} — {f.meal_type}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{f.food_type} · ₹{f.price_inr || 0} / ${f.price_usd || 0}</p>
                </div>
              </div>
            ))}
          </SectionCard>
        )}

        {/* Stalls */}
        {layout?.stalls && layout.stalls.length > 0 && (
          <SectionCard title="Stalls / Layout">
            {layout.stalls.map((st, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-[#1e293b] last:border-b-0">
                <Building2 size={14} className="text-purple-400" />
                <div className="flex-1">
                  <p className="text-slate-200 text-sm font-bold leading-none mb-1">{st.stall_name}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{st.stall_type} · {st.stall_size} · ₹{st.price_inr || "—"}</p>
                </div>
              </div>
            ))}
          </SectionCard>
        )}
      </div>
    </div>
  );
}
