import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, ActivityIndicator, ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft, Calendar, MapPin, Users, Tag,
  CheckCircle, AlertCircle, Building2,
  Star, ShoppingBag,
} from "lucide-react-native";
import { getFullEventDetails } from "@Services/api";

const StatusBadge = ({ status }) => {
  const colors = {
    APPROVED: { bg: "#14532d", text: "#4ade80", label: "Approved" },
    PENDING:  { bg: "#713f12", text: "#fbbf24", label: "Pending"  },
    REJECTED: { bg: "#7f1d1d", text: "#f87171", label: "Rejected" },
  };
  const c = colors[status] || colors.PENDING;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{c.label}</Text>
    </View>
  );
};

const SectionCard = ({ title, children }) => (
  <View style={styles.sectionCard}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const InfoRow = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Icon size={15} color="#94a3b8" />
      <View style={{ flex: 1, marginLeft: 8 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{String(value)}</Text>
      </View>
    </View>
  );
};

const Chip = ({ label, color = "#0ea5e9" }) => (
  <View style={[styles.chip, { borderColor: color + "60", backgroundColor: color + "20" }]}>
    <Text style={[styles.chipText, { color }]}>{label}</Text>
  </View>
);

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
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>Go Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  const payload = data?.data || data || {};
  const ev = payload?.eventDetails || payload;
  const organizer = payload?.organizer || {};
  const booking = payload?.booking || {};
  const vendors = payload?.vendors || [];
  const sponsors = payload?.sponsors || [];
  const guests = payload?.guests || [];
  const terms = payload?.terms || [];
  const food_items = payload?.food_items || [];
  const layout = payload?.layout || {};

  const bannerUrl = ev?.banner_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800";
  const entryType = booking?.charge_type || ev?.entry_type || "Free";
  const isPaid    = entryType?.toLowerCase() === "paid" || (ev?.pass_fee && Number(ev.pass_fee) > 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Sticky Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
          <ArrowLeft size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{ev?.event_name || "Event Details"}</Text>
        <StatusBadge status={ev?.status} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Banner */}
        <ImageBackground
          source={{ uri: bannerUrl }}
          style={styles.banner}
          resizeMode="cover"
        >
          <View style={styles.bannerGradient} />
        </ImageBackground>

        {/* Title Block */}
        <View style={styles.titleBlock}>
          <View style={styles.titleRow}>
            {ev?.category && <Chip label={ev.category} color="#f97316" />}
            {ev?.event_code && <Chip label={ev.event_code} color="#0ea5e9" />}
          </View>
          <Text style={styles.eventName}>{ev?.event_name}</Text>
          {ev?.description ? <Text style={styles.description}>{ev.description}</Text> : null}
        </View>

        {/* Date, Time, Venue */}
        <SectionCard title="Event Info">
          <InfoRow icon={Calendar} label="Start"    value={ev?.start_date ? `${ev.start_date}  ${ev?.start_time || ""}` : null} />
          <InfoRow icon={Calendar} label="End"      value={ev?.end_date   ? `${ev.end_date}  ${ev?.end_time   || ""}` : null} />
          <InfoRow icon={MapPin}   label="Venue"    value={ev?.venue}   />
          <InfoRow icon={MapPin}   label="Address"  value={ev?.address} />
          <InfoRow icon={Tag}      label="Type"     value={ev?.event_type} />
          <InfoRow icon={Calendar} label="Occurrence" value={ev?.occurrence} />
          {ev?.visibility && <InfoRow icon={CheckCircle} label="Visibility" value={ev.visibility} />}
        </SectionCard>

        {/* Booking */}
        {booking && (
          <SectionCard title="Booking Details">
            <InfoRow icon={Calendar} label="Booking Open"    value={booking.booking_start_date} />
            <InfoRow icon={Calendar} label="Booking Close"   value={booking.booking_end_date}   />
            <InfoRow icon={Users}    label="Capacity"        value={booking.capacity}            />
            <InfoRow icon={Tag}      label="Pass Type"       value={booking.pass_type}           />
            <InfoRow icon={Tag}      label="Entry Type"      value={booking.charge_type}         />
            <InfoRow icon={Tag}      label="Max Passes"      value={booking.max_pass}            />
            {isPaid && booking.price_type && (
              <InfoRow icon={Tag} label="Price" value={`${booking.currency || "INR"} — ${booking.price_type}`} />
            )}
          </SectionCard>
        )}



        {/* Vendors */}
        {vendors && vendors.length > 0 && (
          <SectionCard title="Vendors">
            {vendors.map((v, i) => (
              <View key={i} style={styles.listItem}>
                <ShoppingBag size={14} color="#0ea5e9" />
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text style={styles.listItemTitle}>{v.vendor_name}</Text>
                  <Text style={styles.listItemSub}>{v.vendor_type} · {v.pass_count || 0} passes</Text>
                </View>
              </View>
            ))}
          </SectionCard>
        )}

        {/* Sponsors */}
        {sponsors && sponsors.length > 0 && (
          <SectionCard title="Sponsors">
            {sponsors.map((s, i) => (
              <View key={i} style={styles.listItem}>
                <Star size={14} color="#eab308" />
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text style={styles.listItemTitle}>{s.sponsor_name}</Text>
                  <Text style={styles.listItemSub}>{s.sponsorship_type}</Text>
                </View>
              </View>
            ))}
          </SectionCard>
        )}

        {/* Guests */}
        {guests && guests.length > 0 && (
          <SectionCard title="Special Guests">
            {guests.map((g, i) => (
              <View key={i} style={styles.listItem}>
                {g.image
                  ? <Image source={{ uri: g.image }} style={styles.guestAvatar} />
                  : <View style={styles.guestAvatarFallback}><Text style={{ color: "#fff", fontWeight: "bold" }}>{g.guest_name?.[0]?.toUpperCase()}</Text></View>
                }
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.listItemTitle}>{g.guest_name}</Text>
                  <Text style={styles.listItemSub}>{g.designation}  ·  {g.contact}</Text>
                </View>
              </View>
            ))}
          </SectionCard>
        )}

        {/* Terms */}
        {terms && terms.length > 0 && (
          <SectionCard title="Terms & Policies">
            {terms.map((t, i) => (
              <View key={i} style={styles.termRow}>
                <CheckCircle size={14} color="#4ade80" style={{ marginTop: 2 }} />
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text style={styles.termName}>{t.policy_name}</Text>
                  <Text style={styles.termSub}>{t.policy_group} — {t.policy_type}</Text>
                </View>
              </View>
            ))}
          </SectionCard>
        )}

        {/* Food */}
        {food_items && food_items.length > 0 && (
          <SectionCard title="Food Provisions">
            {food_items.map((f, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.foodEmoji}>🍽️</Text>
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text style={styles.listItemTitle}>{f.caterer_name} — {f.meal_type}</Text>
                  <Text style={styles.listItemSub}>{f.food_type} · ₹{f.price_inr || 0} / ${f.price_usd || 0}</Text>
                </View>
              </View>
            ))}
          </SectionCard>
        )}

        {/* Stalls */}
        {layout?.stalls && layout.stalls.length > 0 && (
          <SectionCard title="Stalls / Layout">
            {layout.stalls.map((st, i) => (
              <View key={i} style={styles.listItem}>
                <Building2 size={14} color="#a78bfa" />
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text style={styles.listItemTitle}>{st.stall_name}</Text>
                  <Text style={styles.listItemSub}>{st.stall_type} · {st.stall_size} · ₹{st.price_inr || "—"}</Text>
                </View>
              </View>
            ))}
          </SectionCard>
        )}

        {/* Book Tickets CTA Button */}
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigation.navigate("UserBooking", { eventId })}
          activeOpacity={0.85}
        >
          <Text style={styles.bookBtnText}>Book Tickets Now</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center", padding: 20 },
  loadingText: { color: "#64748b", marginTop: 12, fontSize: 14, fontWeight: "600" },
  errorText: { color: "#ef4444", marginTop: 12, fontSize: 14, textAlign: "center", fontWeight: "600" },
  backBtn: { marginTop: 20, backgroundColor: "#f97316", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  backBtnText: { color: "#ffffff", fontWeight: "bold" },

  header: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16,
    paddingVertical: 14, backgroundColor: "#0f172a",
    borderBottomWidth: 1, borderBottomColor: "#1e293b",
  },
  backIcon: { marginRight: 12, padding: 4 },
  headerTitle: { flex: 1, color: "#ffffff", fontSize: 16, fontWeight: "bold" },

  banner: { width: "100%", aspectRatio: 16 / 9, backgroundColor: "#e2e8f0", justifyContent: "flex-end" },
  bannerGradient: { position: "absolute", left: 0, right: 0, bottom: 0, height: 120, backgroundColor: "rgba(15,23,42,0.4)" },

  titleBlock: { padding: 16, backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", marginBottom: 16 },
  titleRow: { flexDirection: "row", gap: 8, marginBottom: 10, flexWrap: "wrap" },
  eventName: { color: "#0f172a", fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  description: { color: "#475569", fontSize: 14, lineHeight: 22 },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: "bold", textTransform: "uppercase" },

  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 11, fontWeight: "bold", textTransform: "uppercase" },

  sectionCard: {
    backgroundColor: "#ffffff", borderRadius: 16, marginHorizontal: 16,
    marginBottom: 16, padding: 16, borderWidth: 1, borderColor: "#e2e8f0",
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6,
  },
  sectionTitle: {
    color: "#0284c7", fontSize: 13, fontWeight: "bold", textTransform: "uppercase",
    letterSpacing: 1, marginBottom: 14, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: "#f1f5f9",
  },

  infoRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  infoLabel: { color: "#94a3b8", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  infoValue: { color: "#0f172a", fontSize: 14, fontWeight: "600" },

  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  listItemTitle: { color: "#0f172a", fontSize: 14, fontWeight: "bold" },
  listItemSub: { color: "#64748b", fontSize: 12, marginTop: 2 },

  termRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
  termName: { color: "#0f172a", fontSize: 14, fontWeight: "600" },
  termSub: { color: "#64748b", fontSize: 12, marginTop: 2 },

  guestAvatar: { width: 40, height: 40, borderRadius: 20 },
  guestAvatarFallback: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#0284c7", justifyContent: "center", alignItems: "center" },

  foodEmoji: { fontSize: 18 },

  bookBtn: {
    marginHorizontal: 16, marginTop: 8, marginBottom: 24, backgroundColor: "#f97316",
    borderRadius: 16, padding: 16, alignItems: "center", elevation: 4,
    shadowColor: "#f97316", shadowOpacity: 0.25, shadowRadius: 8,
  },
  bookBtnText: { color: "#ffffff", fontWeight: "900", fontSize: 16, letterSpacing: 0.5 },
});
