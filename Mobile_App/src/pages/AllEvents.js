import React, { useState, useEffect, useCallback } from "react";
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, ActivityIndicator, ImageBackground, Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, MapPin, Calendar, Filter, RefreshCw, ArrowRight } from "lucide-react-native";
import { getHomeEventshow, getFullEventDetails, getCountries, getStates, getCities, getAdminCategories } from "@Services/api";

const { width } = Dimensions.get("window");

export default function AllEvents({ route, navigation }) {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTitle, setSearchTitle] = useState(route?.params?.title || "");
  const [searchCountry, setSearchCountry] = useState("");
  const [searchState, setSearchState] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchCategory, setSearchCategory] = useState(route?.params?.category || "All");
  const [searchLocation, setSearchLocation] = useState(route?.params?.location || "");
  const [searchDate, setSearchDate] = useState("");

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [categories, setCategories] = useState(["All"]);

  useEffect(() => {
    fetchEvents();
    fetchCategories();
    getCountries().then(setCountries).catch(console.error);
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await getAdminCategories();
      const list = res?.categories || res?.data || (Array.isArray(res) ? res : []);
      if (list && list.length > 0) {
        setCategories(["All", ...list.map(c => c.name || c.category_name)]);
      } else {
        setCategories(["All"]);
      }
    } catch (err) {
      console.error(err);
      setCategories(["All"]);
    }
  };

  useEffect(() => {
    if (searchCountry) {
      getStates(searchCountry).then(setStates).catch(console.error);
      setSearchState("");
      setCities([]);
      setSearchCity("");
    } else {
      setStates([]);
      setCities([]);
      setSearchState("");
      setSearchCity("");
    }
  }, [searchCountry]);

  useEffect(() => {
    if (searchCountry && searchState) {
      getCities(searchCountry, searchState).then(setCities).catch(console.error);
      setSearchCity("");
    } else {
      setCities([]);
      setSearchCity("");
    }
  }, [searchCountry, searchState]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await getHomeEventshow();
      const rawList = res?.data || (Array.isArray(res) ? res : []);
      if (!rawList || rawList.length === 0) {
        setEvents([]);
        setFilteredEvents([]);
        return;
      }

      const formatted = rawList.map((e) => {
        const isDonation = e.entry_type === "Donation" || String(e.pass_fee).toLowerCase() === "donation";
        const isFree = e.entry_type === "Free" || (!isDonation && (!e.pass_fee || Number(e.pass_fee) === 0));
        return {
          id: e.id,
          title: e.event_name || e.name || "Live Event",
          category: e.category || "General",
          entry_type: isDonation ? "Donation" : isFree ? "Free" : "Paid",
          price: isDonation || isFree ? 0 : (Number(e.pass_fee) || 0),
          location: e.venue || "Venue",
          fullLocation: `${e.venue || ""}, ${e.address || ""}`,
          date: e.start_date || "",
          endDate: e.end_date || "",
          image: e.banner_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800",
        };
      });

      const sorted = [...formatted].sort((a, b) => new Date(a.date) - new Date(b.date));
      setEvents(sorted);
      setFilteredEvents(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindEvents = useCallback(() => {
    let result = [...events];

    if (searchTitle.trim()) {
      result = result.filter(e => e.title.toLowerCase().includes(searchTitle.toLowerCase()) || e.fullLocation.toLowerCase().includes(searchTitle.toLowerCase()));
    }
    if (searchCountry) {
      const countryObj = countries.find(c => String(c.id) === String(searchCountry));
      if (countryObj) result = result.filter(e => e.fullLocation.toLowerCase().includes(countryObj.country_name.toLowerCase()));
    }
    if (searchState) {
      const stateObj = states.find(s => String(s.id) === String(searchState));
      if (stateObj) result = result.filter(e => e.fullLocation.toLowerCase().includes(stateObj.state_name.toLowerCase()));
    }
    if (searchCity) {
      const cityObj = cities.find(c => String(c.id) === String(searchCity));
      if (cityObj) result = result.filter(e => e.fullLocation.toLowerCase().includes(cityObj.city_name.toLowerCase()));
    }
    if (searchCategory && searchCategory !== "All") {
      result = result.filter(e => e.category?.toLowerCase() === searchCategory.toLowerCase());
    }
    if (searchLocation.trim()) {
      result = result.filter(e => e.fullLocation.toLowerCase().includes(searchLocation.toLowerCase()));
    }
    if (searchDate) {
      result = result.filter(e => new Date(e.date).toISOString().split("T")[0] === searchDate);
    }
    setFilteredEvents(result);
  }, [events, searchTitle, searchCountry, countries, searchState, states, searchCity, searchCategory, searchLocation, searchDate]);

  useEffect(() => { handleFindEvents(); }, [handleFindEvents]);

  const handleResetFilters = () => {
    setSearchTitle("");
    setSearchCountry("");
    setSearchState("");
    setSearchCity("");
    setSearchCategory("All");
    setSearchLocation("");
    setSearchDate("");
    setFilteredEvents(events);
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        {/* Header Hero */}
        <ImageBackground 
          source={{ uri: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1920" }} 
          style={s.hero} 
          imageStyle={{ opacity: 0.2 }}
        >
          <View style={s.heroContent}>
            <Text style={s.heroTitle}>Event Search</Text>
            <Text style={s.heroSubtitle}>Browse, filter, and discover your next unforgettable experience.</Text>
          </View>
        </ImageBackground>

        {/* Filter Card */}
        <View style={s.filterCard}>
          <View style={s.inputWrap}>
            <Search size={18} color="#94a3b8" />
            <TextInput 
              style={s.input} 
              placeholder="Search by event name..." 
              placeholderTextColor="#64748b" 
              value={searchTitle}
              onChangeText={setSearchTitle}
            />
          </View>

          <View style={s.inputWrap}>
            <MapPin size={18} color="#94a3b8" />
            <TextInput 
              style={s.input} 
              placeholder="Location (e.g. Grand Square)" 
              placeholderTextColor="#64748b" 
              value={searchLocation}
              onChangeText={setSearchLocation}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll} keyboardShouldPersistTaps="handled">
            {categories.map(cat => (
              <TouchableOpacity 
                key={cat} 
                style={[s.catBtn, searchCategory === cat && s.catBtnActive]}
                onPress={() => setSearchCategory(cat)}
              >
                <Text style={[s.catText, searchCategory === cat && s.catTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={s.actionRow}>
            <TouchableOpacity style={s.resetBtn} onPress={handleResetFilters}>
              <RefreshCw size={18} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity style={s.searchBtn} onPress={handleFindEvents}>
              <Text style={s.searchBtnText}>Find Events</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Results Header */}
        <View style={s.resultsHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Filter size={18} color="#f97316" />
            <Text style={s.resultsText}>{filteredEvents.length} Events Found</Text>
          </View>
        </View>

        {/* Events Grid */}
        {isLoading ? (
          <View style={s.loadingBox}>
            <ActivityIndicator size="large" color="#0ea5e9" />
            <Text style={s.loadingText}>Fetching events...</Text>
          </View>
        ) : filteredEvents.length === 0 ? (
          <View style={s.emptyBox}>
            <Search size={32} color="#475569" style={{ marginBottom: 16 }} />
            <Text style={s.emptyTitle}>No Events Found</Text>
            <Text style={s.emptyDesc}>Try adjusting your filters or clearing them.</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={handleResetFilters}>
              <Text style={s.emptyBtnText}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.grid}>
            {filteredEvents.map(event => {
              const eventDate = new Date(event.date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isPast = event.date ? (eventDate < today) : false;

              return (
                <TouchableOpacity
                  key={event.id}
                  style={s.eventCard}
                  onPress={() => navigation?.navigate("EventDetail", { eventId: event.id })}
                  activeOpacity={0.9}
                >
                  <ImageBackground
                    source={{ uri: event.image }}
                    style={s.eventCardBg}
                    imageStyle={s.eventCardImg}
                    resizeMode="cover"
                  >
                    <View style={s.cardOverlay} />
                    <View style={s.priceTag}>
                      <Text style={s.priceText}>
                        {event.entry_type === "Paid" ? `₹${event.price}` : event.entry_type}
                      </Text>
                    </View>
                    <View style={s.cardBottom}>
                      <Text style={s.cardCat}>{event.category}</Text>
                      <Text style={s.cardTitle} numberOfLines={2}>{event.title}</Text>
                      
                      <View style={s.cardActionRow}>
                        <View style={{ flex: 1, gap: 3 }}>
                          <View style={s.cardRow}>
                            <Calendar size={13} color="rgba(255,255,255,0.75)" />
                            <Text style={s.cardRowText}>{event.date}</Text>
                          </View>
                          <View style={s.cardRow}>
                            <MapPin size={13} color="rgba(255,255,255,0.75)" />
                            <Text style={s.cardRowText} numberOfLines={1}>{event.location}</Text>
                          </View>
                        </View>

                        <TouchableOpacity
                          style={[s.bookBtn, isPast && s.bookBtnDisabled]}
                          disabled={isPast}
                          onPress={() => navigation?.navigate("EventDetail", { eventId: event.id })}
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
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0f172a" },
  scrollContent: { paddingBottom: 40 },
  
  hero: { backgroundColor: "#1e293b", paddingVertical: 40, paddingHorizontal: 20 },
  heroContent: { alignItems: "center" },
  heroTitle: { fontSize: 32, fontWeight: "bold", color: "#f8fafc", marginBottom: 8 },
  heroSubtitle: { fontSize: 14, color: "#94a3b8", textAlign: "center", paddingHorizontal: 20 },

  filterCard: { margin: 16, marginTop: -20, backgroundColor: "#1e293b", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: "#334155", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  inputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: "#0f172a", borderRadius: 12, paddingHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: "#334155" },
  input: { flex: 1, color: "#f8fafc", paddingVertical: 12, paddingLeft: 12 },
  
  catScroll: { flexDirection: "row", marginBottom: 16 },
  catBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#334155", marginRight: 8 },
  catBtnActive: { backgroundColor: "#38bdf8" },
  catText: { color: "#cbd5e1", fontSize: 13, fontWeight: "600" },
  catTextActive: { color: "#0f172a" },

  actionRow: { flexDirection: "row", gap: 12 },
  resetBtn: { padding: 14, backgroundColor: "#0f172a", borderRadius: 12, borderWidth: 1, borderColor: "#334155", alignItems: "center", justifyContent: "center" },
  searchBtn: { flex: 1, backgroundColor: "#2563eb", borderRadius: 12, alignItems: "center", justifyContent: "center", paddingVertical: 14 },
  searchBtnText: { color: "#ffffff", fontWeight: "bold", fontSize: 14, textTransform: "uppercase", letterSpacing: 1 },

  resultsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#1e293b", marginBottom: 16 },
  resultsText: { color: "#f8fafc", fontSize: 18, fontWeight: "bold" },

  loadingBox: { padding: 40, alignItems: "center" },
  loadingText: { color: "#94a3b8", marginTop: 12 },

  emptyBox: { padding: 40, alignItems: "center", backgroundColor: "rgba(30,41,59,0.5)", marginHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: "#334155" },
  emptyTitle: { color: "#f8fafc", fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  emptyDesc: { color: "#64748b", textAlign: "center", marginBottom: 20 },
  emptyBtn: { backgroundColor: "#1e293b", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  emptyBtnText: { color: "#f8fafc", fontWeight: "bold" },

  grid: { paddingHorizontal: 16, gap: 16 },
  eventCard: { borderRadius: 16, overflow: "hidden", height: 240 },
  eventCardBg: { flex: 1, justifyContent: "space-between" },
  eventCardImg: { borderRadius: 16 },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.42)", borderRadius: 16 },
  priceTag: { alignSelf: "flex-start", margin: 12, backgroundColor: "rgba(0,0,0,0.65)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  priceText: { color: "#f8fafc", fontWeight: "bold", fontSize: 12 },
  cardBottom: { padding: 14 },
  cardCat: { color: "#fb923c", fontSize: 11, fontWeight: "bold", textTransform: "uppercase", marginBottom: 4, letterSpacing: 0.5 },
  cardTitle: { color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  cardRowText: { color: "rgba(255,255,255,0.8)", fontSize: 12, flex: 1 },

  cardActionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  bookBtn: { backgroundColor: "#2563eb", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: "flex-end" },
  bookBtnDisabled: { backgroundColor: "#334155" },
  bookBtnText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  bookBtnTextDisabled: { color: "#94a3b8" },
});
