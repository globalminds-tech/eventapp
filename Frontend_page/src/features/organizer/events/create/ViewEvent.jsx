import React, { useState } from "react";
import {
  ArrowLeft, Pencil, Calendar, Clock, MapPin, Ticket, Settings2,
  Users, ScrollText, ShieldCheck, Eye, Utensils, Car, FileText,
  Store, Sparkles, Check, Paperclip, ChevronLeft, ChevronRight,
  CalendarDays, Layers, Mail, MessageSquare, Printer, User,
  Phone, Camera, FileCheck, Globe, ClipboardList, Gift,
  CreditCard, Shield, Star, Tag, PhoneCall
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

const VIEW_STEPS = [
  { id: 1, label: "Event Identity", icon: CalendarDays, stepNo: "Step 1" },
  { id: 2, label: "Tickets & Pricing", icon: Ticket, stepNo: "Step 2" },
  { id: 3, label: "Facilities & Layout", icon: Settings2, stepNo: "Step 3" },
  { id: 4, label: "Food & Vehicles", icon: Utensils, stepNo: "Step 4" },
  { id: 5, label: "Partners & Guests", icon: Users, stepNo: "Step 5" },
  { id: 6, label: "Policies & Docs", icon: ScrollText, stepNo: "Step 6" },
];

const ViewEvent = ({ formData, onEdit, onBack }) => {
  const [activeStep, setActiveStep] = useState(1);

  const details = formData?.eventDetails || {};
  const booking = formData?.booking || {};
  const layout = formData?.layout || {};
  
  // Strict deduplication of stalls
  const rawStalls = layout?.stalls || layout?.stallList || formData?.stalls || [];
  const seenStallKeys = new Set();
  const stalls = (Array.isArray(rawStalls) ? rawStalls : []).filter((st) => {
    const key = (st.stall_name || st.stallName || st.id || "").trim().toLowerCase();
    if (!key || seenStallKeys.has(key)) return false;
    seenStallKeys.add(key);
    return true;
  });

  // Strict deduplication of amenities
  const rawAmenities = layout?.amenities || formData?.amenities || [];
  const seenAmenityKeys = new Set();
  const amenities = (Array.isArray(rawAmenities) ? rawAmenities : []).filter((am) => {
    const key = `${(am.amenity || am.name || "").trim().toLowerCase()}::${(am.stallName || "").trim().toLowerCase()}`;
    if (!key || seenAmenityKeys.has(key)) return false;
    seenAmenityKeys.add(key);
    return true;
  });

  // Strict deduplication of food items
  const food = formData?.foodProvision || formData?.food_provision || {};
  const rawFoodItems = food?.food_items || food?.foodItems || food?.items || formData?.food_items || formData?.food || [];
  const seenFoodKeys = new Set();
  const foodItems = (Array.isArray(rawFoodItems) ? rawFoodItems : []).filter((fi) => {
    const key = `${(fi.catererName || fi.caterer_name || "").trim().toLowerCase()}::${(fi.mealType || fi.meal_type || "").trim().toLowerCase()}::${(fi.foodType || fi.food_type || "").trim().toLowerCase()}`;
    if (!key || seenFoodKeys.has(key)) return false;
    seenFoodKeys.add(key);
    return true;
  });

  // Strict deduplication of vehicle passes and addons
  const vehicle = formData?.vehicleProvision || formData?.vehicle_provision || {};
  const rawVehicleDetails = vehicle?.vehicles || vehicle?.details || formData?.vehicles || formData?.vehicle_details || [];
  const seenVehKeys = new Set();
  const vehicleDetails = (Array.isArray(rawVehicleDetails) ? rawVehicleDetails : []).filter((v) => {
    const key = (v.vehicleType || v.vehicle_type || "").trim().toLowerCase();
    if (!key || seenVehKeys.has(key)) return false;
    seenVehKeys.add(key);
    return true;
  });

  const rawVehicleAddons = vehicle?.addons || vehicle?.vehicle_addons || formData?.vehicle_addons || formData?.addons || [];
  const seenAddonKeys = new Set();
  const vehicleAddons = (Array.isArray(rawVehicleAddons) ? rawVehicleAddons : []).filter((ad) => {
    const key = (ad.addOnName || ad.addon_name || ad.name || "").trim().toLowerCase();
    if (!key || seenAddonKeys.has(key)) return false;
    seenAddonKeys.add(key);
    return true;
  });

  // Strict deduplication of documents (excluding banners)
  const documents = formData?.documents || {};
  const rawDocList = documents?.additionalDocs || documents?.additional_docs || documents?.docs || documents?.existingFiles || documents?.existing_files || formData?.files || [];
  const seenDocs = new Set();
  const docList = (Array.isArray(rawDocList) ? rawDocList : []).filter((doc) => {
    if (doc.file_type === "banner" || doc.doc_type === "banner") return false;
    const name = (doc.file_name || doc.name || doc.file_path?.split("/").pop() || "").trim().toLowerCase();
    const path = (doc.file_path || doc.url || doc.preview || "").trim().toLowerCase();
    const key = `${name}::${path}`;
    if (!key || seenDocs.has(key)) return false;
    seenDocs.add(key);
    return true;
  });

  // Strict deduplication of terms/policies
  const rawTerms = formData?.termsDetails?.policies || formData?.termsDetails?.terms || formData?.terms || [];
  const seenTerms = new Set();
  const terms = (Array.isArray(rawTerms) ? rawTerms : []).filter((t) => {
    const key = (t.policyName || t.policy_name || t.name || (typeof t === "string" ? t : "")).trim().toLowerCase();
    if (!key || seenTerms.has(key)) return false;
    seenTerms.add(key);
    return true;
  });

  // Strict deduplication of vendors, sponsors, guests
  const vendorSponsor = formData?.vendorSponsor || {};
  const rawVendors = vendorSponsor?.vendors || (Array.isArray(formData?.vendors) ? formData.vendors : []);
  const seenVendorKeys = new Set();
  const vendors = (Array.isArray(rawVendors) ? rawVendors : []).filter((v) => {
    const key = (v.vendorName || v.vendor_name || "").trim().toLowerCase();
    if (!key || seenVendorKeys.has(key)) return false;
    seenVendorKeys.add(key);
    return true;
  });

  const rawSponsors = vendorSponsor?.sponsors || (Array.isArray(formData?.sponsors) ? formData.sponsors : []);
  const seenSponsorKeys = new Set();
  const sponsors = (Array.isArray(rawSponsors) ? rawSponsors : []).filter((s) => {
    const key = (s.sponsorName || s.sponsor_name || "").trim().toLowerCase();
    if (!key || seenSponsorKeys.has(key)) return false;
    seenSponsorKeys.add(key);
    return true;
  });

  const rawGuests = vendorSponsor?.guests || formData?.guests || [];
  const seenGuestKeys = new Set();
  const guests = (Array.isArray(rawGuests) ? rawGuests : []).filter((g) => {
    const key = (g.name || g.guest_name || g.guestName || "").trim().toLowerCase();
    if (!key || seenGuestKeys.has(key)) return false;
    seenGuestKeys.add(key);
    return true;
  });

  const rawBanner = documents?.bannerPreview || formData?.banner_url || formData?.banner || formData?.image || formData?.banner_preview;
  const bannerPreview = rawBanner ? getFullDocUrl(rawBanner) : "";
  const bannerType = documents?.bannerType || "image";

  // Features list for visitor configuration with Lucide icons (No emojis)
  const features = [
    { label: "Mail Notifications", active: details.mail, icon: Mail },
    { label: "WhatsApp Alerts", active: details.whatsapp, icon: MessageSquare },
    { label: "Print Pass", active: details.print, icon: Printer },
    { label: "Visitor Name Mandatory", active: details.visitorName ?? details.visitor_name, icon: User },
    { label: "Visitor Mail Mandatory", active: details.visitorMail ?? details.visitor_mail, icon: Mail },
    { label: "Visitor Mobile Mandatory", active: details.visitorMobile ?? details.visitor_mobile, icon: Phone },
    { label: "Visitor Photo Mandatory", active: details.visitorPhoto ?? details.visitor_photo, icon: Camera },
    { label: "Document Proof Required", active: details.documentProof ?? details.document_proof, icon: FileCheck },
    { label: "Day Pass Enabled", active: details.dayPass ?? details.day_pass, icon: Ticket },
    { label: "International Attendees", active: details.isInternationalInclude ?? details.is_international_include, icon: Globe },
    { label: "Program Schedule Included", active: details.includeProgram === "Yes" || details.include_program === "Yes" || details.includeProgram === true || details.include_program === true, icon: ClipboardList },
    { label: "Welcome Kit Included", active: details.welcomeKit ?? details.welcome_kit, icon: Gift },
    { label: "Aadhar Required", active: details.aadhar, icon: CreditCard },
    { label: "Passport Required", active: details.passport, icon: Shield },
    { label: "Vehicle Parking Pass", active: details.vehiclePass ?? details.vehicle_pass ?? vehicleDetails.length > 0, icon: Car },
    { label: "Vehicle Number Mandatory", active: details.vehicleNumber ?? details.vehicle_number, icon: Tag },
    { label: "Food Provisioning", active: details.food ?? (foodItems.length > 0), icon: Utensils },
  ];

  const activeFeatures = features.filter((f) => Boolean(f.active));

  return (
    <div className="w-full max-w-7xl mx-auto space-y-3 pb-6 animate-in fade-in duration-300 select-none">
      {/* ── TOP HEADER & TRACKING STATUS BAR ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs px-5 py-3.5 space-y-3.5">
        
        {/* Row 1: Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer border-none bg-transparent flex items-center gap-1 font-bold text-xs"
              title="Back to Events"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-black text-slate-900 tracking-tight">
                {details.eventName || "Event Overview"}
              </h1>
              <Badge className="bg-cyan-50 text-cyan-800 border-cyan-200 font-bold text-[10px]">
                {details.eventCode || "EVT-VIEW"}
              </Badge>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[10px]">
                Step-by-Step View
              </Badge>
            </div>
          </div>

          <Button
            onClick={onEdit}
            className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md shadow-cyan-500/20 border-none cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105 shrink-0 self-end sm:self-auto"
          >
            <Pencil size={13} />
            <span>Edit Event Details</span>
          </Button>
        </div>

        {/* Row 2: Precision-Aligned Tracking Status Bar */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-start justify-between w-full max-w-4xl mx-auto">
            {VIEW_STEPS.map((s, idx) => {
              const isActive = activeStep === s.id;
              const isCompleted = activeStep > s.id;
              const StepIcon = s.icon;

              return (
                <div key={s.id} className="relative flex-1 flex flex-col items-center">
                  {/* Segmented connecting track line between steps */}
                  {idx < VIEW_STEPS.length - 1 && (
                    <div className="absolute top-4 left-1/2 w-full h-0.5 -translate-y-1/2 z-0">
                      <div className="w-full h-full bg-slate-200" />
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 transition-all duration-300"
                        style={{ width: activeStep > idx + 1 ? "100%" : "0%" }}
                      />
                    </div>
                  )}

                  {/* Step Button */}
                  <button
                    type="button"
                    onClick={() => setActiveStep(s.id)}
                    className="relative z-10 flex flex-col items-center gap-1.5 group cursor-pointer border-none bg-transparent px-1 focus:outline-none"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white ring-4 ring-cyan-100 shadow-md scale-105"
                          : isCompleted
                          ? "bg-emerald-500 text-white shadow-xs"
                          : "bg-white border-2 border-slate-300 text-slate-400 group-hover:border-cyan-400"
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={14} strokeWidth={3} />
                      ) : (
                        <StepIcon size={14} strokeWidth={2.2} />
                      )}
                    </div>
                    <div className="text-center">
                      <span
                        className={`text-[9px] uppercase font-extrabold tracking-wider block ${
                          isActive ? "text-cyan-700" : isCompleted ? "text-emerald-700" : "text-slate-400"
                        }`}
                      >
                        {s.stepNo}
                      </span>
                      <span
                        className={`text-[11px] font-extrabold hidden sm:block whitespace-nowrap ${
                          isActive ? "text-slate-900" : isCompleted ? "text-slate-700" : "text-slate-400"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── STEP CONTENT VIEW CONTAINER ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-5">
        
        {/* ── TOP STEP CONTROLS (QUICK SWITCHING) ── */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={activeStep === 1}
            onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
            className="h-8 px-3 border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs gap-1 disabled:opacity-40"
          >
            <ChevronLeft size={14} />
            <span>Previous Step</span>
          </Button>

          <div className="text-center">
            <span className="text-[11px] font-extrabold text-slate-400">
              Viewing Step <span className="text-slate-900 font-black">{activeStep}</span> of <span className="text-slate-900 font-black">{VIEW_STEPS.length}</span>:
            </span>
            <span className="text-xs font-black text-cyan-800 ml-1.5">
              {VIEW_STEPS[activeStep - 1]?.label}
            </span>
          </div>

          <Button
            type="button"
            size="sm"
            disabled={activeStep === VIEW_STEPS.length}
            onClick={() => setActiveStep((prev) => Math.min(VIEW_STEPS.length, prev + 1))}
            className="h-8 px-3 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs gap-1 border-none cursor-pointer shadow-xs disabled:opacity-40"
          >
            <span>Next Step</span>
            <ChevronRight size={14} />
          </Button>
        </div>
        
        {/* STEP 1: EVENT IDENTITY & VENUE */}
        {activeStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
                  <Calendar size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Step 1: Event Identity & Basic Info</h2>
                  <p className="text-xs text-slate-500 font-semibold">General event metadata, dates, venue, and visitor rules</p>
                </div>
              </div>
              <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200 font-extrabold text-xs">Step 1 of 6</Badge>
            </div>

            {/* Banner Showcase */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-900 h-52 md:h-64 flex items-end">
              {bannerPreview ? (
                bannerType === "video" ? (
                  <video src={bannerPreview} className="absolute inset-0 w-full h-full object-cover opacity-85" autoPlay loop muted />
                ) : (
                  <img src={bannerPreview} alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-85" />
                )
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 flex items-center justify-center">
                  <span className="text-slate-400 text-xs font-bold flex items-center gap-2">
                    <FileText size={18} /> No Event Banner Uploaded
                  </span>
                </div>
              )}
              <div className="relative z-10 w-full p-5 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-cyan-500 text-white text-[10px] font-extrabold uppercase">
                    {details.category || "Not Specified"}
                  </span>
                  {details.subCategory && (
                    <span className="px-2.5 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-bold backdrop-blur-md">
                      {details.subCategory}
                    </span>
                  )}
                  {details.eventType && (
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-500/80 text-white text-[10px] font-bold backdrop-blur-md">
                      {details.eventType}
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/80 text-white text-[10px] font-bold backdrop-blur-md">
                    {details.visibility || "Public"}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white">{details.eventName || "Untitled Event"}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-200">
                  <span className="flex items-center gap-1"><Calendar size={13} className="text-cyan-400" /> {details.startDate || "—"} → {details.endDate || "—"}</span>
                  <span className="flex items-center gap-1"><Clock size={13} className="text-cyan-400" /> {details.startTime || "—"} - {details.endTime || "—"}</span>
                  <span className="flex items-center gap-1"><MapPin size={13} className="text-cyan-400" /> {details.venue || "Not Specified"}</span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Event Schedule</span>
                <div className="font-extrabold text-slate-800 flex items-center justify-between">
                  <span>Start: {details.startDate || "—"} @ {details.startTime || "—"}</span>
                  <span>End: {details.endDate || "—"} @ {details.endTime || "—"}</span>
                </div>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Venue & Address</span>
                <div className="font-extrabold text-slate-800 flex items-center gap-1">
                  <MapPin size={13} className="text-cyan-600 shrink-0" />
                  <span>{details.venue || "Venue not selected"}</span>
                </div>
                {details.address && <p className="text-[11px] text-slate-500 font-semibold">{details.address}</p>}
              </div>
            </div>

            {details.description && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Description</span>
                <p className="text-xs font-medium text-slate-700 leading-relaxed">{details.description}</p>
              </div>
            )}

            {/* Configured Visitor Rules */}
            {activeFeatures.length > 0 && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Configured Rules & Toggles ({activeFeatures.length})</span>
                <div className="flex flex-wrap gap-2">
                  {activeFeatures.map((feat, idx) => {
                    const IconComp = feat.icon;
                    return (
                      <span key={idx} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs">
                        <IconComp size={13} className="text-cyan-600 shrink-0" />
                        <span>{feat.label}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: TICKETS & PRICING */}
        {activeStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Ticket size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Step 2: Tickets & Booking Details</h2>
                  <p className="text-xs text-slate-500 font-semibold">Pricing, entry limits, booking dates, and ticket rules</p>
                </div>
              </div>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-extrabold text-xs">Step 2 of 6</Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Entry Type</span>
                <span className={`text-sm font-black ${(booking.charge_type || booking.chargeType) === "Paid" ? "text-emerald-700" : "text-cyan-700"}`}>
                  {booking.charge_type || booking.chargeType || "Not Specified"}
                </span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Ticket Fee</span>
                <span className="text-sm font-black text-slate-900">
                  {(booking.charge_type || booking.chargeType) === "Paid"
                    ? `₹${booking.price_inr !== undefined && booking.price_inr !== null ? booking.price_inr : (booking.priceINR ?? 0)}`
                    : (booking.charge_type || booking.chargeType) === "Free" ? "Free Pass" : "—"}
                </span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Total Capacity</span>
                <span className="text-sm font-black text-slate-900">
                  {booking.capacity || booking.totalCapacity ? `${booking.capacity || booking.totalCapacity} Passes` : "Unlimited"}
                </span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Max Per User</span>
                <span className="text-sm font-black text-slate-900">
                  {booking.max_pass || booking.maxPass || booking.maxPerUser ? `${booking.max_pass || booking.maxPass || booking.maxPerUser} Passes` : "Not Specified"}
                </span>
              </div>
            </div>

            <div className={`grid ${(booking.pass_type || booking.passType) === "Group Pass" ? "grid-cols-4" : "grid-cols-3"} gap-3 text-xs`}>
              <div className="bg-slate-50 p-3 rounded-xl text-center font-bold text-slate-700 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Pass Type</span>
                <span className="font-extrabold text-slate-800">{booking.pass_type || booking.passType || "Not Specified"}</span>
              </div>
              {(booking.pass_type || booking.passType) === "Group Pass" && (
                <div className="bg-cyan-50 p-3 rounded-xl text-center font-extrabold text-cyan-800 border border-cyan-100">
                  <span className="text-[10px] text-cyan-600 uppercase block font-semibold">Group Size</span>
                  <span className="flex items-center justify-center gap-1">
                    <Users size={12} />
                    <span>{booking.group_member_limit || booking.groupMemberLimit ? `${booking.group_member_limit || booking.groupMemberLimit} Members/Pass` : "Not Specified"}</span>
                  </span>
                </div>
              )}
              <div className="bg-slate-50 p-3 rounded-xl text-center font-bold text-slate-700 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Entry Access</span>
                <span className="font-extrabold text-slate-800">{booking.entry_type || booking.entryType || "Not Specified"}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl text-center font-bold text-slate-700 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Currency</span>
                <span className="font-extrabold text-slate-800">{booking.currency ? `${booking.currency}` : "Not Specified"}</span>
              </div>
            </div>

            {/* Applied Taxes */}
            {Array.isArray(booking.taxes) && booking.taxes.length > 0 && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Applied Tax Rules</span>
                <div className="flex flex-wrap gap-2">
                  {booking.taxes.map((t, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-[11px] font-extrabold border border-blue-100 flex items-center gap-1">
                      <Tag size={11} />
                      <span>{t}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Booking Window */}
            {(booking.booking_start_date || booking.bookingStartDate || booking.bookingStartTime || booking.booking_start_time) && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs flex flex-wrap justify-between items-center font-semibold text-slate-700 gap-2">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Booking Availability Window</span>
                <span className="font-extrabold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200">
                  {booking.booking_start_date || booking.bookingStartDate} {booking.bookingStartTime || booking.booking_start_time || ""} → {booking.booking_end_date || booking.bookingEndDate} {booking.bookingEndTime || booking.booking_end_time || ""}
                </span>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: LAYOUT & STALLS */}
        {activeStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Settings2 size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Step 3: Layout, Stalls & Facilities</h2>
                  <p className="text-xs text-slate-500 font-semibold">Exhibition space, configured stalls, sizing, and amenities</p>
                </div>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-extrabold text-xs">Step 3 of 6</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Floor / Layout Type</span>
                <span className="font-extrabold text-slate-800 text-sm">{layout.floorType || layout.floor_type || "Not Specified"}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Badges Per Stall</span>
                <span className="font-extrabold text-slate-800 text-sm">
                  {layout.personPass !== undefined && layout.personPass !== null && layout.personPass !== ""
                    ? `${layout.personPass} Badges`
                    : (layout.person_pass !== undefined && layout.person_pass !== null && layout.person_pass !== ""
                      ? `${layout.person_pass} Badges`
                      : "Not Specified")}
                </span>
              </div>
            </div>

            {/* Space Calculation */}
            {(() => {
              const overallSpace = layout.overallSpaceSqFt || layout.overall_space_sqft || details.venue_total_area_sqft;
              const allocatedSqFt = stalls.reduce((acc, s) => {
                const sQty = parseInt(s.quantity || s.stallQty || s.qty || 1, 10) || 1;
                const sParts = (s.size_range || s.sizeRange || "").split("/");
                const l = parseFloat(sParts[0]) || parseFloat(s.length) || 0;
                const w = parseFloat(sParts[1]) || parseFloat(s.width) || 0;
                const isInch = (s.stall_size || s.size || "").toLowerCase().includes("inch");
                return acc + ((isInch ? (l * w) / 144 : l * w) * sQty);
              }, 0);
              return (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Overall Exhibition Space</span>
                    <span className="text-base font-black text-slate-900">
                      {overallSpace ? `${Number(overallSpace).toLocaleString()} sq.ft` : "Not Specified"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Allocated Stall Area</span>
                    <span className="text-base font-black text-cyan-700">
                      {allocatedSqFt.toLocaleString(undefined, { maximumFractionDigits: 1 })} sq.ft
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Stalls List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <Store size={14} className="text-emerald-600" /> Configured Stalls ({stalls.length})
              </span>
              {stalls.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {stalls.map((st, i) => {
                    const isPrime = Boolean(st.prime_seat || st.primeSeat);
                    const primeFee = st.prime_price_inr || st.primePriceINR;
                    return (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-xs">{st.stall_name || st.stallName || `Stall #${i+1}`}</h4>
                          <span className="text-slate-500 text-[11px] font-semibold">{st.stall_size || st.size || st.size_range || "Not Specified"}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-emerald-700 font-black text-xs block">₹{st.price_inr || st.priceINR || st.price || '0'}</span>
                          {isPrime && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-black uppercase flex items-center gap-0.5 mt-0.5">
                              <Star size={9} /> Prime {primeFee ? `(+₹${primeFee})` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-slate-100">No stalls configured for this event.</p>
              )}
            </div>

            {/* Amenities List */}
            {amenities.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <Sparkles size={14} className="text-cyan-600" /> Stall Amenities ({amenities.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((am, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-cyan-50 text-cyan-800 border border-cyan-100 rounded-lg text-xs font-bold flex items-center gap-1.5">
                      <Layers size={12} />
                      <span>{am.amenity || am.name}</span>
                      {am.stallName && <span className="text-cyan-600 text-[10px]">({am.stallName})</span>}
                      <span className="bg-cyan-200/70 text-cyan-900 px-1.5 py-0.2 rounded text-[10px]">x{am.qty || 1}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: FOOD & VEHICLES */}
        {activeStep === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Utensils size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Step 4: Food & Vehicle Provisions</h2>
                  <p className="text-xs text-slate-500 font-semibold">Catering packages, parking passes, and valet add-ons</p>
                </div>
              </div>
              <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-extrabold text-xs">Step 4 of 6</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Food Provision */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                  <Utensils size={14} className="text-amber-500" /> Food & Catering Packages
                </span>
                {foodItems.length > 0 ? (
                  <div className="space-y-2">
                    {foodItems.map((fi, idx) => (
                      <div key={idx} className="font-bold text-slate-800 text-xs bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-900">{fi.catererName || fi.caterer_name || "Caterer"}</span>
                          <span className="text-xs text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            ₹{fi.priceINR !== undefined && fi.priceINR !== "" ? fi.priceINR : (fi.price_inr !== undefined ? fi.price_inr : 0)}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-semibold flex items-center gap-2">
                          <span>{fi.mealType || fi.meal_type || "Meal"}</span>
                          <span>•</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            (fi.foodType || fi.food_type) === 'Veg' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {fi.foodType || fi.food_type || "Veg"}
                          </span>
                        </div>
                        {(fi.menuDetails || fi.menu_details) && (
                          <div className="text-[11px] text-slate-500 font-normal pt-1">
                            <span className="font-bold text-slate-600">Menu: </span>
                            {fi.menuDetails || fi.menu_details}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (food.catererName || food.caterer_name) ? (
                  <div className="font-bold text-slate-800 text-xs bg-white p-3 rounded-xl border border-slate-200/80">
                    <div>{food.catererName || food.caterer_name} ({food.mealType || food.meal_type || "Meal"})</div>
                    <div className="text-xs text-emerald-700 font-extrabold mt-0.5">Price: ₹{food.priceINR ?? food.price_inr ?? 0}</div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No food provisions enabled for this event.</p>
                )}
              </div>

              {/* Vehicle Provision */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                  <Car size={14} className="text-indigo-500" /> Vehicle Parking Passes & Add-ons
                </span>
                {vehicleDetails.length > 0 ? (
                  <div className="space-y-2">
                    {vehicleDetails.map((v, idx) => (
                      <div key={idx} className="font-bold text-slate-800 text-xs bg-white p-2.5 rounded-xl border border-slate-200/80 flex justify-between items-center">
                        <span>{v.vehicleType || v.vehicle_type}</span>
                        <span className="text-indigo-700 font-black text-xs">₹{v.priceINR !== undefined && v.priceINR !== "" ? v.priceINR : (v.price_inr !== undefined ? v.price_inr : 0)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No vehicle parking passes configured.</p>
                )}

                {vehicleAddons.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Vehicle Add-ons & Valet</span>
                    <div className="space-y-1.5">
                      {vehicleAddons.map((ad, idx) => (
                        <div key={idx} className="text-xs font-bold text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span>{ad.addOnName || ad.addon_name || ad.name || "Add-on"}</span>
                            {(ad.isParent || ad.is_parent) && (
                              <span className="text-[9px] bg-cyan-50 text-cyan-700 px-1.5 py-0.2 rounded font-bold border border-cyan-200">
                                Requires Ticket
                              </span>
                            )}
                          </div>
                          <span className="text-cyan-700 font-extrabold">+₹{ad.price ?? ad.price_inr ?? ad.priceINR ?? 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: PARTNERS & GUESTS */}
        {activeStep === 5 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Users size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Step 5: Assigned Vendors, Sponsors & Guests</h2>
                  <p className="text-xs text-slate-500 font-semibold">Service vendors, event sponsors, and visiting dignitaries</p>
                </div>
              </div>
              <Badge className="bg-purple-50 text-purple-700 border-purple-200 font-extrabold text-xs">Step 5 of 6</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* Vendors */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase block">Assigned Vendors ({vendors.length})</span>
                {vendors.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {vendors.map((v, i) => (
                      <span key={i} className="px-3 py-1.5 bg-purple-50 text-purple-700 font-bold rounded-xl text-xs border border-purple-100 flex items-center gap-1.5">
                        <Store size={12} />
                        <span>{v.vendorName || v.vendor_name}</span>
                        <span className="text-purple-500 font-normal">({v.vendorType || v.vendor_type || "Vendor"})</span>
                        {v.passCount > 0 && <span className="bg-purple-200 text-purple-900 px-1.5 py-0.2 rounded text-[9px] font-extrabold">{v.passCount} Passes</span>}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No service vendors assigned.</p>
                )}
              </div>

              {/* Sponsors */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase block">Event Sponsors ({sponsors.length})</span>
                {sponsors.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {sponsors.map((s, i) => (
                      <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl text-xs border border-indigo-100 flex items-center gap-1.5">
                        <Star size={12} />
                        <span>{s.sponsorName || s.sponsor_name}</span>
                        <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded text-[10px] font-extrabold">
                          {s.sponsorship || s.sponsorshipType || s.sponsorship_type || "Sponsor"}
                        </span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No event sponsors assigned.</p>
                )}
              </div>
            </div>

            {/* Chief Guests */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase block">Chief Guests & VIP Dignitaries ({guests.length})</span>
              {guests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {guests.map((g, i) => (
                    <div key={i} className="p-3 bg-amber-50 text-amber-900 font-bold rounded-xl text-xs border border-amber-200/80 flex items-center gap-3">
                      {g.image && (
                        <img src={getFullDocUrl(g.image)} alt={g.name} className="w-8 h-8 rounded-full object-cover border border-amber-300 shrink-0" />
                      )}
                      <div>
                        <div className="font-extrabold text-slate-900">{g.name || g.guest_name || g.guestName}</div>
                        <div className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                          <span>{g.designation || "VIP Guest"}</span>
                          {g.contact && (
                            <>
                              <span>•</span>
                              <PhoneCall size={10} />
                              <span>{g.contact}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-slate-100">No chief guests or dignitaries registered.</p>
              )}
            </div>
          </div>
        )}

        {/* STEP 6: DOCUMENTS & POLICIES */}
        {activeStep === 6 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <FileText size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Step 6: Documents, Permits & Policies</h2>
                  <p className="text-xs text-slate-500 font-semibold">Attached certificates, NOCs, and refund / cancellation policies</p>
                </div>
              </div>
              <Badge className="bg-rose-50 text-rose-700 border-rose-200 font-extrabold text-xs">Step 6 of 6</Badge>
            </div>

            {/* Documents List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                  <Paperclip size={14} className="text-rose-600" /> Event Documents & Permits ({docList.length})
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">Unique uploaded files</span>
              </div>

              {docList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {docList.map((doc, idx) => {
                    const docName = doc.file_name || doc.name || doc.file_path?.split("/").pop() || `Document #${idx + 1}`;
                    const docType = doc.type || doc.doc_type || doc.file_type || "NOC / Permission";
                    const rawUrl = doc.file_path || doc.preview || doc.file_url || doc.url;
                    const docUrl = getFullDocUrl(rawUrl);
                    return (
                      <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition">
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
              ) : (
                <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-slate-100">No additional permits or documents attached.</p>
              )}
            </div>

            {/* Terms & Refund Policies */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <ScrollText size={14} className="text-amber-600" /> Event Terms & Policies ({terms.length})
              </span>

              {terms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {terms.map((t, i) => (
                    <div key={i} className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
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
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase flex items-center gap-1">
                            <Check size={10} strokeWidth={3} /> Default
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
              ) : (
                <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-slate-100">Standard terms and conditions apply.</p>
              )}
            </div>
          </div>
        )}

        {/* ── BOTTOM STEP NAVIGATION IN-FLOW FOOTER ── */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-6">
          <Button
            type="button"
            variant="outline"
            disabled={activeStep === 1}
            onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
            className="flex items-center gap-1 text-xs font-extrabold border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-xl"
          >
            <ChevronLeft size={16} />
            <span>Previous Step</span>
          </Button>

          <div className="flex items-center gap-1.5">
            {VIEW_STEPS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveStep(s.id)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer border-none p-0 ${
                  activeStep === s.id ? "bg-cyan-600 w-6" : "bg-slate-200 hover:bg-slate-300"
                }`}
                title={`Go to ${s.stepNo}`}
              />
            ))}
          </div>

          <Button
            type="button"
            disabled={activeStep === VIEW_STEPS.length}
            onClick={() => setActiveStep((prev) => Math.min(VIEW_STEPS.length, prev + 1))}
            className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md shadow-cyan-500/20 border-none cursor-pointer flex items-center gap-1 transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span>Next Step</span>
            <ChevronRight size={16} />
          </Button>
        </div>

      </div>
    </div>
  );
};

export default ViewEvent;
