import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// -- data ---------------------------------------------------------------------
const monthlyPlans = [
  {
    id: "basic",
    name: "BASIC",
    price: "99.99",
    period: "Month",
    medal: "??",
    features: ["10 Event", "Max100 Tickets", "Limited Support"],
  },
  {
    id: "pro",
    name: "PRO",
    price: "199.99",
    period: "Month",
    medal: "??",
    features: ["20 Event", "Max250 Tickets", "Limited Support"],
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    price: "999.99",
    period: "Month",
    medal: "??",
    features: ["50 Event", "Max300 Tickets", "Limited Support"],
  },
];

const yearlyPlans = [
  {
    id: "basic",
    name: "BASIC",
    price: "1000.99",
    period: "Year",
    medal: "??",
    features: ["100 Event", "Max500 Tickets", "Limited Support"],
  },
  {
    id: "pro",
    name: "PRO",
    price: "2000.99",
    period: "Year",
    medal: "??",
    features: ["150 Event", "Max750 Tickets", "Limited Support"],
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    price: "5000.99",
    period: "Year",
    medal: "??",
    features: ["200 Event", "Max10000 Tickets", "Limited Support"],
  },
];

// -- ProgressBar ---------------------------------------------------------------
function ProgressBar({ label, display, pct }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontWeight: "bold", fontSize: 14, color: "#1a1a2e", marginBottom: 6 }}>
        {label}
      </Text>
      <View
        style={{
          width: "100%",
          height: 8,
          backgroundColor: "#e2e6f0",
          borderRadius: 99,
          overflow: "hidden",
          marginBottom: 6,
        }}
      >
        <View
          style={{
            width: `${pct}%`,
            height: "100%",
            backgroundColor: "#3b5bdb",
            borderRadius: 99,
          }}
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          fontSize: 13,
        }}
      >
        <Text style={{ color: "#666", fontSize: 13 }}>{display}</Text>
        <Text style={{ color: "#666", fontSize: 13 }}>{pct}%</Text>
      </View>
    </View>
  );
}

// -- PAGE 1 : My Plans ---------------------------------------------------------
function MyPlansPage({ onUpgrade }) {
  return (
    <View style={styles.pageContainer}>
      <Text style={styles.pageTitle}>My Plans</Text>

      {/* Plan Information Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>Plan Information</Text>
        {[
          ["Current Plan", "Organizer - Enterprise"],
          ["Subscriber ID", "EP005"],
          ["Valid Upto", "February 26, 2026 at 08:08 PM"],
          ["Address", ""],
        ].map(([label, val]) => (
          <View key={label} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoColon}>:</Text>
            <Text style={styles.infoValue}>{val || "—"}</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.outlineBtn} onPress={onUpgrade}>
          <Text style={styles.outlineBtnText}>UPGRADE</Text>
        </TouchableOpacity>
      </View>

      {/* Plan Usage Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>Plan Usage</Text>
        <ProgressBar label="Events Hosted" display="12 of 200 Events" pct={6} />
        <ProgressBar label="Visitors Count" display="99 of 10000 Visitors" pct={1} />
        <ProgressBar label="Created Users" display="5 of 35 Users" pct={14} />
      </View>

      {/* Account Status Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>Account Status</Text>
        <Text style={styles.statusText}>
          Your account is active and will be billed on{" "}
          <Text style={{ fontWeight: "bold" }}>Feb 26, 2026</Text>.
        </Text>
        <Text style={[styles.statusText, { marginBottom: 24 }]}>
          If you cancel, your account will be closed and you'll lose your data.
        </Text>
        <TouchableOpacity style={styles.outlineBtn}>
          <Text style={styles.outlineBtnText}>CANCEL ACCOUNT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// -- PAGE 2 : Select Plans -----------------------------------------------------
function SelectPlansPage({ onChoosePlan, onBack }) {
  const [yearly, setYearly] = useState(false);
  const plans = yearly ? yearlyPlans : monthlyPlans;

  return (
    <View style={[styles.pageContainer, { backgroundColor: "#edf0fb" }]}>
      <View style={styles.headerWithBack}>
        <Text style={styles.pageTitle}>Select Plans</Text>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backLink}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Toggle */}
      <View style={styles.toggleRow}>
        <Text
          style={[
            styles.toggleLabel,
            !yearly ? styles.toggleLabelActive : styles.toggleLabelInactive,
          ]}
        >
          MONTHLY
        </Text>
        <Switch
          value={yearly}
          onValueChange={setYearly}
          trackColor={{ false: "#e2e8f0", true: "#3b5bdb" }}
          thumbColor="#ffffff"
        />
        <Text
          style={[
            styles.toggleLabel,
            yearly ? styles.toggleLabelActive : styles.toggleLabelInactive,
          ]}
        >
          YEARLY
        </Text>
      </View>

      {/* Plan Cards Stack */}
      <View style={styles.plansStack}>
        {plans.map((plan) => (
          <View key={plan.id} style={styles.planCard}>
            {/* Medal */}
            <View style={styles.medalCircle}>
              <Text style={{ fontSize: 28 }}>{plan.medal}</Text>
            </View>

            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.startsFromLabel}>Starts From :</Text>

            <View style={styles.priceRow}>
              <Text style={styles.planPrice}>{plan.price}</Text>
              <Text style={styles.planPeriod}>/ {plan.period}</Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.featuresLabel}>Features :</Text>
            <View style={{ marginBottom: 20 }}>
              {plan.features.map((f) => (
                <View key={f} style={styles.featureItem}>
                  <View style={styles.bulletArrow}>
                    <Text style={{ fontSize: 10, color: "#888" }}>?</Text>
                  </View>
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => onChoosePlan(plan)}>
              <Text style={styles.primaryBtnText}>Choose Plan</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}

// -- PAGE 3 : Payment ----------------------------------------------------------
function PaymentPage({ plan, onBack }) {
  const [name, setName] = useState("Sakthi");
  const [email, setEmail] = useState("sakthivelganesan@leitenindia.com");
  const [address, setAddress] = useState("");
  const [coupon, setCoupon] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleProceed = () => {
    if (!agreed) {
      Alert.alert("Error", "Please agree to the Terms & Conditions.");
      return;
    }
    Alert.alert("Success", "Redirecting to payment gateway…");
  };

  return (
    <View style={styles.pageContainer}>
      <View style={styles.headerWithBack}>
        <Text style={styles.pageTitle}>Payment</Text>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backLink}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Billing Information */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>Billing Information</Text>

        <View style={styles.inputField}>
          <Text style={styles.inputLabel}>
            Name <Text style={{ color: "#e03131" }}>*</Text>
          </Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="Sakthi"
          />
        </View>

        <View style={styles.inputField}>
          <Text style={styles.inputLabel}>
            Mail Id <Text style={{ color: "#e03131" }}>*</Text>
          </Text>
          <TextInput
            style={styles.textInput}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="sakthivelganesan@leitenindia.com"
          />
        </View>

        <View style={styles.inputField}>
          <Text style={styles.inputLabel}>Address</Text>
          <TextInput
            style={[styles.textInput, { height: 100, textAlignVertical: "top" }]}
            multiline
            numberOfLines={5}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter Address"
          />
        </View>
      </View>

      {/* Order Summary */}
      <View style={[styles.card, { marginTop: 20 }]}>
        <Text style={styles.cardHeading}>Order Summary</Text>

        {[
          [plan.name.charAt(0) + plan.name.slice(1).toLowerCase(), `?${plan.price}`],
          ["Tax", "0.00 %"],
          ["Tax Total", "?0.00"],
        ].map(([label, val]) => (
          <View key={label} style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{label}</Text>
            <Text style={styles.summaryVal}>{val}</Text>
          </View>
        ))}

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Coupon Code (-)</Text>
          <Text style={styles.summaryVal}>?0.00</Text>
        </View>

        {/* Coupon input */}
        <View style={styles.couponRow}>
          <TextInput
            style={styles.couponInput}
            placeholder="Enter Coupon Code"
            value={coupon}
            onChangeText={setCoupon}
          />
          <TouchableOpacity style={styles.couponApplyBtn}>
            <Text style={styles.couponApplyBtnText}>APPLY</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.totalDivider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalVal}>?0.00</Text>
        </View>

        {/* Terms */}
        <View style={styles.checkboxRow}>
          <Switch
            value={agreed}
            onValueChange={setAgreed}
            trackColor={{ false: "#e2e8f0", true: "#3b5bdb" }}
            thumbColor="#ffffff"
          />
          <Text style={styles.checkboxLabel}>
            By clicking "Proceed to Pay", you agree to our{" "}
            <Text style={styles.termsLink}>Terms &amp; Conditions</Text>
          </Text>
        </View>
      </View>

      {/* Proceed button */}
      <TouchableOpacity style={styles.paymentProceedBtn} onPress={handleProceed}>
        <Text style={styles.paymentProceedBtnText}>Proceed to Payment ?</Text>
      </TouchableOpacity>
    </View>
  );
}

// -- Root ----------------------------------------------------------------------
export default function PlanManagement() {
  const [page, setPage] = useState("myplans");
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleChoosePlan = (plan) => {
    setSelectedPlan(plan);
    setPage("payment");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {page === "myplans" && (
          <MyPlansPage onUpgrade={() => setPage("selectplans")} />
        )}
        {page === "selectplans" && (
          <SelectPlansPage
            onChoosePlan={handleChoosePlan}
            onBack={() => setPage("myplans")}
          />
        )}
        {page === "payment" && selectedPlan && (
          <PaymentPage
            plan={selectedPlan}
            onBack={() => setPage("selectplans")}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fc",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  pageContainer: {
    padding: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 20,
  },
  headerWithBack: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backLink: {
    fontSize: 14,
    color: "#3b5bdb",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e4e9f4",
    padding: 20,
    marginBottom: 20,
  },
  cardHeading: {
    color: "#3b5bdb",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  infoLabel: {
    fontWeight: "700",
    color: "#1a1a2e",
    minWidth: 100,
    fontSize: 13,
  },
  infoColon: {
    color: "#555",
    marginHorizontal: 4,
    fontSize: 13,
  },
  infoValue: {
    color: "#444",
    flex: 1,
    fontSize: 13,
  },
  outlineBtn: {
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#3b5bdb",
    backgroundColor: "transparent",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineBtnText: {
    color: "#3b5bdb",
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 1.2,
  },
  statusText: {
    fontSize: 13,
    color: "#333",
    lineHeight: 20,
    marginBottom: 10,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  toggleLabel: {
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 1,
  },
  toggleLabelActive: {
    color: "#3b5bdb",
  },
  toggleLabelInactive: {
    color: "#aaaaaa",
  },
  plansStack: {
    gap: 20,
  },
  planCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e4e9f4",
    padding: 24,
    alignItems: "center",
  },
  medalCircle: {
    width: 62,
    height: 62,
    backgroundColor: "#dce6ff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  planName: {
    color: "#3b5bdb",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  startsFromLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: "900",
    color: "#1a1a2e",
    letterSpacing: -0.8,
  },
  planPeriod: {
    fontSize: 14,
    color: "#777777",
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#eef0f6",
    width: "100%",
    marginVertical: 16,
  },
  featuresLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  bulletArrow: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#999999",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    fontSize: 13,
    color: "#444",
  },
  primaryBtn: {
    width: "100%",
    backgroundColor: "#3b5bdb",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  inputField: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#d8dff0",
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: "#333",
    backgroundColor: "#f7f9fc",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eef0f6",
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a2e",
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a2e",
  },
  couponRow: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 12,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d8dff0",
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    backgroundColor: "#ffffff",
  },
  couponApplyBtn: {
    backgroundColor: "#3b5bdb",
    borderRadius: 7,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  couponApplyBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
  totalDivider: {
    height: 1,
    backgroundColor: "#eef0f6",
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  totalVal: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 12,
  },
  checkboxLabel: {
    fontSize: 12,
    color: "#444",
    lineHeight: 18,
    flex: 1,
  },
  termsLink: {
    color: "#3b5bdb",
    textDecorationLine: "underline",
  },
  paymentProceedBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 2,
    borderColor: "#3b5bdb",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentProceedBtnText: {
    color: "#3b5bdb",
    fontWeight: "600",
    fontSize: 14,
  },
});
export { PlanManagement };
