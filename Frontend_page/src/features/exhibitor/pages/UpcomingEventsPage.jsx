import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Calendar,
  LayoutGrid,
  Grid,
  LayoutList,
  List,
  Menu,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import MediaRenderer from "@/components/MediaRenderer";
import { getHomeEventshow } from "@/Services/api";

import { useSelector } from "react-redux";

const ExhibitorHome = () => {
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState("medium");
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  console.log("User from Redux:", user);

  useEffect(() => {
    fetchEvents();

    if (user?.id && user?.name) {
      sessionStorage.setItem("userId", user.id);
      sessionStorage.setItem("userName", user.name);
    }
  }, [user]);
  const storedUser = {
    id: sessionStorage.getItem("userId"),
    name: sessionStorage.getItem("userName"),
  };
  const displayUser = user?.id ? user : storedUser;

  const fetchEvents = async () => {
    try {
      const data = await getHomeEventshow();
      const rawList = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.events) ? data.events : []));

      const formatted = rawList.map((e) => ({
        id: e.id,
        title: e.event_name || e.name || "Event",
        location: `${e.venue || ''}, ${e.address || ''}`,
        date: e.start_date,
        endDate: e.end_date,
        image: e.banner_url || "https://via.placeholder.com/400",
        banner_type: e.banner_type,
      }));

      // Sort: Open events first (by date), Closed events last
      formatted.sort((a, b) => {
        const aClosed = new Date(a.date).setHours(23, 59, 59, 999) < new Date();
        const bClosed = new Date(b.date).setHours(23, 59, 59, 999) < new Date();

        if (aClosed !== bClosed) {
          return aClosed ? 1 : -1;
        }
        return new Date(a.date) - new Date(b.date);
      });

      setEvents(formatted);
    } catch (err) {
      console.log("Error fetching events:", err);
    }
  };

  const handleBookStall = (event) => {
    navigate(`/book-stall/${event.id}`, { state: { event } });
  };

  // Pagination Logic
  const totalPages = Math.ceil(events.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEvents = events.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Grid Configuration based on View Mode
  const getGridClasses = () => {
    switch (viewMode) {
      case "large":
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8";
      case "medium":
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
      case "small":
        return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
      case "compact":
        return "grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3";
      case "list":
        return "grid-cols-1 gap-4";
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 pb-20 font-sans">
      {/* Header & Controls Section */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-orange-500/50 hover:text-orange-500 transition-all group"
              title="Go Back"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome,{" "}
              <span className="bg-gradient-to-r from-orange-400 to-rose-500 bg-clip-text text-transparent">
                {displayUser.name || "Exhibitor"}
              </span>{" "}
              👋
            </h1>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowViewMenu(!showViewMenu)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 rounded-2xl shadow-xl border border-slate-800 hover:bg-slate-800 hover:border-orange-500/50 transition-all duration-300 group"
            >
              <Menu
                size={18}
                className="text-orange-500 group-hover:rotate-180 transition-transform duration-500"
              />
              <span className="text-sm font-bold text-slate-300">
                View Mode
              </span>
            </button>

            {showViewMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-[100] overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-300">
                {[
                  { id: "large", name: "Extra large icons", icon: LayoutGrid },
                  { id: "medium", name: "Large icons", icon: Grid },
                  { id: "small", name: "Medium icons", icon: LayoutList },
                  { id: "compact", name: "Small icons", icon: List },
                  { id: "list", name: "List view", icon: Menu },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setViewMode(mode.id);
                      setShowViewMenu(false);
                      setCurrentPage(1); // Reset to first page on view change
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors ${viewMode === mode.id
                        ? "text-orange-500 bg-orange-500/5 font-bold"
                        : "text-slate-400 hover:text-slate-200"
                      }`}
                  >
                    <mode.icon size={18} />
                    <span className="text-sm">{mode.name}</span>
                    {viewMode === mode.id && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Events Container */}
      <div className="max-w-7xl mx-auto">
        <div className={`grid ${getGridClasses()} transition-all duration-500`}>
          {currentEvents.length === 0 ? (
            <div className="text-center col-span-full py-24 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
              <Calendar
                size={48}
                className="mx-auto text-slate-700 mb-4 opacity-20"
              />
              <p className="text-slate-500 font-medium tracking-wide">
                No events found for this page
              </p>
            </div>
          ) : (
            currentEvents.map((event) => (
              <div
                key={event.id}
                className={`group bg-slate-900/40 rounded-3xl overflow-hidden border border-slate-800 hover:border-orange-500/30 hover:shadow-[0_20px_50px_rgba(249,115,22,0.1)] transition-all duration-500 ${viewMode === "list"
                    ? "flex flex-row items-center p-4 gap-6 h-auto"
                    : "flex flex-col"
                  }`}
              >
                {/* Image Section */}
                <div
                  className={`relative overflow-hidden shrink-0 ${viewMode === "list"
                      ? "w-24 h-24 rounded-2xl"
                      : "w-full h-48 md:h-52"
                    }`}
                >
                  <MediaRenderer
                    src={event.image}
                    type={event.banner_type}
                    alt={event.title}
                    className="w-full h-full group-hover:scale-110 transition-transform duration-700"
                  />
                  {viewMode !== "list" && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
                      <div className={`absolute top-4 right-4 text-[10px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-widest shadow-xl ${
                        new Date(event.date).setHours(23, 59, 59, 999) < new Date()
                          ? "bg-slate-700 text-slate-400"
                          : "bg-orange-500 text-white"
                      }`}>
                        {new Date(event.date).setHours(23, 59, 59, 999) < new Date() ? "Completed" : "Upcoming"}
                      </div>
                    </>
                  )}
                </div>

                {/* Content Section */}
                <div
                  className={`flex ${viewMode === "list"
                      ? "flex-row items-center justify-between flex-1 gap-6"
                      : "flex-col p-6 flex-1"
                    }`}
                >
                  <div
                    className={`${viewMode === "list" ? "flex flex-row items-center gap-8 flex-1" : "space-y-3"}`}
                  >
                    <h2
                      className={`font-bold text-slate-100 group-hover:text-orange-400 transition-colors ${viewMode === "compact"
                          ? "text-sm"
                          : "text-lg md:text-xl"
                        } ${viewMode === "list" ? "w-1/4 truncate" : ""}`}
                    >
                      {event.title}
                    </h2>

                    {viewMode === "list" ? (
                      <>
                        <div className="flex items-center gap-3 text-sm text-slate-400 flex-1 min-w-0">
                          <MapPin
                            size={16}
                            className="text-orange-500 shrink-0"
                          />
                          <span className="truncate opacity-80">
                            {event.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-400 shrink-0">
                          <Calendar
                            size={16}
                            className="text-orange-500 shrink-0"
                          />
                          <span className="opacity-80">
                            {new Date(event.date).toDateString()}
                          </span>
                        </div>
                      </>
                    ) : (
                      viewMode !== "compact" && (
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-3 text-sm text-slate-400">
                            <MapPin
                              size={16}
                              className="text-orange-500 shrink-0"
                            />
                            <span className="line-clamp-1 opacity-80">
                              {event.location}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-400">
                            <Calendar
                              size={16}
                              className="text-orange-500 shrink-0"
                            />
                            <span className="opacity-80">
                              {new Date(event.date).toDateString()}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  <button
                    onClick={() => !new Date(event.date).setHours(23, 59, 59, 999) < new Date() && handleBookStall(event)}
                    disabled={new Date(event.date).setHours(23, 59, 59, 999) < new Date()}
                    className={`flex items-center justify-center gap-2 font-bold rounded-2xl transition-all duration-300 shrink-0 mt-4 ${
                      new Date(event.date).setHours(23, 59, 59, 999) < new Date()
                        ? "bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700/50 px-8 py-3 w-full"
                        : viewMode === "list"
                          ? "px-8 py-3 bg-gradient-to-r from-orange-500 to-rose-500 hover:shadow-[0_10px_20px_rgba(249,115,22,0.3)] active:scale-95 w-auto mt-0"
                          : viewMode === "compact"
                            ? "py-2 text-xs bg-gradient-to-r from-orange-500 to-rose-500 hover:shadow-[0_10px_20px_rgba(249,115,22,0.3)] active:scale-95 w-full"
                            : "py-3 bg-gradient-to-r from-orange-500 to-rose-500 hover:shadow-[0_10px_20px_rgba(249,115,22,0.3)] active:scale-95 w-full"
                    }`}
                  >
                    <span>
                      {new Date(event.date).setHours(23, 59, 59, 999) < new Date()
                        ? "Booking Closed"
                        : "Book Stall"}
                    </span>
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center items-center gap-4">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-orange-500/50 disabled:opacity-20 transition-all group"
            >
              <ChevronLeft
                size={24}
                className="group-hover:-translate-x-1 transition-transform"
              />
            </button>

            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`w-12 h-12 rounded-2xl font-bold transition-all duration-500 ${currentPage === i + 1
                      ? "bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/20"
                      : "bg-slate-900 text-slate-500 border border-slate-800 hover:border-orange-500/30"
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-orange-500/50 disabled:opacity-20 transition-all group"
            >
              <ChevronRight
                size={24}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExhibitorHome;
