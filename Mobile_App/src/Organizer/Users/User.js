import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye, Pencil, Trash2, Plus, Save, Search, ChevronDown, ChevronLeft, ChevronRight, Upload } from "lucide-react-native";

const ROLE_OPTIONS = ["Super Admin", "Event Manager"];
const STATUS_OPTIONS = ["Active", "Inactive"];

const initialUsers = [
  { id: 1, userName: "arunkumar", password: "Arun@123", roleName: "Super Admin", mailId: "arunak16112000@gmail.com", contactNumber: "9361826137", status: "Active", createdBy: "Sakthi", createdOn: "10/03/2026", modifiedBy: "Sakthi", modifiedOn: "10/03/2026", profileImage: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=200&q=80" },
  { id: 2, userName: "Parthi", password: "Parthi@123", roleName: "Super Admin", mailId: "jbparthi07@gmail.com", contactNumber: "9677440785", status: "Active", createdBy: "Sakthi", createdOn: "08/03/2026", modifiedBy: "Sakthi", modifiedOn: "08/03/2026", profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
  { id: 3, userName: "Vikas", password: "Vikas@123", roleName: "Event Manager", mailId: "vikas19052004@gmail.com", contactNumber: "8531938400", status: "Active", createdBy: "Sakthi", createdOn: "08/03/2026", modifiedBy: "Sakthi", modifiedOn: "08/03/2026", profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80" },
  { id: 4, userName: "Sakthi", password: "Sakthi@123", roleName: "Super Admin", mailId: "sakthivelganesan@gmail.com", contactNumber: "8056897132", status: "Active", createdBy: "Leiten Technologies Pvt Ltd", createdOn: "03/03/2025", modifiedBy: "Sakthi", modifiedOn: "07/03/2026", profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" },
];

const emptyForm = { id: null, userName: "", password: "", roleName: "", mailId: "", contactNumber: "", status: "Active", createdBy: "Sakthi", createdOn: "", modifiedBy: "Sakthi", modifiedOn: "", profileImage: "" };

const todayString = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
};

export default function User() {
  const [page, setPage] = useState("list");
  const [users, setUsers] = useState(initialUsers);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [viewUser, setViewUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPageSizeDropdown, setShowPageSizeDropdown] = useState(false);

  const filteredUsers = useMemo(() => {
    const kw = searchKeyword.trim().toLowerCase();
    if (!kw) return users;
    return users.filter(u => [u.userName, u.roleName, u.contactNumber, u.mailId, u.status, u.createdBy, u.modifiedBy].join(" ").toLowerCase().includes(kw));
  }, [users, searchKeyword]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const resetForm = () => { setFormData({ ...emptyForm }); setErrors({}); setShowPassword(false); };

  const handleAdd = () => { resetForm(); setPage("form"); };
  const handleEdit = (user) => { setFormData({ ...user }); setErrors({}); setPage("form"); };
  const handleView = (user) => { setViewUser(user); setPage("view"); };

  const handleDelete = (id) => {
    Alert.alert("Confirm", "Are you sure you want to delete this user?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => {
        const updated = users.filter(u => u.id !== id);
        setUsers(updated);
        if ((currentPage - 1) * itemsPerPage >= updated.length && currentPage > 1) setCurrentPage(p => p - 1);
      }}
    ]);
  };

  const validate = () => {
    const e = {};
    if (!formData.userName.trim()) e.userName = "User Name is required";
    if (!formData.password.trim()) e.password = "Password is required";
    if (!formData.roleName) e.roleName = "Role Name is required";
    if (!formData.mailId.trim()) e.mailId = "Mail ID is required";
    else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(formData.mailId.trim())) e.mailId = "Mail ID must end with @gmail.com";
    if (!formData.contactNumber.trim()) e.contactNumber = "Contact Number is required";
    else if (!/^\d{10}$/.test(formData.contactNumber.trim())) e.contactNumber = "Must be exactly 10 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const today = todayString();
    if (formData.id) {
      setUsers(prev => prev.map(u => u.id === formData.id ? { ...formData, modifiedBy: "Sakthi", modifiedOn: today } : u));
    } else {
      setUsers(prev => [{ ...formData, id: Date.now(), createdBy: "Sakthi", createdOn: today, modifiedBy: "Sakthi", modifiedOn: today }, ...prev]);
    }
    resetForm(); setPage("list"); setCurrentPage(1);
  };

  const handleInput = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const Field = ({ label, required, children, error }) => (
    <View style={s.fieldGroup}>
      <Text style={s.fieldLabel}>{label}{required && <Text style={{ color: "red" }}> *</Text>}</Text>
      {children}
      {error ? <Text style={s.errorText}>{error}</Text> : null}
    </View>
  );

  // LIST PAGE
  if (page === "list") return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <Text style={s.pageTitle}>User</Text>
        <TouchableOpacity style={s.iconBtn} onPress={handleAdd}><Plus size={22} color="#4a6390" /></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
          <View style={s.searchRow}>
            <TextInput style={s.searchInput} value={searchKeyword} onChangeText={v => { setSearchKeyword(v); setCurrentPage(1); }} placeholder="Search Keyword" placeholderTextColor="#7c8ba7" />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity style={s.iconBtn}><Trash2 size={16} color="#4a6390" /></TouchableOpacity>
              <TouchableOpacity style={s.iconBtn}><Save size={16} color="#4a6390" /></TouchableOpacity>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator keyboardShouldPersistTaps="handled">
            <View style={s.table}>
              <View style={s.tableHeader}>
                {["Action","User Name ?","Role ?","Contact No ?","Email ?","Status ?","Created By","Created On","Modified By","Modified On"].map(h => (
                  <Text key={h} style={[s.th, { width: h === "Action" ? 100 : 130 }]}>{h}</Text>
                ))}
              </View>
              {paginatedUsers.length > 0 ? paginatedUsers.map(user => (
                <View key={user.id} style={s.tableRow}>
                  <View style={[s.td, { width: 100, flexDirection: "row", gap: 4 }]}>
                    <TouchableOpacity style={s.actionBtn} onPress={() => handleView(user)}><Eye size={14} color="#5d7298" /></TouchableOpacity>
                    <TouchableOpacity style={s.actionBtn} onPress={() => handleEdit(user)}><Pencil size={14} color="#5d7298" /></TouchableOpacity>
                    <TouchableOpacity style={s.actionBtn} onPress={() => handleDelete(user.id)}><Trash2 size={14} color="#5d7298" /></TouchableOpacity>
                  </View>
                  <Text style={[s.td, s.tdBold, { width: 130 }]}>{user.userName}</Text>
                  <Text style={[s.td, { width: 130 }]}>{user.roleName}</Text>
                  <Text style={[s.td, { width: 130 }]}>{user.contactNumber}</Text>
                  <Text style={[s.td, { width: 130 }]}>{user.mailId}</Text>
                  <Text style={[s.td, { width: 130 }]}>{user.status}</Text>
                  <Text style={[s.td, { width: 130 }]}>{user.createdBy}</Text>
                  <Text style={[s.td, { width: 130 }]}>{user.createdOn}</Text>
                  <Text style={[s.td, { width: 130 }]}>{user.modifiedBy}</Text>
                  <Text style={[s.td, { width: 130 }]}>{user.modifiedOn}</Text>
                </View>
              )) : (
                <View style={s.emptyRow}><Text style={s.emptyText}>No users found.</Text></View>
              )}
            </View>
          </ScrollView>

          {filteredUsers.length > 0 && (
            <View style={s.paginationRow}>
              <Text style={s.paginationText}>Showing {((currentPage-1)*itemsPerPage)+1} to {Math.min(currentPage*itemsPerPage, filteredUsers.length)} of {filteredUsers.length} entries</Text>
              {totalPages > 1 && (
                <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
                  <TouchableOpacity style={[s.pageBtn, currentPage===1 && s.pageBtnDisabled]} disabled={currentPage===1} onPress={() => setCurrentPage(p => Math.max(1,p-1))}>
                    <ChevronLeft size={16} color={currentPage===1?"#cbd5e1":"#475569"} />
                  </TouchableOpacity>
                  {[...Array(totalPages)].map((_,i) => (
                    <TouchableOpacity key={i} style={[s.pageNumBtn, currentPage===i+1 && s.pageNumBtnActive]} onPress={() => setCurrentPage(i+1)}>
                      <Text style={[s.pageNumText, currentPage===i+1 && s.pageNumTextActive]}>{i+1}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity style={[s.pageBtn, currentPage===totalPages && s.pageBtnDisabled]} disabled={currentPage===totalPages} onPress={() => setCurrentPage(p => Math.min(totalPages,p+1))}>
                    <ChevronRight size={16} color={currentPage===totalPages?"#cbd5e1":"#475569"} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  // FORM PAGE
  if (page === "form") return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <Text style={s.pageTitle}>User</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity style={s.iconBtn} onPress={handleSave}><Save size={20} color="#4a6390" /></TouchableOpacity>
          <TouchableOpacity style={s.iconBtn} onPress={() => { resetForm(); setPage("list"); }}><Trash2 size={20} color="#4a6390" /></TouchableOpacity>
          <TouchableOpacity style={s.iconBtn} onPress={() => formData.id && handleView(formData)}><Search size={20} color="#4a6390" /></TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Profile Upload */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Profile Upload</Text>
          <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
            <TouchableOpacity style={s.uploadBox} onPress={() => Alert.alert("Upload", "File picker placeholder — integrate react-native-document-picker in production.")}>
              <Upload size={36} color="#374151" />
              <Text style={s.uploadLabel}>Profile{"\n"}Upload</Text>
            </TouchableOpacity>
            <View style={s.imagePreview}>
              {formData.profileImage ? (
                <Image source={{ uri: formData.profileImage }} style={s.previewImage} />
              ) : (
                <Text style={s.noImage}>No Image</Text>
              )}
            </View>
          </View>
          <Text style={s.uploadHint}>Supported Files: JPG, PNG, WEBP</Text>
          {errors.profileImage ? <Text style={s.errorText}>{errors.profileImage}</Text> : null}
        </View>

        {/* User Information */}
        <View style={[s.card, { marginTop: 16 }]}>
          <Text style={s.cardTitle}>User Information</Text>

          <Field label="User Name" required error={errors.userName}>
            <TextInput style={[s.input, errors.userName && s.inputError]} value={formData.userName} onChangeText={v => handleInput("userName", v)} />
          </Field>

          <Field label="Password" required error={errors.password}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput style={[s.input, { flex: 1 }, errors.password && s.inputError]} value={formData.password} onChangeText={v => handleInput("password", v)} secureTextEntry={!showPassword} />
              <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPassword(p => !p)}>
                <Eye size={18} color="#6f7d96" />
              </TouchableOpacity>
            </View>
          </Field>

          <Field label="Role Name" required error={errors.roleName}>
            <TouchableOpacity style={[s.dropdownTrigger, errors.roleName && s.inputError]} onPress={() => setShowRoleDropdown(!showRoleDropdown)}>
              <Text style={formData.roleName ? s.dropdownValue : s.dropdownPlaceholder}>{formData.roleName || "Select Role Name"}</Text>
              <ChevronDown size={16} color="#6f7d96" />
            </TouchableOpacity>
            {showRoleDropdown && (
              <View style={s.dropdownList}>
                {ROLE_OPTIONS.map(r => (
                  <TouchableOpacity key={r} style={s.dropdownOption} onPress={() => { handleInput("roleName", r); setShowRoleDropdown(false); }}>
                    <Text style={s.dropdownOptionText}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Field>

          <Field label="Mail ID" required error={errors.mailId}>
            <TextInput style={[s.input, errors.mailId && s.inputError]} value={formData.mailId} onChangeText={v => handleInput("mailId", v)} keyboardType="email-address" placeholder="Enter Mail ID" placeholderTextColor="#7c8ba7" />
          </Field>

          <Field label="Contact Number" required error={errors.contactNumber}>
            <TextInput style={[s.input, errors.contactNumber && s.inputError]} value={formData.contactNumber} onChangeText={v => handleInput("contactNumber", v.replace(/\D/g, ""))} keyboardType="number-pad" maxLength={10} placeholder="Enter Contact Number" placeholderTextColor="#7c8ba7" />
          </Field>

          <Field label="Status" required>
            <TouchableOpacity style={s.dropdownTrigger} onPress={() => setShowStatusDropdown(!showStatusDropdown)}>
              <Text style={s.dropdownValue}>{formData.status}</Text>
              <ChevronDown size={16} color="#6f7d96" />
            </TouchableOpacity>
            {showStatusDropdown && (
              <View style={s.dropdownList}>
                {STATUS_OPTIONS.map(st => (
                  <TouchableOpacity key={st} style={s.dropdownOption} onPress={() => { handleInput("status", st); setShowStatusDropdown(false); }}>
                    <Text style={s.dropdownOptionText}>{st}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Field>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  // VIEW PAGE
  if (page === "view" && viewUser) return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <Text style={s.pageTitle}>User</Text>
        <TouchableOpacity style={s.backBtn} onPress={() => setPage("list")}>
          <Text style={s.backBtnText}>Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
          <View style={s.viewProfile}>
            <View style={s.viewAvatar}>
              {viewUser.profileImage ? (
                <Image source={{ uri: viewUser.profileImage }} style={s.previewImage} />
              ) : (
                <Text style={s.noImage}>No Image</Text>
              )}
            </View>
            <View>
              <Text style={s.viewName}>{viewUser.userName}</Text>
              <Text style={s.viewRole}>{viewUser.roleName}</Text>
            </View>
          </View>

          <View style={s.detailsGrid}>
            {[["User Name", viewUser.userName], ["Password", viewUser.password], ["Role Name", viewUser.roleName], ["Mail ID", viewUser.mailId], ["Contact Number", viewUser.contactNumber], ["Status", viewUser.status], ["Created By", viewUser.createdBy], ["Created On", viewUser.createdOn], ["Modified By", viewUser.modifiedBy], ["Modified On", viewUser.modifiedOn]].map(([label, value]) => (
              <View key={label} style={s.detailCard}>
                <Text style={s.detailLabel}>{label}</Text>
                <Text style={s.detailValue}>{value}</Text>
              </View>
            ))}
          </View>

          <View style={s.viewActions}>
            <TouchableOpacity style={s.editBtn} onPress={() => handleEdit(viewUser)}>
              <Text style={s.editBtnText}>Edit User</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.outlineBtn} onPress={() => setPage("list")}>
              <Text style={s.outlineBtnText}>Back to List</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  return null;
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef3fb" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f7f9fc", borderBottomWidth: 1, borderBottomColor: "#d9dee8", paddingHorizontal: 16, paddingVertical: 14 },
  pageTitle: { fontSize: 26, fontWeight: "600", color: "#35507a" },
  iconBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#cfd7e6", borderRadius: 8, backgroundColor: "#fff" },
  card: { backgroundColor: "#fff", borderRadius: 6, borderWidth: 1, borderColor: "#d9dee8", padding: 16 },
  cardTitle: { fontSize: 22, fontWeight: "500", color: "#3f5cf4", marginBottom: 16 },
  searchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12 },
  searchInput: { flex: 1, height: 50, borderWidth: 1, borderColor: "#cfd7e6", borderRadius: 4, paddingHorizontal: 14, fontSize: 15, color: "#394a6d" },
  table: { minWidth: 1200 },
  tableHeader: { flexDirection: "row", backgroundColor: "#0284c7", paddingVertical: 12, paddingHorizontal: 8 },
  th: { color: "#fff", fontSize: 10, fontWeight: "bold", textTransform: "uppercase", paddingHorizontal: 4 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingVertical: 10, paddingHorizontal: 8, alignItems: "center" },
  td: { fontSize: 13, color: "#475569", paddingHorizontal: 4 },
  tdBold: { fontWeight: "600", color: "#0369a1" },
  actionBtn: { width: 30, height: 30, borderWidth: 1, borderColor: "#d7deea", borderRadius: 6, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  emptyRow: { paddingVertical: 28, alignItems: "center" },
  emptyText: { fontSize: 13, color: "#64748b" },
  paginationRow: { marginTop: 16 },
  paginationText: { fontSize: 13, color: "#64748b" },
  pageBtn: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, padding: 6, backgroundColor: "#fff" },
  pageBtnDisabled: { opacity: 0.4 },
  pageNumBtn: { width: 34, height: 34, borderRadius: 8, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  pageNumBtnActive: { backgroundColor: "#0284c7", borderColor: "#0284c7" },
  pageNumText: { fontSize: 13, fontWeight: "bold", color: "#475569" },
  pageNumTextActive: { color: "#fff" },
  fieldGroup: { marginBottom: 16, position: "relative" },
  fieldLabel: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 6 },
  input: { height: 48, borderWidth: 1, borderColor: "#cfd7e6", borderRadius: 4, paddingHorizontal: 14, fontSize: 15, color: "#111827", backgroundColor: "#eef3fb" },
  inputError: { borderColor: "#ef4444" },
  errorText: { fontSize: 12, color: "#ef4444", marginTop: 4 },
  eyeBtn: { position: "absolute", right: 12, top: 14 },
  dropdownTrigger: { height: 48, borderWidth: 1, borderColor: "#cfd7e6", borderRadius: 4, paddingHorizontal: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff" },
  dropdownValue: { fontSize: 15, color: "#374151" },
  dropdownPlaceholder: { fontSize: 15, color: "#9ca3af" },
  dropdownList: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#cfd7e6", borderRadius: 4, marginTop: 2, elevation: 5, maxHeight: 180 },
  dropdownOption: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  dropdownOptionText: { fontSize: 14, color: "#374151" },
  uploadBox: { width: 160, height: 160, borderWidth: 2, borderColor: "#d4d9e2", borderStyle: "dashed", borderRadius: 6, backgroundColor: "#f7f9fc", alignItems: "center", justifyContent: "center" },
  uploadLabel: { fontSize: 16, color: "#252525", textAlign: "center", marginTop: 10 },
  uploadHint: { fontSize: 13, color: "#374151", marginTop: 12 },
  imagePreview: { width: 160, height: 160, borderRadius: 4, backgroundColor: "#eef2f8", overflow: "hidden", alignItems: "center", justifyContent: "center" },
  previewImage: { width: "100%", height: "100%", resizeMode: "cover" },
  noImage: { fontSize: 13, color: "#70809b" },
  backBtn: { borderWidth: 1, borderColor: "#cfd7e6", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "#fff" },
  backBtnText: { fontSize: 14, fontWeight: "600", color: "#4a6390" },
  viewProfile: { flexDirection: "row", alignItems: "center", gap: 20, marginBottom: 24 },
  viewAvatar: { width: 120, height: 120, borderRadius: 12, borderWidth: 1, borderColor: "#d4d9e2", backgroundColor: "#eef3fb", overflow: "hidden", alignItems: "center", justifyContent: "center" },
  viewName: { fontSize: 24, fontWeight: "600", color: "#35507a" },
  viewRole: { fontSize: 15, color: "#6a7891", marginTop: 4 },
  detailsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  detailCard: { width: "47%", borderWidth: 1, borderColor: "#d9dee8", borderRadius: 8, backgroundColor: "#f9fbff", paddingHorizontal: 16, paddingVertical: 12 },
  detailLabel: { fontSize: 12, fontWeight: "500", color: "#7b87a0", marginBottom: 4 },
  detailValue: { fontSize: 15, fontWeight: "600", color: "#33425f" },
  viewActions: { flexDirection: "row", gap: 12, marginTop: 24 },
  editBtn: { backgroundColor: "#3f5cf4", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  editBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  outlineBtn: { borderWidth: 1, borderColor: "#cfd7e6", backgroundColor: "#fff", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  outlineBtnText: { color: "#4a6390", fontWeight: "600", fontSize: 14 },
});
