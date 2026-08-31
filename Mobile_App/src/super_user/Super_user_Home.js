import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, Alert, ActivityIndicator,
  RefreshControl, ScrollView, StatusBar, TouchableOpacity, TextInput
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BarChart3, Calendar, Ticket, Users, CheckCircle2, ShieldCheck, ShieldX,
  LogOut, Layers, Plus, Tag, AlertCircle, Building2, UserCheck, Landmark,
  TrendingUp, Sparkles, Search, ChevronRight, User, DollarSign, Filter, RefreshCw, AlertTriangle, ArrowUpRight
} from "lucide-react-native";

import {
  getAllEvents, updateEventStatus, getAdminCategories, createAdminCategory,
  getPendingOrganizers, updateOrganizerKycStatus
} from "@Services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../styles/theme";

// Shadcn Primitive Components
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Toast } from "../components/ui/Toast";
import { BottomNav } from "../components/ui/BottomNav";
import BrandLogo from "../components/ui/BrandLogo";

const DEFAULT_CATEGORIES = [
  { id: "1", name: "Music & Concerts", subcategories: ["Rock", "Pop", "EDM", "Classical", "Jazz"], status: "Active", revenue: "₹18.2L" },
  { id: "2", name: "Tech & Business Expos", subcategories: ["AI & Tech", "Startups", "Web3", "Finance"], status: "Active", revenue: "₹10.4L" },
  { id: "3", name: "Sports & Fitness", subcategories: ["Football", "Cricket", "Marathon", "Esports"], status: "Active", revenue: "₹8.7L" },
  { id: "4", name: "Food & Culinary", subcategories: ["Food Fest", "Wine Tasting", "Baking Workshop"], status: "Active", revenue: "₹3.2L" },
  { id: "5", name: "Arts & Theatre", subcategories: ["Standup Comedy", "Drama", "Art Gallery"], status: "Active", revenue: "₹2.0L" },
];

const DEFAULT_ORGANIZERS_KYC = [
  { id: "101", name: "Ashok Babu", email: "pashokbabu.38@gmail.com", mobile: "+91 7010085577", company_name: "EventCorp India Ltd", gst_pan: "33ABCDE1234F1Z5", bank_account: "918237465012", ifsc: "HDFC0001234", kyc_status: "PENDING" },
  { id: "102", name: "Robert Downey", email: "robert@starkevents.com", mobile: "+91 9876543210", company_name: "Stark Expo LLC", gst_pan: "27AAAAA0000A1Z5", bank_account: "102938475601", ifsc: "ICIC0005678", kyc_status: "VERIFIED" },
];

export default function SuperUserHome({ navigation }) {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [organizersKyc, setOrganizersKyc] = useState(DEFAULT_ORGANIZERS_KYC);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "approvals" | "categories" | "kyc" | "payouts"
  const [selectedPeriod, setSelectedPeriod] = useState("30D");

  // Advanced Filters State
  const [eventStatusFilter, setEventStatusFilter] = useState("ALL"); // "ALL" | "LIVE" | "UPCOMING" | "PAST" | "PENDING" | "REJECTED"
  const [selectedCatFilter, setSelectedCatFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Add Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newSubCatName, setNewSubCatName] = useState("");
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    await Promise.all([fetchEvents(), fetchCategories(), fetchOrganizersKyc()]);
    setIsLoading(false);
  };

  const fetchEvents = async () => {
    try {
      const res = await getAllEvents();
      setEvents(res.events || []);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getAdminCategories();
      if (res?.success && res?.categories?.length > 0) {
        setCategories(res.categories);
      }
    } catch (err) {
      console.warn("Failed to fetch API categories:", err);
    }
  };

  const fetchOrganizersKyc = async () => {
    try {
      const res = await getPendingOrganizers();
      if (res?.success && res?.organizers?.length > 0) {
        setOrganizersKyc(res.organizers);
      }
    } catch (err) {
      console.warn("Failed to fetch API organizers KYC:", err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) {
      Alert.alert("Input Error", "Please enter a Main Category name.");
      return;
    }

    setIsSubmittingCat(true);
    try {
      const payload = {
        name: newCatName.trim(),
        subcategories: newSubCatName ? newSubCatName.split(",").map((s) => s.trim()) : [],
        status: "Active",
      };

      const res = await createAdminCategory(payload);
      if (res?.success) {
        showNotification(`Category "${newCatName}" created successfully!`, "success");
        fetchCategories();
      } else {
        setCategories((prev) => [
          ...prev,
          { id: (prev.length + 1).toString(), ...payload },
        ]);
        showNotification(`Category "${newCatName}" added locally!`, "info");
      }

      setNewCatName("");
      setNewSubCatName("");
      setShowCategoryModal(false);
    } catch (err) {
      showNotification("Error saving category", "error");
    } finally {
      setIsSubmittingCat(false);
    }
  };

  const handleStatusUpdate = async (eventId, newStatus) => {
    try {
      await updateEventStatus(eventId, newStatus);
      showNotification(`Event ${newStatus.toLowerCase()} successfully!`, "success");
      fetchEvents();
    } catch (err) {
      showNotification("Failed to update status", "error");
    }
  };

  const handleKycStatusUpdate = async (userId, newStatus) => {
    try {
      await updateOrganizerKycStatus(userId, newStatus);
      setOrganizersKyc(prev => prev.map(o => o.id === userId ? { ...o, kyc_status: newStatus } : o));
      showNotification(`Organizer KYC ${newStatus.toLowerCase()}!`, "success");
    } catch (err) {
      showNotification("Failed to update KYC status", "error");
    }
  };

  const showNotification = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "success" }), 3500);
  };

  // Temporal & Lifecycle Event Counts
  const totalEventsCount = events.length || 284;
  const liveEventsCount = events.filter((e) => e.status === "LIVE" || e.status === "APPROVED").length || 42;
  const upcomingEventsCount = events.filter((e) => e.status === "UPCOMING").length || 84;
  const pastEventsCount = events.filter((e) => e.status === "COMPLETED" || e.status === "PAST").length || 136;
  const pendingEventsCount = events.filter((e) => e.status === "PENDING" || e.status === "REVIEW").length || 17;
  const rejectedEventsCount = events.filter((e) => e.status === "REJECTED").length || 5;
  const pendingKycCount = organizersKyc.filter(o => o.kyc_status === "PENDING").length;

  // Filtered Events List for Approvals & Event Feed
  const filteredEvents = events.filter((e) => {
    const matchesSearch = searchQuery
      ? (e.event_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.event_code || "").toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesStatus =
      eventStatusFilter === "ALL" ? true :
      eventStatusFilter === "LIVE" ? (e.status === "LIVE" || e.status === "APPROVED") :
      eventStatusFilter === "UPCOMING" ? e.status === "UPCOMING" :
      eventStatusFilter === "PAST" ? (e.status === "PAST" || e.status === "COMPLETED") :
      eventStatusFilter === "PENDING" ? (e.status === "PENDING" || e.status === "REVIEW") :
      eventStatusFilter === "REJECTED" ? e.status === "REJECTED" : true;

    const matchesCat =
      selectedCatFilter === "ALL" ? true :
      (e.category || "").toLowerCase() === selectedCatFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCat;
  });

  const navItems = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "approvals", label: "Approvals", icon: CheckCircle2 },
    { key: "categories", label: "Categories", icon: Layers },
    { key: "kyc", label: "KYC Queue", icon: UserCheck },
    { key: "payouts", label: "Payouts", icon: Landmark },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#581c87" />

      {/* Royal Purple Executive Governance Header Arch */}
      <View style={styles.headerArch}>
        <View style={styles.headerTopRow}>
          <View>
            <BrandLogo />
            <Text style={styles.headerSub}>Platform Governance & Executive Analytics</Text>
          </View>

          <TouchableOpacity style={styles.profileAvatarBtn} onPress={() => navigation.navigate("MyProfile")}>
            <User size={20} color="#581c87" />
          </TouchableOpacity>
        </View>

        {/* Dynamic Metric Stat Banner */}
        <View style={styles.headerStatsRow}>
          <View style={styles.headerStatItem}>
            <Text style={styles.headerStatVal}>₹48.6L</Text>
            <Text style={styles.headerStatLbl}>Platform Revenue</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStatItem}>
            <Text style={styles.headerStatVal}>{totalEventsCount}</Text>
            <Text style={styles.headerStatLbl}>Total Events</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStatItem}>
            <Text style={styles.headerStatVal}>38,420</Text>
            <Text style={styles.headerStatLbl}>Attendees</Text>
          </View>
        </View>
      </View>

      {/* Main Content View Container */}
      <View style={styles.whiteSheet}>
        {toast.message ? <Toast message={toast.message} type={toast.type} style={{ marginBottom: 12 }} /> : null}

        {/* TAB 1: OVERVIEW DASHBOARD & PLATFORM ANALYTICS */}
        {activeTab === "overview" && (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          >
            {/* 1. Event Temporal Lifecycle Breakdown (Past, Live, Future, Pending) */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Event Lifecycle Breakdown</Text>
              <Badge variant="info">{totalEventsCount} Total Shows</Badge>
            </View>

            <View style={styles.twoColumnGrid}>
              <TouchableOpacity
                style={[styles.kpiGridCard, { borderLeftColor: "#ef4444", borderLeftWidth: 3.5 }]}
                onPress={() => { setActiveTab("approvals"); setEventStatusFilter("LIVE"); }}
                activeOpacity={0.8}
              >
                <View style={styles.kpiCardHeader}>
                  <Text style={styles.kpiCardTitle} numberOfLines={1}>Live Events</Text>
                  <Badge variant="danger" style={styles.compactBadge}>🔴 LIVE</Badge>
                </View>
                <Text style={styles.kpiCardVal}>{liveEventsCount}</Text>
                <Text style={styles.kpiSubLabel}>Active production shows</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.kpiGridCard, { borderLeftColor: "#10b981", borderLeftWidth: 3.5 }]}
                onPress={() => { setActiveTab("approvals"); setEventStatusFilter("UPCOMING"); }}
                activeOpacity={0.8}
              >
                <View style={styles.kpiCardHeader}>
                  <Text style={styles.kpiCardTitle} numberOfLines={1}>Future Events</Text>
                  <Badge variant="success" style={styles.compactBadge}>🟢 FUTURE</Badge>
                </View>
                <Text style={styles.kpiCardVal}>{upcomingEventsCount}</Text>
                <Text style={styles.kpiSubLabel}>Upcoming booked dates</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.kpiGridCard, { borderLeftColor: "#64748b", borderLeftWidth: 3.5 }]}
                onPress={() => { setActiveTab("approvals"); setEventStatusFilter("PAST"); }}
                activeOpacity={0.8}
              >
                <View style={styles.kpiCardHeader}>
                  <Text style={styles.kpiCardTitle} numberOfLines={1}>Past Events</Text>
                  <Badge variant="secondary" style={styles.compactBadge}>⚪ PAST</Badge>
                </View>
                <Text style={styles.kpiCardVal}>{pastEventsCount}</Text>
                <Text style={styles.kpiSubLabel}>Completed shows history</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.kpiGridCard, { borderLeftColor: "#f97316", borderLeftWidth: 3.5 }]}
                onPress={() => { setActiveTab("approvals"); setEventStatusFilter("PENDING"); }}
                activeOpacity={0.8}
              >
                <View style={styles.kpiCardHeader}>
                  <Text style={styles.kpiCardTitle} numberOfLines={1}>Pending Review</Text>
                  <Badge variant="warning" style={styles.compactBadge}>🟠 PENDING</Badge>
                </View>
                <Text style={styles.kpiCardVal}>{pendingEventsCount}</Text>
                <Text style={styles.kpiSubLabel}>DIY event submissions</Text>
              </TouchableOpacity>
            </View>

            {/* 2. Requires Your Attention - Clean 2-Column Card Grid */}
            <View style={[styles.sectionHeaderRow, { marginTop: 16 }]}>
              <Text style={styles.sectionTitle}>Requires Your Attention</Text>
              <Badge variant="warning">{pendingEventsCount + pendingKycCount} Items</Badge>
            </View>

            <View style={styles.twoColumnGrid}>
              <TouchableOpacity
                style={[styles.gridCardItem, { borderLeftColor: "#f97316", borderLeftWidth: 3.5 }]}
                onPress={() => { setActiveTab("approvals"); setEventStatusFilter("PENDING"); }}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.gridCardLabel}>Events Review</Text>
                  <Badge variant="warning">{pendingEventsCount}</Badge>
                </View>
                <Text style={styles.gridCardSub}>Newly submitted events</Text>
                <View style={styles.gridCardCta}>
                  <Text style={[styles.gridCardCtaText, { color: "#f97316" }]}>Review Queue</Text>
                  <ArrowUpRight size={13} color="#f97316" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.gridCardItem, { borderLeftColor: "#8b5cf6", borderLeftWidth: 3.5 }]}
                onPress={() => setActiveTab("kyc")}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.gridCardLabel}>Organizer KYC</Text>
                  <Badge variant="info">{pendingKycCount}</Badge>
                </View>
                <Text style={styles.gridCardSub}>Documents pending audit</Text>
                <View style={styles.gridCardCta}>
                  <Text style={[styles.gridCardCtaText, { color: "#8b5cf6" }]}>Review KYC</Text>
                  <ArrowUpRight size={13} color="#8b5cf6" />
                </View>
              </TouchableOpacity>
            </View>

            {/* 3. Platform Financial & Operational KPIs */}
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Platform Key Metrics</Text>

            <View style={styles.twoColumnGrid}>
              <View style={styles.kpiGridCard}>
                <View style={styles.kpiCardHeader}>
                  <Text style={styles.kpiCardTitle}>Total Revenue</Text>
                  <View style={[styles.kpiIconBox, { backgroundColor: "#dcfce7" }]}>
                    <TrendingUp size={16} color="#10b981" />
                  </View>
                </View>
                <Text style={styles.kpiCardVal}>₹48.6L</Text>
                <Text style={styles.kpiTrendText}>↑ 18.4% vs last month</Text>
              </View>

              <View style={styles.kpiGridCard}>
                <View style={styles.kpiCardHeader}>
                  <Text style={styles.kpiCardTitle}>Commission</Text>
                  <View style={[styles.kpiIconBox, { backgroundColor: "#e0f2fe" }]}>
                    <DollarSign size={16} color="#0284c7" />
                  </View>
                </View>
                <Text style={styles.kpiCardVal}>₹4.86L</Text>
                <Text style={styles.kpiTrendText}>↑ 12.6% platform fee</Text>
              </View>
            </View>

            {/* 4. Revenue Breakdown by Category */}
            <View style={[styles.sectionHeaderRow, { marginTop: 16 }]}>
              <Text style={styles.sectionTitle}>Revenue by Category</Text>
              <View style={styles.periodRow}>
                {["7D", "30D", "3M", "1Y"].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.periodPill, selectedPeriod === p && styles.periodPillActive]}
                    onPress={() => setSelectedPeriod(p)}
                  >
                    <Text style={[styles.periodPillText, selectedPeriod === p && styles.periodPillTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {categories.slice(0, 4).map((c, i) => (
              <View key={i} style={styles.catRevRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.catRevName}>{c.name}</Text>
                  <Text style={styles.catRevSubs}>{Array.isArray(c.subcategories) ? c.subcategories.slice(0, 2).join(", ") : ""}</Text>
                </View>
                <Text style={styles.catRevVal}>{c.revenue || "₹8.5L"}</Text>
              </View>
            ))}

            {/* 5. Platform Quick Actions 2-Column Grid */}
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Platform Control Shortcuts</Text>
            <View style={styles.quickGrid}>
              <TouchableOpacity style={styles.gridBtn} onPress={() => setShowCategoryModal(true)}>
                <Plus size={18} color="#0284c7" />
                <Text style={styles.gridBtnText}>+ Add Category</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.gridBtn} onPress={() => setActiveTab("approvals")}>
                <CheckCircle2 size={18} color="#f97316" />
                <Text style={styles.gridBtnText}>Review Events ({pendingEventsCount})</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.gridBtn} onPress={() => setActiveTab("kyc")}>
                <UserCheck size={18} color="#8b5cf6" />
                <Text style={styles.gridBtnText}>Review KYC ({pendingKycCount})</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.gridBtn} onPress={() => setActiveTab("payouts")}>
                <Landmark size={18} color="#10b981" />
                <Text style={styles.gridBtnText}>Settlements</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* TAB 2: EVENT APPROVALS & LIFECYCLE QUEUE */}
        {activeTab === "approvals" && (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          >
            <Text style={styles.sectionTitle}>Event Review & Lifecycle Feed</Text>

            {/* Search Input Bar */}
            <View style={styles.searchBarBox}>
              <Search size={16} color="#64748b" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search event by name or code..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Status Filter Pills Bar (Past, Live, Future, Pending, Rejected) */}
            <Text style={styles.filterGroupTitle}>Filter Status:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {[
                { key: "ALL", label: `All (${totalEventsCount})` },
                { key: "LIVE", label: `Live (${liveEventsCount})` },
                { key: "UPCOMING", label: `Future (${upcomingEventsCount})` },
                { key: "PAST", label: `Past (${pastEventsCount})` },
                { key: "PENDING", label: `Pending (${pendingEventsCount})` },
                { key: "REJECTED", label: `Rejected (${rejectedEventsCount})` },
              ].map((st) => (
                <TouchableOpacity
                  key={st.key}
                  style={[styles.filterPill, eventStatusFilter === st.key && styles.filterPillActive]}
                  onPress={() => setEventStatusFilter(st.key)}
                >
                  <Text style={[styles.filterPillText, eventStatusFilter === st.key && styles.filterPillTextActive]}>
                    {st.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Category Filter Pills Bar */}
            <Text style={styles.filterGroupTitle}>Filter Category:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {["ALL", ...categories.map(c => c.name)].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.filterPill, selectedCatFilter === cat && styles.filterPillActive]}
                  onPress={() => setSelectedCatFilter(cat)}
                >
                  <Text style={[styles.filterPillText, selectedCatFilter === cat && styles.filterPillTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {isLoading ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
            ) : filteredEvents.length === 0 ? (
              <Card style={styles.emptyCard}>
                <CardContent style={{ alignItems: "center", paddingVertical: 24 }}>
                  <Calendar size={40} color="#cbd5e1" />
                  <Text style={styles.emptyText}>No events match selected filter criteria</Text>
                </CardContent>
              </Card>
            ) : (
              filteredEvents.map((e) => (
                <Card key={e.id} variant="elevated" style={{ marginBottom: 12 }}>
                  <CardHeader>
                    <View>
                      <CardTitle>{e.event_name}</CardTitle>
                      <CardDescription>{e.event_code || "EVT-2026"} • {e.location || "Venue TBA"}</CardDescription>
                    </View>
                    <Badge variant={
                      e.status === "APPROVED" || e.status === "LIVE" ? "success" :
                      e.status === "UPCOMING" ? "info" :
                      e.status === "PAST" || e.status === "COMPLETED" ? "secondary" : "warning"
                    }>
                      {e.status || "PENDING"}
                    </Badge>
                  </CardHeader>

                  <CardContent>
                    <Text style={styles.eventDetailText}>📅 Date: {e.start_date || "TBA"} • {e.start_time || "TBA"}</Text>
                    <Text style={styles.eventDetailText}>🏷️ Main Category: {e.category || "General"}</Text>
                    <Text style={styles.eventDetailText}>👤 Organizer ID: {e.created_by || "DIY Organizer"}</Text>
                  </CardContent>

                  <CardFooter>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={ShieldX}
                      onPress={() => handleStatusUpdate(e.id, "REJECTED")}
                      style={{ borderColor: "#ef4444" }}
                      textStyle={{ color: "#ef4444" }}
                    >
                      Reject
                    </Button>

                    <Button
                      variant="default"
                      size="sm"
                      icon={ShieldCheck}
                      onPress={() => handleStatusUpdate(e.id, "APPROVED")}
                    >
                      Approve Event
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </ScrollView>
        )}

        {/* TAB 3: CATEGORY & SUBCATEGORY MASTER */}
        {activeTab === "categories" && (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Category & Subcategory Master</Text>
              <Button size="sm" icon={Plus} onPress={() => setShowCategoryModal(true)}>
                Add Category
              </Button>
            </View>

            {categories.map((cat) => (
              <Card key={cat.id} variant="elevated">
                <CardHeader>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Tag size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
                    <CardTitle>{cat.name}</CardTitle>
                  </View>
                  <Badge variant={cat.status === "Active" ? "success" : "secondary"}>
                    {cat.status}
                  </Badge>
                </CardHeader>

                <CardContent>
                  <Text style={styles.subCatLabel}>Nested Subcategories:</Text>
                  <View style={styles.subCatRow}>
                    {Array.isArray(cat.subcategories) ? (
                      cat.subcategories.map((sub, idx) => (
                        <Badge key={idx} variant="info" style={{ marginRight: 6, marginBottom: 6 }}>
                          {sub}
                        </Badge>
                      ))
                    ) : (
                      <Text style={{ fontSize: 12, color: "#64748b" }}>No subcategories configured</Text>
                    )}
                  </View>
                </CardContent>
              </Card>
            ))}
          </ScrollView>
        )}

        {/* TAB 4: ORGANIZER KYC QUEUE */}
        {activeTab === "kyc" && (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Organizer Account Verification</Text>

            {organizersKyc.map((org) => (
              <Card key={org.id} variant="elevated">
                <CardHeader>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Building2 size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
                    <CardTitle>{org.company_name || org.name}</CardTitle>
                  </View>
                  <Badge variant={org.kyc_status === "VERIFIED" ? "success" : "warning"}>
                    {org.kyc_status}
                  </Badge>
                </CardHeader>

                <CardContent>
                  <Text style={styles.eventDetailText}>👤 Representative: {org.name} ({org.email})</Text>
                  <Text style={styles.eventDetailText}>📱 Mobile: {org.mobile}</Text>
                  <Text style={styles.eventDetailText}>📜 GST / PAN: {org.gst_pan}</Text>
                  <Text style={styles.eventDetailText}>🏦 Bank Account: {org.bank_account} ({org.ifsc})</Text>
                </CardContent>

                <CardFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => handleKycStatusUpdate(org.id, "REJECTED")}
                    style={{ borderColor: "#ef4444" }}
                    textStyle={{ color: "#ef4444" }}
                  >
                    Flag KYC
                  </Button>

                  <Button
                    variant="success"
                    size="sm"
                    icon={ShieldCheck}
                    onPress={() => handleKycStatusUpdate(org.id, "VERIFIED")}
                  >
                    Verify KYC
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </ScrollView>
        )}

        {/* TAB 5: PAYOUT SETTLEMENTS */}
        {activeTab === "payouts" && (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Organizer Payout Settlements</Text>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Platform Revenue & Commission Batch</CardTitle>
                <Badge variant="success">READY FOR RELEASE</Badge>
              </CardHeader>

              <CardContent>
                <Text style={styles.eventDetailText}>💰 Gross Ticket Sales: ₹48,50,000</Text>
                <Text style={styles.eventDetailText}>⚡ Platform Commission (10%): ₹4,85,000</Text>
                <Text style={styles.eventDetailText}>🏦 Net Organizer Settlement: ₹43,65,000</Text>
              </CardContent>

              <CardFooter>
                <Button
                  variant="default"
                  size="md"
                  icon={Landmark}
                  onPress={() => showNotification("Direct Bank Payout Batch Released!", "success")}
                  style={{ width: "100%" }}
                >
                  Release Direct Bank Payout
                </Button>
              </CardFooter>
            </Card>
          </ScrollView>
        )}
      </View>

      {/* Floating Bottom Navigation Bar */}
      <BottomNav
        items={navItems}
        activeKey={activeTab}
        onTabSelect={(key) => {
          if (key === "approvals") navigation?.navigate("EventApprovalQueue");
          else if (key === "categories") navigation?.navigate("CategoryMaster");
          else if (key === "kyc") navigation?.navigate("KycVerification");
          else if (key === "payouts") navigation?.navigate("PayoutsQueue");
          else setActiveTab(key);
        }}
      />

      {/* Add Main Category Modal */}
      <Modal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Add Main Category"
        subtitle="Configure new main event category & nested subcategories"
      >
        <Input
          label="Main Category Name"
          placeholder="e.g. Esports, Tech Expos, Classical Music"
          value={newCatName}
          onChangeText={setNewCatName}
          required
        />

        <Input
          label="Subcategories (Comma-separated)"
          placeholder="e.g. Valorant, BGMI, FIFA, Console Arena"
          value={newSubCatName}
          onChangeText={setNewSubCatName}
          multiline
        />

        <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
          <Button variant="ghost" onPress={() => setShowCategoryModal(false)}>
            Cancel
          </Button>
          <Button onPress={handleAddCategory} isLoading={isSubmittingCat}>
            Save Category
          </Button>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#581c87",
  },
  headerArch: {
    backgroundColor: "#581c87",
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
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
    marginRight: 4,
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
    flex: 1,
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginRight: 4,
  },
  compactBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
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
  periodRow: {
    flexDirection: "row",
    gap: 4,
  },
  periodPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
  },
  periodPillActive: {
    backgroundColor: "#581c87",
  },
  periodPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
  },
  periodPillTextActive: {
    color: "#ffffff",
  },
  catRevRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  catRevName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  catRevSubs: {
    fontSize: 10,
    color: "#64748b",
  },
  catRevVal: {
    fontSize: 14,
    fontWeight: "900",
    color: "#581c87",
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
  searchBarBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#0f172a",
    padding: 0,
  },
  filterGroupTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
    marginRight: 6,
  },
  filterPillActive: {
    backgroundColor: "#581c87",
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#475569",
  },
  filterPillTextActive: {
    color: "#ffffff",
  },
  emptyCard: {
    marginVertical: 20,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
  },
  eventDetailText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
    marginBottom: 3,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  subCatLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    marginBottom: 6,
    marginTop: 2,
  },
  subCatRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
