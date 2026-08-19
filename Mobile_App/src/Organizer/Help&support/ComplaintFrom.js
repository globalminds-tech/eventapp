import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, ActivityIndicator, Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getComplaints, getApprovedEvents, createComplaint, deleteComplaint } from "@Services/api";
import {
  Trash2, Plus, Search, ArrowLeft, Star,
  AlertCircle, Eye, ChevronLeft, ChevronRight, ChevronDown
} from "lucide-react-native";

// -- Star Rating -----------------------------------------------
const StarRating = ({ rating, setRating }) => (
  <View style={styles.starRow}>
    {[1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity key={star} onPress={() => setRating && setRating(star)}>
        <Star
          size={22}
          color={star <= rating ? "#facc15" : "#d1d5db"}
          fill={star <= rating ? "#facc15" : "none"}
        />
      </TouchableOpacity>
    ))}
  </View>
);

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

const RATING_KEYS = ["infrastructure", "amenities", "experience", "venue", "transport", "convenience"];

export default function ComplaintPage() {
  const [showForm, setShowForm] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [viewingComplaint, setViewingComplaint] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [event, setEvent] = useState("");
  const [explanation, setExplanation] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [ratings, setRatings] = useState({
    infrastructure: 0, amenities: 0, experience: 0,
    venue: 0, transport: 0, convenience: 0,
  });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { loadComplaints(); loadEvents(); }, []);
  useEffect(() => { setCurrentPage(1); }, [search]);

  const loadComplaints = async () => {
    try { setComplaints((await getComplaints()) || []); }
    catch (err) { console.error(err); }
  };

  const loadEvents = async () => {
    try {
      const data = await getApprovedEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await deleteComplaint(deletingId);
      if (res.success) { showToast("Complaint deleted successfully"); loadComplaints(); }
      else showToast("Failed to delete", "error");
    } catch { showToast("Error deleting complaint", "error"); }
    finally { setDeletingId(null); }
  };

  const resetForm = () => {
    setEvent(""); setExplanation(""); setErrors({});
    setRatings({ infrastructure: 0, amenities: 0, experience: 0, venue: 0, transport: 0, convenience: 0 });
  };

  const submitComplaint = async () => {
    const newErrors = {};
    if (!event) newErrors.event = "Please select an event";
    if (!explanation.trim()) newErrors.explanation = "Please provide an explanation";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    setSubmitting(true);
    try {
      const payload = {
        event_id: event, explanation,
        infrastructure_rating: ratings.infrastructure,
        amenities_rating: ratings.amenities,
        overall_experience_rating: ratings.experience,
        venue_locations_rating: ratings.venue,
        transportation_rating: ratings.transport,
        convenience_rating: ratings.convenience,
      };
      const res = await createComplaint(payload);
      if (res.success) {
        showToast("Complaint submitted successfully");
        setShowForm(false); loadComplaints(); resetForm();
      } else showToast("Failed: " + (res.error || "Unknown error"), "error");
    } catch { showToast("Failed to submit complaint", "error"); }
    finally { setSubmitting(false); }
  };

  const filtered = complaints.filter(c =>
    (c.complaint_code || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.event_name || "").toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentComplaints = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // -- FORM VIEW ---------------------------------------------
  if (showForm) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.formHeader}>
            <TouchableOpacity onPress={() => setShowForm(false)} style={styles.backBtn}>
              <ArrowLeft size={20} color="#475569" />
            </TouchableOpacity>
            <Text style={styles.formTitle}>New Support Complaint</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.fieldLabel}>Event Reference <Text style={styles.required}>*</Text></Text>
            <EventDropdown events={events} value={event} onSelect={(val) => { setEvent(val); setErrors(p => ({ ...p, event: "" })); }} error={errors.event} />
            {errors.event && <Text style={styles.errorText}><AlertCircle size={12} color="#ef4444" /> {errors.event}</Text>}

            <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Detailed Explanation <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.textArea, errors.explanation && styles.inputError]}
              placeholder="Describe your issue in detail..."
              value={explanation}
              onChangeText={(v) => { setExplanation(v); setErrors(p => ({ ...p, explanation: "" })); }}
              multiline
              numberOfLines={5}
              placeholderTextColor="#9ca3af"
            />
            {errors.explanation && <Text style={styles.errorText}>{errors.explanation}</Text>}

            {/* Ratings */}
            <View style={styles.ratingsCard}>
              <Text style={styles.ratingsTitle}>Service Ratings</Text>
              {RATING_KEYS.map(key => (
                <View key={key} style={styles.ratingRow}>
                  <Text style={styles.ratingLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                  <StarRating rating={ratings[key]} setRating={(val) => setRatings(p => ({ ...p, [key]: val }))} />
                </View>
              ))}
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={submitComplaint} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.submitBtnText}>Submit Complaint</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        <Toast toast={toast} onClose={() => setToast(null)} />
      </SafeAreaView>
    );
  }

  // -- LIST VIEW ---------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.listHeader}>
          <Text style={styles.pageTitle}>Complaint Management</Text>
          <TouchableOpacity style={styles.raiseBtn} onPress={() => setShowForm(true)}>
            <Plus size={16} color="#fff" />
            <Text style={styles.raiseBtnText}>Raise Complaint</Text>
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

        {currentComplaints.length === 0 ? (
          <View style={styles.center}>
            <Search size={40} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No complaints found</Text>
            <Text style={styles.emptySubtitle}>Try a different search or raise a new complaint</Text>
          </View>
        ) : (
          currentComplaints.map(row => (
            <View key={row.id} style={styles.listCard}>
              <View style={styles.listCardTop}>
                <View style={styles.codeBadge}><Text style={styles.codeText}>{row.complaint_code}</Text></View>
                <View style={[styles.statusBadge, row.status === "Active" ? styles.statusActive : styles.statusInactive]}>
                  <Text style={[styles.statusText, row.status === "Active" ? styles.statusActiveText : styles.statusInactiveText]}>{row.status}</Text>
                </View>
              </View>
              <Text style={styles.listCardEvent} numberOfLines={1}>{row.event_name}</Text>
              <Text style={styles.listCardDate}>{row.created_on}</Text>
              <View style={styles.listCardActions}>
                <TouchableOpacity style={styles.iconBtnBlue} onPress={() => setViewingComplaint(row)}>
                  <Eye size={16} color="#2563eb" />
                  <Text style={styles.iconBtnBlueText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtnRed} onPress={() => setDeletingId(row.id)}>
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

      {/* View Modal */}
      <Modal visible={!!viewingComplaint} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.viewModal}>
            <View style={styles.viewModalHeader}>
              <View>
                <Text style={styles.viewModalTitle}>Complaint Details</Text>
                <Text style={styles.viewModalCode}>{viewingComplaint?.complaint_code}</Text>
              </View>
              <TouchableOpacity onPress={() => setViewingComplaint(null)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseBtnText}>?</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.viewModalBody} keyboardShouldPersistTaps="handled">
              {viewingComplaint && (
                <>
                  <Text style={styles.viewLabel}>EVENT NAME</Text>
                  <Text style={styles.viewValue}>{viewingComplaint.event_name}</Text>
                  <Text style={[styles.viewLabel, { marginTop: 16 }]}>EXPLANATION</Text>
                  <View style={styles.explanationBox}>
                    <Text style={styles.explanationText}>"{viewingComplaint.explanation}"</Text>
                  </View>
                  <View style={styles.ratingsViewCard}>
                    <Text style={styles.ratingsTitle}>Ratings</Text>
                    {[
                      { label: "Infrastructure", val: viewingComplaint.infrastructure_rating },
                      { label: "Amenities",      val: viewingComplaint.amenities_rating },
                      { label: "Experience",     val: viewingComplaint.overall_experience_rating },
                      { label: "Venue",          val: viewingComplaint.venue_locations_rating },
                      { label: "Transport",      val: viewingComplaint.transportation_rating },
                      { label: "Convenience",    val: viewingComplaint.convenience_rating },
                    ].map(item => (
                      <View key={item.label} style={styles.ratingRow}>
                        <Text style={styles.ratingLabel}>{item.label}</Text>
                        <StarRating rating={item.val} />
                      </View>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>
            <TouchableOpacity style={styles.closeViewBtn} onPress={() => setViewingComplaint(null)}>
              <Text style={styles.closeViewBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal visible={!!deletingId} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <View style={styles.confirmIcon}><AlertCircle size={32} color="#ef4444" /></View>
            <Text style={styles.confirmTitle}>Delete Complaint?</Text>
            <Text style={styles.confirmText}>This action cannot be undone. Are you sure?</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDeletingId(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </SafeAreaView>
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
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#94a3b8" },
  emptySubtitle: { fontSize: 13, color: "#94a3b8", textAlign: "center" },
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
  ratingsCard: { backgroundColor: "#f0f9ff", borderRadius: 12, borderWidth: 1, borderColor: "#bae6fd", padding: 16, marginTop: 20 },
  ratingsViewCard: { backgroundColor: "#f0f9ff", borderRadius: 12, borderWidth: 1, borderColor: "#bae6fd", padding: 16, marginTop: 16 },
  ratingsTitle: { fontSize: 11, fontWeight: "bold", color: "#0284c7", textTransform: "uppercase", textAlign: "center", marginBottom: 12 },
  ratingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", padding: 12, borderRadius: 10, marginBottom: 8 },
  ratingLabel: { fontSize: 13, fontWeight: "600", color: "#475569", textTransform: "capitalize" },
  starRow: { flexDirection: "row", gap: 4 },
  formActions: { flexDirection: "row", gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, paddingVertical: 14, backgroundColor: "#f1f5f9", borderRadius: 12, alignItems: "center" },
  cancelBtnText: { color: "#475569", fontWeight: "bold" },
  submitBtn: { flex: 1, paddingVertical: 14, backgroundColor: "#0284c7", borderRadius: 12, alignItems: "center" },
  submitBtnText: { color: "#fff", fontWeight: "bold" },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  viewModal: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "85%" },
  viewModalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "#f1f5f9", backgroundColor: "#f8fafc", borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  viewModalTitle: { fontSize: 18, fontWeight: "bold", color: "#0f172a" },
  viewModalCode: { fontSize: 12, color: "#2563eb", fontFamily: "monospace", marginTop: 2 },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" },
  modalCloseBtnText: { color: "#64748b", fontWeight: "bold" },
  viewModalBody: { padding: 20 },
  viewLabel: { fontSize: 10, fontWeight: "bold", color: "#94a3b8", textTransform: "uppercase", marginBottom: 4 },
  viewValue: { fontSize: 18, fontWeight: "bold", color: "#0f172a" },
  explanationBox: { backgroundColor: "#f8fafc", borderRadius: 10, padding: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  explanationText: { fontSize: 14, color: "#475569", fontStyle: "italic", lineHeight: 22 },
  closeViewBtn: { margin: 20, backgroundColor: "#0f172a", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  closeViewBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  confirmModal: { backgroundColor: "#fff", margin: 24, borderRadius: 20, padding: 24, alignItems: "center" },
  confirmIcon: { width: 64, height: 64, backgroundColor: "#fef2f2", borderRadius: 32, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  confirmTitle: { fontSize: 18, fontWeight: "bold", color: "#0f172a", marginBottom: 8 },
  confirmText: { fontSize: 13, color: "#64748b", textAlign: "center", marginBottom: 24 },
  confirmActions: { flexDirection: "row", gap: 12, width: "100%" },
  deleteBtn: { flex: 1, paddingVertical: 14, backgroundColor: "#ef4444", borderRadius: 12, alignItems: "center" },
  deleteBtnText: { color: "#fff", fontWeight: "bold" },
  toast: { position: "absolute", top: 40, left: 16, right: 16, flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 12, zIndex: 9999 },
  toastSuccess: { backgroundColor: "#059669" },
  toastError: { backgroundColor: "#e11d48" },
  toastText: { color: "#fff", fontWeight: "bold", flex: 1 },
});
