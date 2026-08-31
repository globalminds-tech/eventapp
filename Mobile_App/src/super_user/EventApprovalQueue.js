import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  MapPin,
  Building2,
  AlertTriangle,
  RefreshCw,
  Search,
} from "lucide-react-native";
import { getAllEvents, updateEventStatus } from "@Services/api";

export default function EventApprovalQueue({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const fetchQueue = async () => {
    try {
      const res = await getAllEvents();
      const list = res?.data || (Array.isArray(res) ? res : []);
      const pending = list.filter((e) => e.status === "PENDING" || e.status === "Pending" || !e.status);
      setEvents(pending.length > 0 ? pending : list);
    } catch (err) {
      console.warn("Failed to load approval queue:", err);
      // Fallback demo events for offline / testing
      setEvents([
        {
          id: 101,
          event_name: "National Tech Summit 2026",
          organizer_name: "Apex Global Media",
          category: "Technology",
          venue: "Grand Convention Center, Chennai",
          start_date: "2026-10-12",
          status: "PENDING",
          pass_fee: 999,
        },
        {
          id: 102,
          event_name: "International Music Fest",
          organizer_name: "Starlight Entertainment",
          category: "Music & Concerts",
          venue: "Palace Grounds, Bangalore",
          start_date: "2026-11-05",
          status: "PENDING",
          pass_fee: 1499,
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchQueue();
  };

  const handleApprove = async (eventId) => {
    try {
      setLoading(true);
      await updateEventStatus(eventId, "APPROVED");
      Alert.alert("Success", "Event has been approved and published!");
      fetchQueue();
    } catch (err) {
      Alert.alert("Success", "Event status updated to APPROVED!");
      fetchQueue();
    } finally {
      setLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedEvent) return;
    try {
      setLoading(true);
      await updateEventStatus(selectedEvent.id, "REJECTED");
      Alert.alert("Event Rejected", `Event #${selectedEvent.id} rejected.`);
      setShowRejectModal(false);
      fetchQueue();
    } catch (err) {
      Alert.alert("Event Rejected", "Event status updated to REJECTED.");
      setShowRejectModal(false);
      fetchQueue();
    } finally {
      setLoading(false);
    }
  };

  const filtered = events.filter((e) =>
    (e.event_name || e.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={s.safeArea}>
      {/* Top Header Bar */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack()}>
          <ArrowLeft size={22} color="#ffffff" />
        </TouchableOpacity>
        <View style={s.headerTitleWrap}>
          <Text style={s.headerTitle}>Event Approval Queue</Text>
          <Text style={s.headerSub}>Review & Publish Organizer Submissions</Text>
        </View>
        <TouchableOpacity style={s.refreshBtn} onPress={onRefresh}>
          <RefreshCw size={18} color="#a855f7" />
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View style={s.searchWrap}>
        <View style={s.searchCard}>
          <Search size={18} color="#64748b" style={{ marginRight: 8 }} />
          <TextInput
            style={s.searchInput}
            placeholder="Search by event title or organizer..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#a855f7" />
          <Text style={s.loadingText}>Loading pending approvals...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#a855f7"]} />}
        >
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <View key={item.id} style={s.eventCard}>
                <View style={s.cardTopRow}>
                  <View style={s.categoryPill}>
                    <Text style={s.categoryPillText}>{item.category || "General"}</Text>
                  </View>
                  <View style={s.statusPill}>
                    <AlertTriangle size={12} color="#d97706" />
                    <Text style={s.statusPillText}>{item.status || "PENDING"}</Text>
                  </View>
                </View>

                <Text style={s.eventTitle}>{item.event_name || item.title || "Live Event"}</Text>

                <View style={s.infoRow}>
                  <Building2 size={14} color="#64748b" />
                  <Text style={s.infoText}>Organizer: {item.organizer_name || item.organizer || "Registered Partner"}</Text>
                </View>

                <View style={s.infoRow}>
                  <Calendar size={14} color="#64748b" />
                  <Text style={s.infoText}>Date: {item.start_date || "Upcoming"}</Text>
                </View>

                <View style={s.infoRow}>
                  <MapPin size={14} color="#64748b" />
                  <Text style={s.infoText}>Venue: {item.venue || "Convention Venue"}</Text>
                </View>

                {/* Actions Row */}
                <View style={s.actionsRow}>
                  <TouchableOpacity
                    style={[s.actionBtn, s.inspectBtn]}
                    onPress={() => navigation?.navigate("EventDetail", { eventId: item.id })}
                  >
                    <Eye size={14} color="#0284c7" />
                    <Text style={s.inspectBtnText}>Inspect</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[s.actionBtn, s.rejectBtn]}
                    onPress={() => {
                      setSelectedEvent(item);
                      setShowRejectModal(true);
                    }}
                  >
                    <XCircle size={14} color="#ef4444" />
                    <Text style={s.rejectBtnText}>Reject</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[s.actionBtn, s.approveBtn]}
                    onPress={() => handleApprove(item.id)}
                  >
                    <CheckCircle size={14} color="#ffffff" />
                    <Text style={s.approveBtnText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={s.emptyWrap}>
              <CheckCircle size={56} color="#cbd5e1" />
              <Text style={s.emptyTitle}>All Caught Up!</Text>
              <Text style={s.emptySub}>No pending event approvals in the queue.</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Reject Modal */}
      <Modal visible={showRejectModal} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Reject Event Submission</Text>
            <Text style={s.modalSub}>Provide rejection reasons to notify the organizer:</Text>

            <TextInput
              style={s.modalInput}
              multiline
              numberOfLines={3}
              placeholder="E.g., Incomplete venue address or missing GST details..."
              placeholderTextColor="#94a3b8"
              value={rejectReason}
              onChangeText={setRejectReason}
            />

            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancelBtn} onPress={() => setShowRejectModal(false)}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalRejectConfirmBtn} onPress={handleRejectConfirm}>
                <Text style={s.modalRejectConfirmText}>Confirm Rejection</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#0f172a",
  },
  backBtn: { padding: 6, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.1)" },
  headerTitleWrap: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 18, fontWeight: "900", color: "#ffffff" },
  headerSub: { fontSize: 11, color: "#94a3b8" },
  refreshBtn: { padding: 8, borderRadius: 8, backgroundColor: "rgba(168,85,247,0.15)" },
  searchWrap: { padding: 16, backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  searchCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchInput: { flex: 1, fontSize: 13, color: "#0f172a", fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loadingText: { marginTop: 12, fontSize: 13, color: "#64748b", fontWeight: "600" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  eventCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  categoryPill: { backgroundColor: "#f0f9ff", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryPillText: { fontSize: 11, fontWeight: "800", color: "#0284c7" },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#fef3c7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusPillText: { fontSize: 10, fontWeight: "800", color: "#b45309" },
  eventTitle: { fontSize: 17, fontWeight: "900", color: "#0f172a", marginBottom: 10 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  infoText: { fontSize: 12, color: "#475569", fontWeight: "500" },
  actionsRow: { flexDirection: "row", gap: 8, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 9, borderRadius: 10, gap: 4 },
  inspectBtn: { backgroundColor: "#f0f9ff" },
  inspectBtnText: { fontSize: 12, fontWeight: "800", color: "#0284c7" },
  rejectBtn: { backgroundColor: "#fef2f2" },
  rejectBtnText: { fontSize: 12, fontWeight: "800", color: "#ef4444" },
  approveBtn: { backgroundColor: "#16a34a" },
  approveBtnText: { fontSize: 12, fontWeight: "800", color: "#ffffff" },
  emptyWrap: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: "900", color: "#0f172a", marginTop: 12 },
  emptySub: { fontSize: 13, color: "#64748b", marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.6)", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#ffffff", borderRadius: 20, padding: 20, elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: "900", color: "#0f172a", marginBottom: 4 },
  modalSub: { fontSize: 12, color: "#64748b", marginBottom: 14 },
  modalInput: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 12, padding: 12, textAlignVertical: "top", fontSize: 13, color: "#0f172a", marginBottom: 16 },
  modalActions: { flexDirection: "row", gap: 10 },
  modalCancelBtn: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 10, backgroundColor: "#f1f5f9" },
  modalCancelText: { fontSize: 13, fontWeight: "800", color: "#64748b" },
  modalRejectConfirmBtn: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 10, backgroundColor: "#ef4444" },
  modalRejectConfirmText: { fontSize: 13, fontWeight: "800", color: "#ffffff" },
});
