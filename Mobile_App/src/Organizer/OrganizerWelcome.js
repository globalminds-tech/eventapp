import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, StatusBar } from "react-native";
import { Calendar, CheckCircle, Clock, PlusCircle, Settings, ArrowRight, Ticket, X, ShieldCheck, BarChart2, ScanLine, Building2, UserCheck } from "lucide-react-native";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getEventsshow } from "@Services/api";
import { Sidebar } from "./Homepage";

export const OrganizerWelcome = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const Redexorganizer = useSelector((state) => state.user);
  const [organizer, setOrganizer] = useState(Redexorganizer);
  const [kycCompleted, setKycCompleted] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!Redexorganizer?.id) {
        const userId = await AsyncStorage.getItem("userId");
        const userName = await AsyncStorage.getItem("userName");
        if (userId) setOrganizer({ id: userId, name: userName });
      }
      
      const kycData = await AsyncStorage.getItem("@organizer_kyc_data");
      if (kycData) {
        const parsed = JSON.parse(kycData);
        if (parsed?.accountNumber) setKycCompleted(true);
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
      if (data && Array.isArray(data)) {
        setEvents(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalEvents = events.length;
  const approvedEvents = events.filter(e => e.status === "APPROVED").length;
  const pendingEvents = events.filter(e => e.status === "PENDING" || e.status === "Pending").length;
  const rejectEvents = events.filter(e => e.status === "REJECTED" || e.status === "Rejected").length;

  const stats = [
    { title: "Total Events", value: totalEvents, icon: <Calendar size={22} color="#0284c7" />, color: "#e0f2fe" },
    { title: "Live / Approved", value: approvedEvents, icon: <CheckCircle size={22} color="#16a34a" />, color: "#dcfce7" },
    { title: "Pending Review", value: pendingEvents, icon: <Clock size={22} color="#ea580c" />, color: "#ffedd5" },
    { title: "Action Needed", value: rejectEvents, icon: <X size={22} color="#dc2626" />, color: "#fee2e2" },
  ];

  const quickActions = [
    { name: "Create New Event (Wizard)", sub: "7-step DIY setup with Excel quick fill", icon: <PlusCircle size={22} color="#0284c7" />, screen: "CreateEvent", badge: "NEW" },
    { name: "Account Setup & KYC", sub: "Verify bank payouts & business details", icon: <UserCheck size={22} color="#16a34a" />, screen: "OrganizerKYC", badge: kycCompleted ? "VERIFIED ✓" : "ACTION" },
    { name: "Gate Scanner & Check-In", sub: "Scan attendee QR codes live at venue", icon: <ScanLine size={22} color="#8b5cf6" />, screen: "EventCheckIn" },
    { name: "Live Sales & Gate Analytics", sub: "Real-time ticket revenue & stats", icon: <BarChart2 size={22} color="#f59e0b" />, screen: "LiveDashboard" },
    { name: "Venues & Vendor Master", sub: "Manage location & vendor master data", icon: <Building2 size={22} color="#64748b" />, screen: "Venu" },
  ];

  return (
    <Sidebar navigation={navigation}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} style={s.container} keyboardShouldPersistTaps="handled">
        
        {/* EXECUTIVE HERO HEADER */}
        <View style={s.heroContainer}>
          <View style={s.heroBadgeRow}>
            <View style={s.badgeVerified}>
              <ShieldCheck size={14} color="#0284c7" />
              <Text style={s.badgeVerifiedText}>PRO ORGANIZER PORTAL</Text>
            </View>
          </View>
          <Text style={s.heroTitle}>Welcome Back,{"\n"}<Text style={s.heroHighlight}>{organizer?.name || "Organizer"}</Text></Text>
          <Text style={s.heroSubtitle}>Your command center for event production, ticketing, and live gate management.</Text>
          
          <View style={s.heroBtns}>
            <TouchableOpacity style={s.primaryBtn} onPress={() => navigation.navigate("CreateEvent")}>
              <Text style={s.primaryBtnText}>Create New Event</Text>
              <ArrowRight size={18} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={s.secondaryBtn} onPress={() => navigation.navigate("OrganizerKYC")}>
              <Text style={s.secondaryBtnText}>KYC Setup</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* KYC STATUS PROMPT BANNER */}
        {!kycCompleted && (
          <TouchableOpacity style={s.kycPromptBanner} onPress={() => navigation.navigate("OrganizerKYC")}>
            <View style={s.kycPromptLeft}>
              <UserCheck size={20} color="#0369a1" />
              <View style={{ marginLeft: 10 }}>
                <Text style={s.kycPromptTitle}>Complete Your Account Setup (KYC)</Text>
                <Text style={s.kycPromptSub}>Add bank details to enable direct ticket payout deposits.</Text>
              </View>
            </View>
            <ArrowRight size={16} color="#0369a1" />
          </TouchableOpacity>
        )}

        {/* METRICS STATS GRID */}
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

        {/* CORE UX ACTION CARDS */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Organizer Action Hub</Text>
          {quickActions.map((action, i) => (
            <TouchableOpacity key={i} style={s.actionBtn} onPress={() => navigation.navigate(action.screen)}>
              <View style={s.actionLeft}>
                <View style={s.actionIconBox}>{action.icon}</View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={s.actionText}>{action.name}</Text>
                    {action.badge && (
                      <View style={[s.actionTag, action.badge === "VERIFIED ✓" ? s.actionTagGreen : s.actionTagBlue]}>
                        <Text style={[s.actionTagText, action.badge === "VERIFIED ✓" ? s.actionTagTextGreen : s.actionTagTextBlue]}>
                          {action.badge}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.actionSubText}>{action.sub}</Text>
                </View>
              </View>
              <ArrowRight size={18} color="#94a3b8" />
            </TouchableOpacity>
          ))}
        </View>

        {/* RECENT EVENTS */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Your Active Events</Text>
            <TouchableOpacity onPress={() => navigation.navigate("EventsPage")}>
              <Text style={s.viewAllText}>View Directory ›</Text>
            </TouchableOpacity>
          </View>

          <View style={s.activityList}>
            {events.length > 0 ? (
              events.slice(0, 3).map((e, i) => (
                <TouchableOpacity key={i} style={s.activityCard} onPress={() => navigation.navigate("EventsPage")}>
                  <View style={s.activityImageContainer}>
                    {e.banner_url || e.images?.[0] ? (
                      <ImageBackground source={{ uri: e.banner_url || e.images?.[0] }} style={s.activityImage} />
                    ) : (
                      <Text style={s.activityIndex}>{i + 1}</Text>
                    )}
                  </View>
                  
                  <View style={s.activityInfo}>
                    <Text style={s.activityEventName} numberOfLines={1}>{e.event_name}</Text>
                    <Text style={s.activityLocation} numberOfLines={1}>{e.venue || "Venue TBD"}</Text>
                  </View>

                  <View style={[s.statusBadge, e.status === "APPROVED" ? s.statusApproved : s.statusPending]}>
                    <Text style={[s.statusText, e.status === "APPROVED" ? s.statusTextApproved : s.statusTextPending]}>
                      {e.status || "DRAFT"}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={s.emptyEventsBox}>
                <Text style={s.emptyEventsTitle}>No events created yet</Text>
                <Text style={s.emptyEventsSub}>Use our 7-step wizard to set up your first live event.</Text>
                <TouchableOpacity style={s.createFirstBtn} onPress={() => navigation.navigate("CreateEvent")}>
                  <Text style={s.createFirstBtnText}>+ Create First Event</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

      </ScrollView>
    </Sidebar>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroContainer: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  heroBadgeRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  badgeVerified: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  badgeVerifiedText: {
    color: "#38bdf8",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#ffffff",
    marginBottom: 6,
  },
  heroHighlight: {
    color: "#38bdf8",
  },
  heroSubtitle: {
    fontSize: 13,
    color: "#cbd5e1",
    lineHeight: 18,
    marginBottom: 16,
  },
  heroBtns: {
    flexDirection: "row",
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: "#0284c7",
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  primaryBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },
  secondaryBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  kycPromptBanner: {
    backgroundColor: "#e0f2fe",
    borderWidth: 1,
    borderColor: "#bae6fd",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  kycPromptLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  kycPromptTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0369a1",
  },
  kycPromptSub: {
    fontSize: 11,
    color: "#0284c7",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 10,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  statIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0f172a",
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0284c7",
  },
  actionBtn: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  actionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  actionSubText: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  actionTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  actionTagBlue: {
    backgroundColor: "#e0f2fe",
  },
  actionTagGreen: {
    backgroundColor: "#dcfce7",
  },
  actionTagText: {
    fontSize: 9,
    fontWeight: "900",
  },
  actionTagTextBlue: {
    color: "#0284c7",
  },
  actionTagTextGreen: {
    color: "#16a34a",
  },
  activityList: {
    gap: 10,
  },
  activityCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  activityImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityImage: {
    width: "100%",
    height: "100%",
  },
  activityIndex: {
    fontWeight: "800",
    color: "#64748b",
  },
  activityInfo: {
    flex: 1,
  },
  activityEventName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  activityLocation: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusApproved: {
    backgroundColor: "#dcfce7",
  },
  statusPending: {
    backgroundColor: "#ffedd5",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },
  statusTextApproved: {
    color: "#16a34a",
  },
  statusTextPending: {
    color: "#ea580c",
  },
  emptyEventsBox: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  emptyEventsTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  emptyEventsSub: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 14,
  },
  createFirstBtn: {
    backgroundColor: "#0284c7",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  createFirstBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },
});

export default OrganizerWelcome;

