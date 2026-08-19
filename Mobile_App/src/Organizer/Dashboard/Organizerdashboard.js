import { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { Eye, Search, ArrowLeft } from "lucide-react-native";

const FALLBACK_EVENTS = [
  { id: 1, code: "EVT-25", name: "MRC Event" },
  { id: 2, code: "EVT-22", name: "VALLUVAR KOTTAM PARK" },
  { id: 3, code: "EVT-9",  name: "Furniture and Home Products Expo" },
  { id: 4, code: "EVT-12", name: "LOGMAT EXPO - 2025" },
  { id: 5, code: "EVT-11", name: "DISTRICT CONFERENCE 2025" },
  { id: 6, code: "EVT-10", name: "Global Startup Networking" },
];

const PLANS = [
  { name: "BASIC",      price: 99.99  },
  { name: "PRO",        price: 199.99 },
  { name: "ENTERPRISE", price: 999.99 },
];

const STATS = [
  { label: "Total Visitors",  value: "0"    },
  { label: "Total Earnings",  value: "?450" },
  { label: "USD Earnings",    value: "$0"   },
  { label: "Pass Sales",      value: "10"   },
  { label: "Contacts",        value: "0"    },
  { label: "Sponsors",        value: "0"    },
];

export const Organizerdashboard = () => {
  const [page, setPage] = useState("events");
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [billingName, setBillingName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [coupon, setCoupon] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8000/events")
      .then((res) => setEvents(res.data))
      .catch(() => setEvents(FALLBACK_EVENTS));
  }, []);

  const filtered = events.filter(e =>
    (e.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.code || "").toLowerCase().includes(search.toLowerCase())
  );

  // -- EVENTS PAGE --------------------------------------------
  if (page === "events") {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.pageTitle}>Organizer Dashboard</Text>

          <View style={styles.searchBar}>
            <Search size={16} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search events..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#94a3b8"
            />
          </View>

          {filtered.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.emptyText}>No events found</Text>
            </View>
          ) : (
            filtered.map((event) => (
              <View key={event.id} style={styles.card}>
                <View style={styles.cardContent}>
                  <View style={styles.eventCodeBadge}>
                    <Text style={styles.eventCodeText}>{event.code}</Text>
                  </View>
                  <Text style={styles.eventName}>{event.name}</Text>
                </View>
                <TouchableOpacity
                  style={styles.viewBtn}
                  onPress={() => setPage("dashboard")}
                >
                  <Eye size={16} color="#0284c7" />
                  <Text style={styles.viewBtnText}>View</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // -- DASHBOARD PAGE -----------------------------------------
  if (page === "dashboard") {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backBtn} onPress={() => setPage("events")}>
            <ArrowLeft size={18} color="#475569" />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.pageTitle}>Organizer Dashboard</Text>

          {/* Welcome Banner */}
          <View style={styles.welcomeBanner}>
            <Text style={styles.welcomeTitle}>Welcome, Sakthi ??</Text>
            <Text style={styles.welcomeSubtitle}>
              Upgrade your plan to unlock 3% more features and grow your events.
            </Text>
            <TouchableOpacity style={styles.upgradeBtn} onPress={() => setPage("plans")}>
              <Text style={styles.upgradeBtnText}>Upgrade Plan ?</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {STATS.map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // -- PLANS PAGE ---------------------------------------------
  if (page === "plans") {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backBtn} onPress={() => setPage("dashboard")}>
            <ArrowLeft size={18} color="#475569" />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.pageTitle}>Select a Plan</Text>

          {PLANS.map((plan, i) => (
            <View key={plan.name} style={[styles.planCard, i === 1 && styles.planCardFeatured]}>
              {i === 1 && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>POPULAR</Text>
                </View>
              )}
              <Text style={[styles.planName, i === 1 && { color: "#fff" }]}>{plan.name}</Text>
              <Text style={[styles.planPrice, i === 1 && { color: "#fff" }]}>?{plan.price}</Text>
              <View style={styles.planFeatures}>
                {["Events Limit", "Ticket Limit", "Priority Support"].map(f => (
                  <Text key={f} style={[styles.planFeature, i === 1 && { color: "#dbeafe" }]}>• {f}</Text>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.choosePlanBtn, i === 1 && styles.choosePlanBtnFeatured]}
                onPress={() => setPage("payment")}
              >
                <Text style={[styles.choosePlanBtnText, i === 1 && { color: "#1e40af" }]}>
                  Choose Plan
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // -- PAYMENT PAGE -------------------------------------------
  if (page === "payment") {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backBtn} onPress={() => setPage("plans")}>
            <ArrowLeft size={18} color="#475569" />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.pageTitle}>Billing Information</Text>

          <View style={styles.paymentCard}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={billingName}
              onChangeText={setBillingName}
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={billingEmail}
              onChangeText={setBillingEmail}
              keyboardType="email-address"
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter Address"
              value={billingAddress}
              onChangeText={setBillingAddress}
              multiline
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* Order Summary */}
          <View style={styles.orderSummaryCard}>
            <Text style={styles.orderSummaryTitle}>Order Summary</Text>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Basic Plan</Text>
              <Text style={styles.orderValue}>?99.99</Text>
            </View>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Tax (0%)</Text>
              <Text style={styles.orderValue}>?0</Text>
            </View>
            <View style={[styles.orderRow, styles.orderRowTotal]}>
              <Text style={styles.orderTotalLabel}>Total</Text>
              <Text style={styles.orderTotalValue}>?99.99</Text>
            </View>
            <TextInput
              style={[styles.input, { marginTop: 16 }]}
              placeholder="Enter Coupon Code"
              value={coupon}
              onChangeText={setCoupon}
              placeholderTextColor="#94a3b8"
            />
            <TouchableOpacity style={styles.applyBtn}>
              <Text style={styles.applyBtnText}>APPLY</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.payBtn}>
              <Text style={styles.payBtnText}>Proceed to Payment ?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 22, fontWeight: "bold", color: "#0f172a", marginBottom: 16 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 12, marginBottom: 16, gap: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: "#0f172a" },
  center: { alignItems: "center", paddingVertical: 40 },
  emptyText: { color: "#94a3b8", fontSize: 14 },
  card: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", padding: 14, marginBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardContent: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  eventCodeBadge: { backgroundColor: "#e0f2fe", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  eventCodeText: { fontSize: 11, fontWeight: "bold", color: "#0369a1" },
  eventName: { fontSize: 14, fontWeight: "600", color: "#1e293b", flex: 1 },
  viewBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#eff6ff", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  viewBtnText: { color: "#0284c7", fontWeight: "bold", fontSize: 13 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16, alignSelf: "flex-start", backgroundColor: "#f1f5f9", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  backBtnText: { color: "#475569", fontWeight: "600", fontSize: 14 },
  welcomeBanner: { backgroundColor: "#818cf8", borderRadius: 16, padding: 20, marginBottom: 20 },
  welcomeTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 8 },
  welcomeSubtitle: { fontSize: 13, color: "#e0e7ff", lineHeight: 20, marginBottom: 16 },
  upgradeBtn: { backgroundColor: "#fff", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, alignSelf: "flex-start" },
  upgradeBtnText: { color: "#4f46e5", fontWeight: "bold", fontSize: 14 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", padding: 16, width: "47%", alignItems: "center" },
  statLabel: { fontSize: 11, color: "#64748b", fontWeight: "600", marginBottom: 6, textAlign: "center" },
  statValue: { fontSize: 26, fontWeight: "bold", color: "#0f172a" },
  planCard: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", padding: 20, marginBottom: 16 },
  planCardFeatured: { backgroundColor: "#2563eb", borderColor: "#1d4ed8" },
  popularBadge: { backgroundColor: "#fbbf24", alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  popularBadgeText: { fontSize: 10, fontWeight: "bold", color: "#78350f" },
  planName: { fontSize: 18, fontWeight: "bold", color: "#1e40af", marginBottom: 4 },
  planPrice: { fontSize: 32, fontWeight: "bold", color: "#0f172a", marginBottom: 12 },
  planFeatures: { gap: 6, marginBottom: 20 },
  planFeature: { fontSize: 13, color: "#475569" },
  choosePlanBtn: { backgroundColor: "#eff6ff", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  choosePlanBtnFeatured: { backgroundColor: "#fff" },
  choosePlanBtnText: { color: "#2563eb", fontWeight: "bold", fontSize: 14 },
  paymentCard: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", padding: 16, marginBottom: 16 },
  input: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#0f172a", marginBottom: 12 },
  textArea: { height: 80, textAlignVertical: "top" },
  orderSummaryCard: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", padding: 16 },
  orderSummaryTitle: { fontSize: 18, fontWeight: "bold", color: "#0f172a", marginBottom: 16 },
  orderRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  orderRowTotal: { borderBottomWidth: 0, marginTop: 8 },
  orderLabel: { fontSize: 14, color: "#475569" },
  orderValue: { fontSize: 14, color: "#475569", fontWeight: "600" },
  orderTotalLabel: { fontSize: 16, fontWeight: "bold", color: "#0f172a" },
  orderTotalValue: { fontSize: 16, fontWeight: "bold", color: "#0f172a" },
  applyBtn: { backgroundColor: "#eff6ff", paddingVertical: 12, borderRadius: 10, alignItems: "center", marginBottom: 12 },
  applyBtnText: { color: "#2563eb", fontWeight: "bold", fontSize: 14 },
  payBtn: { backgroundColor: "#1d4ed8", paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  payBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});

export default Organizerdashboard;
