import React, { useState, useEffect, useRef } from "react";
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Image, TextInput, ActivityIndicator, Dimensions, ImageBackground, StatusBar, Animated, Modal 
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { 
  Search, MapPin, Calendar, Star, ChevronDown, User,
  Film, Music, Mic2, Ticket, Sparkles, Home as HomeIcon, Tv, Compass, ThumbsUp, Trophy, Zap, Heart
} from "lucide-react-native";
import { getHomeEventshow } from "@Services/api";
import { GLOBAL_STYLES, COLORS } from "../styles/theme";
import BrandLogo from "../components/ui/BrandLogo";

const { width } = Dimensions.get("window");

// ── DYNAMIC LIGHT CATEGORY THEMES CONFIGURATION ──────────────────────────────
const categoryThemes = {
  All: {
    key: "All",
    label: "All",
    background: require("../../assets/backgrounds/1.png"),
    primaryColor: "#0284c7",
    accentColor: "#f97316", // Orange Selected Pill
    placeholder: "Search \"all events, concerts...\"",
    bannerBadge: "✦ WELCOME TO BOOKMYEVENT ✦",
    bannerTitle: "Discover & Experience Live Moments",
    bannerSub: "Book tickets instantly with zero convenience fee • Verified Venues",
    icon: Sparkles,
  },
  Music: {
    key: "Music",
    label: "Music",
    background: require("../../assets/backgrounds/2.png"),
    primaryColor: "#7e22ce",
    accentColor: "#f97316",
    placeholder: "Search \"music events, concerts...\"",
    bannerBadge: "✦ LIVE MUSIC FESTIVALS ✦",
    bannerTitle: "Electrifying Concerts & Beats",
    bannerSub: "Rock, Pop, EDM & Classical Shows Near You",
    icon: Music,
  },
  Comedy: {
    key: "Comedy",
    label: "Comedy",
    background: require("../../assets/backgrounds/3.png"),
    primaryColor: "#0d9488",
    accentColor: "#f97316",
    placeholder: "Search \"comedy events, standup...\"",
    bannerBadge: "✦ LAUGHTER ZONE ✦",
    bannerTitle: "Top Standup Comedians Live",
    bannerSub: "Laugh Out Loud • Weekend Specials",
    icon: Mic2,
  },
  Expos: {
    key: "Expos",
    label: "Expos",
    background: require("../../assets/backgrounds/4.png"),
    primaryColor: "#ea580c",
    accentColor: "#f97316",
    placeholder: "Search \"expo events, exhibitions...\"",
    bannerBadge: "✦ TECH & EXPOS ✦",
    bannerTitle: "AI, Cloud & Product Innovation",
    bannerSub: "Network with Industry Pioneers",
    icon: Ticket,
  },
  Sports: {
    key: "Sports",
    label: "Sports",
    background: require("../../assets/backgrounds/5.png"),
    primaryColor: "#e11d48",
    accentColor: "#f97316",
    placeholder: "Search \"sports events, matches...\"",
    bannerBadge: "✦ STADIUM ARENA ✦",
    bannerTitle: "Live Matches, Tournaments & Runs",
    bannerSub: "Feel the Energy Live from the Stands",
    icon: Trophy,
  },
  Festivals: {
    key: "Festivals",
    label: "Festivals",
    background: require("../../assets/backgrounds/6.png"),
    primaryColor: "#d97706",
    accentColor: "#f97316",
    placeholder: "Search \"festivals, cultural events...\"",
    bannerBadge: "✦ CULTURAL FESTIVALS ✦",
    bannerTitle: "Festivals & Cultural Celebrations",
    bannerSub: "Traditional Music, Food & Fairs",
    icon: Zap,
  },
};

export default function Home({ navigation }) {
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCity, setSelectedCity] = useState("Chennai, Tamil Nadu");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Home");
  const [showPortalModal, setShowPortalModal] = useState(false);

  // Animated Category Theme Transition State
  const [prevTheme, setPrevTheme] = useState(categoryThemes.All);
  const [currentTheme, setCurrentTheme] = useState(categoryThemes.All);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const categoryTabs = Object.values(categoryThemes);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await getHomeEventshow();
      const rawList = res?.data || (Array.isArray(res) ? res : []);
      if (!rawList || rawList.length === 0) return;

      const formatted = rawList.map((e, index) => ({
        id: e.id,
        title: e.event_name || e.name || "Live Event",
        category: e.category || "Live Event",
        price: e.pass_fee ? `₹${e.pass_fee}` : "Free",
        location: e.venue || "Chennai",
        date: e.start_date || "Today",
        likes: `${(120 + index * 18).toFixed(1)}K+`,
        rating: (8.6 + (index % 12) * 0.1).toFixed(1),
        image: e.banner_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800",
      }));

      setEvents(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Smooth Category Transition Handler (300ms Cross-Fade)
  const handleCategorySwitch = (catKey) => {
    if (catKey === selectedCategory) return;
    const targetTheme = categoryThemes[catKey] || categoryThemes.All;

    setPrevTheme(currentTheme);
    setCurrentTheme(targetTheme);
    setSelectedCategory(catKey);

    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const filteredEvents = events.filter((e) => {
    const matchesCategory =
      selectedCategory === "All" ||
      e.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={styles.rootContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: insets.bottom > 0 ? insets.bottom + 90 : 95 }}
      >
        {/* CURVED HEADER WRAPPER WITH IMAGE BACKGROUND */}
        <View style={styles.curvedHeaderWrapper}>
          {/* Previous Theme Layer */}
          <ImageBackground
            source={prevTheme.background}
            style={StyleSheet.absoluteFillObject}
            imageStyle={styles.curvedImageStyle}
            resizeMode="cover"
          />

          {/* Current Theme Layer fading in smoothly */}
          <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: fadeAnim }]}>
            <ImageBackground
              source={currentTheme.background}
              style={StyleSheet.absoluteFillObject}
              imageStyle={styles.curvedImageStyle}
              resizeMode="cover"
            />
          </Animated.View>

          {/* Soft subtle tint overlay for text legibility */}
          <View style={styles.softPastelOverlay} />

          {/* Main Header Safe Area Content */}
          <SafeAreaView edges={["top"]}>
            <View style={styles.headerContentArea}>
              
              {/* Header Row: BookMyEvent Brand Logo + Location */}
              <View style={styles.headerRow}>
                <View>
                  {/* BookMyEvent Brand Logo */}
                  <BrandLogo textColor="#0f172a" />

                  {/* Location Selector */}
                  <TouchableOpacity style={styles.locationSelectorRow} onPress={() => navigation?.navigate("AllEvents")}>
                    <MapPin size={13} color="#f97316" style={{ marginRight: 4 }} />
                    <Text style={styles.locationMainText}>{selectedCity}</Text>
                    <ChevronDown size={13} color="#0f172a" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>

                {/* Profile Avatar Trigger */}
                <TouchableOpacity style={styles.profileAvatarBtn} onPress={() => setShowPortalModal(true)}>
                  <User size={20} color="#0f172a" />
                </TouchableOpacity>
              </View>

              {/* White Search Bar */}
              <View style={styles.searchBarWrap}>
                <View style={styles.searchInputCard}>
                  <Search size={18} color="#64748b" style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder={currentTheme.placeholder}
                    placeholderTextColor="#94a3b8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
              </View>

              {/* Dynamic Category Selector Strip */}
              <View style={styles.categoryStripWrap}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
                  {categoryTabs.map((tab) => {
                    const IconComp = tab.icon;
                    const isSelected = selectedCategory === tab.key;
                    return (
                      <TouchableOpacity
                        key={tab.key}
                        style={[
                          styles.categoryPill,
                          isSelected ? styles.categoryPillSelected : styles.categoryPillUnselected
                        ]}
                        onPress={() => handleCategorySwitch(tab.key)}
                        activeOpacity={0.8}
                      >
                        <IconComp size={15} color={isSelected ? "#000000" : "#334155"} />
                        <Text style={[
                          styles.categoryPillText,
                          isSelected ? styles.categoryPillTextSelected : styles.categoryPillTextUnselected
                        ]}>
                          {tab.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

            </View>
          </SafeAreaView>
        </View>

        {/* White Content Section Below Curved Header */}
        <View style={styles.whiteContentSheet}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              {currentTheme.label} <Text style={{ color: "#f97316" }}>Events</Text>
            </Text>
            <TouchableOpacity onPress={() => navigation?.navigate("AllEvents")}>
              <Text style={styles.seeAllText}>See All ›</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator color="#f97316" style={{ marginVertical: 40 }} />
          ) : (
            <View style={styles.gridWrap}>
              {filteredEvents.length > 0 ? (
                filteredEvents.map((ev, i) => (
                  <TouchableOpacity key={i} style={styles.gridCard} onPress={() => navigation?.navigate("UserBooking", { event: ev })}>
                    <Image source={{ uri: ev.image }} style={styles.gridCardImg} />
                    
                    <View style={styles.cardBadgesRow}>
                      <View style={styles.likesBadge}>
                        <ThumbsUp size={11} color="#15803d" />
                        <Text style={styles.likesText}>{ev.likes}</Text>
                      </View>
                      <View style={styles.ratingBadge}>
                        <Star size={11} color="#b45309" />
                        <Text style={styles.ratingText}>{ev.rating}</Text>
                      </View>
                    </View>

                    <Text style={styles.cardTitle} numberOfLines={1}>{ev.title}</Text>
                    <Text style={styles.cardCat}>{ev.category} • {ev.location}</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceText}>{ev.price}</Text>
                      <View style={styles.addTicketBtn}>
                        <Text style={styles.addTicketBtnText}>BOOK</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No events found in {selectedCategory} category.</Text>
                </View>
              )}
            </View>
          )}
        </View>

      </ScrollView>

      {/* Floating Pill Navigation Bar */}
      <View style={[styles.floatingPillNavBar, { bottom: insets.bottom > 0 ? insets.bottom + 8 : 16 }]}>
        {[
          { label: "Home", icon: HomeIcon, tab: "Home" },
          { label: "Events", icon: Ticket, tab: "Events" },
          { label: "Passes", icon: Sparkles, tab: "Passes" },
          { label: "Profile", icon: User, tab: "Profile" },
        ].map((item, i) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.tab;
          return (
            <TouchableOpacity
              key={i}
              style={[styles.pillNavTabBtn, isActive && { backgroundColor: "#fff7ed" }]}
              onPress={() => {
                setActiveTab(item.tab);
                if (item.tab === "Profile") navigation?.navigate("MyProfile");
                if (item.tab === "Events") navigation?.navigate("AllEvents");
                if (item.tab === "Passes") navigation?.navigate("MyPasses");
              }}
            >
              <IconComponent size={20} color={isActive ? "#f97316" : "#64748b"} />
              <Text style={[styles.pillNavTabLabel, isActive && { color: "#f97316", fontWeight: "800" }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Portal & Role Switcher Sheet Modal */}
      <Modal visible={showPortalModal} transparent animationType="slide">
        <View style={styles.portalModalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowPortalModal(false)} />
          <View style={styles.portalModalCard}>
            <View style={styles.portalModalHeader}>
              <View>
                <Text style={styles.portalModalTitle}>Select Portal / Role View</Text>
                <Text style={styles.portalModalSub}>Switch seamlessly across all 4 platform roles:</Text>
              </View>
              <TouchableOpacity style={styles.portalCloseBtn} onPress={() => setShowPortalModal(false)}>
                <Text style={styles.portalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Role 1: User / Attendee */}
              <TouchableOpacity
                style={[styles.portalRoleOption, { borderColor: "#0284c7" }]}
                onPress={() => { setShowPortalModal(false); navigation?.navigate("Home"); }}
              >
                <View style={[styles.portalIconWrap, { backgroundColor: "#f0f9ff" }]}>
                  <User size={22} color="#0284c7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.portalRoleTitle}>Public / Attendee Side</Text>
                  <Text style={styles.portalRoleSub}>Browse events, book tickets, view passes</Text>
                </View>
                <View style={[styles.portalBadge, { backgroundColor: "#e0f2fe" }]}>
                  <Text style={[styles.portalBadgeText, { color: "#0369a1" }]}>ACTIVE</Text>
                </View>
              </TouchableOpacity>

              {/* Role 2: Organizer */}
              <TouchableOpacity
                style={[styles.portalRoleOption, { borderColor: "#f97316" }]}
                onPress={() => { setShowPortalModal(false); navigation?.navigate("Organizerdashboard"); }}
              >
                <View style={[styles.portalIconWrap, { backgroundColor: "#fff7ed" }]}>
                  <Sparkles size={22} color="#f97316" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.portalRoleTitle}>Organizer Portal</Text>
                  <Text style={styles.portalRoleSub}>Dashboard, Create Event, Manage Stalls, Gate Check-In</Text>
                </View>
                <View style={[styles.portalBadge, { backgroundColor: "#ffedd5" }]}>
                  <Text style={[styles.portalBadgeText, { color: "#c2410c" }]}>ORGANIZER</Text>
                </View>
              </TouchableOpacity>

              {/* Role 3: Exhibitor */}
              <TouchableOpacity
                style={[styles.portalRoleOption, { borderColor: "#16a34a" }]}
                onPress={() => { setShowPortalModal(false); navigation?.navigate("Exhibitor_Home"); }}
              >
                <View style={[styles.portalIconWrap, { backgroundColor: "#f0fdf4" }]}>
                  <Ticket size={22} color="#16a34a" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.portalRoleTitle}>Exhibitor Portal</Text>
                  <Text style={styles.portalRoleSub}>Stall booking map, My bookings, Visitor lead scanner</Text>
                </View>
                <View style={[styles.portalBadge, { backgroundColor: "#dcfce7" }]}>
                  <Text style={[styles.portalBadgeText, { color: "#15803d" }]}>EXHIBITOR</Text>
                </View>
              </TouchableOpacity>

              {/* Role 4: Super Admin */}
              <TouchableOpacity
                style={[styles.portalRoleOption, { borderColor: "#a855f7" }]}
                onPress={() => { setShowPortalModal(false); navigation?.navigate("Super_user_Home"); }}
              >
                <View style={[styles.portalIconWrap, { backgroundColor: "#faf5ff" }]}>
                  <Zap size={22} color="#a855f7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.portalRoleTitle}>Super Admin Portal</Text>
                  <Text style={styles.portalRoleSub}>Approvals queue, Category master, KYC, Payouts</Text>
                </View>
                <View style={[styles.portalBadge, { backgroundColor: "#f3e8ff" }]}>
                  <Text style={[styles.portalBadgeText, { color: "#7e22ce" }]}>ADMIN</Text>
                </View>
              </TouchableOpacity>

              {/* Extras: My Passes & My Profile */}
              <View style={{ height: 1, backgroundColor: "#e2e8f0", marginVertical: 12 }} />
              <TouchableOpacity
                style={styles.portalExtraOption}
                onPress={() => { setShowPortalModal(false); navigation?.navigate("MyPasses"); }}
              >
                <Ticket size={18} color="#0f172a" />
                <Text style={styles.portalExtraText}>My Digital Ticket Passes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.portalExtraOption}
                onPress={() => { setShowPortalModal(false); navigation?.navigate("MyProfile"); }}
              >
                <User size={18} color="#0f172a" />
                <Text style={styles.portalExtraText}>My Profile & Account Settings</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  curvedHeaderWrapper: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    paddingBottom: 16,
  },
  curvedImageStyle: {
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  softPastelOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  headerContentArea: {
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
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
    width: 6,
    height: 12,
    borderRadius: 3,
    marginHorizontal: 1,
  },
  logoText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  locationSelectorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  locationMainText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  profileAvatarBtn: {
    height: 42,
    width: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  searchBarWrap: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  searchInputCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 48,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "600",
  },
  categoryStripWrap: {
    marginBottom: 4,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  categoryPillSelected: {
    backgroundColor: "#f97316", // Orange Selected Pill
    elevation: 2,
    shadowColor: "#f97316",
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  categoryPillUnselected: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
  },
  categoryPillText: {
    fontSize: 13,
  },
  categoryPillTextSelected: {
    color: "#ffffff",
    fontWeight: "900",
  },
  categoryPillTextUnselected: {
    color: "#334155",
    fontWeight: "700",
  },
  whiteContentSheet: {
    backgroundColor: "#ffffff",
    paddingTop: 20,
    paddingHorizontal: 16,
    minHeight: 400,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#f97316",
  },
  gridWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridCard: {
    width: (width - 44) / 2,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  gridCardImg: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
  },
  cardBadgesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  likesBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  likesText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#15803d",
    marginLeft: 3,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#b45309",
    marginLeft: 3,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  cardCat: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 8,
    fontWeight: "500",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
  },
  addTicketBtn: {
    backgroundColor: "#f97316",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  addTicketBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
    width: "100%",
  },
  emptyText: {
    color: "#64748b",
    fontSize: 13,
  },
  floatingPillNavBar: {
    position: "absolute",
    left: 20,
    right: 20,
    height: 56,
    backgroundColor: "#ffffff",
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  pillNavTabBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillNavTabLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 2,
  },
  devRoleSwitchBtn: {
    backgroundColor: "rgba(2, 132, 199, 0.12)",
    borderWidth: 1,
    borderColor: "#bae6fd",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  devRoleSwitchText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0284c7",
  },
  roleModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    padding: 20,
  },
  roleModalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },
  roleModalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 4,
  },
  roleModalSub: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 16,
  },
  roleOptionCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  roleOptionTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 2,
  },
  roleOptionSub: {
    fontSize: 11,
    color: "#475569",
  },
  roleCloseBtn: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  roleCloseText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#64748b",
  },
  portalModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  portalModalCard: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "80%",
    elevation: 12,
  },
  portalModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  portalModalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
  },
  portalModalSub: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  portalCloseBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
  },
  portalCloseText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#64748b",
  },
  portalRoleOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 10,
    gap: 12,
  },
  portalIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  portalRoleTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  portalRoleSub: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  portalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  portalBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  portalExtraOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  portalExtraText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
});
