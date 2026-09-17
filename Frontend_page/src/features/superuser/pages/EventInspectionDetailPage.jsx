import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  IndianRupee,
  Users,
  Store,
  Tag,
  Building2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Check,
  X,
  FileCode,
  Image as ImageIcon,
  UserCheck,
  FileText,
  Briefcase,
  Gift,
  Car,
  Utensils,
  Award,
  RefreshCw,
  Eye,
  ExternalLink,
  Download,
  FileCheck,
  User,
  Phone,
  Mail,
  Crown,
  Sparkles,
  Layers,
  CheckSquare,
  RotateCcw,
  AlertTriangle,
  Building,
  CreditCard,
  Printer,
  MessageSquare,
  Sliders,
  DollarSign,
  Percent,
  BadgePercent,
  Timer,
  Info,
  BookOpen,
  Compass,
  FileBadge
} from "lucide-react";
import { useDispatch } from "react-redux";
import { updateApprovalStatusInStore } from "@/app/store/adminSlice";
import { kycApi } from "@/features/admin/kyc/api/kyc.api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { getEventFullDetails, updateEventStatus } from "@/Services/api";

const getFullDocUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `http://localhost:5001${cleanUrl}`;
};

const formatTimeToAmPm = (timeInput) => {
  if (timeInput === null || timeInput === undefined || timeInput === "") return "Not Set";
  const str = String(timeInput).trim();
  if (!str) return "Not Set";

  // If already formatted with AM or PM
  if (/am|pm/i.test(str)) {
    return str;
  }

  // Support military time e.g. "18", "18:00", "18:00:00"
  const parts = str.split(":");
  let hour = parseInt(parts[0], 10);
  let minute = parts.length > 1 ? parseInt(parts[1], 10) : 0;

  if (isNaN(hour)) return str;
  if (isNaN(minute)) minute = 0;

  const period = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
  const padHour = String(formattedHour).padStart(2, "0");
  const padMinute = String(minute).padStart(2, "0");

  return `${padHour}:${padMinute} ${period}`;
};

export default function EventInspectionDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [eventId]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await getEventFullDetails(eventId);
      if (res?.data) {
        setEventData(res.data);
      } else if (res) {
        setEventData(res);
      }
    } catch (err) {
      console.error("Failed to fetch full event detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleStatusChange = async (newStatus, autoVerifyKyc = false) => {
    setActionLoading(true);
    const targetId = eventId || details?.id;
    try {
      if (autoVerifyKyc) {
        const userId = organizerInfo.id || organizerInfo.user_id || details.user_id || eventData?.user_id;
        if (userId) {
          try {
            await kycApi.updateKycStatus(userId, "VERIFIED", "organizer");
            setEventData((prev) => prev ? {
              ...prev,
              organizer_kyc_status: "VERIFIED",
              organizer: { ...(prev.organizer || {}), kyc_status: "VERIFIED" }
            } : prev);
          } catch (kErr) {
            console.warn("Auto-verify KYC notice:", kErr);
          }
        }
      }
      await updateEventStatus(targetId, newStatus);
      setEventData((prev) => {
        if (!prev) return null;
        if (prev.eventDetails) {
          return { ...prev, eventDetails: { ...prev.eventDetails, status: newStatus }, status: newStatus };
        }
        return { ...prev, status: newStatus };
      });
      // Synchronize Redux store so queue updates without reloading
      dispatch(updateApprovalStatusInStore({ eventId: targetId, status: newStatus }));
      showNotification(`Event successfully marked as ${newStatus}!`, "success");
    } catch (err) {
      showNotification("Failed to update status. Please try again.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const parseJsonList = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const parseTags = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return raw.split(",").map((t) => t.trim()).filter(Boolean);
      }
    }
    return [];
  };

  // Safely extract sub-objects from response payload
  const details = eventData?.eventDetails || eventData?.event_details || eventData || {};
  const booking = eventData?.booking || {};
  const layout = eventData?.layout || {};
  const documents = eventData?.documents || {};
  const vendorSponsor = eventData?.vendorSponsor || eventData?.vendor_sponsor || {};
  const organizerInfo = eventData?.organizer || details?.organizer || {};
  const foodProvision = eventData?.foodProvision || eventData?.food_provision || {};
  const vehicleProvision = eventData?.vehicleProvision || eventData?.vehicle_provision || {};
  const individualStats = eventData?.individualStats || eventData?.individual_stats || {};

  const orgKycStatus = (organizerInfo.kyc_status || eventData?.organizer_kyc_status || details?.organizer_kyc_status || "PENDING").toUpperCase();
  const isOrgKycPending = orgKycStatus !== "VERIFIED";

  const statusStr = (details.status || eventData?.status || "ACTIVE").toUpperCase();

  // Extract uploaded documents list
  const rawDocs = documents.additional_docs ||
                  documents.existing_files ||
                  documents.docs ||
                  documents.additionalDocs ||
                  documents.existingFiles ||
                  eventData?.additional_docs ||
                  eventData?.existing_files ||
                  eventData?.additionalDocs ||
                  eventData?.docs ||
                  eventData?.files || [];

  const docList = Array.isArray(rawDocs) ? rawDocs.filter(d => (d.file_type !== "banner" && (d.file_url || d.file_path || d.preview || d.url))) : [];

  // Extract Chief Guests list
  const rawGuests = vendorSponsor.guests ||
                    eventData?.guests ||
                    eventData?.guest_dicts || [];

  const guestList = Array.isArray(rawGuests) ? rawGuests : [];

  // Extract Vendors, Sponsors & Policies
  const rawVendors = vendorSponsor.vendors || eventData?.vendors || [];
  const vendorList = Array.isArray(rawVendors) ? rawVendors : [];

  const rawSponsors = vendorSponsor.sponsors || eventData?.sponsors || [];
  const sponsorList = Array.isArray(rawSponsors) ? rawSponsors : [];

  const rawTerms = eventData?.terms_details?.policies || eventData?.termsDetails?.policies || eventData?.terms || [];
  const termList = Array.isArray(rawTerms) ? rawTerms : [];

  // Extract Stalls list
  const rawStalls = layout.stalls || eventData?.stalls || [];
  const stallList = Array.isArray(rawStalls) ? rawStalls : [];

  // Extract Food items
  const rawFoodItems = foodProvision.food_items ||
                       foodProvision.items ||
                       foodProvision.foodItems ||
                       eventData?.food_items ||
                       (foodProvision.caterer_name ? [foodProvision] : []);
  const foodItemsList = Array.isArray(rawFoodItems) ? rawFoodItems : [];
  const hasFood = Boolean(details.food || eventData?.food || foodItemsList.length > 0 || foodProvision.caterer_name);

  // Extract Vehicle items & Addons
  const rawVehicles = vehicleProvision.vehicles ||
                      vehicleProvision.details ||
                      eventData?.vehicles ||
                      (vehicleProvision.vehicle_type ? [vehicleProvision] : []);
  const vehicleList = Array.isArray(rawVehicles) ? rawVehicles : [];
  const rawAddons = vehicleProvision.addons || eventData?.vehicle_addons || [];
  const addonList = Array.isArray(rawAddons) ? rawAddons : [];
  const hasVehicle = Boolean(details.vehicle_pass || details.vehiclePass || eventData?.vehicle_pass || vehicleList.length > 0 || addonList.length > 0);

  // Extract Event Programs / Agendas
  const rawPrograms = eventData?.programs || eventData?.program_details || eventData?.programDetails || [];
  const programList = Array.isArray(rawPrograms) ? rawPrograms : [];
  const hasPrograms = details.include_program === "Yes" || programList.length > 0;

  // Banner URL
  const bannerUrl = details.banner_url || documents.banner_url || documents.bannerPreview || eventData?.banner_url || eventData?.banner || eventData?.image;

  // Group Amenities by Stall Name
  const rawAmenities = parseJsonList(layout.amenities || eventData?.amenities || eventData?.layout_amenities);
  const groupedStallAmenities = rawAmenities.reduce((acc, curr) => {
    const sName = curr.stallName || curr.stall_name || "General Amenities";
    if (!acc[sName]) {
      acc[sName] = [];
    }
    acc[sName].push(curr);
    return acc;
  }, {});

  const stallAmenityNames = Object.keys(groupedStallAmenities);

  // Tags and Taxes
  const tagsList = parseTags(details.tags || eventData?.tags);
  const bookingTaxes = parseJsonList(booking.taxes);
  const layoutTaxes = parseJsonList(layout.taxes);

  return (
    <div className="space-y-5 pb-16 select-none text-slate-800 font-sans max-w-7xl mx-auto">
      
      {/* ── TOP BACK & NAVIGATION TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/superuser/approvals")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
          >
            <ArrowLeft size={15} />
            <span>Back to Approvals Queue</span>
          </button>

          {loading ? (
            <Skeleton className="w-32 h-6 rounded-md" />
          ) : (
            <Badge className="bg-purple-100 text-purple-700 border border-purple-200 font-mono text-[11px] font-extrabold px-2.5 py-0.5">
              {details.event_code || details.eventCode || `EVT-${details.id || eventId}`}
            </Badge>
          )}
        </div>

        {/* Action Controls Toolbar with Skeleton Loading */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {loading ? (
            <>
              <Skeleton className="h-8 w-24 rounded-xl" />
              <Skeleton className="h-8 w-28 rounded-xl" />
              <Skeleton className="h-8 w-36 rounded-xl" />
            </>
          ) : (
            <>
              {/* 1. If Pending: Show Reject and Approve */}
              {["PENDING", "SUBMITTED", "DRAFT"].includes(statusStr) && (
                <>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={actionLoading}
                    onClick={() => handleStatusChange("Rejected")}
                    className="text-xs font-extrabold cursor-pointer"
                  >
                    <X size={13} className="mr-1" /> Reject Event
                  </Button>
                  {isOrgKycPending ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        disabled={actionLoading}
                        onClick={() => handleStatusChange("Approved", true)}
                        title="Verify Organizer Business KYC and Approve Event in 1-Click"
                        className="text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white cursor-pointer shadow-md shadow-emerald-500/20"
                      >
                        <ShieldCheck size={13} className="mr-1" /> Verify KYC &amp; Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate("/superuser/kyc?tab=pending")}
                        className="text-xs font-bold border-amber-300 text-amber-800 hover:bg-amber-50"
                      >
                        Inspect KYC
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      disabled={actionLoading}
                      onClick={() => handleStatusChange("Approved")}
                      className="text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                    >
                      <Check size={13} className="mr-1" /> Approve &amp; Publish
                    </Button>
                  )}
                </>
              )}

              {/* 2. If Approved: Approve and Reject are HIDDEN! */}
              {["ACTIVE", "LIVE", "APPROVED", "PUBLISHED"].includes(statusStr) && (
                <>
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black">
                    <Check size={13} className="text-emerald-600" />
                    <span>Approved &amp; Live</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actionLoading}
                    onClick={() => handleStatusChange("Suspended")}
                    className="text-xs font-bold border-amber-300 text-amber-800 hover:bg-amber-50 cursor-pointer"
                    title="Suspend event to temporarily pause ticket bookings and stall applications"
                  >
                    <AlertCircle size={13} className="mr-1" /> Suspend
                  </Button>
                </>
              )}

              {/* 3. If Suspended: Show Reactivate/Unsuspend */}
              {statusStr === "SUSPENDED" && (
                <>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-black">
                    <AlertTriangle size={13} className="text-amber-700 animate-pulse" />
                    <span>Suspended</span>
                  </div>
                  <Button
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleStatusChange("Approved")}
                    className="text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer gap-1"
                  >
                    <RotateCcw size={13} /> Reactivate / Unsuspend
                  </Button>
                </>
              )}

              {/* 4. If Rejected: Show Re-Approve option */}
              {statusStr === "REJECTED" && (
                <>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-black">
                    <X size={13} />
                    <span>Rejected</span>
                  </div>
                  <Button
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleStatusChange("Approved")}
                    className="text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer gap-1"
                  >
                    <Check size={13} /> Re-Approve Event
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {toast && (
        <div className={`p-3.5 rounded-xl text-xs font-extrabold flex items-center justify-between shadow-lg text-white ${
          toast.type === "error" ? "bg-red-600" : "bg-gradient-to-r from-purple-600 to-indigo-600"
        }`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="border-none bg-transparent text-white font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* Organizer KYC Pending Warning Banner */}
      {!loading && ["PENDING", "SUBMITTED", "DRAFT"].includes(statusStr) && isOrgKycPending && (
        <div className="p-4 bg-amber-50 border border-amber-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle size={18} />
            </div>
            <div className="space-y-0.5">
              <div className="font-extrabold text-amber-950 text-sm">
                Organizer Business KYC Pending Verification
              </div>
              <div className="text-amber-800 font-medium">
                This event cannot be approved or published because the organizer's legal KYC documents (GST, PAN, and Bank Payout details) are pending verification.
              </div>
            </div>
          </div>
          <Button
            size="xs"
            onClick={() => navigate("/superuser/kyc?tab=pending")}
            className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs h-8 px-3 rounded-xl border-none cursor-pointer"
          >
            Review Organizer KYC
          </Button>
        </div>
      )}

      {/* ── HEADER CARD WITH COMPLETE AUDIT BLUEPRINT ── */}
      <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <Skeleton className="w-full h-48 sm:h-64 rounded-xl" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="space-y-2">
                <Skeleton className="h-7 w-72 sm:w-96 rounded-lg" />
                <Skeleton className="h-4 w-64 rounded-md" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-28 rounded-xl" />
                <Skeleton className="h-7 w-28 rounded-xl" />
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <Skeleton className="h-3.5 w-32 rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-8 w-32 rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Main Promotional Banner Container */}
            {bannerUrl ? (
              <div className="w-full h-48 sm:h-64 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100 relative group">
                <img
                  src={getFullDocUrl(bannerUrl)}
                  alt="Event Banner"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="absolute top-3 right-3 bg-slate-900/70 backdrop-blur-xs text-white text-[11px] font-mono px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <Badge className="bg-purple-600 border-none text-white text-[10px]">MAIN BANNER</Badge>
                  <span>{details.event_code || details.eventCode || `EVT-${details.id}`}</span>
                </div>
              </div>
            ) : (
              <div className="w-full h-32 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 text-xs font-semibold gap-2">
                <ImageIcon size={20} />
                <span>No event promotional banner uploaded</span>
              </div>
            )}

            {/* Title & Metadata Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {details.event_name || details.eventName || eventData?.event_name || "Untitled Event"}
                  </h2>
                  <span className={`px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                    ["ACTIVE", "LIVE", "APPROVED"].includes(statusStr)
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : ["PENDING", "SUBMITTED"].includes(statusStr)
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}>
                    {statusStr}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Category: <span className="font-extrabold text-slate-800">{details.category || eventData?.category || "General"}</span>
                  {(details.sub_category || details.subCategory || eventData?.sub_category) && (
                    <span> • Subcategory: <span className="font-extrabold text-slate-800">{details.sub_category || details.subCategory || eventData?.sub_category}</span></span>
                  )}
                  {(eventData?.organizer?.company_name || details.organizer?.company_name || eventData?.organizer?.name) && (
                    <span> • Hosted by: <span className="font-extrabold text-purple-700">{eventData?.organizer?.company_name || details.organizer?.company_name || eventData?.organizer?.name}</span></span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs flex-wrap">
                <div className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/80 font-semibold text-slate-700">
                  Type: <span className="font-black text-slate-900">{details.event_type || details.eventType || eventData?.event_type || "OneTime"}</span>
                </div>
                <div className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/80 font-semibold text-slate-700">
                  Visibility: <span className="font-black text-slate-900">{details.visibility || eventData?.visibility || "Public"}</span>
                </div>
                {details.occurrence && (
                  <div className="bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 font-semibold text-purple-700">
                    Occurrence: <span className="font-black">{details.occurrence}</span>
                  </div>
                )}
              </div>
            </div>

            {/* EVENT DESCRIPTION directly inside Header Card */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={13} className="text-purple-600" />
                <span>Event Description</span>
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {details.description || eventData?.description || "No description provided by organizer."}
              </p>
              {tagsList.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-slate-200/50 mt-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Tags:</span>
                  {tagsList.map((t, idx) => (
                    <Badge key={idx} variant="secondary" className="text-[10px] font-bold px-2 py-0 bg-white border border-slate-200 text-slate-700">
                      #{t}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* 4 Quick Glance Metric Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                <span className="text-[10px] font-bold text-purple-600 uppercase">Pass Rate / Price</span>
                <div className="text-base font-black text-purple-950 mt-0.5">
                  {booking.charge_type === "Free" ? "FREE ENTRY" : `₹${(booking.price_inr || details.price || 0).toLocaleString("en-IN")}`}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Capacity &amp; Passes</span>
                <div className="text-base font-black text-slate-900 mt-0.5">
                  {(booking.capacity || 500).toLocaleString("en-IN")} Passes
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Stalls Inventory</span>
                <div className="text-base font-black text-slate-900 mt-0.5">
                  {stallList.length} Stalls Configured
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Exhibition Space</span>
                <div className="text-base font-black text-slate-900 mt-0.5">
                  {(layout.overall_space_sqft || details.venue_total_area_sqft || 0) > 0 ? `${(layout.overall_space_sqft || details.venue_total_area_sqft).toLocaleString("en-IN")} sq.ft` : "Standard Setup"}
                </div>
              </div>
            </div>

            {/* Comprehensive Responsive Flex-Wrap Sub-Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[
                { key: "overview", label: "Executive Overview", icon: Info },
                { key: "schedule", label: "Date & Venue Schedule", icon: MapPin },
                { key: "tickets", label: "Tickets & Booking Rules", icon: IndianRupee },
                { key: "stalls", label: `Stalls & Layout (${stallList.length})`, icon: Store },
                { key: "food", label: `Food Provision (${hasFood ? 'Active' : 'Off'})`, icon: Utensils },
                { key: "vehicles", label: `Vehicle Passes (${hasVehicle ? 'Active' : 'Off'})`, icon: Car },
                ...(hasPrograms ? [{ key: "programs", label: `Agendas & Programs (${programList.length})`, icon: Layers }] : []),
                { key: "documents", label: `Uploaded Docs (${docList.length})`, icon: FileCheck },
                { key: "compliance", label: "Entry Compliance (14)", icon: ShieldCheck },
                { key: "guests", label: `Chief Guests (${guestList.length})`, icon: Crown },
                { key: "network", label: `Vendors & Policies (${vendorList.length + sponsorList.length + termList.length})`, icon: Building2 },
                { key: "organizer", label: "Organizer & KYC Audit", icon: UserCheck },
              ].map((tb) => {
                const IconComp = tb.icon;
                const isActive = activeTab === tb.key;
                return (
                  <button
                    key={tb.key}
                    type="button"
                    onClick={() => setActiveTab(tb.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer border-none flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-slate-100/90 text-slate-600 hover:bg-slate-200/80"
                    }`}
                  >
                    <IconComp size={14} />
                    <span>{tb.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* ── TAB DETAILS CARDS ── */}
      {!loading && (
        <div className="space-y-4">

          {/* ── TAB: EXECUTIVE OVERVIEW ── */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Event Audit Metadata */}
                <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <FileBadge size={14} className="text-purple-600" />
                    <span>Audit &amp; Registry Identifiers</span>
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Event Code:</span>
                      <span className="font-mono font-bold text-slate-900">{details.event_code || details.eventCode || "N/A"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Current Status:</span>
                      <Badge className="font-extrabold text-[10px]">{statusStr}</Badge>
                    </div>
                  </div>
                </Card>

                {/* Communication & Delivery Channels */}
                <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <MessageSquare size={14} className="text-purple-600" />
                    <span>Ticket Dispatch &amp; Printing Channels</span>
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Mail size={13} className="text-blue-500" />
                        <span>Email Ticket &amp; QR Pass</span>
                      </span>
                      {details.mail ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold text-[10px]">ACTIVE</Badge>
                      ) : (
                        <Badge className="bg-slate-200 text-slate-600 border-none font-bold text-[10px]">DISABLED</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Phone size={13} className="text-emerald-500" />
                        <span>WhatsApp Delivery</span>
                      </span>
                      {details.whatsapp ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold text-[10px]">ACTIVE</Badge>
                      ) : (
                        <Badge className="bg-slate-200 text-slate-600 border-none font-bold text-[10px]">DISABLED</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Printer size={13} className="text-amber-500" />
                        <span>Physical Badge Printing</span>
                      </span>
                      {details.print ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold text-[10px]">ACTIVE</Badge>
                      ) : (
                        <Badge className="bg-slate-200 text-slate-600 border-none font-bold text-[10px]">DISABLED</Badge>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Operational Inclusions Status */}
                <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Sliders size={14} className="text-purple-600" />
                    <span>Special Facility Modules</span>
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Food Voucher Provision:</span>
                      <Badge className={hasFood ? "bg-emerald-100 text-emerald-800 border-none font-bold text-[10px]" : "bg-slate-200 text-slate-600 border-none font-bold text-[10px]"}>
                        {hasFood ? "ENABLED" : "NOT INCLUDED"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Vehicle Parking Passes:</span>
                      <Badge className={hasVehicle ? "bg-emerald-100 text-emerald-800 border-none font-bold text-[10px]" : "bg-slate-200 text-slate-600 border-none font-bold text-[10px]"}>
                        {hasVehicle ? "ENABLED" : "NOT INCLUDED"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Exhibition Layout &amp; Stalls:</span>
                      <Badge className={stallList.length > 0 ? "bg-emerald-100 text-emerald-800 border-none font-bold text-[10px]" : "bg-slate-200 text-slate-600 border-none font-bold text-[10px]"}>
                        {stallList.length > 0 ? `${stallList.length} STALLS` : "OPEN PLAN"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Agenda Programs Included:</span>
                      <Badge className={hasPrograms ? "bg-emerald-100 text-emerald-800 border-none font-bold text-[10px]" : "bg-slate-200 text-slate-600 border-none font-bold text-[10px]"}>
                        {details.include_program === "Yes" ? "YES" : "NO"}
                      </Badge>
                    </div>
                  </div>
                </Card>

              </div>
            </div>
          )}

          {/* ── TAB 1: DATE & VENUE SCHEDULE ── */}
          {activeTab === "schedule" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <Calendar size={16} className="text-purple-600" />
                  Date, Time &amp; Occurrence Schedule
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Event Start Date:</span>
                    <span className="font-extrabold text-slate-900">{details.start_date || details.startDate || eventData?.start_date || "Not Set"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Event End Date:</span>
                    <span className="font-extrabold text-slate-900">{details.end_date || details.endDate || details.start_date || "Not Set"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Start Time:</span>
                    <span className="font-bold text-slate-800">{formatTimeToAmPm(details.start_time || details.startTime || eventData?.start_time)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">End Time:</span>
                    <span className="font-bold text-slate-800">{formatTimeToAmPm(details.end_time || details.endTime || eventData?.end_time)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Event Recurrence:</span>
                    <span className="font-extrabold text-purple-700">{details.occurrence || details.event_type || "OneTime"}</span>
                  </div>
                </div>
              </Card>

              <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <MapPin size={16} className="text-purple-600" />
                  Venue Location &amp; Premises Setup
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Venue Name:</span>
                    <span className="font-extrabold text-slate-900">{details.venue || eventData?.venue || "Venue Setup"}</span>
                  </div>
                  <div className="py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Full Physical Address:</span>
                    <div className="font-semibold text-slate-800 mt-1 leading-relaxed">{details.address || eventData?.address || "Address not specified"}</div>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Total Venue Area:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {details.venue_total_area_sqft ? `${Number(details.venue_total_area_sqft).toLocaleString("en-IN")} sq.ft` : "Standard Setup"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Audience Visibility:</span>
                    <Badge className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">
                      {details.visibility || "Public"}
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ── TAB 2: TICKETS & CAPACITY ── */}
          {activeTab === "tickets" && (
            <div className="space-y-4">
              <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <IndianRupee size={16} className="text-purple-600" />
                  Ticketing, Pricing &amp; Registration Specs
                </h3>

                {/* 4 Stat Boxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 space-y-1">
                    <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Pass Fee</span>
                    <div className="text-2xl font-black text-purple-950">
                      {booking.charge_type === "Free" ? "FREE" : `₹${(booking.price_inr || booking.priceINR || details.price || 0).toLocaleString("en-IN")}`}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Charge Type</span>
                    <div className="text-xl font-extrabold text-slate-900">{booking.charge_type || booking.chargeType || "Paid"}</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Capacity</span>
                    <div className="text-xl font-extrabold text-slate-900">{booking.capacity || booking.totalCapacity || details.totalCapacity || 500} Passes</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Passes Sold</span>
                    <div className="text-xl font-extrabold text-slate-900">{individualStats.passes_sold || booking.passesSold || details.passesSold || 0} Sold</div>
                  </div>
                </div>

                {/* Detailed Ticket Rules Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Pass Type</span>
                    <div className="font-extrabold text-slate-900 text-sm">{booking.pass_type || "Single Pass"}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Entry Type</span>
                    <div className="font-extrabold text-slate-900 text-sm">{booking.entry_type || "Single Entry"}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Max Re-Entries Allowed</span>
                    <div className="font-extrabold text-slate-900 text-sm">{booking.max_reentries || "Unlimited"}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Max Passes per Booking</span>
                    <div className="font-extrabold text-slate-900 text-sm">{booking.max_pass || 5} Passes</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Group Member Limit</span>
                    <div className="font-extrabold text-slate-900 text-sm">{booking.group_member_limit || 5} Members</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Pricing Currency</span>
                    <div className="font-extrabold text-slate-900 text-sm">{booking.currency || "INR"} ({booking.price_type || "National"})</div>
                  </div>
                </div>

                {/* Booking Window & Taxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
                    <span className="text-[11px] font-extrabold text-purple-700 uppercase flex items-center gap-1">
                      <Clock size={13} />
                      <span>Registration Window</span>
                    </span>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Booking Opens:</span>
                        <span className="font-bold text-slate-800">{booking.booking_start_date || details.start_date || "Immediate"} {booking.booking_start_time ? `(${formatTimeToAmPm(booking.booking_start_time)})` : ""}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Booking Closes:</span>
                        <span className="font-bold text-slate-800">{booking.booking_end_date || details.end_date || "Event Date"} {booking.booking_end_time ? `(${formatTimeToAmPm(booking.booking_end_time)})` : ""}</span>
                      </div>
                      {booking.early_bird_expire && (
                        <div className="flex justify-between text-amber-700 font-bold pt-1 border-t border-slate-200/50">
                          <span>Early Bird Ends:</span>
                          <span>{booking.early_bird_expire}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
                    <span className="text-[11px] font-extrabold text-purple-700 uppercase flex items-center gap-1">
                      <BadgePercent size={13} />
                      <span>Tax &amp; Invoice Configuration</span>
                    </span>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tax Inclusion:</span>
                        <span className="font-bold text-slate-800">{booking.include_tax ? "Price Includes Taxes" : "Tax Added at Checkout"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Applied Taxes:</span>
                        <span className="font-bold text-slate-800">
                          {bookingTaxes.length > 0 ? bookingTaxes.join(", ") : "No extra taxes applied"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ── TAB 3: STALLS & LAYOUT ── */}
          {activeTab === "stalls" && (
            <div className="space-y-4">
              <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Store size={16} className="text-purple-600" />
                    Exhibition Stalls &amp; Commercial Booth Inventory
                  </h3>
                  <Badge className="bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold">
                    {stallList.reduce((sum, s) => sum + (parseInt(s.quantity || s.stallQty || s.qty || 1, 10) || 1), 0)} Total Units / {stallList.length} Types
                  </Badge>
                </div>

                {/* Layout Specs Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                    <span className="text-slate-400 font-bold text-[10px] uppercase">Overall Space</span>
                    <div className="font-black text-slate-900 text-sm mt-0.5">
                      {(layout.overall_space_sqft || 0) > 0 ? `${Number(layout.overall_space_sqft).toLocaleString("en-IN")} sq.ft` : "Open Layout"}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                    <span className="text-slate-400 font-bold text-[10px] uppercase">Floor Structure</span>
                    <div className="font-black text-slate-900 text-sm mt-0.5">{layout.floor_type || "Stall"}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                    <span className="text-slate-400 font-bold text-[10px] uppercase">Day-Based Pricing</span>
                    <div className="font-black text-slate-900 text-sm mt-0.5">{layout.day_based ? "YES" : "NO"}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                    <span className="text-slate-400 font-bold text-[10px] uppercase">Person Passes / Stall</span>
                    <div className="font-black text-slate-900 text-sm mt-0.5">{layout.person_pass || 2} Passes</div>
                  </div>
                </div>

                {/* Configured Stalls Table */}
                {stallList.length === 0 ? (
                  <div className="p-8 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 font-medium space-y-1">
                    <Store size={24} className="mx-auto text-slate-300" />
                    <p className="font-bold text-slate-600">No individual stalls configured</p>
                    <p>This event does not feature commercial exhibitor stalls or booth reservations.</p>
                  </div>
                ) : (
                  <div className="responsive-table-wrap border border-slate-200/80 rounded-xl overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Stall Name</th>
                          <th className="p-3">Size / Dimensions</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Base Price</th>
                          <th className="p-3">Prime Location?</th>
                          <th className="p-3">Visibility</th>
                          <th className="p-3 text-right">Qty</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {stallList.map((st, idx) => {
                          const sPrice = parseFloat(st.price_inr) || 0;
                          const pPrice = parseFloat(st.prime_price_inr) || 0;
                          return (
                            <tr key={idx} className="hover:bg-slate-50 transition">
                              <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                                <Store size={14} className="text-purple-600 shrink-0" />
                                <span>{st.stall_name || `Stall #${idx + 1}`}</span>
                              </td>
                              <td className="p-3 text-slate-700 font-medium">{st.stall_size || st.size_range || "Standard"}</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                  {st.stall_type || "Standard"}
                                </span>
                              </td>
                              <td className="p-3 font-extrabold text-slate-900">
                                {sPrice > 0 ? `₹${sPrice.toLocaleString("en-IN")}` : "Free"}
                              </td>
                              <td className="p-3">
                                {st.prime_seat ? (
                                  <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] font-black">
                                    PRIME (+₹{pPrice.toLocaleString("en-IN")})
                                  </Badge>
                                ) : (
                                  <span className="text-slate-400 font-bold text-[11px]">Regular</span>
                                )}
                              </td>
                              <td className="p-3">
                                <span className="text-slate-600 font-semibold">{st.visibility || "Public"}</span>
                              </td>
                              <td className="p-3 text-right font-black text-purple-700">{st.quantity || st.stallQty || st.qty || 1}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              {/* Stall Amenities Breakdown Card */}
              {stallAmenityNames.length > 0 && (
                <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles size={16} className="text-purple-600" />
                      Requested Stall Amenities &amp; Fixtures
                    </h3>
                    <Badge className="bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold">
                      {stallAmenityNames.length} Stall Groups
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stallAmenityNames.map((sName, idx) => {
                      const items = groupedStallAmenities[sName] || [];
                      return (
                        <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                            <div className="flex items-center gap-2">
                              <Store size={16} className="text-purple-600" />
                              <h4 className="font-extrabold text-slate-900 text-sm">{sName}</h4>
                            </div>
                            <Badge className="bg-purple-600 text-white text-[10px] border-none font-bold">
                              {items.length} Fixtures
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {items.map((item, iIdx) => (
                              <div key={iIdx} className="p-2.5 bg-white rounded-xl border border-slate-200/70 flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-700">{item.amenity || "Amenity"}</span>
                                <span className="font-mono font-black text-purple-700 px-2 py-0.5 bg-purple-50 rounded-md">
                                  Qty: {item.qty || 1}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* ── TAB 4: FOOD PROVISION ── */}
          {activeTab === "food" && (
            <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Utensils size={16} className="text-purple-600" />
                  Food &amp; Catering Provision Details
                </h3>
                <Badge className={hasFood ? "bg-emerald-100 text-emerald-800 border-none font-bold text-xs" : "bg-slate-200 text-slate-600 border-none font-bold text-xs"}>
                  {hasFood ? "FOOD INCLUDED" : "NOT CONFIGURED"}
                </Badge>
              </div>

              {!hasFood ? (
                <div className="p-8 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 font-medium space-y-1">
                  <Utensils size={24} className="mx-auto text-slate-300" />
                  <p className="font-bold text-slate-600">No food catering provision configured</p>
                  <p>The organizer did not configure meal passes or caterer menus for this event.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Caterer Overview Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-100">
                      <span className="text-[10px] font-bold text-purple-600 uppercase">Caterer Agency</span>
                      <div className="text-base font-black text-purple-950 mt-0.5">
                        {foodProvision.caterer_name || foodItemsList[0]?.caterer_name || "Assigned Caterer"}
                      </div>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Meal Type</span>
                      <div className="text-base font-black text-slate-900 mt-0.5">
                        {foodProvision.meal_type || foodItemsList[0]?.meal_type || "Full Day"}
                      </div>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Dietary Type</span>
                      <div className="text-base font-black text-slate-900 mt-0.5">
                        {foodProvision.food_type || foodItemsList[0]?.food_type || "Veg & Non-Veg"}
                      </div>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Pass Rate / Price</span>
                      <div className="text-base font-black text-emerald-700 mt-0.5">
                        ₹{(foodProvision.price_inr || foodItemsList[0]?.price_inr || 0).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>

                  {/* Menu Description */}
                  {(foodProvision.menu_details || foodItemsList[0]?.menu_details) && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs">
                      <span className="font-extrabold text-slate-500 uppercase text-[10px]">Caterer Menu Details</span>
                      <p className="font-semibold text-slate-800 leading-relaxed">
                        {foodProvision.menu_details || foodItemsList[0]?.menu_details}
                      </p>
                    </div>
                  )}

                  {/* Food Items List Table */}
                  {foodItemsList.length > 0 && (
                    <div className="responsive-table-wrap border border-slate-200/80 rounded-xl overflow-x-auto">
                      <table className="w-full min-w-[600px] text-left text-xs border-collapse">
                        <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="p-3">Meal Item / Service</th>
                            <th className="p-3">Meal Timing</th>
                            <th className="p-3">Diet Type</th>
                            <th className="p-3">Menu Notes</th>
                            <th className="p-3 text-right">Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {foodItemsList.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition">
                              <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                                <Utensils size={14} className="text-purple-600 shrink-0" />
                                <span>{item.caterer_name || `Meal Plan #${idx + 1}`}</span>
                              </td>
                              <td className="p-3 text-slate-700 font-semibold">{item.meal_type || "Lunch"}</td>
                              <td className="p-3">
                                <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                  {item.food_type || "Veg"}
                                </Badge>
                              </td>
                              <td className="p-3 text-slate-600">{item.menu_details || "Standard Service"}</td>
                              <td className="p-3 text-right font-black text-slate-900">
                                ₹{(item.price_inr || 0).toLocaleString("en-IN")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* ── TAB 5: VEHICLE PASSES ── */}
          {activeTab === "vehicles" && (
            <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Car size={16} className="text-purple-600" />
                  Vehicle Parking Passes &amp; Valet Addons
                </h3>
                <Badge className={hasVehicle ? "bg-emerald-100 text-emerald-800 border-none font-bold text-xs" : "bg-slate-200 text-slate-600 border-none font-bold text-xs"}>
                  {hasVehicle ? "PARKING ACTIVE" : "NOT CONFIGURED"}
                </Badge>
              </div>

              {!hasVehicle ? (
                <div className="p-8 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 font-medium space-y-1">
                  <Car size={24} className="mx-auto text-slate-300" />
                  <p className="font-bold text-slate-600">No vehicle parking passes configured</p>
                  <p>Attendees and visitors do not require dedicated parking passes for this event.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Vehicle Passes Table */}
                  <div className="space-y-2">
                    <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                      Configured Vehicle Categories &amp; Pass Fees
                    </span>
                    <div className="responsive-table-wrap border border-slate-200/80 rounded-xl overflow-x-auto">
                      <table className="w-full min-w-[500px] text-left text-xs border-collapse">
                        <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="p-3">Vehicle Type</th>
                            <th className="p-3 text-right">Parking Pass Fee</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {vehicleList.map((vh, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition">
                              <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                                <Car size={14} className="text-purple-600 shrink-0" />
                                <span>{vh.vehicle_type || `Vehicle Pass #${idx + 1}`}</span>
                              </td>
                              <td className="p-3 text-right font-black text-slate-900">
                                ₹{(vh.price_inr || 0).toLocaleString("en-IN")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Addons List */}
                  {addonList.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                        Parking Addons &amp; Valet Services
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {addonList.map((ad, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                            <div className="space-y-0.5">
                              <span className="font-extrabold text-slate-900 block">{ad.addon_name || `Addon #${idx + 1}`}</span>
                              {ad.is_parent && <span className="text-[10px] font-bold text-purple-600">Primary Service</span>}
                            </div>
                            <Badge className="bg-purple-600 text-white font-mono font-bold text-[11px]">
                              ₹{(ad.price || 0).toLocaleString("en-IN")}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* ── TAB 6: AGENDAS & PROGRAMS ── */}
          {activeTab === "programs" && (
            <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers size={16} className="text-purple-600" />
                  Scheduled Agendas &amp; Program Sessions
                </h3>
                <Badge className="bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold">
                  {programList.length} Sessions
                </Badge>
              </div>

              {programList.length === 0 ? (
                <div className="p-8 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 font-medium space-y-1">
                  <Layers size={24} className="mx-auto text-slate-300" />
                  <p className="font-bold text-slate-600">No scheduled program sessions uploaded</p>
                  <p>Detailed time-block agenda items were not attached to this event registration.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {programList.map((pg, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                        <div className="font-extrabold text-slate-900 text-sm">{pg.program_name}</div>
                        <Badge className="bg-purple-100 text-purple-800 text-[10px] font-bold">{pg.category || "Keynote"}</Badge>
                      </div>
                      <div className="space-y-1 text-slate-600">
                        {pg.venue && <div>Hall/Stage: <span className="font-bold text-slate-800">{pg.venue}</span></div>}
                        {pg.start_date && <div>Start: <span className="font-bold text-slate-800">{pg.start_date}</span></div>}
                        {pg.coordinator_name && <div>Coordinator: <span className="font-bold text-purple-700">{pg.coordinator_name}</span></div>}
                        {pg.description && <p className="pt-1 text-slate-700">{pg.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* ── TAB 7: UPLOADED DOCUMENTS ONLY ── */}
          {activeTab === "documents" && (
            <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileCheck size={16} className="text-purple-600" />
                  Uploaded Verification Documents &amp; Permission Letters
                </h3>
                <Badge className="bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold">
                  {docList.length} Files Attached
                </Badge>
              </div>

              {docList.length === 0 ? (
                <div className="p-8 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 font-medium space-y-1">
                  <FileText size={24} className="mx-auto text-slate-300" />
                  <p className="font-bold text-slate-600">No additional verification documents attached</p>
                  <p>The organizer did not upload extra GST, PAN, or Municipal approval attachments.</p>
                </div>
              ) : (
                <div className="responsive-table-wrap border border-slate-200/80 rounded-xl overflow-x-auto">
                  <table className="w-full min-w-[500px] text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Document Title / File Name</th>
                        <th className="p-3">Doc Category</th>
                        <th className="p-3">Reference #</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {docList.map((doc, idx) => {
                        const rawPath = doc.file_url || doc.file_path || doc.preview || doc.url;
                        const fileUrl = getFullDocUrl(rawPath);
                        const docName = doc.file_name || doc.name || `Document #${idx + 1}`;
                        const docType = doc.doc_type || doc.type || doc.file_type || "Verification Document";
                        const docNumber = doc.doc_number || doc.document_number || "—";

                        return (
                          <tr key={idx} className="hover:bg-slate-50 transition">
                            <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                              <FileText size={15} className="text-purple-600 shrink-0" />
                              <span className="truncate max-w-[280px]">{docName}</span>
                            </td>
                            <td className="p-3">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-100 text-purple-800 border border-purple-200">
                                {docType}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-slate-600 font-bold">{docNumber}</td>
                            <td className="p-3 text-right">
                              {fileUrl ? (
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 hover:border-purple-300 hover:text-purple-700 text-slate-700 rounded-lg text-[11px] font-extrabold shadow-2xs transition"
                                >
                                  <ExternalLink size={12} />
                                  <span>Open Document</span>
                                </a>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400">File Path Missing</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* ── TAB 8: COMPLIANCE TOGGLES ── */}
          {activeTab === "compliance" && (
            <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <ShieldCheck size={16} className="text-purple-600" />
                Attendee Entry &amp; Registration Verification Compliance (14 Toggles)
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {[
                  { label: "Aadhar ID Proof", val: details.aadhar || eventData?.aadhar, icon: ShieldCheck },
                  { label: "Passport Verification", val: details.passport || eventData?.passport, icon: ShieldCheck },
                  { label: "International Attendee", val: details.is_international_include, icon: Compass },
                  { label: "Single Day Pass Allowed", val: details.day_pass, icon: Calendar },
                  { label: "Visitor Photo Verification", val: details.visitor_photo || details.visitorPhoto || eventData?.visitor_photo, icon: ImageIcon },
                  { label: "Visitor Full Name", val: details.visitor_name || details.visitorName || eventData?.visitor_name, icon: UserCheck },
                  { label: "Visitor Mobile Verified", val: details.visitor_mobile || details.visitorMobile || eventData?.visitor_mobile, icon: Phone },
                  { label: "Visitor Email Delivery", val: details.visitor_mail || details.visitorMail || eventData?.visitor_mail, icon: Mail },
                  { label: "Government Document Proof", val: details.document_proof || details.documentProof || eventData?.document_proof, icon: FileText },
                  { label: "Welcome Kit Included", val: details.welcome_kit || details.welcomeKit || eventData?.welcome_kit, icon: Gift },
                  { label: "Food Pass Allocation", val: details.food || eventData?.food, icon: Utensils },
                  { label: "Vehicle Pass Allocation", val: details.vehicle_pass || details.vehiclePass || eventData?.vehicle_pass, icon: Car },
                  { label: "Vehicle Number Plate", val: details.vehicle_number || details.vehicleNumber || eventData?.vehicle_number, icon: Car },
                  { label: "Physical Badge Print", val: details.print, icon: Printer },
                ].map((item, idx) => {
                  const IconComp = item.icon;
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <IconComp size={13} className="text-slate-400" />
                        <span>{item.label}</span>
                      </span>
                      {item.val ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-none font-extrabold text-[10px]">YES</Badge>
                      ) : (
                        <Badge className="bg-slate-200 text-slate-600 border-none font-extrabold text-[10px]">NO</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* ── TAB 9: CHIEF GUESTS & KEYNOTE SPEAKERS ── */}
          {activeTab === "guests" && (
            <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Crown size={16} className="text-amber-500" />
                  Chief Guests, Keynote Speakers &amp; VIP Profile Cards
                </h3>
                <Badge className="bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold">
                  {guestList.length} VIP Guests
                </Badge>
              </div>

              {guestList.length === 0 ? (
                <div className="p-8 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 font-medium space-y-1">
                  <Users size={24} className="mx-auto text-slate-300" />
                  <p className="font-bold text-slate-600">No chief guests or VIP speakers added</p>
                  <p>The organizer did not submit guest profile cards for this event.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {guestList.map((g, idx) => {
                    const guestName = g.guest_name || g.name || g.guestName || `VIP Guest #${idx + 1}`;
                    const designation = g.designation || g.role || g.title || "Keynote Speaker";
                    const contactInfo = g.contact || g.phone || g.email || "N/A";
                    const avatarUrl = g.image || g.photo || g.avatar;

                    return (
                      <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-3 hover:bg-slate-100/60 transition">
                        {avatarUrl ? (
                          <img
                            src={getFullDocUrl(avatarUrl)}
                            alt={guestName}
                            className="w-14 h-14 rounded-full object-cover border-2 border-purple-300 shadow-xs shrink-0"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold border-2 border-purple-200 shrink-0">
                            <User size={24} />
                          </div>
                        )}

                        <div className="space-y-1 overflow-hidden">
                          <h4 className="font-black text-slate-900 text-sm truncate">{guestName}</h4>
                          <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-extrabold rounded-md uppercase border border-purple-200">
                            {designation}
                          </span>
                          {contactInfo && contactInfo !== "N/A" && (
                            <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1 pt-0.5">
                              <Phone size={10} className="text-slate-400 shrink-0" />
                              <span className="truncate">{contactInfo}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          {/* ── TAB 10: VENDORS, SPONSORS & POLICIES ── */}
          {activeTab === "network" && (
            <div className="space-y-4">
              
              {/* Assigned Vendors Card */}
              <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase size={16} className="text-purple-600" />
                    Assigned Vendors &amp; Service Partners
                  </h3>
                  <Badge className="bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold">
                    {vendorList.length} Vendors
                  </Badge>
                </div>

                {vendorList.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-400 text-center font-medium">
                    No dedicated service vendors assigned to this event.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {vendorList.map((v, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs">{v.vendor_name || v.vendorName}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{v.vendor_type || v.vendorType || "Service Vendor"}</div>
                        </div>
                        <Badge className="bg-purple-600 text-white border-none text-[10px]">
                          {v.pass_count || v.passCount || 1} Passes
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Partner Sponsors Card */}
              <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" />
                    Sponsor Partners &amp; Brand Collaborators
                  </h3>
                  <Badge className="bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold">
                    {sponsorList.length} Sponsors
                  </Badge>
                </div>

                {sponsorList.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-400 text-center font-medium">
                    No corporate sponsor partners attached to this event.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {sponsorList.map((sp, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs">{sp.sponsor_name || sp.sponsorName}</div>
                          <div className="text-[11px] text-amber-700 font-bold">{sp.sponsorship_type || sp.sponsorshipType || "Sponsor"}</div>
                        </div>
                        <Badge className="bg-amber-500 text-white border-none text-[10px]">PARTNER</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Policy Terms Card */}
              <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck size={16} className="text-purple-600" />
                    Cancellation, Refund &amp; Safety Terms Policies
                  </h3>
                  <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold">
                    {termList.length} Policies
                  </Badge>
                </div>

                {termList.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-400 text-center font-medium">
                    Standard statutory event compliance policies apply.
                  </div>
                ) : (
                  <div className="space-y-2.5 text-xs">
                    {termList.map((t, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-purple-700">{t.policy_name || t.policyName}</span>
                          {t.is_default && (
                            <Badge className="bg-purple-100 text-purple-800 text-[10px]">DEFAULT</Badge>
                          )}
                        </div>
                        <p className="text-slate-600 font-medium">{t.policy_type || t.policyType || t.policy_group || "General Event Policy"}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

            </div>
          )}

          {/* ── TAB 11: ORGANIZER PROFILE & VERIFICATION DETAILS ── */}
          {activeTab === "organizer" && (() => {
            const org = eventData?.organizer || details.organizer || {};
            const orgName = org.name || "Event Organizer";
            const orgEmail = org.email || "Email not specified";
            const orgMobile = org.mobile || "Mobile not specified";
            const orgCompany = org.company_name || org.organization_name || "Registered Event Organization";
            const orgKyc = (org.kyc_status || orgKycStatus || "VERIFIED").toUpperCase();
            const orgGstin = org.gstin || "Not Registered / Exempt";
            const orgPan = org.pan_number || "PAN On File";
            const orgAddress = org.address || `${details.venue || "Registered Office"}, ${org.city || "Chennai"}`;
            const orgCity = org.city || "Chennai";
            const orgState = org.state || "Tamil Nadu";
            const orgCountry = org.country || "India";
            const bankName = org.bank_name || "Settlement Bank";
            const ifsc = org.ifsc_code || "IFSC Available";
            const rawAccount = org.account_number || "XXXX XXXX 8942";
            const maskedAccount = rawAccount.length > 4 ? `•••• •••• ${rawAccount.slice(-4)}` : "•••• •••• 8942";

            return (
              <div className="space-y-4">
                {/* Executive Header Badge */}
                <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center font-black text-xl shadow-md shadow-purple-500/25">
                        {orgName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-slate-900">{orgName}</h3>
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold text-[10px] px-2 py-0.5 flex items-center gap-1">
                            <ShieldCheck size={12} className="text-emerald-600" />
                            <span>KYC {orgKyc}</span>
                          </Badge>
                        </div>
                        <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Building size={13} className="text-purple-600" />
                          <span>{orgCompany}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold self-start sm:self-auto">
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl border border-slate-200/80">
                        Status: <strong className="text-emerald-700 font-black">Active Host</strong>
                      </span>
                    </div>
                  </div>
                </Card>

                {/* 3 Comprehensive Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Card 1: Contact Representative */}
                  <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-3.5">
                    <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <UserCheck size={14} className="text-purple-600" />
                        <span>Representative Contact</span>
                      </h4>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 block">Full Name</span>
                        <span className="font-extrabold text-slate-800 text-sm">{orgName}</span>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 block">Official Email</span>
                        <a href={`mailto:${orgEmail}`} className="font-bold text-purple-700 hover:underline flex items-center gap-1 mt-0.5">
                          <Mail size={13} />
                          <span>{orgEmail}</span>
                        </a>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 block">Direct Mobile</span>
                        <a href={`tel:${orgMobile}`} className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Phone size={13} className="text-emerald-600" />
                          <span>{orgMobile}</span>
                        </a>
                      </div>
                    </div>
                  </Card>

                  {/* Card 2: Legal Entity & Compliance */}
                  <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-3.5">
                    <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase size={14} className="text-purple-600" />
                        <span>Business &amp; Legal Entity</span>
                      </h4>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 block">Company / Business Name</span>
                        <span className="font-extrabold text-slate-900">{orgCompany}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[11px] font-bold text-slate-400 block">GSTIN</span>
                          <span className="font-mono font-bold text-slate-800 text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200 block truncate">
                            {orgGstin}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-slate-400 block">PAN Card</span>
                          <span className="font-mono font-bold text-slate-800 text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200 block truncate">
                            {orgPan}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 block">Registered Address</span>
                        <p className="font-medium text-slate-700 leading-relaxed text-[11px] mt-0.5">
                          {orgAddress}, {orgCity}, {orgState}, {orgCountry}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Card 3: Payout Account & Settlements */}
                  <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-3.5">
                    <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <CreditCard size={14} className="text-purple-600" />
                        <span>Payout &amp; Banking Details</span>
                      </h4>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        Active Settlement
                      </Badge>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 block">Settlement Bank</span>
                        <span className="font-extrabold text-slate-900">{bankName}</span>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 block">IFSC Code</span>
                        <span className="font-mono font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-[11px]">
                          {ifsc}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 block">Bank Account</span>
                        <span className="font-mono font-bold text-slate-800 text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200 block">
                          {maskedAccount}
                        </span>
                      </div>
                    </div>
                  </Card>

                </div>
              </div>
            );
          })()}

        </div>
      )}
    </div>
  );
}
