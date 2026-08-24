import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, StatusBar, ScrollView, TouchableOpacity, Modal, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ExhibitorNavbar from "./Navbar";
import { useSelector } from "react-redux";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Building2, Calendar, Store, QrCode, FileText, ChevronRight, User, Home,
  Flame, TrendingUp, Users, PlusCircle, Sparkles, Filter, CheckCircle2, ArrowRight,
  LogOut, ArrowUpRight, DollarSign
} from "lucide-react-native";

// Shadcn Primitive Components
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Toast } from "../components/ui/Toast";
import { BottomNav } from "../components/ui/BottomNav";
import BrandLogo from "../components/ui/BrandLogo";
import { COLORS } from "../styles/theme";

const DEFAULT_LEADS = [
  { id: "L-101", name: "Arun Kumar", company: "ABC Technologies", interest: "Enterprise Software", score: 85, temp: "HOT", status: "FOLLOW_UP" },
  { id: "L-102", name: "Priya S", company: "XYZ Solutions", interest: "Product Demo & AI", score: 62, temp: "WARM", status: "CONTACTED" },
  { id: "L-103", name: "Vikram Malhotra", company: "Global Systems", interest: "Cloud Infrastructure", score: 92, temp: "HOT", status: "QUALIFIED" },
];

const ExhibitorHome = () => {
  const user = useSelector((state) => state.user);
  const route = useRoute();
  const navigation = useNavigation();
  const [showToast, setShowToast] = useState(false);
  const [storedUser, setStoredUser] = useState({ id: null, name: null });
  const [activeTab, setActiveTab] = useState("home");
  const [leads, setLeads] = useState(DEFAULT_LEADS);

  // Spot Visitor Modal State
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [vName, setVName] = useState("");
  const [vEmail, setVEmail] = useState("");
  const [vPhone, setVPhone] = useState("");
  const [vCompany, setVCompany] = useState("");
  const [vInterest, setVInterest] = useState("");

  useEffect(() => {
    const saveAndFetchUser = async () => {
      try {
        if (user?.id && user?.name) {
          await AsyncStorage.setItem("userId", String(user.id));
          await AsyncStorage.setItem("userName", user.name);
        }
        const id = await AsyncStorage.getItem("userId");
        const name = await AsyncStorage.getItem("userName");
        setStoredUser({ id, name });
      } catch (e) {
        console.error(e);
      }
    };
    saveAndFetchUser();
  }, [user]);

  useEffect(() => {
    if (route.params?.fromLogin) {
      setShowToast(true);
      navigation.setParams({ fromLogin: undefined });
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [route.params, navigation]);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace("Login");
  };

  const displayUser = user?.name ? user : storedUser;

  const handleRegisterVisitor = () => {
    if (!vName.trim() || !vPhone.trim()) {
      alert("Please enter visitor Name and Phone Number.");
      return;
    }

    const newLead = {
      id: `L-${100 + leads.length + 1}`,
      name: vName.trim(),
      company: vCompany.trim() || "Independent Visitor",
      interest: vInterest.trim() || "Stall Inquiries",
      score: 75,
      temp: "HOT",
      status: "NEW",
    };

    setLeads([newLead, ...leads]);
    setShowVisitorModal(false);
    setVName("");
    setVEmail("");
    setVPhone("");
    setVCompany("");
    setVInterest("");
    alert("✓ Visitor Registered & Lead Created Successfully!");
  };

  const exhibitorNavItems = [
    { key: "home", label: "Home", icon: Home },
    { key: "events", label: "Browse Expos", icon: Calendar },
    { key: "bookings", label: "My Stalls", icon: Store },
    { key: "leads", label: "Scan Leads", icon: QrCode },
    { key: "profile", label: "Profile", icon: User },
  ];

  const handleTabSelect = (key) => {
    setActiveTab(key);
    if (key === "events") navigation.navigate("UpcomingEvent");
    if (key === "bookings") navigation.navigate("MyBookings");
    if (key === "leads") navigation.navigate("ExhibitorSpotRegistration");
    if (key === "profile") navigation.navigate("MyProfile");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#047857" />

      {/* Deep Emerald Trade Show Curved Header Arch */}
      <View style={styles.headerArch}>
        <View style={styles.headerTopRow}>
          <View>
            <BrandLogo />
            <Text style={styles.headerSub}>Booth Reservations & Visitor Lead Intelligence</Text>
          </View>

          <TouchableOpacity style={styles.profileAvatarBtn} onPress={() => navigation.navigate("MyProfile")}>
            <User size={20} color="#047857" />
          </TouchableOpacity>
        </View>

        {/* Dynamic Metric Stat Banner */}
        <View style={styles.headerStatsRow}>
          <View style={styles.headerStatItem}>
            <Text style={styles.headerStatVal}>428</Text>
            <Text style={styles.headerStatLbl}>Total Leads</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStatItem}>
            <Text style={styles.headerStatVal}>86 🔥</Text>
            <Text style={styles.headerStatLbl}>Hot Leads</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStatItem}>
            <Text style={styles.headerStatVal}>4 Stalls</Text>
            <Text style={styles.headerStatLbl}>Active Booths</Text>
          </View>
        </View>
      </View>

      {/* White Content Sheet */}
      <View style={styles.whiteSheet}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {showToast && (
            <Toast message="Logged in successfully!" type="success" style={{ marginBottom: 12 }} />
          )}

          {/* Section 1: Requires Your Attention - 2-Column Grid */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Requires Your Attention</Text>
            <Badge variant="warning">Hot Actions</Badge>
          </View>

          <View style={styles.twoColumnGrid}>
            <TouchableOpacity
              style={[styles.gridCardItem, { borderLeftColor: "#0284c7", borderLeftWidth: 3.5 }]}
              onPress={() => setShowVisitorModal(true)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={styles.gridCardLabel}>Spot Visitor</Text>
                <Badge variant="info">NEW</Badge>
              </View>
              <Text style={styles.gridCardSub}>Register booth visitor</Text>
              <View style={styles.gridCardCta}>
                <Text style={[styles.gridCardCtaText, { color: "#0284c7" }]}>Add Lead</Text>
                <ArrowUpRight size={13} color="#0284c7" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.gridCardItem, { borderLeftColor: "#f97316", borderLeftWidth: 3.5 }]}
              onPress={() => navigation.navigate("ExhibitorSpotRegistration")}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={styles.gridCardLabel}>Hot Leads</Text>
                <Badge variant="danger">86 🔥</Badge>
              </View>
              <Text style={styles.gridCardSub}>High intent buyers</Text>
              <View style={styles.gridCardCta}>
                <Text style={[styles.gridCardCtaText, { color: "#f97316" }]}>Follow Up</Text>
                <ArrowUpRight size={13} color="#f97316" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.gridCardItem, { borderLeftColor: "#10b981", borderLeftWidth: 3.5 }]}
              onPress={() => navigation.navigate("MyBookings")}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={styles.gridCardLabel}>Staff Passes</Text>
                <Badge variant="success">8 ACTIVE</Badge>
              </View>
              <Text style={styles.gridCardSub}>Booth QR passes</Text>
              <View style={styles.gridCardCta}>
                <Text style={[styles.gridCardCtaText, { color: "#10b981" }]}>View Passes</Text>
                <ArrowUpRight size={13} color="#10b981" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.gridCardItem, { borderLeftColor: "#8b5cf6", borderLeftWidth: 3.5 }]}
              onPress={() => navigation.navigate("UpcomingEvent")}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={styles.gridCardLabel}>Stall Space</Text>
                <Badge variant="info">2 EXPOS</Badge>
              </View>
              <Text style={styles.gridCardSub}>Upcoming floor plans</Text>
              <View style={styles.gridCardCta}>
                <Text style={[styles.gridCardCtaText, { color: "#8b5cf6" }]}>Book Stall</Text>
                <ArrowUpRight size={13} color="#8b5cf6" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Section 2: Primary KPIs 2-Column Grid */}
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Exhibitor Key Performance Indicators</Text>
          <View style={styles.twoColumnGrid}>
            <View style={styles.kpiGridCard}>
              <View style={styles.kpiCardHeader}>
                <Text style={styles.kpiCardTitle}>Total Leads</Text>
                <View style={[styles.kpiIconBox, { backgroundColor: "#e0f2fe" }]}>
                  <Users size={16} color="#0284c7" />
                </View>
              </View>
              <Text style={styles.kpiCardVal}>428</Text>
              <Text style={styles.kpiTrendText}>↑ 34.6% lead conversion</Text>
            </View>

            <View style={styles.kpiGridCard}>
              <View style={styles.kpiCardHeader}>
                <Text style={styles.kpiCardTitle}>Hot Leads 🔥</Text>
                <View style={[styles.kpiIconBox, { backgroundColor: "#ffedd5" }]}>
                  <Flame size={16} color="#f97316" />
                </View>
              </View>
              <Text style={styles.kpiCardVal}>86</Text>
              <Text style={styles.kpiTrendText}>High intent buyers</Text>
            </View>

            <View style={styles.kpiGridCard}>
              <View style={styles.kpiCardHeader}>
                <Text style={styles.kpiCardTitle}>Qualified</Text>
                <View style={[styles.kpiIconBox, { backgroundColor: "#dcfce7" }]}>
                  <CheckCircle2 size={16} color="#10b981" />
                </View>
              </View>
              <Text style={styles.kpiCardVal}>186</Text>
              <Text style={styles.kpiSubLabel}>Verified booth inquiries</Text>
            </View>

            <View style={styles.kpiGridCard}>
              <View style={styles.kpiCardHeader}>
                <Text style={styles.kpiCardTitle}>Active Stalls</Text>
                <View style={[styles.kpiIconBox, { backgroundColor: "#f3e8ff" }]}>
                  <Store size={16} color="#8b5cf6" />
                </View>
              </View>
              <Text style={styles.kpiCardVal}>4</Text>
              <Text style={styles.kpiSubLabel}>Booked exhibition spaces</Text>
            </View>

            <View style={styles.kpiGridCard}>
              <View style={styles.kpiCardHeader}>
                <Text style={styles.kpiCardTitle}>Staff Passes</Text>
                <View style={[styles.kpiIconBox, { backgroundColor: "#e0e7ff" }]}>
                  <QrCode size={16} color="#4338ca" />
                </View>
              </View>
              <Text style={styles.kpiCardVal}>8</Text>
              <Text style={styles.kpiSubLabel}>Active QR passes issued</Text>
            </View>

            <View style={styles.kpiGridCard}>
              <View style={styles.kpiCardHeader}>
                <Text style={styles.kpiCardTitle}>Stall Spend</Text>
                <View style={[styles.kpiIconBox, { backgroundColor: "#fce7f3" }]}>
                  <DollarSign size={16} color="#ec4899" />
                </View>
              </View>
              <Text style={styles.kpiCardVal}>₹2.8L</Text>
              <Text style={styles.kpiSubLabel}>Total stall investment</Text>
            </View>
          </View>

          {/* Section 3: Captured Visitor Leads List */}
          <View style={[styles.sectionHeaderRow, { marginTop: 16 }]}>
            <Text style={styles.sectionTitle}>Captured Visitor Leads ({leads.length})</Text>
            <TouchableOpacity onPress={() => navigation.navigate("ExhibitorSpotRegistration")}>
              <Text style={styles.seeAllText}>Scan QR Pass ›</Text>
            </TouchableOpacity>
          </View>

          {leads.map((l) => (
            <Card key={l.id} variant="elevated" style={{ marginBottom: 10 }}>
              <CardHeader style={{ paddingBottom: 4 }}>
                <View>
                  <CardTitle>{l.name}</CardTitle>
                  <CardDescription>{l.company} • Score: {l.score}</CardDescription>
                </View>
                <Badge variant={l.temp === "HOT" ? "danger" : "warning"}>
                  {l.temp === "HOT" ? "🔥 HOT" : "🟡 WARM"}
                </Badge>
              </CardHeader>

              <CardContent>
                <Text style={styles.leadSubText}>💡 Interest: {l.interest}</Text>
                <Text style={styles.leadSubText}>📌 Status: {l.status}</Text>
              </CardContent>
            </Card>
          ))}

          {/* Section 4: Exhibitor Command Shortcuts 2-Column Grid */}
          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Exhibitor Command Shortcuts</Text>
          <View style={styles.quickGrid}>
            <TouchableOpacity style={styles.gridBtn} onPress={() => setShowVisitorModal(true)}>
              <PlusCircle size={18} color="#0284c7" />
              <Text style={styles.gridBtnText}>+ Register Visitor</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridBtn} onPress={() => navigation.navigate("UpcomingEvent")}>
              <Calendar size={18} color="#f97316" />
              <Text style={styles.gridBtnText}>Browse Expos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridBtn} onPress={() => navigation.navigate("MyBookings")}>
              <Store size={18} color="#10b981" />
              <Text style={styles.gridBtnText}>My Reserved Stalls</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridBtn} onPress={() => navigation.navigate("ExhibitorSpotRegistration")}>
              <QrCode size={18} color="#8b5cf6" />
              <Text style={styles.gridBtnText}>Scan Visitor QR</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Floating Bottom Navigation Bar */}
      <BottomNav
        items={exhibitorNavItems}
        activeKey={activeTab}
        onTabSelect={handleTabSelect}
      />

      {/* Spot Visitor Registration Modal */}
      {showVisitorModal && (
        <Modal visible={showVisitorModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>+ Register Spot Visitor</Text>
              <Text style={styles.modalSub}>Capture lead details live at your exhibition booth.</Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Visitor Full Name *"
                value={vName}
                onChangeText={setVName}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Mobile Number *"
                keyboardType="phone-pad"
                value={vPhone}
                onChangeText={setVPhone}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Email Address"
                keyboardType="email-address"
                value={vEmail}
                onChangeText={setVEmail}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Company Name"
                value={vCompany}
                onChangeText={setVCompany}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Product Interest / Requirement"
                value={vInterest}
                onChangeText={setVInterest}
              />

              <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
                <Button variant="ghost" onPress={() => setShowVisitorModal(false)}>
                  Cancel
                </Button>
                <Button onPress={handleRegisterVisitor}>
                  Save Lead
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#047857",
  },
  headerArch: {
    backgroundColor: "#047857",
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
  seeAllText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#f97316",
  },
  leadSubText: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 2,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 2,
  },
  modalSub: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 14,
  },
  modalInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: "#0f172a",
    marginBottom: 10,
  },
});

export default ExhibitorHome;
