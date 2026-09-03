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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // OTP Modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Step 2: Business & Legal Details
  const [companyName, setCompanyName] = useState("");
  const [businessEntityType, setBusinessEntityType] = useState("Private Limited (Pvt Ltd)");
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [cityState, setCityState] = useState("");
  const [website, setWebsite] = useState("");

  // Step 3: Payout Bank Account Settlement
  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [upiId, setUpiId] = useState("");

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
        setEmail(parsed.email || "");
        setEmailVerified(parsed.emailVerified || false);
        setCompanyName(parsed.companyName || "");
        setBusinessEntityType(parsed.businessEntityType || "Private Limited (Pvt Ltd)");
        setGstNumber(parsed.gstNumber || "");
        setPanNumber(parsed.panNumber || "");
        setBusinessAddress(parsed.businessAddress || "");
        setCityState(parsed.cityState || "");
        setWebsite(parsed.website || "");
        setAccountHolderName(parsed.accountHolderName || "");
        setAccountNumber(parsed.accountNumber || "");
        setIfscCode(parsed.ifscCode || "");
        setBankName(parsed.bankName || "");
        setUpiId(parsed.upiId || "");
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
      Alert.alert("Verified 👍", "Email address verified successfully!");
    } else {
      Alert.alert("Verification Error", "Invalid OTP entered. Please use OTP '1234'.");
    }
  };

  const handleSaveKYC = async () => {
    try {
      const kycData = {
        fullName,
        primaryMobile,
        email,
        emailVerified: true,
        companyName,
        businessEntityType,
        gstNumber,
        panNumber,
        businessAddress,
        cityState,
        website,
        accountHolderName,
        accountNumber,
        ifscCode,
        bankName,
        upiId,
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
        Alert.alert("Required Fields", "Please complete Full Name, Mobile Phone, Email, and Password.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!companyName.trim() || !gstNumber.trim() || !panNumber.trim() || !businessAddress.trim() || !cityState.trim()) {
        Alert.alert("Required Fields", "Please provide Company Name, GSTIN, PAN, Address, and City & State.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!accountHolderName.trim() || !accountNumber.trim() || !ifscCode.trim() || !bankName.trim()) {
        Alert.alert("Required Fields", "Please provide Account Holder Name, Account Number, IFSC, and Bank Name.");
        return;
      }
      await handleSaveKYC();
      Alert.alert("Registration Complete 🎉", "Account setup & KYC registered! Navigating to Organizer Dashboard.", [
        { text: "Go to Dashboard", onPress: () => navigation?.replace("CreateEvent") },
      ]);
    }
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
          <Text style={styles.headerSubtitle}>ORGANIZER ONBOARDING</Text>
          <Text style={styles.headerTitle}>List Your Events & Host Shows</Text>
        </View>
      </View>

      {/* Step Indicator */}
      <View style={styles.stepBar}>
        {[
          { num: 1, label: "Representative Contact", icon: User },
          { num: 2, label: "Business & Legal GST", icon: Building2 },
          { num: 3, label: "Payout Bank Account", icon: Landmark },
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
        {/* STEP 1: REPRESENTATIVE CONTACT */}
        {step === 1 && (
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <User size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Representative Contact</Text>
            </View>

            <Text style={styles.label}>Representative Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Alex Vance"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.label}>Mobile Phone Contact</Text>
            <TextInput
              style={styles.input}
              placeholder="+91 9876543210"
              keyboardType="phone-pad"
              value={primaryMobile}
              onChangeText={setPrimaryMobile}
            />

            <Text style={styles.label}>Official Email Address *</Text>
            <View style={styles.emailRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="organizer@company.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!emailVerified}
              />
              <TouchableOpacity
                style={[styles.otpBtn, emailVerified && styles.otpBtnDone]}
                onPress={emailVerified ? null : handleSendOtp}
              >
                <Text style={styles.otpBtnText}>{emailVerified ? "Verified ✅" : "Send 6-Digit OTP"}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Account Password *</Text>
            <View style={{ position: "relative" }}>
              <TextInput
                style={[styles.input, { paddingRight: 40 }]}
                placeholder="********"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity style={{ position: "absolute", right: 12, top: 12 }} onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 2: BUSINESS & LEGAL DETAILS */}
        {step === 2 && (
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Building2 size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Business & Legal GST</Text>
            </View>

            <Text style={styles.label}>Company / Organization Legal Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Apex Global Events Ltd"
              value={companyName}
              onChangeText={setCompanyName}
            />
            
            <Text style={styles.label}>Business Entity Type</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Private Limited (Pvt Ltd)"
              value={businessEntityType}
              onChangeText={setBusinessEntityType}
            />

            <Text style={styles.label}>GSTIN Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 27ABCDE1234F2Z5"
              autoCapitalize="characters"
              value={gstNumber}
              onChangeText={setGstNumber}
            />

            <Text style={styles.label}>PAN Card Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. ABCDE1234F"
              autoCapitalize="characters"
              value={panNumber}
              onChangeText={setPanNumber}
            />

            <Text style={styles.label}>Registered Business Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 100 Tech Park, MG Road"
              value={businessAddress}
              onChangeText={setBusinessAddress}
            />
            
            <Text style={styles.label}>City & State *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Mumbai, Maharashtra"
              value={cityState}
              onChangeText={setCityState}
            />
            
            <Text style={styles.label}>Website / Social URL</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. https://apexevents.com"
              autoCapitalize="none"
              keyboardType="url"
              value={website}
              onChangeText={setWebsite}
            />
          </View>
        )}

        {/* STEP 3: DIRECT PAYOUT BANK ACCOUNT */}
        {step === 3 && (
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Landmark size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Payout Bank Account</Text>
            </View>

            <Text style={styles.label}>Account Holder Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Apex Global Events Ltd"
              value={accountHolderName}
              onChangeText={setAccountHolderName}
            />

            <Text style={styles.label}>Bank Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. HDFC Bank / ICICI Bank"
              value={bankName}
              onChangeText={setBankName}
            />

            <Text style={styles.label}>Bank Account Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 50100234567890"
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

            <Text style={styles.label}>UPI ID / Settlement Preference</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. apex@hdfcbank"
              autoCapitalize="none"
              value={upiId}
              onChangeText={setUpiId}
            />
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.nextBtn} onPress={handleNextStep}>
            <Text style={styles.nextBtnText}>{step === 3 ? "COMPLETE & PUBLISH ACCOUNT" : "NEXT STEP ->"}</Text>
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
              We sent a 6-digit code to <Text style={{ fontWeight: "bold" }}>{email}</Text>. (Demo OTP: <Text style={{ color: COLORS.primary, fontWeight: "bold" }}>1234</Text>)
            </Text>

            <TextInput
              style={styles.otpInput}
              placeholder="Enter OTP"
              keyboardType="number-pad"
              maxLength={6}
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
  headerSubtitle: { fontSize: 10, fontWeight: "900", color: "#0ea5e9", letterSpacing: 1 },
  headerTitle: { fontSize: 17, fontWeight: "900", color: "#ffffff" },

  stepBar: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    paddingVertical: 20,
    paddingHorizontal: 16,
    justifyContent: "space-around",
  },
  stepItem: { alignItems: "center" },
  stepDot: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#1e293b", justifyContent: "center", alignItems: "center", marginBottom: 8 },
  stepDotActive: { backgroundColor: "#0ea5e9" },
  stepDotDone: { backgroundColor: "#10b981" },
  stepLabel: { fontSize: 11, fontWeight: "700", color: "#64748b" },
  stepLabelActive: { color: "#0ea5e9", fontWeight: "900" },

  scrollContent: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: "#ffffff", borderRadius: 16, padding: 18, borderWidth: 1, borderColor: "#e2e8f0", elevation: 2 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#f1f5f9", display: 'none' },
  cardTitle: { fontSize: 15, fontWeight: "900", color: COLORS.dark },

  label: { fontSize: 12, fontWeight: "800", color: "#1e293b", marginTop: 14, marginBottom: 6 },
  input: { backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 16, height: 48, fontSize: 13, color: "#0f172a", fontWeight: "600" },

  emailRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  otpBtn: { backgroundColor: "#7dd3fc", borderRadius: 10, paddingHorizontal: 14, height: 48, justifyContent: "center" },
  otpBtnDone: { backgroundColor: "#10b981" },
  otpBtnText: { color: "#0284c7", fontSize: 12, fontWeight: "900" },

  btnRow: { marginTop: 20, alignItems: "flex-end" },
  nextBtn: { backgroundColor: "#0066ff", paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  nextBtnText: { color: "#ffffff", fontSize: 14, fontWeight: "900" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.6)", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#ffffff", borderRadius: 20, padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  modalTitle: { fontSize: 16, fontWeight: "900", color: COLORS.dark },
  modalSub: { fontSize: 12, color: COLORS.subText, marginBottom: 14 },
  otpInput: { backgroundColor: "#f8fafc", borderWidth: 2, borderColor: COLORS.primary, borderRadius: 12, height: 50, textAlign: "center", fontSize: 20, fontWeight: "bold", letterSpacing: 8, color: COLORS.dark, marginBottom: 14 },
  verifySubmitBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  verifySubmitBtnText: { color: "#ffffff", fontSize: 14, fontWeight: "bold" },
});
