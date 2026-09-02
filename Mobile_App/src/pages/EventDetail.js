import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, ActivityIndicator, ImageBackground, Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft, Calendar, MapPin, Users, Tag,
  CheckCircle, AlertCircle, Building2,
  Star, ShoppingBag, ChevronRight, Utensils,
  Car
} from "lucide-react-native";
import { getFullEventDetails } from "@Services/api";

const { width } = Dimensions.get("window");

export default function EventDetail({ navigation, route }) {
  const { eventId } = route.params || {};
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!eventId) { setError("No event ID provided"); setLoading(false); return; }
    getFullEventDetails(eventId)
      .then(setData)
      .catch((e) => setError(e.message || "Failed to load event details"))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return (
    <SafeAreaView style={styles.center}>
      <ActivityIndicator size="large" color="#f97316" />
      <Text style={styles.loadingText}>Loading event details...</Text>
    </SafeAreaView>
  );

  if (error || !data) return (
    <SafeAreaView style={styles.center}>
      <AlertCircle size={48} color="#ef4444" />
      <Text style={styles.errorText}>{error || "Event not found"}</Text>
      <TouchableOpacity style={styles.backBtnError} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnTextError}>Go Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  const payload = data?.data || data || {};
  const ev = payload?.eventDetails || payload;
  const booking = payload?.booking || {};
  const guests = payload?.guests || [];
  const sponsors = payload?.sponsors || [];
  const terms = payload?.terms || [];
  const food_items = payload?.food_items || [];
  const layout = payload?.layout || {};

  const bannerUrl = ev?.banner_url || ev?.image || ev?.banner || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800";
  const p1 = parseFloat(booking?.price_inr || booking?.priceINR);
  const p2 = parseFloat(ev?.pass_fee || booking?.pass_fee);
  const p3 = parseFloat(ev?.price_inr);
  const passFee = (p1 > 0 ? p1 : (p2 > 0 ? p2 : (p3 > 0 ? p3 : 0)));
  const isPaid = passFee > 0;

  const priceDisplay = isPaid ? `₹ ${passFee}` : "FREE PASS";

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBack} onPress={() => navigation.goBack()}>
          <ArrowLeft size={16} color="#64748b" />
          <Text style={styles.navBackText}>Back to Events</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>{ev?.event_name || "Event Details"}</Text>
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>Verified Event Pass</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Massive Hero Block */}
        <View style={styles.heroWrap}>
          <ImageBackground source={{ uri: bannerUrl }} style={styles.heroBanner} resizeMode="cover">
            <View style={styles.heroGradient} />
            <View style={styles.heroTopBadges}>
              {ev?.category && (
                <View style={[styles.badge, { backgroundColor: "#f97316" }]}>
                  <Text style={styles.badgeText}>{ev.category}</Text>
                </View>
              )}
              {ev?.sub_category && (
                <View style={[styles.badge, { backgroundColor: "#eab308" }]}>
                  <Text style={styles.badgeText}>{ev.sub_category}</Text>
                </View>
              )}
              {ev?.event_code && (
                <View style={[styles.badge, { backgroundColor: "#0f172a" }]}>
                  <Text style={styles.badgeText}>{ev.event_code}</Text>
                </View>
              )}
            </View>

            <View style={styles.heroBottomInfo}>
              <View style={styles.liveRow}>
                <Star size={14} color="#eab308" fill="#eab308" />
                <Text style={styles.liveText}>Live Registered Event</Text>
              </View>
              <Text style={styles.heroTitle}>{ev?.event_name}</Text>
            </View>
          </ImageBackground>

          <View style={styles.heroContent}>
            <Text style={styles.sectionHeaderTitle}>EVENT OVERVIEW & HIGHLIGHTS</Text>
            <Text style={styles.heroDesc}>{ev?.description || ev?.event_name}</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.highlightsScroll} contentContainerStyle={{ gap: 12 }}>
              <View style={styles.highlightCard}>
                <View style={styles.highlightRow}><Calendar size={12} color="#f97316" /><Text style={styles.highlightLabel}>DATE & SCHEDULE</Text></View>
                <Text style={styles.highlightVal}>{ev?.start_date}</Text>
                <Text style={styles.highlightSub}>Timings: {ev?.start_time || "TBA"}</Text>
              </View>
              <View style={styles.highlightCard}>
                <View style={styles.highlightRow}><MapPin size={12} color="#f97316" /><Text style={styles.highlightLabel}>VENUE LOCATION</Text></View>
                <Text style={styles.highlightVal} numberOfLines={1}>{ev?.venue}</Text>
                <Text style={styles.highlightSub} numberOfLines={1}>{ev?.address || "Address TBA"}</Text>
              </View>
              <View style={styles.highlightCard}>
                <View style={styles.highlightRow}><Tag size={12} color="#f97316" /><Text style={styles.highlightLabel}>PASS STATUS</Text></View>
                <Text style={styles.highlightVal}>{isPaid ? "Paid Entry Pass" : "Free Entry Pass"}</Text>
                <Text style={styles.highlightSub}>Instant E-Ticket Delivery</Text>
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Floating Booking Card (Mocking the right side panel) */}
        <View style={styles.bookingCard}>
          <View style={styles.bookingTopRow}>
            <Text style={styles.regFeeLabel}>REGISTRATION FEE</Text>
            <View style={styles.passTypePill}><Text style={styles.passTypeText}>{isPaid ? "Paid Pass" : "Free Pass"}</Text></View>
          </View>
          <Text style={styles.bookingPrice}>{priceDisplay}</Text>
          <View style={styles.bookingDivider} />
          <View style={styles.bookingInfoRow}>
            <Calendar size={16} color="#f97316" />
            <View>
              <Text style={styles.bookingInfoVal}>{ev?.start_date}</Text>
              <Text style={styles.bookingInfoSub}>Starts at {ev?.start_time || "TBA"}</Text>
            </View>
          </View>
          <View style={styles.bookingInfoRow}>
            <MapPin size={16} color="#f97316" />
            <View>
              <Text style={styles.bookingInfoVal}>{ev?.venue}</Text>
              <Text style={styles.bookingInfoSub} numberOfLines={1}>{ev?.address}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bookBtn} onPress={() => navigation.navigate("UserBooking", { eventId, eventData: ev })} activeOpacity={0.85}>
            <Text style={styles.bookBtnText}>Proceed to Book Ticket</Text>
            <ChevronRight size={18} color="#fff" />
          </TouchableOpacity>
          <View style={styles.instantRow}>
            <CheckCircle size={12} color="#10b981" />
            <Text style={styles.instantText}>Instant E-Pass Generation & QR Access</Text>
          </View>
        </View>

        {/* Guests Section */}
        {guests && guests.length > 0 && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeader}><Star size={16} color="#f97316" /><Text style={styles.sectionTitle}>Chief Guests & Dignitaries</Text></View>
            {guests.map((g, i) => (
              <View key={i} style={styles.listItem}>
                {g.image ? <Image source={{ uri: g.image }} style={styles.listAvatar} /> : <View style={styles.listAvatarFallback}><Text style={styles.avatarText}>{g.guest_name?.[0]?.toUpperCase()}</Text></View>}
                <View style={{ flex: 1 }}>
                  <Text style={styles.listTitle}>{g.guest_name}</Text>
                  <Text style={styles.listSub}>{g.designation}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Sponsors Section */}
        {sponsors && sponsors.length > 0 && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeader}><Star size={16} color="#f97316" /><Text style={styles.sectionTitle}>Official Event Partners & Sponsors</Text></View>
            {sponsors.map((s, i) => (
              <View key={i} style={styles.listItemCenter}>
                <View style={styles.sponsorBadge}><Text style={styles.sponsorBadgeText}>{s.sponsorship_type}</Text></View>
                <Text style={styles.listTitle}>{s.sponsor_name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Stalls Section */}
        {layout?.stalls && layout.stalls.length > 0 && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeader}><Building2 size={16} color="#8b5cf6" /><Text style={styles.sectionTitle}>Exhibition Stalls & Floor Layout</Text></View>
            {layout.stalls.map((st, i) => (
              <View key={i} style={styles.stallItem}>
                <View style={styles.stallTopRow}>
                  <View style={styles.stallBadge}><Text style={styles.stallBadgeText}>{st.stall_name}</Text></View>
                  <Text style={styles.stallSize}>{st.stall_size}</Text>
                </View>
                <Text style={styles.stallType}>{st.stall_type}</Text>
                <Text style={styles.stallPrice}>INR {st.price_inr || 0}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Food Section */}
        {food_items && food_items.length > 0 && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeader}><Utensils size={16} color="#10b981" /><Text style={styles.sectionTitle}>Catering & Meal Provisions</Text></View>
            {food_items.map((f, i) => (
              <View key={i} style={styles.listItem}>
                <View style={styles.foodIconWrap}><Utensils size={16} color="#10b981" /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listTitle}>{f.caterer_name} - {f.meal_type}</Text>
                  <Text style={styles.listSubGreen}>{f.food_type} ({f.price_inr ? `INR ${f.price_inr}` : 'Free'})</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Terms */}
        {terms && terms.length > 0 && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeader}><CheckCircle size={16} color="#64748b" /><Text style={styles.sectionTitle}>Terms & Policies</Text></View>
            <View style={styles.termBox}>
              {terms.map((t, i) => (
                <View key={i} style={styles.termRow}>
                  <CheckCircle size={14} color="#10b981" />
                  <Text style={styles.termText}>{t.policy_name} ({t.policy_type})</Text>
                </View>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center", padding: 20 },
  loadingText: { color: "#64748b", marginTop: 12, fontSize: 14, fontWeight: "600" },
  errorText: { color: "#ef4444", marginTop: 12, fontSize: 14, textAlign: "center", fontWeight: "600" },
  backBtnError: { marginTop: 20, backgroundColor: "#f97316", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  backBtnTextError: { color: "#ffffff", fontWeight: "bold" },

  navbar: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderColor: "#e2e8f0" },
  navBack: { flexDirection: "row", alignItems: "center", gap: 6, marginRight: 16 },
  navBackText: { color: "#475569", fontSize: 13, fontWeight: "600" },
  navTitle: { flex: 1, color: "#0f172a", fontSize: 15, fontWeight: "bold" },
  verifiedBadge: { backgroundColor: "#ecfdf5", borderWidth: 1, borderColor: "#a7f3d0", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  verifiedText: { color: "#10b981", fontSize: 9, fontWeight: "900" },

  heroWrap: { margin: 16, backgroundColor: "#fff", borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: "#e2e8f0", elevation: 2, shadowColor: "#0f172a", shadowOpacity: 0.05, shadowRadius: 10 },
  heroBanner: { width: "100%", height: 220, justifyContent: "space-between" },
  heroGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15,23,42,0.4)" },
  heroTopBadges: { flexDirection: "row", gap: 8, padding: 16 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  heroBottomInfo: { padding: 16 },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  liveText: { color: "#eab308", fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  heroTitle: { color: "#fff", fontSize: 24, fontWeight: "900" },

  heroContent: { padding: 16 },
  sectionHeaderTitle: { color: "#94a3b8", fontSize: 10, fontWeight: "900", letterSpacing: 1, marginBottom: 6 },
  heroDesc: { color: "#0f172a", fontSize: 14, marginBottom: 16 },
  
  highlightsScroll: { flexDirection: "row" },
  highlightCard: { width: 140, borderWidth: 1, borderColor: "#0f172a", borderRadius: 12, padding: 12, backgroundColor: "#f8fafc" },
  highlightRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 6 },
  highlightLabel: { color: "#f97316", fontSize: 9, fontWeight: "900" },
  highlightVal: { color: "#0f172a", fontSize: 11, fontWeight: "bold", marginBottom: 2 },
  highlightSub: { color: "#64748b", fontSize: 10 },

  bookingCard: { marginHorizontal: 16, marginBottom: 24, backgroundColor: "#fff", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: "#e2e8f0", elevation: 4, shadowColor: "#0f172a", shadowOpacity: 0.1, shadowRadius: 15 },
  bookingTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  regFeeLabel: { color: "#64748b", fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  passTypePill: { backgroundColor: "#fff7ed", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: "#fed7aa" },
  passTypeText: { color: "#ea580c", fontSize: 10, fontWeight: "bold" },
  bookingPrice: { color: "#0f172a", fontSize: 28, fontWeight: "900" },
  bookingDivider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 16 },
  bookingInfoRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 16 },
  bookingInfoVal: { color: "#0f172a", fontSize: 13, fontWeight: "bold" },
  bookingInfoSub: { color: "#64748b", fontSize: 11 },
  
  bookBtn: { backgroundColor: "#f97316", borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, gap: 8, marginTop: 8 },
  bookBtnText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  instantRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 4, marginTop: 12 },
  instantText: { color: "#10b981", fontSize: 10, fontWeight: "600" },

  sectionWrap: { marginHorizontal: 16, marginBottom: 24 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionTitle: { color: "#0f172a", fontSize: 16, fontWeight: "900" },
  
  listItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 12, borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 10 },
  listAvatar: { width: 44, height: 44, borderRadius: 10, marginRight: 12 },
  listAvatarFallback: { width: 44, height: 44, borderRadius: 10, marginRight: 12, backgroundColor: "#f97316", justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  listTitle: { color: "#0f172a", fontSize: 14, fontWeight: "bold" },
  listSub: { color: "#64748b", fontSize: 12, marginTop: 2 },
  listSubGreen: { color: "#10b981", fontSize: 12, marginTop: 2 },

  listItemCenter: { alignItems: "center", backgroundColor: "#fff", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 10 },
  sponsorBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, borderWidth: 1, borderColor: "#fcd34d", marginBottom: 8 },
  sponsorBadgeText: { color: "#d97706", fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  
  stallItem: { backgroundColor: "#fff", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#0f172a", marginBottom: 10 },
  stallTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  stallBadge: { backgroundColor: "#f3e8ff", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  stallBadgeText: { color: "#9333ea", fontSize: 10, fontWeight: "bold" },
  stallSize: { color: "#64748b", fontSize: 11 },
  stallType: { color: "#0f172a", fontSize: 13, fontWeight: "bold", marginBottom: 4 },
  stallPrice: { color: "#9333ea", fontSize: 13, fontWeight: "bold" },

  foodIconWrap: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#ecfdf5", justifyContent: "center", alignItems: "center", marginRight: 12 },

  termBox: { backgroundColor: "#fff", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  termRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  termText: { color: "#475569", fontSize: 12 },
});
