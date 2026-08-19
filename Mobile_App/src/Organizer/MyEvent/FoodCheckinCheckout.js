import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, X } from "lucide-react-native";

export default function FoodCheckIn() {
  const [search, setSearch] = useState("");
  const events = []; // Populated from API

  const filtered = events.filter((e) =>
    (e.event_code || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.event_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Food Check-In / Check-Out</Text>
      </View>

      <View style={s.searchContainer}>
        <Search size={18} color="#94a3b8" />
        <TextInput
          style={s.searchInput}
          placeholder="Search Keyword..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={(v) => setSearch(v)}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <X size={16} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item, idx) => idx.toString()}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <Search size={40} color="#cbd5e1" />
            <Text style={s.emptyText}>No Data Found</Text>
            <Text style={s.emptySubText}>No food check-in events available</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <Text style={s.eventCode}>{item.event_code}</Text>
            <Text style={s.eventName}>{item.event_name}</Text>
            <View style={s.dateRow}>
              <Text style={s.dateLabel}>Start: </Text>
              <Text style={s.dateVal}>{item.start_date}</Text>
            </View>
            <View style={s.dateRow}>
              <Text style={s.dateLabel}>End: </Text>
              <Text style={s.dateVal}>{item.end_date}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#0c4a6e" },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", margin: 16, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0", gap: 8 },
  searchInput: { flex: 1, height: 44, color: "#0f172a", fontSize: 14 },
  list: { paddingHorizontal: 16, paddingBottom: 80 },
  emptyContainer: { paddingVertical: 80, alignItems: "center", gap: 10 },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#94a3b8" },
  emptySubText: { fontSize: 13, color: "#cbd5e1" },
  card: { backgroundColor: "#fff", borderRadius: 12, marginBottom: 14, padding: 16, borderWidth: 1, borderColor: "#e2e8f0", elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4 },
  eventCode: { fontSize: 12, fontWeight: "bold", color: "#0284c7", letterSpacing: 1, marginBottom: 4 },
  eventName: { fontSize: 15, fontWeight: "bold", color: "#0f172a", marginBottom: 8 },
  dateRow: { flexDirection: "row", marginBottom: 2 },
  dateLabel: { fontSize: 12, color: "#64748b", fontWeight: "bold" },
  dateVal: { fontSize: 12, color: "#0f172a" },
});
