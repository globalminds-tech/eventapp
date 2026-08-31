import apiClient from "./client";
import { ENDPOINTS } from "./endpoints";

const eventsMemoryCache = new Map();

export const clearEventsCache = () => {
  eventsMemoryCache.clear();
};

export const getevent = async () => {
  const response = await apiClient.get(ENDPOINTS.EVENTS.LIST);
  return response.data;
};

export const getEventshow = async (organizerId, forceRefresh = false) => {
  const cacheKey = `events_${organizerId || 'all'}`;
  const url = organizerId ? `/superadmin/get-events?organizer=${encodeURIComponent(organizerId)}` : "/superadmin/get-events";

  if (!forceRefresh && eventsMemoryCache.has(cacheKey)) {
    // Return cached data immediately for instant response
    const cachedData = eventsMemoryCache.get(cacheKey);
    // Background revalidation
    apiClient.get(url).then(res => {
      eventsMemoryCache.set(cacheKey, res.data);
    }).catch(err => console.error("Background event refresh error:", err));
    return cachedData;
  }

  const res = await apiClient.get(url);
  eventsMemoryCache.set(cacheKey, res.data);
  return res.data;
};

export const saveEventDetails = async (data) => {
  const res = await apiClient.post(ENDPOINTS.EVENTS.DETAILS, data);
  return res.data;
};

export const completeEvent = async (formData) => {
  const isFormData = typeof FormData !== "undefined" && formData instanceof FormData;
  const config = isFormData ? { headers: { "Content-Type": undefined } } : {};
  const res = await apiClient.post("/superadmin/api/complete-event", formData, config);
  clearEventsCache();
  return res.data;
};

export const saveBooking = async (data) => {
  const res = await apiClient.post("/superadmin/api/booking", data);
  return res.data;
};

export const saveLayout = async (data) => {
  const res = await apiClient.post("/superadmin/api/layout", data);
  return res.data;
};

export const saveDocuments = async (data) => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const config = isFormData ? { headers: { "Content-Type": undefined } } : {};
  const res = await apiClient.post("/superadmin/upload/all-docs", data, config);
  return res.data;
};

export const saveTerms = async (data) => {
  const res = await apiClient.post("/superadmin/api/save-terms", data);
  return res.data;
};

export const saveVendors = async (data) => {
  const res = await apiClient.post("/superadmin/api/save-vendors-sponsors", data);
  return res.data;
};

export const finalSubmit = async (data) => {
  const res = await apiClient.post("/superadmin/event/final-submit", data);
  return res.data;
};

export const updateEvent = async (id, formData) => {
  const isFormData = typeof FormData !== "undefined" && formData instanceof FormData;
  const config = isFormData ? { headers: { "Content-Type": undefined } } : {};
  const res = await apiClient.put(ENDPOINTS.EVENTS.UPDATE(id), formData, config);
  clearEventsCache();
  return res.data;
};

export const deleteEvent = async (id) => {
  const res = await apiClient.delete(ENDPOINTS.EVENTS.DELETE(id));
  clearEventsCache();
  return res.data;
};

export const getEventFullDetails = async (id) => {
  const res = await apiClient.get(`/superadmin/api/event-full-details/${id}`);
  return res.data;
};

export const getFullEventDetails = async (id) => {
  const res = await apiClient.get(`/superuser/event-full-details/${id}`);
  return res.data;
};

export const getEventById = async (id) => {
  const res = await apiClient.get(`/superadmin/booking/event/${id}`);
  return res.data;
};

export const getEventBulkDetails = async () => {
  const res = await apiClient.get("/superadmin/api/event-bulk-details");
  return res.data;
};

export const getApprovedEvents = async () => {
  const res = await apiClient.get("/superadmin/api/approved-events");
  return res.data;
};

let homeEventsCache = null;
let homeEventsCacheTimestamp = 0;

export const getHomeEventshow = async (forceRefresh = false) => {
  const now = Date.now();
  if (!forceRefresh && homeEventsCache && (now - homeEventsCacheTimestamp < 180000)) {
    return homeEventsCache;
  }
  try {
    const stored = sessionStorage.getItem("home_events_cache");
    if (!forceRefresh && !homeEventsCache && stored) {
      homeEventsCache = JSON.parse(stored);
      homeEventsCacheTimestamp = now;
      // Return cached immediately and refresh in background
      apiClient.get("/superadmin/home/get-events").then((res) => {
        if (res?.data) {
          homeEventsCache = res.data;
          sessionStorage.setItem("home_events_cache", JSON.stringify(res.data));
        }
      }).catch(() => {});
      return homeEventsCache;
    }
  } catch (err) {}

  const res = await apiClient.get("/superadmin/home/get-events");
  if (res?.data) {
    homeEventsCache = res.data;
    homeEventsCacheTimestamp = now;
    try {
      sessionStorage.setItem("home_events_cache", JSON.stringify(res.data));
    } catch (e) {}
  }
  return res.data;
};

export const getAllEvents = async () => {
  const res = await apiClient.get("/superuser/get-events");
  return res.data;
};

export const updateEventStatus = async (id, status) => {
  const res = await apiClient.put(`/superuser/update-status/${id}`, { status });
  return res.data;
};

export const getDashboardStats = async (period = "30d") => {
  const res = await apiClient.get(`/superuser/dashboard-stats?period=${period}`);
  return res.data;
};

export const getAllUsers = async () => {
  const res = await apiClient.get("/superuser/users");
  return res.data;
};
