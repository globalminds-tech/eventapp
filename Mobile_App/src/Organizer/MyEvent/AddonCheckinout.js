import React, { useState } from "react";
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
  Plus,
  Search,
  Eye,
  ChevronLeft,
  X,
  QrCode,
  PackageCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react-native";
import { COLORS } from "../../styles/theme";

const DUMMY_ADDONS = [
  { id: "1", addon: "VIP Lounge Pass", category: "Lounge", code: "AD-101", visitor: "Johnathan Wick", time: "10:30 AM", status: "Checked-In" },
  { id: "2", addon: "Keynote Workshop Pass", category: "Workshop", code: "AD-102", visitor: "Clara Oswald", time: null, status: "Pending" },
  { id: "3", addon: "Official Swag Bag & Hoodie", category: "Merchandise", code: "AD-103", visitor: "Bruce Wayne", time: "11:15 AM", status: "Checked-In" },
  { id: "4", addon: "Reserved VIP Parking spot #12", category: "Parking", code: "AD-104", visitor: "Diana Prince", time: null, status: "Pending" },
];

export default function AddonCheckIn({ navigation }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [data, setData] = useState(DUMMY_ADDONS);
  const [viewItem, setViewItem] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [scanResult, setScanResult] = useState(null);

  const categories = ["All", "Lounge", "Workshop", "Merchandise", "Parking"];

  const filtered = data.filter((row) => {
    const matchSearch =
      row.visitor.toLowerCase().includes(search.toLowerCase()) ||
      row.code.toLowerCase().includes(search.toLowerCase()) ||
      row.addon.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "All" || row.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const checkedInCount = data.filter((d) => d.status === "Checked-In").length;
  const pendingCount = data.filter((d) => d.status === "Pending").length;

  const handleToggleCheckIn = (id) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setData((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "Checked-In" ? "Pending" : "Checked-In",
              time: item.status === "Checked-In" ? null : timeNow,
            }
          : item
      )
    );
  };

  const handleValidateAddon = () => {
    const code = manualCode.trim() || "AD-102";
    const found = data.find((d) => d.code.toLowerCase() === code.toLowerCase());

    if (found) {
      handleToggleCheckIn(found.id);
      setScanResult({
        success: true,
        message: `Add-On Verified: ${found.addon} redeemed by ${found.visitor}!`,
      });
    } else {
      setScanResult({
        success: false,
        message: `Add-On Code "${code}" not found.`,
      });
    }
  };

  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Header */}
      <View style={s.header}>
        <View style={s.flexRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation && navigation.goBack ? navigation.goBack() : null}>
            <ChevronLeft size={22} color={COLORS.dark} />
          </TouchableOpacity>
          <View style={{ marginLeft: 8 }}>
            <Text style={s.headerBadge}>EVENT SERVICES</Text>
            <Text style={s.headerTitle}>Add-On & Perks Check-In</Text>
          </View>
        </View>

        <TouchableOpacity style={s.scanBtn} onPress={() => { setScanResult(null); setShowScanner(true); }}>
          <QrCode size={18} color="#ffffff" />
          <Text style={s.scanBtnText}>Scan</Text>
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      <View style={s.statsRow}>
        <View style={s.statBox}>
          <Text style={s.statLabel}>Redeemed Add-Ons</Text>
          <Text style={[s.statValue, { color: COLORS.green }]}>{checkedInCount}</Text>
        </View>
        <View style={s.statBox}>
          <Text style={s.statLabel}>Pending Redemption</Text>
          <Text style={[s.statValue, { color: COLORS.accent }]}>{pendingCount}</Text>
        </View>
      </View>

      {/* Category Pills */}
      <View style={s.categoryBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(cat) => cat}
          renderItem={({ item: cat }) => (
            <TouchableOpacity
              style={[s.catPill, categoryFilter === cat && s.catPillActive]}
              onPress={() => setCategoryFilter(cat)}
            >
              <Text style={[s.catPillText, categoryFilter === cat && s.catPillTextActive]}>{cat}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Search Bar */}
      <View style={s.searchContainer}>
        <Search size={16} color={COLORS.subText} />
        <TextInput
          style={s.searchInput}
          placeholder="Search by visitor, code, or perk..."
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

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <PackageCheck size={40} color="#cbd5e1" />
            <Text style={s.emptyText}>No add-on vouchers found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Text style={s.addonName}>{item.addon}</Text>
              <View style={[s.badge, item.status === "Checked-In" ? s.badgeGreen : s.badgeAmber]}>
                <Text style={[s.badgeText, item.status === "Checked-In" ? s.textGreen : s.textAmber]}>
                  {item.status}
                </Text>
              </View>
            </View>

            <View style={s.cardBody}>
              <Text style={s.infoLine}>
                Voucher Code: <Text style={s.infoVal}>{item.code}</Text>
              </Text>
              <Text style={s.infoLine}>
                Attendee: <Text style={s.infoVal}>{item.visitor}</Text>
              </Text>
              <Text style={s.infoLine}>
                Redeemed Time: <Text style={s.infoVal}>{item.time || "Not yet"}</Text>
              </Text>
            </View>

            <View style={s.cardActions}>
              <TouchableOpacity style={s.viewBtn} onPress={() => setViewItem(item)}>
                <Eye size={14} color={COLORS.primary} />
                <Text style={s.viewBtnText}>Details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.redeemBtn, item.status === "Checked-In" ? s.redeemBtnActive : s.redeemBtnPending]}
                onPress={() => handleToggleCheckIn(item.id)}
              >
                <CheckCircle2 size={14} color="#ffffff" />
                <Text style={s.redeemBtnText}>
                  {item.status === "Checked-In" ? "Undo Check-In" : "Redeem Perk"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Details Modal */}
      <Modal visible={!!viewItem} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.detailModalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Add-On Voucher Details</Text>
              <TouchableOpacity onPress={() => setViewItem(null)}>
                <X size={20} color={COLORS.dark} />
              </TouchableOpacity>
            </View>

            {viewItem && (
              <View style={{ gap: 10 }}>
                <View style={s.detailRow}>
                  <Text style={s.detailLabel}>Perk Name:</Text>
                  <Text style={s.detailVal}>{viewItem.addon}</Text>
                </View>
                <View style={s.detailRow}>
                  <Text style={s.detailLabel}>Category:</Text>
                  <Text style={s.detailVal}>{viewItem.category}</Text>
                </View>
                <View style={s.detailRow}>
                  <Text style={s.detailLabel}>Ticket Code:</Text>
                  <Text style={s.detailVal}>{viewItem.code}</Text>
                </View>
                <View style={s.detailRow}>
                  <Text style={s.detailLabel}>Attendee:</Text>
                  <Text style={s.detailVal}>{viewItem.visitor}</Text>
                </View>
                <View style={s.detailRow}>
                  <Text style={s.detailLabel}>Redemption Status:</Text>
                  <Text style={[s.detailVal, { color: viewItem.status === "Checked-In" ? COLORS.green : COLORS.accent }]}>
                    {viewItem.status}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* QR Scanner Modal */}
      <Modal visible={showScanner} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.detailModalCard}>
            <View style={s.modalHeader}>
              <View style={s.flexRow}>
                <Sparkles size={18} color={COLORS.primary} />
                <Text style={[s.modalTitle, { marginLeft: 6 }]}>Add-On QR Scanner</Text>
              </View>
              <TouchableOpacity onPress={() => setShowScanner(false)}>
                <X size={20} color={COLORS.dark} />
              </TouchableOpacity>
            </View>

            <View style={s.viewfinderBox}>
              <QrCode size={70} color="rgba(2, 132, 199, 0.4)" />
              <Text style={s.viewfinderHint}>Align Add-On Voucher QR Code</Text>
            </View>

            <View style={{ marginTop: 14 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: COLORS.dark, marginBottom: 6 }}>
                Or Enter Add-On Code:
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TextInput
                  style={s.manualInput}
                  placeholder="e.g. AD-102"
                  value={manualCode}
                  onChangeText={setManualCode}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={s.verifyBtn} onPress={handleValidateAddon}>
                  <Text style={s.verifyBtnText}>Redeem</Text>
                </TouchableOpacity>
              </View>
            </View>

            {scanResult && (
              <View style={[s.resultBanner, scanResult.success ? s.resultSuccess : s.resultError]}>
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

  statsRow: { flexDirection: "row", paddingHorizontal: 16, paddingTop: 12, gap: 8 },
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

  categoryBar: { paddingHorizontal: 16, marginTop: 12 },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginRight: 6,
  },
  catPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catPillText: { fontSize: 12, fontWeight: "700", color: COLORS.subText },
  catPillTextActive: { color: "#ffffff" },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    height: 42,
    gap: 8,
  },
  searchInput: { flex: 1, color: COLORS.dark, fontSize: 13 },

  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },
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
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  addonName: { fontSize: 15, fontWeight: "800", color: COLORS.dark, flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeGreen: { backgroundColor: "#dcfce7" },
  badgeAmber: { backgroundColor: "#ffedd5" },
  badgeText: { fontSize: 11, fontWeight: "800" },
  textGreen: { color: COLORS.green },
  textAmber: { color: COLORS.amber },

  cardBody: { marginBottom: 10 },
  infoLine: { fontSize: 12, color: COLORS.subText, marginBottom: 2 },
  infoVal: { color: COLORS.dark, fontWeight: "700" },

  cardActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTopWidth: 1, borderTopColor: "#f8fafc" },
  viewBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  viewBtnText: { fontSize: 12, fontWeight: "700", color: COLORS.primary },
  redeemBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  redeemBtnPending: { backgroundColor: COLORS.primary },
  redeemBtnActive: { backgroundColor: COLORS.accent },
  redeemBtnText: { color: "#ffffff", fontSize: 12, fontWeight: "bold" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.6)", justifyContent: "center", padding: 20 },
  detailModalCard: { backgroundColor: "#ffffff", borderRadius: 20, padding: 20, elevation: 10 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  modalTitle: { fontSize: 16, fontWeight: "900", color: COLORS.dark },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  detailLabel: { fontSize: 13, color: COLORS.subText, fontWeight: "700" },
  detailVal: { fontSize: 13, color: COLORS.dark, fontWeight: "800" },

  viewfinderBox: {
    height: 150,
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  viewfinderHint: { fontSize: 12, color: COLORS.subText, fontWeight: "700", marginTop: 8 },
  manualInput: { flex: 1, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 12, height: 42, fontSize: 13 },
  verifyBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 16, justifyContent: "center" },
  verifyBtnText: { color: "#ffffff", fontWeight: "bold", fontSize: 13 },
  resultBanner: { padding: 10, borderRadius: 10, marginTop: 10 },
  resultSuccess: { backgroundColor: "#dcfce7" },
  resultError: { backgroundColor: "#fee2e2" },
  resultText: { fontSize: 12, fontWeight: "700" },
  resultTextSuccess: { color: "#15803d" },
  resultTextError: { color: "#b91c1c" },
  flexRow: { flexDirection: "row", alignItems: "center" },
});
