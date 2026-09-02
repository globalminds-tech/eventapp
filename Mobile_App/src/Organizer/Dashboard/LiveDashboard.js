import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Eye,
  Search,
  Radio,
  QrCode,
  Activity,
} from "lucide-react-native";
import { getevent } from "@Services/api";

const fallbackLiveEvents = [
  { event_code: "EVT-25", event_name: "MRC Grand Music Fest 2026", totalScans: 850, presentCount: 780, gateStatus: "Live Now" },
  { event_code: "EVT-22", event_name: "Valluvar Kottam Craft & Food Expo", totalScans: 1420, presentCount: 1190, gateStatus: "Live Now" },
  { event_code: "EVT-9", event_name: "Furniture & Home Products Expo", totalScans: 310, presentCount: 280, gateStatus: "Live Now" }
];

export const LiveDashboard = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");

  const fetchEvents = async () => {
    try {
      const res = await getevent();
      let extractedEvents = [];
      if (Array.isArray(res)) {
        extractedEvents = res;
      } else if (res && Array.isArray(res.data)) {
        extractedEvents = res.data;
      } else if (res && res.data && Array.isArray(res.data.data)) {
        extractedEvents = res.data.data;
      }

      if (extractedEvents.length > 0) {
        setEvents(extractedEvents);
      } else {
        setEvents(fallbackLiveEvents);
      }
    } catch (err) {
      console.log("Using fallback live events", err);
      setEvents(fallbackLiveEvents);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((e) =>
    (e.event_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.event_code || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.headerTitle}>Live Gate Operations Analytics</Text>
          </View>
          <View style={styles.badgeWrap}>
            <View style={styles.liveBadge}>
              <View style={styles.livePulseDot} />
              <Text style={styles.liveBadgeText}>Real-Time Stream</Text>
            </View>
          </View>
          <Text style={styles.headerSub}>
            Real-time venue check-in telemetry, live gate scanning speed, and crowd occupancy density.
          </Text>
        </View>

        {/* KPI Telemetry Cards */}
        <View style={styles.kpiContainer}>
          {/* KPI 1 */}
          <View style={styles.kpiCard}>
            <View style={styles.kpiInfo}>
              <Text style={styles.kpiLabel}>GATE SCAN VELOCITY</Text>
              <Text style={styles.kpiValueDark}>42 Scans/Min</Text>
              <Text style={styles.kpiSubEmerald}>Peak Entrance Flow</Text>
            </View>
            <View style={[styles.kpiIconWrap, { backgroundColor: "#ecfeff", borderColor: "#cffafe" }]}>
              <Activity size={22} color="#0891b2" />
            </View>
          </View>

          {/* KPI 2 */}
          <View style={styles.kpiCard}>
            <View style={styles.kpiInfo}>
              <Text style={styles.kpiLabel}>SCANNED TODAY</Text>
              <Text style={styles.kpiValueEmerald}>2,580 Passes</Text>
              <Text style={styles.kpiSub}>Across 3 Live Events</Text>
            </View>
            <View style={[styles.kpiIconWrap, { backgroundColor: "#ecfdf5", borderColor: "#d1fae5" }]}>
              <QrCode size={22} color="#059669" />
            </View>
          </View>

          {/* KPI 3 */}
          <View style={styles.kpiCard}>
            <View style={styles.kpiInfo}>
              <Text style={styles.kpiLabel}>ACTIVE TURNSTILES</Text>
              <Text style={styles.kpiValueDark}>12 Gate Scanners</Text>
              <Text style={styles.kpiSubSky}>100% Online Sync</Text>
            </View>
            <View style={[styles.kpiIconWrap, { backgroundColor: "#f0f9ff", borderColor: "#e0f2fe" }]}>
              <Radio size={22} color="#0284c7" />
            </View>
          </View>
        </View>

        {/* Live Events Table (List for Mobile) */}
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableTitle}>Live Active Event Operations</Text>
            <View style={styles.searchWrap}>
              <Search size={16} color="#94a3b8" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search event code or name..."
                placeholderTextColor="#94a3b8"
                value={search}
                onChangeText={setSearch}
              />
            </View>
          </View>

          <View style={styles.listContainer}>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event, i) => (
                <View key={i} style={styles.listItem}>
                  <View style={styles.itemMainRow}>
                    <View style={styles.codeBadge}>
                      <Text style={styles.codeBadgeText}>{event.event_code}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>● Live Telemetry</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.eventName}>{event.event_name}</Text>
                  
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => Alert.alert("Telemetry", `Opening Live Gate Scanner for ${event.event_name}`)}
                  >
                    <Eye size={14} color="#ffffff" />
                    <Text style={styles.actionBtnText}>Telemetry</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No live events found matching "{search}"</Text>
              </View>
            )}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  
  header: { marginBottom: 20 },
  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: "900", color: "#0f172a" },
  badgeWrap: { flexDirection: "row", marginBottom: 10 },
  liveBadge: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#ecfdf5", 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#a7f3d0"
  },
  livePulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#10b981", marginRight: 6 },
  liveBadgeText: { fontSize: 11, fontWeight: "800", color: "#047857" },
  headerSub: { fontSize: 13, fontWeight: "600", color: "#64748b", lineHeight: 20 },

  kpiContainer: { gap: 12, marginBottom: 20 },
  kpiCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  kpiInfo: { flex: 1 },
  kpiLabel: { fontSize: 11, fontWeight: "700", color: "#64748b", letterSpacing: 0.5, marginBottom: 4 },
  kpiValueDark: { fontSize: 24, fontWeight: "900", color: "#0f172a", marginBottom: 2 },
  kpiValueEmerald: { fontSize: 24, fontWeight: "900", color: "#059669", marginBottom: 2 },
  kpiSub: { fontSize: 11, fontWeight: "600", color: "#64748b" },
  kpiSubEmerald: { fontSize: 11, fontWeight: "600", color: "#059669" },
  kpiSubSky: { fontSize: 11, fontWeight: "600", color: "#0284c7" },
  kpiIconWrap: { width: 50, height: 50, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 1 },

  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  tableHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  tableTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a", marginBottom: 12 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 13, fontWeight: "600", color: "#0f172a" },

  listContainer: { paddingHorizontal: 16 },
  listItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  itemMainRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  codeBadge: { backgroundColor: "#f0f9ff", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: "#bae6fd" },
  codeBadgeText: { fontSize: 11, fontWeight: "800", color: "#0369a1" },
  statusBadge: { backgroundColor: "#ecfdf5", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: "#a7f3d0" },
  statusBadgeText: { fontSize: 11, fontWeight: "800", color: "#047857" },
  eventName: { fontSize: 15, fontWeight: "800", color: "#0f172a", marginBottom: 12 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0284c7", // Using sky-600 to approximate gradient
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionBtnText: { color: "#ffffff", fontSize: 12, fontWeight: "800" },
  
  emptyState: { paddingVertical: 32, alignItems: "center" },
  emptyStateText: { fontSize: 13, color: "#64748b", fontWeight: "600" },
});

export default LiveDashboard;
