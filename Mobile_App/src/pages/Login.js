import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react-native";
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
        setFieldErrors(prev => ({ ...prev, email: "Enter a valid email" }));
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
    if (!formData.password) errors.password = "Password is required";

    setFieldErrors(errors);

    if (errors.email || errors.password) return;

    setError("");
    setIsLoading(true);

    try {
      const response = await loginUser(formData);
      const data = response.data;

      await AsyncStorage.multiSet([
        ["token", data.token || ""],
        ["role", data.role || ""],
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
        role: data.role,
        email: data.email,
        profile_image: data.profile_image
      }));

      if (data.role === "organizer") {
        const step1Done = await AsyncStorage.getItem("@organizer_step1_completed");
        if (step1Done === "true") {
          navigation.replace("OrganizerWelcome");
        } else {
          navigation.replace("OrganizerKYC");
        }
      } else if (data.role === "exhibitor") {
        navigation.replace("Exhibitor_Home");
      } else if (data.role === "superuser") {
        navigation.replace("Super_user_Home");
      } else {
        navigation.replace("Home");
      }
    } catch (err) {
      if (err.response) {
        const message = err.response.data.message;
        if (message === "Email Id is not registered") {
          setFieldErrors(prev => ({ ...prev, email: message }));
        } else if (message === "Incorrect password") {
          setFieldErrors(prev => ({ ...prev, password: message }));
        } else {
          setError(message);
        }
      } else {
        setError("Server error. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior="padding"
      >
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <View style={s.brandHeader}>
            <View style={s.logoIcon}>
              <Sparkles size={24} color="#fff" />
            </View>
            <Text style={s.brandText}>BookMyEvent</Text>
          </View>

          <View style={s.card}>
            <Text style={s.title}>Welcome Back</Text>
            <Text style={s.subtitle}>Sign in to your account</Text>

            {error ? (
              <View style={s.errorBox}>
                <View style={s.errorDot} />
                <Text style={s.errorBoxText}>{error}</Text>
              </View>
            ) : null}

            <View style={s.inputGroup}>
              <Text style={s.label}>Email Id <Text style={s.req}>*</Text></Text>
              <TextInput
                style={[s.input, fieldErrors.email && s.inputError]}
                placeholder="you@example.com"
                placeholderTextColor="#64748b"
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
                  placeholderTextColor="#64748b"
                  value={formData.password}
                  onChangeText={(val) => handleChange("password", val)}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  style={s.eyeIcon} 
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                </TouchableOpacity>
              </View>
              {fieldErrors.password ? <Text style={s.errorText}>{fieldErrors.password}</Text> : null}
            </View>

            <View style={s.optionsRow}>
              <TouchableOpacity 
                style={s.rememberMe} 
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.8}
              >
                <View style={[s.checkbox, rememberMe && s.checkboxActive]}>
                  {rememberMe && <View style={s.checkboxInner} />}
                </View>
                <Text style={s.rememberText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation?.navigate("ForgotPassword")}>
                <Text style={s.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={s.loginBtn} 
              onPress={handleSubmit} 
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={s.loginBtnText}>Sign In</Text>
                  <ArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>

            <View style={s.dividerRow}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>New to BookMyEvent?</Text>
              <View style={s.dividerLine} />
            </View>

            <TouchableOpacity 
              style={s.registerBtn} 
              onPress={() => navigation?.navigate("Register")}
            >
              <Text style={s.registerBtnText}>Create Account (Attendee)</Text>
              <ArrowRight size={16} color="#cbd5e1" style={{ marginLeft: 8 }} />
            </TouchableOpacity>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <TouchableOpacity
                style={[s.registerBtn, { flex: 1, backgroundColor: "rgba(249, 115, 22, 0.15)", borderColor: "#f97316" }]}
                onPress={() => navigation?.navigate("OrganizerKYC")}
              >
                <Text style={{ color: "#f97316", fontSize: 12, fontWeight: "bold" }}>List Your Show (Organizer)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.registerBtn, { flex: 1, backgroundColor: "rgba(16, 185, 129, 0.15)", borderColor: "#10b981" }]}
                onPress={() => navigation?.navigate("Exhibitor_Home")}
              >
                <Text style={{ color: "#10b981", fontSize: 12, fontWeight: "bold" }}>Exhibitor Portal</Text>
              </TouchableOpacity>
            </View>

          </View>
          
          <Text style={s.footerText}>By signing in, you agree to our Terms of Service</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0f172a" },
  scrollContent: { padding: 24, flexGrow: 1, justifyContent: "center" },
  
  brandHeader: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 32 },
  logoIcon: { width: 40, height: 40, backgroundColor: "#0ea5e9", borderRadius: 10, alignItems: "center", justifyContent: "center", marginRight: 12 },
  brandText: { fontSize: 24, fontWeight: "bold", color: "#38bdf8" },

  card: { backgroundColor: "rgba(30, 41, 59, 0.7)", borderRadius: 24, padding: 24, borderWidth: 1, borderColor: "rgba(51, 65, 85, 0.5)" },
  title: { fontSize: 28, fontWeight: "bold", color: "#f8fafc", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#94a3b8", textAlign: "center", marginBottom: 32 },

  errorBox: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(239, 68, 68, 0.1)", borderWidth: 1, borderColor: "rgba(239, 68, 68, 0.3)", padding: 12, borderRadius: 12, marginBottom: 20 },
  errorDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#ef4444", marginRight: 8 },
  errorBoxText: { color: "#fca5a5", fontSize: 13, fontWeight: "500" },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "500", color: "#cbd5e1", marginBottom: 8 },
  req: { color: "#ef4444" },
  input: { backgroundColor: "rgba(51, 65, 85, 0.5)", borderWidth: 1, borderColor: "rgba(71, 85, 105, 0.5)", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: "#f8fafc", fontSize: 16 },
  inputError: { borderColor: "#ef4444" },
  passwordWrap: { position: "relative" },
  eyeIcon: { position: "absolute", right: 16, top: 14 },
  errorText: { color: "#f87171", fontSize: 12, marginTop: 6 },

  optionsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
  rememberMe: { flexDirection: "row", alignItems: "center" },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: "#475569", alignItems: "center", justifyContent: "center", marginRight: 8 },
  checkboxActive: { backgroundColor: "#0ea5e9", borderColor: "#0ea5e9" },
  checkboxInner: { width: 10, height: 10, backgroundColor: "#fff", borderRadius: 2 },
  rememberText: { color: "#94a3b8", fontSize: 14 },
  forgotText: { color: "#38bdf8", fontSize: 14, fontWeight: "500" },

  loginBtn: { backgroundColor: "#0ea5e9", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, borderRadius: 14, marginBottom: 24 },
  loginBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  dividerRow: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(71, 85, 105, 0.5)" },
  dividerText: { color: "#64748b", paddingHorizontal: 16, fontSize: 13 },

  registerBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, borderRadius: 14, borderWidth: 1, borderColor: "rgba(71, 85, 105, 0.5)" },
  registerBtnText: { color: "#cbd5e1", fontSize: 16, fontWeight: "600" },

  footerText: { textAlign: "center", color: "#64748b", fontSize: 12, marginTop: 32 }
});
