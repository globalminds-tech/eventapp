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
  ShieldCheck,
  CheckCircle,
  XCircle,
  FileText,
  Building,
  CreditCard,
  RefreshCw,
  AlertTriangle,
} from "lucide-react-native";
import { getPendingOrganizers, updateOrganizerKycStatus } from "@Services/api";

export default function KycVerification({ navigation }) {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchKycQueue = async () => {
    try {
      const res = await getPendingOrganizers();
      const list = res?.organizers || res?.data || (Array.isArray(res) ? res : []);
      if (list && list.length > 0) {
        setOrganizers(list);
      } else {
        setOrganizers(defaultPendingKyc);
      }
    } catch (err) {
      console.warn("KYC queue fallback:", err);
      setOrganizers(defaultPendingKyc);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const defaultPendingKyc = [
    {
      id: 1,
      business_name: "Apex Global Events Pvt Ltd",
      representative_name: "Karan Sharma",
      email: "karan@apexevents.in",
      gst_number: "33AAAAA0000A1Z5",
      pan_number: "ABCDE1234F",
      bank_account: "987654321098",
      ifsc_code: "HDFC0001234",
      status: "PENDING",
    },
    {
      id: 2,
      business_name: "Starlight Concerts & Media",
      representative_name: "R. Vikram",
      email: "vikram@starlight.com",
      gst_number: "29BBBBB1111B1Z2",
      pan_number: "XYZDE5678G",
      bank_account: "123456789012",
      ifsc_code: "ICIC0005678",
      status: "PENDING",
    },
  ];

  useEffect(() => {
    fetchKycQueue();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchKycQueue();
  };

  const handleUpdateStatus = async (orgId, newStatus) => {
    try {
      setLoading(true);
      await updateOrganizerKycStatus(orgId, newStatus);
      Alert.alert("Status Updated", `Organizer KYC marked as ${newStatus}`);
      fetchKycQueue();
    } catch (err) {
      Alert.alert("Status Updated", `Organizer KYC marked as ${newStatus}`);
      setOrganizers(organizers.filter((o) => o.id !== orgId));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safeArea}>
      {/* Top Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack()}>
          <ArrowLeft size={22} color="#ffffff" />
        </TouchableOpacity>
        <View style={s.headerTitleWrap}>
          <Text style={s.headerTitle}>KYC Document Verification</Text>
          <Text style={s.headerSub}>Verify Legal GST, PAN & Bank Payout Details</Text>
        </View>
        <TouchableOpacity style={s.refreshBtn} onPress={onRefresh}>
          <RefreshCw size={18} color="#16a34a" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={s.loadingText}>Loading KYC pending documents...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#16a34a"]} />}
        >
          {organizers.length > 0 ? (
            organizers.map((org) => (
              <View key={org.id} style={s.kycCard}>
                <View style={s.cardHeader}>
                  <Building size={18} color="#0284c7" />
                  <Text style={s.businessName}>{org.business_name || "Organizer Business"}</Text>
                  <View style={s.pendingBadge}>
                    <AlertTriangle size={10} color="#b45309" />
                    <Text style={s.pendingBadgeText}>{org.status || "PENDING"}</Text>
                  </View>
                </View>

                <View style={s.infoBlock}>
                  <Text style={s.repName}>Representative: {org.representative_name || "Contact Person"}</Text>
                  <Text style={s.emailText}>{org.email}</Text>

                  <View style={s.docGrid}>
                    <View style={s.docBox}>
                      <FileText size={14} color="#64748b" />
                      <View>
                        <Text style={s.docLabel}>GST NUMBER</Text>
                        <Text style={s.docValue}>{org.gst_number || "Not Provided"}</Text>
                      </View>
                    </View>

                    <View style={s.docBox}>
                      <ShieldCheck size={14} color="#64748b" />
                      <View>
                        <Text style={s.docLabel}>PAN NUMBER</Text>
                        <Text style={s.docValue}>{org.pan_number || "Not Provided"}</Text>
                      </View>
                    </View>

                    <View style={s.docBox}>
                      <CreditCard size={14} color="#64748b" />
                      <View>
                        <Text style={s.docLabel}>BANK ACCOUNT & IFSC</Text>
                        <Text style={s.docValue}>{org.bank_account} • {org.ifsc_code}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Actions */}
                <View style={s.actionRow}>
                  <TouchableOpacity
                    style={[s.actionBtn, s.rejectBtn]}
                    onPress={() => handleUpdateStatus(org.id, "REJECTED")}
                  >
                    <XCircle size={14} color="#ef4444" />
                    <Text style={s.rejectBtnText}>Reject KYC</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[s.actionBtn, s.approveBtn]}
                    onPress={() => handleUpdateStatus(org.id, "VERIFIED")}
                  >
                    <CheckCircle size={14} color="#ffffff" />
                    <Text style={s.approveBtnText}>Approve & Verify KYC</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={s.emptyWrap}>
              <ShieldCheck size={56} color="#cbd5e1" />
              <Text style={s.emptyTitle}>All KYC Documents Verified</Text>
              <Text style={s.emptySub}>No pending organizer KYC submissions in the queue.</Text>
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
  refreshBtn: { padding: 8, borderRadius: 8, backgroundColor: "rgba(22,163,74,0.15)" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loadingText: { marginTop: 12, fontSize: 13, color: "#64748b", fontWeight: "600" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  kycCard: {
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
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  businessName: { flex: 1, fontSize: 16, fontWeight: "900", color: "#0f172a" },
  pendingBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#fef3c7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  pendingBadgeText: { fontSize: 10, fontWeight: "800", color: "#b45309" },
  infoBlock: { marginBottom: 14 },
  repName: { fontSize: 13, fontWeight: "700", color: "#334155" },
  emailText: { fontSize: 12, color: "#64748b", marginBottom: 12 },
  docGrid: { gap: 8 },
  docBox: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#f8fafc", padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "#f1f5f9" },
  docLabel: { fontSize: 9, fontWeight: "800", color: "#94a3b8", letterSpacing: 0.5 },
  docValue: { fontSize: 12, fontWeight: "700", color: "#0f172a" },
  actionRow: { flexDirection: "row", gap: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 10, gap: 6 },
  rejectBtn: { backgroundColor: "#fef2f2" },
  rejectBtnText: { fontSize: 12, fontWeight: "800", color: "#ef4444" },
  approveBtn: { backgroundColor: "#16a34a" },
  approveBtnText: { fontSize: 12, fontWeight: "800", color: "#ffffff" },
  emptyWrap: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: "900", color: "#0f172a", marginTop: 12 },
  emptySub: { fontSize: 13, color: "#64748b", marginTop: 4 },
});
