import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Save, Trash2, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react-native";

const roles = ["Event Manager", "Super Admin"];
const users = ["John Smith", "Jane Doe", "Alice Johnson", "Bob Williams", "Carol White"];
const modules = ["Dashboard", "Event", "Program", "Approval", "Accounts", "Sponsership", "User settings", "User", "Master", "Help & Support", "Stall Management", "Report"];
const permissions = ["create", "update", "delete", "view", "print", "approval"];
const rows = [];

export default function UserWiseScreenMapping() {
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [headerChecks, setHeaderChecks] = useState({
    create: false, update: false, delete: false, view: false, print: false, approval: false,
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showModuleDropdown, setShowModuleDropdown] = useState(false);

  const totalPages = Math.ceil(rows.length / pageSize) || 1;

  const toggleHeader = (perm) => {
    setHeaderChecks(prev => ({ ...prev, [perm]: !prev[perm] }));
  };

  const SelectField = ({ label, value, options, visible, onToggle, onSelect }) => (
    <View style={s.inputGroup}>
      <Text style={s.label}>{label}</Text>
      <TouchableOpacity style={s.dropdownTrigger} onPress={onToggle}>
        <Text style={value ? s.dropdownValue : s.dropdownPlaceholder}>{value || label}</Text>
        <ChevronDown size={16} color="#9ca3af" />
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
          <Text style={s.pageTitle}>User Wise Screen Mapping</Text>
          <View style={s.headerBtns}>
            <TouchableOpacity style={s.iconBtn} onPress={() => Alert.alert("Saved!")}>
              <Save size={18} color="#4b5563" />
            </TouchableOpacity>
            <TouchableOpacity style={s.iconBtn} onPress={() => Alert.alert("Deleted!")}>
              <Trash2 size={18} color="#4b5563" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Left Panel - User Details */}
        <View style={s.card}>
          <Text style={s.cardTitle}>User Details</Text>
          <SelectField
            label="Role Name"
            value={selectedRole}
            options={roles}
            visible={showRoleDropdown}
            onToggle={() => setShowRoleDropdown(!showRoleDropdown)}
            onSelect={v => { setSelectedRole(v); setShowRoleDropdown(false); }}
          />
          <SelectField
            label="User Name"
            value={selectedUser}
            options={users}
            visible={showUserDropdown}
            onToggle={() => setShowUserDropdown(!showUserDropdown)}
            onSelect={v => { setSelectedUser(v); setShowUserDropdown(false); }}
          />
          <SelectField
            label="Module Name"
            value={selectedModule}
            options={modules}
            visible={showModuleDropdown}
            onToggle={() => setShowModuleDropdown(!showModuleDropdown)}
            onSelect={v => { setSelectedModule(v); setShowModuleDropdown(false); }}
          />
        </View>

        {/* Right Panel - Permissions Table */}
        <View style={[s.card, { marginTop: 16 }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator keyboardShouldPersistTaps="handled">
            <View style={s.table}>
              {/* Table Header */}
              <View style={s.tableHeader}>
                <Text style={[s.th, { width: 120 }]}>Module</Text>
                <Text style={[s.th, { width: 120 }]}>Screen</Text>
                {permissions.map(perm => (
                  <View key={perm} style={[s.thPermCell, { width: 80 }]}>
                    <Text style={s.thPermLabel}>{perm.charAt(0).toUpperCase() + perm.slice(1)}</Text>
                    <TouchableOpacity
                      style={[s.checkbox, headerChecks[perm] && s.checkboxChecked]}
                      onPress={() => toggleHeader(perm)}
                    >
                      {headerChecks[perm] && <Text style={s.checkmark}>?</Text>}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Empty Body */}
              <View style={s.emptyRow}>
                <Text style={s.emptyText}>No Data Found.</Text>
              </View>
            </View>
          </ScrollView>

          {/* Pagination */}
          <View style={s.paginationRow}>
            <Text style={s.paginationText}>
              Showing {rows.length === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, rows.length)} of {rows.length} entries
            </Text>
            <View style={s.paginationControls}>
              {totalPages > 1 && (
                <>
                  <TouchableOpacity style={[s.pageBtn, page === 1 && s.pageBtnDisabled]} disabled={page === 1} onPress={() => setPage(p => Math.max(1, p - 1))}>
                    <ChevronLeft size={18} color={page === 1 ? "#cbd5e1" : "#475569"} />
                  </TouchableOpacity>
                  {[...Array(totalPages)].map((_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[s.pageNumBtn, page === i + 1 && s.pageNumBtnActive]}
                      onPress={() => setPage(i + 1)}
                    >
                      <Text style={[s.pageNumText, page === i + 1 && s.pageNumTextActive]}>{i + 1}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity style={[s.pageBtn, page === totalPages && s.pageBtnDisabled]} disabled={page === totalPages} onPress={() => setPage(p => Math.min(totalPages, p + 1))}>
                    <ChevronRight size={18} color={page === totalPages ? "#cbd5e1" : "#475569"} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  pageTitle: { fontSize: 20, fontWeight: "600", color: "#1f2937" },
  headerBtns: { flexDirection: "row", gap: 8 },
  iconBtn: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 6, padding: 8, backgroundColor: "#fff" },
  card: { backgroundColor: "#fff", borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb", padding: 16 },
  cardTitle: { fontSize: 17, fontWeight: "600", color: "#2563eb", marginBottom: 16 },
  inputGroup: { marginBottom: 14, position: "relative", zIndex: 10 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
  dropdownTrigger: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff" },
  dropdownValue: { fontSize: 14, color: "#374151" },
  dropdownPlaceholder: { fontSize: 14, color: "#6b7280" },
  dropdownList: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#d1d5db", borderRadius: 6, marginTop: 2, elevation: 5, maxHeight: 180 },
  dropdownOption: { paddingHorizontal: 14, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  dropdownOptionText: { fontSize: 13, color: "#374151" },
  table: { minWidth: 680 },
  tableHeader: { flexDirection: "row", backgroundColor: "#0284c7", paddingVertical: 12, paddingHorizontal: 8, alignItems: "center" },
  th: { color: "#fff", fontSize: 11, fontWeight: "bold", textTransform: "uppercase" },
  thPermCell: { alignItems: "center", gap: 4 },
  thPermLabel: { color: "#fff", fontSize: 10, fontWeight: "bold", textTransform: "capitalize" },
  checkbox: { width: 20, height: 20, borderWidth: 1.5, borderColor: "#c9d1db", borderRadius: 3, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  checkboxChecked: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  checkmark: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  emptyRow: { paddingVertical: 24, alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  emptyText: { fontSize: 14, color: "#6b7280" },
  paginationRow: { marginTop: 16, gap: 10 },
  paginationText: { fontSize: 13, color: "#64748b" },
  paginationControls: { flexDirection: "row", gap: 4, flexWrap: "wrap" },
  pageBtn: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, padding: 6, backgroundColor: "#fff" },
  pageBtnDisabled: { opacity: 0.4 },
  pageNumBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center", justifyContent: "center" },
  pageNumBtnActive: { backgroundColor: "#0284c7", borderColor: "#0284c7" },
  pageNumText: { fontSize: 13, fontWeight: "bold", color: "#475569" },
  pageNumTextActive: { color: "#fff" },
});
