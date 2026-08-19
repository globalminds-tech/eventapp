import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, StyleSheet, ActivityIndicator, Modal, Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import {
  Eye, Plus, X, Trash2, Search, ChevronLeft, ChevronRight, Info, Edit, FileText
} from "lucide-react-native";
import {
  getPolicies, createPolicy, getPolicyById, deletePolicy, updatePolicy
} from "@Services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PolicyPage({ navigation }) {
  const [policies, setPolicies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [fieldErrors, setFieldErrors] = useState({});

  const Redexorganizer = useSelector((state) => state.user);
  const [organizerId, setOrganizerId] = useState("");

  const [form, setForm] = useState({
    policy_name: "",
    policy_type: "",
    policy_group: "",
    description: "",
    status: "Active"
  });

  useEffect(() => {
    const fetchUser = async () => {
      const uId = Redexorganizer?.id || (await AsyncStorage.getItem("userId"));
      setOrganizerId(uId);
    };
    fetchUser();
  }, [Redexorganizer]);

  useEffect(() => {
    if (organizerId) {
      loadPolicies();
    }
  }, [organizerId]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const res = await getPolicies(organizerId);
      setPolicies(res.data || []);
    } catch (error) {
      console.error(error);
      showToast("Failed to load policies", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setIsEditing(false);
    setEditId(null);
    setForm({
      policy_name: "",
      policy_type: "",
      policy_group: "",
      description: "",
      status: "Active"
    });
    setFieldErrors({});
  };

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async () => {
    const errors = {};
    if (!form.policy_name) errors.policy_name = "Policy name is required";
    if (!form.policy_type) errors.policy_type = "Policy Type is required";
    if (!form.policy_group) errors.policy_group = "Policy Group is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showToast("Please fill all fields", "error");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...form,
        organizer_id: organizerId
      };

      if (isEditing) {
        await updatePolicy(editId, payload);
        showToast("Policy updated successfully!");
      } else {
        await createPolicy(payload);
        showToast("Policy added successfully!");
      }

      setShowForm(false);
      resetForm();
      loadPolicies();
    } catch (error) {
      showToast("Failed to save policy", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    handleReset();
  };

  const handleEdit = async (id) => {
    try {
      setLoading(true);
      const res = await getPolicyById(id);
      const data = res.data;
      setForm({
        policy_name: data.policy_name || "",
        policy_type: data.policy_type || "",
        policy_group: data.policy_group || "",
        description: data.description || "",
        status: data.status || "Active"
      });
      setEditId(id);
      setIsEditing(true);
      setShowForm(true);
    } catch (error) {
      showToast("Failed to load details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Policy",
      "Are you sure you want to delete this policy?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const res = await deletePolicy(id);
              if (res.data.status) {
                showToast("Policy Deleted Successfully!");
                loadPolicies();
              } else {
                showToast(res.data.message || "Failed to delete policy", "error");
              }
            } catch {
              showToast("Failed to delete policy", "error");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const filteredPolicies = policies.filter(
    (p) =>
      (p.policy_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.policy_code || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPolicies = filteredPolicies.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);

  const renderPolicyCard = ({ item }) => (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <FileText size={18} color="#0284c7" />
          <Text style={s.cardTitle}>{item.policy_name}</Text>
        </View>
        <View style={[s.statusBadge, item.status === "Active" ? s.bgGreen : s.bgRed]}>
          <Text style={[s.statusText, item.status === "Active" ? s.textGreen : s.textRed]}>{item.status}</Text>
        </View>
      </View>
      <View style={s.cardBody}>
        <Text style={s.codeText}>CODE: {item.policy_code}</Text>
        <Text style={s.groupText}>{item.policy_group} ({item.policy_type})</Text>
      </View>
      <View style={s.cardActions}>
        <TouchableOpacity style={s.actionBtnView} onPress={async () => {
          const detail = await getPolicyById(item.id);
          setViewData(detail.data);
        }}>
          <Eye size={16} color="#0284c7" />
          <Text style={s.actionTextBlue}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtnEdit} onPress={() => handleEdit(item.id)}>
          <Edit size={16} color="#d97706" />
          <Text style={s.actionTextAmber}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtnDelete} onPress={() => handleDelete(item.id)}>
          <Trash2 size={16} color="#ef4444" />
          <Text style={s.actionTextRed}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Policy Management</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => { handleReset(); setShowForm(true); }}>
          <Plus size={18} color="#fff" />
          <Text style={s.addBtnText}>Add Policy</Text>
        </TouchableOpacity>
      </View>

      {toast.show && (
        <View style={[s.toast, toast.type === "success" ? s.toastSuccess : s.toastError]}>
          <Text style={s.toastText}>{toast.message}</Text>
        </View>
      )}

      <View style={s.searchContainer}>
        <Search size={18} color="#94a3b8" style={s.searchIcon} />
        <TextInput
          style={s.searchInput}
          placeholder="Search policies..."
          placeholderTextColor="#94a3b8"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      ) : (
        <FlatList
          data={currentPolicies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPolicyCard}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <View style={s.empty}>
              <Info size={36} color="#cbd5e1" />
              <Text style={s.emptyText}>No policies found</Text>
            </View>
          }
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={s.pagination}>
          <TouchableOpacity disabled={currentPage === 1} onPress={() => setCurrentPage(p => Math.max(1, p - 1))} style={s.pageBtn}>
            <ChevronLeft size={20} color={currentPage === 1 ? "#cbd5e1" : "#0f172a"} />
          </TouchableOpacity>
          <Text style={s.pageText}>{currentPage} / {totalPages}</Text>
          <TouchableOpacity disabled={currentPage === totalPages} onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))} style={s.pageBtn}>
            <ChevronRight size={20} color={currentPage === totalPages ? "#cbd5e1" : "#0f172a"} />
          </TouchableOpacity>
        </View>
      )}

      {/* VIEW DETAILS MODAL */}
      <Modal visible={!!viewData} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Policy Details</Text>
              <TouchableOpacity onPress={() => setViewData(null)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            {viewData && (
              <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled">
                <View style={s.detailRow}><Text style={s.detailLabel}>Code:</Text><Text style={s.detailVal}>{viewData.policy_code}</Text></View>
                <View style={s.detailRow}><Text style={s.detailLabel}>Name:</Text><Text style={s.detailVal}>{viewData.policy_name}</Text></View>
                <View style={s.detailRow}><Text style={s.detailLabel}>Type:</Text><Text style={s.detailVal}>{viewData.policy_type}</Text></View>
                <View style={s.detailRow}><Text style={s.detailLabel}>Group:</Text><Text style={s.detailVal}>{viewData.policy_group}</Text></View>
                <View style={s.detailRow}><Text style={s.detailLabel}>Status:</Text><Text style={s.detailVal}>{viewData.status}</Text></View>
                <View style={[s.detailRow, { flexDirection: "column", borderBottomWidth: 0 }]}><Text style={s.detailLabel}>Description:</Text><Text style={[s.detailVal, { marginTop: 6 }]}>{viewData.description || "No description provided"}</Text></View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* CREATE/EDIT FORM MODAL */}
      <Modal visible={showForm} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, { maxHeight: "90%" }]}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{isEditing ? "Edit Policy" : "Add Policy"}</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled">
              <Text style={s.inputLabel}>Policy Name *</Text>
              <TextInput style={s.input} value={form.policy_name} onChangeText={(v) => handleChange("policy_name", v)} placeholder="Enter Policy Name" />
              {fieldErrors.policy_name && <Text style={s.errText}>{fieldErrors.policy_name}</Text>}

              <Text style={s.inputLabel}>Policy Type *</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginVertical: 8 }}>
                {["Exhibitor", "Visitor", "Vendor"].map((pt) => (
                  <TouchableOpacity key={pt} style={[s.radio, form.policy_type === pt && s.radioSelected]} onPress={() => handleChange("policy_type", pt)}>
                    <Text style={[s.radioText, form.policy_type === pt && { color: "#0284c7" }]}>{pt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {fieldErrors.policy_type && <Text style={s.errText}>{fieldErrors.policy_type}</Text>}

              <Text style={s.inputLabel}>Policy Group *</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginVertical: 8 }}>
                {[
                  "Cancellation Policy", "Refund Policy", "Safety Policy",
                  "Privacy Policy", "Payment Policy", "Paper Submission Guidelines",
                  "Registration Policy"
                ].map((pg) => (
                  <TouchableOpacity key={pg} style={[s.radio, form.policy_group === pg && s.radioSelected]} onPress={() => handleChange("policy_group", pg)}>
                    <Text style={[s.radioText, form.policy_group === pg && { color: "#0284c7" }]}>{pg}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {fieldErrors.policy_group && <Text style={s.errText}>{fieldErrors.policy_group}</Text>}

              <Text style={s.inputLabel}>Description</Text>
              <TextInput style={[s.input, { height: 120 }]} multiline numberOfLines={5} value={form.description} onChangeText={(v) => handleChange("description", v)} placeholder="Policy terms and conditions..." />

              {isEditing && (
                <>
                  <Text style={s.inputLabel}>Status</Text>
                  <View style={{ flexDirection: "row", gap: 10, marginVertical: 8 }}>
                    {["Active", "Inactive"].map((st) => (
                      <TouchableOpacity key={st} style={[s.radio, form.status === st && s.radioSelected]} onPress={() => setForm({ ...form, status: st })}>
                        <Text style={[s.radioText, form.status === st && { color: "#0284c7" }]}>{st}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <TouchableOpacity style={s.submitBtn} onPress={handleSubmit}>
                <Text style={s.submitBtnText}>Submit Details</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#0c4a6e" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#0284c7", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  
  toast: { position: "absolute", top: 80, left: 16, right: 16, padding: 12, borderRadius: 8, zIndex: 100, alignItems: "center" },
  toastSuccess: { backgroundColor: "#d1fae5" },
  toastError: { backgroundColor: "#ffe4e6" },
  toastText: { fontSize: 13, fontWeight: "bold", color: "#0f172a" },

  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", margin: 16, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, color: "#0f172a", fontSize: 14 },

  list: { paddingHorizontal: 16, paddingBottom: 80 },
  card: { backgroundColor: "#fff", borderRadius: 12, marginBottom: 16, padding: 16, borderWidth: 1, borderColor: "#e2e8f0", elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingBottom: 10, marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: "bold", color: "#0f172a", flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  bgGreen: { backgroundColor: "#dcfce7" },
  bgRed: { backgroundColor: "#fee2e2" },
  textGreen: { color: "#15803d", fontSize: 10, fontWeight: "bold" },
  textRed: { color: "#b91c1c", fontSize: 10, fontWeight: "bold" },

  cardBody: { gap: 6 },
  codeText: { fontSize: 11, fontWeight: "bold", color: "#64748b", letterSpacing: 1 },
  groupText: { fontSize: 13, color: "#334155" },

  cardActions: { flexDirection: "row", justifyContent: "space-around", marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  actionBtnView: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4 },
  actionBtnEdit: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4 },
  actionBtnDelete: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4 },
  actionTextBlue: { fontSize: 13, fontWeight: "bold", color: "#0284c7" },
  actionTextAmber: { fontSize: 13, fontWeight: "bold", color: "#d97706" },
  actionTextRed: { fontSize: 13, fontWeight: "bold", color: "#ef4444" },

  pagination: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#e2e8f0", backgroundColor: "#fff" },
  pageBtn: { padding: 8 },
  pageText: { fontSize: 14, fontWeight: "bold", color: "#0f172a", marginHorizontal: 16 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", borderRadius: 16, width: "100%", padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingBottom: 12, marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#0f172a" },
  modalBody: { gap: 12 },

  detailRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingVertical: 8 },
  detailLabel: { width: 120, fontSize: 13, color: "#64748b", fontWeight: "bold" },
  detailVal: { flex: 1, fontSize: 13, color: "#0f172a" },

  inputLabel: { fontSize: 12, fontWeight: "bold", color: "#334155", marginTop: 10, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, height: 44, color: "#0f172a", fontSize: 14, backgroundColor: "#f8fafc" },
  errText: { color: "#ef4444", fontSize: 11, fontWeight: "bold", marginTop: 2 },

  radio: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: "#f8fafc", marginBottom: 6 },
  radioSelected: { borderColor: "#0284c7", backgroundColor: "#f0f9ff" },
  radioText: { fontSize: 13, color: "#475569", fontWeight: "bold" },

  submitBtn: { backgroundColor: "#0284c7", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 24, marginBottom: 40 },
  submitBtnText: { color: "#fff", fontSize: 15, fontWeight: "bold" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40, gap: 10 },
  emptyText: { color: "#94a3b8", fontSize: 14, fontWeight: "bold" }
});
