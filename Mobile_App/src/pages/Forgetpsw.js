import React, { useState, useEffect, useRef } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from "lucide-react-native";
import { resetsendOtp, resetverifyOtp, resetresendOtp, resetPassword } from "@Services/api";

export default function ForgotPassword({ navigation }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef(null);

  const otpRefs = useRef([]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(60);
    setCanResend(false);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (step === 2) startTimer();
  }, [step]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (message) {
      setError("");
      const t = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      setMessage("");
      const t = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSendOtp = async () => {
    if (!email) return setError("Please enter your email Id");
    if (!validateEmail(email)) return setError("Enter a valid email address");
    
    setLoading(true);
    setError("");
    try {
      const res = await resetsendOtp({ email });
      setMessage(res.message || "OTP sent successfully");
      setStep(2);
      startTimer();
    } catch (err) {
      setError("Failed to send OTP. Please check your email.");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otpDigits.join("");
    if (fullOtp.length < 6) return setError("Please enter the complete OTP");
    
    setLoading(true);
    setError("");
    try {
      const res = await resetverifyOtp({ email, otp: fullOtp });
      if (res.status) {
        setMessage("OTP verified");
        setStep(3);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await resetresendOtp({ email });
      setMessage("OTP resent to your email");
      setOtpDigits(["", "", "", "", "", ""]);
      if (otpRefs.current[0]) otpRefs.current[0].focus();
      startTimer();
    } catch (err) {
      setError("Resend failed. Please try again.");
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (password.length < 8) return setError("Password must be at least 8 characters");
    const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!complexityRegex.test(password)) {
      return setError("Must contain uppercase, lowercase, number & special char");
    }
    if (password !== confirmPassword) return setError("Passwords do not match");

    setLoading(true);
    try {
      await resetPassword({ email, password });
      setStep(4);
    } catch (err) {
      setError("Reset failed. Please try again.");
    }
    setLoading(false);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    if (value && index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1].focus();
    }
  };

  const steps = [
    { num: 1, label: "Email" },
    { num: 2, label: "Verify" },
    { num: 3, label: "Reset" },
  ];

  return (
    <SafeAreaView style={s.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <View style={s.card}>
            <View style={s.iconWrap}>
              <KeyRound size={24} color="#f8fafc" />
            </View>

            {step < 4 && (
              <>
                <Text style={s.title}>Reset Password</Text>
                <Text style={s.subtitle}>
                  {step === 1 && "Enter your registered email to receive a verification code."}
                  {step === 2 && `Code sent to ${email}`}
                  {step === 3 && "Password must be at least 8 characters with uppercase, lowercase, numbers, and special symbols."}
                </Text>

                <View style={s.stepsWrap}>
                  {steps.map((st, i) => {
                    const state = step > st.num ? "done" : step === st.num ? "active" : "pending";
                    return (
                      <React.Fragment key={st.num}>
                        <View style={s.stepItem}>
                          <View style={[s.stepDot, state === "done" && s.stepDotDone, state === "active" && s.stepDotActive]}>
                            {state === "done" ? <CheckCircle2 size={12} color="#6366f1" /> : <Text style={[s.stepDotText, state === "active" && s.stepDotTextActive]}>{st.num}</Text>}
                          </View>
                          <Text style={[s.stepLabel, state === "done" && s.stepLabelDone, state === "active" && s.stepLabelActive]}>{st.label}</Text>
                        </View>
                        {i < steps.length - 1 && <View style={[s.stepLine, step > st.num && s.stepLineDone]} />}
                      </React.Fragment>
                    );
                  })}
                </View>
              </>
            )}

            {/* Error & Success Messages */}
            {message ? (
              <View style={[s.alertBox, s.alertSuccess]}>
                <CheckCircle2 size={16} color="#34d399" />
                <Text style={s.alertTextSuccess}>{message}</Text>
              </View>
            ) : null}

            {error ? (
              <View style={[s.alertBox, s.alertError]}>
                <AlertCircle size={16} color="#f87171" />
                <Text style={s.alertTextError}>{error}</Text>
              </View>
            ) : null}

            {/* Step 1 */}
            {step === 1 && (
              <View>
                <Text style={s.label}>Email ID</Text>
                <TextInput
                  style={s.input}
                  placeholder="you@example.com"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity style={s.primaryBtn} onPress={handleSendOtp} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryBtnText}>Send verification code</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={s.ghostBtn} onPress={() => navigation?.goBack()}>
                  <Text style={s.ghostBtnText}>Back to login</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <View>
                <Text style={s.label}>Verification code</Text>
                <View style={s.otpGrid}>
                  {otpDigits.map((digit, i) => (
                    <TextInput
                      key={i}
                      ref={el => otpRefs.current[i] = el}
                      style={s.otpCell}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(val) => handleOtpChange(i, val)}
                      onKeyPress={({ nativeEvent }) => {
                        if (nativeEvent.key === 'Backspace' && !digit && i > 0) {
                          otpRefs.current[i - 1].focus();
                        }
                      }}
                    />
                  ))}
                </View>
                <TouchableOpacity style={s.primaryBtn} onPress={handleVerifyOtp} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryBtnText}>Verify code</Text>}
                </TouchableOpacity>
                
                <View style={{ alignItems: "center", marginTop: 12 }}>
                  {!canResend ? (
                    <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                      Resend OTP in <Text style={{ color: "#818cf8" }}>{timer}s</Text>
                    </Text>
                  ) : (
                    <TouchableOpacity onPress={handleResendOtp} disabled={loading}>
                      <Text style={{ color: "#818cf8", fontSize: 13, fontWeight: "bold" }}>Resend code</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity style={s.ghostBtn} onPress={() => navigation?.goBack()}>
                  <Text style={s.ghostBtnText}>Back to login</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <View>
                <Text style={s.label}>New password</Text>
                <View style={s.inputWrap}>
                  <TextInput
                    style={[s.input, { paddingRight: 45 }]}
                    placeholder="Min. 8 characters"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity style={s.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={20} color="rgba(255,255,255,0.3)" /> : <Eye size={20} color="rgba(255,255,255,0.3)" />}
                  </TouchableOpacity>
                </View>

                <Text style={s.label}>Confirm password</Text>
                <TextInput
                  style={s.input}
                  placeholder="Re-enter your password"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity style={s.primaryBtn} onPress={handleResetPassword} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryBtnText}>Update password</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={s.ghostBtn} onPress={() => navigation?.goBack()}>
                  <Text style={s.ghostBtnText}>Back to login</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <View style={s.successWrap}>
                <View style={s.successIcon}>
                  <CheckCircle2 size={36} color="#34d399" />
                </View>
                <Text style={s.title}>All done!</Text>
                <Text style={s.subtitle}>Your password has been updated successfully. You can now log in with your new credentials.</Text>
                <TouchableOpacity style={s.primaryBtn} onPress={() => navigation?.navigate("Login")}>
                  <Text style={s.primaryBtnText}>Back to login</Text>
                </TouchableOpacity>
              </View>
            )}
            
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0a0a0f" },
  scrollContent: { padding: 24, flexGrow: 1, justifyContent: "center" },

  card: { backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 24, padding: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  
  iconWrap: { width: 52, height: 52, borderRadius: 14, backgroundColor: "rgba(99,102,241,0.2)", borderWidth: 1, borderColor: "rgba(99,102,241,0.3)", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  
  title: { fontSize: 26, fontWeight: "bold", color: "#f1f1f5", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 22, marginBottom: 32 },

  stepsWrap: { flexDirection: "row", alignItems: "center", marginBottom: 32 },
  stepItem: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  stepDotDone: { backgroundColor: "rgba(99,102,241,0.2)", borderColor: "rgba(99,102,241,0.4)" },
  stepDotActive: { backgroundColor: "#ec4899", borderColor: "#ec4899" }, // placeholder for gradient
  stepDotText: { color: "rgba(255,255,255,0.2)", fontSize: 11, fontWeight: "bold" },
  stepDotTextActive: { color: "#fff" },
  stepLabel: { fontSize: 11, fontWeight: "bold", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" },
  stepLabelDone: { color: "rgba(99,102,241,0.7)" },
  stepLabelActive: { color: "rgba(255,255,255,0.8)" },
  stepLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.07)", marginHorizontal: 8 },
  stepLineDone: { backgroundColor: "#6366f1" },

  label: { fontSize: 12, fontWeight: "bold", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", marginBottom: 8, marginTop: 10 },
  inputWrap: { position: "relative" },
  input: { width: "100%", padding: 14, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 12, color: "#f1f1f5", fontSize: 15, marginBottom: 20 },
  eyeIcon: { position: "absolute", right: 14, top: 14 },

  otpGrid: { flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 20 },
  otpCell: { width: 45, height: 55, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 12, textAlign: "center", fontSize: 22, fontWeight: "bold", color: "#f1f1f5" },

  primaryBtn: { width: "100%", padding: 15, backgroundColor: "#6366f1", borderRadius: 12, alignItems: "center", marginTop: 10 },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "bold" },

  ghostBtn: { alignItems: "center", marginTop: 20 },
  ghostBtnText: { color: "rgba(99,102,241,0.8)", fontSize: 13, fontWeight: "bold" },

  alertBox: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 10, marginBottom: 20, borderWidth: 1 },
  alertSuccess: { backgroundColor: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.2)" },
  alertError: { backgroundColor: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.2)" },
  alertTextSuccess: { color: "#34d399", fontSize: 13 },
  alertTextError: { color: "#f87171", fontSize: 13 },

  successWrap: { alignItems: "center", paddingVertical: 20 },
  successIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(16,185,129,0.15)", borderWidth: 1, borderColor: "rgba(16,185,129,0.3)", alignItems: "center", justifyContent: "center", marginBottom: 20 },
});
