import React from "react";
import {
  ArrowLeft, Pencil, Calendar, Clock, MapPin, Ticket, Settings2,
  Users, ScrollText, CheckCircle2, ShieldCheck, Award, Eye, Utensils, Car, FileText,
  Store, Tag
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const ViewEvent = ({ formData, onEdit, onBack }) => {
  const details = formData?.eventDetails || {};
  const booking = formData?.booking || {};
  const layout = formData?.layout || {};
  const stalls = layout?.stalls || layout?.stallList || formData?.stalls || [];
  const food = formData?.foodProvision || {};
  const foodItems = food?.foodItems || food?.items || formData?.food || [];
  const vehicle = formData?.vehicleProvision || {};
  const vehicleDetails = vehicle?.vehicles || vehicle?.details || formData?.vehicles || [];
  const vehicleAddons = vehicle?.addons || vehicle?.vehicle_addons || formData?.vehicle_addons || [];
  const documents = formData?.documents || {};
  const terms = formData?.termsDetails?.policies || formData?.termsDetails?.terms || formData?.terms || [];
  const vendorSponsor = formData?.vendorSponsor || {};
  const vendors = vendorSponsor?.vendors || (Array.isArray(formData?.vendors) ? formData.vendors : []);
  const sponsors = vendorSponsor?.sponsors || (Array.isArray(formData?.sponsors) ? formData.sponsors : []);
  const guests = vendorSponsor?.guests || formData?.guests || [];

  const bannerPreview = documents?.bannerPreview || formData?.banner_url || formData?.banner || formData?.image || formData?.banner_preview;
  const bannerType = documents?.bannerType || "image";

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 pb-10 animate-in fade-in duration-300 select-none">
      {/* ── HEADER TOOLBAR ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer border-none bg-transparent flex items-center gap-1.5 font-bold text-xs"
          >
            <ArrowLeft size={16} />
            <span>Back to Events</span>
          </button>
          <div className="h-5 w-px bg-slate-200 mx-1" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {details.eventName || "Event Overview"}
              </h1>
              <Badge className="bg-cyan-50 text-cyan-800 border-cyan-200 font-bold text-[11px]">
                {details.eventCode || "EVT-VIEW"}
              </Badge>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[11px]">
                👁️ View Mode
              </Badge>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Executive Event Details & Operational Summary
            </p>
          </div>
        </div>

        {/* Single Primary Action Button: Edit Event */}
        <Button
          onClick={onEdit}
          className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-cyan-500/20 border-none cursor-pointer flex items-center gap-2 transition-all hover:scale-105"
        >
          <Pencil size={15} />
          <span>Edit Event Details</span>
        </Button>
      </div>

      {/* ── BANNER HERO SHOWCASE ── */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm bg-slate-900 h-64 md:h-80 flex items-end">
        {bannerPreview ? (
          bannerType === "video" ? (
            <video src={bannerPreview} className="absolute inset-0 w-full h-full object-cover opacity-80" autoPlay loop muted />
          ) : (
            <img src={bannerPreview} alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-85" />
          )
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 flex items-center justify-center">
            <span className="text-slate-400 text-sm font-bold flex items-center gap-2">
              <FileText size={20} /> No Event Banner Uploaded
            </span>
          </div>
        )}

        {/* Gradient Overlay & Header Details (Without Duplicate Edit Button) */}
        <div className="relative z-10 w-full p-6 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent flex flex-col justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-cyan-500 text-white text-[10px] font-extrabold uppercase tracking-wider">
              {details.category || "General Event"}
            </span>
            {details.subCategory && (
              <span className="px-2.5 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-bold backdrop-blur-md">
                {details.subCategory}
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-md bg-purple-500/80 text-white text-[10px] font-bold backdrop-blur-md">
              {details.eventType || "One-Time"}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/80 text-white text-[10px] font-bold backdrop-blur-md">
              {details.visibility || "Public"}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            {details.eventName || "Untitled Event"}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-200">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-cyan-400" />
              {details.startDate || "N/A"} to {details.endDate || "N/A"}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-cyan-400" />
              {details.startTime || "N/A"} - {details.endTime || "N/A"}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-cyan-400" />
              {details.venue || "No Venue Assigned"}
            </span>
          </div>
        </div>
      </div>

      {/* ── DETAILS GRID (2 COLUMNS) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CARD 1: Identity & Schedule */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-cyan-50 rounded-lg text-cyan-600">
                <Calendar size={16} />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Event Identity & Schedule</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step 1</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Event Name</span>
              <span className="font-extrabold text-slate-800">{details.eventName || "—"}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Category</span>
              <span className="font-extrabold text-slate-800">{details.category} {details.subCategory ? `(${details.subCategory})` : ""}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Start Date & Time</span>
              <span className="font-extrabold text-slate-800">{details.startDate || "—"} @ {details.startTime || "—"}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">End Date & Time</span>
              <span className="font-extrabold text-slate-800">{details.endDate || "—"} @ {details.endTime || "—"}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Venue & Location</span>
            <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1">
              <MapPin size={12} className="text-cyan-600 shrink-0" />
              {details.venue || "Venue not selected"}
            </span>
            {details.address && (
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{details.address}</p>
            )}
          </div>

          {details.description && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Description</span>
              <p className="text-xs font-semibold text-slate-700 leading-relaxed">{details.description}</p>
            </div>
          )}
        </div>

        {/* CARD 2: Tickets & Pricing */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                <Ticket size={16} />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Tickets & Booking Details</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step 2</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Entry Type</span>
              <span className={`font-extrabold ${booking.chargeType === "Paid" ? "text-emerald-700" : "text-cyan-700"}`}>
                {booking.chargeType || "Free"}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Ticket Price</span>
              <span className="font-extrabold text-slate-900">
                {booking.chargeType === "Paid" ? `₹${booking.priceINR || "0"}` : "Free Pass"}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Total Capacity</span>
              <span className="font-extrabold text-slate-800">{booking.capacity || booking.totalCapacity || "Unlimited"} Passes</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Max Per User</span>
              <span className="font-extrabold text-slate-800">{booking.maxPass || booking.maxPerUser || "1"} Pass</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div className="bg-slate-50 p-2 rounded-lg text-center font-bold text-slate-700 border border-slate-100">
              {booking.passType || "Single Pass"}
            </div>
            <div className="bg-slate-50 p-2 rounded-lg text-center font-bold text-slate-700 border border-slate-100">
              {booking.entryType || "Single Entry"}
            </div>
            <div className="bg-slate-50 p-2 rounded-lg text-center font-bold text-slate-700 border border-slate-100">
              {booking.currency ? `${booking.currency} (${booking.taxType || 'No Tax'})` : (booking.taxType || "No Tax Added")}
            </div>
          </div>

          {(booking.bookingStartDate || booking.bookingStartTime) && (
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs flex justify-between items-center font-semibold text-slate-700">
              <span>Booking Window:</span>
              <span className="font-bold text-slate-900">
                {booking.bookingStartDate} {booking.bookingStartTime} → {booking.bookingEndDate} {booking.bookingEndTime}
              </span>
            </div>
          )}
        </div>

        {/* CARD 3: Facilities, Stalls & Layout */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                <Settings2 size={16} />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Facilities & Stall Layout</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step 3</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Floor / Layout</span>
              <span className="font-extrabold text-slate-800">{layout.floorType || layout.layoutType || "Standard Ground"}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Passes Per Stall</span>
              <span className="font-extrabold text-slate-800">{layout.personPass || "1"} Staff Badges</span>
            </div>
          </div>

          {/* Stalls List if present */}
          {stalls.length > 0 && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Store size={12} className="text-emerald-600" /> Configured Stalls ({stalls.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {stalls.map((st, i) => {
                  const isPrime = Boolean(st.prime_seat || st.primeSeat);
                  const primeFee = st.prime_price_inr || st.primePriceINR;
                  return (
                    <span key={i} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-800 flex items-center gap-1.5 shadow-xs">
                      <span>{st.stall_name || st.stallName || `Stall #${i+1}`}</span>
                      <span className="text-slate-400 text-[10px]">{st.stall_size || st.size ? `(${st.stall_size || st.size})` : ''}</span>
                      <span className="text-emerald-700 font-extrabold">₹{st.price_inr || st.priceINR || st.price || '0'}</span>
                      {isPrime && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-black uppercase flex items-center gap-0.5">
                          ⭐ Prime {primeFee ? `(+₹${primeFee})` : ''}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Utensils size={12} className="text-amber-500" /> Food Provision ({foodItems.length > 0 ? foodItems.length : (food.catererName ? 1 : 0)})
              </span>
              {foodItems.length > 0 ? (
                <div className="space-y-1">
                  {foodItems.map((fi, idx) => (
                    <div key={idx} className="font-bold text-slate-800 text-[11px]">
                      {fi.catererName || fi.caterer_name} ({fi.mealType || fi.meal_type}) — ₹{fi.priceINR || fi.price_inr || 0}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <span className="font-extrabold text-slate-800 block">
                    {food.catererName || food.mealType || food.provisionType || "No Food Provision"}
                  </span>
                  {food.menuDetails && (
                    <p className="text-[11px] text-slate-500 font-medium">{food.menuDetails}</p>
                  )}
                </>
              )}
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Car size={12} className="text-purple-500" /> Vehicle Pass ({vehicleDetails.length > 0 ? vehicleDetails.length : (vehicle.vehicleType ? 1 : 0)})
              </span>
              {vehicleDetails.length > 0 ? (
                <div className="space-y-1">
                  {vehicleDetails.map((v, idx) => (
                    <div key={idx} className="font-bold text-slate-800 text-[11px]">
                      {v.vehicleType || v.vehicle_type} — ₹{v.priceINR || v.price_inr || 0}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <span className="font-extrabold text-slate-800 block">
                    {vehicle.vehicleType || vehicle.passType || "No Vehicle Pass"}
                  </span>
                  {vehicle.priceINR && (
                    <p className="text-[11px] text-slate-500 font-medium">Price: ₹{vehicle.priceINR}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* CARD 4: Partners, Vendors & Guests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600">
                <Users size={16} />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Partners, Vendors & Guests</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step 4</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Assigned Vendors ({vendors.length})</span>
              {vendors.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {vendors.map((v, i) => (
                    <span key={i} className="px-2.5 py-1 bg-purple-50 text-purple-700 font-bold rounded-lg text-[11px] border border-purple-100">
                      {v.vendorName || v.vendor_name} ({v.vendorType || v.vendor_type || "Vendor"})
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400 italic">No vendors assigned</span>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Event Sponsors ({sponsors.length})</span>
              {sponsors.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {sponsors.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-[11px] border border-indigo-100">
                      {s.sponsorName || s.sponsor_name} • {s.sponsorship || s.sponsorship_type || "Sponsor"}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400 italic">No sponsors assigned</span>
              )}
            </div>

            {guests.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Chief Guests ({guests.length})</span>
                <div className="flex flex-wrap gap-1.5">
                  {guests.map((g, i) => (
                    <span key={i} className="px-2.5 py-1 bg-amber-50 text-amber-800 font-bold rounded-lg text-[11px] border border-amber-100">
                      {g.name || g.guest_name} ({g.designation || "Guest"})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CARD 5: Terms & Policies */}
      {terms.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
                <ScrollText size={16} />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Event Terms & Policies ({terms.length})</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step 5</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {terms.map((t, i) => (
              <div key={i} className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-2 relative">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-extrabold text-[10px] uppercase">
                      {t.policyGroup || t.policy_group || "General"}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700 font-bold text-[10px]">
                      {t.policyType || t.policy_type || "Policy"}
                    </span>
                  </div>
                  {(t.isDefault || t.is_default) && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase">
                      ✓ Default
                    </span>
                  )}
                </div>
                <h4 className="font-extrabold text-slate-900 text-xs">
                  {t.policyName || t.policy_name || t.name || `Policy #${i + 1}`}
                </h4>
                <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                  {t.description || t.details || t.policyName || t.policy_name || "Standard operational terms apply to this event."}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewEvent;

