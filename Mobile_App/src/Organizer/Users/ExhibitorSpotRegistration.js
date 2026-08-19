import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, ChevronLeft, ChevronRight } from "lucide-react-native";

export default function PassGeneration() {
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={s.pageTitle}>Pass Generation</Text>

        <View style={s.card}>
          {/* Search */}
          <View style={s.searchBar}>
            <Search size={18} color="#9ca3af" />
            <TextInput
              style={s.searchInput}
              placeholder="Search Keyword..."
              placeholderTextColor="#9ca3af"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Table (horizontal scroll) */}
          <ScrollView horizontal showsHorizontalScrollIndicator keyboardShouldPersistTaps="handled">
            <View style={s.table}>
              <View style={s.tableHeader}>
                <Text style={[s.th, { width: 80 }]}>Action</Text>
                <Text style={[s.th, { width: 120 }]}>Event Code ??</Text>
                <Text style={[s.th, { width: 200 }]}>Event Name ??</Text>
              </View>
              <View style={s.emptyRow}>
                <Text style={s.emptyText}>No Data Found.</Text>
              </View>
            </View>
          </ScrollView>

          {/* Pagination */}
          <View style={s.paginationRow}>
            <Text style={s.paginationText}>Showing 0 to 0 of 0 entries</Text>
            <View style={s.paginationControls}>
              <Text style={s.recordsLabel}>Records per page:</Text>
              <View style={s.dropdownWrapper}>
                <TouchableOpacity style={s.dropdownTrigger} onPress={() => setShowDropdown(!showDropdown)}>
                  <Text style={s.dropdownValue}>{rowsPerPage}</Text>
                </TouchableOpacity>
                {showDropdown && (
                  <View style={s.dropdownList}>
                    {[10, 25, 50, 100].map(v => (
                      <TouchableOpacity key={v} style={s.dropdownOption} onPress={() => { setRowsPerPage(v); setShowDropdown(false); }}>
                        <Text style={s.dropdownOptionText}>{v}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <TouchableOpacity style={[s.pageBtn, s.pageBtnDisabled]} disabled>
                <ChevronLeft size={18} color="#cbd5e1" />
              </TouchableOpacity>
              <TouchableOpacity style={[s.pageBtn, s.pageBtnDisabled]} disabled>
                <ChevronRight size={18} color="#cbd5e1" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  scrollContent: { padding: 20 },
  pageTitle: { fontSize: 26, fontWeight: "bold", color: "#1f2937", marginBottom: 20 },
  card: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", padding: 16 },
  searchBar: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, paddingHorizontal: 12, marginBottom: 16, gap: 8 },
  searchInput: { flex: 1, paddingVertical: 8, fontSize: 14, color: "#111827" },
  table: { minWidth: 400 },
  tableHeader: { flexDirection: "row", backgroundColor: "#0284c7", paddingVertical: 12, paddingHorizontal: 12 },
  th: { color: "#fff", fontSize: 11, fontWeight: "bold", textTransform: "uppercase" },
  emptyRow: { paddingVertical: 28, alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  emptyText: { color: "#64748b", fontSize: 13 },
  paginationRow: { marginTop: 16, gap: 12 },
  paginationText: { fontSize: 13, color: "#64748b" },
  paginationControls: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  recordsLabel: { fontSize: 13, color: "#64748b" },
  dropdownWrapper: { position: "relative" },
  dropdownTrigger: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: "#fff" },
  dropdownValue: { fontSize: 13, color: "#475569" },
  dropdownList: { position: "absolute", top: "100%", left: 0, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 6, elevation: 5, zIndex: 100, minWidth: 60 },
  dropdownOption: { paddingHorizontal: 12, paddingVertical: 8 },
  dropdownOptionText: { fontSize: 13, color: "#475569" },
  pageBtn: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, padding: 6, backgroundColor: "#fff" },
  pageBtnDisabled: { opacity: 0.4 },
});
