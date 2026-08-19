import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Save, Trash2, Search, UserPlus, Pencil, Eye, ListFilter, ChevronDown } from "lucide-react-native";
import { getMyContacts, createMyContact, deleteMyContact, updateMyContact } from "@Services/api";

const USER_TYPES = ["Leiten Admin", "Organizer", "Exhibitor"];
const GROUP_NAMES = ["Leiten", "Developers"];

const GroupCard = ({ group, stats, onDetail }) => {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <View style={s.groupCard}>
      <View style={s.groupCardHeader}>
        <Text style={s.groupCardTitle}>{group}</Text>
        <TouchableOpacity onPress={() => setShowMenu(!showMenu)} style={s.menuDotBtn}>
          <Text style={s.menuDots}>•••</Text>
        </TouchableOpacity>
        {showMenu && (
          <View style={s.menuDropdown}>
            <TouchableOpacity style={s.menuItem} onPress={() => { onDetail(); setShowMenu(false); }}>
              <Eye size={14} color="#475569" /><Text style={s.menuItemText}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.menuItem} onPress={() => { onDetail(); setShowMenu(false); }}>
              <Pencil size={14} color="#475569" /><Text style={s.menuItemText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <TouchableOpacity style={s.groupCardBody} onPress={onDetail}>
        <View style={s.statRow}>
          <ListFilter size={24} color="#94a3b8" />
          <View style={{ marginLeft: 12 }}>
            <Text style={s.statLabel}>CONTACTS</Text>
            <Text style={s.statNum}>{stats.count}</Text>
          </View>
        </View>
        <View style={s.statRow}>
          <View style={s.statusDot} />
          <View style={{ marginLeft: 12 }}>
            <Text style={s.statLabel}>STATUS</Text>
            <Text style={[s.statusVal, { color: stats.status === "Active" ? "#2563eb" : "#94a3b8" }]}>{stats.status}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export const Contacts = () => {
  const [page, setPage] = useState("home");
  const [manual, setManual] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showUserTypeDropdown, setShowUserTypeDropdown] = useState(false);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [userTypeSearch, setUserTypeSearch] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", mobile: "", userType: "", groupName: "" });

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    try {
      const data = await getMyContacts();
      setContacts(data || []);
    } catch (err) { console.error(err); }
  };

  const handleChange = (field, value) => {
    if (field === "mobile") {
      const num = value.replace(/\D/g, "");
      if (num.length > 10) return;
      setFormData(prev => ({ ...prev, mobile: num }));
      return;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addContact = async () => {
    const { name, email, mobile, userType, groupName } = formData;
    if (!name || !email || !mobile || !userType || !groupName) {
      Alert.alert("Validation", "Please fill all mandatory fields.");
      return;
    }
    if (mobile.length !== 10) {
      Alert.alert("Validation", "Please enter a valid 10-digit Contact Number.");
      return;
    }
    try {
      if (editId) {
        await updateMyContact(editId, formData);
      } else {
        await createMyContact(formData);
      }
      fetchContacts();
      clearForm();
    } catch (err) { console.error(err); }
  };

  const handleDelete = (id) => {
    Alert.alert("Confirm", "Are you sure you want to delete this contact?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await deleteMyContact(id);
            fetchContacts();
          } catch (err) { console.error(err); }
        }
      }
    ]);
  };

  const handleEdit = (contact) => {
    setEditId(contact.id);
    setFormData({
      name: contact.name,
      email: contact.email,
      mobile: contact.mobile,
      userType: contact.user_type || contact.userType,
      groupName: contact.group_name || contact.groupName
    });
    setManual(true);
    setPage("contacts");
  };

  const clearForm = () => {
    setEditId(null);
    setFormData({ name: "", email: "", mobile: "", userType: "", groupName: "" });
  };

  const getGroupStats = (groupName) => {
    const gc = contacts.filter(c => (c.group_name || c.groupName) === groupName);
    return { count: gc.length, status: gc.length > 0 ? "Active" : "Inactive" };
  };

  const displayContacts = selectedGroup
    ? contacts.filter(c => (c.group_name || c.groupName) === selectedGroup)
    : contacts;

  if (page === "home") {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.topBar}>
          <Text style={s.topBarTitle}>My Contacts</Text>
          <TouchableOpacity style={s.addIconBtn} onPress={() => { setPage("contacts"); setSelectedGroup(null); }}>
            <UserPlus size={20} color="#2563eb" />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
          {contacts.length === 0 ? (
            <View style={s.emptyBox}>
              <UserPlus size={40} color="#93c5fd" />
              <Text style={s.emptyTitle}>Build Your Network</Text>
              <Text style={s.emptySubtitle}>Manage your organizers, exhibitors, and admins in one centralized contact hub.</Text>
              <TouchableOpacity style={s.primaryBtn} onPress={() => setPage("contacts")}>
                <Text style={s.primaryBtnText}>Create New Contact</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={s.groupsHeader}>
                <Text style={s.groupsTitle}>Contact Groups</Text>
                <TouchableOpacity style={s.addNewBtn} onPress={() => { setPage("contacts"); setSelectedGroup(null); }}>
                  <UserPlus size={16} color="#fff" />
                  <Text style={s.addNewBtnText}>Add New</Text>
                </TouchableOpacity>
              </View>
              {GROUP_NAMES.map(group => (
                <GroupCard
                  key={group}
                  group={group}
                  stats={getGroupStats(group)}
                  onDetail={() => { setSelectedGroup(group); setPage("contacts"); }}
                />
              ))}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <Text style={s.topBarTitle}>My Contacts</Text>
        <View style={s.topBarActions}>
          <TouchableOpacity style={s.iconBtn} onPress={addContact}><Save size={18} color="#475569" /></TouchableOpacity>
          <TouchableOpacity style={s.iconBtn}><Trash2 size={18} color="#475569" /></TouchableOpacity>
          <TouchableOpacity style={s.iconBtn}><Search size={18} color="#475569" /></TouchableOpacity>
          <TouchableOpacity onPress={() => setPage("home")}><Text style={s.backText}>Back</Text></TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        {/* LEFT PANEL - Form */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Contact Details</Text>

          {/* Manual / Document Toggle */}
          <View style={s.toggleRow}>
            <Text style={[s.toggleLabel, manual && s.toggleLabelActive]}>Manual</Text>
            <TouchableOpacity
              style={[s.toggleTrack, manual && s.toggleTrackActive]}
              onPress={() => setManual(!manual)}
            >
              <View style={[s.toggleThumb, manual && s.toggleThumbRight]} />
            </TouchableOpacity>
            <Text style={[s.toggleLabel, !manual && s.toggleLabelActive]}>Document</Text>
          </View>

          {manual ? (
            <View>
              <Text style={s.fieldLabel}>Name <Text style={{ color: "red" }}>*</Text></Text>
              <TextInput style={s.input} value={formData.name} onChangeText={v => handleChange("name", v)} placeholder="Enter Name" placeholderTextColor="#cbd5e1" />

              <Text style={s.fieldLabel}>Mail ID <Text style={{ color: "red" }}>*</Text></Text>
              <TextInput style={s.input} value={formData.email} onChangeText={v => handleChange("email", v)} placeholder="Enter Mail ID" keyboardType="email-address" placeholderTextColor="#cbd5e1" />

              <Text style={s.fieldLabel}>Mobile Number <Text style={{ color: "red" }}>*</Text></Text>
              <TextInput style={s.input} value={formData.mobile} onChangeText={v => handleChange("mobile", v)} placeholder="Enter Contact Number" keyboardType="number-pad" maxLength={10} placeholderTextColor="#cbd5e1" />

              {/* User Type Dropdown */}
              <Text style={s.fieldLabel}>User Type <Text style={{ color: "red" }}>*</Text></Text>
              <TouchableOpacity style={s.dropdownTrigger} onPress={() => setShowUserTypeDropdown(!showUserTypeDropdown)}>
                <Text style={formData.userType ? s.dropdownValue : s.dropdownPlaceholder}>{formData.userType || "User Type"}</Text>
                <ChevronDown size={16} color="#64748b" />
              </TouchableOpacity>
              {showUserTypeDropdown && (
                <View style={s.dropdownList}>
                  <View style={s.dropdownSearch}>
                    <Search size={14} color="#94a3b8" />
                    <TextInput style={s.dropdownSearchInput} placeholder="Search..." value={userTypeSearch} onChangeText={setUserTypeSearch} placeholderTextColor="#cbd5e1" />
                  </View>
                  {USER_TYPES.filter(t => t.toLowerCase().includes(userTypeSearch.toLowerCase())).map(type => (
                    <TouchableOpacity key={type} style={s.dropdownOption} onPress={() => { setFormData(prev => ({ ...prev, userType: type })); setShowUserTypeDropdown(false); }}>
                      <Text style={s.dropdownOptionText}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Group Name Dropdown */}
              <Text style={s.fieldLabel}>Group Name <Text style={{ color: "red" }}>*</Text></Text>
              <TouchableOpacity style={s.dropdownTrigger} onPress={() => setShowGroupDropdown(!showGroupDropdown)}>
                <Text style={formData.groupName ? s.dropdownValue : s.dropdownPlaceholder}>{formData.groupName || "Group Name"}</Text>
                <ChevronDown size={16} color="#64748b" />
              </TouchableOpacity>
              {showGroupDropdown && (
                <View style={s.dropdownList}>
                  <View style={s.dropdownSearch}>
                    <Search size={14} color="#94a3b8" />
                    <TextInput style={s.dropdownSearchInput} placeholder="Search..." value={groupSearch} onChangeText={setGroupSearch} placeholderTextColor="#cbd5e1" />
                  </View>
                  {GROUP_NAMES.filter(g => g.toLowerCase().includes(groupSearch.toLowerCase())).map(group => (
                    <TouchableOpacity key={group} style={s.dropdownOption} onPress={() => { setFormData(prev => ({ ...prev, groupName: group })); setShowGroupDropdown(false); }}>
                      <Text style={s.dropdownOptionText}>{group}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={s.formActions}>
                <TouchableOpacity style={s.submitBtn} onPress={addContact}>
                  <Text style={s.submitBtnText}>{editId ? "Update Contact" : "Add Contact"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.clearBtn} onPress={clearForm}>
                  <Text style={s.clearBtnText}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={s.docUploadBox}>
              <ListFilter size={32} color="#93c5fd" />
              <Text style={s.docText}>Drag and drop your contact file here</Text>
              <TouchableOpacity style={s.browseBtn}>
                <Text style={s.browseBtnText}>Browse Files</Text>
              </TouchableOpacity>
              <View style={s.tipBox}>
                <Text style={s.tipTitle}>?? Tips for Success</Text>
                {["Use the official Excel template provided above", "Do not change the column headers or file name", "Ensure mobile numbers are exactly 10 digits"].map(tip => (
                  <Text key={tip} style={s.tipItem}>• {tip}</Text>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* SUMMARY TABLE */}
        <View style={[s.card, { marginTop: 16 }]}>
          <View style={s.tableHeader}>
            <Text style={s.cardTitle}>{selectedGroup ? `${selectedGroup} Contacts` : "Summary"}</Text>
            {selectedGroup && (
              <TouchableOpacity onPress={() => setSelectedGroup(null)}>
                <Text style={s.showAllText}>Show All</Text>
              </TouchableOpacity>
            )}
          </View>

          {displayContacts.length === 0 ? (
            <View style={s.emptyTableBox}>
              <Search size={24} color="#cbd5e1" />
              <Text style={s.emptyTableText}>No Data Found.</Text>
            </View>
          ) : (
            displayContacts.map((contact, index) => (
              <View key={index} style={s.contactRow}>
                <View style={s.contactActions}>
                  <TouchableOpacity style={s.actionIconBtn} onPress={() => handleEdit(contact)}>
                    <Pencil size={16} color="#94a3b8" />
                  </TouchableOpacity>
                  <TouchableOpacity style={s.actionIconBtn} onPress={() => handleDelete(contact.id)}>
                    <Trash2 size={16} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
                <View style={s.contactInfo}>
                  <Text style={s.contactName}>{contact.name}</Text>
                  <Text style={s.contactDetail}>{contact.email}</Text>
                  <Text style={s.contactDetail}>{contact.mobile}</Text>
                  <View style={s.userTypeBadge}>
                    <Text style={s.userTypeBadgeText}>{contact.user_type || contact.userType}</Text>
                  </View>
                  <Text style={s.contactDetail}>{contact.group_name || contact.groupName}</Text>
                </View>
              </View>
            ))
          )}

          <View style={s.paginationRow}>
            <Text style={s.paginationText}>
              Showing {displayContacts.length === 0 ? 0 : 1} to {displayContacts.length} of {displayContacts.length} entries
            </Text>
            <View style={s.pageBtns}>
              {["«", "‹", "1", "›", "»"].map((label, i) => (
                <TouchableOpacity key={i} style={[s.pageBtn, label === "1" && s.pageBtnActive]}>
                  <Text style={[s.pageBtnText, label === "1" && s.pageBtnTextActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Contacts;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingHorizontal: 16, paddingVertical: 14 },
  topBarTitle: { fontSize: 18, fontWeight: "bold", color: "#334155" },
  topBarActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBtn: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, padding: 8 },
  backText: { fontSize: 14, fontWeight: "600", color: "#64748b" },
  addIconBtn: { padding: 8, backgroundColor: "#eff6ff", borderWidth: 1, borderColor: "#bfdbfe", borderRadius: 10 },
  card: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#4461f2", marginBottom: 12 },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 20, backgroundColor: "#f8fafc", padding: 8, borderRadius: 10, borderWidth: 1, borderColor: "#f1f5f9" },
  toggleLabel: { fontSize: 13, fontWeight: "bold", color: "#94a3b8" },
  toggleLabelActive: { color: "#1e293b" },
  toggleTrack: { width: 52, height: 26, borderRadius: 13, backgroundColor: "#cbd5e1", justifyContent: "center", paddingHorizontal: 3 },
  toggleTrackActive: { backgroundColor: "#4461f2" },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 2, elevation: 2 },
  toggleThumbRight: { alignSelf: "flex-end" },
  fieldLabel: { fontSize: 11, fontWeight: "bold", color: "#64748b", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#0f172a" },
  dropdownTrigger: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dropdownValue: { fontSize: 14, color: "#334155" },
  dropdownPlaceholder: { fontSize: 14, color: "#cbd5e1" },
  dropdownList: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, marginTop: 4, elevation: 5, maxHeight: 180 },
  dropdownSearch: { flexDirection: "row", alignItems: "center", gap: 8, padding: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9", backgroundColor: "#f8fafc" },
  dropdownSearchInput: { flex: 1, fontSize: 12, color: "#334155" },
  dropdownOption: { paddingHorizontal: 14, paddingVertical: 10 },
  dropdownOptionText: { fontSize: 13, color: "#475569" },
  formActions: { flexDirection: "row", gap: 12, marginTop: 20 },
  submitBtn: { flex: 1, backgroundColor: "#2563eb", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  submitBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  clearBtn: { flex: 1, borderWidth: 2, borderColor: "#2563eb", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  clearBtnText: { color: "#2563eb", fontWeight: "bold", fontSize: 14 },
  docUploadBox: { alignItems: "center", paddingVertical: 20, gap: 10 },
  docText: { fontSize: 14, color: "#64748b", fontWeight: "500" },
  browseBtn: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
  browseBtnText: { fontSize: 13, fontWeight: "bold", color: "#334155" },
  tipBox: { backgroundColor: "#fffbeb", borderWidth: 1, borderColor: "#fde68a", borderRadius: 12, padding: 14, width: "100%", marginTop: 12 },
  tipTitle: { fontSize: 13, fontWeight: "bold", color: "#92400e", marginBottom: 8 },
  tipItem: { fontSize: 12, color: "#b45309", marginBottom: 4 },
  emptyBox: { alignItems: "center", paddingVertical: 40, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: "bold", color: "#1e293b" },
  emptySubtitle: { fontSize: 13, color: "#64748b", textAlign: "center", lineHeight: 20 },
  primaryBtn: { backgroundColor: "#2563eb", paddingHorizontal: 28, paddingVertical: 12, borderRadius: 10, marginTop: 8 },
  primaryBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  groupsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  groupsTitle: { fontSize: 20, fontWeight: "bold", color: "#1e293b" },
  addNewBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#2563eb", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addNewBtnText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  groupCard: { backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 14, overflow: "hidden" },
  groupCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  groupCardTitle: { fontSize: 18, fontWeight: "bold", color: "#1e293b" },
  menuDotBtn: { padding: 4 },
  menuDots: { fontSize: 18, color: "#94a3b8", letterSpacing: 2 },
  menuDropdown: { position: "absolute", right: 8, top: 40, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, zIndex: 100, minWidth: 100, elevation: 5 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10 },
  menuItemText: { fontSize: 12, color: "#475569", fontWeight: "500" },
  groupCardBody: { flexDirection: "row", padding: 16, gap: 20 },
  statRow: { flex: 1, flexDirection: "row", alignItems: "center" },
  statLabel: { fontSize: 10, fontWeight: "bold", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 },
  statNum: { fontSize: 18, fontWeight: "900", color: "#1e293b" },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#3b82f6" },
  statusVal: { fontSize: 13, fontWeight: "bold" },
  tableHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  showAllText: { fontSize: 11, fontWeight: "bold", color: "#64748b", backgroundColor: "#f8fafc", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: "#e2e8f0" },
  emptyTableBox: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyTableText: { fontSize: 14, color: "#64748b", fontWeight: "500" },
  contactRow: { flexDirection: "row", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  contactActions: { gap: 8 },
  actionIconBtn: { padding: 6 },
  contactInfo: { flex: 1, gap: 4 },
  contactName: { fontSize: 14, fontWeight: "600", color: "#1e293b" },
  contactDetail: { fontSize: 12, color: "#64748b" },
  userTypeBadge: { backgroundColor: "#dbeafe", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  userTypeBadgeText: { fontSize: 10, fontWeight: "bold", color: "#1d4ed8", textTransform: "uppercase" },
  paginationRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#f1f5f9", flexWrap: "wrap", gap: 8 },
  paginationText: { fontSize: 11, color: "#64748b" },
  pageBtns: { flexDirection: "row", gap: 4 },
  pageBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", alignItems: "center", justifyContent: "center" },
  pageBtnActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  pageBtnText: { fontSize: 12, color: "#64748b" },
  pageBtnTextActive: { color: "#fff", fontWeight: "bold" },
});
