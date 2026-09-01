import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye, EyeOff, ArrowRight, ArrowLeft, Sparkles, X } from "lucide-react-native";
import { loginUser } from "@Services/api";
import { useDispatch } from "react-redux";
import { setUser } from "@Redux/userSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login({ navigation }) {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);

  useEffect(() => {
    const loadRememberedData = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("rememberedEmail");
        const savedRememberMe = await AsyncStorage.getItem("rememberMe");
        if (savedRememberMe === "true" && savedEmail) {
          setFormData(prev => ({ ...prev, email: savedEmail }));
          setRememberMe(true);
        }
      } catch (err) {
        console.error("Error loading remembered data", err);
      }
    };
    loadRememberedData();
  }, []);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });

    if (name === "email") {
      if (!value) {
        setFieldErrors(prev => ({ ...prev, email: "Email is required" }));
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setFieldErrors(prev => ({ ...prev, email: "Enter a valid email address" }));
      } else {
        setFieldErrors(prev => ({ ...prev, email: "" }));
      }
    }

    if (name === "password") {
      if (!value) {
        setFieldErrors(prev => ({ ...prev, password: "Password is required" }));
      } else {
        setFieldErrors(prev => ({ ...prev, password: "" }));
      }
    }
  };

  const handleSubmit = async () => {
    let errors = { email: "", password: "" };
    if (!formData.email) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Enter a valid email address";
    if (!formData.password) errors.password = "Password is required";

    setFieldErrors(errors);
    if (errors.email || errors.password) return;

    setError("");
    setIsLoading(true);

    try {
      const response = await loginUser(formData);
      const data = response.data;
      const userRole = (data.role || "user").toLowerCase();

      await AsyncStorage.multiSet([
        ["token", data.token || ""],
        ["role", userRole],
        ["id", data.User_id?.toString() || ""],
        ["name", data.name || ""],
        ["profile_image", data.profile_image || ""]
      ]);

      if (rememberMe) {
        await AsyncStorage.setItem("rememberedEmail", formData.email);
        await AsyncStorage.setItem("rememberMe", "true");
      } else {
        await AsyncStorage.removeItem("rememberedEmail");
        await AsyncStorage.removeItem("rememberMe");
      }

      dispatch(setUser({
        id: data.User_id,
        name: data.name,
        role: userRole,
        email: data.email,
        profile_image: data.profile_image
      }));

      if (userRole === "organizer") {
        navigation.replace("Organizerdashboard");
      } else if (userRole === "exhibitor") {
        navigation.replace("Exhibitor_Home");
      } else if (userRole === "superuser" || userRole === "superadmin") {
        navigation.replace("Super_user_Home");
      } else {
        navigation.replace("Home");
      }
    } catch (err) {
      if (err.response) {
        const message = err.response.data.message || err.response.data.detail;
        if (message === "Email Id is not registered") {
          setFieldErrors(prev => ({ ...prev, email: message }));
        } else if (message === "Incorrect password") {
          setFieldErrors(prev => ({ ...prev, password: message }));
        } else {
          setError(message || "Invalid credentials. Please check your inputs.");
        }
      } else {
        setError("Server error. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <View style={s.card}>
            {/* Header */}
            <View style={{ marginBottom: 24 }}>
              <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                <ArrowLeft size={14} color="#64748b" />
                <Text style={s.backText}>Back</Text>
              </TouchableOpacity>
              <Text style={s.title}>Sign In</Text>
              <Text style={s.subtitle}>Enter your account credentials to continue</Text>
            </View>

            {error ? (
              <View style={s.errorBox}>
                <Text style={s.errorBoxText}>{error}</Text>
              </View>
            ) : null}

            {/* Form */}
            <View style={s.inputGroup}>
              <Text style={s.label}>Email Address <Text style={s.req}>*</Text></Text>
              <TextInput
                style={[s.input, fieldErrors.email && s.inputError]}
                placeholder="you@example.com"
                placeholderTextColor="#94a3b8"
                value={formData.email}
                onChangeText={(val) => handleChange("email", val)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {fieldErrors.email ? <Text style={s.errorText}>{fieldErrors.email}</Text> : null}
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>Password <Text style={s.req}>*</Text></Text>
              <View style={s.passwordWrap}>
                <TextInput
                  style={[s.input, fieldErrors.password && s.inputError, { paddingRight: 45 }]}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  value={formData.password}
                  onChangeText={(val) => handleChange("password", val)}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity style={s.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
                </TouchableOpacity>
              </View>
              {fieldErrors.password ? <Text style={s.errorText}>{fieldErrors.password}</Text> : null}
            </View>

            <View style={s.optionsRow}>
              <TouchableOpacity style={s.rememberMe} onPress={() => setRememberMe(!rememberMe)} activeOpacity={0.8}>
                <View style={[s.checkbox, rememberMe && s.checkboxActive]}>
                  {rememberMe && <View style={s.checkboxInner} />}
                </View>
                <Text style={s.rememberText}>Remember me</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation?.navigate("Forgetpsw")}>
                <Text style={s.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.loginBtn} onPress={handleSubmit} disabled={isLoading} activeOpacity={0.8}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={s.loginBtnText}>Sign In</Text>
                  <ArrowRight size={18} color="#fff" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>

            <View style={s.footerDivider}>
              <View style={s.newUserRow}>
                <Text style={s.newUserText}>New to BookMyEvent?</Text>
                <TouchableOpacity onPress={() => navigation?.navigate("Register")}>
                  <Text style={s.createAccText}>Create Account →</Text>
                </TouchableOpacity>
              </View>
              
              <View style={s.partnerBox}>
                <View style={s.partnerLeft}>
                  <Sparkles size={16} color="#0ea5e9" />
                  <Text style={s.partnerText}>Want to Host an Event or Reserve a Stall?</Text>
                </View>
                <TouchableOpacity style={s.partnerBtn} onPress={() => setShowPartnerModal(true)}>
                  <Text style={s.partnerBtnText}>View Partner Options</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
          
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Partner Modal */}
      <Modal visible={showPartnerModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <TouchableOpacity style={s.closeModalBtn} onPress={() => setShowPartnerModal(false)}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
            
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 6 }}>
                <Sparkles size={16} color="#0ea5e9" />
                <Text style={s.modalTag}>PARTNER ONBOARDING HUB</Text>
              </View>
              <Text style={s.modalTitle}>List Your Show or Book Vendor Stalls</Text>
              <Text style={s.modalDesc}>Select your partner account type to register.</Text>
            </View>

            <View style={s.partnerCardRow}>
              <View style={[s.partnerCard, { borderColor: '#bae6fd', backgroundColor: '#f0f9ff' }]}>
                <View style={s.partnerBadgeWrap}><Text style={s.partnerBadgeText}>ORGANIZER</Text></View>
                <Text style={s.partnerCardTitle}>List Your Show</Text>
                <Text style={s.partnerCardDesc}>Host concerts, tech expos & workshops.</Text>
                <TouchableOpacity style={[s.partnerActionBtn, { backgroundColor: '#0ea5e9' }]} onPress={() => { setShowPartnerModal(false); navigation.navigate("Register"); }}>
                  <Text style={s.partnerActionBtnText}>New? Register →</Text>
                </TouchableOpacity>
              </View>
              
              <View style={[s.partnerCard, { borderColor: '#a7f3d0', backgroundColor: '#ecfdf5' }]}>
                <View style={[s.partnerBadgeWrap, { backgroundColor: '#d1fae5' }]}><Text style={[s.partnerBadgeText, { color: '#047857' }]}>EXHIBITOR</Text></View>
                <Text style={s.partnerCardTitle}>Exhibit & Book Stalls</Text>
                <Text style={s.partnerCardDesc}>Reserve booth stalls on floor plans.</Text>
                <TouchableOpacity style={[s.partnerActionBtn, { backgroundColor: '#10b981' }]} onPress={() => { setShowPartnerModal(false); navigation.navigate("Register"); }}>
                  <Text style={s.partnerActionBtnText}>New? Register →</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { padding: 16, flexGrow: 1, justifyContent: "center" },
  
  card: { backgroundColor: "#ffffff", borderRadius: 24, padding: 24, borderWidth: 1, borderColor: "#e2e8f0", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  backText: { fontSize: 12, fontWeight: '800', color: '#64748b' },
  
  title: { fontSize: 24, fontWeight: "900", color: "#0f172a", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#64748b", fontWeight: "600", marginBottom: 24 },

  errorBox: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca", padding: 12, borderRadius: 12, marginBottom: 20 },
  errorBoxText: { color: "#dc2626", fontSize: 12, fontWeight: "700" },

  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: "800", color: "#334155", marginBottom: 6 },
  req: { color: "#ef4444" },
  input: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: "#0f172a", fontSize: 14, fontWeight: "600" },
  inputError: { borderColor: "#ef4444" },
  passwordWrap: { position: "relative" },
  eyeIcon: { position: "absolute", right: 16, top: 14 },
  errorText: { color: "#ef4444", fontSize: 11, fontWeight: '700', marginTop: 4 },

  optionsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  rememberMe: { flexDirection: "row", alignItems: "center" },
  checkbox: { width: 16, height: 16, borderRadius: 4, borderWidth: 1, borderColor: "#cbd5e1", alignItems: "center", justifyContent: "center", marginRight: 8 },
  checkboxActive: { backgroundColor: "#0ea5e9", borderColor: "#0ea5e9" },
  checkboxInner: { width: 8, height: 8, backgroundColor: "#fff", borderRadius: 2 },
  rememberText: { color: "#64748b", fontSize: 12, fontWeight: '600' },
  forgotText: { color: "#0ea5e9", fontSize: 12, fontWeight: "800" },

  loginBtn: { backgroundColor: "#0ea5e9", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, borderRadius: 12, marginBottom: 24, shadowColor: "#0ea5e9", shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  loginBtnText: { color: "#fff", fontSize: 14, fontWeight: "900", textTransform: 'uppercase', letterSpacing: 0.5 },

  footerDivider: { borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 20 },
  newUserRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  newUserText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  createAccText: { fontSize: 12, color: '#0ea5e9', fontWeight: '800' },
  
  partnerBox: { backgroundColor: '#f8fafc', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', gap: 10 },
  partnerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  partnerText: { fontSize: 12, fontWeight: '800', color: '#334155', flex: 1 },
  partnerBtn: { backgroundColor: '#f0f9ff', paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#bae6fd', alignItems: 'center' },
  partnerBtnText: { color: '#0284c7', fontSize: 12, fontWeight: '900' },
  
  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.7)", justifyContent: "center", alignItems: "center", padding: 16 },
  modalContent: { width: "100%", backgroundColor: "#ffffff", borderRadius: 24, padding: 24 },
  closeModalBtn: { position: "absolute", top: 16, right: 16, padding: 4, zIndex: 10 },
  modalTag: { fontSize: 10, fontWeight: '900', color: '#0284c7', letterSpacing: 0.5 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 4 },
  modalDesc: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  
  partnerCardRow: { gap: 12 },
  partnerCard: { padding: 16, borderRadius: 16, borderWidth: 1 },
  partnerBadgeWrap: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#e0f2fe', borderRadius: 12, marginBottom: 8 },
  partnerBadgeText: { fontSize: 9, fontWeight: '900', color: '#0369a1' },
  partnerCardTitle: { fontSize: 14, fontWeight: '900', color: '#0f172a', marginBottom: 4 },
  partnerCardDesc: { fontSize: 11, color: '#475569', marginBottom: 12, lineHeight: 16 },
  partnerActionBtn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  partnerActionBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '800' }
});
