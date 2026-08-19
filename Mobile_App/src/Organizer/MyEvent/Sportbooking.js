import React, { useState, useEffect, useMemo } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react-native";
import { getAddOnEvents } from "@Services/api";

export default function AddOnSpotBooking() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const resData = await getAddOnEvents();
        const formatted = (Array.isArray(resData) ? resData : []).map((item) => ({
          code: item.event_code,
          name: item.event_name,
          start: new Date(item.start_date).toLocaleDateString("en-GB"),
          end: new Date(item.end_date).toLocaleDateString("en-GB"),
        }));
        setData(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter(
      (r) =>
        (r.code || "").toLowerCase().includes(q) ||
        (r.name || "").toLowerCase().includes(q)
    );
  }, [search, data]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentData = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Add-On Spot Booking</Text>
      </View>

      <View style={s.searchContainer}>
        <Search size={18} color="#94a3b8" />
        <TextInput
          style={s.searchInput}
          placeholder="Search Keyword..."
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

      <Text style={s.countText}>
        Showing {filtered.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} entries
      </Text>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      ) : (
        <FlatList
          data={currentData}
          keyExtractor={(item, idx) => idx.toString()}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              <Search size={40} color="#cbd5e1" />
              <Text style={s.emptyText}>No Data Found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.eventCode}>{item.code}</Text>
              </View>
              <Text style={s.eventName}>{item.name}</Text>
              <View style={s.datesRow}>
                <View style={s.dateBox}>
                  <Text style={s.dateLabel}>Start</Text>
                  <Text style={s.dateVal}>{item.start}</Text>
                </View>
                <View style={s.separator} />
                <View style={s.dateBox}>
                  <Text style={s.dateLabel}>End</Text>
                  <Text style={s.dateVal}>{item.end}</Text>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {totalPages > 1 && (
        <View style={s.pagination}>
          <TouchableOpacity
            disabled={page === 1}
            onPress={() => setPage((p) => Math.max(1, p - 1))}
            style={s.pageBtn}
          >
            <ChevronLeft size={20} color={page === 1 ? "#cbd5e1" : "#0f172a"} />
          </TouchableOpacity>
          <Text style={s.pageText}>{page} / {totalPages}</Text>
          <TouchableOpacity
            disabled={page === totalPages}
            onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
            style={s.pageBtn}
          >
            <ChevronRight size={20} color={page === totalPages ? "#cbd5e1" : "#0f172a"} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#0c4a6e" },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", margin: 16, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0", gap: 8 },
  searchInput: { flex: 1, height: 44, color: "#0f172a", fontSize: 14 },
  countText: { fontSize: 12, color: "#64748b", marginHorizontal: 16, marginBottom: 8 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { paddingHorizontal: 16, paddingBottom: 80 },
  emptyContainer: { paddingVertical: 80, alignItems: "center", gap: 10 },
  emptyText: { fontSize: 16, fontWeight: "bold", color: "#94a3b8" },
  card: { backgroundColor: "#fff", borderRadius: 12, marginBottom: 14, padding: 16, borderWidth: 1, borderColor: "#e2e8f0", elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4 },
  cardHeader: { marginBottom: 6 },
  eventCode: { fontSize: 11, fontWeight: "bold", color: "#0284c7", letterSpacing: 1 },
  eventName: { fontSize: 15, fontWeight: "bold", color: "#0f172a", marginBottom: 12 },
  datesRow: { flexDirection: "row", backgroundColor: "#f8fafc", borderRadius: 8, padding: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  dateBox: { flex: 1, alignItems: "center" },
  separator: { width: 1, backgroundColor: "#e2e8f0", marginHorizontal: 8 },
  dateLabel: { fontSize: 10, color: "#64748b", fontWeight: "bold", marginBottom: 2 },
  dateVal: { fontSize: 13, color: "#0f172a", fontWeight: "600" },
  pagination: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#e2e8f0", backgroundColor: "#fff" },
  pageBtn: { padding: 8 },
  pageText: { fontSize: 14, fontWeight: "bold", color: "#0f172a", marginHorizontal: 16 },
});
