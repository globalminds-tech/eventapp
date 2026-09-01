import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Ticket,
  Calendar,
  MapPin,
  QrCode,
  CheckCircle,
  Clock,
  Share2,
  Utensils,
  RefreshCw,
  Sparkles,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserBookingsApi } from "@Services/api";

const { width } = Dimensions.get("window");

export default function MyPasses({ navigation }) {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming"); // 'upcoming' | 'past'

  const fetchPasses = useCallback(async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const email = user?.email || "";
      const userId = user?.id || user?.user_id || null;

      const res = await getUserBookingsApi(email, userId);
      const bookingData = res?.data || res?.bookings || (Array.isArray(res) ? res : []);

      if (bookingData && bookingData.length > 0) {
        setPasses(bookingData);
        await AsyncStorage.setItem("cached_passes", JSON.stringify(bookingData));
      } else {
        const cached = await AsyncStorage.getItem("cached_passes");
        if (cached) {
          setPasses(JSON.parse(cached));
        } else {
          setPasses([]);
        }
      }
    } catch (err) {
      console.warn("Failed to load passes, checking local storage:", err);
      const cached = await AsyncStorage.getItem("cached_passes");
      if (cached) setPasses(JSON.parse(cached));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPasses();
  }, [fetchPasses]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPasses();
  };

  const handleSharePass = async (pass) => {
    try {
      await Share.share({
        message: `🎟️ My Event Pass for ${pass.event_name || "Event"}\nRef ID: #${pass.id || pass.booking_id}\nVenue: ${pass.venue || pass.location || "Venue"}\nDate: ${pass.start_date || "Upcoming"}`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const now = new Date();
  const upcomingPasses = passes.filter((p) => {
    if (!p.start_date) return true;
    return new Date(p.start_date) >= now || p.status === "CONFIRMED" || p.status === "SUCCESS";
  });

  const pastPasses = passes.filter((p) => {
    if (!p.start_date) return false;
    return new Date(p.start_date) < now && p.status !== "CONFIRMED";
  });

  const displayedPasses = activeTab === "upcoming" ? upcomingPasses : pastPasses;

  return (
    <SafeAreaView style={s.safeArea}>
      {/* Top Bar Header */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack()}>
          <ArrowLeft size={22} color="#0f172a" />
        </TouchableOpacity>
        <View style={s.headerTitleWrap}>
          <Text style={s.headerTitle}>My Digital Passes</Text>
          <Text style={s.headerSubTitle}>Verified Entry Tickets & QR Codes</Text>
        </View>
        <TouchableOpacity style={s.refreshBtn} onPress={onRefresh}>
          <RefreshCw size={18} color="#0284c7" />
        </TouchableOpacity>
      </View>

      {/* Tabs Filter */}
      <View style={s.tabsRow}>
        <TouchableOpacity
          style={[s.tabBtn, activeTab === "upcoming" && s.activeTabBtn]}
          onPress={() => setActiveTab("upcoming")}
        >
          <Clock size={15} color={activeTab === "upcoming" ? "#ffffff" : "#64748b"} />
          <Text style={[s.tabText, activeTab === "upcoming" && s.activeTabText]}>
            Upcoming Passes ({upcomingPasses.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.tabBtn, activeTab === "past" && s.activeTabBtn]}
          onPress={() => setActiveTab("past")}
        >
          <CheckCircle size={15} color={activeTab === "past" ? "#ffffff" : "#64748b"} />
          <Text style={[s.tabText, activeTab === "past" && s.activeTabText]}>
            Past Events ({pastPasses.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.centerContainer}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={s.loadingText}>Fetching your event tickets...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#f97316"]} />}
        >
          {displayedPasses.length > 0 ? (
            displayedPasses.map((pass, index) => (
              <View key={pass.id || index} style={s.passCard}>
                {/* Pass Header Banner */}
                <View style={s.cardHeader}>
                  <View style={s.ticketBadge}>
                    <Ticket size={14} color="#0284c7" />
                    <Text style={s.ticketBadgeText}>
                      {pass.pass_type || pass.ticket_type || "VIP ACCESS PASS"}
                    </Text>
                  </View>
                  <View style={s.statusPill}>
                    <CheckCircle size={12} color="#16a34a" />
                    <Text style={s.statusPillText}>CONFIRMED</Text>
                  </View>
                </View>

                {/* Event Info */}
                <View style={s.cardBody}>
                  <Text style={s.eventTitle}>{pass.event_name || pass.title || "Live Event"}</Text>

                  <View style={s.metaRow}>
                    <Calendar size={14} color="#64748b" />
                    <Text style={s.metaText}>
                      {pass.start_date || "Date to be announced"} {pass.start_time ? `• ${pass.start_time}` : ""}
                    </Text>
                  </View>

                  <View style={s.metaRow}>
                    <MapPin size={14} color="#64748b" />
                    <Text style={s.metaText} numberOfLines={1}>
                      {pass.venue || pass.location || "Venue location details on map"}
                    </Text>
                  </View>

                  {pass.food_preference && pass.food_preference !== "None" && (
                    <View style={s.foodPill}>
                      <Utensils size={12} color="#ea580c" />
                      <Text style={s.foodPillText}>Food Pass: {pass.food_preference}</Text>
                    </View>
                  )}
                </View>

                {/* QR Code Presentation */}
                <View style={s.qrSection}>
                  <View style={s.qrCodeBox}>
                    <QrCode size={72} color="#0f172a" />
                  </View>
                  <View style={s.qrInfoWrap}>
                    <Text style={s.qrLabel}>BOOKING REFERENCE</Text>
                    <Text style={s.qrCodeNumber}>#{pass.booking_ref || pass.id || `BME-${1000 + index}`}</Text>
                    <Text style={s.qrSub}>Show this QR code at entry gate scanner</Text>
                  </View>
                </View>

                {/* Actions Footer */}
                <View style={s.cardFooter}>
                  <TouchableOpacity style={s.actionBtn} onPress={() => handleSharePass(pass)}>
                    <Share2 size={14} color="#0284c7" />
                    <Text style={s.actionBtnText}>Share Pass</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[s.actionBtn, s.actionPrimaryBtn]}
                    onPress={() => navigation?.navigate("EventDetail", { eventId: pass.event_id || pass.id })}
                  >
                    <Sparkles size={14} color="#ffffff" />
                    <Text style={s.actionPrimaryText}>View Event</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={s.emptyWrap}>
              <Ticket size={56} color="#cbd5e1" />
              <Text style={s.emptyTitle}>No Passes Found</Text>
              <Text style={s.emptySub}>
                You don't have any {activeTab} passes yet. Browse upcoming events and book your tickets!
              </Text>
              <TouchableOpacity style={s.exploreBtn} onPress={() => navigation?.navigate("AllEvents")}>
                <Text style={s.exploreBtnText}>Browse Upcoming Events</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
  },
  headerSubTitle: {
    fontSize: 11,
    color: "#64748b",
  },
  refreshBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#e0f2fe",
  },
  tabsRow: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    gap: 6,
  },
  activeTabBtn: {
    backgroundColor: "#f97316",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  activeTabText: {
    color: "#ffffff",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
  },
  passCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  ticketBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ticketBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#0284c7",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#16a34a",
  },
  cardBody: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },
  foodPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    backgroundColor: "#fff7ed",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#ffedd5",
  },
  foodPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#c2410c",
  },
  qrSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  qrCodeBox: {
    width: 88,
    height: 88,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  qrInfoWrap: {
    flex: 1,
    marginLeft: 14,
  },
  qrLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: 0.8,
  },
  qrCodeNumber: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0284c7",
    marginVertical: 2,
  },
  qrSub: {
    fontSize: 11,
    color: "#64748b",
  },
  cardFooter: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#f0f9ff",
    gap: 6,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0284c7",
  },
  actionPrimaryBtn: {
    backgroundColor: "#f97316",
  },
  actionPrimaryText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ffffff",
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
  },
  exploreBtn: {
    backgroundColor: "#f97316",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  exploreBtnText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 13,
  },
});
