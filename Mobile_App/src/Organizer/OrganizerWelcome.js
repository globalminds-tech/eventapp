import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Calendar, CheckCircle, Clock, PlusCircle, Settings, ArrowRight, Ticket, X,
  ShieldCheck, BarChart2, ScanLine, Building2, UserCheck, Home, AlertTriangle,
  ArrowUpRight, Utensils, Users, TrendingUp, Layers, LogOut, Sparkles, User
} from "lucide-react-native";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getEventsshow } from "@Services/api";
import { Sidebar } from "./Homepage";
import { BottomNav } from "../components/ui/BottomNav";
import BrandLogo from "../components/ui/BrandLogo";

// Shadcn Primitive Components
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

export const OrganizerWelcome = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
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

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace("Login");
  };

  const totalEvents = events.length || 6;
  const approvedEvents = events.filter(e => e.status === "APPROVED").length || 1;

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#ea580c" />

      {/* BookMyEvent Orange Production Curved Header Arch */}
      <View style={s.headerArch}>
        <View style={s.headerTopRow}>
          <View>
            <BrandLogo />
            <Text style={s.headerSub}>Production Host & Live Operations Command</Text>
          </View>

          <TouchableOpacity style={s.profileAvatarBtn} onPress={() => navigation.navigate("MyProfile")}>
            <User size={20} color="#ea580c" />
          </TouchableOpacity>
        </View>

        {/* Dynamic Metric Stat Banner */}
        <View style={s.headerStatsRow}>
          <View style={s.headerStatItem}>
            <Text style={s.headerStatVal}>₹12.8L</Text>
            <Text style={s.headerStatLbl}>Gross Revenue</Text>
          </View>
          <View style={s.headerStatDivider} />
          <View style={s.headerStatItem}>
            <Text style={s.headerStatVal}>4,820</Text>
            <Text style={s.headerStatLbl}>Tickets Sold</Text>
          </View>
          <View style={s.headerStatDivider} />
          <View style={s.headerStatItem}>
            <Text style={s.headerStatVal}>80.3%</Text>
            <Text style={s.headerStatLbl}>Occupancy</Text>
          </View>
        </View>
      </View>

      {/* White Content Sheet */}
      <View style={s.whiteSheet}>
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Section 1: Needs Your Attention - 2-Column Grid */}
          <View style={s.sectionHeaderRow}>
            <Text style={s.sectionTitle}>Needs Your Attention</Text>
            <Badge variant="warning">3 Action Items</Badge>
          </View>

          <View style={s.twoColumnGrid}>
            {!kycCompleted && (
              <TouchableOpacity
                style={[s.gridCardItem, { borderLeftColor: "#f97316", borderLeftWidth: 3.5 }]}
                onPress={() => navigation.navigate("OrganizerKYC")}
                activeOpacity={0.8}
              >
                <View style={s.cardHeaderRow}>
                  <Text style={s.gridCardLabel}>Account KYC</Text>
                  <Badge variant="warning">ACTION</Badge>
                </View>
                <Text style={s.gridCardSub}>Submit bank details</Text>
                <View style={s.gridCardCta}>
                  <Text style={[s.gridCardCtaText, { color: "#f97316" }]}>Complete KYC</Text>
                  <ArrowUpRight size={13} color="#f97316" />
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[s.gridCardItem, { borderLeftColor: "#ef4444", borderLeftWidth: 3.5 }]}
              onPress={() => navigation.navigate("EventsPage")}
              activeOpacity={0.8}
            >
              <View style={s.cardHeaderRow}>
                <Text style={s.gridCardLabel}>VIP Tickets</Text>
                <Badge variant="danger">96% SOLD</Badge>
              </View>
              <Text style={s.gridCardSub}>482 / 500 sold</Text>
              <View style={s.gridCardCta}>
                <Text style={[s.gridCardCtaText, { color: "#ef4444" }]}>Manage Tiers</Text>
                <ArrowUpRight size={13} color="#ef4444" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.gridCardItem, { borderLeftColor: "#8b5cf6", borderLeftWidth: 3.5 }]}
              onPress={() => navigation.navigate("EventCheckIn")}
              activeOpacity={0.8}
            >
              <View style={s.cardHeaderRow}>
                <Text style={s.gridCardLabel}>Gate Staff</Text>
                <Badge variant="info">2 UNASSIGNED</Badge>
              </View>
              <Text style={s.gridCardSub}>Main scanner staff</Text>
              <View style={s.gridCardCta}>
                <Text style={[s.gridCardCtaText, { color: "#8b5cf6" }]}>Assign Staff</Text>
                <ArrowUpRight size={13} color="#8b5cf6" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.gridCardItem, { borderLeftColor: "#10b981", borderLeftWidth: 3.5 }]}
              onPress={() => navigation.navigate("LiveFooddashboard")}
              activeOpacity={0.8}
            >
              <View style={s.cardHeaderRow}>
                <Text style={s.gridCardLabel}>Food Passes</Text>
                <Badge variant="success">LUNCH READY</Badge>
              </View>
              <Text style={s.gridCardSub}>2,940 meals served</Text>
              <View style={s.gridCardCta}>
                <Text style={[s.gridCardCtaText, { color: "#10b981" }]}>Food Scan</Text>
                <ArrowUpRight size={13} color="#10b981" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Section 2: Primary KPIs 2-Column Grid */}
          <Text style={[s.sectionTitle, { marginTop: 16 }]}>Event Key Performance Indicators</Text>
          <View style={s.twoColumnGrid}>
            <View style={s.kpiGridCard}>
              <View style={s.kpiCardHeader}>
                <Text style={s.kpiCardTitle}>Total Revenue</Text>
                <View style={[s.kpiIconBox, { backgroundColor: "#dcfce7" }]}>
                  <TrendingUp size={16} color="#10b981" />
                </View>
              </View>
              <Text style={s.kpiCardVal}>₹12.8L</Text>
              <Text style={s.kpiTrendText}>Gross ticket sales</Text>
            </View>

            <View style={s.kpiGridCard}>
              <View style={s.kpiCardHeader}>
                <Text style={s.kpiCardTitle}>Tickets Sold</Text>
                <View style={[s.kpiIconBox, { backgroundColor: "#e0f2fe" }]}>
                  <Ticket size={16} color="#0284c7" />
                </View>
              </View>
              <Text style={s.kpiCardVal}>4,820</Text>
              <Text style={s.kpiSubLabel}>Out of 6,000 capacity</Text>
            </View>

            <View style={s.kpiGridCard}>
              <View style={s.kpiCardHeader}>
                <Text style={s.kpiCardTitle}>Occupancy</Text>
                <View style={[s.kpiIconBox, { backgroundColor: "#ffedd5" }]}>
                  <BarChart2 size={16} color="#f97316" />
                </View>
              </View>
              <Text style={s.kpiCardVal}>80.3%</Text>
              <Text style={s.kpiTrendText}>High ticket demand</Text>
            </View>

            <View style={s.kpiGridCard}>
              <View style={s.kpiCardHeader}>
                <Text style={s.kpiCardTitle}>Checked In</Text>
                <View style={[s.kpiIconBox, { backgroundColor: "#f3e8ff" }]}>
                  <ScanLine size={16} color="#8b5cf6" />
                </View>
              </View>
              <Text style={s.kpiCardVal}>3,842</Text>
              <Text style={s.kpiTrendText}>79.7% gate attendance</Text>
            </View>

            <View style={s.kpiGridCard}>
              <View style={s.kpiCardHeader}>
                <Text style={s.kpiCardTitle}>Upcoming Events</Text>
                <View style={[s.kpiIconBox, { backgroundColor: "#e0e7ff" }]}>
                  <Calendar size={16} color="#4338ca" />
                </View>
              </View>
              <Text style={s.kpiCardVal}>{totalEvents}</Text>
              <Text style={s.kpiSubLabel}>{approvedEvents} Live production</Text>
            </View>

            <View style={s.kpiGridCard}>
              <View style={s.kpiCardHeader}>
                <Text style={s.kpiCardTitle}>Pending Payout</Text>
                <View style={[s.kpiIconBox, { backgroundColor: "#fce7f3" }]}>
                  <Clock size={16} color="#ec4899" />
                </View>
              </View>
              <Text style={s.kpiCardVal}>₹3.2L</Text>
              <Text style={s.kpiSubLabel}>Awaiting settlement</Text>
            </View>
          </View>

          {/* Section 3: Ticket Tier Performance */}
          <Text style={[s.sectionTitle, { marginTop: 16 }]}>Ticket Tier Occupancy</Text>
          <View style={{ gap: 8, marginBottom: 16 }}>
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>VIP Access Pass</CardTitle>
                <Badge variant="danger">96% OCCUPANCY</Badge>
              </CardHeader>
              <CardContent>
                <Text style={s.tierText}>🎟️ 482 / 500 Tickets Sold</Text>
                <Text style={s.tierText}>💰 Revenue Generated: ₹4.8L</Text>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>General Admission</CardTitle>
                <Badge variant="success">85% OCCUPANCY</Badge>
              </CardHeader>
              <CardContent>
                <Text style={s.tierText}>🎟️ 3,420 / 4,000 Tickets Sold</Text>
                <Text style={s.tierText}>💰 Revenue Generated: ₹6.8L</Text>
              </CardContent>
            </Card>
          </View>

          {/* Section 4: Organizer Quick Actions 2-Column Grid */}
          <Text style={s.sectionTitle}>Organizer Command Shortcuts</Text>
          <View style={s.quickGrid}>
            <TouchableOpacity style={s.gridBtn} onPress={() => navigation.navigate("CreateEvent")}>
              <PlusCircle size={18} color="#0284c7" />
              <Text style={s.gridBtnText}>+ Create Event</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.gridBtn} onPress={() => navigation.navigate("EventCheckIn")}>
              <ScanLine size={18} color="#f97316" />
              <Text style={s.gridBtnText}>Gate Scan QR</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.gridBtn} onPress={() => navigation.navigate("LiveFooddashboard")}>
              <Utensils size={18} color="#10b981" />
              <Text style={s.gridBtnText}>Food Check-In</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.gridBtn} onPress={() => navigation.navigate("EventsPage")}>
              <Calendar size={18} color="#8b5cf6" />
              <Text style={s.gridBtnText}>Manage Events</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>

      {/* Floating Bottom Navigation Bar */}
      <BottomNav
        items={[
          { key: "home", label: "Overview", icon: Home },
          { key: "events", label: "My Events", icon: Calendar },
          { key: "create", label: "Create Event", icon: PlusCircle },
          { key: "checkin", label: "Gate Scan", icon: ScanLine },
          { key: "profile", label: "Profile", icon: UserCheck },
        ]}
        activeKey={activeTab}
        onTabSelect={(key) => {
          setActiveTab(key);
          if (key === "events") navigation.navigate("EventsPage");
          if (key === "create") navigation.navigate("CreateEvent");
          if (key === "checkin") navigation.navigate("EventCheckIn");
          if (key === "profile") navigation.navigate("MyProfile");
        }}
      />
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ea580c",
  },
  headerArch: {
    backgroundColor: "#ea580c",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  logoWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoIconWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 6,
  },
  logoDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 2,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 2,
  },
  profileAvatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  headerStatsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "space-around",
  },
  headerStatItem: {
    alignItems: "center",
  },
  headerStatVal: {
    fontSize: 16,
    fontWeight: "900",
    color: "#ffffff",
  },
  headerStatLbl: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.9)",
  },
  headerStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  whiteSheet: {
    flex: 1,
    backgroundColor: "#f8fafc",
    marginTop: -12,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 130,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  twoColumnGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },
  gridCardItem: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    width: "48.5%",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 2,
    shadowColor: "#0f172a",
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  gridCardLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  gridCardSub: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 8,
  },
  gridCardCta: {
    flexDirection: "row",
    alignItems: "center",
  },
  gridCardCtaText: {
    fontSize: 11,
    fontWeight: "800",
    marginRight: 2,
  },
  kpiGridCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    width: "48.5%",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 2,
    shadowColor: "#0f172a",
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  kpiCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  kpiCardTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  kpiIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  kpiCardVal: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 2,
  },
  kpiTrendText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#16a34a",
  },
  kpiSubLabel: {
    fontSize: 10,
    color: "#64748b",
  },
  tierText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 3,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8,
  },
  gridBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 12,
    width: "48.5%",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  gridBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0f172a",
    marginLeft: 6,
  },
});

export default OrganizerWelcome;
