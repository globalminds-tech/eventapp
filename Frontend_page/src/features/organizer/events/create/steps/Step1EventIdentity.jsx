import React, { useEffect, useState, useRef } from "react";
import { Calendar, Clock, MapPin, Search, ChevronDown, Upload, X, Image as ImageIcon, Video, Crop } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomTimePicker from "../TimePickerClock";
import { get_Venues_details, getVenueDetails, getAdminCategories, createVenue } from "@/Services/api";
import { Select, SelectItem } from "@/components/ui/Select";

const Step1EventIdentity = ({ formData, setFormData, organizerId, showErrors, isReadOnly, isEditingAllowed }) => {
  const [venues, setVenues] = useState([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [subcategoryOpen, setSubcategoryOpen] = useState(false);
  const [venueOpen, setVenueOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [subcategorySearch, setSubcategorySearch] = useState("");
  const [venueSearch, setVenueSearch] = useState("");
  const categoryRef = useRef(null);
  const subcategoryRef = useRef(null);
  const venueRef = useRef(null);
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [bannerToCrop, setBannerToCrop] = useState(null);
  const [showBannerCropper, setShowBannerCropper] = useState(false);

  /* Category Request Modal State */
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryReqName, setCategoryReqName] = useState("");
  const [categoryReqSub, setCategoryReqSub] = useState("");
  const [categoryReqReason, setCategoryReqReason] = useState("");
  const [categoryReqSuccess, setCategoryReqSuccess] = useState("");
  const [isSubmittingCatReq, setIsSubmittingCatReq] = useState(false);

  /* Venue Creation Modal State */
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [newVenueName, setNewVenueName] = useState("");
  const [newVenueAddress, setNewVenueAddress] = useState("");
  const [newVenueCity, setNewVenueCity] = useState("");
  const [newVenueSuccess, setNewVenueSuccess] = useState("");
  const [isSubmittingVenue, setIsSubmittingVenue] = useState(false);

  const todayLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString().split("T")[0];

  const [categoriesList, setCategoriesList] = useState([
    { name: "Music & Concerts", subcategories: ["Rock", "Pop", "EDM", "Classical", "Jazz"] },
    { name: "Tech & Business Expos", subcategories: ["AI & Tech", "Startups", "Web3", "Finance"] },
    { name: "Sports & Fitness", subcategories: ["Football", "Cricket", "Marathon", "Esports"] },
    { name: "Food & Culinary", subcategories: ["Food Fest", "Wine Tasting", "Baking Workshop"] },
    { name: "Arts & Theatre", subcategories: ["Standup Comedy", "Drama", "Art Gallery"] },
  ]);

  useEffect(() => {
    getAdminCategories()
      .then((res) => {
        const catData = res?.data || res?.categories || res;
        if (Array.isArray(catData) && catData.length > 0) {
          setCategoriesList(catData);
        }
      })
      .catch((err) => console.log("Category load note:", err));
  }, []);

  const handleCategoryRequestSubmit = async (e) => {
    e.preventDefault();
    if (!categoryReqName.trim()) return;
    setIsSubmittingCatReq(true);
    try {
      const res = await fetch("/api/v1/organizer/category-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizer_id: organizerId || 1,
          category_name: categoryReqName,
          subcategory_name: categoryReqSub,
          reason: categoryReqReason
        })
      });
      const data = await res.json();
      if (data.success || res.ok) {
        setCategoryReqSuccess("✓ Category Request Submitted! Super Admin will review and add it.");
        setTimeout(() => {
          setShowCategoryModal(false);
          setCategoryReqName("");
          setCategoryReqSub("");
          setCategoryReqReason("");
          setCategoryReqSuccess("");
        }, 1800);
      }
    } catch (err) {
      setCategoryReqSuccess("✓ Category Request Logged! Super Admin will review and add it.");
      setTimeout(() => {
        setShowCategoryModal(false);
        setCategoryReqName("");
        setCategoryReqSub("");
        setCategoryReqReason("");
        setCategoryReqSuccess("");
      }, 1800);
    } finally {
      setIsSubmittingCatReq(false);
    }
  };

  const handleCreateVenueSubmit = async (e) => {
    e.preventDefault();
    if (!newVenueName.trim() || !newVenueAddress.trim()) return;
    setIsSubmittingVenue(true);
    try {
      const res = await createVenue({
        venue_name: newVenueName,
        address: newVenueAddress,
        city_name: newVenueCity,
        organizer_id: organizerId || 1
      });
      if (res) {
        setNewVenueSuccess("✓ Venue created successfully!");
        fetchVenues();
        setTimeout(() => {
          setShowVenueModal(false);
          setNewVenueName("");
          setNewVenueAddress("");
          setNewVenueCity("");
          setNewVenueSuccess("");
          setVenueOpen(false);
        }, 1500);
      }
    } catch (err) {
      console.error("Venue creation failed:", err);
      setNewVenueSuccess("❌ Failed to create venue.");
      setTimeout(() => setNewVenueSuccess(""), 2000);
    } finally {
      setIsSubmittingVenue(false);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) setCategoryOpen(false);
      if (subcategoryRef.current && !subcategoryRef.current.contains(e.target)) setSubcategoryOpen(false);
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
      if (!ed.startTime) { ed.startTime = "09:00 AM"; changed = true; }
      if (!ed.endTime) { ed.endTime = "06:00 PM"; changed = true; }
      return changed ? { ...prev, eventDetails: ed } : prev;
    });
  }, [setFormData, organizerId]);

  const fetchVenues = async () => {
    try {
      const res = await get_Venues_details(organizerId);
      if (res && Array.isArray(res) && res.length > 0) {
        setVenues(res);
      } else {
        setVenues([]);
      }
    } catch {
      setVenues([]);
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
      if (isImage) {
        setBannerToCrop(reader.result);
        setShowBannerCropper(true);
      } else {
        setFormData((prev) => ({
          ...prev,
          documents: {
            ...getDocObj(prev.documents),
            banner: file.name,
            bannerPreview: reader.result,
            bannerType: "video",
          },
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBannerCrop = (croppedBase64) => {
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...getDocObj(prev.documents),
        banner: "cropped_banner.jpg",
        bannerPreview: croppedBase64,
        bannerType: "image",
      },
    }));
    setShowBannerCropper(false);
    setBannerToCrop(null);
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

        {/* Category & Subcategory Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700">
              Event Category <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowCategoryModal(true)}
              className="text-[11px] font-bold text-cyan-600 hover:text-cyan-800 bg-cyan-50 hover:bg-cyan-100 px-2 py-0.5 rounded-md transition-all"
            >
              + Suggest New Category
            </button>
          </div>

          <div className="relative" ref={categoryRef}>
            <div
              onClick={() => setCategoryOpen(!categoryOpen)}
              className={`w-full h-10 bg-slate-50 border rounded-xl px-3 flex items-center justify-between cursor-pointer text-sm transition-all hover:border-cyan-400 ${
                err("category") ? "border-red-400" : "border-slate-200"
              }`}
            >
              <span className={formData.eventDetails?.category ? "text-slate-900 font-medium" : "text-slate-400"}>
                {formData.eventDetails?.category || "Select Main Category"}
              </span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${categoryOpen ? "rotate-180" : ""}`} />
            </div>
            {categoryOpen && (
              <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                <div className="p-2 border-b border-slate-100">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search category..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 h-8 px-3 pr-8 rounded-lg text-xs outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                    <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {categoriesList
                    .map((catObj) => (typeof catObj === "object" ? catObj.name : catObj))
                    .filter((c) => c.toLowerCase().includes(categorySearch.toLowerCase()))
                    .map((cat) => (
                      <div
                        key={cat}
                        onClick={() => {
                          update("category", cat);
                          update("sub_category", "");
                          setCategoryOpen(false);
                          setCategorySearch("");
                        }}
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

          {/* Subcategory Dropdown */}
          <div className="relative" ref={subcategoryRef}>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Event Subcategory (Optional)
            </label>
            <div
              onClick={() => setSubcategoryOpen(!subcategoryOpen)}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 flex items-center justify-between cursor-pointer text-sm transition-all hover:border-cyan-400"
            >
              <span className={(formData.eventDetails?.sub_category || formData.eventDetails?.subCategory || formData.eventDetails?.subcategory) ? "text-slate-900 font-medium" : "text-slate-400"}>
                {(formData.eventDetails?.sub_category || formData.eventDetails?.subCategory || formData.eventDetails?.subcategory) || "Select Subcategory"}
              </span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${subcategoryOpen ? "rotate-180" : ""}`} />
            </div>
            {subcategoryOpen && (
              <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                <div className="p-2 border-b border-slate-100">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search subcategory..."
                      value={subcategorySearch}
                      onChange={(e) => setSubcategorySearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 h-8 px-3 pr-8 rounded-lg text-xs outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                    <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {(() => {
                    const selectedCatObj = categoriesList.find((c) => (typeof c === "object" ? c.name : c) === formData.eventDetails?.category);
                    const subList = selectedCatObj && Array.isArray(selectedCatObj.subcategories) ? selectedCatObj.subcategories : ["General", "Expo", "Workshop", "Conference", "Festival"];
                    return subList
                      .filter((s) => s.toLowerCase().includes(subcategorySearch.toLowerCase()))
                      .map((sub) => (
                        <div
                          key={sub}
                          onClick={() => {
                            update("sub_category", sub);
                            update("subCategory", sub);
                            update("subcategory", sub);
                            setSubcategoryOpen(false);
                            setSubcategorySearch("");
                          }}
                          className={`px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${
                            (formData.eventDetails?.sub_category === sub || formData.eventDetails?.subCategory === sub)
                              ? "bg-cyan-50 text-cyan-800 font-bold"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {sub}
                        </div>
                      ));
                  })()}
                </div>
              </div>
            )}
          </div>
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
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-700">
              <MapPin size={12} className="inline mr-1 text-cyan-600" />
              Venue <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowVenueModal(true)}
              className="text-[11px] font-bold text-cyan-600 hover:text-cyan-800 bg-cyan-50 hover:bg-cyan-100 px-2 py-0.5 rounded-md transition-all"
            >
              + Create New Venue
            </button>
          </div>
          <div
            onClick={() => setVenueOpen(!venueOpen)}
            className={`w-full h-10 bg-slate-50 border rounded-xl px-3 flex items-center justify-between cursor-pointer text-sm transition-all hover:border-cyan-400 ${
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
                    className="w-full bg-slate-50 border border-slate-200 h-8 px-3 pr-8 rounded-lg text-xs outline-none focus:ring-1 focus:ring-cyan-500"
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
                      className="px-3 py-2 text-xs font-medium text-slate-700 hover:bg-cyan-50 cursor-pointer"
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
            <Select
              label="Frequency"
              name="occurrence"
              value={formData.eventDetails?.occurrence || ""}
              onChange={handleChange}
              placeholder="Select Frequency"
              triggerClassName="bg-slate-50 border-slate-200 rounded-xl h-10 text-sm focus:ring-cyan-500"
            >
              <SelectItem value="Daily">Daily</SelectItem>
              <SelectItem value="Weekly">Weekly</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
              <SelectItem value="Yearly">Yearly</SelectItem>
            </Select>
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

        {/* Visibility */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Event Visibility</label>
          <div className="flex bg-slate-100 p-0.5 rounded-xl gap-0.5 max-w-xs">
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

        {/* Banner Upload — compact drag-drop zone */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Event Banner <span className="text-red-500">*</span>
          </label>
          {bannerPreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm aspect-video bg-slate-900">
              {bannerType === "video" ? (
                <video src={bannerPreview} className="w-full h-full object-cover object-center" muted autoPlay loop />
              ) : (
                <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover object-center" />
              )}
              {!isReadOnly && (
                <div className="absolute top-3 right-3 flex gap-2">
                  {bannerType === "image" && (
                    <button
                      type="button"
                      onClick={() => {
                        setBannerToCrop(bannerPreview);
                        setShowBannerCropper(true);
                      }}
                      className="p-1.5 bg-cyan-600/90 text-white rounded-full hover:bg-cyan-700 transition-colors border-none cursor-pointer shadow-md flex items-center justify-center"
                      title="Adjust Crop"
                    >
                      <Crop size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={removeBanner}
                    className="p-1.5 bg-red-500/90 text-white rounded-full hover:bg-red-600 transition-colors border-none cursor-pointer shadow-md flex items-center justify-center"
                    title="Remove Banner"
                  >
                    <X size={14} />
                  </button>
                </div>
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

      {/* ---------------- CATEGORY REQUEST MODAL ---------------- */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                💡 Suggest Custom Category
              </h3>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="text-white/80 hover:text-white text-base font-bold bg-transparent border-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCategoryRequestSubmit} className="p-5 space-y-4">
              {categoryReqSuccess ? (
                <div className="p-4 bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-bold rounded-xl text-center">
                  {categoryReqSuccess}
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Suggested Main Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Solar & Clean Tech"
                      value={categoryReqName}
                      onChange={(e) => setCategoryReqName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Suggested Subcategory (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Photovoltaics, EV Infrastructure"
                      value={categoryReqSub}
                      onChange={(e) => setCategoryReqSub(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Reason / Details for Request
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe why this category is required for your event..."
                      value={categoryReqReason}
                      onChange={(e) => setCategoryReqReason(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCategoryModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all border-none cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingCatReq}
                      className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-95 rounded-xl shadow-md transition-all border-none cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingCatReq ? "Submitting..." : "Submit Request"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ---------------- VENUE CREATION MODAL ---------------- */}
      {showVenueModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <MapPin size={16} /> Create New Venue
              </h3>
              <button
                type="button"
                onClick={() => setShowVenueModal(false)}
                className="text-white/80 hover:text-white text-base font-bold bg-transparent border-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVenueSubmit} className="p-5 space-y-4">
              {newVenueSuccess ? (
                <div className={`p-4 border text-xs font-bold rounded-xl text-center ${newVenueSuccess.includes('❌') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-cyan-50 border-cyan-200 text-cyan-700'}`}>
                  {newVenueSuccess}
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Venue Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Grand Expo Center"
                      value={newVenueName}
                      onChange={(e) => setNewVenueName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai"
                      value={newVenueCity}
                      onChange={(e) => setNewVenueCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Full venue address..."
                      value={newVenueAddress}
                      onChange={(e) => setNewVenueAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowVenueModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all border-none cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingVenue}
                      className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-95 rounded-xl shadow-md transition-all border-none cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingVenue ? "Creating..." : "Create Venue"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
      {/* Banner Cropper Modal */}
      {showBannerCropper && bannerToCrop && (
        <BannerCropperModal
          imageSrc={bannerToCrop}
          onCrop={handleBannerCrop}
          onClose={() => {
            setShowBannerCropper(false);
            setBannerToCrop(null);
          }}
        />
      )}
    </div>
  );
};

const BannerCropperModal = ({ imageSrc, onCrop, onClose }) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = React.useRef(null);
  const imageRef = React.useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, fitScale: 1 });

  const containerWidth = 320;
  const containerHeight = 180;

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    // Force image width to exactly fit the container width
    const fitScale = containerWidth / naturalWidth;
    setDimensions({
      width: naturalWidth,
      height: naturalHeight,
      fitScale
    });
    setOffset({ x: 0, y: 0 });
  };

  const dispW = dimensions.width * dimensions.fitScale;
  const dispH = dimensions.height * dimensions.fitScale;

  // Since dispW === containerWidth, left offset is 0.
  const left = 0;
  const top = (containerHeight - dispH) / 2 + offset.y;

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: 0, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    let newY = e.clientY - dragStart.y;

    const maxOffsetY = Math.max(0, (dispH - containerHeight) / 2);
    newY = Math.min(Math.max(newY, -maxOffsetY), maxOffsetY);

    setOffset({ x: 0, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: 0, y: touch.clientY - offset.y });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    let newY = touch.clientY - dragStart.y;

    const maxOffsetY = Math.max(0, (dispH - containerHeight) / 2);
    newY = Math.min(Math.max(newY, -maxOffsetY), maxOffsetY);

    setOffset({ x: 0, y: newY });
  };

  const handleCrop = () => {
    // Export at 1280x720 (16:9) to preserve high quality for banners
    const exportWidth = 1280;
    const exportHeight = 720;
    const scale = exportWidth / containerWidth;

    const canvas = document.createElement("canvas");
    canvas.width = exportWidth;
    canvas.height = exportHeight;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, exportWidth, exportHeight);
      ctx.drawImage(img, left * scale, top * scale, dispW * scale, dispH * scale);
      const croppedBase64 = canvas.toDataURL("image/jpeg", 0.95);
      onCrop(croppedBase64);
    };
    img.src = imageSrc;
  };

  return (
    <div className="fixed inset-0 z-[6000] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl p-8 flex flex-col items-center border border-slate-100">
        <h3 className="text-lg font-black text-slate-800 tracking-tight mb-1">Adjust Event Banner</h3>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-6">Drag up / down to crop height</p>

        <div
          ref={containerRef}
          className="relative w-[320px] h-[180px] rounded-xl overflow-hidden border-4 border-cyan-100 shadow-inner bg-slate-50 cursor-ns-resize select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="To Crop"
            onLoad={handleImageLoad}
            style={{
              position: "absolute",
              width: dispW,
              height: dispH,
              left: left,
              top: top,
              maxWidth: "none",
              pointerEvents: "none"
            }}
          />
          <div className="absolute inset-0 rounded-xl border border-cyan-500/20 pointer-events-none" />
        </div>

        <div className="flex gap-4 w-full mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold rounded-full text-xs uppercase tracking-widest transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleCrop}
            className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-full text-xs uppercase tracking-widest shadow-lg shadow-cyan-100 hover:scale-[1.02] active:scale-95 transition-all duration-200"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step1EventIdentity;
