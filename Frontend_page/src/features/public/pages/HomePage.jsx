import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  MapPin,
  Star,
  ChevronDown,
  User,
  Bell,
  Sparkles,
  Music,
  Mic,
  Ticket,
  Trophy,
  Zap,
  ThumbsUp,
  Compass,
  Home as HomeIcon,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  LogIn,
  LogOut,
  Store,
  Camera,
  UserCheck,
  ShieldCheck,
  Flame,
  Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import MediaRenderer from "@/components/MediaRenderer";
import { getHomeEventshow } from "@/Services/api";
import { getRedirectPathForUser, performLogout, getUserInitials, getUserAvailableRoles, hasProfile } from "@/shared/services/authHelper";
import { authApi } from "@/features/auth/api/auth.api";
import { setUser } from "@/app/store/userSlice";
import { Skeleton } from "@/components/ui/Skeleton";
import { categoryApi } from "@/features/catalog/api/category.api";
import TextType from "@/components/ui/TextType";

/* ─────────────── Brand Logo ─────────────── */
const BrandLogo = ({ textColor = "#0f172a" }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <div style={{ display: 'flex', gap: 3 }}>
      <div style={{ width: 6, height: 16, borderRadius: 10, backgroundColor: '#3b82f6', transform: 'rotate(-15deg)' }} />
      <div style={{ width: 6, height: 16, borderRadius: 10, backgroundColor: '#f97316', transform: 'rotate(10deg)' }} />
      <div style={{ width: 6, height: 16, borderRadius: 10, backgroundColor: '#22c55e', transform: 'rotate(-5deg)' }} />
    </div>
    <span style={{ fontSize: 22, fontWeight: 900, color: textColor, letterSpacing: '-0.5px' }}>BookMyEvent</span>
  </div>
);

// ── DYNAMIC LIGHT CATEGORY THEMES CONFIGURATION ──────────────────────────────
const categoryThemes = {
  All: {
    key: "All",
    label: "All",
    background: "/backgrounds/1.png",
    primaryColor: "#0284c7",
    accentColor: "#f97316",
    placeholder: "Search \"all events, concerts...\"",
    bannerBadge: "✦ WELCOME TO BOOKMYEVENT ✦",
    bannerTitle: "Discover & Experience Live Moments",
    bannerSub: "Book tickets instantly with zero convenience fee • Verified Venues",
    icon: Sparkles,
  },
  Music: {
    key: "Music",
    label: "Music",
    background: "/backgrounds/2.png",
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
    background: "/backgrounds/3.png",
    primaryColor: "#0d9488",
    accentColor: "#f97316",
    placeholder: "Search \"comedy events, standup...\"",
    bannerBadge: "✦ LAUGHTER ZONE ✦",
    bannerTitle: "Top Standup Comedians Live",
    bannerSub: "Laugh Out Loud • Weekend Specials",
    icon: Mic,
  },
  Expos: {
    key: "Expos",
    label: "Expos",
    background: "/backgrounds/4.png",
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
    background: "/backgrounds/5.png",
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
    background: "/backgrounds/6.png",
    primaryColor: "#d97706",
    accentColor: "#f97316",
    placeholder: "Search \"festivals, cultural events...\"",
    bannerBadge: "✦ CULTURAL FESTIVALS ✦",
    bannerTitle: "Festivals & Cultural Celebrations",
    bannerSub: "Traditional Music, Food & Fairs",
    icon: Zap,
  },
};

// Helper to extract clean city name
const getCityFromLocation = (loc) => {
  if (!loc) return "";
  const cleanLoc = loc.toLowerCase();

  if (cleanLoc.includes("chennai")) return "Chennai";
  if (cleanLoc.includes("bengaluru") || cleanLoc.includes("bangalore")) return "Bengaluru";
  if (cleanLoc.includes("mumbai")) return "Mumbai";
  if (cleanLoc.includes("delhi")) return "Delhi";
  if (cleanLoc.includes("hyderabad")) return "Hyderabad";
  if (cleanLoc.includes("coimbatore")) return "Coimbatore";
  if (cleanLoc.includes("madurai")) return "Madurai";
  if (cleanLoc.includes("trichy")) return "Trichy";
  if (cleanLoc.includes("sivakasi")) return "Sivakasi";
  if (cleanLoc.includes("tirunelveli")) return "Tirunelveli";
  if (cleanLoc.includes("raipur")) return "Raipur";
  if (cleanLoc.includes("manipal")) return "Manipal";

  const parenthesized = loc.match(/\(([^)]+)\)/);
  if (parenthesized && parenthesized[1]) {
    const pCity = parenthesized[1].trim();
    return pCity.charAt(0).toUpperCase() + pCity.slice(1).toLowerCase();
  }

  const parts = loc.split(",");
  let lastPart = parts[parts.length - 1]?.trim() || "";
  const upperLast = lastPart.toUpperCase();
  if (upperLast === "INDIA" || upperLast === "TAMIL NADU" || upperLast === "KARNATAKA") {
    lastPart = parts[parts.length - 2]?.trim() || lastPart;
  }
  return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).toLowerCase();
};

const formatEventsList = (list) => {
  if (!Array.isArray(list) || list.length === 0) return [];
  return list.map((e, index) => {
    const passFee = e.pass_fee ?? e.price ?? e.price_inr ?? (e.booking?.priceINR || e.booking?.price_inr || 0);
    const chargeType = String(e.charge_type || e.booking?.chargeType || e.booking?.charge_type || "").toLowerCase();
    const isPaid = (chargeType === "paid") || (Number(passFee) > 0);
    const isFree = !isPaid;

    return {
      id: e.id,
      title: e.event_name || e.name,
      category: e.category || "Live Event",
      entry_type: isFree ? "Free" : "Paid",
      price: isFree ? "Free" : `₹${Number(passFee) || 0}`,
      location: e.venue || "Chennai",
      fullLocation: `${e.venue || ''}, ${e.address || ''}`,
      date: e.start_date || "Today",
      likes: `${(120 + index * 18).toFixed(1)}K+`,
      rating: (8.6 + (index % 12) * 0.1).toFixed(1),
      image: e.banner_url || e.banner || e.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800",
      banner_type: e.banner_type,
      bookingEnds: e.end_date || e.start_date + "T23:59:59",
    };
  });
};

/* ─────────────── Reusable Horizontal Carousel Row ─────────────── */
const EventCarouselSection = ({ title, icon: Icon, badge, events = [], onEventClick, onViewAll }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!events || events.length === 0) return null;

  return (
    <div className="mb-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold shadow-xs">
              <Icon size={17} />
            </div>
          )}
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{title}</span>
              {badge && (
                <span className="text-[10px] font-extrabold text-orange-700 bg-orange-100/70 px-2.5 py-0.5 rounded-full border border-orange-200">
                  {badge}
                </span>
              )}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-xs font-black text-orange-600 hover:text-orange-700 mr-2 cursor-pointer bg-transparent border-none transition"
            >
              See All ›
            </button>
          )}
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer shadow-xs active:scale-95"
            aria-label="Previous"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer shadow-xs active:scale-95"
            aria-label="Next"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-4 overflow-x-auto no-scrollbar pb-3 pt-1 px-1 scroll-smooth"
      >
        {events.map((ev) => (
          <div
            key={ev.id}
            onClick={() => onEventClick(ev)}
            className="w-[245px] sm:w-[270px] shrink-0 bg-white/95 rounded-2xl p-3.5 border border-orange-100/90 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              {/* Card Banner */}
              <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 relative">
                <img
                  src={ev.image}
                  alt={ev.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold">
                  {ev.category}
                </span>
              </div>

              {/* Likes & Rating */}
              <div className="flex items-center justify-between mt-2.5 mb-1.5 px-0.5">
                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600">
                  <ThumbsUp size={11} className="stroke-[2.5]" />
                  <span>{ev.likes}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-amber-500">
                  <Star size={11} className="fill-amber-500 text-amber-500 stroke-[2.5]" />
                  <span>{ev.rating}</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-1 mb-1 px-0.5 group-hover:text-orange-600 transition-colors">
                {ev.title}
              </h3>

              {/* Location */}
              <p className="text-[11px] text-slate-500 font-medium px-0.5 truncate">
                📍 {getCityFromLocation(ev.fullLocation || ev.location) || "Multiple Cities"}
              </p>
            </div>

            {/* Price & Book Button */}
            <div className="mt-3 pt-2.5 flex items-center justify-between border-t border-slate-100 px-0.5">
              <span className="text-xs font-black text-slate-900">{ev.price}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick(ev);
                }}
                className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:brightness-110 active:scale-95 text-white font-black text-[10px] px-3.5 py-1.5 rounded-lg border-none cursor-pointer transition-all shadow-sm shadow-orange-500/25 tracking-wider"
              >
                BOOK
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  const navigate = useNavigate();

  const getInitialEvents = () => {
    try {
      const stored = sessionStorage.getItem("home_events_cache");
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list) && list.length > 0) {
          return formatEventsList(list);
        }
      }
    } catch (e) { }
    return [];
  };

  const initialList = getInitialEvents();
  const [events, setEvents] = useState(initialList);
  const [isLoading, setIsLoading] = useState(initialList.length === 0);

  const dispatch = useDispatch();
  const reduxAuth = useSelector((state) => state.auth);
  const reduxUser = useSelector((state) => state.user);
  const isAuthenticated = Boolean(reduxAuth?.isAuthenticated || reduxAuth?.accessToken || reduxUser?.id);
  const currentUser = reduxAuth?.user || reduxUser;

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCity, setSelectedCity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(2);
  const [dbCategories, setDbCategories] = useState([]);

  // Recently Viewed events tracking
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bme_recently_viewed");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentlyViewed(parsed);
        }
      }
    } catch (e) { }
  }, []);

  const handleEventClick = (event) => {
    try {
      const stored = localStorage.getItem("bme_recently_viewed");
      let list = stored ? JSON.parse(stored) : [];
      list = [event, ...list.filter((item) => item.id !== event.id)].slice(0, 10);
      localStorage.setItem("bme_recently_viewed", JSON.stringify(list));
      setRecentlyViewed(list);
    } catch (e) { }
    navigate(`/event-detail/${event.id}`);
  };

  // Animated Category Theme Transition State
  const [prevTheme, setPrevTheme] = useState(categoryThemes.All);
  const [currentTheme, setCurrentTheme] = useState(categoryThemes.All);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getCategories();
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.categories) ? res.categories : (Array.isArray(res) ? res : []));
      setDbCategories(list);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchEvents = async () => {
    try {
      if (events.length === 0) setIsLoading(true);
      const res = await getHomeEventshow();
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      const formatted = formatEventsList(list);
      setEvents(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySwitch = (catKey) => {
    if (catKey === selectedCategory) return;

    let targetTheme = { ...categoryThemes.All };

    if (catKey !== "All") {
      const dbCat = dbCategories.find(c => c.name === catKey);
      const preTheme = categoryThemes[catKey];

      if (dbCat) {
        targetTheme = {
          key: dbCat.name,
          label: dbCat.name,
          background: dbCat.category_image || preTheme?.background || targetTheme.background,
          primaryColor: preTheme?.primaryColor || "#0284c7",
          accentColor: "#f97316",
          placeholder: preTheme?.placeholder || `Search "${dbCat.name.toLowerCase()} events..."`,
          icon: preTheme?.icon || Sparkles
        };
      } else if (preTheme) {
        targetTheme = preTheme;
      }
    }

    setPrevTheme(currentTheme);
    setCurrentTheme(targetTheme);
    setSelectedCategory(catKey);

    setOpacity(0);
    setTimeout(() => {
      setOpacity(1);
    }, 50);
  };

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await res.json();
            const detected = data.city || data.locality || data.principalSubdivision || "Chennai";
            const cleanName = detected.split(" ")[0];
            setSelectedCity(cleanName);
          } catch (err) {
            setSelectedCity("Chennai");
          } finally {
            setIsDetectingLocation(false);
            setIsCityModalOpen(false);
          }
        },
        () => {
          setIsDetectingLocation(false);
          setSelectedCity("Chennai");
          setIsCityModalOpen(false);
        },
        { timeout: 5000 }
      );
    } else {
      setIsDetectingLocation(false);
      setSelectedCity("Chennai");
      setIsCityModalOpen(false);
    }
  };

  const popularCities = [
    { name: "Bengaluru", icon: "🏛️", desc: "Tech Capital" },
    { name: "Chennai", icon: "🏰", desc: "Coastal Hub" },
    { name: "Coimbatore", icon: "⚙️", desc: "Textile Hub" },
    { name: "Hyderabad", icon: "🕌", desc: "Pearl City" },
    { name: "Kochi", icon: "⛵", desc: "Port City" },
    { name: "Kolkata", icon: "🛺", desc: "City of Joy" },
    { name: "New Delhi", icon: "🏛️", desc: "Capital Region" },
    { name: "Mumbai", icon: "🏙️", desc: "Financial Hub" },
  ];

  const citiesList = Array.from(
    new Set(
      events
        .map((e) => getCityFromLocation(e.fullLocation || e.location))
        .filter(Boolean)
    )
  ).sort();

  // Categorized event subsets
  const filteredEvents = events.filter((e) => {
    const matchesCategory =
      selectedCategory === "All" ||
      e.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (selectedCategory === "Expos" && (e.category.toLowerCase().includes("expo") || e.category.toLowerCase().includes("tech")));

    const matchesSearch =
      !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase());

    const eventCity = getCityFromLocation(e.fullLocation || e.location);
    const matchesCity = !selectedCity || eventCity === selectedCity;

    return matchesCategory && matchesSearch && matchesCity;
  });

  const popularEvents = [...filteredEvents].sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
  const trendingEvents = [...filteredEvents].reverse();
  const musicEvents = filteredEvents.filter(e => e.category.toLowerCase().includes("music") || e.category.toLowerCase().includes("concert"));
  const expoEvents = filteredEvents.filter(e => e.category.toLowerCase().includes("expo") || e.category.toLowerCase().includes("tech") || e.category.toLowerCase().includes("business"));
  const comedyEvents = filteredEvents.filter(e => e.category.toLowerCase().includes("comedy") || e.category.toLowerCase().includes("standup"));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ffffff] via-[#fffbf7] via-35% to-[#fff3e6] text-[#0f172a] pb-24 relative select-none overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:wght@300;400;500;700&display=swap');
        
        body {
          font-family: 'Outfit', sans-serif;
          background: linear-gradient(180deg, #ffffff 0%, #fffbf7 30%, #fff6ed 65%, #fff1e0 100%);
          margin: 0;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .curved-header {
          border-bottom-left-radius: 36px;
          border-bottom-right-radius: 36px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          padding-bottom: 24px;
          position: relative;
        }

        .category-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 18px;
          border-radius: 24px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid rgba(255, 255, 255, 0.85);
          background-color: rgba(255, 255, 255, 0.85);
          color: #334155;
          white-space: nowrap;
        }

        .category-pill.selected {
          background: linear-gradient(to right, #f97316, #ea580c);
          color: #ffffff;
          border-color: #f97316;
          box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35);
        }
      `}</style>

      {/* Subtle ambient warm sunset glows */}
      <div className="absolute top-[280px] left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-orange-100/40 via-amber-50/30 to-transparent pointer-events-none -z-0 blur-2xl" />
      <div className="absolute top-[900px] -right-24 w-[500px] h-[500px] bg-orange-200/25 rounded-full pointer-events-none -z-0 blur-3xl" />
      <div className="absolute top-[1500px] -left-24 w-[500px] h-[500px] bg-amber-200/20 rounded-full pointer-events-none -z-0 blur-3xl" />

      {/* CURVED HEADER WITH BG TRANSITION */}
      <div className="curved-header min-h-[250px] md:min-h-[270px] flex flex-col justify-between relative overflow-hidden">
        {/* Layer 0: Dynamic category background layers */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${prevTheme.background})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${currentTheme.background})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: opacity,
            transition: "opacity 300ms ease-in-out",
            zIndex: 0,
          }}
        />

        {/* Layer 1: Solid Dark Shade for Row 1 Contrast (NO GLASSMORPHISM) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "100px",
            background: "linear-gradient(to bottom, rgba(9, 13, 22, 0.85) 0%, rgba(9, 13, 22, 0) 100%)",
            zIndex: 1,
          }}
        />

        {/* Layer 2: Header Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-5 pb-4 flex flex-col justify-between h-full gap-5">

          {/* LINE 1 (TOP BAR): Clean, Solid Surfaces - Zero Glassmorphism */}
          <div className="flex items-center justify-between gap-4 w-full relative z-20">

            {/* Left: Brand Logo & Location Modal Button */}
            <div className="flex items-center gap-4 sm:gap-6 shrink-0">
              <div>
                <BrandLogo textColor="#ffffff" />
                <button
                  onClick={() => setIsCityModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-extrabold text-slate-200 hover:text-white cursor-pointer bg-transparent border-none outline-none select-none transition-colors mt-0.5"
                >
                  <MapPin size={13} className="text-orange-400 shrink-0" />
                  <span>{selectedCity || "Select City"}</span>
                  <ChevronDown size={12} className="text-slate-300 shrink-0" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="hidden lg:flex items-center gap-6 border-l border-slate-700/80 pl-6">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="text-xs font-black text-slate-200 hover:text-orange-400 cursor-pointer bg-transparent border-none uppercase tracking-wider transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={() => navigate("/all-events")}
                  className="text-xs font-black text-slate-200 hover:text-orange-400 cursor-pointer bg-transparent border-none uppercase tracking-wider transition-colors"
                >
                  Events
                </button>
                <button
                  onClick={() => navigate("/all-events")}
                  className="text-xs font-black text-slate-200 hover:text-orange-400 cursor-pointer bg-transparent border-none uppercase tracking-wider transition-colors"
                >
                  Explore
                </button>
                <button
                  onClick={() => navigate("/Help_Center")}
                  className="text-xs font-black text-slate-200 hover:text-orange-400 cursor-pointer bg-transparent border-none uppercase tracking-wider transition-colors"
                >
                  Help
                </button>
              </div>
            </div>

            {/* Right: Solid Notification & Profile Elements */}
            <div className="flex items-center gap-3 shrink-0 relative z-30">

              {/* Notification Bell - Crisp solid dark button */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="w-10 h-10 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-center cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all relative"
                  title="Notifications"
                >
                  <Bell size={17} />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-orange-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotificationOpen && (
                  <>
                    <div className="fixed inset-0 z-[240]" onClick={() => setIsNotificationOpen(false)} />
                    <div className="fixed top-16 right-4 sm:right-10 md:right-16 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[250] p-4 animate-fadeIn">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                        <div className="flex items-center gap-2">
                          <Bell size={16} className="text-orange-500" />
                          <span className="text-xs font-black text-slate-900 uppercase tracking-wide">Notifications</span>
                        </div>
                        {unreadNotificationsCount > 0 && (
                          <button
                            onClick={() => setUnreadNotificationsCount(0)}
                            className="text-[10px] font-bold text-orange-600 hover:underline bg-transparent border-none cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="space-y-2.5 max-h-64 overflow-y-auto no-scrollbar">
                        <div className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-100 flex items-start gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                          <div className="space-y-0.5">
                            <p className="text-xs font-black text-slate-900">🎟️ Booking Confirmed!</p>
                            <p className="text-[11px] text-slate-600 leading-tight">Your pass for Live Concert has been generated successfully.</p>
                            <span className="text-[9px] font-bold text-slate-400">10 mins ago</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {!isAuthenticated ? (
                /* Unauthenticated Guest: Shiny Orange Button */
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:brightness-110 text-white font-black text-xs shadow-md shadow-orange-500/25 border-none cursor-pointer transition-all uppercase tracking-wider hover:scale-105 active:scale-95"
                >
                  <LogIn size={15} />
                  <span>Login</span>
                </button>
              ) : (
                /* Authenticated User Profile Avatar */
                <button
                  onClick={() => navigate("/profile")}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 border-2 border-white text-white flex items-center justify-center cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all overflow-hidden font-extrabold text-sm"
                  title={currentUser.name || "My Account"}
                >
                  {currentUser.profile_image ? (
                    <img
                      src={currentUser.profile_image}
                      alt={currentUser.name || "Avatar"}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span>{getUserInitials(currentUser.name || "User")}</span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* LINE 2: Interactive Dynamic Search Bar with TextType */}
          <div className="w-full my-auto py-2">
            <div className="w-full max-w-xl mx-auto">
              <div className="bg-white p-1.5 pl-4 rounded-full shadow-2xl border border-slate-200/90 flex items-center gap-3 relative">
                <Search size={18} className="text-orange-500 shrink-0" />
                <div className="relative w-full flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 border-none outline-none font-bold text-xs md:text-sm text-slate-900 bg-transparent relative z-10"
                  />
                  {!searchQuery && (
                    <div className="absolute left-0 pointer-events-none text-slate-400 text-xs md:text-sm font-semibold select-none z-0">
                      <TextType
                        text={[
                          'Search "live music concerts & festivals..."',
                          'Search "standup comedy specials..."',
                          'Search "tech expos & business summits..."',
                          'Search "cricket matches & stadium arena..."',
                          'Search "cultural carnivals & food fairs..."',
                        ]}
                        typingSpeed={55}
                        pauseDuration={2200}
                        showCursor={true}
                        cursorCharacter="|"
                      />
                    </div>
                  )}
                </div>

                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="p-1 hover:bg-slate-100 rounded-full shrink-0 z-10 cursor-pointer border-none bg-transparent">
                    <X size={14} className="text-slate-400" />
                  </button>
                )}

                <button
                  onClick={() => navigate("/all-events")}
                  className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:brightness-110 active:scale-95 text-white font-extrabold text-xs px-5 py-2.5 rounded-full border-none cursor-pointer shadow-md shadow-orange-500/25 transition-all shrink-0 uppercase tracking-wider z-10"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* LINE 3: Category Pills */}
          <div className="w-full overflow-x-auto no-scrollbar pt-2 pb-1">
            <div className="flex items-center gap-2.5 sm:justify-center">
              <button
                onClick={() => handleCategorySwitch("All")}
                className={`category-pill ${selectedCategory === "All" ? "selected" : ""}`}
              >
                <Sparkles size={15} />
                <span>All</span>
              </button>

              {dbCategories.map((cat) => {
                const IconComp = categoryThemes[cat.name]?.icon || Sparkles;
                const isSelected = selectedCategory === cat.name;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySwitch(cat.name)}
                    className={`category-pill ${isSelected ? "selected" : ""}`}
                  >
                    <IconComp size={15} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* ── CITY SELECTION MODAL ── */}
      {isCityModalOpen && (
        <div className="fixed inset-0 z-[200] bg-slate-900/70 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full p-6 md:p-8 relative max-h-[90vh] overflow-y-auto no-scrollbar">

            <button
              onClick={() => setIsCityModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center border-none cursor-pointer transition-colors"
            >
              <X size={16} />
            </button>

            <div className="text-center mb-6">
              <h3 className="text-xl font-black text-slate-900">Select Your City</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Discover live shows, concerts, expos & sports in your area</p>
            </div>

            {/* City Search */}
            <div className="relative mb-5">
              <div className="bg-slate-50 rounded-2xl p-2.5 px-4 border border-slate-200 flex items-center gap-3">
                <Search size={18} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search your city (Chennai, Bengaluru, Mumbai...)"
                  value={citySearchQuery}
                  onChange={(e) => setCitySearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none outline-none font-bold text-sm text-slate-900 placeholder-slate-400"
                />
                <button
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 font-extrabold text-xs border border-orange-200 cursor-pointer shrink-0 transition-colors"
                >
                  <Compass size={14} className={isDetectingLocation ? "animate-spin" : ""} />
                  <span>{isDetectingLocation ? "Detecting..." : "Detect Location"}</span>
                </button>
              </div>
            </div>

            {/* Popular Cities */}
            <div className="mb-5">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Popular Cities</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {popularCities.map((city) => {
                  const isSelected = selectedCity === city.name;
                  return (
                    <div
                      key={city.name}
                      onClick={() => {
                        setSelectedCity(city.name);
                        setIsCityModalOpen(false);
                      }}
                      className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${isSelected
                          ? "bg-orange-50 border-orange-500 ring-2 ring-orange-200 shadow-sm"
                          : "bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-200"
                        }`}
                    >
                      <div className="text-2xl mb-0.5">{city.icon}</div>
                      <span className="text-xs font-black text-slate-900">{city.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{city.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Other Cities */}
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Other Cities</p>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto no-scrollbar p-1">
                {citiesList
                  .filter((c) => !popularCities.some((p) => p.name === c))
                  .filter((c) => !citySearchQuery || c.toLowerCase().includes(citySearchQuery.toLowerCase()))
                  .map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setIsCityModalOpen(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${selectedCity === city
                          ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
                        }`}
                    >
                      {city}
                    </button>
                  ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── MAIN HORIZONTAL EVENT CAROUSELS ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 relative z-10">

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-xl" />
              <Skeleton className="h-6 w-48 rounded-lg" />
            </div>
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="w-[240px] shrink-0 bg-white rounded-2xl p-3 border border-slate-100 space-y-3">
                  <Skeleton className="w-full aspect-[4/3] rounded-xl" />
                  <Skeleton className="h-4 w-3/4 rounded-lg" />
                  <Skeleton className="h-3 w-1/2 rounded-lg" />
                  <Skeleton className="h-7 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && (
          <>
            {/* 1. Pick Up Where You Left Off (Recently Viewed) */}
            {recentlyViewed.length > 0 && (
              <EventCarouselSection
                title="Pick Up Where You Left Off"
                badge="RECENTLY VIEWED"
                icon={Eye}
                events={recentlyViewed}
                onEventClick={handleEventClick}
              />
            )}

            {/* 2. Popular & Top Rated Events */}
            <EventCarouselSection
              title="Popular & Featured Shows"
              badge="TOP RATED"
              icon={Sparkles}
              events={popularEvents}
              onEventClick={handleEventClick}
              onViewAll={() => navigate("/all-events")}
            />

            {/* 3. Trending This Week */}
            <EventCarouselSection
              title="Trending This Week"
              badge="HIGH DEMAND"
              icon={Flame}
              events={trendingEvents}
              onEventClick={handleEventClick}
              onViewAll={() => navigate("/all-events")}
            />

            {/* 4. Live Concerts & Music */}
            {musicEvents.length > 0 && (
              <EventCarouselSection
                title="Live Concerts & Music Festivals"
                icon={Music}
                events={musicEvents}
                onEventClick={handleEventClick}
                onViewAll={() => navigate("/all-events")}
              />
            )}

            {/* 5. Expos & Business Summits */}
            {expoEvents.length > 0 && (
              <EventCarouselSection
                title="Tech Expos, Startups & Trade Summits"
                icon={Ticket}
                events={expoEvents}
                onEventClick={handleEventClick}
                onViewAll={() => navigate("/all-events")}
              />
            )}

            {/* 6. Comedy & Nightlife */}
            {comedyEvents.length > 0 && (
              <EventCarouselSection
                title="Standup Comedy & Laughter Specials"
                icon={Mic}
                events={comedyEvents}
                onEventClick={handleEventClick}
                onViewAll={() => navigate("/all-events")}
              />
            )}

            {filteredEvents.length === 0 && (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 flex flex-col items-center justify-center gap-3">
                <Search size={36} className="text-slate-300" />
                <p className="text-sm font-bold text-slate-500">No events found matching your criteria.</p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                    setSelectedCity("");
                  }}
                  className="px-4 py-2 bg-orange-50 text-orange-600 font-bold text-xs rounded-xl border border-orange-200 cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </>
        )}

      </div>

      {/* ── WHY BOOK WITH BOOKMYEVENT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 relative z-10">
        <div className="text-center mb-8">
          <span className="text-[11px] font-black uppercase text-orange-600 tracking-wider">✦ TRUSTED EVENT PLATFORM ✦</span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">Why Book With BookMyEvent?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 bg-white/95 rounded-2xl border border-orange-100/80 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-extrabold text-lg">🎟️</div>
            <h4 className="font-extrabold text-slate-900 text-sm">Instant E-Tickets &amp; QR</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">Direct entry passes delivered with instant gate QR validation.</p>
          </div>

          <div className="p-5 bg-white/95 rounded-2xl border border-orange-100/80 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-lg">🛡️</div>
            <h4 className="font-extrabold text-slate-900 text-sm">Verified Organizers</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">Every organizer undergoes business GST &amp; KYC verification.</p>
          </div>

          <div className="p-5 bg-white/95 rounded-2xl border border-orange-100/80 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold text-lg">💳</div>
            <h4 className="font-extrabold text-slate-900 text-sm">Razorpay Checkout</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">Encrypted payments supporting UPI, NetBanking, and credit/debit cards.</p>
          </div>

          <div className="p-5 bg-white/95 rounded-2xl border border-orange-100/80 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-extrabold text-lg">⚡</div>
            <h4 className="font-extrabold text-slate-900 text-sm">Gate Scanner Support</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">Dedicated gate check-in support for seamless entry.</p>
          </div>
        </div>
      </div>

      {/* ── PUBLIC FOOTER ── */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 border-t border-orange-200/50 mt-16 text-slate-500 text-xs relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1 text-center md:text-left">
            <BrandLogo textColor="#0f172a" />
            <p className="text-slate-400 font-medium text-[11px]">India's premier live events discovery &amp; ticketing platform.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 font-bold text-slate-600">
            <button onClick={() => navigate("/all-events")} className="hover:text-orange-600 bg-transparent border-none cursor-pointer">All Events</button>
            <button onClick={() => navigate("/Terms")} className="hover:text-orange-600 bg-transparent border-none cursor-pointer">Terms of Service</button>
            <button onClick={() => navigate("/Cancellation")} className="hover:text-orange-600 bg-transparent border-none cursor-pointer">Cancellation Policy</button>
            <button onClick={() => navigate("/Help_Center")} className="hover:text-orange-600 bg-transparent border-none cursor-pointer">Help Center</button>
          </div>
        </div>

        <div className="pt-8 mt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 gap-2">
          <span>© 2026 BookMyEvent Technologies Pvt Ltd. All rights reserved.</span>
          <span>Support Email: <a href="mailto:bookmyevent2026@gmail.com" className="text-orange-600 font-semibold hover:underline">bookmyevent2026@gmail.com</a></span>
        </div>
      </footer>
    </div>
  );
};

export default App;
