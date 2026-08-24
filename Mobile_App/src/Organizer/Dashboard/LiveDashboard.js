import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StatusBar,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Eye,
  Search,
  BarChart2,
  TrendingUp,
  DollarSign,
  Ticket,
  Users,
  Clock,
  ChevronDown,
  ArrowUpRight,
  Sparkles,
  Zap,
} from "lucide-react-native";
import { COLORS } from "../../styles/theme";
import { getevent } from "@Services/api";

const MOCK_LIVE_METRICS = {
  totalRevenue: "₹ 4,85,000",
  ticketsSold: 420,
  totalCapacity: 500,
  occupancyPercent: 84,
  peakEntryRate: "34 check-ins/min",
  vipSold: 80,
  generalSold: 340,
};

const MOCK_LIVE_STREAM = [
  { id: "1", time: "11:22 AM", name: "Alex Morgan", tier: "VIP Pass", status: "Gate 1 Entry" },
  { id: "2", time: "11:20 AM", name: "Elena Rostova", tier: "VIP Pass", status: "Gate 2 Entry" },
  { id: "3", time: "11:18 AM", name: "Samantha Reed", tier: "General Admission", status: "Gate 1 Entry" },
  { id: "4", time: "11:15 AM", name: "David Chen", tier: "Speaker Pass", status: "VIP Gate Entry" },
];

export const LiveDashboard = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventPicker, setShowEventPicker] = useState(false);
  const [search, setSearch] = useState("");

  const fetchEvents = async () => {
    try {
      const res = await getevent();
      const list = res?.data || [
        { id: "1", event_code: "EVT-2026-001", event_name: "TechInnovate Summit 2026" },
        { id: "2", event_code: "EVT-2026-002", event_name: "Global Music & Arts Fest" },
      ];
      setEvents(list);
      if (list.length > 0) setSelectedEvent(list[0]);
    } catch (err) {
      console.log("Using fallback live dashboard events", err);
      const fallback = [
        { id: "1", event_code: "EVT-2026-001", event_name: "TechInnovate Summit 2026" },
        { id: "2", event_code: "EVT-2026-002", event_name: "Global Music & Arts Fest" },
      ];
      setEvents(fallback);
      setSelectedEvent(fallback[0]);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.livePulseRow}>
            <View style={styles.livePulseDot} />
            <Text style={styles.livePulseText}>REAL-TIME ANALYTICS HUB</Text>
          </View>
          <Text style={styles.headerTitle}>Live Sales & Gate Dashboard</Text>
        </View>

        <TouchableOpacity style={styles.eventPickerBtn} onPress={() => setShowEventPicker(true)}>
          <Text style={styles.eventPickerBtnText} numberOfLines={1}>
            {selectedEvent ? selectedEvent.event_code : "Select Event"}
          </Text>
          <ChevronDown size={14} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Active Event Banner */}
        {selectedEvent && (
          <View style={styles.activeEventCard}>
            <Text style={styles.activeEventLabel}>MONITORING EVENT</Text>
            <Text style={styles.activeEventName}>{selectedEvent.event_name}</Text>
          </View>
        )}

        {/* Executive Stat Cards Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderLeftColor: COLORS.primary, borderLeftWidth: 4 }]}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statCardTitle}>Gross Revenue</Text>
              <DollarSign size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.statCardVal}>{MOCK_LIVE_METRICS.totalRevenue}</Text>
            <View style={styles.statTrendRow}>
              <ArrowUpRight size={14} color={COLORS.green} />
              <Text style={styles.statTrendText}>+18.4% vs last hour</Text>
            </View>
          </View>

          <View style={[styles.statCard, { borderLeftColor: COLORS.accent, borderLeftWidth: 4 }]}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statCardTitle}>Tickets Sold</Text>
              <Ticket size={18} color={COLORS.accent} />
            </View>
            <Text style={styles.statCardVal}>
              {MOCK_LIVE_METRICS.ticketsSold} <Text style={{ fontSize: 13, color: COLORS.subText }}>/ {MOCK_LIVE_METRICS.totalCapacity}</Text>
            </Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: `${MOCK_LIVE_METRICS.occupancyPercent}%` }]} />
            </View>
          </View>
        </View>

        {/* Occupancy & Peak Rate Row */}
        <View style={styles.statsGrid}>
          <View style={styles.statCardSmall}>
            <Users size={20} color={COLORS.primary} />
            <Text style={styles.statCardSmallVal}>{MOCK_LIVE_METRICS.occupancyPercent}%</Text>
            <Text style={styles.statCardSmallLabel}>Gate Occupancy</Text>
          </View>

          <View style={styles.statCardSmall}>
            <Zap size={20} color={COLORS.accent} />
            <Text style={styles.statCardSmallVal}>34/min</Text>
            <Text style={styles.statCardSmallLabel}>Peak Entry Speed</Text>
          </View>
        </View>

        {/* Tier Breakdown Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Ticket Tier Breakdown</Text>
          <View style={styles.tierRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tierName}>VIP Pass Tier</Text>
              <Text style={styles.tierVal}>{MOCK_LIVE_METRICS.vipSold} Sold (100% Sold Out)</Text>
            </View>
            <View style={styles.tierBadgeVIP}>
              <Text style={styles.tierBadgeVIPText}>SOLD OUT</Text>
            </View>
          </View>
          <View style={styles.tierRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tierName}>General Admission Tier</Text>
              <Text style={styles.tierVal}>{MOCK_LIVE_METRICS.generalSold} Sold (85% Occupied)</Text>
            </View>
            <View style={styles.tierBadgeGen}>
              <Text style={styles.tierBadgeGenText}>SELLING FAST</Text>
            </View>
          </View>
        </View>

        {/* Real-time Gate Stream */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Real-time Gate Stream</Text>
            <Clock size={16} color={COLORS.subText} />
          </View>

          {MOCK_LIVE_STREAM.map((item) => (
            <View key={item.id} style={styles.streamItem}>
              <View style={styles.streamDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.streamName}>{item.name}</Text>
                <Text style={styles.streamSub}>{item.tier} • {item.status}</Text>
              </View>
              <Text style={styles.streamTime}>{item.time}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Event Selector Modal */}
      <Modal visible={showEventPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Event for Live Analytics</Text>

            {events.map((e) => (
              <TouchableOpacity
                key={e.id}
                style={[
                  styles.eventOption,
                  selectedEvent?.id === e.id && styles.eventOptionSelected,
                ]}
                onPress={() => {
                  setSelectedEvent(e);
                  setShowEventPicker(false);
                }}
              >
                <Text style={styles.eventOptionCode}>{e.event_code}</Text>
                <Text style={styles.eventOptionName}>{e.event_name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  livePulseRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  livePulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent },
  livePulseText: { fontSize: 10, fontWeight: "900", color: COLORS.accent, letterSpacing: 1 },
  headerTitle: { fontSize: 17, fontWeight: "900", color: COLORS.dark },

  eventPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  eventPickerBtnText: { fontSize: 12, fontWeight: "800", color: COLORS.primary },

  activeEventCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  activeEventLabel: { fontSize: 10, fontWeight: "900", color: COLORS.primary, letterSpacing: 0.5 },
  activeEventName: { fontSize: 16, fontWeight: "800", color: COLORS.dark, marginTop: 2 },

  statsGrid: { flexDirection: "row", gap: 10, marginBottom: 10 },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  statCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  statCardTitle: { fontSize: 12, color: COLORS.subText, fontWeight: "700" },
  statCardVal: { fontSize: 20, fontWeight: "900", color: COLORS.dark },
  statTrendRow: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 2 },
  statTrendText: { fontSize: 11, color: COLORS.green, fontWeight: "700" },

  progressTrack: { height: 6, backgroundColor: "#f1f5f9", borderRadius: 3, marginTop: 8, overflow: "hidden" },
  progressBar: { height: "100%", backgroundColor: COLORS.accent, borderRadius: 3 },

  statCardSmall: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  statCardSmallVal: { fontSize: 22, fontWeight: "900", color: COLORS.dark, marginTop: 4 },
  statCardSmallLabel: { fontSize: 11, fontWeight: "700", color: COLORS.subText },

  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: COLORS.dark },

  tierRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  tierName: { fontSize: 13, fontWeight: "800", color: COLORS.dark },
  tierVal: { fontSize: 12, color: COLORS.subText },
  tierBadgeVIP: { backgroundColor: "#fee2e2", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tierBadgeVIPText: { fontSize: 10, fontWeight: "900", color: "#dc2626" },
  tierBadgeGen: { backgroundColor: "#ffedd5", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tierBadgeGenText: { fontSize: 10, fontWeight: "900", color: COLORS.amber },

  streamItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f8fafc", gap: 10 },
  streamDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.green },
  streamName: { fontSize: 13, fontWeight: "800", color: COLORS.dark },
  streamSub: { fontSize: 11, color: COLORS.subText },
  streamTime: { fontSize: 11, fontWeight: "700", color: COLORS.subText },

  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.6)", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#ffffff", borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: "900", color: COLORS.dark, marginBottom: 14 },
  eventOption: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 8 },
  eventOptionSelected: { borderColor: COLORS.primary, backgroundColor: "#f0f9ff" },
  eventOptionCode: { fontSize: 11, fontWeight: "800", color: COLORS.primary },
  eventOptionName: { fontSize: 14, fontWeight: "700", color: COLORS.dark },
});

export default LiveDashboard;
