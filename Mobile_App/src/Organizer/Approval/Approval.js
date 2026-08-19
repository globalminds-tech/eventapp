import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, ActivityIndicator, Image, Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getEventsshow, getBookingsByEvent,
  getapprovalBookingById, updateBookingStatus,
} from "@Services/api";
import {
  X, Eye, ChevronLeft, ChevronRight, ArrowLeft,
  Calendar, Clock, MapPin, Search, AlertTriangle,
  CheckCircle, AlertCircle,
} from "lucide-react-native";

// --- Status badge style helper ---
const getStatusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case "approved": return { bg: "#d1fae5", text: "#065f46", dot: "#059669" };
    case "rejected": return { bg: "#fee2e2", text: "#991b1b", dot: "#dc2626" };
    default:         return { bg: "#fef3c7", text: "#92400e", dot: "#d97706" };
  }
};

const AdminApproval = () => {
  const [items, setItems] = useState([]);
  const [viewMode, setViewMode] = useState("events");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const reduxUser = useSelector((state) => state.user);
  const [storedUser, setStoredUser] = useState({});

  useEffect(() => {
    const load = async () => {
      const id = await AsyncStorage.getItem("userId");
      const name = await AsyncStorage.getItem("userName");
      setStoredUser({ id, name });
    };
    load();
  }, []);

  const organizer = reduxUser?.id ? reduxUser : storedUser;

  useEffect(() => {
    if (viewMode === "events" && organizer?.id) fetchEvents();
  }, [viewMode, organizer?.id]);

  useEffect(() => { setCurrentPage(1); }, [search]);

  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const fetchEvents = async () => {
    if (!organizer?.id) return;
    try {
      setLoading(true);
      const data = await getEventsshow(organizer.id);
      setItems(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleViewRequestedStalls = async (event) => {
    try {
      setLoading(true);
      const data = await getBookingsByEvent(event.id);
      setSelectedEvent(event);
      setItems(data || []);
      setViewMode("bookings");
      setSearch(""); setCurrentPage(1);
    } catch (err) {
      Alert.alert("Error", "Failed to fetch requested stalls");
    } finally { setLoading(false); }
  };

  const handleBackToEvents = () => {
    setViewMode("events"); setSelectedEvent(null);
    setSearch(""); setCurrentPage(1);
  };

  const handleViewBooking = async (id) => {
    try {
      setLoading(true);
      const data = await getapprovalBookingById(id);
      setSelectedBooking(data);
    } catch (err) {
      Alert.alert("Error", "Failed to fetch details");
    } finally { setLoading(false); }
  };

  const handleStatusChange = (id, newStatus) => {
    setPendingUpdate({ id, newStatus });
    setShowConfirmModal(true);
  };

  const confirmStatusUpdate = async () => {
    if (!pendingUpdate) return;
    const { id, newStatus } = pendingUpdate;
    try {
      setIsUpdating(true);
      await updateBookingStatus(id, newStatus);
      setItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
      if (selectedBooking?.id === id) setSelectedBooking({ ...selectedBooking, status: newStatus });
      showNotification(`Status updated to ${newStatus}!`, "success");
      setShowConfirmModal(false); setPendingUpdate(null);
    } catch (err) {
      showNotification("Status update failed", "error");
    } finally { setIsUpdating(false); }
  };

  const filteredItems = items.filter((item) => {
    const s = search.toLowerCase();
    if (viewMode === "events") {
      return (item.event_name || "").toLowerCase().includes(s) || (item.venue || "").toLowerCase().includes(s);
    }
    return `${item.first_name || ""} ${item.last_name || ""}`.toLowerCase().includes(s) ||
      (item.mobile || "").includes(s) || (item.company_name || "").toLowerCase().includes(s);
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <SafeAreaView style={styles.container}>
      {/* Toast */}
      {toast.show && (
        <View style={[styles.toast, toast.type === "success" ? styles.toastSuccess : styles.toastError]}>
          {toast.type === "success"
            ? <CheckCircle size={18} color="#fff" />
            : <AlertCircle size={18} color="#fff" />}
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {viewMode === "bookings" && (
              <TouchableOpacity onPress={handleBackToEvents} style={styles.backBtn}>
                <ArrowLeft size={22} color="#475569" />
              </TouchableOpacity>
            )}
            <View>
              <Text style={styles.pageTitle}>
                {viewMode === "events" ? "Select Event" : selectedEvent?.event_name}
              </Text>
              <Text style={styles.pageSubtitle}>
                {viewMode === "events" ? "Choose event to manage approvals" : "Stall Booking Requests"}
              </Text>
            </View>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{filteredItems.length}</Text>
            <Text style={styles.countBadgeLabel}>{viewMode === "events" ? "Events" : "Bookings"}</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Search size={16} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${viewMode}...`}
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#94a3b8"
          />
          {search !== "" && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <X size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* List */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#0284c7" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : currentItems.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyEmoji}>??</Text>
            <Text style={styles.emptyTitle}>No {viewMode} found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search</Text>
          </View>
        ) : (
          currentItems.map((item) => {
            const ss = getStatusStyle(item.status);
            return viewMode === "events" ? (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{item.event_name}</Text>
                  <View style={styles.infoRow}>
                    <Calendar size={14} color="#0284c7" />
                    <Text style={styles.infoText}>{item.start_date}</Text>
                    <Clock size={14} color="#0284c7" style={{ marginLeft: 12 }} />
                    <Text style={styles.infoText}>{item.start_time}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <MapPin size={14} color="#0284c7" />
                    <Text style={styles.infoText}>{item.venue}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.viewStallsBtn}
                  onPress={() => handleViewRequestedStalls(item)}
                >
                  <Eye size={16} color="#0284c7" />
                  <Text style={styles.viewStallsBtnText}>View Stall Requests</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{item.first_name} {item.last_name}</Text>
                  <Text style={styles.cardSubtitle}>{item.company_name}</Text>
                  <Text style={styles.cardMobile}>{item.mobile}</Text>
                </View>
                <View style={styles.bookingCardFooter}>
                  <View style={[styles.statusPill, { backgroundColor: ss.bg }]}>
                    <View style={[styles.statusDot, { backgroundColor: ss.dot }]} />
                    <Text style={[styles.statusPillText, { color: ss.text }]}>
                      {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.statusActions}>
                    {["pending", "approved", "rejected"].map(s => {
                      const st = getStatusStyle(s);
                      const isActive = item.status === s;
                      return (
                        <TouchableOpacity
                          key={s}
                          onPress={() => handleStatusChange(item.id, s)}
                          style={[styles.statusBtn, { backgroundColor: isActive ? st.bg : "#f1f5f9" }]}
                        >
                          <Text style={[styles.statusBtnText, { color: isActive ? st.text : "#94a3b8" }]}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <TouchableOpacity
                    style={styles.viewDetailBtn}
                    onPress={() => handleViewBooking(item.id)}
                  >
                    <Eye size={14} color="#0284c7" />
                    <Text style={styles.viewDetailBtnText}>Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        {/* Pagination */}
        {totalPages > 1 && (
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
      </ScrollView>

      {/* Booking Detail Modal */}
      <Modal visible={!!selectedBooking} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.detailModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Booking Details</Text>
              <TouchableOpacity onPress={() => setSelectedBooking(null)}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
              {selectedBooking && (
                <>
                  {/* Section helper */}
                  {[
                    {
                      label: "Personal Information",
                      rows: [
                        ["Full Name", `${selectedBooking.first_name} ${selectedBooking.last_name}`],
                        ["Email", selectedBooking.email],
                        ["Mobile", selectedBooking.mobile],
                        ["Designation", selectedBooking.designation],
                      ]
                    },
                    {
                      label: "Company",
                      rows: [
                        ["Company", selectedBooking.company_name],
                        ["Products", selectedBooking.products],
                        ["Event", selectedBooking.eventName],
                      ]
                    },
                    {
                      label: "Address",
                      rows: [
                        ["Country", selectedBooking.country],
                        ["State", selectedBooking.state],
                        ["City", selectedBooking.city],
                        ["Pin Code", selectedBooking.pin_code],
                        ["Address", selectedBooking.address],
                      ]
                    },
                    {
                      label: "Requirements",
                      rows: [
                        ["Stall Area", selectedBooking.stall_area],
                        ["Message", selectedBooking.messages || "No message provided"],
                      ]
                    }
                  ].map(section => (
                    <View key={section.label} style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <View style={styles.sectionBar} />
                        <Text style={styles.sectionTitle}>{section.label}</Text>
                      </View>
                      {section.rows.map(([label, value]) => (
                        <View key={label} style={styles.detailRow}>
                          <Text style={styles.detailLabel}>{label}</Text>
                          <Text style={styles.detailValue}>{value}</Text>
                        </View>
                      ))}
                    </View>
                  ))}

                  {/* Approval Actions */}
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionBar} />
                      <Text style={styles.sectionTitle}>Manage Approval</Text>
                    </View>
                    <View style={styles.approvalActions}>
                      {[
                        { value: "pending",  label: "Pending",  icon: <Clock size={16} color="#d97706" /> },
                        { value: "approved", label: "Approve",  icon: <CheckCircle size={16} color="#059669" /> },
                        { value: "rejected", label: "Reject",   icon: <X size={16} color="#dc2626" /> },
                      ].map(opt => {
                        const st = getStatusStyle(opt.value);
                        const isActive = selectedBooking.status === opt.value;
                        return (
                          <TouchableOpacity
                            key={opt.value}
                            style={[styles.approvalBtn, { backgroundColor: isActive ? st.bg : "#f8fafc", borderColor: isActive ? st.dot : "#e2e8f0" }]}
                            onPress={() => handleStatusChange(selectedBooking.id, opt.value)}
                          >
                            {opt.icon}
                            <Text style={[styles.approvalBtnText, { color: isActive ? st.text : "#94a3b8" }]}>
                              {opt.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Visiting Card */}
                  {selectedBooking.visiting_card_url && (
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <View style={styles.sectionBar} />
                        <Text style={styles.sectionTitle}>Visiting Card</Text>
                      </View>
                      <Image
                        source={{ uri: selectedBooking.visiting_card_url }}
                        style={styles.visitingCard}
                        resizeMode="contain"
                      />
                    </View>
                  )}

                  <TouchableOpacity style={styles.closeModalBtn} onPress={() => setSelectedBooking(null)}>
                    <Text style={styles.closeModalBtnText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal visible={showConfirmModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <View style={styles.confirmIconWrapper}>
              <AlertTriangle size={32} color="#d97706" />
            </View>
            <Text style={styles.confirmTitle}>Confirm Status Change</Text>
            <Text style={styles.confirmText}>
              Change status to{" "}
              <Text style={styles.confirmBold}>{pendingUpdate?.newStatus?.toUpperCase()}</Text>?
              {"\n"}This will update the exhibitor's booking status.
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                disabled={isUpdating}
                onPress={() => { setShowConfirmModal(false); setPendingUpdate(null); }}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmOkBtn,
                  pendingUpdate?.newStatus === "approved" ? { backgroundColor: "#059669" }
                    : pendingUpdate?.newStatus === "rejected" ? { backgroundColor: "#dc2626" }
                      : { backgroundColor: "#d97706" }
                ]}
                disabled={isUpdating}
                onPress={confirmStatusUpdate}
              >
                {isUpdating
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.confirmOkText}>Yes, Update</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  toast: { position: "absolute", top: 40, left: 16, right: 16, flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 12, zIndex: 9999, gap: 10 },
  toastSuccess: { backgroundColor: "#059669" },
  toastError: { backgroundColor: "#e11d48" },
  toastText: { color: "#fff", fontWeight: "bold", fontSize: 14, flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  backBtn: { padding: 8, backgroundColor: "#fff", borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  pageTitle: { fontSize: 20, fontWeight: "bold", color: "#0f172a" },
  pageSubtitle: { fontSize: 12, color: "#64748b", marginTop: 2 },
  countBadge: { backgroundColor: "#e0f2fe", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, alignItems: "center" },
  countBadgeText: { fontSize: 20, fontWeight: "bold", color: "#0369a1" },
  countBadgeLabel: { fontSize: 10, color: "#0369a1", fontWeight: "600" },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 12, marginBottom: 16, gap: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: "#0f172a" },
  center: { alignItems: "center", paddingVertical: 48 },
  loadingText: { marginTop: 12, color: "#64748b", fontWeight: "500" },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#334155" },
  emptySubtitle: { fontSize: 13, color: "#94a3b8", marginTop: 4 },
  card: { backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 12, overflow: "hidden" },
  cardBody: { padding: 14 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#0f172a", marginBottom: 6 },
  cardSubtitle: { fontSize: 13, color: "#475569", fontWeight: "600" },
  cardMobile: { fontSize: 12, color: "#64748b", marginTop: 2 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  infoText: { fontSize: 13, color: "#475569" },
  viewStallsBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#e0f2fe", backgroundColor: "#f0f9ff" },
  viewStallsBtnText: { color: "#0284c7", fontWeight: "bold", fontSize: 14 },
  bookingCardFooter: { padding: 14, borderTopWidth: 1, borderTopColor: "#f1f5f9", gap: 10 },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: "flex-start" },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusPillText: { fontSize: 12, fontWeight: "bold" },
  statusActions: { flexDirection: "row", gap: 6 },
  statusBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  statusBtnText: { fontSize: 11, fontWeight: "bold" },
  viewDetailBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8, backgroundColor: "#eff6ff", borderRadius: 8 },
  viewDetailBtnText: { color: "#0284c7", fontWeight: "bold", fontSize: 12 },
  pagination: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 16, gap: 16 },
  pageBtn: { width: 40, height: 40, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, alignItems: "center", justifyContent: "center" },
  pageBtnDisabled: { backgroundColor: "#f8fafc" },
  pageText: { fontSize: 14, fontWeight: "600", color: "#475569" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  detailModal: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "90%", paddingBottom: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#0f172a" },
  modalBody: { padding: 20 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionBar: { width: 4, height: 16, backgroundColor: "#0284c7", borderRadius: 2 },
  sectionTitle: { fontSize: 11, fontWeight: "bold", color: "#0284c7", textTransform: "uppercase", letterSpacing: 1 },
  detailRow: { marginBottom: 10 },
  detailLabel: { fontSize: 10, fontWeight: "bold", color: "#94a3b8", textTransform: "uppercase", marginBottom: 2 },
  detailValue: { fontSize: 14, fontWeight: "600", color: "#0f172a" },
  approvalActions: { flexDirection: "row", gap: 8 },
  approvalBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 10, borderWidth: 1 },
  approvalBtnText: { fontSize: 12, fontWeight: "bold" },
  visitingCard: { width: "100%", height: 200, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  closeModalBtn: { backgroundColor: "#0f172a", paddingVertical: 14, borderRadius: 12, alignItems: "center", marginTop: 8 },
  closeModalBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  confirmModal: { backgroundColor: "#fff", margin: 24, borderRadius: 20, padding: 24, alignItems: "center" },
  confirmIconWrapper: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#fef3c7", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  confirmTitle: { fontSize: 18, fontWeight: "bold", color: "#0f172a", marginBottom: 8 },
  confirmText: { fontSize: 13, color: "#64748b", textAlign: "center", lineHeight: 20, marginBottom: 24 },
  confirmBold: { fontWeight: "bold", color: "#0f172a" },
  confirmActions: { flexDirection: "row", gap: 12, width: "100%" },
  confirmCancelBtn: { flex: 1, paddingVertical: 12, backgroundColor: "#f1f5f9", borderRadius: 12, alignItems: "center" },
  confirmCancelText: { fontWeight: "bold", color: "#475569" },
  confirmOkBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  confirmOkText: { color: "#fff", fontWeight: "bold" },
});

export default AdminApproval;
