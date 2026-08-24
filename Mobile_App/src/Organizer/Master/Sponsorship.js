import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, StyleSheet, ActivityIndicator, Modal, Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import {
  Eye, Plus, X, Trash2, Search, ChevronLeft, ChevronRight, Info, Edit, Mail, Phone, MapPin, Award
} from "lucide-react-native";
import {
  getSponsors, getSponsorById, createSponsor, deleteSponsor, updateSponsor
} from "@Services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SponsorshipPage({ navigation }) {
  const [sponsors, setSponsors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [errors, setErrors] = useState({});

  const Redexorganizer = useSelector((state) => state.user);
  const [organizerId, setOrganizerId] = useState("");
  const [organizerName, setOrganizerName] = useState("");

  const [form, setForm] = useState({
    sponsor_name: "",
    primary_contact: "",
    secondary_contact: "",
    mail_id: "",
    address: "",
    status: "Active"
  });

  const [documents, setDocuments] = useState([
    { document_type: "", document_number: "", document_file: "DummyDataURL", preview: "" }
  ]);

  useEffect(() => {
    const fetchUser = async () => {
      const uId = Redexorganizer?.id || (await AsyncStorage.getItem("userId"));
      const uName = Redexorganizer?.name || (await AsyncStorage.getItem("userName"));
      setOrganizerId(uId);
      setOrganizerName(uName);
    };
    fetchUser();
  }, [Redexorganizer]);

  useEffect(() => {
    if (organizerId) {
      loadSponsors();
    }
  }, [organizerId]);

  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const loadSponsors = async () => {
    try {
      setLoading(true);
      const res = await getSponsors(organizerId);
      setSponsors(res || []);
    } catch (error) {
      console.error(error);
      showNotification("Failed to load sponsors", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setIsEditing(false);
    setEditId(null);
    setForm({
      sponsor_name: "",
      primary_contact: "",
      secondary_contact: "",
      mail_id: "",
      address: "",
      status: "Active"
    });
    setDocuments([{ document_type: "", document_number: "", document_file: "DummyDataURL", preview: "" }]);
    setErrors({});
  };

  const handleChange = (name, value) => {
    setErrors({ ...errors, [name]: "" });
    let val = value;
    if (name === "mail_id" || name === "primary_contact" || name === "secondary_contact") {
      val = value.replace(/\s/g, "");
    }
    if (name === "primary_contact" || name === "secondary_contact") {
      val = val.replace(/\D/g, "").slice(0, 10);
    }
    setForm({ ...form, [name]: val });
  };

  const handleDocChange = (index, name, value) => {
    const temp = [...documents];
    let val = value;
    if (name === "document_number") {
      const type = temp[index].document_type;
      if (type === "Aadhar") {
        val = value.replace(/\D/g, "").slice(0, 12);
      } else if (type === "PAN") {
        val = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10);
      }
    }
    temp[index][name] = val;
    setDocuments(temp);
  };

  const addDocument = () => {
    if (documents.length >= 3) {
      showNotification("Maximum 3 documents allowed", "error");
      return;
    }
    setDocuments([...documents, { document_type: "", document_number: "", document_file: "DummyDataURL", preview: "" }]);
  };

  const removeDocument = (index) => {
    if (documents.length > 1) {
      setDocuments(documents.filter((_, i) => i !== index));
    } else {
      setDocuments([{ document_type: "", document_number: "", document_file: "DummyDataURL", preview: "" }]);
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!form.sponsor_name.trim()) newErrors.sponsor_name = "Sponsor Name is required";
    if (!form.primary_contact.trim()) newErrors.primary_contact = "Primary contact is required";
    if (!form.mail_id.trim()) newErrors.mail_id = "Mail ID is required";
    if (!form.address.trim()) newErrors.address = "Address is required";

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (form.mail_id && !emailRegex.test(form.mail_id)) {
      newErrors.mail_id = "Invalid email format";
    }
    if (form.primary_contact && form.primary_contact.length !== 10) {
      newErrors.primary_contact = "Contact must be exactly 10 digits";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showNotification("Please check all fields", "error");
      return;
    }

    // Document Validation
    const filledDocs = documents.filter((d) => d.document_type || d.document_number);
    for (let i = 0; i < filledDocs.length; i++) {
      const doc = filledDocs[i];
      if (!doc.document_type) {
        showNotification(`Document ${i + 1}: Select document type`, "error");
        return;
      }
      if (!doc.document_number) {
        showNotification(`Document ${i + 1}: Enter document number`, "error");
        return;
      }
      if (doc.document_type === "Aadhar" && doc.document_number.length !== 12) {
        showNotification(`Document ${i + 1}: Aadhar must be 12 digits`, "error");
        return;
      }
      if (doc.document_type === "PAN" && doc.document_number.length !== 10) {
        showNotification(`Document ${i + 1}: PAN must be 10 characters`, "error");
        return;
      }
    }

    try {
      setLoading(true);
      const payload = {
        ...form,
        organizer_id: organizerId,
        documents: filledDocs,
      };

      if (isEditing) {
        await updateSponsor(editId, { ...payload, modified_by: organizerName || "System" });
        showNotification("Sponsor Updated Successfully!");
      } else {
        await createSponsor({ ...payload, created_by: organizerName || "System" });
        showNotification("Sponsor Created Successfully!");
      }

      setShowForm(false);
      handleReset();
      loadSponsors();
    } catch (error) {
      showNotification("Failed to save sponsor", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      setLoading(true);
      const res = await getSponsorById(id);
      setForm({
        sponsor_name: res.sponsor_name || "",
        primary_contact: res.primary_contact || "",
        secondary_contact: res.secondary_contact || "",
        mail_id: res.mail_id || "",
        address: res.address || "",
        status: res.status || "Active"
      });

      if (res.documents && res.documents.length > 0) {
        setDocuments(res.documents.map(d => ({
          document_type: d.document_type,
          document_number: d.document_number,
          document_file: d.document_file || "DummyDataURL",
          preview: ""
        })));
      } else {
        setDocuments([{ document_type: "", document_number: "", document_file: "DummyDataURL", preview: "" }]);
      }

      setEditId(id);
      setIsEditing(true);
      setShowForm(true);
    } catch (error) {
      showNotification("Failed to load details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Sponsor",
      "Are you sure you want to delete this sponsor?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await deleteSponsor(id);
              showNotification("Sponsor Deleted Successfully!");
              loadSponsors();
            } catch {
              showNotification("Failed to delete sponsor", "error");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const filteredSponsors = sponsors.filter(
    (s) =>
      (s.sponsor_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.sponsor_code || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSponsors = filteredSponsors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSponsors.length / itemsPerPage);

  const renderSponsorCard = ({ item }) => (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Award size={18} color="#0284c7" />
          <Text style={s.cardTitle}>{item.sponsor_name}</Text>
        </View>
        <View style={[s.statusBadge, item.status === "Active" ? s.bgGreen : s.bgRed]}>
          <Text style={[s.statusText, item.status === "Active" ? s.textGreen : s.textRed]}>{item.status}</Text>
        </View>
      </View>
      <View style={s.cardBody}>
        <Text style={s.codeText}>CODE: {item.sponsor_code}</Text>
        <View style={s.infoRow}><Mail size={14} color="#64748b" /><Text style={s.infoValue}>{item.mail_id}</Text></View>
        <View style={s.infoRow}><Phone size={14} color="#64748b" /><Text style={s.infoValue}>{item.primary_contact}</Text></View>
        <View style={s.infoRow}><MapPin size={14} color="#64748b" /><Text style={s.infoValue} numberOfLines={1}>{item.address}</Text></View>
      </View>
      <View style={s.cardActions}>
        <TouchableOpacity style={s.actionBtnView} onPress={async () => {
          const detail = await getSponsorById(item.id);
          setViewData(detail);
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
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Sponsorship</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => { handleReset(); setShowForm(true); }}>
          <Plus size={18} color="#fff" />
          <Text style={s.addBtnText}>Add Sponsor</Text>
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
          placeholder="Search sponsors by name or code..."
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
          data={currentSponsors}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSponsorCard}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <View style={s.empty}>
              <Info size={36} color="#cbd5e1" />
              <Text style={s.emptyText}>No sponsors found</Text>
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

      {/* VIEW MODAL */}
      <Modal visible={!!viewData} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Sponsor Details</Text>
              <TouchableOpacity onPress={() => setViewData(null)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            {viewData && (
              <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled">
                <View style={s.detailRow}><Text style={s.detailLabel}>Code:</Text><Text style={s.detailVal}>{viewData.sponsor_code}</Text></View>
                <View style={s.detailRow}><Text style={s.detailLabel}>Name:</Text><Text style={s.detailVal}>{viewData.sponsor_name}</Text></View>
                <View style={s.detailRow}><Text style={s.detailLabel}>Mail ID:</Text><Text style={s.detailVal}>{viewData.mail_id}</Text></View>
                <View style={s.detailRow}><Text style={s.detailLabel}>Primary Contact:</Text><Text style={s.detailVal}>{viewData.primary_contact}</Text></View>
                {viewData.secondary_contact && <View style={s.detailRow}><Text style={s.detailLabel}>Secondary Contact:</Text><Text style={s.detailVal}>{viewData.secondary_contact}</Text></View>}
                <View style={s.detailRow}><Text style={s.detailLabel}>Address:</Text><Text style={s.detailVal}>{viewData.address}</Text></View>
                <View style={s.detailRow}><Text style={s.detailLabel}>Status:</Text><Text style={s.detailVal}>{viewData.status}</Text></View>
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
              <Text style={s.modalTitle}>{isEditing ? "Edit Sponsor" : "Add Sponsor"}</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled">
              <Text style={s.inputLabel}>Sponsor Name *</Text>
              <TextInput style={s.input} value={form.sponsor_name} onChangeText={(v) => handleChange("sponsor_name", v)} placeholder="Enter Sponsor Name" />
              {errors.sponsor_name && <Text style={s.errText}>{errors.sponsor_name}</Text>}

              <Text style={s.inputLabel}>Mail ID *</Text>
              <TextInput style={s.input} keyboardType="email-address" autoCapitalize="none" value={form.mail_id} onChangeText={(v) => handleChange("mail_id", v)} placeholder="you@example.com" />
              {errors.mail_id && <Text style={s.errText}>{errors.mail_id}</Text>}

              <Text style={s.inputLabel}>Primary Contact *</Text>
              <TextInput style={s.input} keyboardType="number-pad" value={form.primary_contact} onChangeText={(v) => handleChange("primary_contact", v)} placeholder="10-digit primary number" />
              {errors.primary_contact && <Text style={s.errText}>{errors.primary_contact}</Text>}

              <Text style={s.inputLabel}>Secondary Contact</Text>
              <TextInput style={s.input} keyboardType="number-pad" value={form.secondary_contact} onChangeText={(v) => handleChange("secondary_contact", v)} placeholder="Secondary contact (optional)" />

              <Text style={s.inputLabel}>Address *</Text>
              <TextInput style={[s.input, { height: 80 }]} multiline numberOfLines={3} value={form.address} onChangeText={(v) => handleChange("address", v)} placeholder="Address" />
              {errors.address && <Text style={s.errText}>{errors.address}</Text>}

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

              {/* Documents Section */}
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Verification Documents</Text>
                <TouchableOpacity style={s.addDocBtn} onPress={addDocument}>
                  <Plus size={14} color="#0284c7" />
                  <Text style={s.addDocText}>Add Document</Text>
                </TouchableOpacity>
              </View>

              {documents.map((doc, idx) => (
                <View key={idx} style={s.docCard}>
                  <View style={s.docHeader}>
                    <Text style={s.docNumberLabel}>Document #{idx + 1}</Text>
                    <TouchableOpacity onPress={() => removeDocument(idx)}>
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>

                  <Text style={s.inputLabel}>Document Type</Text>
                  <View style={{ flexDirection: "row", gap: 10, marginVertical: 8 }}>
                    {["Aadhar", "PAN"].map((dt) => (
                      <TouchableOpacity key={dt} style={[s.radio, doc.document_type === dt && s.radioSelected]} onPress={() => handleDocChange(idx, "document_type", dt)}>
                        <Text style={[s.radioText, doc.document_type === dt && { color: "#0284c7" }]}>{dt}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={s.inputLabel}>Document Number</Text>
                  <TextInput style={s.input} placeholder="Enter number" value={doc.document_number} onChangeText={(v) => handleDocChange(idx, "document_number", v)} />
                </View>
              ))}

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
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoValue: { fontSize: 13, color: "#334155", flex: 1 },

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

  radio: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: "#f8fafc" },
  radioSelected: { borderColor: "#0284c7", backgroundColor: "#f0f9ff" },
  radioText: { fontSize: 13, color: "#475569", fontWeight: "bold" },

  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#e2e8f0", marginTop: 20, paddingTop: 16, marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "bold", color: "#0f172a" },
  addDocBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  addDocText: { color: "#0284c7", fontSize: 12, fontWeight: "bold" },

  docCard: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, padding: 12, marginBottom: 12, backgroundColor: "#f8fafc" },
  docHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingBottom: 6, marginBottom: 8 },
  docNumberLabel: { fontSize: 12, fontWeight: "bold", color: "#64748b" },

  submitBtn: { backgroundColor: "#0284c7", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 24, marginBottom: 40 },
  submitBtnText: { color: "#fff", fontSize: 15, fontWeight: "bold" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40, gap: 10 },
  emptyText: { color: "#94a3b8", fontSize: 14, fontWeight: "bold" }
});
