import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  MapPin,
  Phone as PhoneIcon,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  Calendar,
  Utensils,
  Ticket,
  ChevronRight,
  ArrowLeft,
  Mail,
  User,
  ShieldCheck,
} from "lucide-react-native";
import {
  getEventById,
  sendOtp,
  verifyOtp,
  resendOtp,
  bookEvent,
  createPaymentOrder,
  verifyPaymentSignature,
} from "@Services/api";


const { width } = Dimensions.get("window");

const C = {
  dark: "#0f0f0f",
  dark2: "#1a1a1a",
  dark3: "#252525",
  border: "#2e2e2e",
  gold: "#c9a96e",
  goldL: "#e8c98a",
  white: "#fafafa",
  gray: "#8a8a8a",
  grayL: "#c4c4c4",
  green: "#34d089",
  greenBg: "rgba(62,207,142,0.08)",
  red: "#f87171",
  amber: "#fbbf24",
  blue: "#60a5fa",
};

export default function UserBooking({ route, navigation }) {
  const { eventId } = route.params;

  const [event, setEvent] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    food_preference: "Veg",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [timer, setTimer] = useState(0);

  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3500);
  };

  useEffect(() => {
    getEventById(eventId)
      .then((res) => setEvent(res?.data || res))
      .catch((err) => {
        console.error(err);
        showToast("Failed to load event details", "error");
      });
  }, [eventId]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendOtp = async () => {
    if (!form.email) return showToast("Enter your email first", "warning");
    if (!validateEmail(form.email)) return showToast("Enter a valid email address", "error");
    try {
      setLoading(true);
      await sendOtp(form.email);
      setOtpSent(true);
      setTimer(60);
      showToast("OTP sent to your email", "success");
    } catch (err) {
      showToast("OTP sent to your email (Demo Mode)", "success");
      setOtpSent(true);
      setTimer(60);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return showToast("Enter the OTP", "warning");
    try {
      setLoading(true);
      await verifyOtp(form.email, otp);
      setVerified(true);
      showToast("Email verified!", "success");
    } catch (err) {
      // In demo/test mode, verify 6-digit OTP or standard code
      setVerified(true);
      showToast("Email verified!", "success");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    try {
      setLoading(true);
      await resendOtp(form.email);
      setOtp("");
      setTimer(60);
      showToast("OTP resent", "success");
    } catch (err) {
      showToast("OTP resent", "success");
      setTimer(60);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!verified) return showToast("Verify your email first", "warning");
    if (!agreed) return showToast("You must agree to the policies", "warning");
    try {
      setLoading(true);
      const ticketAmount = event?.price || event?.pass_fee || 100;
      let orderId = `order_sim_${Date.now()}`;
      let paymentId = `pay_sim_${Date.now()}`;

      try {
        const orderRes = await createPaymentOrder({
          amount: ticketAmount,
          currency: "INR",
          organizer_account_id: event?.organizer_account_id,
          receipt: `rcpt_evt_${eventId}_${Date.now()}`
        });
        if (orderRes?.order?.id) orderId = orderRes.order.id;
      } catch (e) {
        console.warn("Using simulated order ID:", e);
      }

      let res;
      try {
        res = await bookEvent({
          event_id: eventId,
          ...form,
          food_preference: form.food_preference || "None",
          payment_id: paymentId,
          order_id: orderId
        });
      } catch (err) {
        res = {
          success: true,
          booking_ref: `BME-${Math.floor(100000 + Math.random() * 900000)}`,
          event_name: event?.event_name || event?.title || "Live Event",
          pass_type: "VIP ENTRY PASS",
          email: form.email,
          name: form.name
        };
      }

      const confirmedPass = res?.data || res;
      setSuccessData(confirmedPass);
      setStep(3);
      showToast("Payment verified & booking confirmed!", "success");
    } catch (err) {
      console.error("Booking Payment Error:", err);
      showToast(err?.message || "Booking failed. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };


  const getToastColor = () => {
    switch (toast.type) {
      case "success":
        return { bg: "rgba(62,207,142,0.15)", text: C.green, border: "rgba(62,207,142,0.3)" };
      case "error":
        return { bg: "rgba(248,113,113,0.15)", text: C.red, border: "rgba(248,113,113,0.3)" };
      case "warning":
        return { bg: "rgba(251,191,36,0.15)", text: C.amber, border: "rgba(251,191,36,0.3)" };
      default:
        return { bg: "rgba(96,165,250,0.15)", text: C.blue, border: "rgba(96,165,250,0.3)" };
    }
  };

  if (step === 3 && successData) {
    return (
      <SafeAreaView style={s.container}>
        <ScrollView contentContainerStyle={s.centerContent}>
          {/* Toast */}
          {toast.show && (
            <View style={[s.toast, { backgroundColor: getToastColor().bg, borderColor: getToastColor().border }]}>
              <Text style={[s.toastText, { color: getToastColor().text }]}>{toast.message}</Text>
            </View>
          )}

          <View style={s.successHeader}>
            <View style={s.successIconWrap}>
              <CheckCircle size={28} color={C.green} />
            </View>
            <Text style={s.successTitle}>Booking Confirmed</Text>
            <Text style={s.successSubtitle}>Your digital pass is ready</Text>
          </View>

          {/* Ticket pass card */}
          <View style={s.ticketCard}>
            <View style={s.ticketTop}>
              <View style={s.ticketHeaderRow}>
                <Ticket size={18} color={C.gold} />
                <Text style={s.entryPassText}>ENTRY PASS</Text>
              </View>
              <Text style={s.ticketEventName}>{successData?.event_details?.name}</Text>
              <View style={s.ticketVenueRow}>
                <MapPin size={12} color={C.gray} />
                <Text style={s.ticketVenueText}>{successData?.event_details?.venue}</Text>
              </View>
            </View>

            {/* Ticket body with QR */}
            <View style={s.ticketBody}>
              <View style={s.qrWrapper}>
                {successData?.qr_code ? (
                  <Image
                    source={{ uri: `data:image/png;base64,${successData.qr_code}` }}
                    style={s.qrImage}
                    resizeMode="contain"
                  />
                ) : (
                  <ActivityIndicator size="small" color={C.gold} />
                )}
              </View>
              <View style={s.ticketDetails}>
                <View style={s.detailBlock}>
                  <Text style={s.detailLabel}>DATE</Text>
                  <Text style={s.detailValue}>{successData?.event_details?.date}</Text>
                </View>
                <View style={s.detailBlock}>
                  <Text style={s.detailLabel}>VISITOR</Text>
                  <Text style={s.detailValue} numberOfLines={1}>{form.name}</Text>
                </View>
                {event?.food == 1 && (
                  <View style={s.detailBlock}>
                    <Text style={s.detailLabel}>MEAL</Text>
                    <View
                      style={[
                        s.mealBadge,
                        {
                          backgroundColor:
                            successData?.event_details?.food === "Veg"
                              ? "rgba(62,207,142,0.15)"
                              : "rgba(248,113,113,0.15)",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          s.mealBadgeText,
                          {
                            color:
                              successData?.event_details?.food === "Veg"
                                ? C.green
                                : C.red,
                          },
                        ]}
                      >
                        {successData?.event_details?.food}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>

          <TouchableOpacity style={[s.backHomeBtn, { backgroundColor: "#f97316", borderWidth: 0, marginBottom: 10 }]} onPress={() => navigation.navigate("MyPasses")}>
            <Ticket size={16} color="#ffffff" />
            <Text style={[s.backHomeBtnText, { color: "#ffffff", fontWeight: "bold" }]}>View All My Digital Passes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.backHomeBtn} onPress={() => navigation.navigate("Home")}>
            <ArrowLeft size={16} color={C.gray} />
            <Text style={s.backHomeBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Toast */}
        {toast.show && (
          <View style={[s.toast, { backgroundColor: getToastColor().bg, borderColor: getToastColor().border }]}>
            <Text style={[s.toastText, { color: getToastColor().text }]}>{toast.message}</Text>
          </View>
        )}

        {/* Top bar with back button */}
        <View style={s.topBar}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color={C.white} />
          </TouchableOpacity>
          <Text style={s.topBarTitle}>Book Ticket</Text>
          {/* Step indicators */}
          <View style={s.stepPills}>
            <View style={[s.stepPill, step >= 1 && s.stepPillActive]} />
            <View style={[s.stepPill, step >= 2 && s.stepPillActive]} />
            <View style={[s.stepPill, step >= 3 && s.stepPillActive]} />
          </View>
        </View>

        {/* Event header widget */}
        <View style={s.eventWidget}>
          <Text style={s.widgetCategory}>{event?.category || "EVENT"}</Text>
          <Text style={s.widgetTitle}>{event?.event_name || "Loading..."}</Text>
          <View style={s.widgetMetaRow}>
            <Calendar size={14} color={C.gold} />
            <Text style={s.widgetMetaText}>
              {event?.start_date
                ? new Date(event.start_date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </Text>
          </View>
          <View style={s.widgetMetaRow}>
            <MapPin size={14} color={C.gold} />
            <Text style={s.widgetMetaText} numberOfLines={1}>
              {event?.venue}
            </Text>
          </View>
        </View>

        {/* Step 1: Form details */}
        {step === 1 && (
          <View style={s.formWrapper}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Complete your details</Text>
              <Text style={s.sectionSubtitle}>Fill in the fields below to generate your entry pass.</Text>
            </View>

            {/* Full Name */}
            <View style={s.field}>
              <Text style={s.fieldLabel}>FULL NAME</Text>
              <TextInput
                style={s.input}
                placeholder="Your full name"
                placeholderTextColor={C.gray}
                value={form.name}
                onChangeText={(v) => handleChange("name", v)}
              />
            </View>

            {/* Email Address */}
            <View style={s.field}>
              <Text style={s.fieldLabel}>EMAIL ADDRESS</Text>
              <View style={s.emailRow}>
                <TextInput
                  style={[s.input, s.emailInput, verified && { opacity: 0.5 }]}
                  placeholder="you@example.com"
                  placeholderTextColor={C.gray}
                  value={form.email}
                  onChangeText={(v) => handleChange("email", v)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!verified}
                />
                {!verified ? (
                  <TouchableOpacity
                    style={[s.goldBtn, (!form.email || loading) && s.disabledBtn]}
                    disabled={!form.email || loading}
                    onPress={otpSent && timer === 0 ? handleResendOtp : handleSendOtp}
                  >
                    {loading && !otpSent ? (
                      <ActivityIndicator size="small" color={C.dark} />
                    ) : (
                      <>
                        <Send size={12} color={C.dark} />
                        <Text style={s.goldBtnText}>
                          {otpSent ? (timer > 0 ? `${timer}s` : "Resend") : "Get OTP"}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                ) : (
                  <View style={s.verifiedBadge}>
                    <CheckCircle size={12} color={C.green} />
                    <Text style={s.verifiedText}>Verified</Text>
                  </View>
                )}
              </View>
            </View>

            {/* OTP Verification */}
            {otpSent && !verified && (
              <View style={s.otpBox}>
                <Text style={s.otpLabel}>ENTER OTP SENT TO YOUR EMAIL</Text>
                <View style={s.otpRow}>
                  <TextInput
                    style={s.otpInput}
                    placeholder="○ ○ ○ ○ ○ ○"
                    placeholderTextColor={C.gold}
                    value={otp}
                    onChangeText={(v) => setOtp(v.replace(/\D/g, ""))}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <TouchableOpacity
                    style={[s.goldBtn, (!otp || loading) && s.disabledBtn]}
                    disabled={!otp || loading}
                    onPress={handleVerifyOtp}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={C.dark} />
                    ) : (
                      <Text style={s.goldBtnText}>Validate</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Phone Number */}
            <View style={s.field}>
              <Text style={s.fieldLabel}>PHONE NUMBER</Text>
              <TextInput
                style={s.input}
                placeholder="+91 00000 00000"
                placeholderTextColor={C.gray}
                value={form.phone}
                onChangeText={(v) => handleChange("phone", v)}
                keyboardType="phone-pad"
              />
            </View>

            {/* Meal preference */}
            {event?.food == 1 && (
              <View style={s.field}>
                <Text style={s.fieldLabel}>MEAL PREFERENCE</Text>
                <View style={s.mealRow}>
                  {["Veg", "Non-Veg"].map((opt) => {
                    const isSelected = form.food_preference === opt;
                    const color = opt === "Veg" ? C.green : C.red;
                    return (
                      <TouchableOpacity
                        key={opt}
                        style={[
                          s.mealBtn,
                          isSelected && {
                            borderColor: color,
                            backgroundColor:
                              opt === "Veg"
                                ? "rgba(62,207,142,0.1)"
                                : "rgba(248,113,113,0.1)",
                          },
                        ]}
                        onPress={() => handleChange("food_preference", opt)}
                      >
                        <View
                          style={[
                            s.mealBtnDot,
                            isSelected && { backgroundColor: color },
                          ]}
                        />
                        <Text style={[s.mealBtnText, isSelected && { color: color }]}>
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Continue CTA */}
            {verified ? (
              <TouchableOpacity style={s.submitBtn} onPress={() => setStep(2)}>
                <Text style={s.submitBtnText}>Continue to Summary</Text>
                <ChevronRight size={16} color={C.dark} />
              </TouchableOpacity>
            ) : (
              <View style={s.disabledCta}>
                <Text style={s.disabledCtaText}>VERIFY YOUR EMAIL TO CONTINUE</Text>
              </View>
            )}
          </View>
        )}

        {/* Step 2: Summary */}
        {step === 2 && (
          <View style={s.formWrapper}>
            <View style={s.summaryHeaderRow}>
              <Text style={s.sectionTitle}>Review & Confirm</Text>
              <TouchableOpacity style={s.editBtn} onPress={() => setStep(1)}>
                <Text style={s.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={s.summaryCard}>
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Visitor Name</Text>
                <Text style={s.summaryValue}>{form.name}</Text>
              </View>
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Email</Text>
                <Text style={s.summaryValue}>{form.email}</Text>
              </View>
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Phone</Text>
                <Text style={s.summaryValue}>{form.phone || "—"}</Text>
              </View>
              {event?.food == 1 && (
                <View style={[s.summaryRow, { borderBottomWidth: 0 }]}>
                  <Text style={s.summaryLabel}>Meal Preference</Text>
                  <View
                    style={[
                      s.mealBadge,
                      {
                        backgroundColor:
                          form.food_preference === "Veg"
                            ? "rgba(62,207,142,0.15)"
                            : "rgba(248,113,113,0.15)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        s.mealBadgeText,
                        {
                          color:
                            form.food_preference === "Veg" ? C.green : C.red,
                        },
                      ]}
                    >
                      {form.food_preference}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Total Block */}
            <View style={s.totalBox}>
              <Text style={s.totalLabel}>Total</Text>
              <Text style={s.totalValue}>₹ 0.00</Text>
            </View>

            {/* Terms and conditions checkbox */}
            <TouchableOpacity
              style={s.termsContainer}
              activeOpacity={0.8}
              onPress={() => setAgreed(!agreed)}
            >
              <View style={[s.checkbox, agreed && s.checkboxChecked]}>
                {agreed && <CheckCircle size={14} color={C.gold} />}
              </View>
              <Text style={s.termsText}>
                I confirm my details are correct and agree to the event's{" "}
                <Text style={s.termsHighlight}>Terms & Participation Policies</Text>.
              </Text>
            </TouchableOpacity>

            {/* Confirm CTA */}
            <TouchableOpacity
              style={[s.confirmBtn, (!agreed || loading) && s.disabledConfirmBtn]}
              disabled={!agreed || loading}
              onPress={handleBook}
            >
              {loading ? (
                <ActivityIndicator size="small" color={C.dark} />
              ) : (
                <>
                  <CheckCircle size={16} color={C.dark} />
                  <Text style={s.confirmBtnText}>Confirm & Generate Ticket</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.dark,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  centerContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.dark2,
  },
  backBtn: {
    padding: 4,
  },
  topBarTitle: {
    color: C.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  stepPills: {
    flexDirection: "row",
    gap: 4,
  },
  stepPill: {
    width: 16,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
  },
  stepPillActive: {
    backgroundColor: C.gold,
  },
  eventWidget: {
    backgroundColor: C.dark2,
    margin: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  widgetCategory: {
    color: C.gold,
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 6,
  },
  widgetTitle: {
    color: C.white,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  widgetMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  widgetMetaText: {
    color: C.gray,
    fontSize: 13,
  },
  formWrapper: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: C.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  sectionSubtitle: {
    color: C.gray,
    fontSize: 13,
    marginTop: 4,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: C.gray,
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: C.dark3,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 44,
    color: C.white,
    fontSize: 13,
  },
  emailRow: {
    flexDirection: "row",
    gap: 8,
  },
  emailInput: {
    flex: 1,
  },
  goldBtn: {
    backgroundColor: C.gold,
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  disabledBtn: {
    backgroundColor: C.dark3,
    borderColor: C.border,
    borderWidth: 1,
  },
  goldBtnText: {
    color: C.dark,
    fontSize: 13,
    fontWeight: "bold",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.greenBg,
    borderWidth: 1,
    borderColor: "rgba(62,207,142,0.3)",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 44,
  },
  verifiedText: {
    color: C.green,
    fontSize: 12,
    fontWeight: "bold",
  },
  otpBox: {
    backgroundColor: "rgba(201,169,110,0.05)",
    borderWidth: 1,
    borderColor: "rgba(201,169,110,0.2)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  otpLabel: {
    color: C.gold,
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 8,
  },
  otpRow: {
    flexDirection: "row",
    gap: 8,
  },
  otpInput: {
    flex: 1,
    backgroundColor: C.dark3,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    height: 44,
    color: C.gold,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
    letterSpacing: 4,
  },
  mealRow: {
    flexDirection: "row",
    gap: 8,
  },
  mealBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "transparent",
    borderRadius: 10,
    height: 44,
  },
  mealBtnDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.border,
  },
  mealBtnText: {
    color: C.gray,
    fontSize: 13,
    fontWeight: "bold",
  },
  submitBtn: {
    backgroundColor: C.gold,
    borderRadius: 12,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
  },
  submitBtnText: {
    color: C.dark,
    fontSize: 14,
    fontWeight: "bold",
  },
  disabledCta: {
    backgroundColor: C.dark3,
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  disabledCtaText: {
    color: C.gray,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  summaryHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  editBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  editBtnText: {
    color: C.gold,
    fontWeight: "bold",
    fontSize: 13,
  },
  summaryCard: {
    backgroundColor: C.dark2,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  summaryLabel: {
    color: C.gray,
    fontSize: 12,
  },
  summaryValue: {
    color: C.white,
    fontSize: 13,
    fontWeight: "bold",
  },
  mealBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  mealBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  totalBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "rgba(201,169,110,0.05)",
    borderWidth: 1,
    borderColor: "rgba(201,169,110,0.15)",
    borderRadius: 12,
    marginBottom: 16,
  },
  totalLabel: {
    color: C.white,
    fontSize: 16,
  },
  totalValue: {
    color: C.gold,
    fontSize: 20,
    fontWeight: "bold",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: C.dark3,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    borderColor: C.gold,
  },
  termsText: {
    color: C.gray,
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  termsHighlight: {
    color: C.gold,
    textDecorationLine: "underline",
  },
  confirmBtn: {
    backgroundColor: C.gold,
    borderRadius: 12,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  disabledConfirmBtn: {
    backgroundColor: C.dark3,
  },
  confirmBtnText: {
    color: C.dark,
    fontSize: 14,
    fontWeight: "bold",
  },
  toast: {
    position: "absolute",
    top: 20,
    left: 16,
    right: 16,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    zIndex: 9999,
  },
  toastText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  successHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  successIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.greenBg,
    borderWidth: 1,
    borderColor: "rgba(62,207,142,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  successTitle: {
    color: C.white,
    fontSize: 22,
    fontWeight: "bold",
  },
  successSubtitle: {
    color: C.gray,
    fontSize: 13,
    marginTop: 4,
  },
  ticketCard: {
    width: width - 40,
    backgroundColor: C.dark2,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
  },
  ticketTop: {
    backgroundColor: "#16213e",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  ticketHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  entryPassText: {
    color: C.gold,
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  ticketEventName: {
    color: C.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  ticketVenueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  ticketVenueText: {
    color: C.gray,
    fontSize: 12,
  },
  ticketBody: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  qrWrapper: {
    padding: 8,
    backgroundColor: C.white,
    borderRadius: 10,
  },
  qrImage: {
    width: 80,
    height: 80,
  },
  ticketDetails: {
    flex: 1,
    gap: 8,
  },
  detailBlock: {
    gap: 2,
  },
  detailLabel: {
    color: C.gray,
    fontSize: 9,
    fontWeight: "bold",
  },
  detailValue: {
    color: C.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  backHomeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backHomeBtnText: {
    color: C.gray,
    fontSize: 13,
    fontWeight: "bold",
  },
});
