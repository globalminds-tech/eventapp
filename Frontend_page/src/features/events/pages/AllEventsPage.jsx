import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, MapPin, Calendar, Filter, RefreshCw, ChevronLeft, ArrowRight, ThumbsUp, Star } from "lucide-react";
import { getHomeEventshow } from "@/Services/api";
import { getAdminCategories } from "@/shared/services/miscService";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { isEventConcluded } from "@/shared/utils/eventDateUtils";
import UserEventCard from "@/components/UserEventCard";

export default function AllEvents() {
  const navigate = useNavigate();
  const location = useLocation();

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchTitle, setSearchTitle] = useState(location.state?.title || "");
  const [searchLocation, setSearchLocation] = useState(location.state?.location || "");
  const [searchCategory, setSearchCategory] = useState(location.state?.category || "All");

  const [categories, setCategories] = useState(["All"]);

  useEffect(() => {
    fetchEvents();
    fetchCategories();
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

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await getHomeEventshow();
      const rawList = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      if (!rawList || rawList.length === 0) {
        setEvents([]);
        setFilteredEvents([]);
        return;
      }

      // Hide concluded events whose date has passed from the user explore catalog
      const activeList = rawList.filter((e) => !isEventConcluded(e));

      const formatted = activeList.map((e, index) => {
        const isDonation = e.entry_type === "Donation" || String(e.pass_fee).toLowerCase() === "donation";
        const isFree = e.entry_type === "Free" || (!isDonation && (!e.pass_fee || Number(e.pass_fee) === 0));
        return {
          id: e.id,
          title: e.event_name || e.name || "Live Event",
          category: e.category || "General",
          entry_type: isDonation ? "Donation" : isFree ? "Free" : "Paid",
          price: isDonation || isFree ? "Free" : `₹${Number(e.pass_fee) || 0}`,
          location: e.venue || "Chennai",
          fullLocation: `${e.venue || ''}, ${e.address || e.city || ''}`,
          date: e.start_date || "Upcoming",
          likes: `${(120 + index * 18).toFixed(1)}K+`,
          rating: (8.6 + (index % 12) * 0.1).toFixed(1),
          image: e.banner_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800",
          status: (e.status || "APPROVED").toUpperCase(),
        };
      });

      setEvents(formatted);
      setFilteredEvents(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindEvents = useCallback(() => {
    let result = [...events];

    if (searchTitle.trim()) {
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(searchTitle.toLowerCase()) ||
          e.fullLocation.toLowerCase().includes(searchTitle.toLowerCase())
      );
    }
    if (searchLocation.trim()) {
      result = result.filter((e) =>
        e.fullLocation.toLowerCase().includes(searchLocation.toLowerCase())
      );
    }
    if (searchCategory && searchCategory !== "All") {
      result = result.filter(
        (e) => e.category.trim().toLowerCase().includes(searchCategory.trim().toLowerCase())
      );
    }
    setFilteredEvents(result);
  }, [events, searchTitle, searchLocation, searchCategory]);

  useEffect(() => {
    handleFindEvents();
  }, [handleFindEvents]);

  const handleResetFilters = () => {
    setSearchTitle("");
    setSearchLocation("");
    setSearchCategory("All");
    setFilteredEvents(events);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none pb-24">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="p-1.5 hover:bg-slate-100 rounded-xl cursor-pointer text-slate-600 transition border-none bg-transparent"
              title="Go Back"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Explore Live Events &amp; Shows
            </h1>
          </div>

          <Badge className="bg-orange-50 text-orange-600 border-orange-200 font-bold text-[11px]">
            {filteredEvents.length} Events Available
          </Badge>
        </div>
      </div>

      {/* Hero Banner Section */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-8 px-5">
        <div className="max-w-6xl mx-auto text-center space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">✦ LIVE TICKET SHOWCASE ✦</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Find Your Next Unforgettable Experience</h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-lg mx-auto">
            Book verified tickets instantly for concerts, standup comedy, tech expos, and sports tournaments.
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="max-w-6xl mx-auto px-4 w-full -mt-6 z-20">
        <Card className="bg-white border-slate-200/80 shadow-md rounded-2xl p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search event title, artist..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Filter by city or venue..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto touch-scroll no-scrollbar py-1 flex-1 min-w-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSearchCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border shrink-0 whitespace-nowrap ${
                    searchCategory === cat
                      ? "bg-orange-500 text-white border-orange-500 shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="text-xs font-bold rounded-xl border-slate-200 text-slate-600 gap-1.5 cursor-pointer ml-auto"
            >
              <RefreshCw size={13} />
              <span>Reset</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Events Grid */}
      <div className="max-w-6xl mx-auto px-4 w-full pt-6 sm:pt-8">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <Card key={n} className="bg-white border-slate-200/80 shadow-xs rounded-xl sm:rounded-2xl overflow-hidden p-2.5 sm:p-4 space-y-2.5">
                <Skeleton className="aspect-[16/10] sm:aspect-[4/3] w-full rounded-lg sm:rounded-xl" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
                <Skeleton className="h-7 sm:h-8 w-full rounded-lg sm:rounded-xl" />
              </Card>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 sm:p-16 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 font-semibold text-xs sm:text-sm">
            No events found matching your search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
            {filteredEvents.map((ev) => (
              <UserEventCard
                key={ev.id}
                event={ev}
                variant="grid"
                onClick={() => navigate(`/event-detail/${ev.id}`)}
                onBookClick={() => navigate(`/event-detail/${ev.id}`)}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
