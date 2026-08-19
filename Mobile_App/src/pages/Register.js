import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye, EyeOff, ArrowRight, Sparkles, User, Mail, Lock, Shield, CheckCircle2, AlertCircle } from "lucide-react-native";
import { registerUser } from "@Services/api";

export default function Register({ navigation }) {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirm_password: "", role: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
    return /^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password);
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[!@#$%^&*]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password)) strength += 25;
    setPasswordStrength(strength);
  };

  const handleChange = (name, value) => {
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);

    setFieldErrors(prev => ({ ...prev, [name]: "" }));

    if (
      updatedForm.name && updatedForm.email && validateEmail(updatedForm.email) &&
      updatedForm.role && updatedForm.password && validatePassword(updatedForm.password) &&
      updatedForm.confirm_password && updatedForm.password === updatedForm.confirm_password
    ) {
      setFieldErrors({});
      setError("");
    }

    if (name === "password") calculatePasswordStrength(value);
  };

  const handleSubmit = async () => {
    setError("");
    setMessage("");
    setFieldErrors({});

    let errors = {};
    if (!formData.name) errors.name = "Name is required";
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Email is invalid";
    }
    if (!formData.role) errors.role = "Role is required";
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      errors.password = "Must be 8+ chars and contain special character";
    }
    if (!formData.confirm_password) {
      errors.confirm_password = "Confirm password is required";
    } else if (formData.password !== formData.confirm_password) {
      errors.confirm_password = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      await registerUser(formData);
      setMessage("Account created successfully");
      setTimeout(() => navigation?.navigate("Login"), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const strengthColor = passwordStrength < 25 ? "#ef4444" : passwordStrength < 50 ? "#f97316" : passwordStrength < 75 ? "#eab308" : "#10b981";
  const strengthLabel = passwordStrength < 25 ? "Weak" : passwordStrength < 50 ? "Fair" : passwordStrength < 75 ? "Good" : "Strong";

  return (
    <SafeAreaView style={s.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <View style={s.brandHeader}>
            <View style={s.logoIcon}>
              <Sparkles size={24} color="#fff" />
            </View>
            <Text style={s.brandText}>BookMyEvent</Text>
          </View>

          <View style={s.card}>
            <Text style={s.title}>Create Account</Text>
            <Text style={s.subtitle}>Join BookMyEvent to manage events</Text>

            {message ? (
              <View style={[s.alertBox, s.alertSuccess]}>
                <CheckCircle2 size={18} color="#34d399" />
                <Text style={s.alertTextSuccess}>{message}</Text>
              </View>
            ) : null}

            {error ? (
              <View style={[s.alertBox, s.alertError]}>
                <AlertCircle size={18} color="#f87171" />
                <Text style={s.alertTextError}>{error}</Text>
              </View>
            ) : null}

            <View style={s.inputGroup}>
              <Text style={s.label}>Full Name</Text>
              <View style={s.inputWrap}>
                <User size={18} color="#64748b" style={s.inputIcon} />
                <TextInput
                  style={[s.input, fieldErrors.name && s.inputError]}
                  placeholder="John Doe"
                  placeholderTextColor="#64748b"
                  value={formData.name}
                  onChangeText={(val) => handleChange("name", val)}
                />
              </View>
              {fieldErrors.name ? <Text style={s.errorText}>{fieldErrors.name}</Text> : null}
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>Email Address</Text>
              <View style={s.inputWrap}>
                <Mail size={18} color="#64748b" style={s.inputIcon} />
                <TextInput
                  style={[s.input, fieldErrors.email && s.inputError]}
                  placeholder="you@example.com"
                  placeholderTextColor="#64748b"
                  value={formData.email}
                  onChangeText={(val) => handleChange("email", val)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {fieldErrors.email ? <Text style={s.errorText}>{fieldErrors.email}</Text> : null}
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>Select Your Role</Text>
              <View style={s.roleGrid}>
                {[
                  { value: "organizer", label: "Organizer", Icon: Shield },
                  { value: "exhibitor", label: "Exhibitor", Icon: Sparkles }
                ].map(({ value, label, Icon }) => {
                  const isActive = formData.role === value;
                  return (
                    <TouchableOpacity
                      key={value}
                      style={[s.roleBtn, isActive && s.roleBtnActive]}
                      onPress={() => handleChange("role", value)}
                      activeOpacity={0.7}
                    >
                      <Icon size={24} color={isActive ? "#c084fc" : "#94a3b8"} />
                      <Text style={[s.roleText, isActive && s.roleTextActive]}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {fieldErrors.role ? <Text style={s.errorText}>{fieldErrors.role}</Text> : null}
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>Password</Text>
              <View style={s.inputWrap}>
                <Lock size={18} color="#64748b" style={s.inputIcon} />
                <TextInput
                  style={[s.input, fieldErrors.password && s.inputError, { paddingRight: 45 }]}
                  placeholder="••••••••"
                  placeholderTextColor="#64748b"
                  value={formData.password}
                  onChangeText={(val) => handleChange("password", val)}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity style={s.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                </TouchableOpacity>
              </View>
              {formData.password ? (
                <View style={s.strengthBox}>
                  <View style={s.strengthHeader}>
                    <Text style={s.strengthText}>Password strength:</Text>
                    <Text style={[s.strengthLabel, { color: strengthColor }]}>{strengthLabel}</Text>
                  </View>
                  <View style={s.strengthBarBg}>
                    <View style={[s.strengthBar, { width: `${passwordStrength}%`, backgroundColor: strengthColor }]} />
                  </View>
                </View>
              ) : null}
              {fieldErrors.password ? <Text style={s.errorText}>{fieldErrors.password}</Text> : null}
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>Confirm Password</Text>
              <View style={s.inputWrap}>
                <Lock size={18} color="#64748b" style={s.inputIcon} />
                <TextInput
                  style={[s.input, fieldErrors.confirm_password && s.inputError, { paddingRight: 45 }]}
                  placeholder="••••••••"
                  placeholderTextColor="#64748b"
                  value={formData.confirm_password}
                  onChangeText={(val) => handleChange("confirm_password", val)}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity style={s.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                </TouchableOpacity>
              </View>
              {fieldErrors.confirm_password ? <Text style={s.errorText}>{fieldErrors.confirm_password}</Text> : null}
              
              {formData.confirm_password && formData.password === formData.confirm_password && !fieldErrors.confirm_password && (
                <View style={s.matchBox}><CheckCircle2 size={14} color="#34d399"/><Text style={s.matchTextSuccess}>Passwords match</Text></View>
              )}
              {formData.confirm_password && formData.password !== formData.confirm_password && (
                <View style={s.matchBox}><AlertCircle size={14} color="#f87171"/><Text style={s.matchTextError}>Passwords do not match</Text></View>
              )}
            </View>

            <TouchableOpacity style={s.registerBtn} onPress={handleSubmit} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Text style={s.registerBtnText}>Create Account</Text>
                  <ArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>

            <View style={s.dividerRow}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>Already registered?</Text>
              <View style={s.dividerLine} />
            </View>

            <TouchableOpacity style={s.loginBtn} onPress={() => navigation?.navigate("Login")}>
              <Text style={s.loginBtnText}>Sign In Instead</Text>
              <ArrowRight size={16} color="#cbd5e1" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0f172a" },
  scrollContent: { padding: 24, flexGrow: 1, justifyContent: "center" },
  
  brandHeader: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 32 },
  logoIcon: { width: 40, height: 40, backgroundColor: "#c084fc", borderRadius: 10, alignItems: "center", justifyContent: "center", marginRight: 12 },
  brandText: { fontSize: 24, fontWeight: "bold", color: "#e879f9" },

  card: { backgroundColor: "rgba(30, 41, 59, 0.7)", borderRadius: 24, padding: 24, borderWidth: 1, borderColor: "rgba(51, 65, 85, 0.5)" },
  title: { fontSize: 28, fontWeight: "bold", color: "#f8fafc", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#94a3b8", textAlign: "center", marginBottom: 32 },

  alertBox: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 12, marginBottom: 20, borderWidth: 1, gap: 8 },
  alertSuccess: { backgroundColor: "rgba(16, 185, 129, 0.1)", borderColor: "rgba(16, 185, 129, 0.3)" },
  alertError: { backgroundColor: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.3)" },
  alertTextSuccess: { color: "#6ee7b7", fontSize: 13, flex: 1 },
  alertTextError: { color: "#fca5a5", fontSize: 13, flex: 1 },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "500", color: "#cbd5e1", marginBottom: 8 },
  inputWrap: { position: "relative", justifyContent: "center" },
  inputIcon: { position: "absolute", left: 16, zIndex: 10 },
  input: { backgroundColor: "rgba(51, 65, 85, 0.5)", borderWidth: 1, borderColor: "rgba(71, 85, 105, 0.5)", borderRadius: 12, paddingLeft: 46, paddingRight: 16, paddingVertical: 14, color: "#f8fafc", fontSize: 16 },
  inputError: { borderColor: "#ef4444" },
  eyeIcon: { position: "absolute", right: 16 },
  errorText: { color: "#f87171", fontSize: 12, marginTop: 6, marginLeft: 4 },

  roleGrid: { flexDirection: "row", gap: 12 },
  roleBtn: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 2, borderColor: "rgba(71, 85, 105, 0.3)", backgroundColor: "rgba(51, 65, 85, 0.3)", alignItems: "center", gap: 8 },
  roleBtnActive: { borderColor: "rgba(192, 132, 252, 0.5)", backgroundColor: "rgba(168, 85, 247, 0.2)" },
  roleText: { color: "#94a3b8", fontSize: 14, fontWeight: "600" },
  roleTextActive: { color: "#d8b4fe" },

  strengthBox: { marginTop: 10 },
  strengthHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  strengthText: { color: "#94a3b8", fontSize: 12 },
  strengthLabel: { fontWeight: "bold", fontSize: 12 },
  strengthBarBg: { height: 6, backgroundColor: "rgba(51, 65, 85, 0.5)", borderRadius: 3, overflow: "hidden" },
  strengthBar: { height: "100%", borderRadius: 3 },

  matchBox: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  matchTextSuccess: { color: "#34d399", fontSize: 12 },
  matchTextError: { color: "#f87171", fontSize: 12 },

  registerBtn: { backgroundColor: "#c084fc", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, borderRadius: 14, marginTop: 10, marginBottom: 24 },
  registerBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  dividerRow: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(71, 85, 105, 0.5)" },
  dividerText: { color: "#64748b", paddingHorizontal: 16, fontSize: 13 },

  loginBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, borderRadius: 14, borderWidth: 1, borderColor: "rgba(71, 85, 105, 0.5)" },
  loginBtnText: { color: "#cbd5e1", fontSize: 16, fontWeight: "600" },
});
