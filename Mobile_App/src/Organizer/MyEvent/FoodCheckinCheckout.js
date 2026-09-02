import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Search,
  X,
  Utensils,
  Coffee,
  Pizza,
  Moon,
  CheckCircle,
  QrCode,
  Users,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  ShieldAlert,
  Menu,
} from "lucide-react-native";
import { COLORS } from "../../styles/theme";
import Sidebar from "../../components/Sidebar";
import { getevent } from "@Services/api";

const MEAL_SLOTS = ["Breakfast", "Lunch", "Snacks", "Dinner"];

const DUMMY_FOOD_ENTRIES = [
  { id: "1", ticket_code: "FD-TCK-101", visitor_name: "Johnathan Wick", meal_type: "Veg", meal_slot: "Lunch", status: "Served", time: "12:45 PM" },
  { id: "2", ticket_code: "FD-TCK-102", visitor_name: "Clara Oswald", meal_type: "Non Veg", meal_slot: "Lunch", status: "Pending", time: null },
  { id: "3", ticket_code: "FD-TCK-103", visitor_name: "Bruce Wayne", meal_type: "Veg", meal_slot: "Lunch", status: "Served", time: "01:05 PM" },
  { id: "4", ticket_code: "FD-TCK-104", visitor_name: "Diana Prince", meal_type: "Non Veg", meal_slot: "Lunch", status: "Pending", time: null },
];

export default function FoodCheckIn({ navigation }) {
  const [selectedSlot, setSelectedSlot] = useState("Lunch");
  const [dietaryFilter, setDietaryFilter] = useState("All"); // All | Veg | Non Veg
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(DUMMY_FOOD_ENTRIES);
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [manualCode, setManualCode] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const filtered = entries.filter((item) => {
    const matchSearch =
      item.visitor_name.toLowerCase().includes(search.toLowerCase()) ||
      item.ticket_code.toLowerCase().includes(search.toLowerCase());
    const matchSlot = item.meal_slot === selectedSlot;
    const matchDiet = dietaryFilter === "All" || item.meal_type === dietaryFilter;
    return matchSearch && matchSlot && matchDiet;
  });

  const totalCapacity = entries.length;
  const servedCount = entries.filter((e) => e.meal_slot === selectedSlot && e.status === "Served").length;
  const pendingCount = entries.filter((e) => e.meal_slot === selectedSlot && e.status === "Pending").length;

  const handleServeMeal = (id) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setEntries((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Served", time: timeNow } : item
      )
    );
  };

  const handleSimulateScan = () => {
    const code = manualCode.trim() || "FD-TCK-102";
    const found = entries.find((e) => e.ticket_code.toLowerCase() === code.toLowerCase());

    if (found) {
      if (found.status === "Served") {
        setScanResult({
          success: false,
          message: `ALREADY SERVED! ${found.visitor_name} redeemed voucher at ${found.time}.`,
        });
      } else {
        handleServeMeal(found.id);
        setScanResult({
          success: true,
          message: `Meal Verified: ${found.visitor_name} (${found.meal_type}) served!`,
        });
      }
    } else {
      setScanResult({
        success: false,
        message: `Voucher Code "${code}" invalid or expired.`,
      });
    }
  };

  const SlotIcon = ({ slot }) => {
    if (slot === "Breakfast") return <Coffee size={16} color={selectedSlot === slot ? "#ffffff" : COLORS.primary} />;
    if (slot === "Lunch") return <Utensils size={16} color={selectedSlot === slot ? "#ffffff" : COLORS.primary} />;
    if (slot === "Snacks") return <Pizza size={16} color={selectedSlot === slot ? "#ffffff" : COLORS.primary} />;
    return <Moon size={16} color={selectedSlot === slot ? "#ffffff" : COLORS.primary} />;
  };

  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <Sidebar 
        isVisible={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        navigation={navigation} 
        activeRoute="FoodCheckIn"
      />

      {/* Header */}
      <View style={s.header}>
        <View style={s.flexRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => setIsSidebarOpen(true)}>
            <Menu size={24} color={COLORS.dark} />
          </TouchableOpacity>
          <View style={{ marginLeft: 8 }}>
            <Text style={s.headerBadge}>DINING HALL GATEWAY</Text>
            <Text style={s.headerTitle}>Food & Meal Voucher Check-In</Text>
          </View>
        </View>

        <TouchableOpacity style={s.scanBtn} onPress={() => { setScanResult(null); setShowScanner(true); }}>
          <QrCode size={18} color="#ffffff" />
          <Text style={s.scanBtnText}>Scan</Text>
        </TouchableOpacity>
      </View>

      {/* Meal Slot Selector Tabs */}
      <View style={s.slotBar}>
        {MEAL_SLOTS.map((slot) => (
          <TouchableOpacity
            key={slot}
            style={[s.slotTab, selectedSlot === slot && s.slotTabActive]}
            onPress={() => setSelectedSlot(slot)}
          >
            <SlotIcon slot={slot} />
            <Text style={[s.slotTabText, selectedSlot === slot && s.slotTabTextActive]}>{slot}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Stats Bar */}
      <View style={s.statsContainer}>
        <View style={s.statBox}>
          <Text style={s.statLabel}>Served</Text>
          <Text style={[s.statValue, { color: COLORS.green }]}>{servedCount}</Text>
        </View>
        <View style={s.statBox}>
          <Text style={s.statLabel}>Pending</Text>
          <Text style={[s.statValue, { color: COLORS.accent }]}>{pendingCount}</Text>
        </View>
        <View style={s.statBox}>
          <Text style={s.statLabel}>Slot Total</Text>
          <Text style={s.statValue}>{totalCapacity}</Text>
        </View>
      </View>

      {/* Dietary Filters & Search */}
      <View style={s.controlsRow}>
        <View style={s.searchContainer}>
          <Search size={16} color={COLORS.subText} />
          <TextInput
            style={s.searchInput}
            placeholder="Search visitor or voucher code..."
            placeholderTextColor={COLORS.subText}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <X size={16} color={COLORS.subText} />
            </TouchableOpacity>
          )}
        </View>

        <View style={s.dietRow}>
          {["All", "Veg", "Non Veg"].map((diet) => (
            <TouchableOpacity
              key={diet}
              style={[s.dietPill, dietaryFilter === diet && s.dietPillActive]}
              onPress={() => setDietaryFilter(diet)}
            >
              <Text style={[s.dietPillText, dietaryFilter === diet && s.dietPillTextActive]}>{diet}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Food Voucher List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <Utensils size={40} color="#cbd5e1" />
            <Text style={s.emptyText}>No food voucher records found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardHeader}>
              <View style={s.codeBadge}>
                <Text style={s.codeText}>{item.ticket_code}</Text>
              </View>
              <View style={[s.dietBadge, item.meal_type === "Veg" ? s.vegBadge : s.nonVegBadge]}>
                <View style={[s.dietDot, item.meal_type === "Veg" ? s.vegDot : s.nonVegDot]} />
                <Text style={[s.dietText, item.meal_type === "Veg" ? s.vegText : s.nonVegText]}>
                  {item.meal_type}
                </Text>
              </View>
            </View>

            <Text style={s.visitorName}>{item.visitor_name}</Text>
            <Text style={s.slotInfo}>
              Slot: <Text style={{ fontWeight: "bold" }}>{item.meal_slot}</Text> • Status:{" "}
              <Text style={{ fontWeight: "bold", color: item.status === "Served" ? COLORS.green : COLORS.accent }}>
                {item.status}
              </Text>
            </Text>

            <View style={s.cardFooter}>
              <Text style={s.timeText}>
                {item.time ? `Redeemed at ${item.time}` : "Not Redeemed"}
              </Text>

              {item.status === "Pending" ? (
                <TouchableOpacity style={s.serveBtn} onPress={() => handleServeMeal(item.id)}>
                  <UserCheck size={14} color="#ffffff" />
                  <Text style={s.serveBtnText}>Mark Served</Text>
                </TouchableOpacity>
              ) : (
                <View style={s.servedBadge}>
                  <CheckCircle size={14} color={COLORS.green} />
                  <Text style={s.servedBadgeText}>Served ✓</Text>
                </View>
              )}
            </View>
          </View>
        )}
      />

      {/* QR Code Scanner Simulation Modal */}
      <Modal visible={showScanner} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.scannerModalCard}>
            <View style={s.scannerHeader}>
              <View style={s.flexRow}>
                <Utensils size={20} color={COLORS.primary} />
                <Text style={s.scannerTitle}>Food Voucher Scanner</Text>
              </View>
              <TouchableOpacity onPress={() => setShowScanner(false)}>
                <X size={20} color={COLORS.dark} />
              </TouchableOpacity>
            </View>

            <View style={s.viewfinderBox}>
              <QrCode size={70} color="rgba(2, 132, 199, 0.4)" />
              <Text style={s.viewfinderHint}>Scan Attendee Meal QR Voucher</Text>
            </View>

            <View style={s.manualScanWrap}>
              <Text style={s.inputLabel}>Enter Voucher Code Manually:</Text>
              <View style={s.manualInputRow}>
                <TextInput
                  style={s.manualInput}
                  placeholder="e.g. FD-TCK-102"
                  value={manualCode}
                  onChangeText={setManualCode}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={s.verifyBtn} onPress={handleSimulateScan}>
                  <Text style={s.verifyBtnText}>Validate</Text>
                </TouchableOpacity>
              </View>
            </View>

            {scanResult && (
              <View style={[s.resultBanner, scanResult.success ? s.resultSuccess : s.resultError]}>
                {scanResult.success ? (
                  <CheckCircle size={18} color={COLORS.green} />
                ) : (
                  <ShieldAlert size={18} color="#dc2626" />
                )}
                <Text style={[s.resultText, scanResult.success ? s.resultTextSuccess : s.resultTextError]}>
                  {scanResult.message}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
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
  headerTitle: { fontSize: 16, fontWeight: "900", color: COLORS.dark },
  backBtn: { padding: 4 },
  scanBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scanBtnText: { color: "#ffffff", fontSize: 13, fontWeight: "bold" },

  slotBar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    gap: 6,
  },
  slotTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    gap: 6,
  },
  slotTabActive: { backgroundColor: COLORS.primary },
  slotTabText: { fontSize: 12, fontWeight: "700", color: COLORS.dark },
  slotTabTextActive: { color: "#ffffff" },

  statsContainer: { flexDirection: "row", paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  statBox: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  statLabel: { fontSize: 11, fontWeight: "700", color: COLORS.subText, marginBottom: 2 },
  statValue: { fontSize: 18, fontWeight: "900", color: COLORS.dark },

  controlsRow: { paddingHorizontal: 16, marginTop: 10 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    height: 42,
    gap: 8,
    marginBottom: 8,
  },
  searchInput: { flex: 1, color: COLORS.dark, fontSize: 13 },

  dietRow: { flexDirection: "row", gap: 6 },
  dietPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  dietPillActive: { backgroundColor: COLORS.dark, borderColor: COLORS.dark },
  dietPillText: { fontSize: 11, fontWeight: "700", color: COLORS.subText },
  dietPillTextActive: { color: "#ffffff" },

  list: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 40 },
  emptyContainer: { paddingVertical: 60, alignItems: "center", gap: 10 },
  emptyText: { color: COLORS.subText, fontSize: 14, fontWeight: "bold" },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    marginBottom: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  codeBadge: { backgroundColor: "#e0f2fe", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  codeText: { fontSize: 11, fontWeight: "800", color: "#0369a1" },

  dietBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  vegBadge: { backgroundColor: "#dcfce7" },
  nonVegBadge: { backgroundColor: "#fee2e2" },
  dietDot: { width: 6, height: 6, borderRadius: 3 },
  vegDot: { backgroundColor: COLORS.green },
  nonVegDot: { backgroundColor: "#dc2626" },
  dietText: { fontSize: 10, fontWeight: "800" },
  vegText: { color: COLORS.green },
  nonVegText: { color: "#dc2626" },

  visitorName: { fontSize: 15, fontWeight: "800", color: COLORS.dark, marginBottom: 4 },
  slotInfo: { fontSize: 12, color: COLORS.subText, marginBottom: 8 },

  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTopWidth: 1, borderTopColor: "#f8fafc" },
  timeText: { fontSize: 11, color: COLORS.subText, fontWeight: "600" },
  serveBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  serveBtnText: { color: "#ffffff", fontSize: 12, fontWeight: "bold" },
  servedBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  servedBadgeText: { fontSize: 12, fontWeight: "800", color: COLORS.green },

  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.6)", justifyContent: "center", padding: 20 },
  scannerModalCard: { backgroundColor: "#ffffff", borderRadius: 20, padding: 20, elevation: 10 },
  scannerHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  scannerTitle: { fontSize: 16, fontWeight: "900", color: COLORS.dark, marginLeft: 8 },
  viewfinderBox: {
    height: 160,
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  viewfinderHint: { fontSize: 12, color: COLORS.subText, fontWeight: "700", marginTop: 8 },
  manualScanWrap: { marginTop: 16 },
  inputLabel: { fontSize: 12, fontWeight: "700", color: COLORS.dark, marginBottom: 6 },
  manualInputRow: { flexDirection: "row", gap: 8 },
  manualInput: { flex: 1, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 12, height: 42, fontSize: 13 },
  verifyBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 16, justifyContent: "center" },
  verifyBtnText: { color: "#ffffff", fontWeight: "bold", fontSize: 13 },
  resultBanner: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, marginTop: 12 },
  resultSuccess: { backgroundColor: "#dcfce7" },
  resultError: { backgroundColor: "#fee2e2" },
  resultText: { fontSize: 12, fontWeight: "700", flex: 1 },
  resultTextSuccess: { color: "#15803d" },
  resultTextError: { color: "#b91c1c" },
  flexRow: { flexDirection: "row", alignItems: "center" },
});
