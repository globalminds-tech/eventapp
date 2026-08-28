import React, { useEffect, useState, useRef } from "react";
import { Calendar, Clock, MapPin, Search, ChevronDown, Upload, X, Image as ImageIcon, Video } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomTimePicker from "../TimePickerClock";
import { get_Venues_details, getVenueDetails } from "../../../../Services/api";

const Step1EventIdentity = ({ formData, setFormData, organizerId, showErrors, isReadOnly, isEditingAllowed }) => {
  const [venues, setVenues] = useState([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [venueOpen, setVenueOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [venueSearch, setVenueSearch] = useState("");
  const categoryRef = useRef(null);
  const venueRef = useRef(null);
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const todayLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString().split("T")[0];

  const categories = ["Music", "Business", "Technology", "Education", "Sports"];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) setCategoryOpen(false);
      if (venueRef.current && !venueRef.current.contains(e.target)) setVenueOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Set defaults + fetch venues
  useEffect(() => {
    fetchVenues();
    setFormData((prev) => {
      const ed = { ...(prev.eventDetails || {}) };
      let changed = false;
      if (ed.visibility === undefined) { ed.visibility = "Public"; changed = true; }
      if (ed.eventType === undefined) { ed.eventType = "OneTime"; changed = true; }
      return changed ? { ...prev, eventDetails: ed } : prev;
    });
  }, [setFormData, organizerId]);

  const demoVenues = [
    { id: 1, venue_name: "Grand Convention Center", city_name: "Chennai", address: "123 MRC Nagar, Chennai" },
    { id: 2, venue_name: "Cyber City Auditorium", city_name: "Bangalore", address: "100 Innovation Way, Cyber City, Bangalore" },
    { id: 3, venue_name: "International Expo Center", city_name: "Hyderabad", address: "HITEC City Main Road, Hyderabad" },
    { id: 4, venue_name: "Royal Palace Grounds", city_name: "Mumbai", address: "BKC Complex, Bandra East, Mumbai" },
  ];

  const fetchVenues = async () => {
    try {
      const res = await get_Venues_details(organizerId);
      if (res && Array.isArray(res) && res.length > 0) {
        setVenues(res);
      } else {
        setVenues(demoVenues);
      }
    } catch {
      setVenues(demoVenues);
    }
  };

  const update = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      eventDetails: { ...prev.eventDetails, [field]: value },
    }));
  };

  const parseISODate = (str) => {
    if (!str) return null;
    const parts = str.split("-");
    if (parts.length === 3) return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return null;
  };

  const formatISO = (date) => {
    if (!date) return "";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleStartDateChange = (date) => {
    if (!date) {
      update("startDate", "");
      return;
    }
    const iso = formatISO(date);
    const minISO = iso < todayLocal ? todayLocal : iso;

    setFormData((prev) => {
      const next = { ...prev, eventDetails: { ...prev.eventDetails, startDate: minISO } };
      if (next.eventDetails.endDate && next.eventDetails.endDate < minISO) {
        next.eventDetails.endDate = minISO;
      }
      // Prefill booking dates
      const parts = minISO.split("-");
      const formatted = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : "";
      next.booking = { ...(prev.booking || {}), bookingStartDate: formatted, _lastEventStart: minISO };
      if (next.eventDetails.endDate) {
        const ep = next.eventDetails.endDate.split("-");
        next.booking.bookingEndDate = ep.length === 3 ? `${ep[2]}/${ep[1]}/${ep[0]}` : "";
        next.booking._lastEventEnd = next.eventDetails.endDate;
      }
      return next;
    });
  };

  const handleEndDateChange = (date) => {
    if (!date) {
      update("endDate", "");
      return;
    }
    const iso = formatISO(date);
    const minEnd = formData.eventDetails?.startDate || todayLocal;
    const minISO = iso < minEnd ? minEnd : iso;

    setFormData((prev) => {
      const parts = minISO.split("-");
      const formatted = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : "";
      return {
        ...prev,
        eventDetails: { ...prev.eventDetails, endDate: minISO },
        booking: { ...(prev.booking || {}), bookingEndDate: formatted, _lastEventEnd: minISO },
      };
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    update(name, type === "checkbox" ? checked : value);
  };

  // Helper to ensure documents state is a clean object
  const getDocObj = (prevDocs) => (prevDocs && typeof prevDocs === "object" && !Array.isArray(prevDocs) ? prevDocs : {});

  // Banner handling (Local preview on select; uploaded to Supabase Storage on Save/Publish)
  const handleBannerUpload = (file) => {
    if (!file) return;
    const isVideo = file.type?.startsWith("video/");
    const isImage = file.type?.startsWith("image/");
    if (!isImage && !isVideo) return;
    if (file.size > 50 * 1024 * 1024) return; // 50MB limit

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        documents: {
          ...getDocObj(prev.documents),
          banner: file.name,
          bannerPreview: reader.result,
          bannerType: isVideo ? "video" : "image",
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeBanner = () => {
    setFormData((prev) => ({
      ...prev,
      documents: { ...getDocObj(prev.documents), banner: null, bannerPreview: null, bannerType: null },
    }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleBannerUpload(file);
  };

  // Validation helpers
  const err = (field) => showErrors && !formData.eventDetails?.[field];
  const errMsg = (field, msg) => err(field) ? msg : "";

  const bannerPreview = formData.documents?.bannerPreview;
  const bannerType = formData.documents?.bannerType;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* ─── LEFT COLUMN: Identity & Description ─── */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-50 rounded-lg">
            <Calendar className="w-4 h-4 text-cyan-600" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Event Identity</h3>
        </div>

        {/* Event Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Event Name <span className="text-red-500">*</span>
          </label>
          <input
            name="eventName"
            placeholder="e.g. Global Tech Summit 2026"
            value={formData.eventDetails?.eventName || ""}
            onChange={handleChange}
            maxLength={50}
            className={`w-full h-10 bg-slate-50 border rounded-xl px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${
              err("eventName") ? "border-red-400" : "border-slate-200"
            }`}
          />
          <div className="flex justify-between mt-0.5">
            {err("eventName") && <p className="text-red-500 text-[10px] font-medium">Event name is required</p>}
            <span className="text-[10px] text-slate-400 ml-auto">{(formData.eventDetails?.eventName || "").length}/50</span>
          </div>
        </div>

        {/* Category */}
        <div className="relative" ref={categoryRef}>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Event Category <span className="text-red-500">*</span>
          </label>
          <div
            onClick={() => setCategoryOpen(!categoryOpen)}
            className={`w-full h-10 bg-slate-50 border rounded-xl px-3 flex items-center justify-between cursor-pointer text-sm transition-all hover:border-cyan-400 ${
              err("category") ? "border-red-400" : "border-slate-200"
            }`}
          >
            <span className={formData.eventDetails?.category ? "text-slate-900 font-medium" : "text-slate-400"}>
              {formData.eventDetails?.category || "Select Category"}
            </span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${categoryOpen ? "rotate-180" : ""}`} />
          </div>
          {categoryOpen && (
            <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
              <div className="p-2 border-b border-slate-100">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 h-8 px-3 pr-8 rounded-lg text-xs outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
              <div className="max-h-40 overflow-y-auto">
                {categories
                  .filter((c) => c.toLowerCase().includes(categorySearch.toLowerCase()))
                  .map((cat) => (
                    <div
                      key={cat}
                      onClick={() => { update("category", cat); setCategoryOpen(false); setCategorySearch(""); }}
                      className={`px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${
                        formData.eventDetails?.category === cat
                          ? "bg-cyan-50 text-cyan-800 font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {cat}
                    </div>
                  ))}
              </div>
            </div>
          )}
          {err("category") && <p className="text-red-500 text-[10px] mt-0.5 font-medium">Category is required</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            placeholder="Brief event description..."
            value={formData.eventDetails?.description || ""}
            onChange={handleChange}
            rows={2}
            className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-cyan-500 transition-all resize-none ${
              err("description") ? "border-red-400" : "border-slate-200"
            }`}
          />
          {err("description") && <p className="text-red-500 text-[10px] mt-0.5 font-medium">Description is required</p>}
        </div>

        {/* Venue */}
        <div className="relative" ref={venueRef}>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            <MapPin size={12} className="inline mr-1 text-emerald-600" />
            Venue <span className="text-red-500">*</span>
          </label>
          <div
            onClick={() => setVenueOpen(!venueOpen)}
            className={`w-full h-10 bg-slate-50 border rounded-xl px-3 flex items-center justify-between cursor-pointer text-sm transition-all hover:border-emerald-400 ${
              err("venue") ? "border-red-400" : "border-slate-200"
            }`}
          >
            <span className={formData.eventDetails?.venue ? "text-slate-900 font-medium" : "text-slate-400"}>
              {formData.eventDetails?.venue || "Select Venue"}
            </span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${venueOpen ? "rotate-180" : ""}`} />
          </div>
          {venueOpen && (
            <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
              <div className="p-2 border-b border-slate-100">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search venue..."
                    value={venueSearch}
                    onChange={(e) => setVenueSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 h-8 px-3 pr-8 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
              <div className="max-h-40 overflow-y-auto">
                {venues
                  .filter((v) =>
                    `${v.venue_name} ${v.city_name}`.toLowerCase().includes(venueSearch.toLowerCase())
                  )
                  .map((venue) => (
                    <div
                      key={venue.id}
                      onClick={async () => {
                        let fullAddress = "";
                        try {
                          const full = await getVenueDetails(venue.id);
                          const v = full?.venue || full;
                          const parts = [];
                          if (v.address) parts.push(v.address);
                          if (v.city_name && (!v.address || !v.address.toLowerCase().includes(v.city_name.toLowerCase()))) parts.push(v.city_name);
                          if (v.state_name && (!v.address || !v.address.toLowerCase().includes(v.state_name.toLowerCase()))) parts.push(v.state_name);
                          if (v.country_name && (!v.address || !v.address.toLowerCase().includes(v.country_name.toLowerCase()))) parts.push(v.country_name);
                          if (v.pin_code && (!v.address || !v.address.includes(v.pin_code))) parts.push(v.pin_code);
                          fullAddress = parts.filter(Boolean).join(", ");
                        } catch {
                          fullAddress = [venue.address, venue.city_name].filter(Boolean).join(", ");
                        }
                        setFormData((prev) => ({
                          ...prev,
                          eventDetails: {
                            ...prev.eventDetails,
                            venue: `${venue.venue_name} (${venue.city_name})`,
                            address: fullAddress,
                          },
                        }));
                        setVenueOpen(false);
                        setVenueSearch("");
                      }}
                      className="px-3 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 cursor-pointer"
                    >
                      {venue.venue_name} ({venue.city_name})
                    </div>
                  ))}
                {venues.filter((v) =>
                  `${v.venue_name} ${v.city_name}`.toLowerCase().includes(venueSearch.toLowerCase())
                ).length === 0 && (
                  <div className="px-3 py-2 text-xs text-slate-400">No venues found</div>
                )}
              </div>
            </div>
          )}
          {err("venue") && <p className="text-red-500 text-[10px] mt-0.5 font-medium">Venue is required</p>}
        </div>

        {/* Address (auto-filled from venue, editable) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Address <span className="text-red-500">*</span>
          </label>
          <input
            name="address"
            placeholder="Venue address"
            value={formData.eventDetails?.address || ""}
            onChange={handleChange}
            className={`w-full h-10 bg-slate-50 border rounded-xl px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${
              err("address") ? "border-red-400" : "border-slate-200"
            }`}
          />
          {err("address") && <p className="text-red-500 text-[10px] mt-0.5 font-medium">Address is required</p>}
        </div>
      </div>

      {/* ─── RIGHT COLUMN: Dates, Config & Banner ─── */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-50 rounded-lg">
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Schedule & Configuration</h3>
        </div>

        {/* Event Type Toggle */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Event Type</label>
          <div className="flex bg-slate-100 p-0.5 rounded-xl gap-0.5">
            {[{ id: "OneTime", label: "One-Time" }, { id: "Recurring", label: "Recurring" }].map((opt) => (
              <label key={opt.id} className="flex-1 cursor-pointer">
                <input type="radio" name="eventType" value={opt.id} className="hidden peer"
                  checked={formData.eventDetails?.eventType === opt.id} onChange={handleChange} />
                <div className="text-center py-2 rounded-xl text-xs font-bold transition-all
                  peer-checked:bg-white peer-checked:text-cyan-700 peer-checked:shadow-sm
                  text-slate-500 hover:text-slate-700">
                  {opt.label}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Recurring Frequency */}
        {formData.eventDetails?.eventType === "Recurring" && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Frequency</label>
            <select name="occurrence" value={formData.eventDetails?.occurrence || ""}
              onChange={handleChange}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer">
              <option value="">Select Frequency</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>
        )}

        {/* Date & Time — 4-column compact row */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Event Schedule <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>
              <span className="text-[10px] font-semibold text-slate-500 mb-0.5 block">Start Date</span>
              <DatePicker
                selected={parseISODate(formData.eventDetails?.startDate)}
                onChange={handleStartDateChange}
                minDate={new Date()}
                dateFormat="dd/MM/yyyy"
                placeholderText="Start Date"
                className={`w-full h-9 bg-slate-50 border rounded-lg px-2 text-xs outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer ${
                  err("startDate") ? "border-red-400" : "border-slate-200"
                }`}
                wrapperClassName="w-full"
              />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 mb-0.5 block">Start Time</span>
              <CustomTimePicker
                value={formData.eventDetails?.startTime || ""}
                hasError={showErrors && !formData.eventDetails?.startTime}
                onChange={(v) => update("startTime", v)}
                disabled={isReadOnly}
              />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 mb-0.5 block">End Date</span>
              <DatePicker
                selected={parseISODate(formData.eventDetails?.endDate)}
                onChange={handleEndDateChange}
                minDate={parseISODate(formData.eventDetails?.startDate) || new Date()}
                dateFormat="dd/MM/yyyy"
                placeholderText="End Date"
                disabled={isReadOnly}
                className={`w-full h-9 bg-slate-50 border rounded-lg px-2 text-xs outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer ${
                  err("endDate") ? "border-red-400" : "border-slate-200"
                }`}
                wrapperClassName="w-full"
              />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 mb-0.5 block">End Time</span>
              <CustomTimePicker
                value={formData.eventDetails?.endTime || ""}
                hasError={showErrors && !formData.eventDetails?.endTime}
                onChange={(v) => update("endTime", v)}
                disabled={isReadOnly}
              />
            </div>
          </div>
        </div>

        {/* Visibility & Charge Type — side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Visibility</label>
            <div className="flex bg-slate-100 p-0.5 rounded-xl gap-0.5">
              {["Public", "Private"].map((opt) => (
                <label key={opt} className="flex-1 cursor-pointer">
                  <input type="radio" name="visibility" value={opt} className="hidden peer"
                    checked={formData.eventDetails?.visibility === opt} onChange={handleChange} />
                  <div className="text-center py-2 rounded-xl text-xs font-bold transition-all
                    peer-checked:bg-white peer-checked:text-cyan-700 peer-checked:shadow-sm
                    text-slate-500">{opt}</div>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Charge Type <span className="text-red-500">*</span></label>
            <div className="flex bg-slate-100 p-0.5 rounded-xl gap-0.5">
              {["Free", "Paid", "Donation"].map((opt) => (
                <label key={opt} className="flex-1 cursor-pointer">
                  <input type="radio" name="chargeType" value={opt} className="hidden peer"
                    checked={(formData.booking?.chargeType || "Free") === opt}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        booking: {
                          ...prev.booking,
                          chargeType: e.target.value,
                          ...(e.target.value === "Paid" ? { priceType: "National", currency: "Indian Rupee - INR (₹)" } : {}),
                          ...(e.target.value !== "Paid" ? { includeTax: false, priceType: "", currency: "" } : {}),
                        },
                      }));
                    }}
                  />
                  <div className="text-center py-2 rounded-xl text-[11px] font-bold transition-all
                    peer-checked:bg-white peer-checked:text-cyan-700 peer-checked:shadow-sm
                    text-slate-500">{opt}</div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Banner Upload — compact drag-drop zone */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Event Banner <span className="text-red-500">*</span>
          </label>
          {bannerPreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm h-48 md:h-52 bg-slate-900">
              {bannerType === "video" ? (
                <video src={bannerPreview} className="w-full h-full object-cover object-center" muted autoPlay loop />
              ) : (
                <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover object-center" />
              )}
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={removeBanner}
                  className="absolute top-3 right-3 p-1.5 bg-red-500/90 text-white rounded-full hover:bg-red-600 transition-colors border-none cursor-pointer shadow-md"
                >
                  <X size={14} />
                </button>
              )}
              <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold rounded-lg flex items-center gap-1.5 border border-white/10">
                {bannerType === "video" ? <Video size={12} /> : <ImageIcon size={12} />}
                {bannerType === "video" ? "Video Banner" : "Image Banner"}
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => { if (!isReadOnly) { e.preventDefault(); setDragActive(true); } }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { if (!isReadOnly) handleDrop(e); }}
              className={`relative h-36 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all ${
                isReadOnly
                  ? "border-slate-200 bg-slate-50/50 opacity-60 cursor-not-allowed"
                  : dragActive
                  ? "border-cyan-500 bg-cyan-50/50 cursor-pointer"
                  : showErrors && !bannerPreview
                  ? "border-red-300 bg-red-50/30 cursor-pointer"
                  : "border-slate-200 bg-slate-50/50 hover:border-cyan-400 hover:bg-cyan-50/30 cursor-pointer"
              }`}
            >
              <Upload size={22} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-600">
                {isReadOnly ? "No banner uploaded" : <>Drop event banner here or <span className="text-cyan-600 underline">browse</span></>}
              </span>
              {!isReadOnly && <span className="text-[10px] text-slate-400 font-medium">Supports Image or Video (Recommended 16:9 or 3:1 aspect ratio, max 50MB)</span>}
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => handleBannerUpload(e.target.files?.[0])}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={isReadOnly}
              />
            </div>
          )}
          {showErrors && !bannerPreview && <p className="text-red-500 text-[10px] mt-0.5 font-medium">Banner is required</p>}
        </div>
      </div>
    </div>
  );
};

export default Step1EventIdentity;
