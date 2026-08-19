import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from "react-native";
import { Calendar, CheckCircle, Clock, PlusCircle, Settings, ArrowRight, Ticket, X } from "lucide-react-native";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getEventsshow } from "@Services/api";
import { Sidebar } from "./Homepage";

export const OrganizerWelcome = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const Redexorganizer = useSelector((state) => state.user);
  const [organizer, setOrganizer] = useState(Redexorganizer);

  useEffect(() => {
    const fetchUser = async () => {
      if (!Redexorganizer?.id) {
        const userId = await AsyncStorage.getItem("userId");
        const userName = await AsyncStorage.getItem("userName");
        if (userId) setOrganizer({ id: userId, name: userName });
      }
    };
    fetchUser();
  }, [Redexorganizer]);

  useEffect(() => {
    if (organizer?.id) {
      fetchEvents();
    }
  }, [organizer?.id]);

  const fetchEvents = async () => {
    try {
      const data = await getEventsshow(organizer.id);
      setEvents(data);
    } catch (err) {
      console.error(err);
    }
  };

  const totalEvents = events.length;
  const approvedEvents = events.filter(e => e.status === "APPROVED").length;
  const pendingEvents = events.filter(e => e.status === "PENDING" || e.status === "Pending").length;
  const rejectEvents = events.filter(e => e.status === "REJECTED" || e.status === "Rejected").length;

  const stats = [
    { title: "Total Events", value: totalEvents, icon: <Calendar size={24} color="#9333ea" />, color: "#faf5ff" },
    { title: "Approved Events", value: approvedEvents, icon: <CheckCircle size={24} color="#16a34a" />, color: "#f0fdf4" },
    { title: "Pending Events", value: pendingEvents, icon: <Clock size={24} color="#ea580c" />, color: "#fff7ed" },
    { title: "Rejected Events", value: rejectEvents, icon: <X size={24} color="#dc2626" />, color: "#fef2f2" },
  ];

  const quickActions = [
    { name: "Create New Event", icon: <PlusCircle size={20} color="#6b7280" />, screen: "CreateEvent" },
    { name: "Manage Venues", icon: <Settings size={20} color="#6b7280" />, screen: "Venu" },
    { name: "Ticketing & Passes", icon: <Ticket size={20} color="#6b7280" />, screen: "BulkPassPage" },
  ];

  return (
    <Sidebar navigation={navigation}>
    <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} style={s.container} keyboardShouldPersistTaps="handled">

        
        {/* HERO SECTION */}
        <View style={s.heroContainer}>
          <Text style={s.heroTitle}>Welcome Back,{"\n"}<Text style={s.heroHighlight}>Organizer!</Text></Text>
          <Text style={s.heroSubtitle}>Your command center for world-class events. Manage, track, and scale your productions with ease.</Text>
          
          <View style={s.heroBtns}>
            <TouchableOpacity style={s.primaryBtn} onPress={() => navigation.navigate("CreateEvent")}>
              <Text style={s.primaryBtnText}>Get Started</Text>
              <ArrowRight size={18} color="#7e22ce" />
            </TouchableOpacity>
            <TouchableOpacity style={s.secondaryBtn} onPress={() => navigation.navigate("LiveDashboard")}>
              <Text style={s.secondaryBtnText}>View Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* STATS GRID */}
        <View style={s.statsGrid}>
          {stats.map((stat, i) => (
            <View key={i} style={s.statCard}>
              <View style={[s.statIconBox, { backgroundColor: stat.color }]}>
                {stat.icon}
              </View>
              <Text style={s.statTitle}>{stat.title}</Text>
              <Text style={s.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* QUICK ACTIONS */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Quick Actions</Text>
          {quickActions.map((action, i) => (
            <TouchableOpacity key={i} style={s.actionBtn} onPress={() => navigation.navigate(action.screen)}>
              <View style={s.actionLeft}>
                <View style={s.actionIconBox}>{action.icon}</View>
                <Text style={s.actionText}>{action.name}</Text>
              </View>
              <ArrowRight size={18} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </View>

        {/* RECENT ACTIVITY */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Your Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate("CreateEvent")}>
              <Text style={s.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={s.activityList}>
            {events.slice(0, 3).map((e, i) => (
              <View key={i} style={s.activityCard}>
                <View style={s.activityImageContainer}>
                  {e.banner_url || e.images?.[0] ? (
                    <ImageBackground source={{ uri: e.banner_url || e.images?.[0] }} style={s.activityImage} />
                  ) : (
                    <Text style={s.activityIndex}>{i + 1}</Text>
                  )}
                </View>
                
                <View style={s.activityInfo}>
                  <Text style={s.activityEventName} numberOfLines={1}>{e.event_name}</Text>
                  <Text style={s.activityLocation} numberOfLines={1}>{e.venue}, {e.address}</Text>
                </View>
                
                <View style={s.activityStatusBox}>
                  <Text style={s.statusLabel}>STATUS</Text>
                  <View style={[
                    s.statusBadge, 
                    e.status === 'APPROVED' ? s.statusApproved : e.status === 'PENDING' ? s.statusPending : s.statusDefault
                  ]}>
                    <Text style={[
                      s.statusText,
                      e.status === 'APPROVED' ? s.statusTextApproved : e.status === 'PENDING' ? s.statusTextPending : s.statusTextDefault
                    ]}>{e.status}</Text>
                  </View>
                </View>
              </View>
            ))}
            {events.length === 0 && (
              <View style={s.emptyState}>
                <Text style={s.emptyStateText}>No recent events found. Try creating one!</Text>
              </View>
            )}
          </View>
        </View>

    </ScrollView>
    </Sidebar>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  
  heroContainer: { backgroundColor: "#8b5cf6", borderRadius: 20, padding: 24, marginBottom: 24 },
  heroTitle: { fontSize: 32, fontWeight: "800", color: "#ffffff", marginBottom: 12 },
  heroHighlight: { color: "#fde047" },
  heroSubtitle: { fontSize: 15, color: "rgba(255,255,255,0.9)", lineHeight: 22, marginBottom: 24 },
  heroBtns: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  primaryBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#ffffff", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, gap: 8 },
  primaryBtnText: { color: "#7e22ce", fontWeight: "bold", fontSize: 15 },
  secondaryBtn: { backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  secondaryBtnText: { color: "#ffffff", fontWeight: "bold", fontSize: 15 },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 24 },
  statCard: { width: "48%", backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  statIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  statTitle: { fontSize: 13, color: "#64748b", fontWeight: "500", marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: "bold", color: "#0f172a" },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1e293b", marginBottom: 12 },
  viewAllText: { color: "#9333ea", fontWeight: "600", fontSize: 14 },
  
  actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  actionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  actionIconBox: { backgroundColor: "#f8fafc", padding: 8, borderRadius: 8 },
  actionText: { fontSize: 15, fontWeight: "600", color: "#334155" },

  activityList: { backgroundColor: "#ffffff", borderRadius: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  activityCard: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  activityImageContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#f3e8ff", alignItems: "center", justifyContent: "center", overflow: "hidden", borderWidth: 2, borderColor: "#ffffff" },
  activityImage: { width: "100%", height: "100%", resizeMode: "cover" },
  activityIndex: { color: "#9333ea", fontWeight: "bold", fontSize: 16 },
  activityInfo: { flex: 1, marginLeft: 12 },
  activityEventName: { fontSize: 15, fontWeight: "bold", color: "#1e293b", marginBottom: 4 },
  activityLocation: { fontSize: 13, color: "#64748b" },
  activityStatusBox: { alignItems: "flex-end" },
  statusLabel: { fontSize: 10, fontWeight: "bold", color: "#94a3b8", marginBottom: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusApproved: { backgroundColor: "#dcfce7" },
  statusPending: { backgroundColor: "#fef08a" },
  statusDefault: { backgroundColor: "#f1f5f9" },
  statusText: { fontSize: 10, fontWeight: "bold" },
  statusTextApproved: { color: "#166534" },
  statusTextPending: { color: "#854d0e" },
  statusTextDefault: { color: "#334155" },
  
  emptyState: { padding: 32, alignItems: "center" },
  emptyStateText: { color: "#64748b", fontSize: 14 }
});

export default OrganizerWelcome;
