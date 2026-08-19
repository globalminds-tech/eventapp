import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { resetsendOtp, resetverifyOtp, resetresendOtp, resetPassword } from "@Services/api";

const ForgotPassword = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await resetsendOtp({ email });
      setMessage(res.message || "OTP sent successfully");
      setStep(2);
    } catch (err) {
      setError("Failed to send OTP");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await resetverifyOtp({ email, otp });
      if (res.status) {
        setMessage("OTP verified");
        setStep(3);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Invalid OTP");
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await resetresendOtp({ email });
      setMessage("OTP resent");
    } catch (err) {
      setError("Resend failed");
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await resetPassword({ email, password });
      setMessage("Password updated successfully ?");
      setTimeout(() => {
        setStep(1);
        setEmail("");
        setOtp("");
        setPassword("");
        navigation?.navigate("Login");
      }, 2000);
    } catch (err) {
      setError("Reset failed");
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.card}>
        <Text style={s.title}>Forgot Password</Text>

        {step === 1 && (
          <>
            <TextInput
              style={s.input}
              placeholder="Enter your email"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity 
              style={[s.btn, s.btnIndigo]} 
              onPress={handleSendOtp} 
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Send OTP</Text>}
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            <TextInput
              style={s.input}
              placeholder="Enter OTP"
              placeholderTextColor="#9ca3af"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
            />
            <TouchableOpacity 
              style={[s.btn, s.btnIndigo, { marginBottom: 12 }]} 
              onPress={handleVerifyOtp} 
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Verify OTP</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleResendOtp} disabled={loading}>
              <Text style={s.linkText}>Resend OTP</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 3 && (
          <>
            <TextInput
              style={[s.input, s.inputSuccess]}
              placeholder="Enter new password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity 
              style={[s.btn, s.btnGreen]} 
              onPress={handleResetPassword} 
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Reset Password</Text>}
            </TouchableOpacity>
          </>
        )}

        {message ? <Text style={s.messageText}>{message}</Text> : null}
        {error ? <Text style={s.errorText}>{error}</Text> : null}

        {step === 1 && (
          <TouchableOpacity onPress={() => navigation?.navigate("Login")} style={{ marginTop: 24 }}>
            <Text style={s.linkText}>Back to Login</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ForgotPassword;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center", padding: 16 },
  card: { width: "100%", maxWidth: 400, backgroundColor: "#ffffff", borderRadius: 16, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", color: "#111827", marginBottom: 24 },
  input: { width: "100%", backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: "#111827", marginBottom: 16 },
  inputSuccess: { borderColor: "#86efac" },
  btn: { width: "100%", paddingVertical: 14, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  btnIndigo: { backgroundColor: "#4f46e5" },
  btnGreen: { backgroundColor: "#16a34a" },
  btnText: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
  linkText: { color: "#4f46e5", fontSize: 14, textAlign: "center", textDecorationLine: "underline" },
  messageText: { color: "#16a34a", textAlign: "center", marginTop: 16, fontSize: 14, fontWeight: "500" },
  errorText: { color: "#dc2626", textAlign: "center", marginTop: 16, fontSize: 14, fontWeight: "500" }
});
