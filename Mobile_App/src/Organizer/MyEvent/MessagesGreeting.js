import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, StyleSheet, Modal, ActivityIndicator, Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pencil, Trash2, Search, X, ChevronLeft, ChevronRight, Plus } from "lucide-react-native";
import {
  getMessageGreetings, getMessagesByEventId, createMessage, deleteMessage
} from "@Services/api";

const MESSAGE_GROUPS = [
  "Welcome Message", "Thank You Message", "Reminder",
  "Announcement", "Closing Remarks", "Special Greetings",
];

// --- Page 1: Event List -------------------------------------------------------
function Page1({ onSelectEvent }) {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMessageGreetings();
        setEvents(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = events.filter((e) =>
    [`EVT-${e.id}`, e.event_name, e.start_date, e.end_date]
      .join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Messages & Greetings</Text>
      </View>

      <View style={s.searchContainer}>
        <Search size={18} color="#94a3b8" />
        <TextInput
          style={s.searchInput}
          placeholder="Search events..."
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

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      ) : error ? (
        <View style={s.center}><Text style={s.errorText}>{error}</Text></View>
      ) : (
        <FlatList
          data={paginated}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              <Text style={s.emptyText}>No events found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={s.card} onPress={() => onSelectEvent(item)}>
              <View style={s.cardHeader}>
                <Text style={s.eventCode}>EVT-{item.id}</Text>
                <Pencil size={16} color="#0284c7" />
              </View>
              <Text style={s.eventName}>{item.event_name}</Text>
              <Text style={s.dateText}>{item.start_date} ? {item.end_date}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {totalPages > 1 && (
        <View style={s.pagination}>
          <TouchableOpacity disabled={page === 1} onPress={() => setPage((p) => Math.max(1, p - 1))} style={s.pageBtn}>
            <ChevronLeft size={20} color={page === 1 ? "#cbd5e1" : "#0f172a"} />
          </TouchableOpacity>
          <Text style={s.pageText}>{page} / {totalPages}</Text>
          <TouchableOpacity disabled={page === totalPages} onPress={() => setPage((p) => Math.min(totalPages, p + 1))} style={s.pageBtn}>
            <ChevronRight size={20} color={page === totalPages ? "#cbd5e1" : "#0f172a"} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// --- Page 2: Message Editor ----------------------------------------------------
function Page2({ event, onBack }) {
  const [isGreetings, setIsGreetings] = useState(false);
  const [messageGroup, setMessageGroup] = useState("");
  const [topics, setTopics] = useState("");
  const [subTopics, setSubTopics] = useState("");
  const [description, setDescription] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  useEffect(() => {
    if (event?.id) fetchMessages();
  }, [event?.id]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await getMessagesByEventId(event.id);
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!messageGroup) { showNotification("Please select a Message Group.", "error"); return; }
    if (!description.trim()) { showNotification("Please enter a description.", "error"); return; }

    setSaving(true);
    try {
      const payload = {
        message_group: messageGroup,
        topics,
        sub_topics: subTopics,
        description,
        image_path: "",
        type: isGreetings ? "Greetings" : "Messages",
      };
      const result = await createMessage(event.id, payload);
      if (result.success) {
        fetchMessages();
        setPage(1);
        setMessageGroup(""); setTopics(""); setSubTopics(""); setDescription("");
        showNotification("Message saved successfully!");
      } else {
        showNotification("Error: " + (result.error || "Unknown"), "error");
      }
    } catch (e) {
      showNotification("Error: " + e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const result = await deleteMessage(deleteConfirm);
      if (result.success) {
        fetchMessages();
        showNotification("Message deleted!");
      }
    } catch (e) {
      showNotification("Failed to delete", "error");
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(messages.length / PER_PAGE));
  const paginated = messages.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={onBack}>
          <X size={16} color="#0284c7" />
          <Text style={s.backBtnText}>Back</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Messages & Greetings</Text>
          <Text style={s.headerSub} numberOfLines={1}>{event?.event_name}</Text>
        </View>
      </View>

      {toast.show && (
        <View style={[s.toast, toast.type === "success" ? s.toastSuccess : s.toastError]}>
          <Text style={s.toastText}>{toast.message}</Text>
        </View>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">

        {/* Form */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Add Message</Text>

          {/* Toggle */}
          <View style={s.toggleRow}>
            <Text style={[s.toggleLabel, !isGreetings && s.toggleActive]}>Messages</Text>
            <TouchableOpacity
              style={[s.toggleSwitch, isGreetings && s.toggleSwitchOn]}
              onPress={() => setIsGreetings((v) => !v)}
            >
              <View style={[s.toggleThumb, isGreetings && s.toggleThumbOn]} />
            </TouchableOpacity>
            <Text style={[s.toggleLabel, isGreetings && s.toggleActive]}>Greetings</Text>
          </View>

          {/* Message Group */}
          <Text style={s.label}>Message Group <Text style={s.req}>*</Text></Text>
          <TouchableOpacity style={s.selectInput} onPress={() => setShowGroupModal(true)}>
            <Text style={{ color: messageGroup ? "#0f172a" : "#94a3b8", fontSize: 14 }}>
              {messageGroup || "Select Message Group"}
            </Text>
          </TouchableOpacity>

          <Text style={s.label}>Topics</Text>
          <TextInput style={s.input} value={topics} onChangeText={setTopics} placeholder="Enter topic" placeholderTextColor="#94a3b8" />

          <Text style={s.label}>Sub-Topics</Text>
          <TextInput style={s.input} value={subTopics} onChangeText={setSubTopics} placeholder="Enter sub-topic" placeholderTextColor="#94a3b8" />

          <Text style={s.label}>Description <Text style={s.req}>*</Text></Text>
          <TextInput
            style={[s.input, { height: 100, textAlignVertical: "top" }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Insert text here..."
            placeholderTextColor="#94a3b8"
            multiline
          />

          <View style={s.formBtns}>
            <TouchableOpacity style={s.addBtn} onPress={handleAdd} disabled={saving}>
              <Plus size={16} color="#0284c7" />
              <Text style={s.addBtnText}>{saving ? "Saving..." : "Add"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.clearBtn} onPress={() => { setMessageGroup(""); setTopics(""); setSubTopics(""); setDescription(""); }}>
              <Text style={s.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages Table */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Message List</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#0284c7" />
          ) : paginated.length === 0 ? (
            <Text style={s.emptyText}>No messages yet.</Text>
          ) : (
            paginated.map((msg) => (
              <View key={msg.id} style={s.msgCard}>
                <View style={{ flex: 1 }}>
                  <Text style={s.msgGroup}>{msg.message_group}</Text>
                  {msg.topics ? <Text style={s.msgMeta}>Topic: {msg.topics}</Text> : null}
                  {msg.sub_topics ? <Text style={s.msgMeta}>Sub: {msg.sub_topics}</Text> : null}
                  <Text style={s.msgDesc} numberOfLines={2}>{msg.description}</Text>
                </View>
                <TouchableOpacity onPress={() => setDeleteConfirm(msg.id)} style={s.deleteBtn}>
                  <Trash2 size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <View style={[s.pagination, { marginTop: 8 }]}>
              <TouchableOpacity disabled={page === 1} onPress={() => setPage((p) => Math.max(1, p - 1))} style={s.pageBtn}>
                <ChevronLeft size={18} color={page === 1 ? "#cbd5e1" : "#0f172a"} />
              </TouchableOpacity>
              <Text style={s.pageText}>{page}/{totalPages}</Text>
              <TouchableOpacity disabled={page === totalPages} onPress={() => setPage((p) => Math.min(totalPages, p + 1))} style={s.pageBtn}>
                <ChevronRight size={18} color={page === totalPages ? "#cbd5e1" : "#0f172a"} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Group Select Modal */}
      <Modal visible={showGroupModal} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.dropdownCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Select Message Group</Text>
              <TouchableOpacity onPress={() => setShowGroupModal(false)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            {MESSAGE_GROUPS.map((g) => (
              <TouchableOpacity key={g} style={s.dropdownItem} onPress={() => { setMessageGroup(g); setShowGroupModal(false); }}>
                <Text style={s.dropdownItemText}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal visible={!!deleteConfirm} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={[s.dropdownCard, { alignItems: "center" }]}>
            <Text style={s.modalTitle}>Delete Message?</Text>
            <Text style={{ color: "#64748b", fontSize: 13, marginVertical: 12, textAlign: "center" }}>
              This action cannot be undone.
            </Text>
            <View style={{ flexDirection: "row", gap: 10, width: "100%" }}>
              <TouchableOpacity style={[s.clearBtn, { flex: 1, alignItems: "center" }]} onPress={() => setDeleteConfirm(null)}>
                <Text style={s.clearBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.deleteConfirmBtn, { flex: 1 }]}
                onPress={confirmDelete}
                disabled={deleting}
              >
                <Text style={s.deleteConfirmText}>{deleting ? "Deleting..." : "Delete"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- Root ---------------------------------------------------------------------
export default function MessagesGreetings() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  return selectedEvent
    ? <Page2 event={selectedEvent} onBack={() => setSelectedEvent(null)} />
    : <Page1 onSelectEvent={setSelectedEvent} />;
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", gap: 10 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#0c4a6e" },
  headerSub: { fontSize: 12, color: "#64748b" },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: "#bae6fd", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#f0f9ff" },
  backBtnText: { color: "#0284c7", fontSize: 13, fontWeight: "bold" },

  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", margin: 16, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0", gap: 8 },
  searchInput: { flex: 1, height: 44, color: "#0f172a", fontSize: 14 },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { paddingVertical: 60, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#94a3b8" },
  errorText: { color: "#b91c1c", fontSize: 13 },

  list: { paddingHorizontal: 16, paddingBottom: 80 },
  card: { backgroundColor: "#fff", borderRadius: 12, marginBottom: 14, padding: 16, borderWidth: 1, borderColor: "#e2e8f0", elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  eventCode: { fontSize: 11, fontWeight: "bold", color: "#0284c7", letterSpacing: 1 },
  eventName: { fontSize: 15, fontWeight: "bold", color: "#0f172a", marginBottom: 4 },
  dateText: { fontSize: 12, color: "#64748b" },

  pagination: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#e2e8f0", backgroundColor: "#fff" },
  pageBtn: { padding: 8 },
  pageText: { fontSize: 14, fontWeight: "bold", color: "#0f172a", marginHorizontal: 16 },

  toast: { position: "absolute", top: 80, left: 16, right: 16, padding: 12, borderRadius: 8, zIndex: 100, alignItems: "center" },
  toastSuccess: { backgroundColor: "#d1fae5" },
  toastError: { backgroundColor: "#ffe4e6" },
  toastText: { fontSize: 13, fontWeight: "bold", color: "#0f172a" },

  section: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  sectionTitle: { fontSize: 15, fontWeight: "bold", color: "#0284c7", marginBottom: 14, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },

  toggleRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  toggleLabel: { fontSize: 13, color: "#94a3b8", fontWeight: "600" },
  toggleActive: { color: "#0f172a" },
  toggleSwitch: { width: 44, height: 24, backgroundColor: "#e2e8f0", borderRadius: 12, justifyContent: "center", paddingHorizontal: 3 },
  toggleSwitchOn: { backgroundColor: "#0284c7" },
  toggleThumb: { width: 18, height: 18, backgroundColor: "#fff", borderRadius: 9, alignSelf: "flex-start" },
  toggleThumbOn: { alignSelf: "flex-end" },

  label: { fontSize: 12, fontWeight: "bold", color: "#334155", marginBottom: 5, marginTop: 10 },
  req: { color: "#ef4444" },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, height: 44, color: "#0f172a", fontSize: 14, backgroundColor: "#f8fafc" },
  selectInput: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, height: 44, justifyContent: "center", backgroundColor: "#f8fafc" },

  formBtns: { flexDirection: "row", gap: 10, marginTop: 14, justifyContent: "flex-end" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: "#0284c7", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  addBtnText: { color: "#0284c7", fontWeight: "bold", fontSize: 13 },
  clearBtn: { borderWidth: 1, borderColor: "#ef4444", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  clearBtnText: { color: "#ef4444", fontWeight: "bold", fontSize: 13 },

  msgCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingVertical: 10 },
  msgGroup: { fontSize: 13, fontWeight: "bold", color: "#0f172a", marginBottom: 2 },
  msgMeta: { fontSize: 11, color: "#64748b", marginBottom: 2 },
  msgDesc: { fontSize: 12, color: "#334155", marginTop: 4 },
  deleteBtn: { padding: 4 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  dropdownCard: { backgroundColor: "#fff", borderRadius: 16, width: "90%", padding: 20, maxHeight: "80%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingBottom: 12, marginBottom: 12 },
  modalTitle: { fontSize: 16, fontWeight: "bold", color: "#0f172a" },
  dropdownItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  dropdownItemText: { fontSize: 14, color: "#0f172a" },
  deleteConfirmBtn: { backgroundColor: "#ef4444", borderRadius: 8, padding: 10, alignItems: "center" },
  deleteConfirmText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
});
