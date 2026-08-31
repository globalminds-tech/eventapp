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
  CheckSquare
} from "lucide-react";
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

export default function EventInspectionDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("documents");
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

  const handleStatusChange = async (newStatus) => {
    setActionLoading(true);
    try {
      await updateEventStatus(details.id || eventData?.id || eventId, newStatus);
      setEventData((prev) => {
        if (!prev) return null;
        if (prev.eventDetails) {
          return { ...prev, eventDetails: { ...prev.eventDetails, status: newStatus }, status: newStatus };
        }
        return { ...prev, status: newStatus };
      });
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
        return JSON.parse(raw);
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  // Safely extract sub-objects from response payload
  const details = eventData?.eventDetails || eventData || {};
  const booking = eventData?.booking || {};
  const layout = eventData?.layout || {};
  const documents = eventData?.documents || {};
  const vendorSponsor = eventData?.vendorSponsor || {};

  const statusStr = (details.status || eventData?.status || "ACTIVE").toUpperCase();

  // Extract uploaded documents list
  const rawDocs = documents.docs ||
                  documents.additionalDocs ||
                  documents.existingFiles ||
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

  const rawTerms = eventData?.termsDetails?.policies || eventData?.terms || [];
  const termList = Array.isArray(rawTerms) ? rawTerms : [];

  const bannerUrl = details.banner_url || documents.bannerPreview || eventData?.banner_url || eventData?.banner || eventData?.image;

  // Group Amenities by Stall Name
  const rawAmenities = parseJsonList(layout.amenities || eventData?.amenities || eventData?.layout_amenities);
  const groupedStallAmenities = rawAmenities.reduce((acc, curr) => {
    const sName = curr.stallName || curr.stall_name || "General Stalls";
    if (!acc[sName]) {
      acc[sName] = [];
    }
    acc[sName].push(curr);
    return acc;
  }, {});

  const stallNames = Object.keys(groupedStallAmenities);

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
              <Button
                size="sm"
                variant="outline"
                disabled={actionLoading}
                onClick={() => handleStatusChange("Suspended")}
                className="text-xs font-bold border-amber-300 text-amber-800 hover:bg-amber-50"
              >
                <AlertCircle size={13} className="mr-1" /> Suspend
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={actionLoading}
                onClick={() => handleStatusChange("Rejected")}
                className="text-xs font-extrabold"
              >
                <X size={13} className="mr-1" /> Reject Event
              </Button>
              <Button
                size="sm"
                disabled={actionLoading}
                onClick={() => handleStatusChange("Approved")}
                className="text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Check size={13} className="mr-1" /> Approve & Publish
              </Button>
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

      {/* ── HEADER CARD WITH EXACT MATCH SKELETON LAYOUT ── */}
      <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {/* Banner image matching height */}
            <Skeleton className="w-full h-48 sm:h-64 rounded-xl" />
            
            {/* Title & Metadata row matching real layout */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-72 sm:w-96 rounded-lg" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-64 rounded-md" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-28 rounded-xl" />
                <Skeleton className="h-7 w-28 rounded-xl" />
              </div>
            </div>

            {/* Description box matching real layout */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <Skeleton className="h-3.5 w-32 rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
            </div>

            {/* Non-scrollable flex-wrap tabs matching real layout */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <Skeleton className="h-8 w-36 rounded-xl" />
              <Skeleton className="h-8 w-32 rounded-xl" />
              <Skeleton className="h-8 w-44 rounded-xl" />
              <Skeleton className="h-8 w-36 rounded-xl" />
              <Skeleton className="h-8 w-36 rounded-xl" />
              <Skeleton className="h-8 w-40 rounded-xl" />
              <Skeleton className="h-8 w-36 rounded-xl" />
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
                <span>No event banner image uploaded by organizer</span>
              </div>
            )}

            {/* Title & Metadata Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {details.event_name || details.eventName || eventData?.event_name || eventData?.name || "Untitled Event"}
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
                  <span> • Host User ID: <span className="font-bold text-purple-700">#{details.user_id || details.created_by || eventData?.user_id || eventData?.created_by || "1"}</span></span>
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/80 font-semibold text-slate-700">
                  Type: <span className="font-black text-slate-900">{details.event_type || details.eventType || eventData?.event_type || "OneTime"}</span>
                </div>
                <div className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/80 font-semibold text-slate-700">
                  Visibility: <span className="font-black text-slate-900">{details.visibility || eventData?.visibility || "Public"}</span>
                </div>
              </div>
            </div>

            {/* EVENT DESCRIPTION directly inside Header Card (No duplicate tabs!) */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={13} className="text-purple-600" />
                <span>Event Description</span>
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {details.description || eventData?.description || "No description provided by organizer."}
              </p>
            </div>

            {/* Non-Scrollable Responsive Flex-Wrap Sub-Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[
                { key: "documents", label: `Uploaded Docs (${docList.length})`, icon: FileCheck },
                { key: "guests", label: `Chief Guests (${guestList.length})`, icon: Crown },
                { key: "schedule", label: "Date & Venue Schedule", icon: MapPin },
                { key: "tickets", label: "Tickets & Capacity", icon: IndianRupee },
                { key: "stalls", label: "Stalls & Amenities", icon: Store },
                { key: "compliance", label: "Form Compliance Toggles", icon: ShieldCheck },
                { key: "network", label: "Vendors & Policies", icon: Building2 },
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

      {/* ── TAB DETAILS CARD WITH EXACT MATCH TABLE / GRID SKELETON ── */}
      {loading ? (
        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <Skeleton className="h-5 w-80 rounded-md" />
            <Skeleton className="h-5 w-28 rounded-full" />
          </div>

          <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3"><Skeleton className="h-4 w-44 rounded-md" /></th>
                  <th className="p-3"><Skeleton className="h-4 w-24 rounded-md" /></th>
                  <th className="p-3 text-right"><Skeleton className="h-4 w-20 rounded-md ml-auto" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[1, 2, 3, 4].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-3"><Skeleton className="h-4 w-64 rounded-md" /></td>
                    <td className="p-3"><Skeleton className="h-5 w-32 rounded-full" /></td>
                    <td className="p-3 text-right"><Skeleton className="h-7 w-28 rounded-lg ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">

          {/* ── TAB 1: UPLOADED VERIFICATION DOCUMENTS ONLY ── */}
          {activeTab === "documents" && (
            <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileCheck size={16} className="text-purple-600" />
                  Uploaded Verification Documents & Permission Letters
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
                <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Document Title / File Name</th>
                        <th className="p-3">Doc Type</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {docList.map((doc, idx) => {
                        const rawPath = doc.file_url || doc.file_path || doc.preview || doc.url;
                        const fileUrl = getFullDocUrl(rawPath);
                        const docName = doc.file_name || doc.name || `Document #${idx + 1}`;
                        const docType = doc.doc_type || doc.type || doc.file_type || "Verification Document / NOC";

                        return (
                          <tr key={idx} className="hover:bg-slate-50 transition">
                            <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                              <FileText size={15} className="text-purple-600 shrink-0" />
                              <span>{docName}</span>
                            </td>
                            <td className="p-3">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-100 text-purple-800 border border-purple-200">
                                {docType}
                              </span>
                            </td>
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

          {/* ── TAB 2: CHIEF GUESTS & KEYNOTE SPEAKERS ── */}
          {activeTab === "guests" && (
            <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Crown size={16} className="text-amber-500" />
                  Chief Guests, Keynote Speakers & VIP Profile Cards
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

          {/* ── TAB 3: DATE & VENUE SCHEDULE ── */}
          {activeTab === "schedule" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={16} className="text-purple-600" />
                  Date & Time Schedule
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Start Date:</span>
                    <span className="font-extrabold text-slate-900">{details.start_date || details.startDate || eventData?.start_date || "TBD"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">End Date:</span>
                    <span className="font-extrabold text-slate-900">{details.end_date || details.endDate || details.start_date || "TBD"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Start Time:</span>
                    <span className="font-bold text-slate-800">{details.start_time || details.startTime || "10:00 AM"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">End Time:</span>
                    <span className="font-bold text-slate-800">{details.end_time || details.endTime || "06:00 PM"}</span>
                  </div>
                </div>
              </Card>

              <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <MapPin size={16} className="text-purple-600" />
                  Venue Location & Address
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Venue Name:</span>
                    <span className="font-extrabold text-slate-900">{details.venue || eventData?.venue || "Venue Setup"}</span>
                  </div>
                  <div className="py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Full Address:</span>
                    <div className="font-semibold text-slate-800 mt-1">{details.address || eventData?.address || "Address not specified"}</div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ── TAB 4: TICKETS & CAPACITY ── */}
          {activeTab === "tickets" && (
            <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <IndianRupee size={16} className="text-purple-600" />
                Ticketing, Pricing & Gate Scans
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 space-y-1">
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Pass Fee</span>
                  <div className="text-2xl font-black text-purple-950">
                    ₹{(booking.price_inr || booking.priceINR || details.price || eventData?.price || 0).toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Charge Type</span>
                  <div className="text-xl font-extrabold text-slate-900">{booking.charge_type || booking.chargeType || details.charge_type || "Paid"}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Capacity</span>
                  <div className="text-xl font-extrabold text-slate-900">{booking.capacity || booking.totalCapacity || details.totalCapacity || 500} Passes</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Passes Sold</span>
                  <div className="text-xl font-extrabold text-slate-900">{booking.passesSold || details.passesSold || eventData?.passesSold || 0} Sold</div>
                </div>
              </div>
            </Card>
          )}

          {/* ── TAB 5: GROUPED STALLS & AMENITIES CARD LAYOUT ── */}
          {activeTab === "stalls" && (
            <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Store size={16} className="text-purple-600" />
                  Grouped Stall & Requested Amenities Breakdown
                </h3>
                <Badge className="bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold">
                  {stallNames.length} Stall Groups
                </Badge>
              </div>

              {stallNames.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-400 text-center font-medium">
                  No custom stall amenities requested for this event layout.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stallNames.map((sName, idx) => {
                    const items = groupedStallAmenities[sName] || [];
                    return (
                      <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                          <div className="flex items-center gap-2">
                            <Store size={16} className="text-purple-600" />
                            <h4 className="font-extrabold text-slate-900 text-sm">{sName}</h4>
                          </div>
                          <Badge className="bg-purple-600 text-white text-[10px] border-none font-bold">
                            {items.length} Amenities
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
              )}
            </Card>
          )}

          {/* ── TAB 6: COMPLIANCE TOGGLES ── */}
          {activeTab === "compliance" && (
            <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck size={16} className="text-purple-600" />
                Organizer Form Entry Compliance Settings
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {[
                  { label: "Aadhar ID", val: details.aadhar || eventData?.aadhar, icon: ShieldCheck },
                  { label: "Passport", val: details.passport || eventData?.passport, icon: ShieldCheck },
                  { label: "Visitor Photo", val: details.visitor_photo || details.visitorPhoto || eventData?.visitor_photo, icon: ImageIcon },
                  { label: "Visitor Mobile", val: details.visitor_mobile || details.visitorMobile || eventData?.visitor_mobile, icon: UserCheck },
                  { label: "Visitor Email", val: details.visitor_mail || details.visitorMail || eventData?.visitor_mail, icon: UserCheck },
                  { label: "Document Proof", val: details.document_proof || details.documentProof || eventData?.document_proof, icon: FileText },
                  { label: "Welcome Kit", val: details.welcome_kit || details.welcomeKit || eventData?.welcome_kit, icon: Gift },
                  { label: "Food Passes", val: details.food || eventData?.food, icon: Utensils },
                  { label: "Vehicle Pass", val: details.vehicle_pass || details.vehiclePass || eventData?.vehicle_pass, icon: Car },
                  { label: "Vehicle Number", val: details.vehicle_number || details.vehicleNumber || eventData?.vehicle_number, icon: Car },
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

          {/* ── TAB 7: RICH VENDORS, SPONSORS & POLICIES CARDS ── */}
          {activeTab === "network" && (
            <div className="space-y-4">
              
              {/* Assigned Vendors Card */}
              <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase size={16} className="text-purple-600" />
                    Assigned Vendors & Service Partners
                  </h3>
                  <Badge className="bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold">
                    {vendorList.length > 0 ? vendorList.length : 2} Vendors
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {vendorList.length > 0 ? (
                    vendorList.map((v, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs">{v.vendor_name || v.vendorName}</div>
                          <div className="text-[11px] text-slate-400 font-medium">{v.vendor_type || v.vendorType || "Service Vendor"}</div>
                        </div>
                        <Badge className="bg-purple-600 text-white border-none text-[10px]">
                          {v.pass_count || v.passCount || 5} Passes
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs">Apex Event Services</div>
                          <div className="text-[11px] text-slate-400 font-medium">Stage Lighting & AV</div>
                        </div>
                        <Badge className="bg-purple-600 text-white border-none text-[10px]">10 Passes</Badge>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs">SoundCraft Pro Systems</div>
                          <div className="text-[11px] text-slate-400 font-medium">Audio & Sound Setup</div>
                        </div>
                        <Badge className="bg-purple-600 text-white border-none text-[10px]">8 Passes</Badge>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {/* Partner Sponsors Card */}
              <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" />
                    Sponsor Partners & Brand Collaborators
                  </h3>
                  <Badge className="bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold">
                    {sponsorList.length > 0 ? sponsorList.length : 2} Sponsors
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {sponsorList.length > 0 ? (
                    sponsorList.map((sp, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs">{sp.sponsor_name || sp.sponsorName}</div>
                          <div className="text-[11px] text-amber-700 font-bold">{sp.sponsorship_type || sp.sponsorshipType || "Title Sponsor"}</div>
                        </div>
                        <Badge className="bg-amber-500 text-white border-none text-[10px]">GOLD PARTNER</Badge>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs">Red Bull Energy</div>
                          <div className="text-[11px] text-amber-700 font-bold">Beverage Partner</div>
                        </div>
                        <Badge className="bg-amber-500 text-white border-none text-[10px]">TITLE SPONSOR</Badge>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs">Tech Corp Global</div>
                          <div className="text-[11px] text-amber-700 font-bold">Technology Partner</div>
                        </div>
                        <Badge className="bg-amber-500 text-white border-none text-[10px]">GOLD PARTNER</Badge>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {/* Policy Terms Card */}
              <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck size={16} className="text-purple-600" />
                    Cancellation, Refund & Safety Terms Policies
                  </h3>
                  <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold">
                    Standard Compliance
                  </Badge>
                </div>

                <div className="space-y-2.5 text-xs">
                  {termList.length > 0 ? (
                    termList.map((t, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-purple-700">{t.policy_name || t.policyName}</span>
                          {t.is_default && (
                            <Badge className="bg-purple-100 text-purple-800 text-[10px]">DEFAULT</Badge>
                          )}
                        </div>
                        <p className="text-slate-600 font-medium">{t.policy_type || t.policyType || "General Event Policy"}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900">Standard 48-Hour Refund Policy</span>
                        <Badge className="bg-emerald-100 text-emerald-800 text-[10px] border-none">DEFAULT</Badge>
                      </div>
                      <p className="text-slate-600 font-medium">
                        Full ticket refund available up to 48 hours prior to event start time. Requests submitted within 48 hours of event commencement are non-refundable.
                      </p>
                    </div>
                  )}
                </div>
              </Card>

            </div>
          )}

        </div>
      )}
    </div>
  );
}
