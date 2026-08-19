import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getFeedbacks, createFeedback, updateFeedback, deleteFeedback, getApprovedEvents
} from "@Services/api";
import {
  Plus, Search, ArrowLeft, Trash2, Edit, AlertCircle, ChevronLeft, ChevronRight, ChevronDown
} from "lucide-react-native";

// -- HELPER: format TIMESTAMP or DATE ? "DD/MM/YYYY" ------------------------
const formatDate = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d)) return val;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

// -- Event Dropdown --------------------------------------------
const EventDropdown = ({ events, value, onSelect, error }) => {
  const [open, setOpen] = useState(false);
  const selected = events.find(e => String(e.id) === String(value));
  return (
    <View style={styles.dropdownWrapper}>
      <TouchableOpacity
        style={[styles.dropdownTrigger, error && styles.inputError]}
        onPress={() => setOpen(!open)}
      >
        <Text style={[styles.dropdownTriggerText, !selected && { color: "#94a3b8" }]}>
          {selected ? selected.event_name : "Select Target Event"}
        </Text>
        <ChevronDown size={18} color="#6b7280" />
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdownList}>
          <ScrollView style={{ maxHeight: 200 }} keyboardShouldPersistTaps="handled">
            {events.map(ev => (
              <TouchableOpacity
                key={ev.id}
                style={styles.dropdownItem}
                onPress={() => { onSelect(String(ev.id)); setOpen(false); }}
              >
                <Text style={[styles.dropdownItemText, String(ev.id) === String(value) && { color: "#2563eb", fontWeight: "bold" }]}>
                  {ev.event_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

// -- Toast -----------------------------------------------------
const Toast = ({ toast, onClose }) => {
  if (!toast) return null;
  return (
    <View style={[styles.toast, toast.type === "success" ? styles.toastSuccess : styles.toastError]}>
      <AlertCircle size={18} color="#fff" />
      <Text style={styles.toastText}>{toast.message}</Text>
      <TouchableOpacity onPress={onClose}><Text style={{ color: "#fff" }}>?</Text></TouchableOpacity>
    </View>
  );
};

export default function FeedbackModule() {
  const [page, setPage] = useState("list");
  const [editId, setEditId] = useState(null);

  // delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // list
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loadingList, setLoadingList] = useState(false);

  // form
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [explanation, setExplanation] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchList = useCallback(async () => {
    setLoadingList(true);
    try {
      const data = await getFeedbacks();
      setRows(data || []);
    } catch {
      showToast("Failed to load feedbacks", "error");
    } finally {
      setLoadingList(false);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      const data = await getApprovedEvents();
      setEvents(data || []);
    } catch {
      showToast("Failed to load events", "error");
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  const openNew = async () => {
    setEditId(null); setEventId(""); setExplanation(""); setFormError("");
    await fetchEvents();
    setPage("form");
  };

  const openEdit = async (row) => {
    setEditId(row.id); setEventId(String(row.event_id)); setExplanation(row.explanation || ""); setFormError("");
    await fetchEvents();
    setPage("form");
  };

  const handleSave = async () => {
    if (!eventId) { setFormError("Event is required."); return; }
    setFormError(""); setSaving(true);
    const selectedEvent = events.find(e => String(e.id) === String(eventId));
    const body = {
      event_id: eventId,
      event_name: selectedEvent ? selectedEvent.event_name : "",
      explanation
    };
    try {
      if (editId) await updateFeedback(editId, body);
      else await createFeedback(body);
      showToast(editId ? "Feedback updated!" : "Feedback saved!");
      await fetchList();
      setPage("list");
    } catch {
      showToast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (id) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await deleteFeedback(itemToDelete);
      showToast("Deleted.");
      await fetchList();
      setDeleteModalOpen(false);
      setItemToDelete(null);
      if (page === "form") setPage("list");
    } catch {
      showToast("Delete failed", "error");
    }
  };

  const filtered = rows.filter(r =>
    !search ||
    r.feedback_code?.toLowerCase().includes(search.toLowerCase()) ||
    r.event_name?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // -- RENDER LIST -----------------------------------------------------------
  const renderList = () => (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.listHeader}>
          <Text style={styles.pageTitle}>Feedback Management</Text>
          <TouchableOpacity style={styles.raiseBtn} onPress={openNew}>
            <Plus size={16} color="#fff" />
            <Text style={styles.raiseBtnText}>Add Feedback</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Search size={16} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by code or event..."
            value={search}
            onChangeText={(v) => { setSearch(v); setCurrentPage(1); }}
            placeholderTextColor="#94a3b8"
          />
        </View>

        {loadingList ? (
          <View style={styles.center}><ActivityIndicator size="large" color="#0284c7" /></View>
        ) : paged.length === 0 ? (
          <View style={styles.center}>
            <Search size={40} color="#e2e8f0" />
            <Text style={styles.emptyTitle}>No feedback records found</Text>
          </View>
        ) : (
          paged.map(row => (
            <View key={row.id} style={styles.listCard}>
              <View style={styles.listCardTop}>
                <View style={styles.codeBadge}><Text style={styles.codeText}>{row.feedback_code}</Text></View>
                <View style={[styles.statusBadge, row.status === "Active" ? styles.statusActive : styles.statusInactive]}>
                  <Text style={[styles.statusText, row.status === "Active" ? styles.statusActiveText : styles.statusInactiveText]}>{row.status}</Text>
                </View>
              </View>
              <Text style={styles.listCardEvent} numberOfLines={1}>{row.event_name}</Text>
              <Text style={styles.listCardDate}>Created: {formatDate(row.created_at)}</Text>
              <View style={styles.listCardActions}>
                <TouchableOpacity style={styles.iconBtnBlue} onPress={() => openEdit(row)}>
                  <Edit size={16} color="#2563eb" />
                  <Text style={styles.iconBtnBlueText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtnRed} onPress={() => openDeleteModal(row.id)}>
                  <Trash2 size={16} color="#dc2626" />
                  <Text style={styles.iconBtnRedText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {totalPages > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]} disabled={currentPage === 1} onPress={() => setCurrentPage(p => Math.max(1, p - 1))}>
              <ChevronLeft size={20} color={currentPage === 1 ? "#cbd5e1" : "#475569"} />
            </TouchableOpacity>
            <Text style={styles.pageText}>Page {currentPage} of {totalPages}</Text>
            <TouchableOpacity style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]} disabled={currentPage === totalPages} onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
              <ChevronRight size={20} color={currentPage === totalPages ? "#cbd5e1" : "#475569"} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );

  // -- RENDER FORM -----------------------------------------------------------
  const renderForm = () => (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.formHeader}>
          <TouchableOpacity onPress={() => setPage("list")} style={styles.backBtn}>
            <ArrowLeft size={20} color="#475569" />
          </TouchableOpacity>
          <Text style={styles.formTitle}>{editId ? "Edit Feedback" : "New Feedback"}</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>Event Reference <Text style={styles.required}>*</Text></Text>
          <EventDropdown events={events} value={eventId} onSelect={(val) => { setEventId(val); setFormError(""); }} error={formError} />
          {formError ? <Text style={styles.errorText}><AlertCircle size={12} color="#ef4444" /> {formError}</Text> : null}

          <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Detailed Explanation</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Tell us about your experience..."
            value={explanation}
            onChangeText={setExplanation}
            multiline
            numberOfLines={5}
            placeholderTextColor="#9ca3af"
          />

          <View style={styles.formActions}>
            {editId ? (
              <TouchableOpacity style={styles.deleteBtnIcon} onPress={() => openDeleteModal(editId)}>
                <Trash2 size={20} color="#ef4444" />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setPage("list")}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.submitBtnText}>{editId ? "Update" : "Submit"}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  return (
    <View style={{ flex: 1 }}>
      {page === "list" ? renderList() : renderForm()}

      {/* Delete Confirm Modal */}
      <Modal visible={deleteModalOpen} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <View style={styles.confirmIcon}><Trash2 size={32} color="#ef4444" /></View>
            <Text style={styles.confirmTitle}>Delete Feedback?</Text>
            <Text style={styles.confirmText}>Are you sure you want to delete this feedback? This action cannot be undone.</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDeleteModalOpen(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteConfirm}>
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 22, fontWeight: "bold", color: "#0c4a6e", flex: 1 },
  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  raiseBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#0284c7", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  raiseBtnText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 12, marginBottom: 16, gap: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: "#0f172a" },
  center: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "bold", color: "#94a3b8" },
  listCard: { backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#e2e8f0", padding: 14, marginBottom: 12 },
  listCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  codeBadge: { backgroundColor: "#eff6ff", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  codeText: { color: "#2563eb", fontWeight: "bold", fontSize: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusActive: { backgroundColor: "#d1fae5" },
  statusInactive: { backgroundColor: "#fee2e2" },
  statusText: { fontSize: 10, fontWeight: "bold", textTransform: "uppercase" },
  statusActiveText: { color: "#065f46" },
  statusInactiveText: { color: "#991b1b" },
  listCardEvent: { fontSize: 15, fontWeight: "600", color: "#1e293b", marginBottom: 4 },
  listCardDate: { fontSize: 12, color: "#64748b", marginBottom: 12 },
  listCardActions: { flexDirection: "row", gap: 8 },
  iconBtnBlue: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#eff6ff", paddingVertical: 8, borderRadius: 8 },
  iconBtnBlueText: { color: "#2563eb", fontWeight: "bold", fontSize: 13 },
  iconBtnRed: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#fef2f2", paddingVertical: 8, borderRadius: 8 },
  iconBtnRedText: { color: "#dc2626", fontWeight: "bold", fontSize: 13 },
  pagination: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 8 },
  pageBtn: { width: 40, height: 40, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, alignItems: "center", justifyContent: "center" },
  pageBtnDisabled: { backgroundColor: "#f8fafc" },
  pageText: { fontSize: 14, fontWeight: "600", color: "#475569" },
  // Form styles
  formHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  backBtn: { padding: 8, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10 },
  formTitle: { fontSize: 20, fontWeight: "bold", color: "#1e293b" },
  formCard: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", padding: 20 },
  fieldLabel: { fontSize: 12, fontWeight: "bold", color: "#475569", marginBottom: 8 },
  required: { color: "#ef4444" },
  textArea: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 14, fontSize: 14, color: "#0f172a", minHeight: 120, textAlignVertical: "top" },
  inputError: { borderColor: "#ef4444" },
  errorText: { color: "#ef4444", fontSize: 11, marginTop: 4, fontWeight: "bold" },
  dropdownWrapper: { position: "relative", zIndex: 10 },
  dropdownTrigger: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 14 },
  dropdownTriggerText: { fontSize: 14, color: "#0f172a", fontWeight: "500" },
  dropdownList: { position: "absolute", top: "105%", left: 0, right: 0, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, elevation: 8, zIndex: 999 },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  dropdownItemText: { fontSize: 14, color: "#334155" },
  formActions: { flexDirection: "row", gap: 12, marginTop: 24, alignItems: "center" },
  deleteBtnIcon: { padding: 14, backgroundColor: "#fef2f2", borderRadius: 12, alignItems: "center" },
  cancelBtn: { flex: 1, paddingVertical: 14, backgroundColor: "#f1f5f9", borderRadius: 12, alignItems: "center" },
  cancelBtnText: { color: "#475569", fontWeight: "bold" },
  submitBtn: { flex: 1, paddingVertical: 14, backgroundColor: "#0284c7", borderRadius: 12, alignItems: "center" },
  submitBtnText: { color: "#fff", fontWeight: "bold" },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  confirmModal: { backgroundColor: "#fff", borderRadius: 20, padding: 24, alignItems: "center" },
  confirmIcon: { width: 64, height: 64, backgroundColor: "#fef2f2", borderRadius: 32, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  confirmTitle: { fontSize: 18, fontWeight: "bold", color: "#0f172a", marginBottom: 8 },
  confirmText: { fontSize: 13, color: "#64748b", textAlign: "center", marginBottom: 24 },
  confirmActions: { flexDirection: "row", gap: 12, width: "100%" },
  deleteBtn: { flex: 1, paddingVertical: 14, backgroundColor: "#ef4444", borderRadius: 12, alignItems: "center" },
  deleteBtnText: { color: "#fff", fontWeight: "bold" },
  toast: { position: "absolute", bottom: 40, left: 16, right: 16, flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 12, zIndex: 9999 },
  toastSuccess: { backgroundColor: "#059669" },
  toastError: { backgroundColor: "#e11d48" },
  toastText: { color: "#fff", fontWeight: "bold", flex: 1 },
});
