import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getProgramVerificationEvents } from "@Services/api";
import { Eye, Search, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react-native";

export const ProgramVerification = () => {
  const [page, setPage] = useState("list");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await getProgramVerificationEvents();
      const formatted = (res || []).map((item) => ({
        code: item.event_code,
        name: item.event_name,
        inprocess: 0,
        approved: 0,
        rejected: 0,
        id: item.id
      }));
      setData(formatted);
    } catch (err) {
      console.error("Error fetching program verification events:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(item =>
    (item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.code || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const Pagination = () => {
    if (totalPages <= 1) return null;
    return (
      <View style={styles.pagination}>
        <TouchableOpacity style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]} disabled={currentPage === 1} onPress={() => setCurrentPage(p => Math.max(1, p - 1))}>
          <ChevronLeft size={20} color={currentPage === 1 ? "#cbd5e1" : "#475569"} />
        </TouchableOpacity>
        <Text style={styles.pageText}>Page {currentPage} of {totalPages}</Text>
        <TouchableOpacity style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]} disabled={currentPage === totalPages} onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
          <ChevronRight size={20} color={currentPage === totalPages ? "#cbd5e1" : "#475569"} />
        </TouchableOpacity>
      </View>
    );
  };

  if (page === "details") {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => setPage("list")} style={styles.backBtn}>
              <ArrowLeft size={20} color="#475569" />
            </TouchableOpacity>
            <Text style={styles.pageTitle}>Program Verification Details</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.searchBar}>
              <Search size={16} color="#94a3b8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by Program Name"
              />
            </View>
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Details coming soon...</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.pageTitle}>Program Verification</Text>

        <View style={styles.card}>
          <View style={styles.searchBar}>
            <Search size={16} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search events..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor="#94a3b8"
            />
          </View>

          {currentData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No events found matching your criteria.</Text>
            </View>
          ) : (
            currentData.map((item, index) => (
              <View key={index} style={styles.listCard}>
                <View style={styles.listCardHeader}>
                  <View style={styles.codeBadge}><Text style={styles.codeText}>{item.code}</Text></View>
                  <TouchableOpacity style={styles.eyeBtn} onPress={() => setPage("details")}>
                    <Eye size={18} color="#2563eb" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.eventName}>{item.name}</Text>
                
                <View style={styles.statsRow}>
                  <View style={[styles.statBox, styles.statPending]}><Text style={styles.statLabel}>IN-PROGRESS</Text><Text style={[styles.statNum, { color: "#d97706" }]}>{item.inprocess}</Text></View>
                  <View style={[styles.statBox, styles.statApproved]}><Text style={styles.statLabel}>APPROVED</Text><Text style={[styles.statNum, { color: "#059669" }]}>{item.approved}</Text></View>
                  <View style={[styles.statBox, styles.statRejected]}><Text style={styles.statLabel}>REJECTED</Text><Text style={[styles.statNum, { color: "#e11d48" }]}>{item.rejected}</Text></View>
                </View>
              </View>
            ))
          )}
          <Pagination />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProgramVerification;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  backBtn: { padding: 8, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10 },
  pageTitle: { fontSize: 22, fontWeight: "bold", color: "#1e293b", marginBottom: 16, flex: 1 },
  card: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", padding: 16 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 12, marginBottom: 16, gap: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: "#0f172a" },
  emptyContainer: { paddingVertical: 40, alignItems: "center" },
  emptyText: { color: "#94a3b8", fontSize: 14, fontWeight: "bold", fontStyle: "italic" },
  listCard: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 14, marginBottom: 12 },
  listCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  codeBadge: { backgroundColor: "#eff6ff", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  codeText: { color: "#2563eb", fontWeight: "bold", fontSize: 12 },
  eyeBtn: { padding: 6, backgroundColor: "#dbeafe", borderRadius: 8 },
  eventName: { fontSize: 16, fontWeight: "bold", color: "#1e293b", marginBottom: 12 },
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
