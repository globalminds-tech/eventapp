import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, StyleSheet, Modal, ActivityIndicator, Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CheckCircle, Eye, Search, Plus, ChevronLeft, ChevronRight, X, Trash2
} from "lucide-react-native";
import { getTasks, createTasks } from "@Services/api";

const fmtDate = (d) => {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};

const STATUS_COLORS = {
  "In-Progress": { bg: "#dbeafe", text: "#1d4ed8" },
  Completed: { bg: "#dcfce7", text: "#15803d" },
  Pending: { bg: "#fef3c7", text: "#d97706" },
};

function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS["In-Progress"];
  return (
    <View style={[s.badge, { backgroundColor: colors.bg }]}>
      <Text style={[s.badgeText, { color: colors.text }]}>{status}</Text>
    </View>
  );
}

// --- List View ----------------------------------------------------------------
function ListView({ onAdd, tasks, loading, error, fetchTasks }) {
  const [search, setSearch] = useState("");
  const [viewingTask, setViewingTask] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const filteredTasks = tasks.filter((t) =>
    (t.task_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.todo_list_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.assigned_to || "").toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => { setCurrentPage(1); }, [search]);

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / ITEMS_PER_PAGE));
  const currentTasks = filteredTasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>To-Do Task</Text>
        <TouchableOpacity style={s.addBtn} onPress={onAdd}>
          <Plus size={18} color="#fff" />
          <Text style={s.addBtnText}>Add Task</Text>
        </TouchableOpacity>
      </View>

      <View style={s.searchContainer}>
        <Search size={18} color="#94a3b8" />
        <TextInput
          style={s.searchInput}
          placeholder="Search tasks, users, or lists..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <X size={16} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <View style={s.errorBox}>
          <Text style={s.errorText}>{error}</Text>
        </View>
      ) : loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      ) : (
        <FlatList
          data={currentTasks}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              <Text style={s.emptyText}>No Tasks Found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.taskName}>{item.task_name}</Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={s.listName}>{item.todo_list_name}</Text>
              <View style={s.cardMeta}>
                <Text style={s.metaText}>
                  {fmtDate(item.start_date)} ? {fmtDate(item.end_date)}
                </Text>
                <Text style={s.metaText}>Assigned: {item.assigned_to}</Text>
              </View>
              <View style={s.progressRow}>
                <View style={s.progressBg}>
                  <View style={[s.progressFill, { width: `${item.complete_percent || 0}%` }]} />
                </View>
                <Text style={s.progressText}>{item.complete_percent || 0}%</Text>
              </View>
              <TouchableOpacity
                style={s.viewBtn}
                onPress={() => setViewingTask(item)}
              >
                <Eye size={16} color="#0284c7" />
                <Text style={s.viewBtnText}>View Details</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={s.pagination}>
          <TouchableOpacity
            disabled={currentPage === 1}
            onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
            style={s.pageBtn}
          >
            <ChevronLeft size={20} color={currentPage === 1 ? "#cbd5e1" : "#0f172a"} />
          </TouchableOpacity>
          <Text style={s.pageText}>{currentPage} / {totalPages}</Text>
          <TouchableOpacity
            disabled={currentPage === totalPages}
            onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            style={s.pageBtn}
          >
            <ChevronRight size={20} color={currentPage === totalPages ? "#cbd5e1" : "#0f172a"} />
          </TouchableOpacity>
        </View>
      )}

      {/* Detail Modal */}
      <Modal visible={!!viewingTask} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Task Details</Text>
              <TouchableOpacity onPress={() => setViewingTask(null)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            {viewingTask && (
              <ScrollView keyboardShouldPersistTaps="handled">
                <Text style={s.modalTaskName}>{viewingTask.task_name}</Text>
                <View style={s.detailGrid}>
                  {[
                    ["List Name", viewingTask.todo_list_name],
                    ["Assigned To", viewingTask.assigned_to],
                    ["Start Date", fmtDate(viewingTask.start_date)],
                    ["End Date", fmtDate(viewingTask.end_date)],
                  ].map(([label, val]) => (
                    <View key={label} style={s.detailRow}>
                      <Text style={s.detailLabel}>{label}</Text>
                      <Text style={s.detailVal}>{val}</Text>
                    </View>
                  ))}
                  <View style={s.detailRow}>
                    <Text style={s.detailLabel}>Status</Text>
                    <StatusBadge status={viewingTask.status} />
                  </View>
                  <View style={s.detailRow}>
                    <Text style={s.detailLabel}>Progress</Text>
                    <Text style={[s.detailVal, { color: "#15803d", fontWeight: "bold" }]}>
                      {viewingTask.complete_percent}%
                    </Text>
                  </View>
                  {viewingTask.remarks && (
                    <View style={s.detailRow}>
                      <Text style={s.detailLabel}>Remarks</Text>
                      <Text style={[s.detailVal, { fontStyle: "italic", color: "#64748b" }]}>
                        {viewingTask.remarks}
                      </Text>
                    </View>
                  )}
                  {viewingTask.task_description && (
                    <View style={[s.detailRow, { flexDirection: "column", gap: 4 }]}>
                      <Text style={s.detailLabel}>Description</Text>
                      <Text style={s.detailVal}>{viewingTask.task_description}</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity style={s.closeBtn} onPress={() => setViewingTask(null)}>
                  <Text style={s.closeBtnText}>Close View</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- Form View ----------------------------------------------------------------
const EMPTY_ITEM = {
  todo_list_name: "", start_date: "", end_date: "",
  assigned_to: "", status: "In-Progress", complete_percent: "0", remarks: ""
};

function FormView({ onSaved, allTasks }) {
  const [taskName, setTaskName] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [form, setForm] = useState({ ...EMPTY_ITEM });
  const [summaryItems, setSummaryItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [saveErr, setSaveErr] = useState("");
  const [statusDropdown, setStatusDropdown] = useState(false);

  const fc = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  const addToSummary = () => {
    const { todo_list_name, start_date, end_date, assigned_to, remarks } = form;
    if (!todo_list_name || !start_date || !end_date || !assigned_to || !remarks) {
      setFormErr("Please fill all required fields.");
      return;
    }
    setFormErr("");
    setSummaryItems((p) => [...p, { ...form }]);
    setForm({ ...EMPTY_ITEM });
  };

  const removeItem = (idx) => setSummaryItems((p) => p.filter((_, i) => i !== idx));

  const saveTask = async () => {
    if (!taskName.trim() || !taskDesc.trim()) {
      setSaveErr("Task Name and Description are required.");
      return;
    }
    if (summaryItems.length === 0) {
      setSaveErr("Add at least one To-Do List entry before saving.");
      return;
    }
    setSaveErr("");
    setSaving(true);
    try {
      const res = await createTasks({
        task_name: taskName.trim(),
        task_description: taskDesc.trim(),
        todo_items: summaryItems.map((i) => ({
          ...i,
          complete_percent: parseInt(i.complete_percent) || 0,
        })),
      });
      if (res.success) onSaved();
      else setSaveErr(res.error || "Save failed.");
    } catch {
      setSaveErr("API Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={onSaved} style={s.backIconBtn}>
          <X size={18} color="#0284c7" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Create Task</Text>
        <TouchableOpacity style={s.saveBtn} onPress={saveTask} disabled={saving}>
          <CheckCircle size={16} color="#fff" />
          <Text style={s.saveBtnText}>{saving ? "Saving..." : "Save"}</Text>
        </TouchableOpacity>
      </View>

      {saveErr ? (
        <View style={s.errorBox}>
          <Text style={s.errorText}>{saveErr}</Text>
        </View>
      ) : null}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">

        {/* Task Info */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Task Information</Text>
          <Text style={s.label}>Task Name <Text style={s.req}>*</Text></Text>
          <TextInput style={s.input} value={taskName} onChangeText={setTaskName} placeholder="e.g. Website Launch" placeholderTextColor="#94a3b8" />
          <Text style={[s.label, { marginTop: 10 }]}>Description <Text style={s.req}>*</Text></Text>
          <TextInput style={[s.input, { height: 100, textAlignVertical: "top" }]} value={taskDesc} onChangeText={setTaskDesc} placeholder="Details of the main task..." placeholderTextColor="#94a3b8" multiline />
        </View>

        {/* To-Do Item */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>To-Do Item Details</Text>
          {formErr ? <Text style={s.errText}>{formErr}</Text> : null}

          <Text style={s.label}>Milestone Name <Text style={s.req}>*</Text></Text>
          <TextInput style={s.input} value={form.todo_list_name} onChangeText={(v) => fc("todo_list_name", v)} placeholder="e.g. Design Mockups" placeholderTextColor="#94a3b8" />

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Start Date <Text style={s.req}>*</Text></Text>
              <TextInput style={s.input} value={form.start_date} onChangeText={(v) => fc("start_date", v)} placeholder="YYYY-MM-DD" placeholderTextColor="#94a3b8" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>End Date <Text style={s.req}>*</Text></Text>
              <TextInput style={s.input} value={form.end_date} onChangeText={(v) => fc("end_date", v)} placeholder="YYYY-MM-DD" placeholderTextColor="#94a3b8" />
            </View>
          </View>

          <Text style={s.label}>Assign To <Text style={s.req}>*</Text></Text>
          <TextInput style={s.input} value={form.assigned_to} onChangeText={(v) => fc("assigned_to", v)} placeholder="Username" placeholderTextColor="#94a3b8" />

          <Text style={s.label}>Status <Text style={s.req}>*</Text></Text>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
            {["In-Progress", "Completed", "Pending"].map((st) => (
              <TouchableOpacity
                key={st}
                style={[s.radio, form.status === st && s.radioSelected]}
                onPress={() => fc("status", st)}
              >
                <Text style={[s.radioText, form.status === st && { color: "#0284c7" }]}>{st}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.label}>Progress %</Text>
          <TextInput style={s.input} value={form.complete_percent} onChangeText={(v) => fc("complete_percent", v)} placeholder="0-100" placeholderTextColor="#94a3b8" keyboardType="number-pad" />

          <Text style={s.label}>Remarks <Text style={s.req}>*</Text></Text>
          <TextInput style={[s.input, { height: 70, textAlignVertical: "top" }]} value={form.remarks} onChangeText={(v) => fc("remarks", v)} placeholder="Notes..." placeholderTextColor="#94a3b8" multiline />

          <TouchableOpacity style={s.addItemBtn} onPress={addToSummary}>
            <Plus size={18} color="#0284c7" />
            <Text style={s.addItemBtnText}>Add to Checklist</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Table */}
        {summaryItems.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Task Checklist ({summaryItems.length})</Text>
            {summaryItems.map((item, i) => (
              <View key={i} style={s.summaryItem}>
                <View style={{ flex: 1 }}>
                  <Text style={s.summaryName}>{item.todo_list_name}</Text>
                  <Text style={s.summaryDates}>{fmtDate(item.start_date)} - {fmtDate(item.end_date)}</Text>
                  <StatusBadge status={item.status} />
                </View>
                <TouchableOpacity onPress={() => removeItem(i)} style={s.removeBtn}>
                  <Trash2 size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Root ---------------------------------------------------------------------
export default function ToDoApp() {
  const [pageView, setPageView] = useState("list");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getTasks();
      if (res.success) setTasks(res.data);
      else setError(res.error || "Failed to load tasks");
    } catch {
      setError("Cannot connect to backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  return pageView === "list" ? (
    <ListView
      onAdd={() => setPageView("form")}
      tasks={tasks}
      loading={loading}
      error={error}
      fetchTasks={fetchTasks}
    />
  ) : (
    <FormView
      onSaved={() => { setPageView("list"); fetchTasks(); }}
      allTasks={tasks}
    />
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", gap: 10 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#0c4a6e", flex: 1 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#0284c7", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  backIconBtn: { padding: 6, backgroundColor: "#f0f9ff", borderRadius: 8, borderWidth: 1, borderColor: "#bae6fd" },
  saveBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#16a34a", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  saveBtnText: { color: "#fff", fontSize: 13, fontWeight: "bold" },

  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", margin: 16, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0", gap: 8 },
  searchInput: { flex: 1, height: 44, color: "#0f172a", fontSize: 14 },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { paddingVertical: 60, alignItems: "center" },
  emptyText: { fontSize: 16, fontWeight: "bold", color: "#94a3b8" },

  errorBox: { margin: 16, backgroundColor: "#fee2e2", padding: 12, borderRadius: 8 },
  errorText: { color: "#b91c1c", fontSize: 13, fontWeight: "bold" },

  list: { paddingHorizontal: 16, paddingBottom: 80 },
  card: { backgroundColor: "#fff", borderRadius: 12, marginBottom: 14, padding: 16, borderWidth: 1, borderColor: "#e2e8f0", elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  taskName: { fontSize: 15, fontWeight: "bold", color: "#0f172a", flex: 1, marginRight: 8 },
  listName: { fontSize: 13, color: "#0284c7", fontWeight: "600", marginBottom: 8 },
  cardMeta: { gap: 4, marginBottom: 10 },
  metaText: { fontSize: 12, color: "#64748b" },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  progressBg: { flex: 1, height: 6, backgroundColor: "#e2e8f0", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, backgroundColor: "#16a34a", borderRadius: 3 },
  progressText: { fontSize: 11, fontWeight: "bold", color: "#16a34a", width: 35 },
  viewBtn: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-end" },
  viewBtnText: { color: "#0284c7", fontSize: 13, fontWeight: "bold" },

  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, alignSelf: "flex-start" },
  badgeText: { fontSize: 11, fontWeight: "bold" },

  pagination: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#e2e8f0", backgroundColor: "#fff" },
  pageBtn: { padding: 8 },
  pageText: { fontSize: 14, fontWeight: "bold", color: "#0f172a", marginHorizontal: 16 },

  section: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  sectionTitle: { fontSize: 15, fontWeight: "bold", color: "#0284c7", marginBottom: 14, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  label: { fontSize: 12, fontWeight: "bold", color: "#334155", marginBottom: 5, marginTop: 8 },
  req: { color: "#ef4444" },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, height: 44, color: "#0f172a", fontSize: 14, backgroundColor: "#f8fafc" },
  errText: { color: "#ef4444", fontSize: 11, fontWeight: "bold", marginBottom: 8 },

  radio: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: "#f8fafc" },
  radioSelected: { borderColor: "#0284c7", backgroundColor: "#f0f9ff" },
  radioText: { fontSize: 12, color: "#475569", fontWeight: "bold" },

  addItemBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 2, borderColor: "#bae6fd", borderStyle: "dashed", borderRadius: 10, padding: 12, marginTop: 12, backgroundColor: "#f0f9ff" },
  addItemBtnText: { color: "#0284c7", fontWeight: "bold", fontSize: 14 },

  summaryItem: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingVertical: 10 },
  summaryName: { fontSize: 13, fontWeight: "bold", color: "#0f172a", marginBottom: 2 },
  summaryDates: { fontSize: 11, color: "#64748b", fontFamily: "monospace", marginBottom: 6 },
  removeBtn: { padding: 4 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", borderRadius: 16, width: "100%", padding: 20, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingBottom: 12, marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#0f172a" },
  modalTaskName: { fontSize: 16, fontWeight: "bold", color: "#0284c7", marginBottom: 14 },
  detailGrid: { gap: 0 },
  detailRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingVertical: 10, alignItems: "center" },
  detailLabel: { width: 120, fontSize: 13, color: "#64748b", fontWeight: "bold" },
  detailVal: { flex: 1, fontSize: 13, color: "#0f172a" },
  closeBtn: { backgroundColor: "#0f172a", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 20 },
  closeBtnText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
});
