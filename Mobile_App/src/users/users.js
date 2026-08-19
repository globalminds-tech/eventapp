import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Image, Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  MapPin, Phone, CheckCircle, XCircle, AlertTriangle,
  Send, Edit, Calendar, Utensils, Ticket, ChevronRight, ArrowLeft, Mail, User, ShieldCheck
} from "lucide-react-native";
import { getEventById, sendOtp, verifyOtp, resendOtp, bookEvent } from "@Services/api";

const { width } = Dimensions.get("window");

export default function Userbooking({ route, navigation }) {
  const id = route?.params?.eventId || "1";

  const [event, setEvent] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", food_preference: "Veg" });
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const [timer, setTimer] = useState(0);

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 4000);
  };

  useEffect(() => {
    if (id) {
      getEventById(id).then(setEvent).catch(console.error);
    }
  }, [id]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (name, value) => setForm({ ...form, [name]: value });
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendOtp = async () => {
    if (!form.email) return showToast("Please enter your email!", "warning");
    if (!validateEmail(form.email)) return showToast("Invalid email address!", "error");
    try {
      setLoading(true);
      await sendOtp(form.email);
      setOtpSent(true);
      setTimer(60);
      showToast("OTP sent to your email!", "success");
    } catch {
      showToast("Failed to send OTP.", "error");
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
    } catch {
      showToast("Invalid OTP.", "error");
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
      showToast("OTP resent!", "success");
    } catch {
      showToast("Failed to resend.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!verified) return showToast("Verify your email first.", "warning");
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
    } catch {
      showToast("Booking failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const ToastComponent = () => {
    if (!toast.show) return null;
    let bg = "#eff6ff", color = "#2563eb", Icon = CheckCircle;
    if (toast.type === "success") { bg = "#dcfce7"; color = "#16a34a"; }
    else if (toast.type === "error") { bg = "#fee2e2"; color = "#dc2626"; Icon = XCircle; }
    else if (toast.type === "warning") { bg = "#fef3c7"; color = "#d97706"; Icon = AlertTriangle; }
    return (
      <View style={[s.toast, { backgroundColor: bg }]}>
        <Icon size={16} color={color} />
        <Text style={[s.toastText, { color }]}>{toast.message}</Text>
      </View>
    );
  };

  if (step === 3 && successData) {
    return (
      <SafeAreaView style={s.safeArea}>
        <ToastComponent />
        <View style={s.successWrap}>
          <View style={s.successHeader}>
            <View style={s.successIconWrap}>
              <CheckCircle size={28} color="#2563eb" />
            </View>
            <Text style={s.successTitle}>Confirmed!</Text>
            <Text style={s.successSub}>YOUR DIGITAL PASS IS READY</Text>
          </View>

          <View style={s.ticketCard}>
            <View style={s.ticketTop}>
              <View style={s.ticketBadgeWrap}>
                <Text style={s.ticketBadge}>ENTRY PASS</Text>
              </View>
              <Text style={s.ticketEventName} numberOfLines={2}>{successData.event_details?.name}</Text>
              <View style={s.ticketLocRow}>
                <MapPin size={12} color="#dbeafe" />
                <Text style={s.ticketLocText} numberOfLines={1}>{successData.event_details?.venue}</Text>
              </View>
            </View>

            <View style={s.ticketBottom}>
              <View style={s.qrWrap}>
                <Image source={{ uri: `data:image/png;base64,${successData.qr_code}` }} style={s.qrImg} />
              </View>
              <View style={s.dashedLineWrap}>
                <View style={s.dashedLine} />
                <View style={s.admitBadge}><Text style={s.admitText}>ADMIT ONE</Text></View>
              </View>
              <View style={s.ticketInfoGrid}>
                <View style={s.ticketInfoCol}>
                  <Text style={s.dLabel}>DATE</Text>
                  <Text style={s.dVal}>{successData.event_details?.date}</Text>
                </View>
                <View style={s.ticketInfoCol}>
                  <Text style={s.dLabel}>GUEST</Text>
                  <Text style={s.dVal} numberOfLines={1}>{form.name}</Text>
                </View>
              </View>
              {event?.food == 1 && (
                <View style={s.mealBox}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Utensils size={14} color="#3b82f6" />
                    <Text style={s.mealBoxText}>{successData.event_details?.food}</Text>
                  </View>
                  <View style={[s.mealPill, successData.event_details?.food === "Veg" ? { backgroundColor: "#dcfce7" } : { backgroundColor: "#fee2e2" }]}>
                    <Text style={[s.mealPillText, successData.event_details?.food === "Veg" ? { color: "#15803d" } : { color: "#b91c1c" }]}>{successData.event_details?.food}</Text>
                  </View>
                </View>
              )}
            </View>
            {/* Cutouts */}
            <View style={s.cutoutLeft} />
            <View style={s.cutoutRight} />
          </View>

          <TouchableOpacity style={s.backBtn} onPress={() => navigation.navigate("Home")}>
            <ArrowLeft size={16} color="#2563eb" />
            <Text style={s.backBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safeArea}>
      <ToastComponent />

      {/* Top Header representing event info */}
      <View style={s.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <ArrowLeft size={20} color="#64748b" />
        </TouchableOpacity>
        <View style={s.headerContent}>
          <Text style={s.regBadge}>REGISTRATION</Text>
          <Text style={s.headerTitle} numberOfLines={1}>{event?.event_name || event?.name || "Loading..."}</Text>
          <Text style={s.headerDate}>{event?.start_date ? new Date(event.start_date).toLocaleDateString() : "--"}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        {step === 1 && (
          <View style={s.card}>
            <Text style={s.h2}>Complete booking</Text>
            <Text style={s.subText}>Enter your details below to secure your pass.</Text>

            <View style={s.fieldRow}>
              <View style={s.fieldCol}>
                <View style={s.labelRow}><User size={12} color="#3b82f6" /><Text style={s.label}>FULL NAME</Text></View>
                <TextInput style={s.input} placeholder="Jane Doe" placeholderTextColor="#94a3b8" value={form.name} onChangeText={(v) => handleChange("name", v)} />
              </View>
              <View style={s.fieldCol}>
                <View style={s.labelRow}><Phone size={12} color="#3b82f6" /><Text style={s.label}>PHONE</Text></View>
                <TextInput style={s.input} placeholder="Phone number" placeholderTextColor="#94a3b8" value={form.phone} onChangeText={(v) => handleChange("phone", v.replace(/\D/g, ""))} keyboardType="numeric" maxLength={10} />
              </View>
            </View>

            <View style={s.blueBox}>
              <View style={s.labelRow}><Mail size={12} color="#2563eb" /><Text style={s.labelBlue}>EMAIL ADDRESS</Text></View>
              <View style={s.inputRow}>
                <TextInput style={[s.input, { flex: 1, backgroundColor: verified ? "#f8fafc" : "#fff" }]} placeholder="email@example.com" placeholderTextColor="#94a3b8" value={form.email} onChangeText={(v) => handleChange("email", v)} editable={!verified} keyboardType="email-address" autoCapitalize="none" />
                {!verified ? (
                  <TouchableOpacity style={[s.actionBtn, (!form.email || (otpSent && timer > 0)) && s.actionBtnDisabled]} onPress={otpSent ? handleResendOtp : handleSendOtp} disabled={loading || !form.email || (otpSent && timer > 0)}>
                    {loading && !otpSent ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.actionBtnText}>{otpSent ? (timer > 0 ? `${timer}s` : "RESEND") : "GET OTP"}</Text>}
                  </TouchableOpacity>
                ) : (
                  <View style={s.verifiedTag}>
                    <ShieldCheck size={14} color="#15803d" />
                    <Text style={s.verifiedTagText}>VERIFIED</Text>
                  </View>
                )}
              </View>

              {otpSent && !verified && (
                <View style={s.otpWrap}>
                  <Text style={s.otpLabel}>SECURITY CODE</Text>
                  <View style={s.inputRow}>
                    <TextInput style={s.otpInput} placeholder="000000" placeholderTextColor="#cbd5e1" value={otp} onChangeText={(v) => setOtp(v.replace(/\D/g, ""))} maxLength={6} keyboardType="number-pad" />
                    <TouchableOpacity style={s.darkBtn} onPress={handleVerifyOtp} disabled={loading || !otp}>
                      {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.darkBtnText}>VERIFY</Text>}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {event?.food == 1 && (
              <View style={s.mealSec}>
                <View style={s.labelRow}><Utensils size={12} color="#3b82f6" /><Text style={s.label}>FOOD PREFERENCE</Text></View>
                <View style={s.inputRow}>
                  {["Veg", "Non-Veg"].map(opt => {
                    const sel = form.food_preference === opt;
                    const isVeg = opt === "Veg";
                    return (
                      <TouchableOpacity key={opt} style={[s.mealRadio, sel && (isVeg ? s.mealRadioVeg : s.mealRadioNonVeg)]} onPress={() => setForm({ ...form, food_preference: opt })}>
                        <View style={[s.radioDot, sel && (isVeg ? { backgroundColor: "#22c55e", borderColor: "#22c55e" } : { backgroundColor: "#ef4444", borderColor: "#ef4444" })]} />
                        <Text style={s.mealRadioText}>{opt}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            <TouchableOpacity style={[s.primaryBtn, !verified && s.primaryBtnDisabled]} onPress={() => setStep(2)} disabled={!verified}>
              <Text style={[s.primaryBtnText, !verified && { color: "#94a3b8" }]}>{verified ? "PROCEED TO SUMMARY" : "VERIFY EMAIL TO CONTINUE"}</Text>
              {verified && <ChevronRight size={16} color="#fff" />}
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={s.card}>
            <View style={s.reviewHeader}>
              <View>
                <Text style={s.h2}>Review Order</Text>
                <Text style={s.subText}>Verify details before confirming.</Text>
              </View>
              <TouchableOpacity style={s.editBtnSmall} onPress={() => setStep(1)}>
                <Edit size={12} color="#2563eb" />
                <Text style={s.editBtnSmallText}>EDIT</Text>
              </TouchableOpacity>
            </View>

            <View style={s.summaryCard}>
              <View style={s.summaryTopBar} />
              <View style={s.summaryBody}>
                <View style={s.sumRow}>
                  <Text style={s.sumTxtL}>Entry Pass (1x)</Text>
                  <Text style={s.sumTxtR}>?0.00</Text>
                </View>
                <View style={s.sumRow}>
                  <Text style={s.sumTxtL}>Service Fee</Text>
                  <Text style={s.sumTxtR}>?0.00</Text>
                </View>
                
                <View style={s.dashDivider} />

                <View style={s.detailGrid}>
                  <View style={s.detailCol}>
                    <Text style={s.dLabelSmall}>GUEST NAME</Text>
                    <Text style={s.dValSmall}>{form.name}</Text>
                  </View>
                  <View style={s.detailCol}>
                    <Text style={s.dLabelSmall}>EMAIL</Text>
                    <Text style={s.dValSmall}>{form.email}</Text>
                  </View>
                  {event?.food == 1 && (
                    <View style={s.detailColFull}>
                      <Text style={s.dLabelSmall}>SELECTED MEAL</Text>
                      <View style={[s.mealPillSmall, form.food_preference === "Veg" ? { backgroundColor: "#dcfce7", borderColor: "#bbf7d0" } : { backgroundColor: "#fee2e2", borderColor: "#fecaca" }]}>
                        <Text style={[s.mealPillSmallTxt, form.food_preference === "Veg" ? { color: "#15803d" } : { color: "#b91c1c" }]}>{form.food_preference}</Text>
                      </View>
                    </View>
                  )}
                </View>

                <View style={s.dashDivider} />

                <View style={s.sumRowEnd}>
                  <Text style={s.dLabelSmall}>TOTAL AMOUNT</Text>
                  <Text style={s.totalPrice}>Free</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={s.tcWrap} onPress={() => setAgreed(!agreed)}>
              <View style={[s.checkSq, agreed && s.checkSqActive]}>
                {agreed && <CheckCircle size={14} color="#fff" />}
              </View>
              <Text style={s.tcTxt}>I confirm all details are correct and I agree to the Terms and conditions.</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[s.primaryBtn, (!agreed || loading) && s.primaryBtnDisabled]} onPress={handleBook} disabled={!agreed || loading}>
              {loading ? <ActivityIndicator size="small" color="#94a3b8" /> : (
                <>
                  <Text style={[s.primaryBtnText, (!agreed) && { color: "#94a3b8" }]}>CONFIRM & GET PASS</Text>
                  <ShieldCheck size={18} color={agreed ? "#fff" : "#94a3b8"} />
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
  safeArea: { flex: 1, backgroundColor: "#f8fafc" },
  
  toast: { position: "absolute", top: 20, alignSelf: "center", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 8, zIndex: 1000, elevation: 5 },
  toastText: { fontSize: 13, fontWeight: "bold" },

  headerBar: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  headerContent: { marginLeft: 12, flex: 1 },
  regBadge: { backgroundColor: "#eff6ff", color: "#2563eb", fontSize: 9, fontWeight: "bold", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: "flex-start", overflow: "hidden", borderWidth: 1, borderColor: "#dbeafe", marginBottom: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#0f172a" },
  headerDate: { fontSize: 11, color: "#64748b", marginTop: 2 },

  scrollContent: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: "#fff", padding: 20, borderRadius: 24, borderWidth: 1, borderColor: "#e2e8f0", elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 },

  h2: { fontSize: 22, fontWeight: "bold", color: "#0f172a" },
  subText: { fontSize: 13, color: "#64748b", marginTop: 4, marginBottom: 20 },

  fieldRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  fieldCol: { flex: 1 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  label: { fontSize: 10, fontWeight: "bold", color: "#94a3b8", letterSpacing: 1 },
  input: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 12, fontSize: 14, color: "#0f172a", fontWeight: "600" },

  blueBox: { backgroundColor: "#eff6ff", borderWidth: 1, borderColor: "#dbeafe", borderRadius: 16, padding: 16, marginBottom: 16 },
  labelBlue: { fontSize: 10, fontWeight: "bold", color: "#64748b", letterSpacing: 1 },
  inputRow: { flexDirection: "row", gap: 8 },
  actionBtn: { backgroundColor: "#2563eb", borderRadius: 12, paddingHorizontal: 16, justifyContent: "center", alignItems: "center" },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  verifiedTag: { backgroundColor: "#dcfce7", borderWidth: 1, borderColor: "#bbf7d0", borderRadius: 12, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 6 },
  verifiedTagText: { color: "#15803d", fontWeight: "bold", fontSize: 11 },

  otpWrap: { borderTopWidth: 1, borderTopColor: "#dbeafe", marginTop: 12, paddingTop: 12 },
  otpLabel: { fontSize: 10, fontWeight: "bold", color: "#64748b", letterSpacing: 1, marginBottom: 6 },
  otpInput: { flex: 1, backgroundColor: "#fff", borderWidth: 1, borderColor: "#bfdbfe", borderRadius: 12, padding: 12, fontSize: 18, color: "#2563eb", fontWeight: "bold", textAlign: "center", letterSpacing: 6 },
  darkBtn: { backgroundColor: "#0f172a", borderRadius: 12, paddingHorizontal: 20, justifyContent: "center", alignItems: "center" },
  darkBtnText: { color: "#fff", fontWeight: "bold", fontSize: 12 },

  mealSec: { marginBottom: 20 },
  mealRadio: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderWidth: 2, borderColor: "#f1f5f9", backgroundColor: "#f8fafc", borderRadius: 12, gap: 8 },
  mealRadioVeg: { backgroundColor: "#f0fdf4", borderColor: "#22c55e" },
  mealRadioNonVeg: { backgroundColor: "#fef2f2", borderColor: "#ef4444" },
  radioDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: "#cbd5e1" },
  mealRadioText: { fontSize: 12, fontWeight: "bold", color: "#64748b", textTransform: "uppercase" },

  primaryBtn: { backgroundColor: "#2563eb", flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 16, borderRadius: 12, gap: 8, marginTop: 10 },
  primaryBtnDisabled: { backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: "#e2e8f0" },
  primaryBtnText: { color: "#fff", fontSize: 13, fontWeight: "bold" },

  reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 },
  editBtnSmall: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#eff6ff", borderWidth: 1, borderColor: "#dbeafe", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  editBtnSmallText: { color: "#2563eb", fontSize: 10, fontWeight: "bold", letterSpacing: 1 },

  summaryCard: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 16, overflow: "hidden", marginBottom: 20 },
  summaryTopBar: { height: 6, backgroundColor: "#3b82f6" },
  summaryBody: { padding: 20 },
  sumRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  sumTxtL: { color: "#475569", fontSize: 13, fontWeight: "500" },
  sumTxtR: { color: "#0f172a", fontSize: 13, fontWeight: "bold" },
  dashDivider: { height: 1, borderWidth: 1, borderStyle: "dashed", borderColor: "#cbd5e1", marginVertical: 16 },
  detailGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16, backgroundColor: "#fff", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#f1f5f9" },
  detailCol: { width: "45%" },
  detailColFull: { width: "100%", borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 12 },
  dLabelSmall: { fontSize: 9, fontWeight: "bold", color: "#94a3b8", letterSpacing: 1, marginBottom: 2 },
  dValSmall: { fontSize: 13, fontWeight: "bold", color: "#0f172a" },
  mealPillSmall: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, marginTop: 4 },
  mealPillSmallTxt: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase" },
  sumRowEnd: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  totalPrice: { fontSize: 24, fontWeight: "bold", color: "#2563eb" },

  tcWrap: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 16, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, marginBottom: 20 },
  checkSq: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: "#cbd5e1", justifyContent: "center", alignItems: "center" },
  checkSqActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  tcTxt: { flex: 1, fontSize: 12, color: "#475569", lineHeight: 18, fontWeight: "500" },

  successWrap: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  successHeader: { alignItems: "center", marginBottom: 24 },
  successIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#dbeafe", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  successTitle: { fontSize: 24, fontWeight: "bold", color: "#0f172a" },
  successSub: { fontSize: 10, color: "#64748b", fontWeight: "bold", letterSpacing: 2, marginTop: 4 },

  ticketCard: { width: "100%", maxWidth: 360, backgroundColor: "#fff", borderRadius: 24, borderWidth: 1, borderColor: "#f1f5f9", elevation: 10, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 20, marginBottom: 24, overflow: "visible" },
  ticketTop: { backgroundColor: "#1e3a8a", padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  ticketBadgeWrap: { alignSelf: "flex-end", backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginBottom: 16 },
  ticketBadge: { color: "#fff", fontSize: 8, fontWeight: "bold", letterSpacing: 2 },
  ticketEventName: { color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  ticketLocRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ticketLocText: { color: "#dbeafe", fontSize: 12, flex: 1 },

  ticketBottom: { padding: 24, backgroundColor: "#fff", borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  qrWrap: { alignSelf: "center", padding: 8, backgroundColor: "#f8fafc", borderRadius: 12, borderWidth: 1, borderColor: "#f1f5f9", marginBottom: 20 },
  qrImg: { width: 100, height: 100 },
  
  dashedLineWrap: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 16 },
  dashedLine: { position: "absolute", width: "100%", height: 1, borderWidth: 1, borderColor: "#e2e8f0", borderStyle: "dashed" },
  admitBadge: { backgroundColor: "#fff", paddingHorizontal: 12, zIndex: 1 },
  admitText: { fontSize: 9, fontWeight: "bold", color: "#94a3b8", letterSpacing: 2 },

  ticketInfoGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  ticketInfoCol: { flex: 1 },
  dLabel: { fontSize: 10, fontWeight: "bold", color: "#94a3b8", letterSpacing: 1, marginBottom: 4 },
  dVal: { fontSize: 14, fontWeight: "bold", color: "#0f172a" },
  
  mealBox: { backgroundColor: "#f8fafc", padding: 12, borderRadius: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#f1f5f9" },
  mealBoxText: { fontSize: 13, fontWeight: "bold", color: "#0f172a" },

  cutoutLeft: { position: "absolute", left: -16, top: 120, width: 32, height: 32, borderRadius: 16, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#f1f5f9" },
  cutoutRight: { position: "absolute", right: -16, top: 120, width: 32, height: 32, borderRadius: 16, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#f1f5f9" },

  backBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 16, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", width: "100%", maxWidth: 360 },
  backBtnText: { color: "#0f172a", fontSize: 13, fontWeight: "bold" }
});
