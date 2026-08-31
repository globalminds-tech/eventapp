import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  DollarSign,
  CheckCircle,
  CreditCard,
  Building,
  RefreshCw,
  TrendingUp,
  Clock,
} from "lucide-react-native";

export default function PayoutsQueue({ navigation }) {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPayouts = async () => {
    try {
      setPayouts(defaultPayouts);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const defaultPayouts = [
    {
      id: 501,
      event_name: "Shreya Concert Live",
      organizer_name: "Apex Global Media",
      total_sales: "₹2,45,000",
      platform_fee: "₹12,250 (5%)",
      payout_amount: "₹2,32,750",
      bank_account: "HDFC •••• 9876",
      status: "PENDING_PAYOUT",
    },
    {
      id: 502,
      event_name: "AI & Cloud Tech Summit",
      organizer_name: "Cyber City Events",
      total_sales: "₹1,80,000",
      platform_fee: "₹9,000 (5%)",
      payout_amount: "₹1,71,000",
      bank_account: "ICICI •••• 1234",
      status: "PENDING_PAYOUT",
    },
  ];

  useEffect(() => {
    fetchPayouts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayouts();
  };

  const handleApprovePayout = (payoutId) => {
    Alert.alert(
      "Confirm Payout Transfer",
      `Are you sure you want to approve & initiate bank transfer for Payout #${payoutId}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve & Transfer",
          onPress: () => {
            setPayouts(payouts.filter((p) => p.id !== payoutId));
            Alert.alert("Success", "Payout transfer initiated successfully!");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={s.safeArea}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack()}>
          <ArrowLeft size={22} color="#ffffff" />
        </TouchableOpacity>
        <View style={s.headerTitleWrap}>
          <Text style={s.headerTitle}>Platform Payouts Queue</Text>
          <Text style={s.headerSub}>Approve & Transfer Ticket Revenue to Organizers</Text>
        </View>
        <TouchableOpacity style={s.refreshBtn} onPress={onRefresh}>
          <RefreshCw size={18} color="#7c3aed" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={s.loadingText}>Loading pending payouts...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#7c3aed"]} />}
        >
          {payouts.length > 0 ? (
            payouts.map((item) => (
              <View key={item.id} style={s.payoutCard}>
                <View style={s.cardHeader}>
                  <Building size={16} color="#7c3aed" />
                  <Text style={s.eventName}>{item.event_name}</Text>
                  <View style={s.pendingPill}>
                    <Clock size={10} color="#6b21a8" />
                    <Text style={s.pendingPillText}>READY FOR PAYOUT</Text>
                  </View>
                </View>

                <Text style={s.orgName}>Organizer: {item.organizer_name}</Text>

                <View style={s.amountGrid}>
                  <View style={s.amountBox}>
                    <Text style={s.amountLabel}>GROSS TICKET SALES</Text>
                    <Text style={s.amountValue}>{item.total_sales}</Text>
                  </View>

                  <View style={s.amountBox}>
                    <Text style={s.amountLabel}>PLATFORM FEE</Text>
                    <Text style={[s.amountValue, { color: "#dc2626" }]}>-{item.platform_fee}</Text>
                  </View>
                </View>

                <View style={s.netPayoutRow}>
                  <View>
                    <Text style={s.netLabel}>NET PAYABLE AMOUNT</Text>
                    <Text style={s.netValue}>{item.payout_amount}</Text>
                  </View>
                  <View style={s.bankPill}>
                    <CreditCard size={12} color="#475569" />
                    <Text style={s.bankText}>{item.bank_account}</Text>
                  </View>
                </View>

                <TouchableOpacity style={s.approveBtn} onPress={() => handleApprovePayout(item.id)}>
                  <CheckCircle size={16} color="#ffffff" />
                  <Text style={s.approveBtnText}>Approve & Initiate Payout</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={s.emptyWrap}>
              <TrendingUp size={56} color="#cbd5e1" />
              <Text style={s.emptyTitle}>All Payouts Transferred</Text>
              <Text style={s.emptySub}>No pending organizer payout requests in the queue.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#0f172a",
  },
  backBtn: { padding: 6, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.1)" },
  headerTitleWrap: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 18, fontWeight: "900", color: "#ffffff" },
  headerSub: { fontSize: 11, color: "#94a3b8" },
  refreshBtn: { padding: 8, borderRadius: 8, backgroundColor: "rgba(124,58,237,0.15)" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loadingText: { marginTop: 12, fontSize: 13, color: "#64748b", fontWeight: "600" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  payoutCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  eventName: { flex: 1, fontSize: 16, fontWeight: "900", color: "#0f172a" },
  pendingPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#f3e8ff", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  pendingPillText: { fontSize: 10, fontWeight: "800", color: "#7c3aed" },
  orgName: { fontSize: 12, color: "#64748b", fontWeight: "600", marginBottom: 12 },
  amountGrid: { flexDirection: "row", gap: 10, marginBottom: 12 },
  amountBox: { flex: 1, backgroundColor: "#f8fafc", padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "#f1f5f9" },
  amountLabel: { fontSize: 9, fontWeight: "800", color: "#94a3b8", letterSpacing: 0.5 },
  amountValue: { fontSize: 14, fontWeight: "900", color: "#0f172a", marginTop: 2 },
  netPayoutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#faf5ff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f3e8ff",
    marginBottom: 14,
  },
  netLabel: { fontSize: 10, fontWeight: "800", color: "#6b21a8", letterSpacing: 0.5 },
  netValue: { fontSize: 18, fontWeight: "900", color: "#7c3aed" },
  bankPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#ffffff", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: "#e9d5ff" },
  bankText: { fontSize: 11, fontWeight: "700", color: "#475569" },
  approveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#7c3aed", paddingVertical: 12, borderRadius: 12, gap: 6 },
  approveBtnText: { color: "#ffffff", fontWeight: "900", fontSize: 13 },
  emptyWrap: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: "900", color: "#0f172a", marginTop: 12 },
  emptySub: { fontSize: 13, color: "#64748b", marginTop: 4 },
});
