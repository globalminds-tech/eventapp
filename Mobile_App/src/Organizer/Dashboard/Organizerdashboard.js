import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Menu, Coffee, Utensils, Pizza, Moon, Users, Store, UserPlus,
  ChevronDown, Search, Filter, Plus, LayoutDashboard, QrCode,
  IndianRupee, Activity, CalendarDays, ExternalLink, Edit3, Trash2, Eye, Pencil, PlusCircle, Calendar, Ticket, Bell, ShieldCheck, X, RefreshCw
} from "lucide-react-native";
import { Sidebar } from "../../components/Sidebar";
import { getevent } from "@Services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const formatLakhs = (amount) => {
  const num = Math.round(Number(amount) || 0);
  if (num >= 100000) {
    const lakh = (num / 100000).toFixed(2);
    return `₹${lakh.endsWith(".00") ? lakh.slice(0, -3) : lakh} L`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
};

const getEventTabStatus = (e) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sDate = e?.event_date ? new Date(e.event_date) : (e?.start_date ? new Date(e.start_date) : null);
  const eDate = e?.end_date ? new Date(e.end_date) : (sDate ? new Date(sDate) : null);

  if (sDate) sDate.setHours(0, 0, 0, 0);
  if (eDate) eDate.setHours(23, 59, 59, 999);

  if (e?.status === "Draft") return "Draft";
  if (eDate && today > eDate) return "Past";
  if (sDate && today < sDate) return "Upcoming";
  return "Active";
};

export const Organizerdashboard = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [organizerName, setOrganizerName] = useState("Organizer");
  const [organizerCompany, setOrganizerCompany] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedEventId, setSelectedEventId] = useState("all");
  const [activeModal, setActiveModal] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const name = await AsyncStorage.getItem("name");
      const company = await AsyncStorage.getItem("organization_name");
      if (name) setOrganizerName(name);
      if (company) setOrganizerCompany(company);

      const res = await getevent();
      let extractedEvents = [];
      if (Array.isArray(res)) {
        extractedEvents = res;
      } else if (res && Array.isArray(res.data)) {
        extractedEvents = res.data;
      } else if (res && res.data && Array.isArray(res.data.data)) {
        extractedEvents = res.data.data;
      }
      setEvents(extractedEvents);
    } catch (error) {
      console.log("Error fetching events", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const scopedEvents = selectedEventId === "all" 
    ? events 
    : events.filter(e => String(e.id) === String(selectedEventId) || String(e.event_code) === String(selectedEventId));

  const totalCapacitySum = scopedEvents.reduce((acc, e) => acc + Number(e?.totalCapacity || e?.capacity || e?.total_capacity || 500), 0);
  const totalPassesSold = scopedEvents.reduce((acc, e) => acc + Number(e?.passesSold || e?.passes_sold || e?.booking?.capacity || 0), 0);
  const ticketsPercentage = totalCapacitySum > 0 ? Math.min(100, Math.round((totalPassesSold / totalCapacitySum) * 100)) : 0;

  const ticketRevenue = scopedEvents.reduce((acc, e) => {
    const price = Number(e?.price_inr || e?.priceINR || e?.price || e?.pass_fee || 0);
    const sold = Number(e?.passesSold || e?.passes_sold || 0);
    return acc + (price * sold);
  }, 0);

  const stallsCapacitySum = scopedEvents.reduce((acc, e) => acc + Number(e?.total_stalls || e?.stalls_capacity || 50), 0);
  const stallsBookedCount = scopedEvents.reduce((acc, e) => acc + Number(e?.stalls_booked || e?.stallsBooked || e?.reserved_stalls || (e?.stalls ? e.stalls.length : 0)), 0);
  const stallsAvailable = Math.max(0, stallsCapacitySum - stallsBookedCount);
  const stallsPercentage = stallsCapacitySum > 0 ? Math.min(100, Math.round((stallsBookedCount / stallsCapacitySum) * 100)) : 0;

  const stallRevenue = scopedEvents.reduce((acc, e) => acc + Number(e?.stall_revenue || e?.stallRevenue || 0), 0);
  const totalGrossRevenue = ticketRevenue + stallRevenue;

  const totalGateScans = scopedEvents.reduce((acc, e) => acc + Number(e?.gateScans || e?.arrived || 0), 0);
  const checkInPercentage = totalPassesSold > 0 ? Math.min(100, Math.round((totalGateScans / totalPassesSold) * 100)) : 0;

  const mealsGivenCount = scopedEvents.reduce((acc, e) => acc + Number(e?.food_passes || e?.foodPasses || e?.food_issued || (e?.food ? totalPassesSold : 0)), 0);
  const totalMealPassesSum = totalPassesSold > 0 ? totalPassesSold : 1500;
  const mealsPercentage = totalMealPassesSum > 0 ? Math.min(100, Math.round((mealsGivenCount / totalMealPassesSum) * 100)) : 0;

  const upcomingEventsList = events.filter((e) => {
    const sDate = e?.event_date ? new Date(e.event_date) : (e?.start_date ? new Date(e.start_date) : null);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sDate && sDate >= today;
  });

  const nextUpcomingEvent = upcomingEventsList.length > 0 
    ? (upcomingEventsList[0].name || upcomingEventsList[0].event_name) 
    : null;

  const pendingApprovalsCount = events.filter((e) => ["Pending", "Draft"].includes(e?.status || e?.event_status)).length;
  const thingsToDoCount = pendingApprovalsCount > 0 ? pendingApprovalsCount : 0;

  const filteredEvents = scopedEvents.filter((evt) => {
    if (!evt) return false;
    const evtName = evt.name || evt.event_name || "";
    const evtCode = evt.code || evt.event_code || "";
    const evtCat = evt.category || evt.main_category_name || "";

    const matchesSearch = searchQuery === "" || 
      evtName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evtCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evtCat.toLowerCase().includes(searchQuery.toLowerCase());

    const tabStatus = getEventTabStatus(evt).toLowerCase();
    if (selectedTab === "all") return matchesSearch;
    if (selectedTab === "active") return matchesSearch && tabStatus === "active";
    if (selectedTab === "upcoming") return matchesSearch && tabStatus === "upcoming";
    if (selectedTab === "past") return matchesSearch && tabStatus === "past";
    if (selectedTab === "draft") return matchesSearch && tabStatus === "draft";
    return matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderKpiCard = (title, icon, value, subtext, colorObj, modalKey) => (
    <TouchableOpacity
      style={[styles.kpiCard, thingsToDoCount > 0 && modalKey === 'tasks' ? styles.kpiCardAlert : {}]}
      onPress={() => setActiveModal(modalKey)}
      activeOpacity={0.8}
    >
      <View style={styles.kpiHeader}>
        <Text style={styles.kpiTitle}>{title}</Text>
        <View style={[styles.kpiIconWrap, { backgroundColor: colorObj.bg }]}>
          {icon(colorObj.text)}
        </View>
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={[styles.kpiSub, { color: colorObj.text }]} numberOfLines={1}>{subtext}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      <Sidebar 
        isVisible={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        navigation={navigation} 
        activeRoute="Organizerdashboard"
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <TouchableOpacity onPress={() => setIsSidebarOpen(true)} style={{ marginRight: 12 }}>
              <Menu size={24} color="#0f172a" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Welcome back, {organizerName}!</Text>
            {organizerCompany ? (
              <View style={styles.companyBadge}>
                <Text style={styles.companyBadgeText}>{organizerCompany}</Text>
                <ShieldCheck size={12} color="#0891b2" style={{ marginLeft: 4 }} />
              </View>
            ) : null}
          </View>
          <Text style={styles.headerSub}>Here's how your events are doing.</Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.refreshBtn} onPress={fetchDashboardData}>
              <RefreshCw size={14} color="#64748b" />
              <Text style={styles.refreshBtnText}>Refresh Data</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.createBtn} 
              onPress={() => navigation.navigate("CreateEvent")}
            >
              <PlusCircle size={14} color="#ffffff" />
              <Text style={styles.createBtnText}>Create New Event</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* KPIs Grid */}
        <View style={styles.kpiGrid}>
          {renderKpiCard("Tickets Sold", (c) => <Ticket size={18} color={c} />, totalPassesSold.toLocaleString(), `${ticketsPercentage}% of available tickets`, { bg: "#eff6ff", text: "#2563eb" }, 'tickets')}
          {renderKpiCard("Money Collected", (c) => <IndianRupee size={18} color={c} />, formatLakhs(ticketRevenue), "From ticket sales", { bg: "#ecfdf5", text: "#059669" }, 'money')}
          {renderKpiCard("Stalls Booked", (c) => <Store size={18} color={c} />, `${stallsBookedCount} / ${stallsCapacitySum}`, `${stallsAvailable} stalls still available`, { bg: "#faf5ff", text: "#9333ea" }, 'stalls')}
          {renderKpiCard("Total Earnings", (c) => <IndianRupee size={18} color={c} />, formatLakhs(totalGrossRevenue), "Tickets + stall bookings", { bg: "#d1fae5", text: "#047857" }, 'earnings')}
          {renderKpiCard("People Checked In", (c) => <QrCode size={18} color={c} />, totalGateScans.toLocaleString(), totalPassesSold > 0 ? `${totalGateScans} / ${totalPassesSold} (${checkInPercentage}%)` : "Event check-in ready", { bg: "#ecfeff", text: "#0891b2" }, 'checkin')}
          {renderKpiCard("Meals Given Out", (c) => <Utensils size={18} color={c} />, mealsGivenCount.toLocaleString(), `${mealsPercentage}% of meal passes used`, { bg: "#fffbeb", text: "#d97706" }, 'meals')}
          {renderKpiCard("Upcoming Events", (c) => <Calendar size={18} color={c} />, upcomingEventsList.length.toString(), nextUpcomingEvent ? `Next: ${nextUpcomingEvent}` : "No upcoming events", { bg: "#eef2ff", text: "#4f46e5" }, 'upcoming')}
          {renderKpiCard("Things To Do", (c) => <Bell size={18} color={c} />, thingsToDoCount.toString(), thingsToDoCount > 0 ? `${thingsToDoCount} items need attention` : "You're all caught up ✓", thingsToDoCount > 0 ? { bg: "#fef3c7", text: "#b45309" } : { bg: "#ecfdf5", text: "#059669" }, 'tasks')}
        </View>

        {/* My Events Section */}
        <View style={styles.eventsSection}>
          <View style={styles.eventsHeader}>
            <Text style={styles.eventsTitle}>My Events</Text>
            <View style={styles.eventsBadge}>
              <Text style={styles.eventsBadgeText}>{filteredEvents.length} Events</Text>
            </View>
          </View>

          {/* Filter Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
            {[{ label: "All", value: "all" }, { label: "Active", value: "active" }, { label: "Upcoming", value: "upcoming" }, { label: "Past", value: "past" }, { label: "Draft", value: "draft" }].map(t => (
              <TouchableOpacity
                key={t.value}
                style={[styles.tabBtn, selectedTab === t.value && styles.tabBtnActive]}
                onPress={() => setSelectedTab(t.value)}
              >
                <Text style={[styles.tabBtnText, selectedTab === t.value && styles.tabBtnTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Search Bar */}
          <View style={styles.searchWrap}>
            <Search size={16} color="#94a3b8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search events..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Events List */}
          <View style={styles.eventsList}>
            {filteredEvents.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No events found</Text>
                <Text style={styles.emptyStateSub}>Create your first event to start managing registrations.</Text>
                <TouchableOpacity style={styles.emptyCreateBtn} onPress={() => navigation.navigate("CreateEvent")}>
                  <Text style={styles.emptyCreateBtnText}>+ Create New Event</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredEvents.map(evt => {
                const eventStatus = getEventTabStatus(evt);
                return (
                  <View key={evt.id} style={styles.eventCard}>
                    <View style={styles.eventCardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.eventName}>{evt.name || evt.event_name || "Untitled Event"}</Text>
                        <Text style={styles.eventMeta}>{evt.category || "General"} • {evt.city || evt.venue || "Venue TBD"}</Text>
                      </View>
                      <View style={styles.eventStatusWrap}>
                        <View style={[styles.eventStatusDot, eventStatus === "Active" ? { backgroundColor: "#10b981" } : eventStatus === "Upcoming" ? { backgroundColor: "#06b6d4" } : { backgroundColor: "#94a3b8" }]} />
                        <Text style={styles.eventStatusText}>{eventStatus}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.eventMetricsGrid}>
                      <View style={styles.eventMetricBox}>
                        <Text style={styles.eventMetricLabel}>DATE</Text>
                        <Text style={styles.eventMetricValue}>{formatDate(evt.event_date || evt.start_date)}</Text>
                      </View>
                      <View style={styles.eventMetricBox}>
                        <Text style={styles.eventMetricLabel}>TICKETS</Text>
                        <Text style={styles.eventMetricValue}>{Number(evt.passesSold || evt.passes_sold || 0).toLocaleString()} / {Number(evt.totalCapacity || evt.capacity || evt.total_capacity || 500).toLocaleString()}</Text>
                      </View>
                      <View style={styles.eventMetricBox}>
                        <Text style={styles.eventMetricLabel}>STALLS</Text>
                        <Text style={styles.eventMetricValue}>{Number(evt.stalls_booked || evt.stallsBooked || 0)} / {Number(evt.total_stalls || 50)}</Text>
                      </View>
                      <View style={styles.eventMetricBox}>
                        <Text style={styles.eventMetricLabel}>EARNINGS</Text>
                        <Text style={styles.eventMetricValue}>{formatLakhs(Number(evt.price_inr || evt.priceINR || evt.price || evt.pass_fee || 0) * Number(evt.passesSold || evt.passes_sold || 0))}</Text>
                      </View>
                    </View>

                    <View style={styles.eventActionsRow}>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("ViewEvent", { mode: "view", isReadOnly: true, eventData: evt, eventId: evt.id })}>
                        <Eye size={16} color="#0284c7" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("EditEvent", { eventData: evt, eventId: evt.id })}>
                        <Pencil size={16} color="#4f46e5" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("GateCheckIn", { eventId: evt.id })}>
                        <QrCode size={16} color="#059669" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>

      </ScrollView>

      {/* KPI DETAIL MODALS */}
      <Modal visible={!!activeModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setActiveModal(null)}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Detail Analytics</Text>
            <Text style={styles.modalDesc}>Check your desktop portal for comprehensive breakdown.</Text>
            
            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalPrimaryBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { padding: 16, paddingBottom: 60 },

  header: { marginBottom: 20 },
  titleRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", marginBottom: 4 },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#0f172a", marginRight: 8 },
  companyBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#ecfeff", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: "#cffafe" },
  companyBadgeText: { fontSize: 11, fontWeight: "800", color: "#164e63" },
  headerSub: { fontSize: 13, fontWeight: "500", color: "#64748b", marginBottom: 16 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  refreshBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e2e8f0", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, gap: 6 },
  refreshBtnText: { fontSize: 12, fontWeight: "700", color: "#475569" },
  createBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#0284c7", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, gap: 6 },
  createBtnText: { fontSize: 12, fontWeight: "800", color: "#ffffff" },

  kpiGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 24 },
  kpiCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  kpiCardAlert: { borderColor: "#fcd34d", borderWidth: 2 },
  kpiHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  kpiTitle: { fontSize: 10, fontWeight: "800", color: "#64748b", textTransform: "uppercase", width: "65%" },
  kpiIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  kpiValue: { fontSize: 20, fontWeight: "900", color: "#0f172a", marginBottom: 4 },
  kpiSub: { fontSize: 10, fontWeight: "700" },

  eventsSection: { backgroundColor: "#ffffff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  eventsHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  eventsTitle: { fontSize: 18, fontWeight: "900", color: "#0f172a" },
  eventsBadge: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  eventsBadgeText: { fontSize: 11, fontWeight: "800", color: "#475569" },

  tabsContainer: { flexDirection: "row", gap: 8, marginBottom: 16 },
  tabBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: "#f1f5f9" },
  tabBtnActive: { backgroundColor: "#0f172a" },
  tabBtnText: { fontSize: 12, fontWeight: "800", color: "#64748b" },
  tabBtnTextActive: { color: "#ffffff" },

  searchWrap: { flexDirection: "row", alignItems: "center", backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, paddingHorizontal: 12, height: 42, marginBottom: 16 },
  searchInput: { flex: 1, fontSize: 13, fontWeight: "600", color: "#0f172a" },

  eventsList: { gap: 12 },
  eventCard: { borderWidth: 1, borderColor: "#f1f5f9", borderRadius: 14, padding: 14, backgroundColor: "#fafaf9" },
  eventCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  eventName: { fontSize: 15, fontWeight: "800", color: "#0f172a", marginBottom: 4 },
  eventMeta: { fontSize: 11, fontWeight: "600", color: "#64748b" },
  eventStatusWrap: { flexDirection: "row", alignItems: "center", backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e2e8f0", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, gap: 4 },
  eventStatusDot: { width: 6, height: 6, borderRadius: 3 },
  eventStatusText: { fontSize: 10, fontWeight: "800", color: "#475569" },

  eventMetricsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 12 },
  eventMetricBox: { width: "48%", backgroundColor: "#ffffff", padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "#f1f5f9", marginBottom: 8 },
  eventMetricLabel: { fontSize: 9, fontWeight: "800", color: "#94a3b8", marginBottom: 2 },
  eventMetricValue: { fontSize: 12, fontWeight: "800", color: "#0f172a" },

  eventActionsRow: { flexDirection: "row", justifyContent: "flex-end", gap: 8, borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 12 },
  actionBtn: { backgroundColor: "#ffffff", padding: 8, borderRadius: 8, borderWidth: 1, borderColor: "#e2e8f0" },

  emptyState: { alignItems: "center", paddingVertical: 32 },
  emptyStateTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 8 },
  emptyStateSub: { fontSize: 12, color: "#64748b", textAlign: "center", marginBottom: 16, paddingHorizontal: 20 },
  emptyCreateBtn: { backgroundColor: "#0891b2", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  emptyCreateBtnText: { fontSize: 13, fontWeight: "800", color: "#ffffff" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.6)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { width: "100%", backgroundColor: "#ffffff", borderRadius: 20, padding: 24, alignItems: "center" },
  closeModalBtn: { position: "absolute", top: 16, right: 16, padding: 4 },
  modalTitle: { fontSize: 18, fontWeight: "900", color: "#0f172a", marginBottom: 8, marginTop: 10 },
  modalDesc: { fontSize: 13, color: "#64748b", textAlign: "center", marginBottom: 24 },
  modalPrimaryBtn: { width: "100%", backgroundColor: "#0f172a", paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  modalPrimaryBtnText: { color: "#ffffff", fontSize: 14, fontWeight: "800" },
});

export default Organizerdashboard;
