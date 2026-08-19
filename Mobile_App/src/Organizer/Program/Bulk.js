import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getEventPasses, getEventBulkDetails } from "@Services/api";
import { Eye, Download, Search, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react-native";

const BulkPassPage = () => {
  const [page, setPage] = useState("list");
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [details, setDetails] = useState([]);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [currentPageList, setCurrentPageList] = useState(1);
  const [currentPageDetail, setCurrentPageDetail] = useState(1);

  useEffect(() => {
    getEventPasses().then((data) => {
      const formatted = data.map((item) => ({
        id: item.id,
        eventCode: item.event_code,
        eventName: item.event_name,
        bulkCount: item.total_visitors || 0
      }));
      setEvents(formatted);
    }).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedEvent && page === "detail") {
      setLoading(true);
      getEventBulkDetails()
        .then(data => {
          const filtered = data.filter(item => item.event_id === selectedEvent.id);
          setDetails(filtered);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [selectedEvent, page]);

  const filtered = events.filter(e =>
    (e.eventCode || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.eventName || "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredDetails = details.filter(d =>
    (d.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.visitor_code || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPagesList = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentDataList = filtered.slice((currentPageList - 1) * perPage, currentPageList * perPage);

  const totalPagesDetail = Math.max(1, Math.ceil(filteredDetails.length / perPage));
  const currentDataDetail = filteredDetails.slice((currentPageDetail - 1) * perPage, currentPageDetail * perPage);

  useEffect(() => {
    setCurrentPageList(1);
    setCurrentPageDetail(1);
  }, [search, perPage]);

  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
      <View style={styles.pagination}>
        <TouchableOpacity style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]} disabled={currentPage === 1} onPress={() => onPageChange(Math.max(1, currentPage - 1))}>
          <ChevronLeft size={20} color={currentPage === 1 ? "#cbd5e1" : "#475569"} />
        </TouchableOpacity>
        <Text style={styles.pageText}>Page {currentPage} of {totalPages}</Text>
        <TouchableOpacity style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]} disabled={currentPage === totalPages} onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}>
          <ChevronRight size={20} color={currentPage === totalPages ? "#cbd5e1" : "#475569"} />
        </TouchableOpacity>
      </View>
    );
  };

  if (page === "detail") {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => { setPage("list"); setSearch(""); }} style={styles.backBtn}>
              <ArrowLeft size={20} color="#475569" />
            </TouchableOpacity>
            <Text style={styles.pageTitle} numberOfLines={1}>{selectedEvent?.eventName}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.searchBar}>
              <Search size={16} color="#94a3b8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search visitors..."
                value={search}
                onChangeText={setSearch}
                placeholderTextColor="#94a3b8"
              />
            </View>

            {loading ? (
              <View style={styles.emptyContainer}><ActivityIndicator size="large" color="#0284c7" /></View>
            ) : currentDataDetail.length === 0 ? (
              <View style={styles.emptyContainer}><Text style={styles.emptyText}>No Data Found.</Text></View>
            ) : (
              currentDataDetail.map((item, idx) => (
                <View key={idx} style={styles.detailCard}>
                  <View style={styles.detailCardHeader}>
                    <View style={styles.codeBadge}><Text style={styles.codeText}>{item.visitor_code}</Text></View>
                    <TouchableOpacity style={styles.downloadBtn}>
                      <Download size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.detailName}>{item.name}</Text>
                  <Text style={styles.detailText}>{item.email}</Text>
                  <Text style={styles.detailText}>{item.phone}</Text>
                  <Text style={styles.detailDate}>Registered: {item.created_at}</Text>
                </View>
              ))
            )}
            <Pagination currentPage={currentPageDetail} totalPages={totalPagesDetail} onPageChange={setCurrentPageDetail} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.pageTitle}>Bulk and Pass Generation</Text>

        <View style={styles.card}>
          <View style={styles.searchBar}>
            <Search size={16} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search events..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#94a3b8"
            />
          </View>

          {currentDataList.length === 0 ? (
            <View style={styles.emptyContainer}><Text style={styles.emptyText}>No events found.</Text></View>
          ) : (
            currentDataList.map((event, index) => (
              <View key={index} style={styles.listCard}>
                <View style={styles.listCardHeader}>
                  <View style={styles.codeBadge}><Text style={styles.codeText}>{event.eventCode}</Text></View>
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => { setSelectedEvent(event); setPage("detail"); setSearch(""); }}
                  >
                    <Eye size={18} color="#2563eb" />
                    <Text style={styles.eyeBtnText}>View details</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.eventName}>{event.eventName}</Text>
                <Text style={styles.bulkCount}>Bulk Registrations: <Text style={styles.bulkCountNum}>{event.bulkCount}</Text></Text>
              </View>
            ))
          )}
          <Pagination currentPage={currentPageList} totalPages={totalPagesList} onPageChange={setCurrentPageList} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BulkPassPage;

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
  emptyText: { color: "#94a3b8", fontSize: 14, fontWeight: "bold" },
  listCard: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 14, marginBottom: 12 },
  listCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  codeBadge: { backgroundColor: "#eff6ff", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  codeText: { color: "#2563eb", fontWeight: "bold", fontSize: 12 },
  eyeBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#dbeafe", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  eyeBtnText: { color: "#2563eb", fontWeight: "bold", fontSize: 12 },
  eventName: { fontSize: 16, fontWeight: "bold", color: "#1e293b", marginBottom: 8 },
  bulkCount: { fontSize: 13, color: "#64748b" },
  bulkCountNum: { fontWeight: "bold", color: "#0f172a" },
  detailCard: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 14, marginBottom: 12 },
  detailCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  downloadBtn: { backgroundColor: "#0284c7", padding: 8, borderRadius: 8 },
  detailName: { fontSize: 16, fontWeight: "bold", color: "#1e293b", marginBottom: 4 },
  detailText: { fontSize: 13, color: "#475569", marginBottom: 2 },
  detailDate: { fontSize: 12, color: "#94a3b8", marginTop: 8 },
  pagination: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 8 },
  pageBtn: { width: 40, height: 40, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, alignItems: "center", justifyContent: "center" },
  pageBtnDisabled: { backgroundColor: "#f8fafc" },
  pageText: { fontSize: 14, fontWeight: "600", color: "#475569" }
});
