import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { completeEvent, updateEvent } from "@Services/api";

// Step Components
import Step1EventDetails from "./steps/Step1EventDetails";
import Step2Booking from "./steps/Step2Booking";
import Step3Layout from "./steps/Step3Layout";
import StepFoodDetails from "./steps/StepFoodDetails";
import StepVehiclePassDetails from "./steps/StepVehiclePassDetails";
import Step4Documents from "./steps/Step4Documents";
import Step5Terms from "./steps/Step5Terms";
import Step6VendorSponsor from "./steps/Step6VendorSponsor";
import Step7Preview from "./steps/Step7Preview";


// --- Utility Functions --------------------------------------------------------
const convert24to12 = (time24h) => {
  if (!time24h) return "";
  const timeStr = String(time24h).trim();
  if (timeStr.match(/(AM|PM|am|pm)/i)) return timeStr;
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  let h = parseInt(parts[0], 10);
  let m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return timeStr;
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h ? h : 12;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
};

const convert12to24 = (time12h) => {
  if (!time12h) return "";
  const timeStr = String(time12h).trim();
  if (!timeStr.match(/(AM|PM|am|pm)/i)) return timeStr;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return timeStr;
  let h = parseInt(match[1], 10);
  let m = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
};

const getBool = (val) =>
  val === 1 || val === true || val === "true" || val === "1" || val === "True";

// --- Initial Form Data Builder ------------------------------------------------
const buildFormData = (editData) => ({
  eventDetails: editData?.details
    ? {
        category: editData.details.category,
        eventName: editData.details.event_name,
        description: editData.details.description,
        amenities: editData.details.amenities || "",
        tags: editData.details.tags || "",
        includeProgram: (editData.details.include_program === "True" || editData.details.include_program === "Yes") ? "Yes" : "No",
        visibility: editData.details.visibility || "Public",
        mail: getBool(editData.details.mail),
        whatsapp: getBool(editData.details.whatsapp),
        print: getBool(editData.details.print),
        visitorMail: getBool(editData.details.visitor_mail),
        visitorName: getBool(editData.details.visitor_name),
        visitorPhoto: getBool(editData.details.visitor_photo),
        visitorMobile: getBool(editData.details.visitor_mobile),
        documentProof: getBool(editData.details.document_proof),
        dayPass: getBool(editData.details.day_pass),
        isInternationalInclude: getBool(editData.details.is_international_include),
        aadhar: getBool(editData.details.aadhar),
        passport: getBool(editData.details.passport),
        welcomeKit: getBool(editData.details.welcome_kit),
        food: getBool(editData.details.food),
        vehiclePass: getBool(editData.details.vehicle_pass),
        vehicleNumber: getBool(editData.details.vehicle_number),
        eventType: editData.details.event_type || "OneTime",
        occurrence: editData.details.occurrence || "",
        startDate: editData.details.start_date,
        startTime: convert24to12(editData.details.start_time),
        endDate: editData.details.end_date,
        endTime: convert24to12(editData.details.end_time),
        venue: editData.details.venue,
        address: editData.details.address,
      }
    : {},
  foodProvision: {
    items: editData?.food_items?.map((fi) => ({
      catererName: fi.caterer_name,
      mealType: fi.meal_type,
      foodType: fi.food_type,
      priceINR: fi.price_inr,
      priceUSD: fi.price_usd,
      menuDetails: fi.menu_details,
    })) || [],
  },
  vehicleProvision: {
    details: (editData?.vehicle_details && editData.vehicle_details.length > 0)
      ? editData.vehicle_details.map((vd) => ({
          vehicleType: vd.vehicle_type,
          priceINR: vd.price_inr || "0",
          priceUSD: vd.price_usd || "0",
        }))
      : [
          { vehicleType: "Two Wheeler", priceINR: "0", priceUSD: "0" },
          { vehicleType: "Four Wheeler", priceINR: "0", priceUSD: "0" },
          { vehicleType: "Heavy Vehicle", priceINR: "0", priceUSD: "0" },
        ],
    addons: editData?.vehicle_addons?.map((va) => ({
      isParent: va.is_parent === 1 || va.is_parent === true,
      addOnName: va.addon_name,
      price: va.price,
    })) || [],
  },
  booking: editData?.booking
    ? {
        bookingStartDate: editData.booking.booking_start_date,
        bookingEndDate: editData.booking.booking_end_date,
        capacity: editData.booking.capacity,
        passType: editData.booking.pass_type,
        entryType: editData.booking.entry_type,
        chargeType: editData.booking.charge_type,
        maxPass: editData.booking.max_pass,
        razorpayKey: editData.booking.razorpay_key,
        includeTax: editData.booking.include_tax === 1 || editData.booking.include_tax === true,
        priceType: editData.booking.price_type,
        currency: editData.booking.currency,
        earlyBirdExpire: editData.booking.early_bird_expire,
      }
    : {},
  layout: editData?.layout
    ? {
        floorType: editData.layout.master?.floor_type,
        dayBased: editData.layout.master?.day_based === 1 || editData.layout.master?.day_based === true,
        personPass: editData.layout.master?.person_pass,
        includeTax: editData.layout.master?.include_tax === 1 || editData.layout.master?.include_tax === true,
        taxes: editData.layout.master?.taxes ? JSON.parse(editData.layout.master.taxes) : [],
        stalls: editData.layout.stalls?.map((st) => ({
          stallName: st.stall_name,
          size: st.stall_size,
          sizeRange: st.size_range,
          visibility: st.visibility,
          type: st.stall_type,
          priceINR: st.price_inr,
          priceUSD: st.price_usd,
          primeSeat: st.prime_seat === 1 || st.prime_seat === true,
          primePriceINR: st.prime_price_inr,
          primePriceUSD: st.prime_price_usd,
        })) || [],
        amenities: editData.layout.amenities?.map((am) => ({
          stallName: am.stall_name,
          amenity: am.amenity,
          qty: am.qty,
        })) || [],
      }
    : { stalls: [], amenities: [] },
  documents: editData
    ? {
        banner: null,
        bannerPreview: editData.files?.find((f) => f.file_type === "banner")?.url || null,
        docs: editData.files?.filter((f) => f.file_type !== "banner").map((f) => ({
          id: f.id,
          type: f.doc_type,
          number: f.doc_number,
          file: null,
          preview: f.url,
          name: f.file_name,
          isExisting: true,
        })) || [],
        existingFiles: editData.files || [],
      }
    : { banner: null, bannerPreview: null, docs: [], existingFiles: [] },
  terms: editData?.terms?.map((t) => ({
    policyGroup: t.policy_group || t.policyGroup,
    policyType: t.policy_type || t.policyType,
    policyName: t.policy_name || t.policyName,
    description: t.description || t.policy_description || t.policy_desc || "",
    isDefault: t.is_default || t.isDefault || false,
  })) || [],
  vendors: editData?.vendor_data
    ? {
        vendors: editData.vendor_data.vendors?.map((v) => ({
          vendorType: v.vendor_type,
          vendorName: v.vendor_name,
          passCount: v.pass_count,
        })),
        sponsors: editData.vendor_data.sponsors?.map((sp) => ({
          sponsorName: sp.sponsor_name,
          sponsorship: sp.sponsorship_type,
        })),
        guests: editData.vendor_data.guests?.map((g) => ({
          name: g.guest_name,
          designation: g.designation,
          contact: g.contact,
          image: g.image,
        })),
      }
    : { vendors: [], sponsors: [], guests: [] },
});

// --- CreateEvent Component ----------------------------------------------------
export default function CreateEvent({ route, navigation }) {
  const editData = route?.params?.editData || null;
  const isView = route?.params?.isView || false;

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(() => buildFormData(editData));
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const Redexorganizer = useSelector((state) => state.user);
  const [organizerId, setOrganizerId] = useState(null);
  const [organizerName, setOrganizerName] = useState(null);

  useEffect(() => {
    const getOrg = async () => {
      const id = Redexorganizer?.id || (await AsyncStorage.getItem("userId"));
      const name = Redexorganizer?.name || (await AsyncStorage.getItem("userName"));
      setOrganizerId(id);
      setOrganizerName(name);
    };
    getOrg();
  }, [Redexorganizer]);

  useEffect(() => {
    if (organizerName) {
      setFormData((prev) => ({
        ...prev,
        eventDetails: { ...prev.eventDetails, created_by: organizerName },
      }));
    }
  }, [organizerName]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  // Build dynamic step list
  const allSteps = [
    { label: "Event Details", Component: Step1EventDetails },
    { label: "Booking", Component: Step2Booking },
    ...(formData.eventDetails?.food ? [{ label: "Food", Component: StepFoodDetails }] : []),
    ...(formData.eventDetails?.vehiclePass ? [{ label: "Vehicle", Component: StepVehiclePassDetails }] : []),
    { label: "Layout & Stall", Component: Step3Layout },
    { label: "Documents", Component: Step4Documents },
    { label: "Terms", Component: Step5Terms },
    { label: "Vendor/Sponsor", Component: Step6VendorSponsor },
    { label: "Preview", Component: Step7Preview },
  ];


  const getFormValidationErrors = () => {
    const event = formData.eventDetails || {};
    const booking = formData.booking || {};
    const documents = formData.documents || {};
    const layout = formData.layout || {};
    const errors = [];
    if (!event.eventName) errors.push("Event Name");
    if (!event.category) errors.push("Category");
    if (!event.description) errors.push("Description");
    if (!event.startDate) errors.push("Start Date");
    if (!event.startTime) errors.push("Start Time");
    if (!event.endDate) errors.push("End Date");
    if (!event.endTime) errors.push("End Time");
    if (!event.venue) errors.push("Venue");
    if (!event.address) errors.push("Address");
    if (!booking.bookingStartDate) errors.push("Booking Start Date");
    if (!booking.bookingEndDate) errors.push("Booking End Date");
    if (!booking.capacity) errors.push("Capacity");
    if (!booking.passType) errors.push("Pass Type");
    if (!booking.entryType) errors.push("Entry Type");
    if (!booking.chargeType) errors.push("Charge Type");
    if (!booking.maxPass) errors.push("Max Passes");
    if (!documents.banner && !documents.bannerPreview) errors.push("Banner");
    if (!formData.terms || formData.terms.length === 0) errors.push("Terms");
    return errors;
  };

  const isFormValid = () => getFormValidationErrors().length === 0;

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      const eventDetailsToSend = {
        ...formData.eventDetails,
        startTime: convert12to24(formData.eventDetails?.startTime),
        endTime: convert12to24(formData.eventDetails?.endTime),
        created_by: organizerName,
        user_id: organizerId,
      };
      fd.append("eventDetails", JSON.stringify(eventDetailsToSend));
      fd.append("booking", JSON.stringify(formData.booking));
      fd.append("layout", JSON.stringify(formData.layout));
      fd.append("terms", JSON.stringify(formData.terms));
      fd.append("vendors", JSON.stringify(formData.vendors));
      fd.append("foodProvision", JSON.stringify(formData.foodProvision || { items: [] }));
      fd.append("vehicleProvision", JSON.stringify(formData.vehicleProvision || { details: [], addons: [] }));

      if (formData.documents.banner) {
        fd.append("banner", {
          uri: formData.documents.banner.uri,
          type: formData.documents.banner.type || "image/jpeg",
          name: formData.documents.banner.name || "banner.jpg",
        });
      } else if (!formData.documents.bannerPreview) {
        fd.append("delete_banner", "true");
      }

      const newDocs = (formData.documents.docs || []).filter((doc) => !doc.isExisting);
      newDocs.forEach((doc, index) => {
        if (doc.file) {
          fd.append(`docs_${index}`, {
            uri: doc.file.uri,
            type: doc.file.type || "application/octet-stream",
            name: doc.file.name || `doc_${index}`,
          });
        }
        fd.append(`doc_type_${index}`, doc.type);
        fd.append(`doc_number_${index}`, doc.number);
      });
      fd.append("doc_count", newDocs.length);

      const existingDocIds = (formData.documents.docs || [])
        .filter((doc) => doc.isExisting)
        .map((doc) => doc.id);
      fd.append("existing_doc_ids", JSON.stringify(existingDocIds));

      let res;
      if (editData) {
        res = await updateEvent(editData.details.id, fd);
      } else {
        res = await completeEvent(fd);
      }
      console.log("Response:", res);
      showToast(editData ? "Event Updated Successfully ?" : "Event Created Successfully ?");
      setTimeout(() => navigation?.goBack(), 2000);
    } catch (err) {
      const backendError = err.response?.data?.error || err.response?.data?.message || err.message;
      console.error("Submit Error:", backendError);
      console.error("Full error response:", JSON.stringify(err.response?.data));
      showToast(backendError || "Something went wrong", "error");
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = allSteps[step - 1]?.Component;

  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={s.backBtn}>
          <X size={18} color="#0284c7" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>
          {isView ? "View Event" : editData ? "Edit Event" : "Create Event"}
        </Text>
      </View>

      {/* Step Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.stepTabs}
        style={s.stepTabsContainer}
       keyboardShouldPersistTaps="handled">
        {allSteps.map((st, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => setStep(idx + 1)}
            style={[s.stepTab, step === idx + 1 && s.stepTabActive]}
          >
            <View style={[s.stepCircle, step === idx + 1 && s.stepCircleActive]}>
              <Text style={[s.stepCircleText, step === idx + 1 && s.stepCircleTextActive]}>
                {idx + 1}
              </Text>
            </View>
            <Text style={[s.stepLabel, step === idx + 1 && s.stepLabelActive]} numberOfLines={1}>
              {st.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Toast */}
      {toast.show && (
        <View style={[s.toast, toast.type === "success" ? s.toastSuccess : s.toastError]}>
          <Text style={s.toastText}>{toast.message}</Text>
        </View>
      )}

      {/* Step Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {CurrentStepComponent && (
          <CurrentStepComponent
            formData={formData}
            setFormData={isView ? () => {} : setFormData}
            organizerId={organizerId}
            isView={isView}
          />
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={s.bottomBar}>
        <TouchableOpacity
          style={s.navBtnBack}
          onPress={() => (step === 1 ? navigation?.goBack() : setStep(step - 1))}
        >
          <ChevronLeft size={18} color="#334155" />
          <Text style={s.navBtnBackText}>Back</Text>
        </TouchableOpacity>

        {step < allSteps.length ? (
          <TouchableOpacity
            style={s.navBtnNext}
            onPress={() => setStep(step + 1)}
          >
            <Text style={s.navBtnNextText}>Next</Text>
            <ChevronRight size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          !isView && (
            <View style={{ alignItems: "flex-end" }}>
              <TouchableOpacity
                style={[s.submitBtn, (!isFormValid() || isSubmitting) && s.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting || !isFormValid()}
              >
                <Check size={18} color="#fff" />
                <Text style={s.submitBtnText}>{isSubmitting ? "Submitting..." : "Submit"}</Text>
              </TouchableOpacity>
              {!isFormValid() && (
                <Text style={s.errorHint} numberOfLines={2}>
                  Missing: {getFormValidationErrors().slice(0, 3).join(", ")}
                  {getFormValidationErrors().length > 3 ? "..." : ""}
                </Text>
              )}
            </View>
          )
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", gap: 10 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#0c4a6e" },
  backBtn: { padding: 6, backgroundColor: "#f0f9ff", borderRadius: 8, borderWidth: 1, borderColor: "#bae6fd" },

  stepTabsContainer: { backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", maxHeight: 56 },
  stepTabs: { paddingHorizontal: 10, gap: 6, alignItems: "center" },
  stepTab: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 10 },
  stepTabActive: { borderBottomWidth: 2, borderBottomColor: "#0284c7" },
  stepCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#e2e8f0", justifyContent: "center", alignItems: "center" },
  stepCircleActive: { backgroundColor: "#0284c7" },
  stepCircleText: { fontSize: 10, fontWeight: "bold", color: "#64748b" },
  stepCircleTextActive: { color: "#fff" },
  stepLabel: { fontSize: 12, color: "#94a3b8", fontWeight: "600" },
  stepLabelActive: { color: "#0284c7", fontWeight: "bold" },

  toast: { position: "absolute", top: 120, left: 16, right: 16, padding: 12, borderRadius: 8, zIndex: 100, alignItems: "center" },
  toastSuccess: { backgroundColor: "#d1fae5" },
  toastError: { backgroundColor: "#fee2e2" },
  toastText: { fontSize: 13, fontWeight: "bold", color: "#0f172a" },

  bottomBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#e2e8f0", elevation: 10 },
  navBtnBack: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  navBtnBackText: { fontSize: 14, fontWeight: "bold", color: "#334155" },
  navBtnNext: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#0369a1", borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  navBtnNextText: { fontSize: 14, fontWeight: "bold", color: "#fff" },
  submitBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#16a34a", borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  submitBtnDisabled: { backgroundColor: "#94a3b8" },
  submitBtnText: { fontSize: 14, fontWeight: "bold", color: "#fff" },
  errorHint: { fontSize: 10, color: "#ef4444", fontWeight: "bold", marginTop: 4, maxWidth: 220, textAlign: "right" },
});
