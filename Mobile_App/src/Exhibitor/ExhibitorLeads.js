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
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  QrCode,
  Download,
  Users,
  Search,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  RefreshCw,
  Plus,
  Menu,
} from "lucide-react-native";
import Sidebar from "../components/Sidebar";

export default function ExhibitorLeads({ navigation }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchLeads = async () => {
    try {
      setLeads(defaultLeads);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const defaultLeads = [
    {
      id: 1,
      name: "Dr. Rajesh Kumar",
      email: "rajesh.k@healthcorp.com",
      phone: "+91 98401 12345",
      company: "HealthCorp Diagnostics",
      designation: "Chief Technology Officer",
      interest: "HIGH",
      scanned_at: "2026-08-30 14:30",
    },
    {
      id: 2,
      name: "Ananya Sharma",
      email: "ananya@innovateai.io",
      phone: "+91 97110 54321",
      company: "Innovate AI Labs",
      designation: "Head of Procurement",
      interest: "HIGH",
      scanned_at: "2026-08-30 15:45",
    },
    {
      id: 3,
      name: "Suresh Babu",
      email: "suresh@apexventures.in",
      phone: "+91 90030 99887",
      company: "Apex Ventures",
      designation: "Investment Partner",
      interest: "MEDIUM",
      scanned_at: "2026-08-31 11:15",
    },
  ];

  useEffect(() => {
    fetchLeads();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeads();
  };

  const handleExportCsv = () => {
    Alert.alert("Export Successful", "Visitor leads CSV file generated and saved!");
  };

  const filtered = leads.filter((l) =>
    (l.name + l.company + l.email).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={s.safeArea}>
      {/* Top Bar Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => setIsSidebarOpen(true)}>
          <Menu size={22} color="#ffffff" />
        </TouchableOpacity>
        <View style={s.headerTitleWrap}>
          <Text style={s.headerTitle}>Visitor Lead Scanner</Text>
          <Text style={s.headerSub}>Exhibitor Booth Lead Capture & Management</Text>
        </View>
        <TouchableOpacity style={s.scanBtn} onPress={() => Alert.alert("QR Scanner", "Booth camera scanner ready to scan attendee badge!")}>
          <QrCode size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* KPI Metric Summary Strip */}
      <View style={s.kpiStrip}>
        <View style={s.kpiBox}>
          <Text style={s.kpiVal}>{leads.length}</Text>
          <Text style={s.kpiLbl}>TOTAL LEADS</Text>
        </View>
        <View style={s.kpiDivider} />
        <View style={s.kpiBox}>
          <Text style={[s.kpiVal, { color: "#16a34a" }]}>{leads.filter((l) => l.interest === "HIGH").length}</Text>
          <Text style={s.kpiLbl}>HIGH INTENT</Text>
        </View>
        <View style={s.kpiDivider} />
        <TouchableOpacity style={s.exportBtn} onPress={handleExportCsv}>
          <Download size={14} color="#0284c7" />
          <Text style={s.exportBtnText}>Export CSV</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={s.searchWrap}>
        <View style={s.searchCard}>
          <Search size={16} color="#64748b" style={{ marginRight: 8 }} />
          <TextInput
            style={s.searchInput}
            placeholder="Search leads by name, company, or email..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={s.loadingText}>Loading captured leads...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#16a34a"]} />}
        >
          {filtered.length > 0 ? (
            filtered.map((lead) => (
              <View key={lead.id} style={s.leadCard}>
                <View style={s.cardTop}>
                  <View style={s.avatarBox}>
                    <Text style={s.avatarText}>{lead.name.charAt(0)}</Text>
                  </View>
                  <View style={s.nameWrap}>
                    <Text style={s.leadName}>{lead.name}</Text>
                    <Text style={s.leadDesig}>{lead.designation} • {lead.company}</Text>
                  </View>
                  <View style={[s.interestPill, lead.interest === "HIGH" ? s.highPill : s.medPill]}>
                    <Text style={[s.interestText, lead.interest === "HIGH" ? s.highText : s.medText]}>
                      {lead.interest} INTENT
                    </Text>
                  </View>
                </View>

                <View style={s.contactRow}>
                  <View style={s.contactItem}>
                    <Mail size={12} color="#64748b" />
                    <Text style={s.contactValue}>{lead.email}</Text>
                  </View>
                  <View style={s.contactItem}>
                    <Phone size={12} color="#64748b" />
                    <Text style={s.contactValue}>{lead.phone}</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={s.emptyWrap}>
              <Users size={56} color="#cbd5e1" />
              <Text style={s.emptyTitle}>No Visitor Leads Captured Yet</Text>
              <Text style={s.emptySub}>Tap the QR scanner icon above to scan attendee badges at your booth.</Text>
            </View>
          )}
        </ScrollView>
      )}
      <Sidebar 
        isVisible={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        navigation={navigation} 
        activeRoute="ExhibitorLeads" 
      />
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
  scanBtn: { padding: 8, borderRadius: 10, backgroundColor: "#16a34a" },
  kpiStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  kpiBox: { alignItems: "center" },
  kpiVal: { fontSize: 18, fontWeight: "900", color: "#0f172a" },
  kpiLbl: { fontSize: 9, fontWeight: "800", color: "#64748b", letterSpacing: 0.5 },
  kpiDivider: { width: 1, height: 24, backgroundColor: "#e2e8f0" },
  exportBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#f0f9ff", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: "#bae6fd" },
  exportBtnText: { fontSize: 11, fontWeight: "800", color: "#0284c7" },
  searchWrap: { padding: 16, backgroundColor: "#ffffff" },
  searchCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchInput: { flex: 1, fontSize: 13, color: "#0f172a", fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loadingText: { marginTop: 12, fontSize: 13, color: "#64748b", fontWeight: "600" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  leadCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  avatarBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#16a34a", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontWeight: "900", color: "#ffffff" },
  nameWrap: { flex: 1 },
  leadName: { fontSize: 15, fontWeight: "900", color: "#0f172a" },
  leadDesig: { fontSize: 11, color: "#64748b", marginTop: 1 },
  interestPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  highPill: { backgroundColor: "#dcfce7" },
  highText: { color: "#16a34a" },
  medPill: { backgroundColor: "#fef3c7" },
  medText: { color: "#b45309" },
  interestText: { fontSize: 10, fontWeight: "800" },
  contactRow: { gap: 4, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  contactItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  contactValue: { fontSize: 12, color: "#475569", fontWeight: "500" },
  emptyWrap: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: "900", color: "#0f172a", marginTop: 12 },
  emptySub: { fontSize: 13, color: "#64748b", marginTop: 4, textAlign: "center", paddingHorizontal: 20 },
});
