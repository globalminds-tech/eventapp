import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, StyleSheet, Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye, Search, X, ChevronLeft, ChevronRight, Printer } from "lucide-react-native";

const EVENTS = [
  { id: 1, code: "EVT-25", name: "MRC Event", visitors: 11 },
  { id: 2, code: "EVT-22", name: "VALLUVAR KOTTAM PARK", visitors: 71 },
  { id: 3, code: "EVT-9", name: "Furniture and Home Products Expo", visitors: 1 },
  { id: 4, code: "EVT-12", name: "LOGMAT EXPO - 2025", visitors: 2 },
  { id: 5, code: "EVT-11", name: "DISTRICT CONFERENCE 2025", visitors: 2 },
  { id: 6, code: "EVT-10", name: "Global Startup Networking", visitors: 1 },
  { id: 7, code: "EVT-6", name: "Interactive Art Installation", visitors: 4 },
  { id: 8, code: "EVT-5", name: "MedTech for CSI", visitors: 2 },
  { id: 9, code: "EVT-4", name: "Comic Con 2025", visitors: 1 },
  { id: 10, code: "EVT-3", name: "Flower Show", visitors: 1 },
  { id: 11, code: "EVT-1", name: "Tech Summit 2025", visitors: 5 },
];

// --- Pass Card Modal ----------------------------------------------------------
function PassCardModal({ visitor, event, visible, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.passOverlay}>
        <View style={s.passContainer}>
          {/* Pass Card */}
          <View style={s.passCard}>
            {/* Top Orange Header */}
            <View style={s.passHeader}>
              <Text style={s.passHeaderText}>{event?.name || "Event"}</Text>
            </View>

            {/* Body */}
            <View style={s.passBody}>
              {/* Logo placeholder */}
              <View style={s.passLogo}>
                <Text style={s.passLogoEmoji}>??</Text>
                <Text style={s.passLogoTitle}>SAMAVESHA</Text>
                <Text style={s.passLogoYear}>2025</Text>
              </View>

              <Text style={s.passDateText}>01-08-2025 To 01-08-2025</Text>
              <Text style={s.passVenueText}>MRC Nagar</Text>

              <Text style={s.passVisitorName}>{(visitor?.name || "VISITOR").toUpperCase()}</Text>
              <View style={s.passDivider} />

              {/* QR Placeholder */}
              <View style={s.passQR}>
                <Text style={s.passQRText}>QR Code</Text>
              </View>

              <Text style={s.passCodeText}>{visitor?.code}</Text>
            </View>

            {/* Bottom Footer */}
            <View style={s.passFooter}>
              <Text style={s.passFooterText}>Visitors</Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={s.passActions}>
            <TouchableOpacity style={s.passDownloadBtn}>
              <Printer size={16} color="#fff" />
              <Text style={s.passDownloadText}>Print Pass</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.passCloseBtn} onPress={onClose}>
              <Text style={s.passCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// --- Event Detail Page (Pass Search) -----------------------------------------
function EventDetailPage({ event, onBack }) {
  const [search, setSearch] = useState("");
  const [visitors, setVisitors] = useState([]);
  const [passCard, setPassCard] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  let nextCode = `VIS-${4595 - visitors.length}`;

  const handleGetPass = () => {
    const q = search.trim();
    if (!q) return;
    const newVisitor = {
      code: nextCode,
      name: q,
      contact: "",
      email: q.includes("@") ? q : "",
      id: Date.now(),
    };
    setVisitors((prev) => [newVisitor, ...prev]);
    setSearch("");
  };

  const totalPages = Math.max(1, Math.ceil(visitors.length / PER_PAGE));
  const paged = visitors.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={onBack}>
          <X size={16} color="#0284c7" />
          <Text style={s.backBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Pass – {event.name}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        {/* Search Panel */}
        <View style={s.searchPanel}>
          <Text style={s.searchPanelTitle}>Search / Scan QR to Get Pass</Text>
          <TextInput
            style={s.input}
            value={search}
            onChangeText={setSearch}
            placeholder="Contact / Name / Mail / Visitor Code"
            placeholderTextColor="#94a3b8"
            onSubmitEditing={handleGetPass}
          />
          <View style={s.searchActions}>
            <TouchableOpacity style={s.getPassBtn} onPress={handleGetPass}>
              <Text style={s.getPassBtnText}>Get Pass</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.clearSearchBtn} onPress={() => setSearch("")}>
              <Text style={s.clearSearchBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Visitors */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>No. of Passes ({visitors.length})</Text>
          {paged.length === 0 ? (
            <Text style={s.emptyText}>No passes yet. Search above to add a visitor.</Text>
          ) : (
            paged.map((v) => (
              <View key={v.id} style={s.visitorCard}>
                <View style={{ flex: 1 }}>
                  <Text style={s.visitorCode}>{v.code}</Text>
                  <Text style={s.visitorName}>{v.name}</Text>
                  {v.email ? <Text style={s.visitorMeta}>{v.email}</Text> : null}
                  {v.contact ? <Text style={s.visitorMeta}>{v.contact}</Text> : null}
                </View>
                <TouchableOpacity style={s.printBtn} onPress={() => setPassCard(v)}>
                  <Printer size={18} color="#0284c7" />
                  <Text style={s.printBtnText}>Print</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          {totalPages > 1 && (
            <View style={[s.pagination, { marginTop: 12 }]}>
              <TouchableOpacity disabled={page === 1} onPress={() => setPage((p) => Math.max(1, p - 1))} style={s.pageBtn}>
                <ChevronLeft size={18} color={page === 1 ? "#cbd5e1" : "#0f172a"} />
              </TouchableOpacity>
              <Text style={s.pageText}>{page}/{totalPages}</Text>
              <TouchableOpacity disabled={page === totalPages} onPress={() => setPage((p) => Math.min(totalPages, p + 1))} style={s.pageBtn}>
                <ChevronRight size={18} color={page === totalPages ? "#cbd5e1" : "#0f172a"} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <PassCardModal
        visible={!!passCard}
        visitor={passCard}
        event={event}
        onClose={() => setPassCard(null)}
      />
    </SafeAreaView>
  );
}

// --- Page 1: Event List -------------------------------------------------------
export default function Pass() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState("code");
  const [sortDir, setSortDir] = useState("asc");
  const PER_PAGE = 10;

  if (selectedEvent) {
    return <EventDetailPage event={selectedEvent} onBack={() => setSelectedEvent(null)} />;
  }

  const filtered = EVENTS.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.code.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const va = sortField === "code" ? a.code : a.name;
    const vb = sortField === "code" ? b.code : b.name;
    return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const paged = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Pass</Text>
      </View>

      <View style={s.searchContainer}>
        <Search size={18} color="#94a3b8" />
        <TextInput
          style={s.searchInput}
          placeholder="Search events..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={(v) => { setSearch(v); setPage(1); }}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <X size={16} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Sort Controls */}
      <View style={s.sortRow}>
        <Text style={s.sortLabel}>Sort by:</Text>
        {["code", "name"].map((field) => (
          <TouchableOpacity
            key={field}
            style={[s.sortBtn, sortField === field && s.sortBtnActive]}
            onPress={() => toggleSort(field)}
          >
            <Text style={[s.sortBtnText, sortField === field && { color: "#0284c7" }]}>
              {field === "code" ? "Event Code" : "Event Name"} {sortField === field ? (sortDir === "asc" ? "?" : "?") : ""}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={paged}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <Text style={s.emptyText}>No events found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Text style={s.eventCode}>{item.code}</Text>
              <View style={s.visitorCountBadge}>
                <Text style={s.visitorCountText}>{item.visitors} Visitors</Text>
              </View>
            </View>
            <Text style={s.eventName}>{item.name}</Text>
            <TouchableOpacity style={s.viewPassBtn} onPress={() => setSelectedEvent(item)}>
              <Eye size={16} color="#0284c7" />
              <Text style={s.viewPassBtnText}>View Passes</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {totalPages > 1 && (
        <View style={s.pagination}>
          <TouchableOpacity disabled={page === 1} onPress={() => setPage((p) => Math.max(1, p - 1))} style={s.pageBtn}>
            <ChevronLeft size={20} color={page === 1 ? "#cbd5e1" : "#0f172a"} />
          </TouchableOpacity>
          <Text style={s.pageText}>{page} / {totalPages}</Text>
          <TouchableOpacity disabled={page === totalPages} onPress={() => setPage((p) => Math.min(totalPages, p + 1))} style={s.pageBtn}>
            <ChevronRight size={20} color={page === totalPages ? "#cbd5e1" : "#0f172a"} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", gap: 10 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#0c4a6e", flex: 1 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: "#bae6fd", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#f0f9ff" },
  backBtnText: { color: "#0284c7", fontSize: 13, fontWeight: "bold" },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", margin: 16, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0", gap: 8 },
  searchInput: { flex: 1, height: 44, color: "#0f172a", fontSize: 14 },
  sortRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  sortLabel: { fontSize: 12, color: "#64748b", fontWeight: "bold" },
  sortBtn: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: "#fff" },
  sortBtnActive: { borderColor: "#bae6fd", backgroundColor: "#f0f9ff" },
  sortBtnText: { fontSize: 12, color: "#64748b" },
  list: { paddingHorizontal: 16, paddingBottom: 80 },
  emptyContainer: { paddingVertical: 60, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#94a3b8" },
  card: { backgroundColor: "#fff", borderRadius: 12, marginBottom: 14, padding: 16, borderWidth: 1, borderColor: "#e2e8f0", elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  eventCode: { fontSize: 11, fontWeight: "bold", color: "#0284c7", letterSpacing: 1 },
  visitorCountBadge: { backgroundColor: "#f0f9ff", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, borderWidth: 1, borderColor: "#bae6fd" },
  visitorCountText: { fontSize: 11, color: "#0284c7", fontWeight: "bold" },
  eventName: { fontSize: 15, fontWeight: "bold", color: "#0f172a", marginBottom: 10 },
  viewPassBtn: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" },
  viewPassBtnText: { color: "#0284c7", fontSize: 13, fontWeight: "bold" },
  pagination: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#e2e8f0", backgroundColor: "#fff" },
  pageBtn: { padding: 8 },
  pageText: { fontSize: 14, fontWeight: "bold", color: "#0f172a", marginHorizontal: 16 },
  // Detail page
  searchPanel: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  searchPanelTitle: { fontSize: 15, fontWeight: "bold", color: "#0284c7", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, height: 44, color: "#0f172a", fontSize: 14, backgroundColor: "#f8fafc", marginBottom: 10 },
  searchActions: { flexDirection: "row", gap: 10 },
  getPassBtn: { flex: 1, borderWidth: 2, borderColor: "#0284c7", borderRadius: 8, padding: 10, alignItems: "center" },
  getPassBtnText: { color: "#0284c7", fontWeight: "bold", fontSize: 14 },
  clearSearchBtn: { flex: 1, borderWidth: 2, borderColor: "#0284c7", borderRadius: 8, padding: 10, alignItems: "center" },
  clearSearchBtnText: { color: "#0284c7", fontWeight: "bold", fontSize: 14 },
  section: { backgroundColor: "#fff", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  sectionTitle: { fontSize: 15, fontWeight: "bold", color: "#0284c7", marginBottom: 12 },
  visitorCard: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingVertical: 10, gap: 10 },
  visitorCode: { fontSize: 11, fontWeight: "bold", color: "#0284c7", letterSpacing: 1 },
  visitorName: { fontSize: 14, fontWeight: "bold", color: "#0f172a" },
  visitorMeta: { fontSize: 12, color: "#64748b" },
  printBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: "#bae6fd", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#f0f9ff" },
  printBtnText: { color: "#0284c7", fontSize: 12, fontWeight: "bold" },
  // Pass Card
  passOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 20 },
  passContainer: { backgroundColor: "#fff", borderRadius: 16, padding: 20, width: "100%", maxWidth: 340, alignItems: "center", gap: 16 },
  passCard: { width: 280, borderRadius: 12, overflow: "hidden", elevation: 8, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10 },
  passHeader: { backgroundColor: "#f97316", padding: 14, alignItems: "center" },
  passHeaderText: { color: "#fff", fontWeight: "bold", fontSize: 13, textAlign: "center" },
  passBody: { backgroundColor: "#fff", padding: 16, alignItems: "center" },
  passLogo: { width: 80, height: 80, backgroundColor: "#f1f5f9", borderRadius: 8, justifyContent: "center", alignItems: "center", marginBottom: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  passLogoEmoji: { fontSize: 24 },
  passLogoTitle: { fontSize: 8, fontWeight: "bold", color: "#1e40af", letterSpacing: 1 },
  passLogoYear: { fontSize: 8, color: "#64748b" },
  passDateText: { fontSize: 10, color: "#1e3a8a", fontWeight: "500", marginBottom: 2 },
  passVenueText: { fontSize: 10, color: "#1e3a8a", marginBottom: 12 },
  passVisitorName: { fontSize: 20, fontWeight: "bold", color: "#111827", letterSpacing: 2, marginBottom: 4 },
  passDivider: { height: 3, backgroundColor: "#111827", width: 70, marginBottom: 10 },
  passQR: { width: 64, height: 64, backgroundColor: "#f1f5f9", borderRadius: 4, justifyContent: "center", alignItems: "center", marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" },
  passQRText: { fontSize: 9, color: "#94a3b8" },
  passCodeText: { fontSize: 12, color: "#374151", fontWeight: "500" },
  passFooter: { backgroundColor: "#f97316", padding: 10, alignItems: "center" },
  passFooterText: { color: "#fff", fontWeight: "bold", fontSize: 16, letterSpacing: 2 },
  passActions: { flexDirection: "row", gap: 10, width: "100%" },
  passDownloadBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#2563eb", padding: 12, borderRadius: 8 },
  passDownloadText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  passCloseBtn: { flex: 1, borderWidth: 1, borderColor: "#e2e8f0", padding: 12, borderRadius: 8, alignItems: "center" },
  passCloseText: { color: "#374151", fontWeight: "bold", fontSize: 14 },
});
