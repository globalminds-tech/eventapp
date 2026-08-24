import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getevent } from "@Services/api";
import {
  Coffee,
  Utensils,
  Pizza,
  Moon,
  Users,
  Store,
  UserPlus,
  ChevronDown,
  AlertTriangle,
  Flame,
  CheckCircle,
} from "lucide-react-native";
import { COLORS } from "../../styles/theme";

const MEAL_TIMES = ["Breakfast", "Lunch", "Snacks", "Dinner"];
const MEAL_TYPES = ["All Types", "Veg", "Non Veg"];

export const LiveFoodDashboard = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [mealTime, setMealTime] = useState("Lunch");
  const [mealType, setMealType] = useState("All Types");
  const [showEventModal, setShowEventModal] = useState(false);

  const data = {
    guests_inside: 185,
    total_capacity: 250,
    waiting_outside: 14,
    veg_served: 110,
    non_veg_served: 75,
  };

  const getEvents = async () => {
    try {
      const res = await getevent();
      const list = res?.data || [
        { id: "1", event_code: "EVT-2026-001", event_name: "TechInnovate Summit 2026" },
      ];
      setEvents(list);
      if (list.length > 0) setSelectedEvent(list[0]);
    } catch (err) {
      console.log("Fallback food events", err);
      const list = [{ id: "1", event_code: "EVT-2026-001", event_name: "TechInnovate Summit 2026" }];
      setEvents(list);
      setSelectedEvent(list[0]);
    }
  };

  useEffect(() => {
    getEvents();
  }, []);

  const occupancyPercent = Math.round((data.guests_inside / data.total_capacity) * 100);

  const MealIcon = () => {
    const props = { size: 24, color: COLORS.primary };
    if (mealTime === "Breakfast") return <Coffee {...props} />;
    if (mealTime === "Lunch") return <Utensils {...props} />;
    if (mealTime === "Snacks") return <Pizza {...props} />;
    return <Moon {...props} />;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerBadge}>CATERING & DINING GATEWAY</Text>
          <Text style={styles.headerTitle}>Live Dining Hall Analytics</Text>
        </View>

        <TouchableOpacity style={styles.eventPickerBtn} onPress={() => setShowEventModal(true)}>
          <Text style={styles.eventPickerBtnText} numberOfLines={1}>
            {selectedEvent ? selectedEvent.event_code : "Select Event"}
          </Text>
          <ChevronDown size={14} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Filters bar */}
        <View style={styles.filterCard}>
          <Text style={styles.filterTitle}>Select Meal Slot</Text>
          <View style={styles.slotRow}>
            {MEAL_TIMES.map((slot) => (
              <TouchableOpacity
                key={slot}
                style={[styles.slotPill, mealTime === slot && styles.slotPillActive]}
                onPress={() => setMealTime(slot)}
              >
                <Text style={[styles.slotPillText, mealTime === slot && styles.slotPillTextActive]}>{slot}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Live Occupancy Progress Gauge */}
        <View style={styles.gaugeCard}>
          <View style={styles.gaugeHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <MealIcon />
              <View>
                <Text style={styles.gaugeSlotName}>{mealTime} Service</Text>
                <Text style={styles.gaugeSub}>Live Dining Area Capacity</Text>
              </View>
            </View>
            <View style={styles.percentBadge}>
              <Text style={styles.percentBadgeText}>{occupancyPercent}% Full</Text>
            </View>
          </View>

          <View style={styles.gaugeTrack}>
            <View style={[styles.gaugeFill, { width: `${occupancyPercent}%` }]} />
          </View>

          <View style={styles.gaugeFooter}>
            <Text style={styles.gaugeFootText}>{data.guests_inside} Seated</Text>
            <Text style={styles.gaugeFootText}>{data.total_capacity} Max Tables</Text>
          </View>
        </View>

        {/* Stat Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Users size={22} color={COLORS.primary} />
            <Text style={styles.statVal}>{data.guests_inside}</Text>
            <Text style={styles.statLabel}>Guests Inside</Text>
          </View>

          <View style={styles.statBox}>
            <UserPlus size={22} color={COLORS.accent} />
            <Text style={styles.statVal}>{data.waiting_outside}</Text>
            <Text style={styles.statLabel}>Queue Outside</Text>
          </View>

          <View style={styles.statBox}>
            <Store size={22} color={COLORS.green} />
            <Text style={styles.statVal}>{data.total_capacity}</Text>
            <Text style={styles.statLabel}>Total Capacity</Text>
          </View>
        </View>

        {/* Veg vs Non-Veg Count breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Redemption Breakdown ({mealTime})</Text>

          <View style={styles.breakdownRow}>
            <View style={styles.flexRow}>
              <View style={[styles.dot, { backgroundColor: COLORS.green }]} />
              <Text style={styles.breakdownLabel}>Vegetarian Meals Served</Text>
            </View>
            <Text style={[styles.breakdownVal, { color: COLORS.green }]}>{data.veg_served}</Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.flexRow}>
              <View style={[styles.dot, { backgroundColor: "#dc2626" }]} />
              <Text style={styles.breakdownLabel}>Non-Vegetarian Meals Served</Text>
            </View>
            <Text style={[styles.breakdownVal, { color: "#dc2626" }]}>{data.non_veg_served}</Text>
          </View>
        </View>

        {/* Gate Advice Alert */}
        <View style={styles.adviceCard}>
          <AlertTriangle size={20} color={COLORS.amber} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.adviceTitle}>Queue Management Alert</Text>
            <Text style={styles.adviceSub}>
              Dining hall reaching 80%+ capacity. Staff should regulate entry at Main Dining Arch.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Event Picker Modal */}
      <Modal visible={showEventModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Event for Food Analytics</Text>
            {events.map((e) => (
              <TouchableOpacity
                key={e.id}
                style={[
                  styles.eventOption,
                  selectedEvent?.id === e.id && styles.eventOptionSelected,
                ]}
                onPress={() => {
                  setSelectedEvent(e);
                  setShowEventModal(false);
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
  headerBadge: { fontSize: 10, fontWeight: "900", color: COLORS.primary, letterSpacing: 1 },
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

  filterCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  filterTitle: { fontSize: 12, fontWeight: "800", color: COLORS.subText, marginBottom: 8 },
  slotRow: { flexDirection: "row", gap: 6 },
  slotPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  slotPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  slotPillText: { fontSize: 12, fontWeight: "700", color: COLORS.dark },
  slotPillTextActive: { color: "#ffffff" },

  gaugeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  gaugeHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  gaugeSlotName: { fontSize: 16, fontWeight: "900", color: COLORS.dark },
  gaugeSub: { fontSize: 12, color: COLORS.subText },
  percentBadge: { backgroundColor: "#ffedd5", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  percentBadgeText: { fontSize: 12, fontWeight: "900", color: COLORS.accent },
  gaugeTrack: { height: 10, backgroundColor: "#f1f5f9", borderRadius: 5, overflow: "hidden", marginBottom: 8 },
  gaugeFill: { height: "100%", backgroundColor: COLORS.accent, borderRadius: 5 },
  gaugeFooter: { flexDirection: "row", justifyContent: "space-between" },
  gaugeFootText: { fontSize: 12, fontWeight: "700", color: COLORS.subText },

  statsGrid: { flexDirection: "row", gap: 10, marginBottom: 12 },
  statBox: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  statVal: { fontSize: 20, fontWeight: "900", color: COLORS.dark, marginTop: 4 },
  statLabel: { fontSize: 11, fontWeight: "700", color: COLORS.subText },

  breakdownCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  breakdownTitle: { fontSize: 14, fontWeight: "800", color: COLORS.dark, marginBottom: 10 },
  breakdownRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  flexRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  breakdownLabel: { fontSize: 13, fontWeight: "700", color: COLORS.dark },
  breakdownVal: { fontSize: 15, fontWeight: "900" },

  adviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff7ed",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ffedd5",
  },
  adviceTitle: { fontSize: 13, fontWeight: "800", color: COLORS.amber },
  adviceSub: { fontSize: 12, color: "#9a3412", marginTop: 2 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.6)", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#ffffff", borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: "900", color: COLORS.dark, marginBottom: 14 },
  eventOption: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 8 },
  eventOptionSelected: { borderColor: COLORS.primary, backgroundColor: "#f0f9ff" },
  eventOptionCode: { fontSize: 11, fontWeight: "800", color: COLORS.primary },
  eventOptionName: { fontSize: 14, fontWeight: "700", color: COLORS.dark },
});

export default LiveFoodDashboard;
