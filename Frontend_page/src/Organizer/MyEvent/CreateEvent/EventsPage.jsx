import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchEventsThunk } from "../../../Redux/eventSlice";
import { Skeleton } from "../../../components/ui/Skeleton";
import {
  Plus,
  User,
  Rocket,
  Calendar,
  Clock,
  Ticket,
  Users,
  MapPin,
  MoreVertical,
  LayoutGrid,
  Grid,
  LayoutList,
  List,
  Menu,
  Search,
  AlertTriangle,
  Pencil,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { Eye, Trash2, CheckCircle } from "lucide-react";

import CreateEvent from "./CreateEvent";
import ViewEventDetails from "./ViewEventDetails";
import MediaRenderer from "../../../components/MediaRenderer";
import { getEventshow, deleteEvent, getEventFullDetails } from "../../../Services/api";

/* 🔥 CONTINUOUS RIGHT → LEFT IMAGE SLIDER */
const ImageSlider = ({ images = [], className = "w-28 h-20" }) => {
  // Ensure we have at least 2 images to create a loop
  const sliderImages =
    images.length === 0
      ? [null, null]
      : images.length === 1
        ? [...images, ...images]
        : [...images, ...images];

  return (
    <div className={`${className} overflow-hidden rounded-lg relative`}>
      <div className="flex animate-scroll w-max">
        {sliderImages.map((img, i) => {
          const srcUrl = typeof img === 'object' && img !== null ? img.url : img;
          const bannerType = typeof img === 'object' && img !== null ? img.banner_type : null;
          return (
            <MediaRenderer
              key={i}
              src={srcUrl}
              type={bannerType}
              className={`${className} flex-shrink-0`}
            />
          );
        })}
      </div>
    </div>
  );
};

const EventsPage = () => {
  const dispatch = useDispatch();
  const [showCreate, setShowCreate] = useState(true);
  const [editEvent, setEditEvent] = useState(null);
  const [isView, setIsView] = useState(false);
  
  const eventsState = useSelector((state) => state.events?.list);
  const events = Array.isArray(eventsState) ? eventsState : (Array.isArray(eventsState?.data) ? eventsState.data : []);
  const { loading, loaded } = useSelector((state) => state.events);

  const [viewMode, setViewMode] = useState("medium"); // large, medium, small, compact, list, details
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const Redexorganizer = useSelector((state) => state.user);
  const storedUser = {
    id: sessionStorage.getItem("userId"),
    name: sessionStorage.getItem("userName"),
  };
  const organizer = Redexorganizer?.id ? Redexorganizer : storedUser;

  useEffect(() => {
    if (organizer?.id) {
      dispatch(fetchEventsThunk(organizer.id));
    }
  }, [dispatch, organizer?.id]);

  useEffect(() => {
    if (location.pathname.includes("/ViewEvent")) {
      setShowCreate(true);
      setIsView(true);
      if (location.state?.eventData) {
        setEditEvent(location.state.eventData);
      }
    } else if (location.pathname.includes("/EditEvent")) {
      setShowCreate(true);
      setIsView(false);
      if (location.state?.eventData) {
        setEditEvent(location.state.eventData);
      }
    } else if (location.state?.mode === "create") {
      setShowCreate(true);
      setIsView(false);
      setEditEvent(null);
    } else if (location.state?.mode === "view" || location.state?.isReadOnly) {
      setShowCreate(true);
      setIsView(true);
      if (location.state?.eventData) {
        setEditEvent(location.state.eventData);
      }
    } else if (location.state?.reset) {
      setShowCreate(false);
      setEditEvent(null);
      setIsView(false);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, location.pathname]);

  const formatTime = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    const hour = h % 12 || 12;
    const ampm = h >= 12 ? "PM" : "AM";
    return `${hour}:${m} ${ampm}`;
  };

  const handleDelete = (id) => {
    setEventToDelete(id);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
      await deleteEvent(eventToDelete);
      setEventToDelete(null);
      setShowSuccess(true);
      fetchEvents();
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to delete event", err);
      alert("Failed to delete event.");
    } finally {
      setIsDeleting(false);
    }
  };

  const [isLoadingFullData, setIsLoadingFullData] = useState(false);

  const handleEdit = async (event) => {
    setIsLoadingFullData(true);
    try {
      const fullData = await getEventFullDetails(event.id);
      if (fullData) {
        setEditEvent(fullData);
        setIsView(false);
        setShowCreate(true);
        const eventCode = event.event_code || event.code || event.eventCode || event.id;
        navigate(`/OrganizerHome/EditEvent/${eventCode}`, { state: { eventData: fullData, eventId: event.id }, replace: true });
      }
    } catch (err) {
      console.error("Failed to fetch full event details", err);
      alert("Error loading event data.");
    } finally {
      setIsLoadingFullData(false);
    }
  };

  const handleView = async (event) => {
    setIsLoadingFullData(true);
    try {
      const fullData = await getEventFullDetails(event.id);
      if (fullData) {
        setEditEvent(fullData);
        setIsView(true);
        setShowCreate(true);
        const eventCode = event.event_code || event.code || event.eventCode || event.id;
        navigate(`/OrganizerHome/ViewEvent/${eventCode}`, { state: { mode: "view", isReadOnly: true, eventData: fullData, eventId: event.id }, replace: true });
      }
    } catch (err) {
      console.error("Failed to fetch full event details", err);
      alert("Error loading event data.");
    } finally {
      setIsLoadingFullData(false);
    }
  };

  const filteredEvents = (events || []).filter((e) =>
    (e.event_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.venue || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.address || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ================= PAGINATION LOGIC =================
  const indexOfLastEvent = currentPage * itemsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - itemsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, viewMode]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const navigate = useNavigate();

  if (showCreate) {
    return (
      <CreateEvent
        editData={editEvent}
        isView={isView}
        onBack={() => {
          navigate("/OrganizerHome");
        }}
      />
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-12 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
          <p className="text-gray-500 mt-1">
            Manage and track your organized events
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search
                size={18}
                className="text-gray-400 group-focus-within:text-indigo-600 transition-colors"
              />
            </div>
            <input
              type="text"
              placeholder="Search by event name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl w-64 md:w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* View Toggle Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowViewMenu(!showViewMenu);
                setOpenMenuId(null); // Close any open event menus
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl shadow-sm border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-300"
            >
              <Menu size={18} className="text-indigo-600" />
              <span className="text-sm font-semibold text-gray-700">View</span>
            </button>

            {showViewMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-30 py-2 animate-fade-in">
                <div className="px-4 py-2 mb-1 border-b border-gray-50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Layout Style</p>
                </div>
                {[
                  { id: "large", name: "Extra large icons", icon: LayoutGrid, color: "indigo" },
                  { id: "medium", name: "Large icons", icon: Grid, color: "blue" },
                  { id: "small", name: "Medium icons", icon: LayoutList, color: "purple" },
                  { id: "compact", name: "Small icons", icon: List, color: "teal" },
                  { id: "details", name: "Detailed List", icon: MoreVertical, color: "rose" },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setViewMode(mode.id);
                      setShowViewMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-200 ${viewMode === mode.id
                      ? "bg-indigo-50 text-indigo-600 font-bold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                  >
                    <div className={`p-1.5 rounded-lg ${viewMode === mode.id ? "bg-white shadow-sm" : "bg-gray-50"}`}>
                      <mode.icon size={16} />
                    </div>
                    <span className="text-sm">{mode.name}</span>
                    {viewMode === mode.id && <div className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-sky-700 text-white px-6 py-2.5 rounded-xl shadow-lg hover:bg-sky-800 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <Plus size={20} />
            Create Event
          </button>
        </div>
      </div>

      {/* GRID */}
      <div
        className={`grid gap-6 mb-8 transition-all duration-500 ${viewMode === "large"
          ? "grid-cols-1 md:grid-cols-1"
          : viewMode === "medium"
            ? "grid-cols-1 md:grid-cols-2"
            : viewMode === "small"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : viewMode === "compact"
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                : "grid-cols-1"
          }`}
      >
        {loading && !loaded ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4 animate-pulse">
              <Skeleton className="w-full h-44 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="w-20 h-4" />
                <Skeleton className="w-3/4 h-6" />
                <Skeleton className="w-1/2 h-4" />
              </div>
            </div>
          ))
        ) : filteredEvents.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <Search size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">
              No events found matching "{searchTerm}"
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="mt-4 text-indigo-600 font-semibold hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          currentEvents.map((e, idx) => (
            <div
              key={e.id}

              className={`group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-indigo-200 animate-fade-in ${viewMode === "list" || viewMode === "details"
                ? "flex flex-col md:flex-row items-center p-4 gap-6"
                : "flex flex-col"
                }`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* TOP SECTION / IMAGE */}
              <div
                className={`relative flex justify-between items-start ${viewMode === "list" || viewMode === "details"
                  ? "w-full md:w-auto p-0"
                  : viewMode === "compact" || viewMode === "small"
                    ? "p-4"
                    : "p-6"
                  }`}
              >
                <div
                  className={`flex items-center gap-4 flex-1 ${viewMode === "list" || viewMode === "details"
                    ? "flex-col md:flex-row text-center md:text-left"
                    : ""
                    }`}
                >
                  {/* 🔥 IMAGE SLIDER */}
                  <div className="transform group-hover:scale-110 transition duration-500">
                    <ImageSlider
                      images={e.images || [{ url: e.banner_url, banner_type: e.banner_type }]}
                      className={
                        viewMode === "large"
                          ? "w-48 h-32"
                          : viewMode === "compact" || viewMode === "small"
                            ? "w-24 h-16"
                            : "w-28 h-20"
                      }
                    />
                  </div>

                  {/* TITLE */}
                  <div className="flex-1 min-w-0">
                    <h2
                      className={`font-bold text-gray-900 group-hover:text-indigo-700 transition line-clamp-2 ${viewMode === "large"
                        ? "text-2xl"
                        : viewMode === "compact"
                          ? "text-sm"
                          : viewMode === "small"
                            ? "text-base"
                            : "text-xl"
                        }`}
                    >
                      {e.event_name}
                    </h2>
                  </div>
                </div>

                {!(viewMode === "list" || viewMode === "details") && (
                  <div className="relative">
                    <MoreVertical
                      size={35}
                      onClick={() => {
                        setOpenMenuId(openMenuId === e.id ? null : e.id);
                        setShowViewMenu(false);
                      }}
                      className={`cursor-pointer transition-all duration-300 p-2 rounded-xl ${openMenuId === e.id
                        ? "bg-indigo-600 text-white shadow-md rotate-90"
                        : "text-gray-400 hover:bg-indigo-50 hover:text-indigo-600"
                        }`}
                    />
                    {openMenuId === e.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-2xl z-30 py-2 animate-fade-in">
                        <button
                          onClick={() => { handleView(e); setOpenMenuId(null); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200"
                        >
                          <div className="p-1.5 bg-indigo-50 rounded-lg group-hover:bg-indigo-100">
                            <Eye size={16} />
                          </div>
                          <span className="font-medium">View Details</span>
                        </button>

                        {e.status !== "APPROVED" && (
                          <button
                            onClick={() => { handleEdit(e); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-all duration-200"
                          >
                            <div className="p-1.5 bg-amber-50 rounded-lg group-hover:bg-amber-100">
                              <Pencil size={16} />
                            </div>
                            <span className="font-medium">Edit Event</span>
                          </button>
                        )}

                        {e.status !== "APPROVED" && (
                          <>
                            <div className="mx-2 my-1 border-t border-gray-50" />
                            <button
                              onClick={() => { handleDelete(e.id); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all duration-200"
                            >
                              <div className="p-1.5 bg-red-50 rounded-lg group-hover:bg-red-100">
                                <Trash2 size={16} />
                              </div>
                              <span className="font-medium">Delete Event</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!(viewMode === "list" || viewMode === "details") && (
                <hr className="border-gray-50" />
              )}

              {/* DETAILS */}
              <div
                className={`relative text-sm flex-1 ${viewMode === "list" || viewMode === "details"
                  ? "flex flex-wrap gap-x-8 gap-y-4 w-full p-0"
                  : viewMode === "compact" || viewMode === "small"
                    ? "grid grid-cols-1 p-4 gap-4"
                    : "grid grid-cols-2 p-6 gap-4"
                  }`}
              >
                <div className="group/item flex gap-3 items-center min-w-[120px]">
                  <div className="p-1.5 bg-indigo-50 rounded-lg group-hover/item:bg-indigo-100 transition text-indigo-600">
                    <User size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                      Created By
                    </p>
                    <p className="font-medium text-gray-900 truncate text-xs">
                      {e.created_by}
                    </p>
                  </div>
                </div>

                <div className="group/item flex gap-3 items-center min-w-[100px]">
                  <div className="p-1.5 bg-purple-50 rounded-lg group-hover/item:bg-purple-100 transition text-purple-600">
                    <Rocket size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                      Status
                    </p>
                    <p
                      className={`font-bold text-[10px] px-2 py-1 rounded-full inline-block
      ${e.status === "APPROVED"
                          ? "bg-green-100 text-green-600"
                          : e.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-600"
                            : e.status === "REJECTED"
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-600"
                        }
    `}
                    >
                      {e.status}
                    </p>
                  </div>
                </div>

                {viewMode !== "compact" && (
                  <>
                    <div className="group/item flex gap-3 items-center min-w-[120px]">
                      <div className="p-1.5 bg-amber-50 rounded-lg group-hover/item:bg-amber-100 transition text-amber-600">
                        <Calendar size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold whitespace-nowrap">
                          Start Date On
                        </p>
                        <p className="font-medium text-gray-900 text-xs">
                          {formatDate(e.start_date)}
                        </p>
                      </div>
                    </div>

                    <div className="group/item flex gap-3 items-center min-w-[120px]">
                      <div className="p-1.5 bg-rose-50 rounded-lg group-hover/item:bg-rose-100 transition text-rose-600">
                        <Calendar size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold whitespace-nowrap">
                          End Date On
                        </p>
                        <p className="font-medium text-gray-900 text-xs">
                          {formatDate(e.end_date)}
                        </p>
                      </div>
                    </div>

                    <div className="group/item flex gap-3 items-center min-w-[120px]">
                      <div className="p-1.5 bg-blue-50 rounded-lg group-hover/item:bg-blue-100 transition text-blue-600">
                        <Clock size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold whitespace-nowrap">
                          Starting Time
                        </p>
                        <p className="font-medium text-gray-900 text-xs">
                          {formatTime(e.start_time)}
                        </p>
                      </div>
                    </div>

                    <div className="group/item flex gap-3 items-center min-w-[100px]">
                      <div className="p-1.5 bg-rose-50 rounded-lg group-hover/item:bg-rose-100 transition text-rose-600">
                        <Ticket size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold whitespace-nowrap">
                          Pass Fee
                        </p>
                        <p className="font-bold text-gray-900 text-xs">
                          {e.charge_type || "--"}
                        </p>
                      </div>
                    </div>

                    <div className="group/item flex gap-3 items-center min-w-[130px]">
                      <div className="p-1.5 bg-teal-50 rounded-lg group-hover/item:bg-teal-100 transition text-teal-600">
                        <Users size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold whitespace-nowrap">
                          Maximum Capacity
                        </p>
                        <p className="font-bold text-gray-900 text-xs">
                          {e.capacity}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* LOCATION */}
              {!(viewMode === "small" || viewMode === "compact") && (
                <div
                  className={`relative flex gap-3 text-sm border-t border-gray-100 ${viewMode === "list" || viewMode === "details"
                    ? "w-full md:w-auto min-w-[200px] p-0 border-t-0 border-l border-gray-100 pl-6 ml-4"
                    : "px-6 pb-6 pt-4"
                    }`}
                >
                  <MapPin size={18} className="text-indigo-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                      Location
                    </p>
                    <p className="font-medium text-gray-900 text-xs">
                      {e.venue}, {e.address}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions for List View */}
              {(viewMode === "list" || viewMode === "details") && (
                <div className="flex items-center gap-2 ml-auto pr-4 border-l border-gray-100 pl-4 h-full">
                  <button
                    onClick={() => handleView(e)}
                    className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition"
                    title="View Details"
                  >
                    <Eye size={20} />
                  </button>
                  {e.status !== "APPROVED" && (
                    <button
                      onClick={() => handleEdit(e)}
                      className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition"
                      title="Edit"
                    >
                      <Pencil size={20} />
                    </button>
                  )}
                  {e.status !== "APPROVED" && (
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* PAGINATION CONTROLS */}
      {filteredEvents.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 mb-12 gap-4">
          <div className="flex items-center gap-4">
            <p className="text-gray-500 text-sm font-medium">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredEvents.length)} of {filteredEvents.length} events
            </p>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm font-medium">Records per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="p-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-10 h-10 rounded-xl font-bold transition-all shadow-sm ${currentPage === i + 1
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}


      {/* VIEW EVENT MODAL */}
      {selectedEvent && (
        <ViewEventDetails
          eventId={selectedEvent.id}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 relative flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-rose-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Event</h2>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this event? This action cannot be undone and will remove all associated bookings, layout, and vendor details.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setEventToDelete(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-rose-600 text-white hover:bg-rose-700 font-semibold rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in shadow-2xl">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm border border-emerald-100 transform transition-all animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-3">
              Deleted!
            </h3>
            <p className="text-gray-600 text-center text-base leading-relaxed">
              Your event has been successfully removed from the platform.
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="mt-6 w-full py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
            >
              Great
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        .animate-scroll { animation: scroll 15s linear infinite; }
      `}</style>
    </div>
  );
};

export default EventsPage;
