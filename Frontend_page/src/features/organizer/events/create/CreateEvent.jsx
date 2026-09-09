import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { completeEvent, updateEvent, uploadImage, clearEventsCache } from "@/Services/api";
import { getAuthUserId } from "@/shared/services/authHelper";

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
  { label: "Partners & Guests", icon: Users },
  { label: "Policies & Documents", icon: ScrollText },
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
  const isSubmittingRef = useRef(false);

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
  const authUser = useSelector((state) => state.auth?.user);
  const currentOrganizerId = getAuthUserId(Redexorganizer) || getAuthUserId(authUser);
  const storedUser = {
    id: currentOrganizerId,
    name: Redexorganizer?.name || authUser?.name || sessionStorage.getItem("name") || localStorage.getItem("name") || "",
  };
  const organizer = { ...storedUser, ...(Redexorganizer?.id ? Redexorganizer : authUser) };

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
        mail: Boolean(details.mail),
        whatsapp: Boolean(details.whatsapp),
        print: Boolean(details.print),
        visitorMail: Boolean(details.visitorMail ?? details.visitor_mail ?? false),
        visitor_mail: Boolean(details.visitorMail ?? details.visitor_mail ?? false),
        visitorName: Boolean(details.visitorName ?? details.visitor_name ?? true),
        visitor_name: Boolean(details.visitorName ?? details.visitor_name ?? true),
        visitorPhoto: Boolean(details.visitorPhoto ?? details.visitor_photo ?? false),
        visitor_photo: Boolean(details.visitorPhoto ?? details.visitor_photo ?? false),
        visitorMobile: Boolean(details.visitorMobile ?? details.visitor_mobile ?? false),
        visitor_mobile: Boolean(details.visitorMobile ?? details.visitor_mobile ?? false),
        documentProof: Boolean(details.documentProof ?? details.document_proof ?? false),
        document_proof: Boolean(details.documentProof ?? details.document_proof ?? false),
        dayPass: Boolean(details.dayPass ?? details.day_pass ?? false),
        day_pass: Boolean(details.dayPass ?? details.day_pass ?? false),
        isInternationalInclude: Boolean(details.isInternationalInclude ?? details.is_international_include ?? false),
        is_international_include: Boolean(details.isInternationalInclude ?? details.is_international_include ?? false),
        aadhar: Boolean(details.aadhar),
        passport: Boolean(details.passport),
        welcomeKit: Boolean(details.welcomeKit ?? details.welcome_kit ?? false),
        welcome_kit: Boolean(details.welcomeKit ?? details.welcome_kit ?? false),
        food: Boolean(details.food || (raw.food_items && raw.food_items.length > 0) || (raw.foodProvision?.food_items && raw.foodProvision.food_items.length > 0) || (raw.food_provision?.food_items && raw.food_provision.food_items.length > 0)),
        vehiclePass: Boolean(details.vehiclePass ?? details.vehicle_pass ?? (raw.vehicles && raw.vehicles.length > 0) ?? (raw.vehicleProvision?.vehicles && raw.vehicleProvision.vehicles.length > 0) ?? (raw.vehicle_provision?.vehicles && raw.vehicle_provision.vehicles.length > 0) ?? false),
        vehicle_pass: Boolean(details.vehiclePass ?? details.vehicle_pass ?? (raw.vehicles && raw.vehicles.length > 0) ?? (raw.vehicleProvision?.vehicles && raw.vehicleProvision.vehicles.length > 0) ?? (raw.vehicle_provision?.vehicles && raw.vehicle_provision.vehicles.length > 0) ?? false),
        vehicleNumber: Boolean(details.vehicleNumber ?? details.vehicle_number ?? false),
        vehicle_number: Boolean(details.vehicleNumber ?? details.vehicle_number ?? false),
        includeProgram: details.includeProgram || details.include_program || "No",
        include_program: details.includeProgram || details.include_program || "No",
        amenities: details.amenities || "",
        tags: details.tags || "",
        venue_total_area_sqft: details.venue_total_area_sqft ?? details.venueTotalAreaSqFt ?? raw.venue_total_area_sqft ?? "",
      },
      booking: {
        chargeType: booking.charge_type || booking.chargeType || "Free",
        charge_type: booking.charge_type || booking.chargeType || "Free",
        priceINR: booking.price_inr ?? booking.priceINR ?? booking.price ?? booking.pass_fee ?? "",
        price_inr: booking.price_inr ?? booking.priceINR ?? booking.price ?? booking.pass_fee ?? "",
        price: booking.price_inr ?? booking.price ?? booking.priceINR ?? booking.pass_fee ?? "",
        capacity: booking.capacity ?? booking.totalCapacity ?? booking.total_capacity ?? "",
        totalCapacity: booking.capacity ?? booking.totalCapacity ?? booking.total_capacity ?? "",
        maxPass: booking.max_pass ?? booking.maxPass ?? booking.maxPerUser ?? "",
        max_pass: booking.max_pass ?? booking.maxPass ?? booking.maxPerUser ?? "",
        maxPerUser: booking.max_pass ?? booking.maxPerUser ?? booking.maxPass ?? "",
        passType: booking.pass_type || booking.passType || "Single Pass",
        pass_type: booking.pass_type || booking.passType || "Single Pass",
        groupMemberLimit: booking.group_member_limit ?? booking.groupMemberLimit ?? "5",
        group_member_limit: booking.group_member_limit ?? booking.groupMemberLimit ?? 5,
        entryType: booking.entry_type || booking.entryType || "Single Entry",
        entry_type: booking.entry_type || booking.entryType || "Single Entry",
        titleType: booking.title_type || booking.titleType || "Editable",
        title_type: booking.title_type || booking.titleType || "Editable",
        designationType: booking.designation_type || booking.designationType || "Editable",
        designation_type: booking.designation_type || booking.designationType || "Editable",
        companyType: booking.company_type || booking.companyType || "Editable",
        company_type: booking.company_type || booking.companyType || "Editable",
        currency: booking.currency || "",
        taxType: booking.taxType || "",
        bookingStartDate: booking.booking_start_date || booking.bookingStartDate || details.startDate || details.start_date || "",
        booking_start_date: booking.booking_start_date || booking.bookingStartDate || details.startDate || details.start_date || "",
        bookingEndDate: booking.booking_end_date || booking.bookingEndDate || details.endDate || details.end_date || "",
        booking_end_date: booking.booking_end_date || booking.bookingEndDate || details.endDate || details.end_date || "",
        bookingStartTime: booking.bookingStartTime || booking.booking_start_time || details.startTime || details.start_time || "",
        bookingEndTime: booking.bookingEndTime || booking.booking_end_time || details.endTime || details.end_time || "",
      },
      layout: {
        floorType: raw.layout?.floorType || raw.layout?.floor_type || raw.floor_type || "Stall",
        overallSpaceSqFt: raw.layout?.overall_space_sqft ?? raw.layout?.overallSpaceSqFt ?? details.venue_total_area_sqft ?? raw.venue_total_area_sqft ?? "",
        overall_space_sqft: raw.layout?.overall_space_sqft ?? raw.layout?.overallSpaceSqFt ?? details.venue_total_area_sqft ?? raw.venue_total_area_sqft ?? "",
        dayBased: Boolean(raw.layout?.dayBased || raw.layout?.day_based),
        personPass: raw.layout?.personPass || raw.layout?.person_pass || 1,
        includeTax: Boolean(raw.layout?.includeTax || raw.layout?.include_tax),
        taxes: raw.layout?.taxes || [],
        stalls: (raw.layout?.stalls || raw.layout?.stallList || raw.stalls || []).map((s) => ({
          ...s,
          stallName: s.stallName || s.stall_name || "",
          stall_name: s.stallName || s.stall_name || "",
          stallSize: s.stallSize || s.stall_size || s.size || "",
          stall_size: s.stallSize || s.stall_size || s.size || "",
          priceINR: s.priceINR ?? s.price_inr ?? s.price ?? "0",
          price_inr: s.price_inr ?? s.priceINR ?? s.price ?? "0",
          stallType: s.stallType || s.stall_type || "Paid",
          stall_type: s.stallType || s.stall_type || "Paid",
          primeSeat: Boolean(s.primeSeat ?? s.prime_seat),
          prime_seat: Boolean(s.primeSeat ?? s.prime_seat),
          primePriceINR: s.primePriceINR ?? s.prime_price_inr ?? "",
          prime_price_inr: s.prime_price_inr ?? s.primePriceINR ?? "",
        })),
        amenities: Array.isArray(raw.layout?.amenities)
          ? raw.layout.amenities
          : Array.isArray(raw.amenities)
          ? raw.amenities
          : (typeof raw.amenities === "string" && raw.amenities.startsWith("["))
          ? JSON.parse(raw.amenities)
          : [],
      },
      foodProvision: (() => {
        const rawFoodList = raw.foodProvision?.items || raw.foodProvision?.foodItems || raw.foodProvision?.food_items || raw.food_provision?.food_items || raw.food_items || raw.food || [];
        const normalizedFoodItems = (Array.isArray(rawFoodList) ? rawFoodList : []).map((fi) => ({
          catererName: fi.catererName || fi.caterer_name || "",
          caterer_name: fi.catererName || fi.caterer_name || "",
          mealType: fi.mealType || fi.meal_type || "Breakfast",
          meal_type: fi.mealType || fi.meal_type || "Breakfast",
          foodType: fi.foodType || fi.food_type || "Veg",
          food_type: fi.foodType || fi.food_type || "Veg",
          priceINR: fi.priceINR !== undefined ? String(fi.priceINR) : (fi.price_inr !== undefined ? String(fi.price_inr) : (fi.price !== undefined ? String(fi.price) : "0")),
          price_inr: fi.price_inr ?? fi.priceINR ?? fi.price ?? 0,
          menuDetails: fi.menuDetails || fi.menu_details || "",
          menu_details: fi.menuDetails || fi.menu_details || "",
        }));

        return {
          catererName: normalizedFoodItems[0]?.catererName || raw.foodProvision?.catererName || raw.food_provision?.caterer_name || "",
          mealType: normalizedFoodItems[0]?.mealType || raw.foodProvision?.mealType || raw.food_provision?.meal_type || "Breakfast",
          foodType: normalizedFoodItems[0]?.foodType || raw.foodProvision?.foodType || raw.food_provision?.food_type || "Veg",
          priceINR: normalizedFoodItems[0]?.priceINR || raw.foodProvision?.priceINR || raw.food_provision?.price_inr || 0,
          menuDetails: normalizedFoodItems[0]?.menuDetails || raw.foodProvision?.menuDetails || raw.food_provision?.menu_details || "",
          items: normalizedFoodItems,
          foodItems: normalizedFoodItems,
          coupons: normalizedFoodItems,
        };
      })(),
      vehicleProvision: (() => {
        const rawVehicles = raw.vehicleProvision?.details || raw.vehicleProvision?.vehicles || raw.vehicle_provision?.vehicles || raw.vehicle_details || raw.vehicles || [];
        const normalizedVehicles = (Array.isArray(rawVehicles) ? rawVehicles : []).map((v) => ({
          vehicleType: v.vehicleType || v.vehicle_type || "",
          vehicle_type: v.vehicleType || v.vehicle_type || "",
          priceINR: v.priceINR !== undefined ? String(v.priceINR) : (v.price_inr !== undefined ? String(v.price_inr) : (v.price !== undefined ? String(v.price) : "0")),
          price_inr: v.price_inr ?? v.priceINR ?? v.price ?? 0,
        }));

        const rawAddons = raw.vehicleProvision?.addons || raw.vehicleProvision?.vehicle_addons || raw.vehicle_provision?.addons || raw.vehicle_addons || raw.addons || [];
        const normalizedAddons = (Array.isArray(rawAddons) ? rawAddons : []).map((ad) => ({
          isParent: Boolean(ad.isParent ?? ad.is_parent ?? false),
          is_parent: Boolean(ad.isParent ?? ad.is_parent ?? false),
          addOnName: ad.addOnName || ad.addon_name || ad.name || "",
          addon_name: ad.addOnName || ad.addon_name || ad.name || "",
          name: ad.addOnName || ad.addon_name || ad.name || "",
          price: ad.price ?? ad.price_inr ?? ad.priceINR ?? 0,
          price_inr: ad.price ?? ad.price_inr ?? ad.priceINR ?? 0,
        }));

        return {
          vehicleType: normalizedVehicles[0]?.vehicleType || "",
          priceINR: normalizedVehicles[0]?.priceINR || 0,
          details: normalizedVehicles,
          vehicles: normalizedVehicles,
          addons: normalizedAddons,
          vehicle_addons: normalizedAddons,
        };
      })(),
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
        groupMemberLimit: "5", group_member_limit: 5,
        titleType: "Editable", designationType: "Editable", companyType: "Editable",
        currency: "", taxType: "", bookingStartDate: "", bookingEndDate: "",
        bookingStartTime: "", bookingEndTime: "",
      },
      layout: {
        overallSpaceSqFt: "",
        overall_space_sqft: "",
      },
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
    } else if (editData || location.state?.eventData) {
      const normalized = normalizeInitialFormData(editData || location.state?.eventData);
      if (normalized) {
        setFormData(normalized);
      }
    }
  }, [targetEventId, editData, location.state?.eventData]);

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
    if (isSubmittingRef.current) return;
    
    if (!isFormValid()) {
      setShowErrors(true);
      setStep(1); // Go to step 1 to show errors
      setPopup({ show: true, message: "Please fill required fields in Event Identity", type: "error" });
      return;
    }

    isSubmittingRef.current = true;
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
        event_name: details.eventName || details.event_name || "",
        event_code: details.eventCode || details.event_code || "",
        category: details.category || "",
        sub_category: details.subCategory || details.sub_category || "",
        event_type: details.eventType || details.event_type || "OneTime",
        start_date: details.startDate || details.start_date || "",
        end_date: details.endDate || details.end_date || "",
        start_time: details.startTime || details.start_time || "",
        end_time: details.endTime || details.end_time || "",
        venue: details.venue || "",
        address: details.address || "",
        description: details.description || "",
        visibility: details.visibility || "Public",
        banner_url: finalBannerUrl,

        eventDetails: {
          eventName: details.eventName || details.event_name || "",
          event_name: details.eventName || details.event_name || "",
          eventCode: details.eventCode || details.event_code || "",
          event_code: details.eventCode || details.event_code || "",
          category: details.category || "",
          subCategory: details.subCategory || details.sub_category || "",
          sub_category: details.subCategory || details.sub_category || "",
          eventType: details.eventType || details.event_type || "OneTime",
          event_type: details.eventType || details.event_type || "OneTime",
          occurrence: details.occurrence || "",
          startDate: details.startDate || details.start_date || "",
          start_date: details.startDate || details.start_date || "",
          endDate: details.endDate || details.end_date || "",
          end_date: details.endDate || details.end_date || "",
          startTime: details.startTime || details.start_time || "",
          start_time: details.startTime || details.start_time || "",
          endTime: details.endTime || details.end_time || "",
          end_time: details.endTime || details.end_time || "",
          venue: details.venue || "",
          address: details.address || "",
          description: details.description || "",
          visibility: details.visibility || "Public",
          mail: Boolean(details.mail),
          whatsapp: Boolean(details.whatsapp),
          print: Boolean(details.print),
          visitorMail: Boolean(details.visitorMail ?? details.visitor_mail),
          visitor_mail: Boolean(details.visitorMail ?? details.visitor_mail),
          visitorName: Boolean(details.visitorName ?? details.visitor_name),
          visitor_name: Boolean(details.visitorName ?? details.visitor_name),
          visitorPhoto: Boolean(details.visitorPhoto ?? details.visitor_photo),
          visitor_photo: Boolean(details.visitorPhoto ?? details.visitor_photo),
          visitorMobile: Boolean(details.visitorMobile ?? details.visitor_mobile),
          visitor_mobile: Boolean(details.visitorMobile ?? details.visitor_mobile),
          documentProof: Boolean(details.documentProof ?? details.document_proof),
          document_proof: Boolean(details.documentProof ?? details.document_proof),
          dayPass: Boolean(details.dayPass ?? details.day_pass),
          day_pass: Boolean(details.dayPass ?? details.day_pass),
          isInternationalInclude: Boolean(details.isInternationalInclude ?? details.is_international_include),
          is_international_include: Boolean(details.isInternationalInclude ?? details.is_international_include),
          aadhar: Boolean(details.aadhar),
          passport: Boolean(details.passport),
          welcomeKit: Boolean(details.welcomeKit ?? details.welcome_kit),
          welcome_kit: Boolean(details.welcomeKit ?? details.welcome_kit),
          food: Boolean(details.food || (food.items && food.items.length > 0) || (food.foodItems && food.foodItems.length > 0) || food.catererName),
          vehiclePass: Boolean(details.vehiclePass || details.vehicle_pass || (vehicle.details && vehicle.details.length > 0) || (vehicle.vehicles && vehicle.vehicles.length > 0) || (vehicle.addons && vehicle.addons.length > 0)),
          vehicle_pass: Boolean(details.vehiclePass || details.vehicle_pass || (vehicle.details && vehicle.details.length > 0) || (vehicle.vehicles && vehicle.vehicles.length > 0) || (vehicle.addons && vehicle.addons.length > 0)),
          vehicleNumber: Boolean(details.vehicleNumber ?? details.vehicle_number),
          vehicle_number: Boolean(details.vehicleNumber ?? details.vehicle_number),
          includeProgram: details.includeProgram || details.include_program || "No",
          include_program: details.includeProgram || details.include_program || "No",
          amenities: details.amenities || "",
          tags: details.tags || "",
          venue_total_area_sqft: details.venue_total_area_sqft || layout.overallSpaceSqFt || null,
        },
        booking: {
          chargeType: booking.charge_type || booking.chargeType || "Free",
          charge_type: booking.charge_type || booking.chargeType || "Free",
          priceINR: booking.price_inr ?? booking.priceINR ?? booking.price ?? "",
          price_inr: booking.price_inr ?? booking.priceINR ?? booking.price ?? "",
          capacity: booking.capacity ?? booking.totalCapacity ?? 500,
          totalCapacity: booking.capacity ?? booking.totalCapacity ?? 500,
          maxPass: booking.max_pass ?? booking.maxPass ?? 4,
          max_pass: booking.max_pass ?? booking.maxPass ?? 4,
          maxPerUser: booking.max_pass ?? booking.maxPerUser ?? 4,
          passType: booking.pass_type || booking.passType || "Single Pass",
          pass_type: booking.pass_type || booking.passType || "Single Pass",
          groupMemberLimit: booking.groupMemberLimit || booking.group_member_limit || 5,
          group_member_limit: parseInt(booking.group_member_limit || booking.groupMemberLimit, 10) || 5,
          entryType: booking.entry_type || booking.entryType || "Single Entry",
          entry_type: booking.entry_type || booking.entryType || "Single Entry",
          titleType: booking.title_type || booking.titleType || "Editable",
          title_type: booking.title_type || booking.titleType || "Editable",
          designationType: booking.designation_type || booking.designationType || "Editable",
          designation_type: booking.designation_type || booking.designationType || "Editable",
          companyType: booking.company_type || booking.companyType || "Editable",
          company_type: booking.company_type || booking.companyType || "Editable",
          currency: booking.currency || "INR",
          taxType: booking.taxType || "",
          includeTax: Boolean(booking.include_tax ?? booking.includeTax),
          include_tax: Boolean(booking.include_tax ?? booking.includeTax),
          taxes: booking.taxes || [],
          bookingStartDate: booking.booking_start_date || booking.bookingStartDate || details.startDate || "",
          booking_start_date: booking.booking_start_date || booking.bookingStartDate || details.startDate || "",
          bookingEndDate: booking.booking_end_date || booking.bookingEndDate || details.endDate || "",
          booking_end_date: booking.booking_end_date || booking.bookingEndDate || details.endDate || "",
          bookingStartTime: booking.bookingStartTime || details.startTime || "09:00 AM",
          bookingEndTime: booking.bookingEndTime || details.endTime || "06:00 PM",
        },
        layout: {
          floorType: layout.floorType || layout.floor_type || "Stall",
          floor_type: layout.floorType || layout.floor_type || "Stall",
          overallSpaceSqFt: layout.overallSpaceSqFt || layout.overall_space_sqft || details.venue_total_area_sqft || null,
          overall_space_sqft: layout.overall_space_sqft || layout.overallSpaceSqFt || details.venue_total_area_sqft || null,
          dayBased: Boolean(layout.dayBased ?? layout.day_based),
          day_based: Boolean(layout.dayBased ?? layout.day_based),
          personPass: layout.personPass || layout.person_pass || 1,
          person_pass: layout.personPass || layout.person_pass || 1,
          includeTax: Boolean(layout.includeTax ?? layout.include_tax),
          include_tax: Boolean(layout.includeTax ?? layout.include_tax),
          taxes: layout.taxes || [],
          stalls: (layout.stalls || layout.stallList || []).map((s) => ({
            ...s,
            stall_name: s.stall_name || s.stallName || "",
            stallName: s.stall_name || s.stallName || "",
            stall_size: s.stall_size || s.size || "",
            size: s.stall_size || s.size || "",
            price_inr: s.price_inr || s.priceINR || s.price || "0",
            priceINR: s.price_inr || s.priceINR || s.price || "0",
            stall_type: s.stall_type || s.type || "",
            type: s.stall_type || s.type || "",
            prime_seat: Boolean(s.prime_seat ?? s.primeSeat),
            primeSeat: Boolean(s.prime_seat ?? s.primeSeat),
            prime_price_inr: s.prime_price_inr || s.primePriceINR || "",
            primePriceINR: s.prime_price_inr || s.primePriceINR || "",
          })),
          amenities: layout.amenities || [],
        },
        foodProvision: (() => {
          const list = (food.items || food.foodItems || (food.catererName ? [food] : [])).map((fi) => ({
            ...fi,
            caterer_name: fi.caterer_name || fi.catererName || "",
            catererName: fi.caterer_name || fi.catererName || "",
            meal_type: fi.meal_type || fi.mealType || "",
            mealType: fi.meal_type || fi.mealType || "",
            food_type: fi.food_type || fi.foodType || "",
            foodType: fi.food_type || fi.foodType || "",
            price_inr: fi.price_inr ?? fi.priceINR ?? 0,
            priceINR: fi.price_inr ?? fi.priceINR ?? 0,
            menu_details: fi.menu_details || fi.menuDetails || "",
            menuDetails: fi.menu_details || fi.menuDetails || "",
          }));
          return {
            items: list,
            foodItems: list,
            food_items: list,
            caterer_name: list[0]?.caterer_name || "",
            catererName: list[0]?.catererName || "",
            meal_type: list[0]?.meal_type || "",
            mealType: list[0]?.mealType || "",
            food_type: list[0]?.food_type || "",
            foodType: list[0]?.foodType || "",
            price_inr: list[0]?.price_inr ?? 0,
            priceINR: list[0]?.priceINR ?? 0,
            menu_details: list[0]?.menu_details || "",
            menuDetails: list[0]?.menuDetails || "",
          };
        })(),
        vehicleProvision: (() => {
          const vList = (vehicle.details || vehicle.vehicles || []).map((v) => ({
            ...v,
            vehicle_type: v.vehicle_type || v.vehicleType || "",
            vehicleType: v.vehicle_type || v.vehicleType || "",
            price_inr: v.price_inr ?? v.priceINR ?? 0,
            priceINR: v.price_inr ?? v.priceINR ?? 0,
          }));
          const aList = (vehicle.addons || vehicle.vehicle_addons || []).map((a) => ({
            ...a,
            is_parent: Boolean(a.is_parent ?? a.isParent),
            isParent: Boolean(a.is_parent ?? a.isParent),
            addon_name: a.addon_name || a.addOnName || a.name || "",
            addOnName: a.addon_name || a.addOnName || a.name || "",
            price: a.price ?? a.price_inr ?? 0,
            price_inr: a.price ?? a.price_inr ?? 0,
          }));
          return {
            details: vList,
            vehicles: vList,
            addons: aList,
            vehicle_addons: aList,
            vehicle_type: vList[0]?.vehicle_type || "",
            vehicleType: vList[0]?.vehicleType || "",
            price_inr: vList[0]?.price_inr ?? 0,
            priceINR: vList[0]?.priceINR ?? 0,
          };
        })(),
        documents: {
          bannerPreview: finalBannerUrl,
          bannerType: docs.bannerType || "image",
          additionalDocs: docs.additionalDocs || [],
        },
        termsDetails: {
          policies: terms,
        },
        vendorSponsor: {
          vendors: (vs.vendors || (Array.isArray(formData.vendors) ? formData.vendors : [])).map((v) => ({
            ...v,
            vendor_name: v.vendor_name || v.vendorName || "",
            vendorName: v.vendor_name || v.vendorName || "",
            vendor_type: v.vendor_type || v.vendorType || "",
            vendorType: v.vendor_type || v.vendorType || "",
            pass_count: v.pass_count ?? v.passCount ?? 0,
            passCount: v.pass_count ?? v.passCount ?? 0,
          })),
          sponsors: (vs.sponsors || (Array.isArray(formData.sponsors) ? formData.sponsors : [])).map((s) => ({
            ...s,
            sponsor_name: s.sponsor_name || s.sponsorName || "",
            sponsorName: s.sponsor_name || s.sponsorName || "",
            sponsorship_type: s.sponsorship_type || s.sponsorshipType || s.sponsorship || "",
            sponsorshipType: s.sponsorship_type || s.sponsorshipType || s.sponsorship || "",
          })),
          guests: (vs.guests || formData.guests || []).map((g) => ({
            ...g,
            guest_name: g.guest_name || g.guestName || g.name || "",
            guestName: g.guest_name || g.guestName || g.name || "",
          })),
        },
        user_id: currentOrganizerId || organizer?.id,
        created_by: currentOrganizerId || organizer?.id,
      };
      if (targetEventId) {
        await updateEvent(targetEventId, payload);
        clearEventsCache();
        setPopup({ show: true, message: "🎉 Event Details Updated Successfully!", type: "success" });
      } else {
        await completeEvent(payload);
        clearEventsCache();
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
      isSubmittingRef.current = false;
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
          <div className="flex items-start justify-between w-full max-w-3xl mx-auto">
            {STEPS.map((s, idx) => {
              const isActive = step === idx + 1;
              const isCompleted = step > idx + 1;
              const StepIcon = s.icon;

              return (
                <div key={idx} className="relative flex-1 flex flex-col items-center">
                  {/* Connecting Track Line to next step */}
                  {idx < STEPS.length - 1 && (
                    <div className="absolute top-4 left-1/2 w-full h-0.5 -translate-y-1/2 z-0">
                      <div className="w-full h-full bg-slate-200" />
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 transition-all duration-500"
                        style={{ width: step > idx + 1 ? "100%" : "0%" }}
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setStep(idx + 1)}
                    className="relative z-10 flex flex-col items-center gap-1 group cursor-pointer border-none bg-transparent px-1 focus:outline-none"
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
                </div>
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