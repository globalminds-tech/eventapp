import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  StatusBar,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Save,
  Trash2,
  ChevronDown,
  ChevronLeft,
  Search,
  Plus,
  ShieldCheck,
  CheckSquare,
  Square,
  Users,
  Lock,
  X,
  CheckCircle,
} from "lucide-react-native";
import { COLORS } from "../../styles/theme";

const ROLE_PRESETS = [
  { id: "1", name: "Super Admin", count: 2, desc: "Full access to all system modules & settings" },
  { id: "2", name: "Event Production Manager", count: 5, desc: "Can manage schedules, stalls, and ticketing" },
  { id: "3", name: "Gate Scanner Staff", count: 12, desc: "Limited access to Gate Entry & QR Scanner hub" },
  { id: "4", name: "Accounts & Payout Manager", count: 3, desc: "Financial reports, payouts, and billing" },
];

const MODULE_PERMISSIONS_DEFAULT = [
  { module: "Event Creation & Wizard", view: true, create: true, edit: true, delete: false },
  { module: "Gate QR Scanner Hub", view: true, create: true, edit: true, delete: false },
  { module: "Food & Meal Vouchers", view: true, create: true, edit: true, delete: false },
  { module: "Live Sales & Gate Analytics", view: true, create: false, edit: false, delete: false },
  { module: "Master Data (Venues/Vendors)", view: true, create: true, edit: true, delete: true },
  { module: "Accounts & KYC Payouts", view: false, create: false, edit: false, delete: false },
  { module: "Staff Roles & Users", view: false, create: false, edit: false, delete: false },
];

export default function RoleWiseScreenMapping({ navigation }) {
  const [selectedRole, setSelectedRole] = useState(ROLE_PRESETS[1]);
  const [permissions, setPermissions] = useState(MODULE_PERMISSIONS_DEFAULT);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const filteredPermissions = permissions.filter((p) =>
    p.module.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const togglePermission = (index, field) => {
    setPermissions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: !updated[index][field] };
      return updated;
    });
  };

  const handleSave = () => {
    showToast(`Permissions updated for role "${selectedRole.name}"!`);
  };

  const handleCreateRole = () => {
    if (!newRoleName.trim()) {
      Alert.alert("Validation Error", "Please enter a role name.");
      return;
    }
    const created = {
      id: (ROLE_PRESETS.length + 1).toString(),
      name: newRoleName,
      count: 0,
      desc: newRoleDesc || "Custom staff role",
    };
    ROLE_PRESETS.push(created);
    setSelectedRole(created);
    setShowAddRoleModal(false);
    setNewRoleName("");
    setNewRoleDesc("");
    showToast(`Role "${created.name}" created successfully!`);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Header */}
      <View style={s.header}>
        <View style={s.flexRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation && navigation.goBack ? navigation.goBack() : null}>
            <ChevronLeft size={22} color={COLORS.dark} />
          </TouchableOpacity>
          <View style={{ marginLeft: 8 }}>
            <Text style={s.headerBadge}>STAFF SECURITY HUB</Text>
            <Text style={s.headerTitle}>Staff Roles & Permissions</Text>
          </View>
        </View>

        <TouchableOpacity style={s.saveHeaderBtn} onPress={handleSave}>
          <Save size={16} color="#ffffff" />
          <Text style={s.saveHeaderBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Toast Notification Banner */}
      {toastMessage.length > 0 && (
        <View style={s.toastBanner}>
          <CheckCircle size={18} color="#15803d" />
          <Text style={s.toastText}>{toastMessage}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Role Presets Section */}
        <View style={s.sectionHeaderRow}>
          <Text style={s.sectionTitle}>Role Presets</Text>
          <TouchableOpacity style={s.addRoleBtn} onPress={() => setShowAddRoleModal(true)}>
            <Plus size={16} color={COLORS.primary} />
            <Text style={s.addRoleBtnText}>Create Role</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.roleScroll}>
          {ROLE_PRESETS.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={[s.rolePresetCard, selectedRole.id === role.id && s.rolePresetCardActive]}
              onPress={() => setSelectedRole(role)}
            >
              <View style={s.roleCardHeader}>
                <ShieldCheck size={18} color={selectedRole.id === role.id ? COLORS.primary : COLORS.subText} />
                <View style={s.usersBadge}>
                  <Users size={12} color={COLORS.subText} />
                  <Text style={s.usersBadgeText}>{role.count}</Text>
                </View>
              </View>
              <Text style={s.rolePresetName}>{role.name}</Text>
              <Text style={s.rolePresetDesc} numberOfLines={2}>{role.desc}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Selected Role Banner */}
        <View style={s.roleBanner}>
          <View style={{ flex: 1 }}>
            <Text style={s.roleBannerTitle}>{selectedRole.name}</Text>
            <Text style={s.roleBannerSub}>Configure module-by-module permissions below</Text>
          </View>
          <Lock size={20} color={COLORS.primary} />
        </View>

        {/* Permission Matrix */}
        <View style={s.matrixCard}>
          <View style={s.matrixSearchRow}>
            <Search size={16} color={COLORS.subText} />
            <TextInput
              style={s.matrixSearchInput}
              placeholder="Search module permissions..."
              placeholderTextColor={COLORS.subText}
              value={searchKeyword}
              onChangeText={setSearchKeyword}
            />
          </View>

          <View style={s.tableHeaderRow}>
            <Text style={[s.colHeader, { flex: 2 }]}>Module Name</Text>
            <Text style={s.colHeader}>View</Text>
            <Text style={s.colHeader}>Create</Text>
            <Text style={s.colHeader}>Edit</Text>
            <Text style={s.colHeader}>Delete</Text>
          </View>

          {filteredPermissions.map((row, idx) => (
            <View key={row.module} style={s.tableDataRow}>
              <Text style={s.moduleCell} numberOfLines={1}>{row.module}</Text>

              {["view", "create", "edit", "delete"].map((field) => (
                <TouchableOpacity
                  key={field}
                  style={s.checkCell}
                  onPress={() => togglePermission(idx, field)}
                >
                  {row[field] ? (
                    <CheckSquare size={20} color={COLORS.primary} />
                  ) : (
                    <Square size={20} color="#cbd5e1" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Create Role Modal */}
      <Modal visible={showAddRoleModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Create Custom Staff Role</Text>
              <TouchableOpacity onPress={() => setShowAddRoleModal(false)}>
                <X size={20} color={COLORS.dark} />
              </TouchableOpacity>
            </View>

            <Text style={s.label}>Role Name *</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Catering Supervisor"
              value={newRoleName}
              onChangeText={setNewRoleName}
            />

            <Text style={s.label}>Role Description</Text>
            <TextInput
              style={[s.input, { height: 80 }]}
              placeholder="Brief description of staff duties..."
              multiline
              value={newRoleDesc}
              onChangeText={setNewRoleDesc}
            />

            <TouchableOpacity style={s.createSubmitBtn} onPress={handleCreateRole}>
              <Text style={s.createSubmitBtnText}>Save Role Preset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerBadge: { fontSize: 10, fontWeight: "900", color: COLORS.primary, letterSpacing: 1 },
  headerTitle: { fontSize: 16, fontWeight: "900", color: COLORS.dark },
  backBtn: { padding: 4 },
  saveHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveHeaderBtnText: { color: "#ffffff", fontSize: 13, fontWeight: "bold" },

  toastBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#bbf7d0",
  },
  toastText: { color: "#15803d", fontSize: 13, fontWeight: "bold" },

  scrollContent: { padding: 16, paddingBottom: 40 },

  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: COLORS.dark },
  addRoleBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  addRoleBtnText: { fontSize: 13, fontWeight: "700", color: COLORS.primary },

  roleScroll: { marginBottom: 16 },
  rolePresetCard: {
    width: 170,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  rolePresetCardActive: { borderColor: COLORS.primary, borderWidth: 2, backgroundColor: "#f0f9ff" },
  roleCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  usersBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#f1f5f9", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  usersBadgeText: { fontSize: 11, fontWeight: "700", color: COLORS.subText },
  rolePresetName: { fontSize: 13, fontWeight: "800", color: COLORS.dark, marginBottom: 4 },
  rolePresetDesc: { fontSize: 11, color: COLORS.subText, lineHeight: 15 },

  roleBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  roleBannerTitle: { fontSize: 16, fontWeight: "900", color: COLORS.dark },
  roleBannerSub: { fontSize: 12, color: COLORS.subText },

  matrixCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  matrixSearchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
    marginBottom: 14,
  },
  matrixSearchInput: { flex: 1, color: COLORS.dark, fontSize: 13 },

  tableHeaderRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  colHeader: { flex: 1, fontSize: 11, fontWeight: "800", color: COLORS.subText, textAlign: "center" },

  tableDataRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
    paddingHorizontal: 8,
  },
  moduleCell: { flex: 2, fontSize: 13, fontWeight: "700", color: COLORS.dark },
  checkCell: { flex: 1, alignItems: "center" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.6)", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#ffffff", borderRadius: 20, padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  modalTitle: { fontSize: 16, fontWeight: "900", color: COLORS.dark },
  label: { fontSize: 12, fontWeight: "700", color: COLORS.dark, marginTop: 10, marginBottom: 4 },
  input: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 12, height: 44, fontSize: 13, color: COLORS.dark },
  createSubmitBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, alignItems: "center", marginTop: 16 },
  createSubmitBtnText: { color: "#ffffff", fontWeight: "bold", fontSize: 14 },
  flexRow: { flexDirection: "row", alignItems: "center" },
});
