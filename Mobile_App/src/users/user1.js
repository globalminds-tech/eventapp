import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Image, Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  MapPin, Phone, CheckCircle, XCircle, Info, AlertTriangle,
  Send, Edit, Calendar, Utensils, Ticket, ChevronRight, ArrowLeft
} from "lucide-react-native";
import { getEventById, sendOtp, verifyOtp, resendOtp, bookEvent } from "@Services/api";

const { width } = Dimensions.get("window");

const C = {
  dark:   "#0f0f0f",
  dark2:  "#1a1a1a",
  dark3:  "#252525",
  border: "#2e2e2e",
  gold:   "#c9a96e",
  goldL:  "#e8c98a",
  white:  "#fafafa",
  gray:   "#8a8a8a",
  grayL:  "#c4c4c4",
  green:  "#34d089",
  greenBg:"rgba(62,207,142,0.15)",
  red:    "#f87171",
  redBg:  "rgba(248,113,113,0.15)",
  amber:  "#fbbf24",
  blue:   "#60a5fa",
};

export default function Userbooking1({ route, navigation }) {
  // Usually id is passed via route.params.eventId, fallback to dummy
  const id = route?.params?.eventId || "1"; 

  const [event, setEvent] = useState(null);
  const [form, setForm] = useState({ name:"", email:"", phone:"", food_preference:"Veg" });
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [toast, setToast] = useState({ show:false, message:"", type:"info" });

  const showToast = (message, type="info") => {
    setToast({ show:true, message, type });
    setTimeout(() => setToast({ show:false, message:"", type:"info" }), 3500);
  };

  useEffect(() => {
    if (id) {
      getEventById(id).then(setEvent).catch(console.error);
    }
  }, [id]);

  const handleChange = (name, value) => setForm({ ...form, [name]: value });
  const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendOtp = async () => {
    if (!form.email) return showToast("Enter your email first", "warning");
    if (!validateEmail(form.email)) return showToast("Enter a valid email address", "error");
    try {
      setLoading(true);
      await sendOtp(form.email);
      setOtpSent(true);
      showToast("OTP sent to your email", "success");
    } catch { showToast("Failed to send OTP", "error"); }
    finally  { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return showToast("Enter the OTP", "warning");
    try {
      setLoading(true);
      await verifyOtp(form.email, otp);
      setVerified(true);
      showToast("Email verified!", "success");
    } catch { showToast("Invalid OTP. Try again.", "error"); }
    finally  { setLoading(false); }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp(form.email);
      setOtp("");
      showToast("OTP resent", "success");
    } catch { showToast("Failed to resend OTP", "error"); }
  };

  const handleBook = async () => {
    if (!verified) return showToast("Verify your email first", "warning");
    try {
      setLoading(true);
      const res = await bookEvent({ 
        event_id: id, 
        ...form, 
        food_preference: event?.food == 1 ? form.food_preference : "None" 
      });
      setSuccessData(res);
      setStep(3);
      showToast("Booking confirmed!", "success");
    } catch { showToast("Booking failed. Try again.", "error"); }
    finally  { setLoading(false); }
  };

  const ToastComponent = () => {
    if (!toast.show) return null;
    let color = C.blue;
    let Icon = Info;
    let bg = "rgba(96,165,250,0.12)";
    let border = "rgba(96,165,250,0.3)";
    if (toast.type === "success") { color = C.green; Icon = CheckCircle; bg = C.greenBg; border = "rgba(62,207,142,0.3)"; }
    else if (toast.type === "error") { color = C.red; Icon = XCircle; bg = C.redBg; border = "rgba(248,113,113,0.3)"; }
    else if (toast.type === "warning") { color = C.amber; Icon = AlertTriangle; bg = "rgba(251,191,36,0.12)"; border = "rgba(251,191,36,0.3)"; }
    
    return (
      <View style={[s.toast, { backgroundColor: bg, borderColor: border }]}>
        <Icon size={16} color={color} />
        <Text style={[s.toastText, { color }]}>{toast.message}</Text>
      </View>
    );
  };

  if (step === 3 && successData) {
    return (
      <SafeAreaView style={s.safeArea}>
        <ToastComponent />
        <View style={s.successContainer}>
          <View style={s.successHeader}>
            <View style={s.successIconWrap}>
              <CheckCircle size={32} color={C.green} />
            </View>
            <Text style={s.successTitle}>Booking Confirmed</Text>
            <Text style={s.successSub}>Your digital pass is ready</Text>
          </View>

          <View style={s.ticketCard}>
            <View style={s.ticketTop}>
              <View style={s.ticketRow}>
                <Ticket size={16} color={C.gold} />
                <Text style={s.ticketLabel}>ENTRY PASS</Text>
              </View>
              <Text style={s.ticketEventName}>{successData.event_details?.name}</Text>
              <View style={s.ticketRowLoc}>
                <MapPin size={12} color={C.gray} />
                <Text style={s.ticketLocText}>{successData.event_details?.venue}</Text>
              </View>
            </View>

            <View style={s.ticketBody}>
              <View style={s.qrBox}>
                <Image source={{ uri: `data:image/png;base64,${successData.qr_code}` }} style={s.qrImg} />
              </View>
              <View style={s.ticketDetails}>
                <Text style={s.dLabel}>DATE</Text>
                <Text style={s.dVal}>{successData.event_details?.date}</Text>

                <Text style={s.dLabel}>VISITOR</Text>
                <Text style={s.dVal}>{form.name}</Text>

                {event?.food == 1 && (
                  <>
                    <Text style={s.dLabel}>MEAL</Text>
                    <View style={[s.mealPill, successData.event_details?.food === "Veg" ? { backgroundColor: C.greenBg } : { backgroundColor: C.redBg }]}>
                      <Text style={[s.mealText, successData.event_details?.food === "Veg" ? { color: C.green } : { color: C.red }]}>
                        {successData.event_details?.food}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>

          <TouchableOpacity style={s.homeBtn} onPress={() => navigation.navigate("Home")}>
            <ArrowLeft size={16} color={C.gray} />
            <Text style={s.homeBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safeArea}>
      <ToastComponent />
      
      {/* Mobile Top Bar */}
      <View style={s.topBar}>
        <View style={s.topIcon}>
          <Ticket size={16} color={C.dark} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.topBarTitle} numberOfLines={1}>{event?.venue || "Loading..."}</Text>
          <Text style={s.topBarSub}>{event?.start_date ? new Date(event.start_date).toLocaleDateString() : ""}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        {step === 1 && (
          <View style={s.formContainer}>
            <Text style={s.h2}>Complete your details</Text>
            <Text style={s.p}>Fill in the fields below to generate your entry pass.</Text>

            <Text style={s.label}>FULL NAME</Text>
            <TextInput style={s.input} placeholder="Your full name" placeholderTextColor={C.gray} value={form.name} onChangeText={(v) => handleChange("name", v)} />

            <Text style={s.label}>EMAIL ADDRESS</Text>
            <View style={s.inputRow}>
              <TextInput style={[s.input, { flex: 1, opacity: verified ? 0.5 : 1 }]} placeholder="you@example.com" placeholderTextColor={C.gray} value={form.email} onChangeText={(v) => handleChange("email", v)} editable={!verified} keyboardType="email-address" autoCapitalize="none" />
              {!verified ? (
                <TouchableOpacity style={s.goldBtnSmall} onPress={otpSent ? handleResendOtp : handleSendOtp} disabled={loading || !form.email}>
                  {loading && !otpSent ? <ActivityIndicator size="small" color={C.dark} /> : <Text style={s.goldBtnText}>{otpSent ? "Resend" : "Get OTP"}</Text>}
                </TouchableOpacity>
              ) : (
                <View style={s.verifiedPill}>
                  <CheckCircle size={14} color={C.green} />
                  <Text style={s.verifiedText}>Verified</Text>
                </View>
              )}
            </View>

            {otpSent && !verified && (
              <View style={s.otpBox}>
                <Text style={s.otpLabel}>ENTER OTP SENT TO YOUR EMAIL</Text>
                <View style={s.inputRow}>
                  <TextInput style={s.otpInput} placeholder="? ? ? ? ? ?" placeholderTextColor={C.gray} value={otp} onChangeText={(v) => setOtp(v.replace(/\D/g, ""))} maxLength={6} keyboardType="number-pad" />
                  <TouchableOpacity style={s.goldBtnSmall} onPress={handleVerifyOtp} disabled={loading || !otp}>
                    {loading ? <ActivityIndicator size="small" color={C.dark} /> : <Text style={s.goldBtnText}>Validate</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <Text style={s.label}>PHONE NUMBER</Text>
            <TextInput style={s.input} placeholder="+91 00000 00000" placeholderTextColor={C.gray} value={form.phone} onChangeText={(v) => handleChange("phone", v.replace(/\D/g, ""))} keyboardType="phone-pad" maxLength={10} />

            {event?.food == 1 && (
              <>
                <Text style={s.label}>MEAL PREFERENCE</Text>
                <View style={s.inputRow}>
                  {["Veg", "Non-Veg"].map(opt => {
                    const sel = form.food_preference === opt;
                    const col = opt === "Veg" ? C.green : C.red;
                    const bg = sel ? (opt === "Veg" ? C.greenBg : C.redBg) : "transparent";
                    return (
                      <TouchableOpacity key={opt} style={[s.radioBtn, { borderColor: sel ? col : C.border, backgroundColor: bg }]} onPress={() => setForm({ ...form, food_preference: opt })}>
                        <View style={[s.radioDot, { backgroundColor: sel ? col : C.border }]} />
                        <Text style={[s.radioText, { color: sel ? col : C.gray }]}>{opt}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            {verified ? (
              <TouchableOpacity style={s.goldBtnBig} onPress={() => setStep(2)}>
                <Text style={s.goldBtnBigText}>Continue to Summary</Text>
                <ChevronRight size={18} color={C.dark} />
              </TouchableOpacity>
            ) : (
              <View style={s.unverifiedBox}>
                <Text style={s.unverifiedText}>Verify your email to continue</Text>
              </View>
            )}
          </View>
        )}

        {step === 2 && (
          <View style={s.formContainer}>
            <View style={s.reviewHeader}>
              <Text style={s.h2}>Review & Confirm</Text>
              <TouchableOpacity style={s.editBtn} onPress={() => setStep(1)}>
                <Edit size={14} color={C.gold} />
                <Text style={s.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={s.summaryCard}>
              <View style={s.sumRow}>
                <Text style={s.sumLabel}>Visitor Name</Text>
                <Text style={s.sumVal}>{form.name}</Text>
              </View>
              <View style={s.sumRow}>
                <Text style={s.sumLabel}>Email</Text>
                <Text style={s.sumVal}>{form.email}</Text>
              </View>
              <View style={[s.sumRow, { borderBottomWidth: 0 }]}>
                <Text style={s.sumLabel}>Phone</Text>
                <Text style={s.sumVal}>{form.phone || "—"}</Text>
              </View>
              {event?.food == 1 && (
                <View style={[s.sumRow, { borderBottomWidth: 0, borderTopWidth: 1, borderTopColor: C.border }]}>
                  <Text style={s.sumLabel}>Meal Preference</Text>
                  <View style={[s.mealPill, form.food_preference === "Veg" ? { backgroundColor: C.greenBg } : { backgroundColor: C.redBg }]}>
                    <Text style={[s.mealText, form.food_preference === "Veg" ? { color: C.green } : { color: C.red }]}>{form.food_preference}</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={s.totalBox}>
              <Text style={s.totalLabel}>Total</Text>
              <Text style={s.totalVal}>? 0.00</Text>
            </View>

            <TouchableOpacity style={s.tcBox} onPress={() => setAgreed(!agreed)}>
              <View style={[s.checkbox, agreed && { backgroundColor: C.gold, borderColor: C.gold }]}>
                {agreed && <CheckCircle size={14} color={C.dark} />}
              </View>
              <Text style={s.tcText}>I confirm my details are correct and agree to the event's <Text style={{ color: C.gold, textDecorationLine: "underline" }}>Terms & Policies</Text>.</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[s.goldBtnBig, !agreed && { backgroundColor: C.dark3 }]} onPress={handleBook} disabled={loading || !agreed}>
              {loading ? <ActivityIndicator size="small" color={agreed ? C.dark : C.gray} /> : (
                <>
                  <CheckCircle size={18} color={agreed ? C.dark : C.gray} />
                  <Text style={[s.goldBtnBigText, !agreed && { color: C.gray }]}>Confirm & Generate Ticket</Text>
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
  safeArea: { flex: 1, backgroundColor: C.dark },

  toast: { position: "absolute", top: 20, right: 20, left: 20, padding: 14, borderRadius: 12, borderWidth: 1, flexDirection: "row", alignItems: "center", zIndex: 9999, elevation: 10 },
  toastText: { fontSize: 13, fontWeight: "bold", marginLeft: 8 },

  topBar: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: C.dark2, borderBottomWidth: 1, borderBottomColor: C.border },
  topIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: C.gold, justifyContent: "center", alignItems: "center", marginRight: 12 },
  topBarTitle: { color: C.white, fontSize: 15, fontWeight: "bold" },
  topBarSub: { color: C.gray, fontSize: 12, marginTop: 2 },

  scrollContent: { padding: 20, paddingBottom: 40 },
  formContainer: { width: "100%", maxWidth: 500, alignSelf: "center" },

  h2: { fontSize: 24, fontWeight: "bold", color: C.white },
  p: { fontSize: 14, color: C.gray, marginTop: 6, marginBottom: 24 },

  label: { fontSize: 11, fontWeight: "bold", color: C.gray, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: C.dark3, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 14, color: C.white, fontSize: 14 },
  inputRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  
  goldBtnSmall: { backgroundColor: C.gold, borderRadius: 10, paddingHorizontal: 16, justifyContent: "center", alignItems: "center", height: 48 },
  goldBtnText: { color: C.dark, fontWeight: "bold", fontSize: 13 },
  verifiedPill: { flexDirection: "row", alignItems: "center", backgroundColor: C.greenBg, borderWidth: 1, borderColor: "rgba(62,207,142,0.3)", paddingHorizontal: 16, borderRadius: 10, height: 48, gap: 6 },
  verifiedText: { color: C.green, fontWeight: "bold", fontSize: 13 },

  otpBox: { backgroundColor: "rgba(201,169,110,0.06)", borderWidth: 1, borderColor: "rgba(201,169,110,0.2)", borderRadius: 12, padding: 16, marginTop: 16 },
  otpLabel: { color: C.gold, fontSize: 11, fontWeight: "bold", letterSpacing: 1, marginBottom: 10 },
  otpInput: { flex: 1, backgroundColor: C.dark3, borderWidth: 1, borderColor: C.border, borderRadius: 10, color: C.gold, fontSize: 20, fontWeight: "bold", textAlign: "center", letterSpacing: 10, height: 48 },

  radioBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderWidth: 1, borderRadius: 10, gap: 8 },
  radioDot: { width: 8, height: 8, borderRadius: 4 },
  radioText: { fontWeight: "bold", fontSize: 13 },

  goldBtnBig: { backgroundColor: C.gold, flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 16, borderRadius: 12, marginTop: 24, gap: 8 },
  goldBtnBigText: { color: C.dark, fontSize: 15, fontWeight: "bold" },
  
  unverifiedBox: { backgroundColor: C.dark3, borderWidth: 1, borderColor: C.border, padding: 16, borderRadius: 12, marginTop: 24, alignItems: "center" },
  unverifiedText: { color: C.gray, fontSize: 12, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1 },

  reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  editBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  editBtnText: { color: C.gold, fontSize: 14, fontWeight: "bold" },

  summaryCard: { backgroundColor: C.dark2, borderWidth: 1, borderColor: C.border, borderRadius: 14, overflow: "hidden", marginBottom: 16 },
  sumRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  sumLabel: { color: C.gray, fontSize: 13, fontWeight: "500" },
  sumVal: { color: C.white, fontSize: 14, fontWeight: "bold" },
  mealPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  mealText: { fontSize: 11, fontWeight: "bold" },

  totalBox: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, backgroundColor: "rgba(201,169,110,0.06)", borderWidth: 1, borderColor: "rgba(201,169,110,0.15)", borderRadius: 12, marginBottom: 16 },
  totalLabel: { color: C.white, fontSize: 18, fontWeight: "bold" },
  totalVal: { color: C.gold, fontSize: 22, fontWeight: "bold" },

  tcBox: { flexDirection: "row", alignItems: "flex-start", backgroundColor: C.dark3, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 16, marginBottom: 16, gap: 12 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: C.gray, justifyContent: "center", alignItems: "center", marginTop: 2 },
  tcText: { flex: 1, color: C.gray, fontSize: 13, lineHeight: 20 },

  successContainer: { flex: 1, padding: 20, justifyContent: "center", alignItems: "center" },
  successHeader: { alignItems: "center", marginBottom: 30 },
  successIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.greenBg, borderWidth: 1, borderColor: "rgba(62,207,142,0.3)", justifyContent: "center", alignItems: "center", marginBottom: 16 },
  successTitle: { fontSize: 26, fontWeight: "bold", color: C.white, marginBottom: 8 },
  successSub: { fontSize: 14, color: C.gray },

  ticketCard: { width: "100%", maxWidth: 400, backgroundColor: C.dark2, borderRadius: 20, borderWidth: 1, borderColor: C.border, overflow: "hidden", marginBottom: 30 },
  ticketTop: { padding: 24, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: "#16213e" },
  ticketRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  ticketLabel: { color: C.gold, fontSize: 11, fontWeight: "bold", letterSpacing: 2 },
  ticketEventName: { color: C.white, fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  ticketRowLoc: { flexDirection: "row", alignItems: "center", gap: 8 },
  ticketLocText: { color: C.gray, fontSize: 13 },

  ticketBody: { flexDirection: "row", padding: 24, gap: 20, alignItems: "center" },
  qrBox: { padding: 10, backgroundColor: C.white, borderRadius: 12 },
  qrImg: { width: 80, height: 80 },
  ticketDetails: { flex: 1, gap: 10 },
  dLabel: { color: C.gray, fontSize: 10, fontWeight: "bold", letterSpacing: 1, marginBottom: 2 },
  dVal: { color: C.white, fontSize: 14, fontWeight: "bold" },

  homeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: C.border, width: "100%", maxWidth: 400 },
  homeBtnText: { color: C.gray, fontSize: 14, fontWeight: "bold" }
});
