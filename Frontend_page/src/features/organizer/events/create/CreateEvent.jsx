import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { completeEvent, updateEvent, uploadImage } from "@/Services/api";

import Step1EventIdentity from "./steps/Step1EventIdentity";
import Step2TicketsPricing from "./steps/Step2TicketsPricing";
import Step3FacilitiesLayout from "./steps/Step3FacilitiesLayout";
import Step3LayoutStall from "./steps/Step3Layout";
import Step4PartnersTerms from "./steps/Step4PartnersTerms";
import Step5Terms from "./steps/Step5Terms";

import ViewEvent from "./ViewEvent";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  DEMO_EVENT_DATA,
  parseExcelFile,
  downloadEventCreationSampleExcel
} from "@/Services/excelService";
import {
  Sparkles, FileSpreadsheet, Download, CheckCircle2,
  ArrowLeft, ChevronLeft, ChevronRight, Check,
  CalendarDays, Ticket, Settings2, Users, ScrollText,
  Eye, Pencil, AlertTriangle, Layers
} from "lucide-react";

const STEPS = [
  { label: "Event Identity", icon: CalendarDays },
  { label: "Tickets & Pricing", icon: Ticket },
  { label: "Facilities & Logistics", icon: Settings2 },
  { label: "Stall Layout", icon: Layers },
  { label: "Partners & Documents", icon: Users },
  { label: "Terms & Policies", icon: ScrollText },
];

const CreateEvent = ({ onBack, editData, isView }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: urlParamId } = useParams();
  const targetEventId = urlParamId || editData?.id || location.state?.eventData?.id || location.state?.eventId;
  const isEditRoute = location.pathname.includes("/EditEvent") || Boolean(editData) || Boolean(location.state?.mode === "edit");
  const isViewRoute = location.pathname.includes("/ViewEvent") || Boolean(isView) || Boolean(location.state?.isReadOnly);

  const initialReadOnly = isViewRoute && !isEditRoute;
  const initialEditAllowed = isEditRoute || Boolean(editData) || Boolean(targetEventId && !isViewRoute);

  const [step, setStep] = useState(1);
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isReadOnlyMode, setIsReadOnlyMode] = useState(initialReadOnly);
  const [isEditingAllowed, setIsEditingAllowed] = useState(initialEditAllowed);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/OrganizerHome");
    }
  };

  const Redexorganizer = useSelector((state) => state.user);
  const storedUser = {
    id: sessionStorage.getItem("userId"),
    name: sessionStorage.getItem("userName"),
  };
  const organizer = Redexorganizer?.id ? Redexorganizer : storedUser;

  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    if (popup.show) {
      const timer = setTimeout(() => setPopup({ show: false, message: "", type: "" }), 2500);
      return () => clearTimeout(timer);
    }
  }, [popup.show]);

  const normalizeInitialFormData = (raw) => {
    if (!raw) return null;
    const details = raw.details || raw.eventDetails || raw;
    const booking = raw.booking || raw;
    const rawPolicies = raw.termsDetails?.policies || raw.termsDetails?.terms || (Array.isArray(raw.terms) ? raw.terms : []) || (Array.isArray(raw.termsDetails) ? raw.termsDetails : []) || [];
    const normalizedPolicies = rawPolicies.map((p) => {
      if (typeof p === "string") {
        return { policyGroup: "General", policyType: "General Policy", policyName: p, description: p, isDefault: false };
      }
      return {
        policyGroup: p.policyGroup || p.policy_group || "General",
        policyType: p.policyType || p.policy_type || "General Policy",
        policyName: p.policyName || p.policy_name || p.name || "",
        description: p.description || p.details || p.policyName || p.policy_name || "",
        isDefault: Boolean(p.isDefault || p.is_default),
      };
    });

      const subCatVal = details.subCategory || details.sub_category || details.subcategory || raw.subCategory || raw.sub_category || raw.subcategory || "";
      return {
        eventDetails: {
          eventName: details.eventName || details.event_name || "",
          eventCode: details.eventCode || details.event_code || "",
          category: details.category || raw.category || "",
          subCategory: subCatVal,
          sub_category: subCatVal,
          subcategory: subCatVal,
        eventType: details.eventType || details.event_type || "OneTime",
        startDate: details.startDate || details.start_date || "",
        endDate: details.endDate || details.end_date || "",
        startTime: details.startTime || details.start_time || "",
        endTime: details.endTime || details.end_time || "",
        venue: details.venue || "",
        address: details.address || "",
        description: details.description || "",
        visibility: details.visibility || "Public",
        occurrence: details.occurrence || "",
        mail: details.mail ?? false,
        whatsapp: details.whatsapp ?? false,
        print: details.print ?? false,
        visitorMail: details.visitorMail ?? false,
        visitorName: details.visitorName ?? true,
        visitorPhoto: details.visitorPhoto ?? false,
        visitorMobile: details.visitorMobile ?? false,
        documentProof: details.documentProof ?? false,
        dayPass: details.dayPass ?? false,
        isInternationalInclude: details.isInternationalInclude ?? false,
        aadhar: details.aadhar ?? false,
        passport: details.passport ?? false,
        welcomeKit: details.welcomeKit ?? false,
        food: details.food ?? false,
        vehiclePass: details.vehiclePass ?? false,
        vehicleNumber: details.vehicleNumber ?? false,
        includeProgram: details.includeProgram ?? "No",
        amenities: details.amenities || "",
        tags: details.tags || "",
      },
      booking: {
        chargeType: booking.chargeType || booking.charge_type || "Free",
        priceINR: booking.priceINR ?? booking.price_inr ?? booking.price ?? booking.pass_fee ?? "",
        price: booking.price ?? booking.priceINR ?? booking.price_inr ?? booking.pass_fee ?? "",
        capacity: booking.capacity ?? booking.totalCapacity ?? booking.total_capacity ?? "",
        totalCapacity: booking.totalCapacity ?? booking.capacity ?? booking.total_capacity ?? "",
        maxPass: booking.maxPass ?? booking.max_pass ?? booking.maxPerUser ?? "",
        maxPerUser: booking.maxPerUser ?? booking.max_pass ?? booking.maxPass ?? "",
        passType: booking.passType || booking.pass_type || "Single Pass",
        entryType: booking.entryType || booking.entry_type || "Single Entry",
        titleType: booking.titleType || booking.title_type || "Editable",
        designationType: booking.designationType || booking.designation_type || "Editable",
        companyType: booking.companyType || booking.company_type || "Editable",
        currency: booking.currency || "",
        taxType: booking.taxType || "",
        bookingStartDate: booking.bookingStartDate || booking.booking_start_date || details.startDate || details.start_date || "",
        bookingEndDate: booking.bookingEndDate || booking.booking_end_date || details.endDate || details.end_date || "",
        bookingStartTime: booking.bookingStartTime || booking.booking_start_time || details.startTime || details.start_time || "",
        bookingEndTime: booking.bookingEndTime || booking.booking_end_time || details.endTime || details.end_time || "",
      },
      layout: {
        floorType: raw.layout?.floorType || raw.layout?.floor_type || raw.floor_type || "Stall",
        dayBased: Boolean(raw.layout?.dayBased || raw.layout?.day_based),
        personPass: raw.layout?.personPass || raw.layout?.person_pass || 1,
        includeTax: Boolean(raw.layout?.includeTax || raw.layout?.include_tax),
        taxes: raw.layout?.taxes || [],
        stalls: raw.layout?.stalls || raw.layout?.stallList || raw.stalls || [],
        amenities: Array.isArray(raw.layout?.amenities)
          ? raw.layout.amenities
          : Array.isArray(raw.amenities)
          ? raw.amenities
          : (typeof raw.amenities === "string" && raw.amenities.startsWith("["))
          ? JSON.parse(raw.amenities)
          : [],
      },
      foodProvision: {
        catererName: raw.foodProvision?.catererName || raw.food_items?.[0]?.caterer_name || "",
        mealType: raw.foodProvision?.mealType || raw.food_items?.[0]?.meal_type || "",
        foodType: raw.foodProvision?.foodType || raw.food_items?.[0]?.food_type || "",
        priceINR: raw.foodProvision?.priceINR || raw.food_items?.[0]?.price_inr || 0,
        menuDetails: raw.foodProvision?.menuDetails || raw.food_items?.[0]?.menu_details || "",
        items: raw.foodProvision?.items || raw.foodProvision?.foodItems || raw.food_items || raw.food || [],
        foodItems: raw.foodProvision?.foodItems || raw.foodProvision?.items || raw.food_items || raw.food || [],
        coupons: raw.foodProvision?.items || raw.food_items || raw.food || [],
      },
      vehicleProvision: {
        vehicleType: raw.vehicleProvision?.vehicleType || raw.vehicles?.[0]?.vehicle_type || "",
        priceINR: raw.vehicleProvision?.priceINR || raw.vehicles?.[0]?.price_inr || 0,
        details: raw.vehicleProvision?.details || raw.vehicleProvision?.vehicles || raw.vehicle_details || raw.vehicles || [],
        vehicles: raw.vehicleProvision?.vehicles || raw.vehicleProvision?.details || raw.vehicle_details || raw.vehicles || [],
        addons: raw.vehicleProvision?.addons || raw.vehicleProvision?.vehicle_addons || raw.vehicle_addons || raw.addons || [],
      },
      documents: {
        bannerPreview: raw.documents?.bannerPreview || raw.documents?.banner_url || raw.banner_url || raw.banner || raw.image || raw.files?.find((f) => f.file_type === "banner")?.file_path || "",
        bannerType: raw.documents?.bannerType || raw.documents?.banner_type || raw.files?.find((f) => f.file_type === "banner")?.doc_type || "image",
        existingFiles: raw.documents?.existingFiles || raw.files || [],
        additionalDocs: raw.documents?.additionalDocs || raw.documents?.docs || raw.files?.filter((f) => f.file_type === "document") || [],
      },
      terms: normalizedPolicies,
      termsDetails: { policies: normalizedPolicies },
      vendorSponsor: {
        vendors: raw.vendorSponsor?.vendors || raw.vendors || [],
        sponsors: (raw.vendorSponsor?.sponsors || raw.sponsors || []).map((s) => ({
          sponsorName: s.sponsorName || s.sponsor_name || s.name || "",
          sponsor_name: s.sponsor_name || s.sponsorName || s.name || "",
          sponsorship: s.sponsorship || s.sponsorshipType || s.sponsorship_type || "",
          sponsorshipType: s.sponsorshipType || s.sponsorship_type || s.sponsorship || "",
        })),
        guests: raw.vendorSponsor?.guests || raw.guests || [],
      },
    };
  };

  const initialRawData = editData || location.state?.eventData;
  const normalizedInitial = normalizeInitialFormData(initialRawData);

  const [formData, setFormData] = useState(
    normalizedInitial || {
      eventDetails: {
        eventName: "", eventCode: "", category: "", subCategory: "",
        eventType: "OneTime", startDate: "", endDate: "", startTime: "",
        endTime: "", venue: "", address: "", description: "", visibility: "Public", occurrence: "",
      },
      booking: {
        chargeType: "Free", priceINR: "", capacity: "", totalCapacity: "", maxPass: "", maxPerUser: "",
        passType: "Single Pass", entryType: "Single Entry",
        titleType: "Editable", designationType: "Editable", companyType: "Editable",
        currency: "", taxType: "", bookingStartDate: "", bookingEndDate: "",
        bookingStartTime: "", bookingEndTime: "",
      },
      layout: {},
      foodProvision: {},
      vehicleProvision: {},
      documents: { banner: null, bannerPreview: null, bannerType: null },
      termsDetails: { policies: [] },
      vendorSponsor: { vendors: [], sponsors: [], guests: [] },
    }
  );

  useEffect(() => {
    if (targetEventId) {
      fetchEventDetails(targetEventId);
    }
  }, [targetEventId]);

  const fetchEventDetails = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5001/superadmin/api/event-detail/${encodeURIComponent(id)}`);
      const data = res.data?.data || res.data;
      if (data) {
        const normalized = normalizeInitialFormData(data);
        if (normalized) {
          setFormData(normalized);
        }
      }
    } catch (err) {
      console.error("Failed to load event details:", err);
    }
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    parseExcelFile(
      file,
      (parsed) => {
        setFormData(parsed);
        setPopup({
          show: true,
          message: `📁 Imported "${parsed.eventDetails?.eventName || "Event"}" from Excel!`,
          type: "success",
        });
      },
      (errMsg) => {
        setPopup({ show: true, message: errMsg || "Failed to parse", type: "error" });
      }
    );
  };

  const isFormValid = () => {
    return Boolean(
      formData.eventDetails?.eventName &&
      formData.eventDetails?.startDate &&
      formData.eventDetails?.category
    );
  };

  const getValidationErrors = () => {
    const errs = [];
    if (!formData.eventDetails?.eventName) errs.push("Event Name");
    if (!formData.eventDetails?.category) errs.push("Category");
    if (!formData.eventDetails?.startDate) errs.push("Start Date");
    return errs;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      setShowErrors(true);
      setStep(1); // Go to step 1 to show errors
      setPopup({ show: true, message: "Please fill required fields in Event Identity", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const details = formData.eventDetails || {};
      const booking = formData.booking || {};
      const layout = formData.layout || {};
      const food = formData.foodProvision || {};
      const vehicle = formData.vehicleProvision || {};
      const docs = formData.documents || {};
      const terms = formData.termsDetails?.policies || (Array.isArray(formData.terms) ? formData.terms : []);
      const vs = formData.vendorSponsor || {};

      let finalBannerUrl = docs.bannerPreview || formData.banner_url || "";
      if (docs.bannerFile || (docs.banner && docs.banner instanceof File)) {
        try {
          const fileToUpload = docs.bannerFile || docs.banner;
          const bodyFormData = new FormData();
          bodyFormData.append("file", fileToUpload);
          const uploadRes = await uploadImage(bodyFormData);
          if (uploadRes?.url || uploadRes?.file_path) {
            finalBannerUrl = uploadRes.url || uploadRes.file_path;
          }
        } catch (uploadErr) {
          console.warn("Banner image upload note:", uploadErr);
        }
      }

      const payload = {
        eventDetails: {
          eventName: details.eventName || details.event_name || "",
          eventCode: details.eventCode || details.event_code || "",
          category: details.category || "",
          subCategory: details.subCategory || details.sub_category || "",
          eventType: details.eventType || details.event_type || "OneTime",
          occurrence: details.occurrence || "",
          startDate: details.startDate || details.start_date || "",
          endDate: details.endDate || details.end_date || "",
          startTime: details.startTime || details.start_time || "",
          endTime: details.endTime || details.end_time || "",
          venue: details.venue || "",
          address: details.address || "",
          description: details.description || "",
          visibility: details.visibility || "Public",
          mail: Boolean(details.mail),
          whatsapp: Boolean(details.whatsapp),
          print: Boolean(details.print),
          visitorMail: Boolean(details.visitorMail),
          visitorName: Boolean(details.visitorName),
          visitorPhoto: Boolean(details.visitorPhoto),
          visitorMobile: Boolean(details.visitorMobile),
          documentProof: Boolean(details.documentProof),
          dayPass: Boolean(details.dayPass),
          isInternationalInclude: Boolean(details.isInternationalInclude),
          aadhar: Boolean(details.aadhar),
          passport: Boolean(details.passport),
          welcomeKit: Boolean(details.welcomeKit),
          food: Boolean(details.food || (food.items && food.items.length > 0) || (food.foodItems && food.foodItems.length > 0) || food.catererName),
          vehiclePass: Boolean(details.vehiclePass || (vehicle.details && vehicle.details.length > 0) || (vehicle.vehicles && vehicle.vehicles.length > 0) || (vehicle.addons && vehicle.addons.length > 0)),
          vehicleNumber: Boolean(details.vehicleNumber),
          includeProgram: details.includeProgram || "No",
          amenities: details.amenities || "",
          tags: details.tags || "",
        },
        booking: {
          chargeType: booking.chargeType || booking.charge_type || "Free",
          priceINR: booking.priceINR ?? booking.price ?? booking.price_inr ?? "",
          price_inr: booking.priceINR ?? booking.price ?? booking.price_inr ?? "",
          capacity: booking.capacity ?? booking.totalCapacity ?? 500,
          totalCapacity: booking.totalCapacity ?? booking.capacity ?? 500,
          maxPass: booking.maxPass ?? booking.max_pass ?? 4,
          maxPerUser: booking.maxPerUser ?? booking.max_pass ?? 4,
          passType: booking.passType || "Single Pass",
          entryType: booking.entryType || "Single Entry",
          titleType: booking.titleType || "Editable",
          designationType: booking.designationType || "Editable",
          companyType: booking.companyType || "Editable",
          currency: booking.currency || "",
          taxType: booking.taxType || "",
          includeTax: Boolean(booking.includeTax),
          taxes: booking.taxes || [],
          bookingStartDate: booking.bookingStartDate || details.startDate || "",
          bookingEndDate: booking.bookingEndDate || details.endDate || "",
          bookingStartTime: booking.bookingStartTime || details.startTime || "09:00 AM",
          bookingEndTime: booking.bookingEndTime || details.endTime || "06:00 PM",
        },
        layout: {
          floorType: layout.floorType || "Stall",
          dayBased: Boolean(layout.dayBased),
          personPass: layout.personPass || 1,
          includeTax: Boolean(layout.includeTax),
          taxes: layout.taxes || [],
          stalls: layout.stalls || layout.stallList || [],
          amenities: layout.amenities || [],
        },
        foodProvision: {
          items: food.items || food.foodItems || (food.catererName ? [food] : []),
        },
        vehicleProvision: {
          details: vehicle.details || vehicle.vehicles || [],
          addons: vehicle.addons || vehicle.vehicle_addons || [],
        },
        documents: {
          bannerPreview: finalBannerUrl,
          bannerType: docs.bannerType || "image",
          additionalDocs: docs.additionalDocs || [],
        },
        termsDetails: {
          policies: terms,
        },
        vendorSponsor: {
          vendors: vs.vendors || (Array.isArray(formData.vendors) ? formData.vendors : []),
          sponsors: vs.sponsors || (Array.isArray(formData.sponsors) ? formData.sponsors : []),
          guests: vs.guests || formData.guests || [],
        },
        user_id: organizer?.id || 1,
      };
      if (targetEventId) {
        await updateEvent(targetEventId, payload);
        setPopup({ show: true, message: "🎉 Event Details Updated Successfully!", type: "success" });
      } else {
        await completeEvent(payload);
        setPopup({ show: true, message: "🎉 Event Published Successfully!", type: "success" });
      }
      setTimeout(() => { if (onBack) onBack(); }, 1500);
    } catch (err) {
      console.error(err);
      setPopup({
        show: true,
        message: err.response?.data?.error || err.response?.data?.detail || "Failed to save event!",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canEdit = !isReadOnlyMode || isEditingAllowed;

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Step1EventIdentity
            formData={formData}
            setFormData={(val) => { if (canEdit) setFormData(val); }}
            organizerId={organizer?.id}
            showErrors={showErrors}
            isReadOnly={!canEdit}
            isEditingAllowed={isEditingAllowed}
          />
        );
      case 2:
        return (
          <Step2TicketsPricing
            formData={formData}
            setFormData={(val) => { if (canEdit) setFormData(val); }}
            showErrors={showErrors}
            isReadOnly={!canEdit}
          />
        );
      case 3:
        return (
          <Step3FacilitiesLayout
            formData={formData}
            setFormData={(val) => { if (canEdit) setFormData(val); }}
            organizerId={organizer?.id}
            showErrors={showErrors}
            isReadOnly={!canEdit}
          />
        );
      case 4:
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-emerald-50 rounded-lg">
                <Layers className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Stall Layout & Configuration</h3>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <Step3LayoutStall
                formData={formData}
                setFormData={(val) => { if (canEdit) setFormData(val); }}
                showStep3Errors={showErrors}
              />
            </div>
          </div>
        );
      case 5:
        return (
          <Step4PartnersTerms
            formData={formData}
            setFormData={(val) => { if (canEdit) setFormData(val); }}
            isReadOnly={!canEdit}
            showErrors={showErrors}
          />
        );
      case 6:
        return (
          <Step5Terms
            formData={formData}
            setFormData={(val) => { if (canEdit) setFormData(val); }}
            isReadOnly={!canEdit}
          />
        );
      default:
        return null;
    }
  };

  if (isReadOnlyMode && !isEditingAllowed) {
    return (
      <ViewEvent
        formData={formData}
        onBack={handleBack}
        onEdit={() => {
          setIsEditingAllowed(true);
          setIsReadOnlyMode(false);
          setPopup({
            show: true,
            message: "✏️ Edit Mode Enabled! Operational fields unlocked for editing.",
            type: "success",
          });
        }}
      />
    );
  }

  return (
    <div className="space-y-3 pb-4 w-full max-w-7xl mx-auto select-none">
      {/* ── HEADER TOOLBAR ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs px-5 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleBack}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer border-none bg-transparent"
              title="Back to Dashboard">
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {isReadOnlyMode && !isEditingAllowed
                ? "View Event (Read-Only)"
                : isEditRoute || isEditingAllowed || editData || targetEventId
                ? "Edit Event"
                : "Create New Event"}
            </h1>
            <Badge className="bg-cyan-50 text-cyan-800 border-cyan-200 font-bold text-[10px]">
              6-Step Wizard
            </Badge>
            {isReadOnlyMode && !isEditingAllowed && (
              <Badge variant="secondary" className="font-semibold text-[10px] bg-amber-100 text-amber-800 border-amber-200">
                👁️ Read Only Mode
              </Badge>
            )}
            {(isEditingAllowed || isEditRoute || editData || targetEventId) && !isReadOnlyMode && (
              <Badge variant="secondary" className="font-semibold text-[10px] bg-emerald-100 text-emerald-800 border-emerald-200">
                ✏️ Edit Mode Active
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {isReadOnlyMode && !isEditingAllowed && (
              <button
                type="button"
                onClick={() => {
                  setIsEditingAllowed(true);
                  setIsReadOnlyMode(false);
                  setPopup({ show: true, message: "✏️ Edit Mode Enabled! Operational fields unlocked for editing.", type: "success" });
                }}
                className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-[11px] h-7 cursor-pointer border-none flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Pencil size={12} />
                <span>Enable Edit Mode</span>
              </button>
            )}
          </div>
        </div>

        {/* ── ACTIVE BOOKINGS WARNING ALERT ── */}
        {(formData.booking?.passesSold > 0 || formData.eventDetails?.passesSold > 0 || location.state?.eventData?.passesSold > 0) && (
          <div className="mt-3 bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-3.5 flex items-start gap-3 text-amber-950 shadow-sm animate-in fade-in">
            <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
              <AlertTriangle size={18} strokeWidth={2.5} />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-xs text-amber-950 flex items-center gap-2">
                <span>⚠️ Active Attendee Bookings Warning</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-[10px]">
                  {formData.booking?.passesSold || formData.eventDetails?.passesSold || location.state?.eventData?.passesSold || 420} Attendees Booked
                </span>
              </h4>
              <p className="text-[11px] font-semibold text-amber-900 leading-snug">
                <strong>{formData.booking?.passesSold || formData.eventDetails?.passesSold || location.state?.eventData?.passesSold || 420} attendees have already booked passes for this show.</strong> Modifying venue location, event start dates/times, or pass pricing may impact registered ticket holders and entry QR badges.
              </p>
            </div>
          </div>
        )}

        {/* ── STEPPER PROGRESS TRACKER ── */}
        <div className="mt-3 pt-2 border-t border-slate-100">
          <div className="relative flex items-center justify-between w-full max-w-3xl mx-auto">
            {/* Track Line */}
            <div className="absolute top-4 left-8 right-8 h-0.5 bg-slate-200 z-0" />
            <div
              className="absolute top-4 left-8 h-0.5 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 transition-all duration-500 z-0"
              style={{ width: `${((step - 1) / (STEPS.length - 1)) * 90}%` }}
            />

            {STEPS.map((s, idx) => {
              const isActive = step === idx + 1;
              const isCompleted = step > idx + 1;
              const StepIcon = s.icon;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setStep(idx + 1)}
                  className="relative z-10 flex flex-col items-center gap-1 group cursor-pointer border-none bg-transparent px-1"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white ring-4 ring-cyan-100 shadow-md scale-105"
                      : isCompleted
                      ? "bg-emerald-500 text-white shadow-xs"
                      : "bg-white border-2 border-slate-300 text-slate-400 hover:border-cyan-400"
                  }`}>
                    {isCompleted ? <Check size={14} strokeWidth={3} /> : <StepIcon size={14} strokeWidth={2.5} />}
                  </div>
                  <span className={`text-[10px] font-extrabold whitespace-nowrap transition-colors ${
                    isActive ? "text-cyan-700" : isCompleted ? "text-emerald-700" : "text-slate-400"
                  }`}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── FORM CONTENT CONTAINER ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        {/* ── TOP ACTION NAVIGATION BAR (No Scroll Required) ── */}
        <div className="pb-3 mb-4 border-b border-slate-100 flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => (step === 1 ? handleBack() : setStep(step - 1))}
            className="h-8 px-3 border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs cursor-pointer gap-1"
          >
            <ChevronLeft size={14} />
            <span>{step === 1 ? "Cancel" : "Previous"}</span>
          </Button>

          <span className="text-[11px] font-bold text-slate-400">
            Step <span className="text-slate-900">{step}</span> of <span className="text-slate-900">{STEPS.length}</span>
          </span>

          {step < STEPS.length ? (
            <Button
              size="sm"
              onClick={() => {
                if (step === 1) setShowErrors(true);
                setStep(step + 1);
              }}
              className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs h-8 px-4 rounded-xl shadow-xs border-none cursor-pointer gap-1"
            >
              <span>Next Step</span>
              <ChevronRight size={14} />
            </Button>
          ) : (
            !isView && (
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`h-8 px-5 font-bold text-xs rounded-xl border-none cursor-pointer transition-all ${
                  isSubmitting
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs shadow-emerald-500/20"
                }`}
              >
                <CheckCircle2 size={14} className="mr-1.5" />
                <span>
                  {isSubmitting
                    ? (isEditRoute || editData || targetEventId ? "Updating..." : "Publishing...")
                    : (isEditRoute || editData || targetEventId ? "Update Event" : "Publish Event")}
                </span>
              </Button>
            )
          )}
        </div>

        <fieldset disabled={isView} className={isView ? "opacity-90" : ""}>
          {renderStepContent()}
        </fieldset>

        {/* Validation Hint */}
        {showErrors && !isFormValid() && (
          <div className="mt-2 text-right">
            <span className="text-[11px] text-amber-600 font-semibold">
              ⚠ Missing: {getValidationErrors().join(", ")}
            </span>
          </div>
        )}
      </div>

      {/* ── POPUP NOTIFICATION ── */}
      {popup.show && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-2">
          <div className={`px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold text-white ${
            popup.type === "success" ? "bg-emerald-600" : "bg-rose-600"
          }`}>
            <span>{popup.message}</span>
            <button onClick={() => setPopup({ show: false, message: "", type: "" })}
              className="text-white hover:opacity-80 border-none bg-transparent cursor-pointer font-bold">✕</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateEvent;