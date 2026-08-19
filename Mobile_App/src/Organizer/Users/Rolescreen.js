import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Save, Trash2, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react-native";

const roleOptions = ["Super Admin", "Event Manager", "Organizer", "Exhibitor"];
const moduleOptions = ["Dashboard", "Event", "Program", "Approval", "Accounts", "Sponsership", "User settings", "User", "Master", "Help & Support", "Stall Management", "Report"];

const RoleWiseScreenMapping = () => {
  const [roleName, setRoleName] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [checkAll, setCheckAll] = useState(false);
  const [checkedRows, setCheckedRows] = useState([]);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showModuleDropdown, setShowModuleDropdown] = useState(false);
  const [showPageSizeDropdown, setShowPageSizeDropdown] = useState(false);

  const rows = [];
  const filteredRows = rows.filter(
    row =>
      row.moduleName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      row.screenName.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const handleCheckAll = (checked) => {
    setCheckAll(checked);
    setCheckedRows(checked ? filteredRows.map((_, i) => i) : []);
  };

  const handleRowCheck = (index) => {
    setCheckedRows(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const Dropdown = ({ label, value, options, onSelect, visible, onToggle }) => (
    <View style={s.inputGroup}>
      <Text style={s.label}>{label} <Text style={{ color: "red" }}>*</Text></Text>
      <TouchableOpacity style={s.dropdownTrigger} onPress={onToggle}>
        <Text style={value ? s.dropdownValue : s.dropdownPlaceholder}>{value || label}</Text>
        <ChevronDown size={18} color="#5b6472" />
      </TouchableOpacity>
      {visible && (
        <View style={s.dropdownList}>
          {options.map(opt => (
            <TouchableOpacity key={opt} style={s.dropdownOption} onPress={() => onSelect(opt)}>
              <Text style={s.dropdownOptionText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={s.headerRow}>
          <Text style={s.pageTitle}>Role Wise Screen Mapping</Text>
          <View style={s.headerBtns}>
            <TouchableOpacity style={s.iconBtn} onPress={() => Alert.alert("Saved!")}>
              <Save size={20} color="#5b6f8e" />
            </TouchableOpacity>
            <TouchableOpacity style={s.iconBtn} onPress={() => Alert.alert("Deleted!")}>
              <Trash2 size={20} color="#5b6f8e" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Left Panel - Role Details */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Role Details</Text>
          <Dropdown
            label="Role Name"
            value={roleName}
            options={roleOptions}
            onSelect={v => { setRoleName(v); setShowRoleDropdown(false); }}
            visible={showRoleDropdown}
            onToggle={() => setShowRoleDropdown(!showRoleDropdown)}
          />
          <Dropdown
            label="Module Name"
            value={moduleName}
            options={moduleOptions}
            onSelect={v => { setModuleName(v); setShowModuleDropdown(false); }}
            visible={showModuleDropdown}
            onToggle={() => setShowModuleDropdown(!showModuleDropdown)}
          />
        </View>

        {/* Right Panel - Table */}
        <View style={[s.card, { marginTop: 16 }]}>
          <TextInput
            style={s.searchInput}
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            placeholder="Search Keyword"
            placeholderTextColor="#9ca3af"
          />

          <ScrollView horizontal showsHorizontalScrollIndicator keyboardShouldPersistTaps="handled">
            <View style={s.table}>
              {/* Table Header */}
              <View style={s.tableHeader}>
                <TouchableOpacity
                  style={[s.checkbox, checkAll && s.checkboxChecked]}
                  onPress={() => handleCheckAll(!checkAll)}
                >
                  {checkAll && <Text style={s.checkmark}>?</Text>}
                </TouchableOpacity>
                <Text style={[s.th, { width: 160 }]}>Module Name ??</Text>
                <Text style={[s.th, { width: 160 }]}>Screen Name ??</Text>
              </View>

              {/* Body */}
              {filteredRows.length === 0 ? (
                <View style={s.emptyRow}>
                  <Text style={s.emptyText}>No Data Found</Text>
                </View>
              ) : (
                filteredRows
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((row, index) => {
                    const absIndex = (currentPage - 1) * pageSize + index;
                    return (
                      <View key={index} style={s.tableRow}>
                        <TouchableOpacity
                          style={[s.checkbox, checkedRows.includes(absIndex) && s.checkboxChecked]}
                          onPress={() => handleRowCheck(absIndex)}
                        >
                          {checkedRows.includes(absIndex) && <Text style={s.checkmark}>?</Text>}
                        </TouchableOpacity>
                        <Text style={[s.td, { width: 160 }]}>{row.moduleName}</Text>
                        <Text style={[s.td, { width: 160 }]}>{row.screenName}</Text>
                      </View>
                    );
                  })
              )}
            </View>
          </ScrollView>

          {/* Pagination */}
          {filteredRows.length > 0 && (
            <View style={s.paginationRow}>
              <Text style={s.paginationText}>
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredRows.length)} of {filteredRows.length} entries
              </Text>
              <View style={s.paginationControls}>
                <TouchableOpacity style={[s.pageBtn, currentPage === 1 && s.pageBtnDisabled]} disabled={currentPage === 1} onPress={() => setCurrentPage(p => Math.max(1, p - 1))}>
                  <ChevronLeft size={18} color={currentPage === 1 ? "#cbd5e1" : "#475569"} />
                </TouchableOpacity>
                <TouchableOpacity style={[s.pageBtn, currentPage === Math.ceil(filteredRows.length / pageSize) && s.pageBtnDisabled]} disabled={currentPage === Math.ceil(filteredRows.length / pageSize)} onPress={() => setCurrentPage(p => Math.min(Math.ceil(filteredRows.length / pageSize), p + 1))}>
                  <ChevronRight size={18} color={currentPage === Math.ceil(filteredRows.length / pageSize) ? "#cbd5e1" : "#475569"} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RoleWiseScreenMapping;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fb" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  pageTitle: { fontSize: 20, fontWeight: "600", color: "#4d6483" },
  headerBtns: { flexDirection: "row", gap: 8 },
  iconBtn: { borderWidth: 1, borderColor: "#d9e0ea", borderRadius: 8, padding: 10, backgroundColor: "#fff" },
  card: { backgroundColor: "#fff", borderRadius: 8, borderWidth: 1, borderColor: "#d9e0ea", padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: "500", color: "#3b5cff", marginBottom: 16 },
  inputGroup: { marginBottom: 16, position: "relative", zIndex: 10 },
  label: { fontSize: 15, fontWeight: "600", color: "#111827", marginBottom: 6 },
  dropdownTrigger: { height: 46, borderWidth: 1, borderColor: "#cfd7e3", borderRadius: 8, paddingHorizontal: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff" },
  dropdownValue: { fontSize: 15, color: "#374151" },
  dropdownPlaceholder: { fontSize: 15, color: "#6b7280" },
  dropdownList: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#cfd7e3", borderRadius: 8, marginTop: 2, elevation: 5, maxHeight: 200 },
  dropdownOption: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  dropdownOptionText: { fontSize: 14, color: "#374151" },
  searchInput: { height: 48, borderWidth: 1, borderColor: "#cfd7e3", borderRadius: 8, paddingHorizontal: 14, fontSize: 15, color: "#6b7280", marginBottom: 16 },
  table: { minWidth: 380 },
  tableHeader: { flexDirection: "row", backgroundColor: "#0284c7", paddingVertical: 12, paddingHorizontal: 12, alignItems: "center", gap: 8 },
  th: { color: "#fff", fontSize: 11, fontWeight: "bold", textTransform: "uppercase" },
  checkbox: { width: 24, height: 24, borderWidth: 1.5, borderColor: "#c9d1db", borderRadius: 4, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  checkboxChecked: { backgroundColor: "#4b6cb7", borderColor: "#4b6cb7" },
  checkmark: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingVertical: 10, paddingHorizontal: 12, alignItems: "center", gap: 8 },
  td: { fontSize: 14, color: "#4b5563" },
  emptyRow: { paddingVertical: 20, paddingHorizontal: 12 },
  emptyText: { fontSize: 14, color: "#4b5563" },
  paginationRow: { marginTop: 16, gap: 10 },
  paginationText: { fontSize: 13, color: "#64748b" },
  paginationControls: { flexDirection: "row", gap: 8 },
  pageBtn: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, padding: 6, backgroundColor: "#fff" },
  pageBtnDisabled: { opacity: 0.4 },
});
