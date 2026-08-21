import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCircle2, Info, LogOut, ChevronRight, X, ArrowLeft, Building2, User, Landmark, ShieldCheck } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

export default function OrganizerKYC({ navigation }) {
  const [step, setStep] = useState(1);
  const [showBankToast, setShowBankToast] = useState(false);

  // Step 1: Org Details
  const [orgName, setOrgName] = useState("");
  const [orgAddress, setOrgAddress] = useState("");
  const [panLinkedAadhaar, setPanLinkedAadhaar] = useState("Yes");
  const [panNumber, setPanNumber] = useState("");

  // Step 2: Contact Person Details
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  // Step 3: Bank Details
  const [state, setState] = useState("Tamil Nadu");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountType, setAccountType] = useState("Savings");

  const handleSaveDetails = async () => {
    try {
      const kycData = {
        orgName,
        orgAddress,
        panLinkedAadhaar,
        panNumber,
        fullName,
        email,
        mobile,
        state,
        accountNumber,
        ifscCode,
        accountType,
        kycCompleted: step === 3 && accountNumber ? true : false,
      };
      await AsyncStorage.setItem("@organizer_kyc_data", JSON.stringify(kycData));
    } catch (e) {
      console.error(e);
    }
  };

  const handleProceed = async () => {
    await handleSaveDetails();
    if (step < 3) {
      setStep(step + 1);
      if (step === 2) {
        setShowBankToast(true);
      }
    } else {
      Alert.alert("Setup Complete", "Welcome to your BookMyEvent Organizer Command Center!", [
        {
          text: "Go to Dashboard",
          onPress: () => navigation?.navigate("Organizerdashboard"),
        },
      ]);
    }
  };

  const handleSkip = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      navigation?.navigate("Organizerdashboard");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Executive Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
          <ArrowLeft size={20} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerSubtitle}>BOOKMYEVENT ORGANIZER</Text>
          <Text style={styles.headerTitle}>Account Setup & KYC</Text>
        </View>
        <TouchableOpacity style={styles.exitBtn} onPress={() => navigation?.navigate("Organizerdashboard")}>
          <LogOut size={18} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* Info Banner Notice */}
      <View style={styles.infoBanner}>
        <Info size={16} color="#0284c7" style={{ marginRight: 8, marginTop: 2 }} />
        <Text style={styles.infoBannerText}>
          Complete your profile to unlock instant ticket payouts, custom branding, and gate check-in scanners.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        {/* Modern Step Indicator */}
        <View style={styles.stepIndicatorCard}>
          <View style={styles.stepHeaderRow}>
            <Text style={styles.stepCountText}>STEP {step} OF 3</Text>
            <TouchableOpacity onPress={handleSkip}>
              <Text style={styles.skipText}>Skip for now ›</Text>
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${(step / 3) * 100}%` }]} />
          </View>

          <View style={styles.stepBadgesRow}>
            <View style={[styles.stepDotPill, step >= 1 && styles.stepDotActive]}>
              <Building2 size={12} color={step >= 1 ? "#ffffff" : "#64748b"} />
              <Text style={[styles.stepDotText, step >= 1 && styles.stepDotTextActive]}>Organization</Text>
            </View>
            <View style={[styles.stepDotPill, step >= 2 && styles.stepDotActive]}>
              <User size={12} color={step >= 2 ? "#ffffff" : "#64748b"} />
              <Text style={[styles.stepDotText, step >= 2 && styles.stepDotTextActive]}>Contact</Text>
            </View>
            <View style={[styles.stepDotPill, step >= 3 && styles.stepDotActive]}>
              <Landmark size={12} color={step >= 3 ? "#ffffff" : "#64748b"} />
              <Text style={[styles.stepDotText, step >= 3 && styles.stepDotTextActive]}>Payout Bank</Text>
            </View>
          </View>
        </View>

        {/* Bank Verification Toast */}
        {showBankToast && (
          <View style={styles.bankToastCard}>
            <ShieldCheck size={20} color="#16a34a" style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.bankToastTitle}>Instant Verification Available</Text>
              <Text style={styles.bankToastSub}>Bank details will be verified live for direct ticket sales payouts.</Text>
            </View>
            <TouchableOpacity onPress={() => setShowBankToast(false)}>
              <X size={16} color="#64748b" />
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 1: ORGANIZATION & LEGAL DETAILS */}
        {step === 1 && (
          <View style={styles.formCard}>
            <Text style={styles.formCardTitle}>Organization & Legal Details</Text>
            <Text style={styles.formCardSub}>Tell us about your event management company or agency.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company / Organization Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Apex Live Entertainment Ltd."
                placeholderTextColor="#94a3b8"
                value={orgName}
                onChangeText={setOrgName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Official Business Address *</Text>
              <TextInput
                style={[styles.textInput, { height: 80, textAlignVertical: "top" }]}
                placeholder="Enter street address, city & pincode"
                placeholderTextColor="#94a3b8"
                multiline
                value={orgAddress}
                onChangeText={setOrgAddress}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Is your PAN linked with Aadhaar? *</Text>
              <View style={styles.radioRow}>
                {["Yes", "No"].map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.radioOption, panLinkedAadhaar === opt && styles.radioOptionActive]}
                    onPress={() => setPanLinkedAadhaar(opt)}
                  >
                    <Text style={[styles.radioText, panLinkedAadhaar === opt && styles.radioTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company PAN / Individual PAN Number *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. ABCDE1234F"
                placeholderTextColor="#94a3b8"
                autoCapitalize="characters"
                value={panNumber}
                onChangeText={setPanNumber}
              />
            </View>
          </View>
        )}

        {/* STEP 2: CONTACT PERSON DETAILS */}
        {step === 2 && (
          <View style={styles.formCard}>
            <Text style={styles.formCardTitle}>Primary Contact Representative</Text>
            <Text style={styles.formCardSub}>Authorized person managing event listings & payouts.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Ashok Kumar"
                placeholderTextColor="#94a3b8"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Official Email Address *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. ashok@apexevents.com"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Number (For Gate Scanner Alerts) *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. +91 98765 43210"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                value={mobile}
                onChangeText={setMobile}
              />
            </View>
          </View>
        )}

        {/* STEP 3: BANK & PAYOUT SETTINGS */}
        {step === 3 && (
          <View style={styles.formCard}>
            <Text style={styles.formCardTitle}>Bank & Ticket Payout Account</Text>
            <Text style={styles.formCardSub}>Ticket sales revenue will be deposited directly here.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>State of Business Registration *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Tamil Nadu"
                placeholderTextColor="#94a3b8"
                value={state}
                onChangeText={setState}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bank Account Number *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter bank account number"
                placeholderTextColor="#94a3b8"
                keyboardType="number-pad"
                secureTextEntry
                value={accountNumber}
                onChangeText={setAccountNumber}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>IFSC Code *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. HDFC0001234"
                placeholderTextColor="#94a3b8"
                autoCapitalize="characters"
                value={ifscCode}
                onChangeText={setIfscCode}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Type *</Text>
              <View style={styles.radioRow}>
                {["Savings", "Current"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.radioOption, accountType === type && styles.radioOptionActive]}
                    onPress={() => setAccountType(type)}
                  >
                    <Text style={[styles.radioText, accountType === type && styles.radioTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

      </ScrollView>

      {/* Action Footer */}
      <View style={styles.footerBar}>
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipBtnText}>Skip for now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.proceedBtn} onPress={handleProceed}>
          <Text style={styles.proceedBtnText}>{step === 3 ? "Complete Setup ✓" : "Continue ›"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: "900",
    color: "#38bdf8",
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#ffffff",
  },
  exitBtn: {
    padding: 8,
  },
  infoBanner: {
    backgroundColor: "#e0f2fe",
    borderBottomWidth: 1,
    borderBottomColor: "#bae6fd",
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    color: "#0369a1",
    fontWeight: "600",
    lineHeight: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  stepIndicatorCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  stepHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  stepCountText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#0284c7",
    letterSpacing: 1,
  },
  skipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    marginBottom: 14,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#0284c7",
    borderRadius: 3,
  },
  stepBadgesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  stepDotPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  stepDotActive: {
    backgroundColor: "#0284c7",
  },
  stepDotText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
  },
  stepDotTextActive: {
    color: "#ffffff",
  },
  bankToastCard: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  bankToastTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#166534",
  },
  bankToastSub: {
    fontSize: 11,
    color: "#15803d",
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  formCardTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0f172a",
  },
  formCardSub: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0f172a",
  },
  radioRow: {
    flexDirection: "row",
    gap: 12,
  },
  radioOption: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  radioOptionActive: {
    backgroundColor: "#e0f2fe",
    borderColor: "#0284c7",
  },
  radioText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
  },
  radioTextActive: {
    color: "#0284c7",
  },
  footerBar: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  skipBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  skipBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
  },
  proceedBtn: {
    flex: 1,
    backgroundColor: "#0284c7",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  proceedBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#ffffff",
  },
});
