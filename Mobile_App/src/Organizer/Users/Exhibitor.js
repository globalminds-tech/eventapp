import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, ListFilter, RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react-native";
import { getExhibitorBookings } from "@Services/api";

const BADGE_COLORS = {
  Active:    { bg: "#ecfdf5", text: "#065f46" },
  Inactive:  { bg: "#f1f5f9", text: "#475569" },
  Pending:   { bg: "#fffbeb", text: "#92400e" },
  Cancelled: { bg: "#fef2f2", text: "#dc2626" },
  Approved:  { bg: "#eff6ff", text: "#1d4ed8" },
  Rejected:  { bg: "#fff1f2", text: "#be123c" },
};

const Badge = ({ value }) => {
  const display = value && value !== "" ? value.charAt(0).toUpperCase() + value.slice(1) : "-";
  const colors = BADGE_COLORS[display] ?? { bg: "#f3f4f6", text: "#6b7280" };
  return (
    <View style={[badgeStyle.badge, { backgroundColor: colors.bg }]}>
      <Text style={[badgeStyle.badgeText, { color: colors.text }]}>{display}</Text>
    </View>
  );
};

const badgeStyle = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: "flex-start" },
  badgeText: { fontSize: 10, fontWeight: "bold", textTransform: "uppercase" },
});

const COLUMNS = [
  { key: "company_name", label: "Company Name" },
  { key: "name", label: "Exhibitor Name" },
  { key: "mobile", label: "Contact No" },
  { key: "email", label: "Email" },
  { key: "stall_area", label: "Stall Area" },
  { key: "products", label: "Products" },
  { key: "address", label: "Address" },
  { key: "status", label: "Status", badge: true },
];

const POLL_MS = 10000;

export default function ExhibitorTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const timerRef = useRef(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    try {
      const response = await getExhibitorBookings();
      setRows(Array.isArray(response.data) ? response.data : []);
      setError("");
    } catch (e) {
      setError("Failed to sync bookings. Please check your connection.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    timerRef.current = setInterval(() => fetchData(true), POLL_MS);
    return () => clearInterval(timerRef.current);
  }, [fetchData]);

  const q = search.toLowerCase();
  const filtered = rows.filter(r => COLUMNS.some(c => String(r[c.key] ?? "").toLowerCase().includes(q)));
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const sliced = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const fromEntry = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const toEntry = Math.min(safePage * pageSize, total);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={s.headerRow}>
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={s.pageTitle}>Exhibitor Stall Bookings</Text>
              {isRefreshing && <ActivityIndicator size="small" color="#3b82f6" />}
            </View>
            <Text style={s.pageSubtitle}>Manage and monitor live exhibitor registration data</Text>
          </View>
        </View>

        <View style={s.card}>
          {/* Search & Stats */}
          <View style={s.searchRow}>
            <View style={s.searchBar}>
              <Search size={16} color="#9ca3af" />
              <TextInput
                style={s.searchInput}
                value={search}
                onChangeText={v => { setSearch(v); setPage(1); }}
                placeholder="Search by name, company, or products..."
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View style={s.statsRow}>
              <View style={s.statBox}>
                <Text style={s.statLabel}>TOTAL BOOKINGS</Text>
                <Text style={s.statNum}>{total}</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statBox}>
                <Text style={s.statLabel}>PAGE</Text>
                <Text style={s.statNum}>{safePage} / {totalPages}</Text>
              </View>
            </View>
          </View>

          {/* Error */}
          {error ? (
            <View style={s.errorBox}>
              <AlertCircle size={18} color="#dc2626" />
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Table */}
          <ScrollView horizontal showsHorizontalScrollIndicator keyboardShouldPersistTaps="handled">
            <View style={s.table}>
              {/* Table Header */}
              <View style={s.tableHeaderRow}>
                {COLUMNS.map(col => (
                  <Text key={col.key} style={s.th}>{col.label}</Text>
                ))}
              </View>

              {/* Table Body */}
              {loading ? (
                <View style={s.centerBox}>
                  <ActivityIndicator size="large" color="#2563eb" />
                  <Text style={s.syncText}>SYNCING RECORDS...</Text>
                </View>
              ) : sliced.length === 0 ? (
                <View style={s.centerBox}>
                  <ListFilter size={40} color="#e2e8f0" />
                  <Text style={s.noResultTitle}>No Results Found</Text>
                  <Text style={s.noResultSub}>Try adjusting your search filters</Text>
                </View>
              ) : (
                sliced.map((row, i) => (
                  <View key={row.id ?? i} style={s.tableRow}>
                    {COLUMNS.map(col => (
                      <View key={col.key} style={s.td}>
                        {col.badge ? (
                          <Badge value={row[col.key]} />
                        ) : (
                          <Text style={[s.tdText, col.key === "company_name" && s.tdBold]}>
                            {row[col.key] && row[col.key] !== "" ? row[col.key] : "-"}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                ))
              )}
            </View>
          </ScrollView>

          {/* Pagination Controls */}
          <View style={s.paginationRow}>
            <Text style={s.paginationText}>
              Showing {fromEntry} to {toEntry} of {total} entries
            </Text>
            <View style={s.paginationControls}>
              <Text style={s.recordsLabel}>Records per page:</Text>
              <View style={s.dropdownWrapper}>
                <TouchableOpacity style={s.dropdownTrigger} onPress={() => setShowDropdown(!showDropdown)}>
                  <Text style={s.dropdownValue}>{pageSize}</Text>
                </TouchableOpacity>
                {showDropdown && (
                  <View style={s.dropdownList}>
                    {[10, 25, 50, 100].map(v => (
                      <TouchableOpacity key={v} style={s.dropdownOption} onPress={() => { setPageSize(v); setPage(1); setShowDropdown(false); }}>
                        <Text style={s.dropdownOptionText}>{v}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              {totalPages > 1 && (
                <View style={s.pageBtnsRow}>
                  <TouchableOpacity style={[s.pageBtn, safePage === 1 && s.pageBtnDisabled]} disabled={safePage === 1} onPress={() => setPage(p => Math.max(1, p - 1))}>
                    <ChevronLeft size={18} color={safePage === 1 ? "#cbd5e1" : "#475569"} />
                  </TouchableOpacity>
                  {[...Array(totalPages)].map((_, i) => (
                    <TouchableOpacity key={i} style={[s.pageNumBtn, safePage === i + 1 && s.pageNumBtnActive]} onPress={() => setPage(i + 1)}>
                      <Text style={[s.pageNumText, safePage === i + 1 && s.pageNumTextActive]}>{i + 1}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity style={[s.pageBtn, safePage === totalPages && s.pageBtnDisabled]} disabled={safePage === totalPages} onPress={() => setPage(p => Math.min(totalPages, p + 1))}>
                    <ChevronRight size={18} color={safePage === totalPages ? "#cbd5e1" : "#475569"} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  headerRow: { marginBottom: 16 },
  pageTitle: { fontSize: 24, fontWeight: "bold", color: "#1f2937" },
  pageSubtitle: { fontSize: 13, color: "#64748b", marginTop: 4 },
  card: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", padding: 16 },
  searchRow: { marginBottom: 16, gap: 12 },
  searchBar: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, paddingHorizontal: 12, gap: 8 },
  searchInput: { flex: 1, paddingVertical: 8, fontSize: 14, color: "#111827" },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 4 },
  statBox: { alignItems: "center" },
  statLabel: { fontSize: 10, fontWeight: "bold", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8 },
  statNum: { fontSize: 16, fontWeight: "900", color: "#1e293b" },
  statDivider: { width: 1, height: 30, backgroundColor: "#f1f5f9" },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fca5a5", borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { fontSize: 13, fontWeight: "600", color: "#dc2626", flex: 1 },
  table: { minWidth: 900 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: "#0284c7", paddingVertical: 12, paddingHorizontal: 8 },
  th: { color: "#fff", fontSize: 11, fontWeight: "bold", textTransform: "uppercase", width: 130, paddingHorizontal: 4 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingVertical: 10, paddingHorizontal: 8 },
  td: { width: 130, paddingHorizontal: 4, justifyContent: "center" },
  tdText: { fontSize: 13, color: "#475569" },
  tdBold: { fontWeight: "bold", color: "#1e293b" },
  centerBox: { paddingVertical: 48, alignItems: "center", gap: 10 },
  syncText: { fontSize: 11, fontWeight: "bold", color: "#94a3b8", letterSpacing: 1 },
  noResultTitle: { fontSize: 16, fontWeight: "bold", color: "#94a3b8" },
  noResultSub: { fontSize: 12, color: "#94a3b8" },
  paginationRow: { marginTop: 16, gap: 10 },
  paginationText: { fontSize: 13, color: "#64748b" },
  paginationControls: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  recordsLabel: { fontSize: 13, color: "#64748b" },
  dropdownWrapper: { position: "relative", zIndex: 100 },
  dropdownTrigger: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 },
  dropdownValue: { fontSize: 13, color: "#475569" },
  dropdownList: { position: "absolute", top: "100%", left: 0, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 6, elevation: 10, minWidth: 60 },
  dropdownOption: { paddingHorizontal: 12, paddingVertical: 8 },
  dropdownOptionText: { fontSize: 13, color: "#475569" },
  pageBtnsRow: { flexDirection: "row", gap: 4, flexWrap: "wrap" },
  pageBtn: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, padding: 6, backgroundColor: "#fff" },
  pageBtnDisabled: { opacity: 0.4 },
  pageNumBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", alignItems: "center", justifyContent: "center" },
  pageNumBtnActive: { backgroundColor: "#0284c7", borderColor: "#0284c7" },
  pageNumText: { fontSize: 13, fontWeight: "bold", color: "#475569" },
  pageNumTextActive: { color: "#fff" },
});
