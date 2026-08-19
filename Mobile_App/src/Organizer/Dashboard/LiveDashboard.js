import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye, Search } from "lucide-react-native";
import { getevent } from "@Services/api";

export const LiveDashboard = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");

  const getEvents = async () => {
    try {
      const res = await getevent();
      setEvents(res.data || []);
    } catch (err) {
      console.log("API Error:", err);
    }
  };

  useEffect(() => { getEvents(); }, []);

  const filtered = events.filter((e) =>
    (e.event_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.pageTitle}>Live Dashboard</Text>

        <View style={styles.searchBar}>
          <Search size={16} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Keyword..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#94a3b8"
          />
        </View>

        {filtered.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyEmoji}>??</Text>
            <Text style={styles.emptyText}>No events found</Text>
          </View>
        ) : (
          filtered.map((event, i) => (
            <View key={i} style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeText}>{event.event_code}</Text>
                </View>
                <Text style={styles.eventName} numberOfLines={1}>{event.event_name}</Text>
              </View>
              <TouchableOpacity style={styles.viewBtn}>
                <Eye size={16} color="#0284c7" />
                <Text style={styles.viewBtnText}>View</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 22, fontWeight: "bold", color: "#0f172a", marginBottom: 16 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 12, marginBottom: 16, gap: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: "#0f172a" },
  center: { alignItems: "center", paddingVertical: 40 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: "#94a3b8", fontSize: 14 },
  card: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", padding: 14, marginBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardContent: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  codeBadge: { backgroundColor: "#e0f2fe", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  codeText: { fontSize: 11, fontWeight: "bold", color: "#0369a1" },
  eventName: { fontSize: 14, fontWeight: "600", color: "#1e293b", flex: 1 },
  viewBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#2563eb", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  viewBtnText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
});

export default LiveDashboard;
