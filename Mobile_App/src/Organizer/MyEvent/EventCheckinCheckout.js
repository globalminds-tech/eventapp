import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal, ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye, X, ChevronLeft, ChevronRight, Search } from "lucide-react-native";
import { getEventscheckin } from "@Services/api";

export default function EventCheckIn() {
  const [page, setPage] = useState("events"); // "events" | "entries" | "details"
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [events, setEvents] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [eventCurrentPage, setEventCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await getEventscheckin();
      setEvents(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Failed to fetch events", err);
    } finally {
      setLoading(false);
    }
  };

  const eventTotalPages = Math.max(1, Math.ceil(events.length / ITEMS_PER_PAGE));
  const currentEvents = events.slice(
    (eventCurrentPage - 1) * ITEMS_PER_PAGE,
    eventCurrentPage * ITEMS_PER_PAGE
  );

  const handleCheckIn = async (id) => {
    try {
      // await checkIn(id);  // API call
      alert("Checked in successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckOut = async (id) => {
    try {
      // await checkOut(id);  // API call
      alert("Checked out successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  // --- Page 1: Events -------------------------------------------------------
  if (page === "events") {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Event Check-In / Check-Out</Text>
        </View>

        {loading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color="#0284c7" />
          </View>
        ) : (
          <>
            <FlatList
              data={currentEvents}
              keyExtractor={(item, idx) => idx.toString()}
              contentContainerStyle={s.list}
              ListEmptyComponent={
                <View style={s.emptyContainer}>
                  <Search size={40} color="#cbd5e1" />
                  <Text style={s.emptyText}>No approved events found</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={s.card}>
                  <View style={s.cardHeader}>
                    <Text style={s.eventCode}>{item.event_code}</Text>
                    <TouchableOpacity
                      style={s.eyeBtn}
                      onPress={() => {
                        setSelectedEvent(item);
                        setEntries([]);
                        setPage("entries");
                      }}
                    >
                      <Eye size={18} color="#0284c7" />
                      <Text style={s.eyeBtnText}>View</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={s.eventName}>{item.event_name}</Text>
                  <View style={s.statsRow}>
                    <View style={s.statBox}>
                      <Text style={s.statLabel}>Arrived</Text>
                      <Text style={s.statValue}>{item.arrived ?? 0}</Text>
                    </View>
                    <View style={s.statBox}>
                      <Text style={s.statLabel}>Departed</Text>
                      <Text style={s.statValue}>{item.departed ?? 0}</Text>
                    </View>
                    <View style={[s.statBox, s.statBoxGreen]}>
                      <Text style={s.statLabel}>Present</Text>
                      <Text style={[s.statValue, { color: "#15803d" }]}>{item.present ?? 0}</Text>
                    </View>
                  </View>
                </View>
              )}
            />
            {/* Pagination */}
            {eventTotalPages > 1 && (
              <View style={s.pagination}>
                <TouchableOpacity
                  disabled={eventCurrentPage === 1}
                  onPress={() => setEventCurrentPage((p) => Math.max(1, p - 1))}
                  style={s.pageBtn}
                >
                  <ChevronLeft size={20} color={eventCurrentPage === 1 ? "#cbd5e1" : "#0f172a"} />
                </TouchableOpacity>
                <Text style={s.pageText}>{eventCurrentPage} / {eventTotalPages}</Text>
                <TouchableOpacity
                  disabled={eventCurrentPage === eventTotalPages}
                  onPress={() => setEventCurrentPage((p) => Math.min(eventTotalPages, p + 1))}
                  style={s.pageBtn}
                >
                  <ChevronRight size={20} color={eventCurrentPage === eventTotalPages ? "#cbd5e1" : "#0f172a"} />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </SafeAreaView>
    );
  }

  // --- Page 2: Entries -----------------------------------------------------
  if (page === "entries") {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Check-In / Check-Out</Text>
          <TouchableOpacity style={s.backBtn} onPress={() => setPage("events")}>
            <X size={16} color="#0284c7" />
            <Text style={s.backBtnText}>Back</Text>
          </TouchableOpacity>
        </View>
        {selectedEvent && (
          <View style={s.subHeader}>
            <Text style={s.subHeaderText}>Event: {selectedEvent.event_name}</Text>
          </View>
        )}

        {loading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color="#0284c7" />
          </View>
        ) : entries.length === 0 ? (
          <View style={s.emptyContainer}>
            <Text style={s.emptyText}>No entries found for this event.</Text>
          </View>
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(item, idx) => idx.toString()}
            contentContainerStyle={s.list}
            renderItem={({ item }) => (
              <View style={s.card}>
                <View style={s.cardHeader}>
                  <Text style={s.eventCode}>{item.visitor_code}</Text>
                  <TouchableOpacity
                    style={s.eyeBtn}
                    onPress={() => { setSelectedEntry(item); setPage("details"); }}
                  >
                    <Eye size={16} color="#0284c7" />
                  </TouchableOpacity>
                </View>
                <Text style={s.eventName}>{item.name}</Text>
                <View style={s.timeRow}>
                  <Text style={s.timeLabel}>Check-In:</Text>
                  <Text style={s.timeVal}>{item.checkin_time || "---"}</Text>
                </View>
                <View style={s.timeRow}>
                  <Text style={s.timeLabel}>Check-Out:</Text>
                  <Text style={s.timeVal}>{item.checkout_time || "---"}</Text>
                </View>
                <View style={s.actionRow}>
                  {!item.checkin_time ? (
                    <TouchableOpacity style={s.checkInBtn} onPress={() => handleCheckIn(item.id)}>
                      <Text style={s.checkBtnText}>Check In</Text>
                    </TouchableOpacity>
                  ) : !item.checkout_time ? (
                    <TouchableOpacity style={s.checkOutBtn} onPress={() => handleCheckOut(item.id)}>
                      <Text style={s.checkBtnText}>Check Out</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={s.completedText}>Completed</Text>
                  )}
                </View>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    );
  }

  // --- Page 3: Details -----------------------------------------------------
  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Entry Details</Text>
        <TouchableOpacity style={s.backBtn} onPress={() => setPage("entries")}>
          <X size={16} color="#0284c7" />
          <Text style={s.backBtnText}>Back</Text>
        </TouchableOpacity>
      </View>
      {selectedEntry && (
        <View style={s.detailCard}>
          {[
            ["Visitor Code", selectedEntry.visitor_code],
            ["Name", selectedEntry.name],
            ["Email", selectedEntry.email],
            ["Phone", selectedEntry.phone],
            ["Check-In Time", selectedEntry.checkin_time || "Not Checked In"],
            ["Check-Out Time", selectedEntry.checkout_time || "Not Checked Out"],
          ].map(([label, value]) => (
            <View key={label} style={s.detailRow}>
              <Text style={s.detailLabel}>{label}</Text>
              <Text style={s.detailVal}>{value}</Text>
            </View>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#0c4a6e", flex: 1 },
  subHeader: { backgroundColor: "#f0f9ff", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  subHeaderText: { fontSize: 14, color: "#0284c7", fontWeight: "600" },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: "#bae6fd", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#f0f9ff" },
  backBtnText: { color: "#0284c7", fontSize: 13, fontWeight: "bold" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyText: { color: "#94a3b8", fontSize: 14, fontWeight: "bold" },

  list: { paddingHorizontal: 16, paddingBottom: 80, paddingTop: 12 },
  card: { backgroundColor: "#fff", borderRadius: 12, marginBottom: 14, padding: 16, borderWidth: 1, borderColor: "#e2e8f0", elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  eventCode: { fontSize: 12, fontWeight: "bold", color: "#0284c7", letterSpacing: 1 },
  eyeBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  eyeBtnText: { color: "#0284c7", fontSize: 13, fontWeight: "bold" },
  eventName: { fontSize: 15, fontWeight: "bold", color: "#0f172a", marginBottom: 10 },

  statsRow: { flexDirection: "row", gap: 8 },
  statBox: { flex: 1, backgroundColor: "#f1f5f9", borderRadius: 8, padding: 8, alignItems: "center" },
  statBoxGreen: { backgroundColor: "#f0fdf4" },
  statLabel: { fontSize: 10, color: "#64748b", fontWeight: "bold", marginBottom: 2 },
  statValue: { fontSize: 18, fontWeight: "bold", color: "#0f172a" },

  timeRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  timeLabel: { fontSize: 12, color: "#64748b", fontWeight: "bold", width: 90 },
  timeVal: { fontSize: 12, color: "#0f172a" },

  actionRow: { marginTop: 10, flexDirection: "row", justifyContent: "flex-end" },
  checkInBtn: { backgroundColor: "#16a34a", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  checkOutBtn: { backgroundColor: "#ef4444", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  checkBtnText: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  completedText: { color: "#64748b", fontStyle: "italic", fontSize: 13 },

  pagination: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#e2e8f0", backgroundColor: "#fff" },
  pageBtn: { padding: 8 },
  pageText: { fontSize: 14, fontWeight: "bold", color: "#0f172a", marginHorizontal: 16 },

  detailCard: { margin: 16, backgroundColor: "#fff", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  detailRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingVertical: 10 },
  detailLabel: { width: 130, fontSize: 13, color: "#64748b", fontWeight: "bold" },
  detailVal: { flex: 1, fontSize: 13, color: "#0f172a" },
});
