import React, { useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAbstract } from "@Services/api";
import { Search, ChevronLeft, ChevronRight } from "lucide-react-native";

function parseDate(d) {
  if (!d) return new Date(0);
  const [dd, mm, yy] = d.split("/");
  if (!yy) return new Date(0);
  return new Date(yy, mm - 1, dd);
}

export const AbstractVerification = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(1);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resData = await getAbstract();
        const formatted = (resData || []).map((item) => ({
          code: item.event_code,
          name: item.event_name,
          start: new Date(item.start_date).toLocaleDateString("en-GB"),
          end: new Date(item.end_date).toLocaleDateString("en-GB"),
          approved: 0,
          rejected: 0,
          pending: 0,
        }));
        setData(formatted);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => d * -1);
    else {
      setSortKey(key);
      setSortDir(1);
    }
    setPage(1);
  };

  const sortIcon = (key) => sortKey === key ? (sortDir === 1 ? "?" : "?") : "??";

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let filteredData = data.filter(
      (r) =>
        (r.code || "").toLowerCase().includes(q) ||
        (r.name || "").toLowerCase().includes(q) ||
        (r.start || "").includes(q) ||
        (r.end || "").includes(q)
    );

    if (sortKey) {
      filteredData = [...filteredData].sort((a, b) => {
        let av = a[sortKey], bv = b[sortKey];
        if (sortKey === "start" || sortKey === "end") {
          av = parseDate(av);
          bv = parseDate(bv);
        }
        return av > bv ? sortDir : av < bv ? -sortDir : 0;
      });
    }
    return filteredData;
  }, [search, sortKey, sortDir, data]);

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const startIndex = (page - 1) * perPage;
  const slice = filtered.slice(startIndex, startIndex + perPage);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.pageTitle}>Abstract Verification</Text>

        <View style={styles.card}>
          <View style={styles.searchBar}>
            <Search size={16} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              value={search}
              onChangeText={(v) => { setSearch(v); setPage(1); }}
              placeholderTextColor="#94a3b8"
            />
          </View>

          {slice.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No matching records found.</Text>
            </View>
          ) : (
            slice.map((row, i) => (
              <View key={i} style={styles.listCard}>
                <View style={styles.listCardHeader}>
                  <View style={styles.codeBadge}><Text style={styles.codeText}>{row.code}</Text></View>
                  <Text style={styles.eventName} numberOfLines={1}>{row.name}</Text>
                </View>
                <View style={styles.listCardBody}>
                  <View style={styles.dateCol}>
                    <Text style={styles.label}>START DATE</Text>
                    <Text style={styles.valueText}>{row.start}</Text>
                  </View>
                  <View style={styles.dateCol}>
                    <Text style={styles.label}>END DATE</Text>
                    <Text style={styles.valueText}>{row.end}</Text>
                  </View>
                </View>
                <View style={styles.statsRow}>
                  <View style={[styles.statBox, styles.statApproved]}><Text style={styles.statLabel}>APPROVED</Text><Text style={[styles.statNum, { color: "#059669" }]}>{row.approved}</Text></View>
                  <View style={[styles.statBox, styles.statRejected]}><Text style={styles.statLabel}>REJECTED</Text><Text style={[styles.statNum, { color: "#e11d48" }]}>{row.rejected}</Text></View>
                  <View style={[styles.statBox, styles.statPending]}><Text style={styles.statLabel}>PENDING</Text><Text style={[styles.statNum, { color: "#d97706" }]}>{row.pending}</Text></View>
                </View>
              </View>
            ))
          )}

          {totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]} disabled={page === 1} onPress={() => setPage(p => Math.max(1, p - 1))}>
                <ChevronLeft size={20} color={page === 1 ? "#cbd5e1" : "#475569"} />
              </TouchableOpacity>
              <Text style={styles.pageText}>Page {page} of {totalPages}</Text>
              <TouchableOpacity style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]} disabled={page === totalPages} onPress={() => setPage(p => Math.min(totalPages, p + 1))}>
                <ChevronRight size={20} color={page === totalPages ? "#cbd5e1" : "#475569"} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AbstractVerification;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 22, fontWeight: "bold", color: "#1e293b", marginBottom: 16 },
  card: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", padding: 16 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 12, marginBottom: 16, gap: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: "#0f172a" },
  emptyContainer: { paddingVertical: 40, alignItems: "center" },
  emptyText: { color: "#94a3b8", fontSize: 14, fontWeight: "bold" },
  listCard: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 14, marginBottom: 12 },
  listCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  codeBadge: { backgroundColor: "#eff6ff", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  codeText: { color: "#2563eb", fontWeight: "bold", fontSize: 12 },
  eventName: { flex: 1, fontSize: 15, fontWeight: "bold", color: "#1e293b" },
  listCardBody: { flexDirection: "row", gap: 16, marginBottom: 12 },
  dateCol: { flex: 1 },
  label: { fontSize: 10, fontWeight: "bold", color: "#64748b", textTransform: "uppercase", marginBottom: 2 },
  valueText: { fontSize: 13, color: "#334155", fontWeight: "500" },
  statsRow: { flexDirection: "row", gap: 8 },
  statBox: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  statApproved: { backgroundColor: "#d1fae5" },
  statRejected: { backgroundColor: "#ffe4e6" },
  statPending: { backgroundColor: "#fef3c7" },
  statLabel: { fontSize: 9, fontWeight: "bold", color: "#64748b", marginBottom: 2 },
  statNum: { fontSize: 16, fontWeight: "900" },
  pagination: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 8 },
  pageBtn: { width: 40, height: 40, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, alignItems: "center", justifyContent: "center" },
  pageBtnDisabled: { backgroundColor: "#f8fafc" },
  pageText: { fontSize: 14, fontWeight: "600", color: "#475569" }
});
