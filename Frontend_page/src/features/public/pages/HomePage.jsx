import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  MapPin,
  Star,
  ChevronDown,
  User,
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
  ArrowUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MediaRenderer from "@/components/MediaRenderer";
import { getHomeEventshow } from "@/Services/api";
import { getRedirectPathForUser } from "@/shared/services/authHelper";

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

  // 1. Check if city name is within parentheses, e.g. "Vishaal Mal (Madurai)"
  const parenthesized = loc.match(/\(([^)]+)\)/);
  if (parenthesized && parenthesized[1]) {
    const pCity = parenthesized[1].trim();
    return pCity.charAt(0).toUpperCase() + pCity.slice(1).toLowerCase();
  }

  // 2. Custom checks for known cities
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

  // 3. Fallback split by comma
  const parts = loc.split(",");
  let lastPart = parts[parts.length - 1]?.trim() || "";
  const upperLast = lastPart.toUpperCase();
  if (upperLast === "INDIA" || upperLast === "TAMIL NADU" || upperLast === "KARNATAKA") {
    lastPart = parts[parts.length - 2]?.trim() || lastPart;
  }

  return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).toLowerCase();
};

const App = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCity, setSelectedCity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Home");
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  // Animated Category Theme Transition State
  const [prevTheme, setPrevTheme] = useState(categoryThemes.All);
  const [currentTheme, setCurrentTheme] = useState(categoryThemes.All);
  const [opacity, setOpacity] = useState(1);

  const categoryTabs = Object.values(categoryThemes);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const res = await getHomeEventshow();
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      if (list.length === 0) {
        setEvents([]);
        return;
      }

      const formatted = list.map((e, index) => {
        const entryType = e.entry_type || "";
        const passFee = e.pass_fee;
        const isDonation = entryType === "Donation" || String(passFee).toLowerCase() === "donation";
        const isFree = entryType === "Free" || (!isDonation && (!passFee || Number(passFee) === 0));

        return {
          id: e.id,
          title: e.event_name,
          category: e.category || "Live Event",
          entry_type: isDonation ? "Donation" : isFree ? "Free" : "Paid",
          price: isDonation || isFree ? "Free" : `₹${Number(passFee) || 0}`,
          location: e.venue || "Chennai",
          fullLocation: `${e.venue}, ${e.address}`,
          date: e.start_date || "Today",
          likes: `${(120 + index * 18).toFixed(1)}K+`,
          rating: (8.6 + (index % 12) * 0.1).toFixed(1),
          image: e.banner_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800",
          banner_type: e.banner_type,
          bookingEnds: e.end_date || e.start_date + "T23:59:59",
        };
      });

      setEvents(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySwitch = (catKey) => {
    if (catKey === selectedCategory) return;
    const targetTheme = categoryThemes[catKey] || categoryThemes.All;

    setPrevTheme(currentTheme);
    setCurrentTheme(targetTheme);
    setSelectedCategory(catKey);

    setOpacity(0);
    setTimeout(() => {
      setOpacity(1);
    }, 50);
  };

  // Get unique cities list from events
  const citiesList = Array.from(
    new Set(
      events
        .map((e) => getCityFromLocation(e.fullLocation || e.location))
        .filter(Boolean)
    )
  ).sort();

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

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] pb-24 relative select-none">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:wght@300;400;500;700&display=swap');
        
        body {
          font-family: 'Outfit', sans-serif;
          background-color: #f8fafc;
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

        .overlay-tint {
          position: absolute;
          inset: 0;
          background-color: rgba(255, 255, 255, 0.15);
          border-bottom-left-radius: 36px;
          border-bottom-right-radius: 36px;
          z-index: 2;
        }

        .category-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid rgba(255, 255, 255, 0.8);
          background-color: rgba(255, 255, 255, 0.7);
          color: #334155;
          white-space: nowrap;
        }

        .category-pill.selected {
          background-color: #f97316;
          color: #ffffff;
          border-color: #f97316;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.25);
        }

        .grid-card {
          background-color: #ffffff;
          border-radius: 16px;
          padding: 12px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .grid-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
        }

        .floating-pill-nav {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          height: 64px;
          background-color: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 32px;
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 0 16px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
          border: 1px solid rgba(241, 245, 249, 0.6);
          width: 90%;
          max-width: 500px;
          z-index: 99;
        }

        .pill-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 6px 16px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #64748b;
          text-decoration: none;
        }

        .pill-tab.active {
          background-color: #fff7ed;
          color: #f97316;
        }

        .pill-tab-label {
          font-size: 11px;
          font-weight: 700;
          margin-top: 3px;
        }
      `}</style>

      {/* CURVED HEADER WITH BG TRANSITION */}
      <div className="curved-header min-h-[340px] flex flex-col justify-between">
        {/* Dynamic transition background layers */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${prevTheme.background})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
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
          }}
        />
        
        {/* Soft layout overlay */}
        <div className="overlay-tint" />

        {/* Content Safe Container */}
        <div className="relative z-10 max-w-6xl mx-auto w-full px-5 pt-6 flex flex-col justify-between h-full gap-8">
          
          {/* Top Row: Logo, Location Selector, Profile button */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-8">
              <div>
                <BrandLogo textColor="#0f172a" />
                
                {/* Location Select */}
                <div className="relative mt-1">
                  <button
                    onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                    className="flex items-center gap-1 text-[13px] font-extrabold text-[#334155] cursor-pointer bg-transparent border-none outline-none select-none hover:text-[#0f172a] transition-colors"
                  >
                    <MapPin size={13} className="text-[#f97316]" />
                    <span>{selectedCity || "Select City"}</span>
                    <ChevronDown size={13} className="text-[#0f172a]" />
                  </button>

                  {isCityDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setIsCityDropdownOpen(false)} />
                      <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-40 p-2 py-1 max-h-60 overflow-y-auto no-scrollbar animate-fadeIn">
                        <div
                          onClick={() => {
                            setSelectedCity("");
                            setIsCityDropdownOpen(false);
                          }}
                          className={`px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${!selectedCity ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-slate-50'}`}
                        >
                          All Cities
                        </div>
                        {citiesList.map(city => (
                          <div
                            key={city}
                            onClick={() => {
                              setSelectedCity(city);
                              setIsCityDropdownOpen(false);
                            }}
                            className={`px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${selectedCity === city ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-slate-50'}`}
                          >
                            {city}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Desktop Header Navigation Links */}
              <div className="hidden sm:flex items-center gap-5 ml-4">
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-xs font-black text-[#334155] hover:text-[#f97316] cursor-pointer bg-transparent border-none uppercase tracking-wider transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={() => navigate("/all-events")}
                  className="text-xs font-black text-[#334155] hover:text-[#f97316] cursor-pointer bg-transparent border-none uppercase tracking-wider transition-colors"
                >
                  Events
                </button>
                <button
                  onClick={() => navigate("/all-events")}
                  className="text-xs font-black text-[#334155] hover:text-[#f97316] cursor-pointer bg-transparent border-none uppercase tracking-wider transition-colors"
                >
                  Explore
                </button>
              </div>
            </div>

            {/* Profile Avatar Button */}
            <div className="flex items-center gap-3">
              {/* Fallback for smaller screens to have nav items visible in header too */}
              <div className="flex sm:hidden items-center gap-3">
                <button
                  onClick={() => navigate("/all-events")}
                  className="text-xs font-black text-[#334155] hover:text-[#f97316] cursor-pointer bg-transparent border-none uppercase tracking-wider transition-colors"
                >
                  Events
                </button>
              </div>
              <button
                onClick={handleProfileClick}
                className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/90 flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-all text-[#0f172a]"
              >
                <User size={20} />
              </button>
            </div>
          </div>

          {/* White Search Bar */}
          <div className="w-full max-w-xl mx-auto shadow-md rounded-2xl overflow-hidden">
            <div className="bg-white px-4 h-12 flex items-center gap-2 border border-slate-100/50">
              <Search size={18} className="text-[#64748b]" />
              <input
                type="text"
                placeholder={currentTheme.placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-full border-none outline-none font-semibold text-sm text-[#0f172a] placeholder-[#94a3b8]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="p-1 hover:bg-slate-100 rounded-full">
                  <X size={14} className="text-slate-400" />
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Horizontal Category Strip */}
          <div className="w-full overflow-x-auto no-scrollbar py-1">
            <div className="flex gap-2.5">
              {categoryTabs.map((tab) => {
                const IconComp = tab.icon;
                const isSelected = selectedCategory === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => handleCategorySwitch(tab.key)}
                    className={`category-pill ${isSelected ? "selected" : ""}`}
                  >
                    <IconComp size={15} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* EVENTS SHEETS */}
      <div className="max-w-6xl mx-auto px-5 pt-8">
        
        {/* Section title */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-[#0f172a] uppercase tracking-wide">
            {currentTheme.label} <span className="text-[#f97316]">Events</span>
          </h2>
          <button
            onClick={() => navigate("/all-events")}
            className="text-xs font-black text-[#f97316] hover:underline bg-transparent border-none cursor-pointer"
          >
            See All ›
          </button>
        </div>

        {/* Loading feed */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="grid-card cursor-pointer"
                  onClick={() => navigate(`/usersbooking/${ev.id}`)}
                >
                  {/* Card Banner */}
                  <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 relative">
                    <img
                      src={ev.image}
                      alt={ev.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Likes and Star Rating */}
                  <div className="flex items-center justify-between my-2.5 px-0.5">
                    <div className="flex items-center gap-1 text-[10px] font-black text-green-700">
                      <ThumbsUp size={11} className="stroke-[3]" />
                      <span>{ev.likes}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-black text-amber-600">
                      <Star size={11} className="fill-amber-600 text-amber-600 stroke-[3]" />
                      <span>{ev.rating}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xs font-black text-[#0f172a] line-clamp-1 mb-1 px-0.5">
                    {ev.title}
                  </h3>

                  {/* Category and Venue info */}
                  <p className="text-[11px] text-[#64748b] font-medium mb-3 px-0.5">
                    {ev.category} • {getCityFromLocation(ev.fullLocation || ev.location)}
                  </p>

                  {/* Price and BOOK trigger */}
                  <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-100 px-0.5">
                    <span className="text-[13px] font-black text-[#0f172a]">{ev.price}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/usersbooking/${ev.id}`);
                      }}
                      className="bg-[#f97316] hover:bg-orange-600 active:scale-95 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg border-none cursor-pointer transition-all shadow-sm shadow-orange-500/10"
                    >
                      BOOK
                    </button>
                  </div>

                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-3">
                <Search size={36} className="text-slate-300" />
                <p className="text-sm font-bold text-slate-500">No events found in this view</p>
              </div>
            )}
          </div>
        )}

      </div>



    </div>
  );
};

export default App;
