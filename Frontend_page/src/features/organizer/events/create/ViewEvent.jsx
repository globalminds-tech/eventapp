import React from "react";
import {
  ArrowLeft, Pencil, Calendar, Clock, MapPin, Ticket, Settings2,
  Users, ScrollText, CheckCircle2, ShieldCheck, Award, Eye, Utensils, Car, FileText,
  Store, Tag, Download, ExternalLink, Sparkles, Check, Info, Paperclip
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

// Helper function to resolve absolute backend document URLs
const getFullDocUrl = (url) => {
  if (!url) return "#";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `http://localhost:5001${cleanUrl}`;
};

const ViewEvent = ({ formData, onEdit, onBack }) => {
  const details = formData?.eventDetails || {};
  const booking = formData?.booking || {};
  const layout = formData?.layout || {};
  const stalls = layout?.stalls || layout?.stallList || formData?.stalls || [];
  const amenities = layout?.amenities || formData?.amenities || [];
  const food = formData?.foodProvision || {};
  const foodItems = food?.foodItems || food?.items || formData?.food || [];
  const vehicle = formData?.vehicleProvision || {};
  const vehicleDetails = vehicle?.vehicles || vehicle?.details || formData?.vehicles || [];
  const vehicleAddons = vehicle?.addons || vehicle?.vehicle_addons || formData?.vehicle_addons || [];
  const documents = formData?.documents || {};
  const docList = documents?.additionalDocs || documents?.docs || documents?.existingFiles || formData?.files || [];
  const terms = formData?.termsDetails?.policies || formData?.termsDetails?.terms || formData?.terms || [];
  const vendorSponsor = formData?.vendorSponsor || {};
  const vendors = vendorSponsor?.vendors || (Array.isArray(formData?.vendors) ? formData.vendors : []);
  const sponsors = vendorSponsor?.sponsors || (Array.isArray(formData?.sponsors) ? formData.sponsors : []);
  const guests = vendorSponsor?.guests || formData?.guests || [];

  const rawBanner = documents?.bannerPreview || formData?.banner_url || formData?.banner || formData?.image || formData?.banner_preview;
  const bannerPreview = rawBanner ? getFullDocUrl(rawBanner) : "";
  const bannerType = documents?.bannerType || "image";

  // Features list for visitor configuration
  const features = [
    { label: "Mail Notifications", active: details.mail, icon: "✉️" },
    { label: "WhatsApp Alerts", active: details.whatsapp, icon: "📱" },
    { label: "Print Pass", active: details.print, icon: "🖨️" },
    { label: "Visitor Name Mandatory", active: details.visitorName ?? true, icon: "👤" },
    { label: "Visitor Mail Mandatory", active: details.visitorMail, icon: "📧" },
    { label: "Visitor Mobile Mandatory", active: details.visitorMobile, icon: "📞" },
    { label: "Visitor Photo Mandatory", active: details.visitorPhoto, icon: "📷" },
    { label: "Document Proof Required", active: details.documentProof, icon: "🪪" },
    { label: "Day Pass Enabled", active: details.dayPass, icon: "🎫" },
    { label: "International Attendees", active: details.isInternationalInclude, icon: "🌐" },
    { label: "Program Schedule Included", active: details.includeProgram === "Yes" || details.includeProgram === true, icon: "📋" },
    { label: "Welcome Kit Included", active: details.welcomeKit, icon: "🎁" },
    { label: "Aadhar Required", active: details.aadhar, icon: "💳" },
    { label: "Passport Required", active: details.passport, icon: "🛂" },
    { label: "Vehicle Parking Pass", active: details.vehiclePass, icon: "🚗" },
    { label: "Vehicle Number Mandatory", active: details.vehicleNumber, icon: "🔢" },
    { label: "Food Provisioning", active: details.food, icon: "🍱" },
  ];

  const activeFeatures = features.filter((f) => Boolean(f.active));

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

        {/* Primary Action Button: Edit Event */}
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

        {/* Gradient Overlay & Header Details */}
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

      {/* ── 2-COLUMN BALANCED EQUALIZED LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        
        {/* ── LEFT COLUMN: Identity & Facilities Layout ── */}
        <div className="space-y-5">
          
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

            {/* Active Features & Visitor Rules */}
            {activeFeatures.length > 0 && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Configured Rules & Toggles</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeFeatures.map((feat, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 flex items-center gap-1 shadow-2xs">
                      <span>{feat.icon}</span>
                      <span>{feat.label}</span>
                    </span>
                  ))}
                </div>
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
                <h3 className="text-sm font-extrabold text-slate-900">Facilities, Layout & Provisions</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step 3</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Floor / Layout Type</span>
                <span className="font-extrabold text-slate-800">{layout.floorType || layout.floor_type || "Stall Floor"}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Passes Per Stall</span>
                <span className="font-extrabold text-slate-800">{layout.personPass || layout.person_pass || "1"} Badges</span>
              </div>
            </div>

            {/* Stalls List */}
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
                      <span key={i} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-800 flex items-center gap-1.5 shadow-2xs">
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

            {/* Amenities List */}
            {amenities.length > 0 && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Sparkles size={12} className="text-cyan-600" /> Stall Amenities ({amenities.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {amenities.map((am, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-cyan-50 text-cyan-800 border border-cyan-100 rounded-lg text-[11px] font-bold flex items-center gap-1">
                      <span>🪑 {am.amenity || am.name}</span>
                      {am.stallName && <span className="text-cyan-600 text-[10px]">({am.stallName})</span>}
                      <span className="bg-cyan-200/70 text-cyan-900 px-1.5 py-0.2 rounded text-[10px]">x{am.qty || 1}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Food & Vehicle Provisions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Utensils size={12} className="text-amber-500" /> Food Provision
                </span>
                {foodItems.length > 0 ? (
                  <div className="space-y-1">
                    {foodItems.map((fi, idx) => (
                      <div key={idx} className="font-bold text-slate-800 text-[11px] bg-white p-2 rounded-lg border border-slate-200/80">
                        <div>{fi.catererName || fi.caterer_name} ({fi.mealType || fi.meal_type} - {fi.foodType || fi.food_type})</div>
                        <div className="text-[10px] text-emerald-700 font-extrabold">Price: ₹{fi.priceINR || fi.price_inr || 0}</div>
                        {fi.menuDetails && <div className="text-[10px] text-slate-500 font-normal mt-0.5">{fi.menuDetails}</div>}
                      </div>
                    ))}
                  </div>
                ) : food.catererName ? (
                  <div className="font-bold text-slate-800 text-[11px]">
                    {food.catererName} ({food.mealType}) — ₹{food.priceINR || 0}
                  </div>
                ) : (
                  <span className="text-slate-400 italic">No food provision</span>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Car size={12} className="text-indigo-500" /> Vehicle Pass & Add-ons
                </span>
                {vehicleDetails.length > 0 ? (
                  <div className="space-y-1">
                    {vehicleDetails.map((v, idx) => (
                      <div key={idx} className="font-bold text-slate-800 text-[11px] bg-white p-2 rounded-lg border border-slate-200/80 flex justify-between">
                        <span>{v.vehicleType || v.vehicle_type}</span>
                        <span className="text-indigo-700 font-extrabold">₹{v.priceINR || v.price_inr || 0}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400 italic block">No vehicle passes</span>
                )}
                {vehicleAddons.length > 0 && (
                  <div className="mt-1 pt-1 border-t border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Add-ons</span>
                    {vehicleAddons.map((ad, idx) => (
                      <div key={idx} className="text-[11px] font-bold text-slate-700">
                        {ad.addOnName || ad.name} (+₹{ad.price})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Tickets, Partners, Documents & Terms (BALANCED EQUALIZED) ── */}
        <div className="space-y-5">
          
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
                  {booking.chargeType === "Paid" ? `₹${booking.priceINR || booking.price_inr || "0"}` : "Free Pass"}
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
                {booking.currency ? `${booking.currency}` : "INR (₹)"}
              </div>
            </div>

            {/* Taxes Tag list */}
            {Array.isArray(booking.taxes) && booking.taxes.length > 0 && (
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Applied Tax Rules</span>
                <div className="flex flex-wrap gap-1.5">
                  {booking.taxes.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-extrabold border border-blue-100">
                      🏷️ {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(booking.bookingStartDate || booking.bookingStartTime) && (
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs flex justify-between items-center font-semibold text-slate-700">
                <span>Booking Window:</span>
                <span className="font-bold text-slate-900">
                  {booking.bookingStartDate} {booking.bookingStartTime} → {booking.bookingEndDate} {booking.bookingEndTime}
                </span>
              </div>
            )}
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

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Assigned Vendors ({vendors.length})</span>
                {vendors.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {vendors.map((v, i) => (
                      <span key={i} className="px-2.5 py-1 bg-purple-50 text-purple-700 font-bold rounded-lg text-[11px] border border-purple-100 flex items-center gap-1">
                        <span>🏪 {v.vendorName || v.vendor_name}</span>
                        <span className="text-purple-500 font-normal">({v.vendorType || v.vendor_type || "Vendor"})</span>
                        {v.passCount > 0 && <span className="bg-purple-200 text-purple-900 px-1.5 py-0.2 rounded text-[9px] font-extrabold">{v.passCount} Passes</span>}
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
                      <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-[11px] border border-indigo-100 flex items-center gap-1">
                        <span>⭐ {s.sponsorName || s.sponsor_name}</span>
                        <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded text-[10px] font-extrabold">
                          {s.sponsorship || s.sponsorshipType || s.sponsorship_type || "Sponsor"}
                        </span>
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
                  <div className="flex flex-wrap gap-2">
                    {guests.map((g, i) => (
                      <div key={i} className="px-3 py-1.5 bg-amber-50 text-amber-900 font-bold rounded-xl text-[11px] border border-amber-200/80 flex items-center gap-2">
                        {g.image && (
                          <img src={getFullDocUrl(g.image)} alt={g.name} className="w-6 h-6 rounded-full object-cover border border-amber-300" />
                        )}
                        <div>
                          <div>{g.name || g.guest_name || g.guestName}</div>
                          <div className="text-[10px] text-amber-700 font-semibold">{g.designation || "VIP Guest"} {g.contact ? `• 📞 ${g.contact}` : ''}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CARD 5: Attached Documents (NOW ON THE RIGHT SIDE FOR BALANCED EQUALIZATION) */}
          {docList.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-rose-50 rounded-lg text-rose-600">
                    <FileText size={16} />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">Event Documents & Attachments ({docList.length})</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ATTACHMENTS</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {docList.map((doc, idx) => {
                  const docName = doc.file_name || doc.name || doc.file_path?.split("/").pop() || `Document #${idx + 1}`;
                  const docType = doc.type || doc.doc_type || doc.file_type || "NOC / Permission";
                  const rawUrl = doc.file_path || doc.preview || doc.file_url || doc.url;
                  const docUrl = getFullDocUrl(rawUrl);
                  return (
                    <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 bg-white rounded-lg text-rose-600 border border-slate-200 shrink-0">
                          <Paperclip size={16} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-slate-800 text-xs truncate">{docName}</h4>
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100 inline-block mt-0.5">
                            {docType}
                          </span>
                        </div>
                      </div>
                      {docUrl && (
                        <a
                          href={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer border-none no-underline transition"
                          title="View / Download Document"
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CARD 6: Terms & Policies (NOW ON THE RIGHT SIDE FOR BALANCED EQUALIZATION) */}
          {terms.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
                    <ScrollText size={16} />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">Event Terms & Policies ({terms.length})</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">POLICIES</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 text-xs">
                {terms.map((t, i) => (
                  <div key={i} className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5 relative">
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
      </div>
    </div>
  );
};

export default ViewEvent;
