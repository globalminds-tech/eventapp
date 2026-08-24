import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  ActivityIndicator,
  StatusBar,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  QrCode,
  CheckCircle,
  UserCheck,
  LogOut,
  Sparkles,
  Ticket,
  Calendar,
  MapPin,
  RefreshCw,
} from "lucide-react-native";
import { getEventscheckin } from "@Services/api";
import { COLORS } from "../../styles/theme";

const DUMMY_EVENTS = [
  {
    event_code: "EVT-2026-001",
    event_name: "TechInnovate Summit 2026",
    start_date: "2026-09-15",
    arrived: 142,
    departed: 18,
    present: 124,
    total_tickets: 200,
  },
  {
    event_code: "EVT-2026-002",
    event_name: "Global Music & Arts Fest",
    start_date: "2026-09-20",
    arrived: 450,
    departed: 40,
    present: 410,
    total_tickets: 500,
  },
  {
    event_code: "EVT-2026-003",
    event_name: "Startup Pitch & Investor Expo",
    start_date: "2026-10-05",
    arrived: 85,
    departed: 10,
    present: 75,
    total_tickets: 150,
  },
];

const DUMMY_ATTENDEES = [
  {
    id: "1",
    visitor_code: "BME-TCK-9901",
    name: "Alex Morgan",
    email: "alex.morgan@techcorp.io",
    phone: "+1 555-0192",
    tier: "VIP Access",
    checkin_time: "10:15 AM",
    checkout_time: null,
    status: "Present",
  },
  {
    id: "2",
    visitor_code: "BME-TCK-9902",
    name: "Samantha Reed",
    email: "samantha.r@innovate.org",
    phone: "+1 555-0188",
    tier: "General Admission",
    checkin_time: "10:30 AM",
    checkout_time: "01:15 PM",
    status: "Departed",
  },
  {
    id: "3",
    visitor_code: "BME-TCK-9903",
    name: "David Chen",
    email: "d.chen@venturelabs.com",
    phone: "+1 555-0177",
    tier: "Speaker Pass",
    checkin_time: null,
    checkout_time: null,
    status: "Pending",
  },
  {
    id: "4",
    visitor_code: "BME-TCK-9904",
    name: "Elena Rostova",
    email: "elena@designhub.co",
    phone: "+1 555-0144",
    tier: "VIP Access",
    checkin_time: "11:05 AM",
    checkout_time: null,
    status: "Present",
  },
];

export default function EventCheckIn({ navigation }) {
  const [page, setPage] = useState("events"); // "events" | "entries" | "details"
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [events, setEvents] = useState([]);
  const [entries, setEntries] = useState(DUMMY_ATTENDEES);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [eventCurrentPage, setEventCurrentPage] = useState(1);
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scannerCodeInput, setScannerCodeInput] = useState("");
  const [activeTabFilter, setActiveTabFilter] = useState("All");

  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await getEventscheckin();
      if (Array.isArray(res) && res.length > 0) {
        setEvents(res);
      } else {
        setEvents(DUMMY_EVENTS);
      }
    } catch (err) {
      console.log("Using fallback events data", err);
      setEvents(DUMMY_EVENTS);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(
    (e) =>
      (e.event_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.event_code || "").toLowerCase().includes(search.toLowerCase())
  );

  const eventTotalPages = Math.max(1, Math.ceil(filteredEvents.length / ITEMS_PER_PAGE));
  const currentEvents = filteredEvents.slice(
    (eventCurrentPage - 1) * ITEMS_PER_PAGE,
    eventCurrentPage * ITEMS_PER_PAGE
  );

  const handleCheckIn = (id) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setEntries((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checkin_time: timeNow, status: "Present" } : item
      )
    );
  };

  const handleCheckOut = (id) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setEntries((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checkout_time: timeNow, status: "Departed" } : item
      )
    );
  };

  const handleSimulateScan = () => {
    const targetCode = scannerCodeInput.trim() || "BME-TCK-9903";
    const found = entries.find((e) => e.visitor_code.toLowerCase() === targetCode.toLowerCase());

    if (found) {
      handleCheckIn(found.id);
      setScanResult({
        success: true,
        message: `Verified: ${found.name} (${found.tier}) checked in!`,
        entry: found,
      });
    } else {
      setScanResult({
        success: false,
        message: `Ticket code "${targetCode}" not found or invalid.`,
      });
    }
  };

  const filteredEntries = entries.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.visitor_code.toLowerCase().includes(search.toLowerCase());

    if (activeTabFilter === "Present") return matchSearch && e.status === "Present";
    if (activeTabFilter === "Pending") return matchSearch && e.status === "Pending";
    if (activeTabFilter === "Departed") return matchSearch && e.status === "Departed";
    return matchSearch;
  });

  // PAGE 1: EVENTS LIST
  if (page === "events") {
    return (
      <SafeAreaView style={s.container} edges={["top", "bottom"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.headerBadge}>LIVE GATE CONTROLLER</Text>
            <Text style={s.headerTitle}>Event Gate Entry & QR Scanner</Text>
          </View>
          <TouchableOpacity style={s.scanHeaderBtn} onPress={() => { setScanResult(null); setShowScanner(true); }}>
            <QrCode size={18} color="#ffffff" />
            <Text style={s.scanHeaderBtnText}>Scan QR</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={s.searchContainer}>
          <Search size={18} color={COLORS.subText} />
          <TextInput
            style={s.searchInput}
            placeholder="Search by event name or code..."
            placeholderTextColor={COLORS.subText}
            value={search}
            onChangeText={(v) => { setSearch(v); setEventCurrentPage(1); }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <X size={16} color={COLORS.subText} />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <>
            <FlatList
              data={currentEvents}
              keyExtractor={(item, idx) => item.event_code || idx.toString()}
              contentContainerStyle={s.list}
              ListEmptyComponent={
                <View style={s.emptyContainer}>
                  <Search size={40} color="#cbd5e1" />
                  <Text style={s.emptyText}>No events found</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={s.card}>
                  <View style={s.cardHeader}>
                    <View style={s.codeBadge}>
                      <Text style={s.eventCode}>{item.event_code}</Text>
                    </View>
                    <TouchableOpacity
                      style={s.eyeBtn}
                      onPress={() => {
                        setSelectedEvent(item);
                        setPage("entries");
                      }}
                    >
                      <Eye size={16} color={COLORS.primary} />
                      <Text style={s.eyeBtnText}>View Gate</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={s.eventName}>{item.event_name}</Text>

                  <View style={s.statsRow}>
                    <View style={s.statBox}>
                      <Text style={s.statLabel}>Arrived</Text>
                      <Text style={s.statValue}>{item.arrived ?? 0}</Text>
                    </View>
                    <View style={s.statBox}>
                      <Text style={s.statLabel}>Departed</Text>
                      <Text style={s.statValue}>{item.departed ?? 0}</Text>
                    </View>
                    <View style={[s.statBox, s.statBoxGreen]}>
                      <Text style={s.statLabel}>Present</Text>
                      <Text style={[s.statValue, { color: COLORS.green }]}>{item.present ?? 0}</Text>
                    </View>
                  </View>
                </View>
              )}
            />

            {/* Pagination */}
            {eventTotalPages > 1 && (
              <View style={s.pagination}>
                <TouchableOpacity
                  disabled={eventCurrentPage === 1}
                  onPress={() => setEventCurrentPage((p) => Math.max(1, p - 1))}
                  style={s.pageBtn}
                >
                  <ChevronLeft size={20} color={eventCurrentPage === 1 ? "#cbd5e1" : COLORS.dark} />
                </TouchableOpacity>
                <Text style={s.pageText}>{eventCurrentPage} / {eventTotalPages}</Text>
                <TouchableOpacity
                  disabled={eventCurrentPage === eventTotalPages}
                  onPress={() => setEventCurrentPage((p) => Math.min(eventTotalPages, p + 1))}
                  style={s.pageBtn}
                >
                  <ChevronRight size={20} color={eventCurrentPage === eventTotalPages ? "#cbd5e1" : COLORS.dark} />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* QR Scanner Simulation Modal */}
        <Modal visible={showScanner} animationType="slide" transparent>
          <View style={s.modalOverlay}>
            <View style={s.scannerModalCard}>
              <View style={s.scannerHeader}>
                <View style={s.flexRow}>
                  <QrCode size={22} color={COLORS.primary} />
                  <Text style={s.scannerTitle}>Gate QR Camera Scanner</Text>
                </View>
                <TouchableOpacity onPress={() => setShowScanner(false)}>
                  <X size={20} color={COLORS.dark} />
                </TouchableOpacity>
              </View>

              <View style={s.viewfinderBox}>
                <View style={s.scanLine} />
                <QrCode size={80} color="rgba(2, 132, 199, 0.4)" />
                <Text style={s.viewfinderHint}>Align Attendee Ticket QR in Box</Text>
              </View>

              <View style={s.manualScanWrap}>
                <Text style={s.inputLabel}>Or Enter Ticket Code Manually:</Text>
                <View style={s.manualInputRow}>
                  <TextInput
                    style={s.manualInput}
                    placeholder="e.g. BME-TCK-9903"
                    value={scannerCodeInput}
                    onChangeText={setScannerCodeInput}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity style={s.verifyBtn} onPress={handleSimulateScan}>
                    <Text style={s.verifyBtnText}>Verify</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {scanResult && (
                <View style={[s.resultBanner, scanResult.success ? s.resultSuccess : s.resultError]}>
                  <CheckCircle size={18} color={scanResult.success ? COLORS.green : "#dc2626"} />
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

  // PAGE 2: ENTRIES LIST FOR SELECTED EVENT
  if (page === "entries") {
    return (
      <SafeAreaView style={s.container} edges={["top", "bottom"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

        <View style={s.header}>
          <TouchableOpacity style={s.backHeaderBtn} onPress={() => setPage("events")}>
            <ChevronLeft size={20} color={COLORS.primary} />
            <Text style={s.backHeaderBtnText}>Events</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle} numberOfLines={1}>Gate Entries</Text>
          <TouchableOpacity style={s.scanHeaderBtn} onPress={() => { setScanResult(null); setShowScanner(true); }}>
            <QrCode size={16} color="#ffffff" />
            <Text style={s.scanHeaderBtnText}>Scan</Text>
          </TouchableOpacity>
        </View>

        {selectedEvent && (
          <View style={s.subHeaderCard}>
            <Text style={s.subHeaderCode}>{selectedEvent.event_code}</Text>
            <Text style={s.subHeaderTitle}>{selectedEvent.event_name}</Text>
          </View>
        )}

        {/* Filter Pills */}
        <View style={s.filterRow}>
          {["All", "Present", "Pending", "Departed"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[s.filterPill, activeTabFilter === tab && s.filterPillActive]}
              onPress={() => setActiveTabFilter(tab)}
            >
              <Text style={[s.filterPillText, activeTabFilter === tab && s.filterPillTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search */}
        <View style={s.searchContainer}>
          <Search size={18} color={COLORS.subText} />
          <TextInput
            style={s.searchInput}
            placeholder="Search attendee by name or code..."
            placeholderTextColor={COLORS.subText}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              <Text style={s.emptyText}>No attendees matching criteria</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <View style={s.codeBadge}>
                  <Text style={s.eventCode}>{item.visitor_code}</Text>
                </View>
                <View style={s.flexRow}>
                  <Text style={s.tierBadge}>{item.tier}</Text>
                  <TouchableOpacity
                    style={s.eyeBtn}
                    onPress={() => { setSelectedEntry(item); setPage("details"); }}
                  >
                    <Eye size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={s.eventName}>{item.name}</Text>

              <View style={s.timeRow}>
                <Text style={s.timeLabel}>Check-In:</Text>
                <Text style={s.timeVal}>{item.checkin_time || "Not Checked In"}</Text>
              </View>
              <View style={s.timeRow}>
                <Text style={s.timeLabel}>Check-Out:</Text>
                <Text style={s.timeVal}>{item.checkout_time || "Not Checked Out"}</Text>
              </View>

              <View style={s.actionRow}>
                {!item.checkin_time ? (
                  <TouchableOpacity style={s.checkInBtn} onPress={() => handleCheckIn(item.id)}>
                    <UserCheck size={16} color="#ffffff" />
                    <Text style={s.checkBtnText}>Check In</Text>
                  </TouchableOpacity>
                ) : !item.checkout_time ? (
                  <TouchableOpacity style={s.checkOutBtn} onPress={() => handleCheckOut(item.id)}>
                    <LogOut size={16} color="#ffffff" />
                    <Text style={s.checkBtnText}>Check Out</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={s.completedBadge}>
                    <CheckCircle size={14} color={COLORS.subText} />
                    <Text style={s.completedText}>Completed</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        />
      </SafeAreaView>
    );
  }

  // PAGE 3: DETAILS
  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <View style={s.header}>
        <TouchableOpacity style={s.backHeaderBtn} onPress={() => setPage("entries")}>
          <ChevronLeft size={20} color={COLORS.primary} />
          <Text style={s.backHeaderBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Attendee Ticket Details</Text>
        <View style={{ width: 40 }} />
      </View>

      {selectedEntry && (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View style={s.detailCard}>
            <View style={s.detailBadgeHeader}>
              <Ticket size={24} color={COLORS.primary} />
              <View style={{ marginLeft: 10 }}>
                <Text style={s.detailTitle}>{selectedEntry.name}</Text>
                <Text style={s.detailSub}>{selectedEntry.visitor_code}</Text>
              </View>
            </View>

            {[
              ["Pass Tier", selectedEntry.tier],
              ["Email Address", selectedEntry.email],
              ["Phone Contact", selectedEntry.phone],
              ["Gate Status", selectedEntry.status],
              ["Check-In Stamp", selectedEntry.checkin_time || "Not Checked In"],
              ["Check-Out Stamp", selectedEntry.checkout_time || "Not Checked Out"],
            ].map(([label, value]) => (
              <View key={label} style={s.detailRow}>
                <Text style={s.detailLabel}>{label}</Text>
                <Text style={s.detailVal}>{value}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
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
  headerTitle: { fontSize: 17, fontWeight: "900", color: COLORS.dark },
  scanHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scanHeaderBtnText: { color: "#ffffff", fontSize: 13, fontWeight: "bold" },
  backHeaderBtn: { flexDirection: "row", alignItems: "center" },
  backHeaderBtnText: { color: COLORS.primary, fontSize: 14, fontWeight: "bold" },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
    height: 46,
  },
  searchInput: { flex: 1, color: COLORS.dark, fontSize: 14 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { paddingVertical: 60, alignItems: "center", gap: 10 },
  emptyText: { color: COLORS.subText, fontSize: 14, fontWeight: "bold" },

  list: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 6 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  codeBadge: { backgroundColor: "#e0f2fe", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  eventCode: { fontSize: 11, fontWeight: "800", color: "#0369a1", letterSpacing: 0.5 },
  eyeBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginLeft: 8 },
  eyeBtnText: { color: COLORS.primary, fontSize: 13, fontWeight: "bold" },
  eventName: { fontSize: 15, fontWeight: "800", color: COLORS.dark, marginBottom: 12 },

  statsRow: { flexDirection: "row", gap: 8 },
  statBox: { flex: 1, backgroundColor: "#f8fafc", borderRadius: 10, padding: 10, alignItems: "center" },
  statBoxGreen: { backgroundColor: "#dcfce7" },
  statLabel: { fontSize: 11, color: COLORS.subText, fontWeight: "700", marginBottom: 2 },
  statValue: { fontSize: 18, fontWeight: "900", color: COLORS.dark },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },
  pageBtn: { padding: 8 },
  pageText: { fontSize: 14, fontWeight: "bold", color: COLORS.dark, marginHorizontal: 16 },

  subHeaderCard: {
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#bae6fd",
  },
  subHeaderCode: { fontSize: 11, fontWeight: "800", color: COLORS.primary },
  subHeaderTitle: { fontSize: 15, fontWeight: "900", color: COLORS.dark },

  filterRow: { flexDirection: "row", paddingHorizontal: 16, marginTop: 10, gap: 8 },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  filterPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterPillText: { fontSize: 12, fontWeight: "700", color: COLORS.subText },
  filterPillTextActive: { color: "#ffffff" },

  tierBadge: { fontSize: 11, fontWeight: "800", color: COLORS.accent, backgroundColor: "#fff7ed", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  timeRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  timeLabel: { fontSize: 12, color: COLORS.subText, fontWeight: "700", width: 90 },
  timeVal: { fontSize: 12, color: COLORS.dark, fontWeight: "600" },

  actionRow: { marginTop: 12, flexDirection: "row", justifyContent: "flex-end" },
  checkInBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: COLORS.green, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  checkOutBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#ef4444", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  checkBtnText: { color: "#ffffff", fontSize: 13, fontWeight: "bold" },
  completedBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  completedText: { color: COLORS.subText, fontSize: 12, fontWeight: "700" },

  detailCard: { backgroundColor: "#ffffff", borderRadius: 16, padding: 18, borderWidth: 1, borderColor: "#e2e8f0" },
  detailBadgeHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  detailTitle: { fontSize: 18, fontWeight: "900", color: COLORS.dark },
  detailSub: { fontSize: 13, color: COLORS.subText, fontWeight: "700" },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  detailLabel: { fontSize: 13, color: COLORS.subText, fontWeight: "700" },
  detailVal: { fontSize: 13, color: COLORS.dark, fontWeight: "800" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.6)", justifyContent: "center", padding: 20 },
  scannerModalCard: { backgroundColor: "#ffffff", borderRadius: 20, padding: 20, elevation: 10 },
  scannerHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  scannerTitle: { fontSize: 16, fontWeight: "900", color: COLORS.dark, marginLeft: 8 },
  viewfinderBox: {
    height: 180,
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  scanLine: { position: "absolute", top: 40, left: 0, right: 0, height: 2, backgroundColor: COLORS.accent },
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
  resultText: { fontSize: 13, fontWeight: "700", flex: 1 },
  resultTextSuccess: { color: "#15803d" },
  resultTextError: { color: "#b91c1c" },
  flexRow: { flexDirection: "row", alignItems: "center" },
});
