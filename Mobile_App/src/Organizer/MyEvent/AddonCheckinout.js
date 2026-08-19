import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Search, Eye, ChevronLeft, ChevronRight, X } from "lucide-react-native";

const DUMMY_DATA = [
  { id: 1, addon: "Lunch Buffet", code: "AD-101", visitor: "John Doe", time: "10:30 AM", status: "Checked-In" },
  { id: 2, addon: "Networking Dinner", code: "AD-102", visitor: "Jane Smith", time: "06:15 PM", status: "Pending" },
  { id: 3, addon: "Workshop Access", code: "AD-103", visitor: "Alice Brown", time: "09:00 AM", status: "Checked-In" },
];

export default function AddonCheckIn() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewItem, setViewItem] = useState(null);
  const ITEMS_PER_PAGE = 10;

  const filtered = DUMMY_DATA.filter(
    (row) =>
      row.visitor.toLowerCase().includes(search.toLowerCase()) ||
      row.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentData = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const renderItem = ({ item }) => (
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
        <Text style={s.infoLine}>Code: <Text style={s.infoVal}>{item.code}</Text></Text>
        <Text style={s.infoLine}>Visitor: <Text style={s.infoVal}>{item.visitor}</Text></Text>
        <Text style={s.infoLine}>Time: <Text style={s.infoVal}>{item.time}</Text></Text>
      </View>
      <View style={s.cardActions}>
        <TouchableOpacity style={s.viewBtn} onPress={() => setViewItem(item)}>
          <Eye size={16} color="#0284c7" />
          <Text style={s.viewBtnText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Add-On Check-In / Check-Out</Text>
        <TouchableOpacity style={s.addBtn}>
          <Plus size={18} color="#fff" />
          <Text style={s.addBtnText}>Add Entry</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={s.searchContainer}>
        <Search size={18} color="#94a3b8" />
        <TextInput
          style={s.searchInput}
          placeholder="Search by visitor or code..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={(v) => { setSearch(v); setCurrentPage(1); }}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <X size={16} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Count */}
      <Text style={s.countText}>
        Showing {currentData.length} of {filtered.length} entries
      </Text>

      {/* List */}
      <FlatList
        data={currentData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <Search size={40} color="#cbd5e1" />
            <Text style={s.emptyText}>No records found</Text>
          </View>
        }
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={s.pagination}>
          <TouchableOpacity
            disabled={currentPage === 1}
            onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
            style={s.pageBtn}
          >
            <ChevronLeft size={20} color={currentPage === 1 ? "#cbd5e1" : "#0f172a"} />
          </TouchableOpacity>
          <Text style={s.pageText}>{currentPage} / {totalPages}</Text>
          <TouchableOpacity
            disabled={currentPage === totalPages}
            onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            style={s.pageBtn}
          >
            <ChevronRight size={20} color={currentPage === totalPages ? "#cbd5e1" : "#0f172a"} />
          </TouchableOpacity>
        </View>
      )}

      {/* View Detail Modal */}
      <Modal visible={!!viewItem} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Entry Details</Text>
              <TouchableOpacity onPress={() => setViewItem(null)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            {viewItem && (
              <View style={{ gap: 10 }}>
                {[
                  ["Add-On Name", viewItem.addon],
                  ["Visitor Code", viewItem.code],
                  ["Visitor", viewItem.visitor],
                  ["Time", viewItem.time],
                  ["Status", viewItem.status],
                ].map(([label, value]) => (
                  <View key={label} style={s.detailRow}>
                    <Text style={s.detailLabel}>{label}</Text>
                    <Text style={s.detailVal}>{value}</Text>
                  </View>
                ))}
              </View>
            )}
            <TouchableOpacity style={s.closeBtn} onPress={() => setViewItem(null)}>
              <Text style={s.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#0c4a6e", flex: 1, marginRight: 8 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#0284c7", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: "#fff", fontSize: 13, fontWeight: "bold" },

  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", margin: 16, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0", gap: 8 },
  searchInput: { flex: 1, height: 44, color: "#0f172a", fontSize: 14 },

  countText: { fontSize: 12, color: "#64748b", marginHorizontal: 16, marginBottom: 8 },

  list: { paddingHorizontal: 16, paddingBottom: 80 },
  card: { backgroundColor: "#fff", borderRadius: 12, marginBottom: 14, padding: 16, borderWidth: 1, borderColor: "#e2e8f0", elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  addonName: { fontSize: 15, fontWeight: "bold", color: "#0f172a", flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeGreen: { backgroundColor: "#dcfce7" },
  badgeAmber: { backgroundColor: "#fef3c7" },
  badgeText: { fontSize: 10, fontWeight: "bold" },
  textGreen: { color: "#15803d" },
  textAmber: { color: "#d97706" },

  cardBody: { gap: 4, marginBottom: 12 },
  infoLine: { fontSize: 12, color: "#64748b" },
  infoVal: { color: "#0f172a", fontWeight: "600" },

  cardActions: { borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 10 },
  viewBtn: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" },
  viewBtnText: { color: "#0284c7", fontSize: 13, fontWeight: "bold" },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40, gap: 10 },
  emptyText: { color: "#94a3b8", fontSize: 14, fontWeight: "bold" },

  pagination: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#e2e8f0", backgroundColor: "#fff" },
  pageBtn: { padding: 8 },
  pageText: { fontSize: 14, fontWeight: "bold", color: "#0f172a", marginHorizontal: 16 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", borderRadius: 16, width: "100%", padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingBottom: 12, marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#0f172a" },
  detailRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingVertical: 8 },
  detailLabel: { width: 120, fontSize: 13, color: "#64748b", fontWeight: "bold" },
  detailVal: { flex: 1, fontSize: 13, color: "#0f172a" },
  closeBtn: { backgroundColor: "#0f172a", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 20 },
  closeBtnText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
});
