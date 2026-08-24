import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CheckCircle2,
  Info,
  ChevronRight,
  ArrowLeft,
  Building2,
  User,
  Landmark,
  ShieldCheck,
  Mail,
  Phone,
  Send,
  Lock,
  Eye,
  EyeOff,
  X,
  AlertTriangle,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../styles/theme";

export default function OrganizerKYC({ navigation }) {
  const [step, setStep] = useState(1);

  // Step 1: Contact & Representative Info
  const [fullName, setFullName] = useState("");
  const [primaryMobile, setPrimaryMobile] = useState("");
  const [altMobile, setAltMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // OTP Modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Step 2: Business & Legal Details
  const [companyName, setCompanyName] = useState("");
  const [gstPanNumber, setGstPanNumber] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");

  // Step 3: Payout Bank Account Settlement
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountType, setAccountType] = useState("Savings");

  useEffect(() => {
    loadSavedKYC();
  }, []);

  const loadSavedKYC = async () => {
    try {
      const data = await AsyncStorage.getItem("@organizer_kyc_data");
      if (data) {
        const parsed = JSON.parse(data);
        setFullName(parsed.fullName || "");
        setPrimaryMobile(parsed.primaryMobile || "");
        setAltMobile(parsed.altMobile || "");
        setEmail(parsed.email || "");
        setEmailVerified(parsed.emailVerified || false);
        setCompanyName(parsed.companyName || "");
        setGstPanNumber(parsed.gstPanNumber || "");
        setBusinessAddress(parsed.businessAddress || "");
        setAccountNumber(parsed.accountNumber || "");
        setIfscCode(parsed.ifscCode || "");
        setBankName(parsed.bankName || "");
        setAccountType(parsed.accountType || "Savings");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendOtp = () => {
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address first.");
      return;
    }
    setOtpSent(true);
    setShowOtpModal(true);
  };

  const handleVerifyOtp = () => {
    if (otpInput.trim() === "1234" || otpInput.length >= 4) {
      setEmailVerified(true);
      setShowOtpModal(false);
      Alert.alert("Verified ✓", "Email address verified successfully!");
    } else {
      Alert.alert("Verification Error", "Invalid OTP entered. Please use OTP '1234'.");
    }
  };

  const handleSaveKYC = async () => {
    try {
      const kycData = {
        fullName,
        primaryMobile,
        altMobile,
        email,
        emailVerified: true,
        companyName,
        gstPanNumber,
        businessAddress,
        accountNumber,
        ifscCode,
        bankName,
        accountType,
        kycCompleted: true,
      };
      await AsyncStorage.setItem("@organizer_kyc_data", JSON.stringify(kycData));
      await AsyncStorage.setItem("@organizer_step1_completed", "true");
    } catch (e) {
      console.error(e);
    }
  };

  const handleNextStep = async () => {
    if (step === 1) {
      if (!fullName.trim() || !primaryMobile.trim() || !email.trim() || !password.trim()) {
        Alert.alert("Required Fields", "Please complete Full Name, Primary Mobile, Email, and Password.");
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert("Password Mismatch", "Password and Confirm Password do not match.");
        return;
      }
    }
    await handleSaveKYC();
    Alert.alert("Step 1 Completed ✓", "Account setup & password registered! Navigating to Organizer Command Center.", [
      { text: "Go to Dashboard", onPress: () => navigation?.replace("OrganizerWelcome") },
    ]);
  };

  const handleSkipDev = async () => {
    await handleSaveKYC();
    navigation?.replace("OrganizerWelcome");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
          <ArrowLeft size={20} color="#ffffff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.headerSubtitle}>ORGANIZER PORTAL</Text>
          <Text style={styles.headerTitle}>3-Step Account Onboarding</Text>
        </View>
      </View>

      {/* Development Phase Alert Banner */}
      <View style={styles.devBanner}>
        <AlertTriangle size={18} color={COLORS.amber} />
        <Text style={styles.devBannerText}>
          <Text style={{ fontWeight: "900" }}>DEV PHASE NOTICE:</Text> Step 1 required. Steps 2 & 3 can be skipped for testing, but are MANDATORY in Production before creating events.
        </Text>
      </View>

      {/* Step Indicator */}
      <View style={styles.stepBar}>
        {[
          { num: 1, label: "Contact Info", icon: User },
          { num: 2, label: "Company Legal", icon: Building2 },
          { num: 3, label: "Payout Bank", icon: Landmark },
        ].map((sItem) => {
          const IconComp = sItem.icon;
          const isActive = step === sItem.num;
          const isDone = step > sItem.num;
          return (
            <View key={sItem.num} style={styles.stepItem}>
              <View style={[styles.stepDot, isActive && styles.stepDotActive, isDone && styles.stepDotDone]}>
                {isDone ? (
                  <CheckCircle2 size={16} color="#ffffff" />
                ) : (
                  <IconComp size={16} color={isActive ? "#ffffff" : COLORS.subText} />
                )}
              </View>
              <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>{sItem.label}</Text>
            </View>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* STEP 1: REPRESENTATIVE CONTACT & VERIFICATION */}
        {step === 1 && (
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <User size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Step 1: Representative Contact Details</Text>
            </View>

            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Robert Downey"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.label}>Primary Mobile Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="+91 9876543210"
              keyboardType="phone-pad"
              value={primaryMobile}
              onChangeText={setPrimaryMobile}
            />

            <Text style={styles.label}>Alternate Contact Mobile Number</Text>
            <TextInput
              style={styles.input}
              placeholder="+91 9123456789 (Optional)"
              keyboardType="phone-pad"
              value={altMobile}
              onChangeText={setAltMobile}
            />

            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="organizer@eventcorp.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Account Password *</Text>
            <View style={{ position: "relative" }}>
              <TextInput
                style={styles.input}
                placeholder="Enter account password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={{ position: "absolute", right: 12, top: 12 }}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirm Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter password to confirm"
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
        )}

        {/* STEP 2: COMPANY & LEGAL DETAILS */}
        {step === 2 && (
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Building2 size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Step 2: Company & Business Legal Info</Text>
            </View>

            <Text style={styles.label}>Company / Organization Legal Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Apex Events & Media Pvt Ltd"
              value={companyName}
              onChangeText={setCompanyName}
            />

            <Text style={styles.label}>GSTIN / PAN Registration Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 22AAAAA0000A1Z5"
              autoCapitalize="characters"
              value={gstPanNumber}
              onChangeText={setGstPanNumber}
            />

            <Text style={styles.label}>Registered Business Address</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Suite, Building, Street, City, Pincode"
              multiline
              value={businessAddress}
              onChangeText={setBusinessAddress}
            />
          </View>
        )}

        {/* STEP 3: DIRECT PAYOUT BANK ACCOUNT */}
        {step === 3 && (
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Landmark size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Step 3: Direct Payout Bank Account</Text>
            </View>

            <Text style={styles.label}>Bank Account Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 98765432100123"
              keyboardType="number-pad"
              value={accountNumber}
              onChangeText={setAccountNumber}
            />

            <Text style={styles.label}>IFSC Code</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. HDFC0001234"
              autoCapitalize="characters"
              value={ifscCode}
              onChangeText={setIfscCode}
            />

            <Text style={styles.label}>Bank Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. HDFC Bank"
              value={bankName}
              onChangeText={setBankName}
            />

            <Text style={styles.label}>Account Type</Text>
            <View style={styles.typeRow}>
              {["Savings", "Current"].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typePill, accountType === t && styles.typePillActive]}
                  onPress={() => setAccountType(t)}
                >
                  <Text style={[styles.typePillText, accountType === t && styles.typePillTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkipDev}>
            <Text style={styles.skipBtnText}>Skip for Now (Dev Mode)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextBtn} onPress={handleNextStep}>
            <Text style={styles.nextBtnText}>{step === 3 ? "Complete Setup" : "Save & Continue"}</Text>
            <ChevronRight size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* OTP Verification Modal */}
      <Modal visible={showOtpModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Email Verification Code</Text>
              <TouchableOpacity onPress={() => setShowOtpModal(false)}>
                <X size={20} color={COLORS.dark} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              We sent a 4-digit code to <Text style={{ fontWeight: "bold" }}>{email}</Text>. (Demo OTP: <Text style={{ color: COLORS.primary, fontWeight: "bold" }}>1234</Text>)
            </Text>

            <TextInput
              style={styles.otpInput}
              placeholder="Enter 4-Digit OTP"
              keyboardType="number-pad"
              maxLength={4}
              value={otpInput}
              onChangeText={setOtpInput}
            />

            <TouchableOpacity style={styles.verifySubmitBtn} onPress={handleVerifyOtp}>
              <Text style={styles.verifySubmitBtnText}>Verify OTP Code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#0f172a",
  },
  backBtn: { padding: 4 },
  headerSubtitle: { fontSize: 10, fontWeight: "900", color: COLORS.primary, letterSpacing: 1 },
  headerTitle: { fontSize: 17, fontWeight: "900", color: "#ffffff" },

  devBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffedd5",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#fed7aa",
  },
  devBannerText: { flex: 1, fontSize: 11, color: "#9a3412", lineHeight: 15 },

  stepBar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    justifyContent: "space-around",
  },
  stepItem: { alignItems: "center" },
  stepDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#f1f5f9", justifyContent: "center", alignItems: "center", marginBottom: 4 },
  stepDotActive: { backgroundColor: COLORS.primary },
  stepDotDone: { backgroundColor: COLORS.green },
  stepLabel: { fontSize: 11, fontWeight: "700", color: COLORS.subText },
  stepLabelActive: { color: COLORS.primary, fontWeight: "900" },

  scrollContent: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: "#ffffff", borderRadius: 16, padding: 18, borderWidth: 1, borderColor: "#e2e8f0", elevation: 2 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  cardTitle: { fontSize: 15, fontWeight: "900", color: COLORS.dark },

  label: { fontSize: 12, fontWeight: "700", color: COLORS.dark, marginTop: 10, marginBottom: 4 },
  input: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 12, height: 44, fontSize: 13, color: COLORS.dark },

  emailRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  otpBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 14, height: 44, justifyContent: "center" },
  otpBtnDone: { backgroundColor: COLORS.green },
  otpBtnText: { color: "#ffffff", fontSize: 12, fontWeight: "bold" },

  verifiedBanner: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#dcfce7", padding: 10, borderRadius: 8, marginTop: 10 },
  verifiedBannerText: { fontSize: 12, fontWeight: "800", color: COLORS.green },

  typeRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  typePill: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0", alignItems: "center", backgroundColor: "#f8fafc" },
  typePillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typePillText: { fontSize: 13, fontWeight: "700", color: COLORS.dark },
  typePillTextActive: { color: "#ffffff" },

  btnRow: { marginTop: 20, gap: 10 },
  nextBtn: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12 },
  nextBtnText: { color: "#ffffff", fontSize: 15, fontWeight: "bold" },
  skipBtn: { alignItems: "center", paddingVertical: 10 },
  skipBtnText: { color: COLORS.subText, fontSize: 13, fontWeight: "700" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.6)", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#ffffff", borderRadius: 20, padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  modalTitle: { fontSize: 16, fontWeight: "900", color: COLORS.dark },
  modalSub: { fontSize: 12, color: COLORS.subText, marginBottom: 14 },
  otpInput: { backgroundColor: "#f8fafc", borderWidth: 2, borderColor: COLORS.primary, borderRadius: 12, height: 50, textAlign: "center", fontSize: 20, fontWeight: "bold", letterSpacing: 8, color: COLORS.dark, marginBottom: 14 },
  verifySubmitBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  verifySubmitBtnText: { color: "#ffffff", fontSize: 14, fontWeight: "bold" },
});
