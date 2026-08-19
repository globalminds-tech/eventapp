import React, { useState, useEffect } from "react";
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ImageBackground, TextInput, ActivityIndicator, Dimensions 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { 
  Search, MapPin, Calendar, Star, ChevronDown, Check,
  X, ArrowRight, Sparkles 
} from "lucide-react-native";
import { getHomeEventshow } from "@Services/api";

const { width } = Dimensions.get("window");

export default function Home({ navigation }) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const popularCategories = [
    { name: "CONFERENCE", filterName: "Business", image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600" },
    { name: "ENTERTAINMENT", filterName: "Music", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600" },
    { name: "CORPORATE", filterName: "Business", image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=600" },
    { name: "EXPO", filterName: "Technology", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600" },
    { name: "EDUCATION", filterName: "Education", image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600" },
    { name: "SPORTS", filterName: "Sports", image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=600" },
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await getHomeEventshow();
      if (!data || data.length === 0) return;

      const formatted = data.map((e) => {
        const isDonation = e.entry_type === "Donation" || String(e.pass_fee).toLowerCase() === "donation";
        const isFree = e.entry_type === "Free" || (!isDonation && (!e.pass_fee || Number(e.pass_fee) === 0));
        return {
          id: e.id,
          title: e.event_name,
          category: e.category || "General",
          entry_type: isDonation ? "Donation" : isFree ? "Free" : "Paid",
          price: isDonation || isFree ? 0 : (Number(e.pass_fee) || 0),
          location: e.venue,
          fullLocation: `${e.venue}, ${e.address}`,
          date: e.start_date,
          endDate: e.end_date,
          image: e.banner_url || "https://via.placeholder.com/400",
        };
      });

      const sorted = [...formatted].sort((a, b) => new Date(a.date) - new Date(b.date));
      setEvents(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    navigation.navigate("AllEvents", {
      title: searchQuery,
      category: searchCategory || "All",
      location: searchLocation,
    });
  };

  const getCityFromLocation = (loc) => {
    if (!loc) return "";
    const parts = loc.split(",");
    let lastPart = parts[parts.length - 1]?.trim() || "";
    if (lastPart.toUpperCase() === "INDIA" || lastPart.toUpperCase() === "TAMIL NADU") {
      lastPart = parts[parts.length - 2]?.trim() || lastPart;
    }
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).toLowerCase();
  };

  const citiesList = Array.from(new Set(events.map((e) => getCityFromLocation(e.fullLocation || e.location)).filter(Boolean))).sort();

  const featuredEvent = events[0];
  const otherEvents = events.filter((e) => !selectedCity || getCityFromLocation(e.fullLocation || e.location) === selectedCity).slice(0, 4);

  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        
        {/* Header Navigation */}
        <View style={s.navHeader}>
          <View style={s.logoWrap}>
            <View style={s.logoIconWrap}>
              <View style={[s.logoDot, { backgroundColor: "#3b82f6", transform: [{ rotate: "-12deg" }] }]} />
              <View style={[s.logoDot, { backgroundColor: "#f97316", transform: [{ rotate: "6deg" }] }]} />
              <View style={[s.logoDot, { backgroundColor: "#22c55e", transform: [{ rotate: "-3deg" }] }]} />
            </View>
            <Text style={s.logoText}>BookMyEvent</Text>
          </View>
          <TouchableOpacity style={s.loginBtn} onPress={() => navigation.navigate("Login")}>
            <Text style={s.loginBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={s.hero}>
          <View style={s.heroContent}>
            <View style={s.badge}>
              <View style={s.badgeDot} />
              <Text style={s.badgeText}>Discover Amazing Events</Text>
            </View>
            <Text style={s.heroTitle}>
              Turning Your Vision Into {"\n"}
              <Text style={s.heroTitleHighlight}>Unforgettable Moments</Text>
            </Text>
            <Text style={s.heroSubtitle}>
              From electrifying concerts to inspiring conferences. Discover, book, and experience events that transform your world.
            </Text>
          </View>
        </View>

        {/* Search Widget */}
        <View style={s.searchWidget}>
          <View style={s.searchInputWrap}>
            <Search size={18} color="#94a3b8" />
            <TextInput 
              style={s.searchInput}
              placeholder="What are you looking for?"
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <View style={s.searchRow}>
            <View style={s.searchHalfInput}>
              <Text style={s.searchLabel}>Category</Text>
              <TextInput 
                style={s.searchInputSmall}
                placeholder="All"
                placeholderTextColor="#f8fafc"
                value={searchCategory}
                onChangeText={setSearchCategory}
              />
            </View>
            <View style={s.searchHalfInput}>
              <Text style={s.searchLabel}>Location</Text>
              <TextInput 
                style={s.searchInputSmall}
                placeholder="Anywhere"
                placeholderTextColor="#f8fafc"
                value={searchLocation}
                onChangeText={setSearchLocation}
              />
            </View>
          </View>
          <TouchableOpacity style={s.searchBtn} onPress={handleSearch}>
            <Text style={s.searchBtnText}>SEARCH</Text>
          </TouchableOpacity>
        </View>

        {/* Popular Categories */}
        <View style={s.section}>
          <Text style={s.sectionSubTitle}>Explore Categories</Text>
          <Text style={s.sectionTitle}>POPULAR CATEGORIES</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll} contentContainerStyle={{ paddingHorizontal: 16 }} keyboardShouldPersistTaps="handled">
            {popularCategories.map((cat, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={s.catCard}
                onPress={() => navigation.navigate("AllEvents", { category: cat.filterName })}
              >
                <ImageBackground source={{ uri: cat.image }} style={s.catImage} imageStyle={{ borderRadius: 16 }}>
                  <View style={s.catOverlay} />
                  <View style={s.catBadge}>
                    <Text style={s.catBadgeText}>{cat.name}</Text>
                  </View>
                  <View style={s.catBottom}>
                    <Text style={s.catBottomText}>{cat.filterName} Events</Text>
                    <ArrowRight size={16} color="#fff" />
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Events List */}
        <View style={s.section}>
          <View style={s.eventsHeader}>
            <Text style={s.sectionTitle}>EVENTS</Text>
            <TouchableOpacity 
              style={s.viewAllBtn}
              onPress={() => navigation.navigate("AllEvents")}
            >
              <Text style={s.viewAllBtnText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {/* City Filter pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.cityScroll} contentContainerStyle={{ paddingHorizontal: 16 }} keyboardShouldPersistTaps="handled">
            <TouchableOpacity 
              style={[s.cityPill, !selectedCity && s.cityPillActive]}
              onPress={() => setSelectedCity("")}
            >
              <Text style={[s.cityPillText, !selectedCity && s.cityPillTextActive]}>All Cities</Text>
            </TouchableOpacity>
            {citiesList.map((city) => (
              <TouchableOpacity 
                key={city}
                style={[s.cityPill, selectedCity === city && s.cityPillActive]}
                onPress={() => setSelectedCity(city)}
              >
                <Text style={[s.cityPillText, selectedCity === city && s.cityPillTextActive]}>{city}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {isLoading ? (
            <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 40 }} />
          ) : (
            <View style={s.eventsGrid}>
              {otherEvents.map((event) => {
                const eventDate = new Date(event.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isPast = event.date ? (eventDate < today) : false;

                return (
                  <TouchableOpacity
                    key={event.id}
                    style={s.eventCard}
                    onPress={() => navigation.navigate("EventDetail", { eventId: event.id })}
                    activeOpacity={0.9}
                  >
                    <ImageBackground
                      source={{ uri: event.image }}
                      style={s.eventCardBg}
                      imageStyle={s.eventCardImg}
                      resizeMode="cover"
                    >
                      {/* Dark gradient overlay */}
                      <View style={s.cardOverlay} />

                      {/* Price tag top-left */}
                      <View style={s.priceTag}>
                        <Text style={s.priceText}>
                          {event.entry_type === "Paid" ? `₹${event.price}` : event.entry_type}
                        </Text>
                      </View>

                      {/* Content bottom */}
                      <View style={s.cardBottom}>
                        <Text style={s.eventCat}>{event.category}</Text>
                        <Text style={s.eventTitle} numberOfLines={2}>{event.title}</Text>
                        
                        <View style={s.cardActionRow}>
                          <View style={{ flex: 1, gap: 3 }}>
                            <View style={s.eventRow}>
                              <Calendar size={13} color="rgba(255,255,255,0.75)" />
                              <Text style={s.eventRowText}>{event.date}</Text>
                            </View>
                            <View style={s.eventRow}>
                              <MapPin size={13} color="rgba(255,255,255,0.75)" />
                              <Text style={s.eventRowText} numberOfLines={1}>{event.location}</Text>
                            </View>
                          </View>

                          <TouchableOpacity
                            style={[s.bookBtn, isPast && s.bookBtnDisabled]}
                            disabled={isPast}
                            onPress={() => navigation.navigate("UserBooking", { eventId: event.id })}
                          >
                            <Text style={[s.bookBtnText, isPast && s.bookBtnTextDisabled]}>
                              {isPast ? "Booking Closed" : "Book Tickets"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>
                );
              })}
              {otherEvents.length === 0 && (
                <View style={s.emptyBox}>
                  <Text style={s.emptyTitle}>No Results Found</Text>
                  <Text style={s.emptyDesc}>There are no events available right now. Check back soon!</Text>
                </View>
              )}
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#020617" }, // slate-950

  navHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16, backgroundColor: "rgba(2, 6, 23, 0.8)", borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  logoWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoIconWrap: { flexDirection: "row", gap: 2 },
  logoDot: { width: 14, height: 14, borderRadius: 3 },
  logoText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  loginBtn: { backgroundColor: "#fff", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  loginBtnText: { color: "#020617", fontSize: 13, fontWeight: "bold" },

  hero: { paddingHorizontal: 16, paddingTop: 40, paddingBottom: 60, alignItems: "center" },
  heroContent: { alignItems: "center" },
  badge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(249, 115, 22, 0.1)", borderWidth: 1, borderColor: "rgba(249, 115, 22, 0.3)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 20 },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#f97316", marginRight: 8 },
  badgeText: { color: "#fb923c", fontSize: 12, fontWeight: "bold" },
  heroTitle: { fontSize: 36, fontWeight: "bold", color: "#fff", textAlign: "center", marginBottom: 16 },
  heroTitleHighlight: { color: "#fb923c" }, // orange-400
  heroSubtitle: { fontSize: 15, color: "#94a3b8", textAlign: "center", lineHeight: 24, paddingHorizontal: 10 },

  searchWidget: { backgroundColor: "#1e293b", marginHorizontal: 16, borderRadius: 24, padding: 16, marginTop: -40, borderWidth: 1, borderColor: "#334155", elevation: 10, shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 10 },
  searchInputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: "#0f172a", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12 },
  searchInput: { flex: 1, color: "#fff", marginLeft: 10, fontSize: 15 },
  searchRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  searchHalfInput: { flex: 1, backgroundColor: "#0f172a", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 },
  searchLabel: { fontSize: 11, color: "#64748b", textTransform: "uppercase", marginBottom: 4 },
  searchInputSmall: { color: "#fff", fontSize: 14, padding: 0 },
  searchBtn: { backgroundColor: "#2563eb", borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  searchBtnText: { color: "#fff", fontSize: 14, fontWeight: "bold", letterSpacing: 1 },

  section: { marginTop: 40 },
  sectionSubTitle: { color: "#f97316", fontSize: 12, fontWeight: "bold", textTransform: "uppercase", textAlign: "center", letterSpacing: 1, marginBottom: 4 },
  sectionTitle: { color: "#fff", fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  
  catScroll: { marginTop: 10 },
  catCard: { width: 240, height: 160, marginRight: 16, borderRadius: 16, overflow: "hidden" },
  catImage: { width: "100%", height: "100%", justifyContent: "space-between", padding: 12 },
  catOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  catBadge: { alignSelf: "flex-start", backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  catBadgeText: { color: "#fff", fontSize: 10, fontWeight: "bold", letterSpacing: 1 },
  catBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  catBottomText: { color: "#fff", fontSize: 14, fontWeight: "bold" },

  eventsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, marginBottom: 16 },
  viewAllBtn: { backgroundColor: "#fff", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  viewAllBtnText: { color: "#0f172a", fontSize: 12, fontWeight: "bold", textTransform: "uppercase" },

  cityScroll: { marginBottom: 20 },
  cityPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#1e293b", marginRight: 8, borderWidth: 1, borderColor: "#334155" },
  cityPillActive: { backgroundColor: "#eab308", borderColor: "#eab308" },
  cityPillText: { color: "#94a3b8", fontSize: 13, fontWeight: "bold" },
  cityPillTextActive: { color: "#fff" },

  eventsGrid: { paddingHorizontal: 16, gap: 16 },
  eventCard: { borderRadius: 16, overflow: "hidden", height: 240 },
  eventCardBg: { flex: 1, justifyContent: "space-between", padding: 0 },
  eventCardImg: { borderRadius: 16 },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.42)", borderRadius: 16 },
  priceTag: { alignSelf: "flex-start", margin: 12, backgroundColor: "rgba(0,0,0,0.65)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  priceText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  cardBottom: { padding: 14 },
  eventCat: { color: "#fb923c", fontSize: 11, fontWeight: "bold", textTransform: "uppercase", marginBottom: 4, letterSpacing: 0.5 },
  eventTitle: { color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  eventRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  eventRowText: { color: "rgba(255,255,255,0.8)", fontSize: 12, flex: 1 },
  
  cardActionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  bookBtn: { backgroundColor: "#2563eb", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: "flex-end" },
  bookBtnDisabled: { backgroundColor: "#334155" },
  bookBtnText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  bookBtnTextDisabled: { color: "#94a3b8" },

  emptyBox: { backgroundColor: "rgba(30, 41, 59, 0.4)", borderRadius: 16, padding: 32, alignItems: "center", borderWidth: 1, borderColor: "#334155", marginTop: 20 },
  emptyTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  emptyDesc: { color: "#94a3b8", fontSize: 13, textAlign: "center" },
});
