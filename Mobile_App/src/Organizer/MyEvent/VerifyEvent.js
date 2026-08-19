import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, X, ChevronDown } from "lucide-react-native";

export default function EventVerification() {
  const [search, setSearch] = useState("");
  const [viewBy, setViewBy] = useState("All");
  const [showFilter, setShowFilter] = useState(false);

  const VIEW_OPTIONS = ["All", "Verified", "Pending", "Rejected"];
  const events = []; // Populated from API

  const filtered = events.filter((e) => {
    const matchSearch = (e.event_name || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = viewBy === "All" || e.status === viewBy;
    return matchSearch && matchFilter;
  });

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Event Verification</Text>
      </View>

      {/* Controls */}
      <View style={s.controls}>
        <View style={s.searchContainer}>
          <Search size={16} color="#94a3b8" />
          <TextInput
            style={s.searchInput}
            placeholder="Search by Event Name"
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <X size={14} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={s.filterBtn} onPress={() => setShowFilter(!showFilter)}>
          <Text style={s.filterBtnText}>View By: {viewBy}</Text>
          <ChevronDown size={14} color="#334155" />
        </TouchableOpacity>
      </View>

      {/* Dropdown */}
      {showFilter && (
        <View style={s.filterDropdown}>
          {VIEW_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[s.filterOption, viewBy === opt && s.filterOptionActive]}
              onPress={() => { setViewBy(opt); setShowFilter(false); }}
            >
              <Text style={[s.filterOptionText, viewBy === opt && { color: "#0284c7", fontWeight: "bold" }]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item, idx) => idx.toString()}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <Text style={s.emptyText}>No events to display</Text>
            <Text style={s.emptySubText}>
              {viewBy !== "All" ? `No ${viewBy} events found` : "Submit events for verification to see them here"}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const statusColors = {
            Verified: { bg: "#dcfce7", text: "#15803d" },
            Pending: { bg: "#fef3c7", text: "#d97706" },
            Rejected: { bg: "#fee2e2", text: "#b91c1c" },
          };
          const colors = statusColors[item.status] || { bg: "#f1f5f9", text: "#64748b" };
          return (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.eventName}>{item.event_name}</Text>
                <View style={[s.badge, { backgroundColor: colors.bg }]}>
                  <Text style={[s.badgeText, { color: colors.text }]}>{item.status}</Text>
                </View>
              </View>
              <Text style={s.eventCode}>{item.event_code}</Text>
              <Text style={s.dateText}>
                {item.start_date} ? {item.end_date}
              </Text>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#0c4a6e" },
  controls: { flexDirection: "row", gap: 10, padding: 16, alignItems: "center" },
  searchContainer: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#fff", paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0", height: 44, gap: 8 },
  searchInput: { flex: 1, color: "#0f172a", fontSize: 14 },
  filterBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 12, height: 44 },
  filterBtnText: { fontSize: 13, color: "#334155", fontWeight: "600" },
  filterDropdown: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, marginHorizontal: 16, marginBottom: 8, overflow: "hidden" },
  filterOption: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  filterOptionActive: { backgroundColor: "#f0f9ff" },
  filterOptionText: { fontSize: 14, color: "#334155" },
  list: { paddingHorizontal: 16, paddingBottom: 80 },
  emptyContainer: { paddingVertical: 80, alignItems: "center", gap: 8 },
  emptyText: { fontSize: 16, fontWeight: "bold", color: "#94a3b8" },
  emptySubText: { fontSize: 13, color: "#cbd5e1", textAlign: "center" },
  card: { backgroundColor: "#fff", borderRadius: 12, marginBottom: 14, padding: 16, borderWidth: 1, borderColor: "#e2e8f0", elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  eventName: { fontSize: 15, fontWeight: "bold", color: "#0f172a", flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: "bold" },
  eventCode: { fontSize: 11, color: "#64748b", fontWeight: "bold", letterSpacing: 1, marginBottom: 4 },
  dateText: { fontSize: 12, color: "#94a3b8" },
});
