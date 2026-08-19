import React, { useState, useEffect } from "react";
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, FlatList, Platform 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye, ChevronLeft, ChevronRight, Search, X, Calendar as CalendarIcon } from "lucide-react-native";

export const Receipt = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]); // Placeholder for actual data
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Pagination Logic
  const filteredData = data.filter(item =>
    (item.invoiceNo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.billingName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const FilterInput = ({ label, placeholder, icon: Icon, isDate }) => (
    <View style={styles.filterBox}>
      <Text style={styles.filterLabel}>{label} <Text style={styles.asterisk}>*</Text></Text>
      <View style={styles.inputWrapper}>
        <TextInput 
          style={styles.filterInput}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          editable={!isDate}
        />
        {Icon && <Icon size={16} color="#94a3b8" style={styles.inputIcon} />}
      </View>
    </View>
  );

  const ReceiptCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.invoiceNo}>{item.invoiceNo}</Text>
        <View style={[styles.statusBadge, item.status === 'Paid' ? styles.statusPaid : styles.statusPending]}>
          <Text style={[styles.statusText, item.status === 'Paid' ? styles.statusTextPaid : styles.statusTextPending]}>
            {item.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <Text style={styles.billingName}>{item.billingName}</Text>
        <Text style={styles.subText}>{item.eventName}</Text>
        
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{item.date}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.amountValue}>₹{item.amount}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.viewBtn}>
          <Eye size={16} color="#2563eb" />
          <Text style={styles.viewBtnText}>View Receipt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Receipt Management</Text>
        </View>

        {/* Filters Section */}
        <View style={styles.filtersContainer}>
          <FilterInput label="From Date" placeholder="YYYY-MM-DD" icon={CalendarIcon} isDate />
          <FilterInput label="To Date" placeholder="YYYY-MM-DD" icon={CalendarIcon} isDate />
          
          <TouchableOpacity style={styles.searchBtn}>
            <Search size={18} color="#fff" />
            <Text style={styles.searchBtnText}>Search Receipts</Text>
          </TouchableOpacity>
        </View>

        {/* List Section */}
        <View style={styles.listContainer}>
          <View style={styles.searchBarContainer}>
            <Search size={18} color="#94a3b8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchBar}
              placeholder="Search by Invoice or Name..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor="#94a3b8"
            />
            {searchTerm !== "" && (
              <TouchableOpacity onPress={() => setSearchTerm("")} style={styles.clearSearchBtn}>
                <X size={16} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          {currentData.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Eye size={32} color="#cbd5e1" />
              </View>
              <Text style={styles.emptyStateText}>No receipts found matching your criteria</Text>
            </View>
          ) : (
            currentData.map((item, index) => <ReceiptCard key={index} item={item} />)
          )}

          {/* Pagination */}
          {filteredData.length > 0 && totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity 
                style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
                disabled={currentPage === 1}
                onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={20} color={currentPage === 1 ? "#cbd5e1" : "#475569"} />
              </TouchableOpacity>
              <Text style={styles.pageText}>Page {currentPage} of {totalPages}</Text>
              <TouchableOpacity 
                style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
                disabled={currentPage === totalPages}
                onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                <ChevronRight size={20} color={currentPage === totalPages ? "#cbd5e1" : "#475569"} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 20 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  
  filtersContainer: { backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  filterBox: { marginBottom: 12 },
  filterLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4, marginLeft: 4 },
  asterisk: { color: '#ef4444' },
  inputWrapper: { relative: true, flexDirection: 'row', alignItems: 'center' },
  filterInput: { flex: 1, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#334155', fontWeight: '500' },
  inputIcon: { position: 'absolute', right: 12 },
  
  searchBtn: { backgroundColor: '#2563eb', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, marginTop: 8 },
  searchBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginLeft: 8 },

  listContainer: { backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 12, marginBottom: 16 },
  searchIcon: { marginRight: 8 },
  searchBar: { flex: 1, paddingVertical: 10, fontSize: 14, color: '#334155' },
  clearSearchBtn: { padding: 4 },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyStateText: { color: '#94a3b8', fontWeight: 'bold', fontStyle: 'italic', fontSize: 12, textAlign: 'center' },

  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: '#f8fafc', borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  invoiceNo: { fontSize: 12, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', color: '#475569' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusPaid: { backgroundColor: '#dcfce7' },
  statusPending: { backgroundColor: '#fef3c7' },
  statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  statusTextPaid: { color: '#059669' },
  statusTextPending: { color: '#d97706' },
  
  cardBody: { padding: 12 },
  billingName: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  subText: { fontSize: 12, color: '#64748b', marginTop: 2, marginBottom: 12 },
  detailsGrid: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: 10, borderRadius: 8 },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '600', marginBottom: 2 },
  detailValue: { fontSize: 12, fontWeight: '600', color: '#475569' },
  amountValue: { fontSize: 14, fontWeight: 'bold', color: '#2563eb' },

  cardFooter: { padding: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9', alignItems: 'center' },
  viewBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  viewBtnText: { color: '#2563eb', fontWeight: 'bold', fontSize: 12, marginLeft: 6 },

  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16, gap: 16 },
  pageBtn: { width: 40, height: 40, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  pageBtnDisabled: { backgroundColor: '#f8fafc' },
  pageText: { fontSize: 14, fontWeight: '600', color: '#475569' }
});

export default Receipt;
