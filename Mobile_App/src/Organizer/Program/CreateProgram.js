import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye, ArrowLeft, Plus, Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react-native";
import { createProgram as createProgramAPI, getProgramEvents, getProgramsByEvent } from "@Services/api";
import { useSelector } from "react-redux";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CreateProgram() {
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState([]);

  // Page 2 states
  const [progSearch, setProgSearch] = useState("");
  const [viewBy, setViewBy] = useState("All");
  const [programs, setPrograms] = useState([]);

  // Page 3 states
  const [formData, setFormData] = useState({
    name: "", category: "", type: "", start: "", end: "", venue: "", maxPart: "", budget: "", coordName: "", coordEmail: "", desc: "", status: "Active",
  });
  const [errors, setErrors] = useState({ name: "" });

  const [currentPage1, setCurrentPage1] = useState(1);
  const [currentPage2, setCurrentPage2] = useState(1);
  const itemsPerPage = 10;

  const Redexorganizer = useSelector((state) => state.user);
  const [organizer, setOrganizer] = useState(Redexorganizer);

  useEffect(() => {
    const loadUser = async () => {
      if (!Redexorganizer?.id) {
        try {
          const userId = await AsyncStorage.getItem("userId");
          const userName = await AsyncStorage.getItem("userName");
          if (userId) setOrganizer({ id: userId, name: userName });
        } catch (e) { console.error(e); }
      }
    };
    loadUser();
  }, [Redexorganizer]);

  useEffect(() => {
    if (organizer?.id) fetchEvents();
  }, [organizer?.id]);

  const fetchEvents = async () => {
    try {
      const data = await getProgramEvents(organizer.id);
      setEvents(data || []);
    } catch (err) { console.error(err); }
  };

  const fetchPrograms = async (eventId) => {
    try {
      const data = await getProgramsByEvent(eventId);
      setPrograms(data || []);
    } catch (err) { console.error(err); }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    fetchPrograms(event.id);
    setFormData(prev => ({
      ...prev,
      start: event.start_date,
      end: event.end_date
    }));
    setPage(2);
  };

  const filteredEvents = events.filter((e) =>
    (e.event_name || "").toLowerCase().includes(search.toLowerCase())
  );
  const totalPages1 = Math.max(1, Math.ceil(filteredEvents.length / itemsPerPage));
  const currentEvents = filteredEvents.slice((currentPage1 - 1) * itemsPerPage, currentPage1 * itemsPerPage);

  useEffect(() => { setCurrentPage1(1); }, [search]);

  const filteredPrograms = programs.filter((p) =>
    (p.program_name || "").toLowerCase().includes(progSearch.toLowerCase())
  ).filter((p) => {
    if (viewBy === "All") return true;
    return p.status === viewBy;
  });

  const totalPages2 = Math.max(1, Math.ceil(filteredPrograms.length / itemsPerPage));
  const currentProgramsList = filteredPrograms.slice((currentPage2 - 1) * itemsPerPage, currentPage2 * itemsPerPage);

  useEffect(() => { setCurrentPage2(1); }, [progSearch, viewBy]);

  const handleFormSubmit = async () => {
    const newErrors = { name: "" };
    if (!formData.name.trim()) newErrors.name = "Program Name is required";
    setErrors(newErrors);
    if (newErrors.name) return;

    try {
      await createProgramAPI({ ...formData, event_id: selectedEvent.id });
      Alert.alert("Success", "Program created successfully!");
      setPage(2);
      setFormData({
        name: "", category: "", type: "", start: selectedEvent.start_date, end: selectedEvent.end_date, venue: "", maxPart: "", budget: "", coordName: "", coordEmail: "", desc: "", status: "Active"
      });
      setErrors({ name: "" });
      fetchPrograms(selectedEvent.id);
      fetchEvents();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to create program");
    }
  };

  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
      <View style={styles.pagination}>
        <TouchableOpacity style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]} disabled={currentPage === 1} onPress={() => onPageChange(Math.max(1, currentPage - 1))}>
          <ChevronLeft size={20} color={currentPage === 1 ? "#cbd5e1" : "#475569"} />
        </TouchableOpacity>
        <Text style={styles.pageText}>Page {currentPage} of {totalPages}</Text>
        <TouchableOpacity style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]} disabled={currentPage === totalPages} onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}>
          <ChevronRight size={20} color={currentPage === totalPages ? "#cbd5e1" : "#475569"} />
        </TouchableOpacity>
      </View>
    );
  };

  if (page === 3) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => setPage(2)} style={styles.backBtn}>
              <ArrowLeft size={20} color="#475569" />
            </TouchableOpacity>
            <Text style={styles.pageTitle} numberOfLines={1}>Create Program</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Program Name <Text style={{color:"red"}}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.name && {borderColor: "red"}]}
              value={formData.name}
              onChangeText={(v) => {
                const val = v.replace(/[^a-zA-Z ]/g, "");
                setFormData({ ...formData, name: val });
                if (val.trim()) setErrors(prev => ({ ...prev, name: "" }));
              }}
              maxLength={20}
              placeholder="e.g. Inaugural Session"
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            
            <Text style={styles.fieldLabel}>Category</Text>
            <TextInput style={styles.input} value={formData.category} onChangeText={(v) => setFormData({...formData, category: v})} maxLength={20} placeholder="e.g. Keynote" />
            
            <Text style={styles.fieldLabel}>Venue</Text>
            <TextInput style={styles.input} value={formData.venue} onChangeText={(v) => setFormData({...formData, venue: v})} maxLength={10} placeholder="e.g. Hall A" />
            
            <Text style={styles.fieldLabel}>Coordinator Name</Text>
            <TextInput style={styles.input} value={formData.coordName} onChangeText={(v) => setFormData({...formData, coordName: v.replace(/[^a-zA-Z ]/g, "")})} maxLength={20} placeholder="e.g. John Doe" />
            
            <Text style={styles.fieldLabel}>Coordinator Email</Text>
            <TextInput style={styles.input} value={formData.coordEmail} onChangeText={(v) => setFormData({...formData, coordEmail: v})} placeholder="john@example.com" keyboardType="email-address" />
            
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput style={[styles.input, {height: 80}]} value={formData.desc} onChangeText={(v) => setFormData({...formData, desc: v})} maxLength={250} placeholder="Program details..." multiline />
            
            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setPage(2)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleFormSubmit}><Text style={styles.submitBtnText}>Create Program</Text></TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (page === 2) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => setPage(1)} style={styles.backBtn}>
              <ArrowLeft size={20} color="#475569" />
            </TouchableOpacity>
            <Text style={styles.pageTitle} numberOfLines={1}>{selectedEvent?.event_name}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.searchRow}>
              <View style={[styles.searchBar, { flex: 1, marginBottom: 0 }]}>
                <Search size={16} color="#94a3b8" />
                <TextInput style={styles.searchInput} placeholder="Search Program..." value={progSearch} onChangeText={setProgSearch} />
              </View>
              <TouchableOpacity style={styles.newBtn} onPress={() => setPage(3)}>
                <Plus size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {currentProgramsList.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No Programs match your filter</Text>
                <Text style={{color: "#94a3b8", fontSize: 12, marginTop: 4}}>Click + to add your first program</Text>
              </View>
            ) : (
              currentProgramsList.map((prog, idx) => (
                <View key={idx} style={styles.listCard}>
                  <View style={styles.listCardHeader}>
                    <View style={styles.codeBadge}><Text style={styles.codeText}>{prog.program_code}</Text></View>
                    <View style={[styles.statusBadge, prog.status === "Active" ? styles.statusActive : prog.status === "Inactive" ? styles.statusRejected : styles.statusPending]}>
                      <Text style={[styles.statusText, prog.status === "Active" ? styles.statusActiveText : prog.status === "Inactive" ? styles.statusRejectedText : styles.statusPendingText]}>
                        {prog.status === "Active" ? "Approved" : prog.status === "Inactive" ? "Rejected" : prog.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.eventName}>{prog.program_name}</Text>
                  <Text style={{fontSize: 13, color: "#64748b"}}>Category: {prog.category}</Text>
                  <Text style={{fontSize: 13, color: "#64748b"}}>Type: {prog.type}</Text>
                </View>
              ))
            )}
            <Pagination currentPage={currentPage2} totalPages={totalPages2} onPageChange={setCurrentPage2} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // PAGE 1
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.pageTitle}>My Programs</Text>
        <View style={styles.card}>
          <View style={styles.searchBar}>
            <Search size={16} color="#94a3b8" />
            <TextInput style={styles.searchInput} placeholder="Search events..." value={search} onChangeText={setSearch} />
          </View>
          
          {currentEvents.length === 0 ? (
            <View style={styles.emptyContainer}><Text style={styles.emptyText}>No Events Found</Text></View>
          ) : (
            currentEvents.map((event, i) => (
              <View key={i} style={styles.listCard}>
                <View style={styles.listCardHeader}>
                  <View style={styles.codeBadge}><Text style={styles.codeText}>{event.event_code}</Text></View>
                  <TouchableOpacity style={styles.eyeBtn} onPress={() => handleSelectEvent(event)}>
                    <Eye size={18} color="#2563eb" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.eventName}>{event.event_name}</Text>
                <View style={styles.statsRow}>
                  <View style={[styles.statBox, styles.statPending]}><Text style={styles.statLabel}>IN-PROCESS</Text><Text style={[styles.statNum, { color: "#d97706" }]}>{event.inprocess}</Text></View>
                  <View style={[styles.statBox, styles.statApproved]}><Text style={styles.statLabel}>APPROVED</Text><Text style={[styles.statNum, { color: "#059669" }]}>{event.approved}</Text></View>
                  <View style={[styles.statBox, styles.statRejected]}><Text style={styles.statLabel}>REJECTED</Text><Text style={[styles.statNum, { color: "#e11d48" }]}>{event.rejected}</Text></View>
                </View>
              </View>
            ))
          )}
          <Pagination currentPage={currentPage1} totalPages={totalPages1} onPageChange={setCurrentPage1} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  backBtn: { padding: 8, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10 },
  pageTitle: { fontSize: 22, fontWeight: "bold", color: "#1e293b", marginBottom: 16, flex: 1 },
  card: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", padding: 16 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 12, marginBottom: 16, gap: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: "#0f172a" },
  searchRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  newBtn: { backgroundColor: "#2563eb", width: 44, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  emptyContainer: { paddingVertical: 40, alignItems: "center" },
  emptyText: { color: "#94a3b8", fontSize: 14, fontWeight: "bold" },
  listCard: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 14, marginBottom: 12 },
  listCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  codeBadge: { backgroundColor: "#eff6ff", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  codeText: { color: "#2563eb", fontWeight: "bold", fontSize: 12 },
  eyeBtn: { padding: 6, backgroundColor: "#dbeafe", borderRadius: 8 },
  eventName: { fontSize: 16, fontWeight: "bold", color: "#1e293b", marginBottom: 12 },
  statsRow: { flexDirection: "row", gap: 8 },
  statBox: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  statApproved: { backgroundColor: "#d1fae5" },
  statRejected: { backgroundColor: "#ffe4e6" },
  statPending: { backgroundColor: "#fef3c7" },
  statLabel: { fontSize: 9, fontWeight: "bold", color: "#64748b", marginBottom: 2 },
  statNum: { fontSize: 16, fontWeight: "900" },
  pagination: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 8 },
  pageBtn: { width: 40, height: 40, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, alignItems: "center", justifyContent: "center" },
  pageBtnDisabled: { backgroundColor: "#f8fafc" },
  pageText: { fontSize: 14, fontWeight: "600", color: "#475569" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusActive: { backgroundColor: "#d1fae5" },
  statusRejected: { backgroundColor: "#ffe4e6" },
  statusPending: { backgroundColor: "#fef3c7" },
  statusText: { fontSize: 10, fontWeight: "bold", textTransform: "uppercase" },
  statusActiveText: { color: "#065f46" },
  statusRejectedText: { color: "#e11d48" },
  statusPendingText: { color: "#d97706" },
  fieldLabel: { fontSize: 12, fontWeight: "bold", color: "#475569", marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#0f172a" },
  errorText: { color: "red", fontSize: 11, marginTop: 4 },
  formActions: { flexDirection: "row", gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, paddingVertical: 14, backgroundColor: "#f1f5f9", borderRadius: 12, alignItems: "center" },
  cancelBtnText: { color: "#475569", fontWeight: "bold" },
  submitBtn: { flex: 1, paddingVertical: 14, backgroundColor: "#0284c7", borderRadius: 12, alignItems: "center" },
  submitBtnText: { color: "#fff", fontWeight: "bold" }
});
