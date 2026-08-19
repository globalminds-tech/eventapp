import React, { useEffect, useState } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, 
  ImageBackground, Alert, ActivityIndicator, Modal, RefreshControl 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { 
  User, Rocket, Calendar, Clock, Ticket, Users, MapPin, 
  MoreVertical, CheckCircle2, ShieldCheck, ShieldX, History, Trash2, Eye, LogOut 
} from "lucide-react-native";
import { getAllEvents, updateEventStatus, deleteEvent } from "@Services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SuperUserHome({ navigation }) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [confirmModal, setConfirmModal] = useState({ show: false, type: "", id: null, status: null });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await getAllEvents();
      setEvents(res.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace("Login");
  };

  const getStatusColor = (status) => {
    if (status === "APPROVED") return "#10b981"; // emerald-500
    if (status === "REJECTED") return "#f43f5e"; // rose-500
    return "#f59e0b"; // amber-500
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    const hour = h % 12 || 12;
    const ampm = h >= 12 ? "PM" : "AM";
    return `${hour}:${m} ${ampm}`;
  };

  const handleAction = (type, id, status = null) => {
    setOpenMenuId(null);
    if (type === "view") {
      navigation.navigate("EventDetail", { eventId: id });
    } else {
      setConfirmModal({ show: true, type, id, status });
    }
  };

  const executeAction = async () => {
    const { type, id, status } = confirmModal;
    setConfirmModal({ show: false, type: "", id: null, status: null });
    
    try {
      if (type === "status") {
        const res = await updateEventStatus(id, status);
        if (res?.success) {
          setToast({ show: true, message: `Event ${status} successfully`, type: "success" });
          fetchEvents();
        } else {
          setToast({ show: true, message: "Something went wrong", type: "error" });
        }
      } else if (type === "delete") {
        const res = await deleteEvent(id);
        if (res?.success || res?.message === "Event deleted successfully") {
          setToast({ show: true, message: "Event deleted successfully", type: "success" });
          fetchEvents();
        } else {
          setToast({ show: true, message: "Failed to delete event", type: "error" });
        }
      }
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: "Server error", type: "error" });
    }
  };

  useEffect(() => {
    if (toast?.show) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const renderEvent = ({ item }) => (
    <View style={s.card}>
      <ImageBackground 
        source={{ uri: item.banner_url || "https://via.placeholder.com/400" }} 
        style={s.cardImage} 
        imageStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
      >
        <View style={s.cardOverlay} />
        <View style={s.cardHeader}>
          <View style={s.statusBadge}>
            <Text style={[s.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
          </View>
          <TouchableOpacity 
            style={s.menuBtn}
            onPress={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
          >
            <MoreVertical size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={s.categoryText}>{item.category}</Text>
        <Text style={s.titleText} numberOfLines={2}>{item.event_name}</Text>
      </ImageBackground>

      <View style={s.cardBody}>
        <View style={s.infoRow}>
          <User size={16} color="#0ea5e9" />
          <View style={s.infoTextWrap}>
            <Text style={s.infoLabel}>Created By</Text>
            <Text style={s.infoValue} numberOfLines={1}>{item.created_by}</Text>
          </View>
        </View>
        
        <View style={s.infoGrid}>
          <View style={s.infoCol}>
            <Calendar size={14} color="#f59e0b" />
            <Text style={s.infoSmallValue}>{formatDate(item.start_date)}</Text>
          </View>
          <View style={s.infoCol}>
            <Clock size={14} color="#8b5cf6" />
            <Text style={s.infoSmallValue}>{formatTime(item.end_time)}</Text>
          </View>
          <View style={s.infoCol}>
            <Ticket size={14} color="#f43f5e" />
            <Text style={s.infoSmallValue}>{item.charge_type || "Free"}</Text>
          </View>
        </View>

        <View style={s.locationRow}>
          <MapPin size={16} color="#10b981" />
          <Text style={s.locationText} numberOfLines={1}>{item.venue}, {item.address}</Text>
        </View>
      </View>

      {openMenuId === item.id && (
        <View style={s.dropdownMenu}>
          <TouchableOpacity style={s.dropdownItem} onPress={() => handleAction("view", item.id)}>
            <Eye size={18} color="#0ea5e9" />
            <Text style={s.dropdownItemText}>View Details</Text>
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity style={s.dropdownItem} onPress={() => handleAction("status", item.id, "APPROVED")}>
            <ShieldCheck size={18} color="#10b981" />
            <Text style={s.dropdownItemText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.dropdownItem} onPress={() => handleAction("status", item.id, "REJECTED")}>
            <ShieldX size={18} color="#f43f5e" />
            <Text style={s.dropdownItemText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.dropdownItem} onPress={() => handleAction("status", item.id, "PENDING")}>
            <History size={18} color="#f59e0b" />
            <Text style={s.dropdownItemText}>Pending</Text>
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity style={s.dropdownItem} onPress={() => handleAction("delete", item.id)}>
            <Trash2 size={18} color="#ef4444" />
            <Text style={s.dropdownItemText}>Delete Event</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Event <Text style={s.headerTitleHighlight}>Showcase</Text></Text>
          <Text style={s.headerSub}>Manage and approve events</Text>
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {toast?.show && (
        <View style={[s.toast, toast.type === "success" ? s.toastSuccess : s.toastError]}>
          <Text style={s.toastText}>{toast.message}</Text>
        </View>
      )}

      {isLoading ? (
        <View style={s.loader}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderEvent}
          contentContainerStyle={s.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.emptyBox}>
              <Text style={s.emptyText}>No events found</Text>
            </View>
          }
        />
      )}

      <Modal visible={confirmModal.show} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>
              {confirmModal.type === "delete" ? "Delete Event?" : `Set to ${confirmModal.status}?`}
            </Text>
            <Text style={s.modalDesc}>
              {confirmModal.type === "delete" 
                ? "Are you sure you want to delete this event? This action cannot be undone."
                : `Are you sure you want to change the status to ${confirmModal.status}?`}
            </Text>
            <View style={s.modalRow}>
              <TouchableOpacity style={s.modalCancelBtn} onPress={() => setConfirmModal({ show: false, type: "", id: null, status: null })}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[s.modalConfirmBtn, confirmModal.type === "delete" || confirmModal.status === "REJECTED" ? { backgroundColor: "#ef4444" } : { backgroundColor: "#10b981" }]} 
                onPress={executeAction}
              >
                <Text style={s.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8fafc" },
  
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  headerTitle: { fontSize: 24, fontWeight: "300", color: "#0f172a" },
  headerTitleHighlight: { fontWeight: "bold", color: "#0ea5e9" },
  headerSub: { fontSize: 13, color: "#64748b", marginTop: 2 },
  logoutBtn: { padding: 10, backgroundColor: "#fee2e2", borderRadius: 12 },

  toast: { position: "absolute", top: 80, alignSelf: "center", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, zIndex: 100, elevation: 5 },
  toastSuccess: { backgroundColor: "#d1fae5" },
  toastError: { backgroundColor: "#ffe4e6" },
  toastText: { fontSize: 14, fontWeight: "bold", color: "#0f172a" },

  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  
  listContainer: { padding: 16, paddingBottom: 100 },
  
  card: { backgroundColor: "#fff", borderRadius: 16, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, zIndex: 1 },
  cardImage: { height: 160, padding: 16, justifyContent: "flex-end" },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)", borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  cardHeader: { position: "absolute", top: 16, left: 16, right: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statusBadge: { backgroundColor: "#fff", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: "bold" },
  menuBtn: { backgroundColor: "rgba(0,0,0,0.5)", padding: 6, borderRadius: 12 },
  categoryText: { color: "#38bdf8", fontSize: 10, fontWeight: "bold", textTransform: "uppercase", marginBottom: 4 },
  titleText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  cardBody: { padding: 16 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 12 },
  infoTextWrap: { flex: 1 },
  infoLabel: { fontSize: 10, color: "#64748b", textTransform: "uppercase", fontWeight: "bold" },
  infoValue: { fontSize: 14, color: "#0f172a", fontWeight: "500" },
  
  infoGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12, backgroundColor: "#f8fafc", padding: 12, borderRadius: 12 },
  infoCol: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoSmallValue: { fontSize: 12, color: "#334155", fontWeight: "500" },

  locationRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  locationText: { fontSize: 13, color: "#475569", flex: 1 },

  dropdownMenu: { position: "absolute", top: 60, right: 16, backgroundColor: "#fff", borderRadius: 16, padding: 8, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10, elevation: 10, width: 180, zIndex: 10 },
  dropdownItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, paddingHorizontal: 12 },
  dropdownItemText: { fontSize: 14, color: "#334155", fontWeight: "500" },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 4 },

  emptyBox: { padding: 40, alignItems: "center" },
  emptyText: { color: "#94a3b8", fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", padding: 24, borderRadius: 24, width: "100%", alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#0f172a", marginBottom: 12 },
  modalDesc: { fontSize: 14, color: "#64748b", textAlign: "center", marginBottom: 24 },
  modalRow: { flexDirection: "row", gap: 12, width: "100%" },
  modalCancelBtn: { flex: 1, paddingVertical: 14, backgroundColor: "#f1f5f9", borderRadius: 16, alignItems: "center" },
  modalCancelText: { color: "#475569", fontWeight: "bold", fontSize: 15 },
  modalConfirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: "center" },
  modalConfirmText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});
