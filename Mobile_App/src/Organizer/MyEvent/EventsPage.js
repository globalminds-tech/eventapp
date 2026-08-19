import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, StyleSheet, Modal, Alert, ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import {
  Plus, Search, Eye, Pencil, Trash2, X, AlertTriangle, CheckCircle,
  Calendar, Clock, Users, MapPin, Ticket, User, MoreVertical
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getEventsshow, deleteEvent, getEventFullDetails } from "@Services/api";

const formatDate = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = h % 12 || 12;
  return `${hour}:${m} ${h >= 12 ? "PM" : "AM"}`;
};

// --- Status Badge -------------------------------------------------------------
function StatusBadge({ status }) {
  const colors = {
    APPROVED: { bg: "#dcfce7", text: "#15803d" },
    PENDING: { bg: "#fef3c7", text: "#d97706" },
    REJECTED: { bg: "#fee2e2", text: "#b91c1c" },
  };
  const c = colors[status] || { bg: "#f1f5f9", text: "#64748b" };
  return (
    <View style={[s.statusBadge, { backgroundColor: c.bg }]}>
      <Text style={[s.statusText, { color: c.text }]}>{status}</Text>
    </View>
  );
}

// --- Event Card ---------------------------------------------------------------
function EventCard({ event, onView, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const e = event;
  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.cardHeader}>
        <Text style={s.eventName} numberOfLines={2}>{e.event_name}</Text>
        <TouchableOpacity onPress={() => setMenuOpen(true)} style={s.menuBtn}>
          <MoreVertical size={22} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* Meta Grid */}
      <View style={s.metaGrid}>
        <View style={s.metaItem}>
          <User size={12} color="#0284c7" />
          <Text style={s.metaLabel}>Created By</Text>
          <Text style={s.metaVal}>{e.created_by || "-"}</Text>
        </View>
        <View style={s.metaItem}>
          <Calendar size={12} color="#d97706" />
          <Text style={s.metaLabel}>Start</Text>
          <Text style={s.metaVal}>{formatDate(e.start_date)}</Text>
        </View>
        <View style={s.metaItem}>
          <Calendar size={12} color="#ef4444" />
          <Text style={s.metaLabel}>End</Text>
          <Text style={s.metaVal}>{formatDate(e.end_date)}</Text>
        </View>
        <View style={s.metaItem}>
          <Clock size={12} color="#7c3aed" />
          <Text style={s.metaLabel}>Time</Text>
          <Text style={s.metaVal}>{formatTime(e.start_time)}</Text>
        </View>
        <View style={s.metaItem}>
          <Ticket size={12} color="#db2777" />
          <Text style={s.metaLabel}>Pass Fee</Text>
          <Text style={s.metaVal}>{e.charge_type || "--"}</Text>
        </View>
        <View style={s.metaItem}>
          <Users size={12} color="#0d9488" />
          <Text style={s.metaLabel}>Capacity</Text>
          <Text style={s.metaVal}>{e.capacity}</Text>
        </View>
      </View>

      {/* Location */}
      {e.venue ? (
        <View style={s.locationRow}>
          <MapPin size={14} color="#0284c7" />
          <Text style={s.locationText} numberOfLines={1}>{e.venue}, {e.address}</Text>
        </View>
      ) : null}

      {/* Status */}
      <View style={[s.cardFooter]}>
        <StatusBadge status={e.status} />
        <View style={s.cardActions}>
          <TouchableOpacity style={s.actionBtn} onPress={() => onView(e)}>
            <Eye size={16} color="#0284c7" />
          </TouchableOpacity>
          {e.status !== "APPROVED" && (
            <TouchableOpacity style={[s.actionBtn, s.editBtn]} onPress={() => onEdit(e)}>
              <Pencil size={16} color="#d97706" />
            </TouchableOpacity>
          )}
          {e.status !== "APPROVED" && (
            <TouchableOpacity style={[s.actionBtn, s.deleteBtn]} onPress={() => onDelete(e.id)}>
              <Trash2 size={16} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Context Menu Modal */}
      <Modal visible={menuOpen} transparent animationType="fade">
        <TouchableOpacity style={s.menuOverlay} activeOpacity={1} onPress={() => setMenuOpen(false)}>
          <View style={s.menuCard}>
            <TouchableOpacity style={s.menuItem} onPress={() => { setMenuOpen(false); onView(e); }}>
              <Eye size={16} color="#0284c7" />
              <Text style={[s.menuItemText, { color: "#0284c7" }]}>View Details</Text>
            </TouchableOpacity>
            {e.status !== "APPROVED" && (
              <TouchableOpacity style={s.menuItem} onPress={() => { setMenuOpen(false); onEdit(e); }}>
                <Pencil size={16} color="#d97706" />
                <Text style={[s.menuItemText, { color: "#d97706" }]}>Edit Event</Text>
              </TouchableOpacity>
            )}
            {e.status !== "APPROVED" && (
              <TouchableOpacity style={s.menuItem} onPress={() => { setMenuOpen(false); onDelete(e.id); }}>
                <Trash2 size={16} color="#ef4444" />
                <Text style={[s.menuItemText, { color: "#ef4444" }]}>Delete Event</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// --- Main Events Page ---------------------------------------------------------
export default function EventsPage({ navigation }) {
  const Redexorganizer = useSelector((state) => state.user);
  const [organizerId, setOrganizerId] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const getOrgId = async () => {
      const id = Redexorganizer?.id || (await AsyncStorage.getItem("userId"));
      setOrganizerId(id);
    };
    getOrgId();
  }, [Redexorganizer]);

  useEffect(() => {
    if (organizerId) fetchEvents();
  }, [organizerId]);

  const fetchEvents = async () => {
    if (!organizerId) return;
    setLoading(true);
    try {
      const data = await getEventsshow(organizerId);
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchEvents error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (event) => {
    setLoadingDetail(true);
    try {
      const fullData = await getEventFullDetails(event.id);
      if (fullData && navigation) {
        navigation.navigate("ViewEventDetails", { eventData: fullData, isView: true });
      }
    } catch (err) {
      Alert.alert("Error", "Failed to load event details.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleEdit = async (event) => {
    setLoadingDetail(true);
    try {
      const fullData = await getEventFullDetails(event.id);
      if (fullData && navigation) {
        navigation.navigate("CreateEvent", { editData: fullData, isView: false });
      }
    } catch (err) {
      Alert.alert("Error", "Failed to load event data.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDelete = (id) => setEventToDelete(id);

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
      await deleteEvent(eventToDelete);
      setEventToDelete(null);
      setShowSuccess(true);
      fetchEvents();
      setTimeout(() => setShowSuccess(false), 3000);
    } catch {
      Alert.alert("Error", "Failed to delete event.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = events.filter(
    (e) =>
      (e.event_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.venue || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>My Events</Text>
          <Text style={s.headerSub}>Manage and track your organized events</Text>
        </View>
        <TouchableOpacity
          style={s.createBtn}
          onPress={() => navigation?.navigate("CreateEvent", { editData: null, isView: false })}
        >
          <Plus size={18} color="#fff" />
          <Text style={s.createBtnText}>Create Event</Text>
        </TouchableOpacity>
      </View>

      {/* Loading detail indicator */}
      {loadingDetail && (
        <View style={s.overlayLoading}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff", marginTop: 8, fontWeight: "bold" }}>Loading...</Text>
        </View>
      )}

      {/* Search */}
      <View style={s.searchContainer}>
        <Search size={18} color="#94a3b8" />
        <TextInput
          style={s.searchInput}
          placeholder="Search by event name or venue..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={(v) => { setSearch(v); setPage(1); }}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <X size={16} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Count */}
      <Text style={s.countText}>{filtered.length} event(s) found</Text>

      {/* List */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      ) : (
        <FlatList
          data={paged}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              <Text style={s.emptyTitle}>No events found</Text>
              <Text style={s.emptySubText}>
                {search ? `No results for "${search}". Try another search.` : 'Tap "Create Event" to get started.'}
              </Text>
            </View>
          }
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={s.pagination}>
          <TouchableOpacity
            disabled={page === 1}
            onPress={() => setPage((p) => Math.max(1, p - 1))}
            style={s.pageBtn}
          >
            <Text style={[s.pageBtnText, page === 1 && s.pageBtnDisabled]}>‹</Text>
          </TouchableOpacity>
          <Text style={s.pageText}>{page} / {totalPages}</Text>
          <TouchableOpacity
            disabled={page === totalPages}
            onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
            style={s.pageBtn}
          >
            <Text style={[s.pageBtnText, page === totalPages && s.pageBtnDisabled]}>›</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Delete Confirmation Modal */}
      <Modal visible={!!eventToDelete} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.deleteIconCircle}>
              <AlertTriangle size={32} color="#ef4444" />
            </View>
            <Text style={s.deleteTitle}>Delete Event</Text>
            <Text style={s.deleteBody}>
              Are you sure you want to delete this event? This action cannot be undone and will remove all associated bookings, layout, and vendor details.
            </Text>
            <View style={s.deleteActions}>
              <TouchableOpacity
                style={s.cancelBtn}
                disabled={isDeleting}
                onPress={() => setEventToDelete(null)}
              >
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.deleteConfirmBtn}
                disabled={isDeleting}
                onPress={confirmDelete}
              >
                <Text style={s.deleteConfirmText}>{isDeleting ? "Deleting..." : "Yes, Delete"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.successCard}>
            <View style={s.successIconCircle}>
              <CheckCircle size={40} color="#16a34a" />
            </View>
            <Text style={s.successTitle}>Deleted!</Text>
            <Text style={s.successBody}>Your event has been successfully removed from the platform.</Text>
            <TouchableOpacity style={s.successBtn} onPress={() => setShowSuccess(false)}>
              <Text style={s.successBtnText}>Great</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#0c4a6e" },
  headerSub: { fontSize: 12, color: "#64748b", marginTop: 2 },
  createBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#0369a1", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  createBtnText: { color: "#fff", fontSize: 13, fontWeight: "bold" },

  overlayLoading: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", zIndex: 999 },

  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", margin: 16, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0", gap: 8 },
  searchInput: { flex: 1, height: 44, color: "#0f172a", fontSize: 14 },
  countText: { fontSize: 12, color: "#64748b", marginHorizontal: 16, marginBottom: 8 },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { paddingVertical: 80, alignItems: "center", gap: 8, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#94a3b8" },
  emptySubText: { fontSize: 13, color: "#cbd5e1", textAlign: "center" },

  list: { paddingHorizontal: 16, paddingBottom: 80 },
  card: { backgroundColor: "#fff", borderRadius: 16, marginBottom: 16, padding: 16, borderWidth: 1, borderColor: "#e2e8f0", elevation: 3, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  eventName: { fontSize: 16, fontWeight: "bold", color: "#0f172a", flex: 1, marginRight: 10 },
  menuBtn: { padding: 4 },

  metaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  metaItem: { backgroundColor: "#f8fafc", borderRadius: 8, padding: 8, minWidth: "30%", flex: 1, borderWidth: 1, borderColor: "#f1f5f9", gap: 2 },
  metaLabel: { fontSize: 9, color: "#94a3b8", fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5 },
  metaVal: { fontSize: 12, fontWeight: "bold", color: "#0f172a" },

  locationRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  locationText: { fontSize: 12, color: "#334155", flex: 1 },

  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: "bold" },
  cardActions: { flexDirection: "row", gap: 6 },
  actionBtn: { padding: 8, backgroundColor: "#f0f9ff", borderRadius: 8, borderWidth: 1, borderColor: "#bae6fd" },
  editBtn: { backgroundColor: "#fffbeb", borderColor: "#fde68a" },
  deleteBtn: { backgroundColor: "#fff1f2", borderColor: "#fecdd3" },

  menuOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
  menuCard: { position: "absolute", top: "40%", right: 20, backgroundColor: "#fff", borderRadius: 12, padding: 8, minWidth: 180, elevation: 10, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  menuItemText: { fontSize: 14, fontWeight: "600" },

  pagination: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#e2e8f0", backgroundColor: "#fff" },
  pageBtn: { padding: 10 },
  pageBtnText: { fontSize: 20, fontWeight: "bold", color: "#0f172a" },
  pageBtnDisabled: { color: "#cbd5e1" },
  pageText: { fontSize: 14, fontWeight: "bold", color: "#0f172a", marginHorizontal: 20 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", borderRadius: 20, padding: 24, width: "100%", alignItems: "center" },
  deleteIconCircle: { width: 64, height: 64, backgroundColor: "#fee2e2", borderRadius: 32, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  deleteTitle: { fontSize: 20, fontWeight: "bold", color: "#0f172a", marginBottom: 8 },
  deleteBody: { fontSize: 13, color: "#64748b", textAlign: "center", marginBottom: 20, lineHeight: 20 },
  deleteActions: { flexDirection: "row", gap: 10, width: "100%" },
  cancelBtn: { flex: 1, backgroundColor: "#f1f5f9", borderRadius: 10, padding: 14, alignItems: "center" },
  cancelBtnText: { fontSize: 14, fontWeight: "bold", color: "#334155" },
  deleteConfirmBtn: { flex: 1, backgroundColor: "#ef4444", borderRadius: 10, padding: 14, alignItems: "center" },
  deleteConfirmText: { fontSize: 14, fontWeight: "bold", color: "#fff" },

  successCard: { backgroundColor: "#fff", borderRadius: 20, padding: 28, width: "100%", alignItems: "center" },
  successIconCircle: { width: 80, height: 80, backgroundColor: "#dcfce7", borderRadius: 40, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: "bold", color: "#0f172a", marginBottom: 8 },
  successBody: { fontSize: 14, color: "#64748b", textAlign: "center", marginBottom: 20 },
  successBtn: { backgroundColor: "#16a34a", borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14, width: "100%", alignItems: "center" },
  successBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
