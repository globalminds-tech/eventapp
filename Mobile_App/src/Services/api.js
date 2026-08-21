// src/Services/api.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// DEFAULT BACKEND CANDIDATES
const DEFAULT_BASE_URL = "http://10.133.157.12:5001/"; // Hotspot / Local Network IP

// AXIOS INSTANCE WITH ROBUST TIMEOUT
const api = axios.create({
  baseURL: DEFAULT_BASE_URL,
  timeout: 15000, // 15s timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Dynamic Base URL Setter & Getter
export const setCustomBaseUrl = async (newUrl) => {
  try {
    const formattedUrl = newUrl.endsWith("/") ? newUrl : `${newUrl}/`;
    await AsyncStorage.setItem("custom_base_url", formattedUrl);
    api.defaults.baseURL = formattedUrl;
    console.log("Updated Base URL to:", formattedUrl);
    return formattedUrl;
  } catch (e) {
    console.error("Failed to save custom Base URL", e);
  }
};

export const getCurrentBaseUrl = async () => {
  try {
    const storedUrl = await AsyncStorage.getItem("custom_base_url");
    if (storedUrl) {
      api.defaults.baseURL = storedUrl;
      return storedUrl;
    }
  } catch (e) {
    console.warn("Could not read stored base URL", e);
  }
  return DEFAULT_BASE_URL;
};

// Initialize Base URL asynchronously
getCurrentBaseUrl();

// REQUEST INTERCEPTOR: Attach Authorization Token & Dynamic Host Verification
api.interceptors.request.use(
  async (req) => {
    try {
      // Dynamic base URL check
      const storedUrl = await AsyncStorage.getItem("custom_base_url");
      if (storedUrl && api.defaults.baseURL !== storedUrl) {
        api.defaults.baseURL = storedUrl;
        req.baseURL = storedUrl;
      }
      
      const token = await AsyncStorage.getItem("token");
      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error attaching request headers:", error);
    }
    return req;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR: Exponential Retry & Standard Error Normalization
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if network error or server transient 5xx error & retry count < 3
    const isNetworkOrServerError =
      !error.response ||
      error.code === "ECONNABORTED" ||
      error.code === "ERR_NETWORK" ||
      (error.response && error.response.status >= 500);

    if (isNetworkOrServerError && originalRequest && !originalRequest._retry) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      if (originalRequest._retryCount <= 3) {
        const backoffDelay = Math.pow(2, originalRequest._retryCount - 1) * 1000;
        console.warn(
          `[Axios Retry] Retrying request (${originalRequest._retryCount}/3) to ${originalRequest.url} after ${backoffDelay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        return api(originalRequest);
      }
    }

    // Auto-clear token on 401 Unauthorized
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized API call. Clearing expired token...");
      try {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
      } catch (e) {
        console.error("Failed to clear auth state:", e);
      }
    }

    // Standardized Error Response object formatting
    const formattedError = {
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "A network error occurred. Please check server connection.",
      status: error.response?.status || 0,
      data: error.response?.data || null,
      isNetworkError: !error.response,
    };

    return Promise.reject(formattedError);
  }
);


// LOGIN API
export const loginUser = (formData) => {
  return api.post("/auth/api/login", formData);
};

export const registerUser = (formData) => {
  return api.post("/auth/api/register", formData);
};

// GET all vendors
export const getVendors = (organizerId) => {
  const url = organizerId
    ? `/superadmin/api/vendors?organizer_id=${organizerId}`
    : "/superadmin/api/vendors";
  return api.get(url);
};

// CREATE vendor
export const createVendor = (data) => {
  return api.post("/superadmin/api/create_vendor", data);
};

// GET single vendor
export const getVendorById = (id) => {
  return api.get(`/superadmin/api/vendor/${id}`);
};

// DELETE vendor
export const deleteVendor = (id) => {
  return api.delete(`/superadmin/api/delete_vendor/${id}`);
};

// UPDATE vendor
export const updateVendor = (id, data) => {
  return api.put(`/superadmin/api/update_vendor/${id}`, data);
};

export const exportVendorsExcel = () => {
  return api.get("/superadmin/api/vendors/export/excel", {
    responseType: "blob",
  });
};

export const exportVendorsPdf = () => {
  return api.get("/superadmin/api/vendors/export/pdf", {
    responseType: "blob",
  });
};

// EXPORT Policies
export const exportPoliciesExcel = () => {
  return api.get("/superadmin/api/policies/export/excel", {
    responseType: "blob",
  });
};

export const exportPoliciesPdf = () => {
  return api.get("/superadmin/api/policies/export/pdf", {
    responseType: "blob",
  });
};

// GET all policies
export const getPoliciess = () => {
  return api.get("/superadmin/api/policies");
};

// CREATE policy
export const createPolicy = (data) => {
  return api.post("/superadmin/api/create_policy", data);
};

// UPDATE policy
export const updatePolicy = (id, data) => {
  return api.put(`/superadmin/api/update_policy/${id}`, data);
};

// GET single policy
export const getPolicyById = (id) => {
  return api.get(`/superadmin/api/policy/${id}`);
};

// DELETE policy
export const deletePolicy = (id) => {
  return api.delete(`/superadmin/api/delete_policy/${id}`);
};

export const getUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};

// GET EVENTS DETAIL
export const getevent = async () => {
  const response = await api.get("/superadmin/api/events_detail");
  return response.data;
};

/* EVENT APIs */
export const get_Venues_details = async (organizerId) => {
  const url = organizerId
    ? `/superadmin/api/venues_details?organizer_id=${organizerId}`
    : "/superadmin/api/venues_details";
  const res = await api.get(url);
  return res.data;
};

/* VENUE APIs */
export const getVenues = async (organizerId) => {
  const url = organizerId
    ? `/superadmin/api/venues?organizer_id=${organizerId}`
    : "/superadmin/api/venues";
  const res = await api.get(url);
  return res.data;
};

export const getVenueDetails = async (id) => {
  const res = await api.get(`/superadmin/api/venuedetail/${id}`);
  return res.data;
};

export const createVenue = async (data) => {
  const res = await api.post("/superadmin/api/create_venue", data);
  return res.data;
};

// UPDATE venue
export const updateVenue = async (id, data) => {
  const res = await api.put(`/superadmin/api/update_venue/${id}`, data);
  return res.data;
};

// DELETE venue
export const deleteVenue = (id) => {
  return api.delete(`/superadmin/api/delete_venue/${id}`);
};

export const exportVenuesExcel = () => {
  return api.get("/superadmin/api/venues/export/excel", {
    responseType: "blob",
  });
};

export const exportVenuesPdf = () => {
  return api.get("/superadmin/api/venues/export/pdf", { responseType: "blob" });
};

/* GET EVENTS */
export const getEvents = () => api.get("/events");

// We fall back if country-state-city packages are not available or mock them
export const getCountries = async () => {
  try {
    const { Country } = require("country-state-city");
    return Country.getAllCountries().map((c) => ({
      id: c.isoCode,
      country_name: c.name,
    }));
  } catch (e) {
    return [{ id: "IN", country_name: "India" }];
  }
};

export const getStates = async (countryCode) => {
  try {
    const { State } = require("country-state-city");
    return State.getStatesOfCountry(countryCode).map((s) => ({
      id: s.isoCode,
      state_name: s.name,
    }));
  } catch (e) {
    return [{ id: "TN", state_name: "Tamil Nadu" }];
  }
};

export const getCities = async (countryCode, stateCode) => {
  try {
    const { City } = require("country-state-city");
    return City.getCitiesOfState(countryCode, stateCode).map((c) => ({
      id: c.name,
      city_name: c.name,
    }));
  } catch (e) {
    return [{ id: "Chennai", city_name: "Chennai" }];
  }
};

export const saveEventDetails = async (data) => {
  const res = await api.post("/superadmin/api/event-details", data);
  return res.data;
};

export const completeEvent = async (formData) => {
  const res = await api.post("/superadmin/api/complete-event", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const saveBooking = async (data) => {
  const res = await api.post("/superadmin/api/booking", data);
  return res.data;
};

export const saveLayout = async (data) => {
  const res = await api.post("/superadmin/api/layout", data);
  return res.data;
};

export const saveDocuments = async (data) => {
  const res = await api.post("/superadmin/upload/all-docs", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const saveTerms = async (data) => {
  const res = await api.post("/superadmin/api/save-terms", data);
  return res.data;
};

export const saveVendors = async (data) => {
  const res = await api.post("/superadmin/api/save-vendors-sponsors", data);
  return res.data;
};

export const finalSubmit = async (data) => {
  const res = await api.post("/superadmin/event/final-submit", data);
  return res.data;
};

export const getPolicies = async (organizerId) => {
  const res = await api.get(`/superadmin/api/all-policies/${organizerId}`);
  return res.data;
};

// Vendor APIs
export const getVendorTypes = async () => {
  const res = await api.get("/superadmin/api/get-vendor-types");
  return res.data;
};

export const getVendorNames = async (vendorType) => {
  const res = await api.get(`/superadmin/api/get-vendor-names/${vendorType}`);
  return res.data;
};

// Sponsor APIs
export const getSponsorNames = async () => {
  const res = await api.get("/superadmin/api/get-sponsor-names");
  return res.data;
};

export const getEventsshow = async (organizerId) => {
  const url = organizerId
    ? `/superadmin/get-events?organizer=${encodeURIComponent(organizerId)}`
    : "/superadmin/get-events";
  const res = await api.get(url);
  return res.data;
};

// DELETE EVENT
export const deleteEvent = async (id) => {
  const res = await api.delete(`/superadmin/api/delete-event/${id}`);
  return res.data;
};

// user booking API
export const getEventById = async (id) => {
  const res = await api.get(`/superadmin/booking/event/${id}`);
  return res.data;
};

// OTP
export const sendOtp = async (email) => {
  const res = await api.post("/otp/send-otp", { email });
  return res.data;
};

export const verifyOtp = async (email, otp) => {
  const res = await api.post("/otp/verify-otp", { email, otp });
  return res.data;
};

export const resendOtp = async (email) => {
  const res = await api.post("/otp/resend-otp", { email });
  return res.data;
};

export const bookEvent = async (data) => {
  const res = await api.post("/user/book-event", data);
  return res.data;
};

// Stall Booking
export const bookStall = async (formData) => {
  const res = await api.post("/exhibitor/api/book-stall", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// GET ALL
export const getMyBookings = async (userId) => {
  const res = await api.get(`/exhibitor/api/my-bookings/${userId}`);
  return res.data;
};

// GET SINGLE
export const getBookingById = async (id) => {
  const res = await api.get(`/exhibitor/api/booking/${id}`);
  return res.data;
};

// UPDATE
export const updateBooking = async (id, data) => {
  const res = await api.put(`/exhibitor/api/update-booking/${id}`, data);
  return res.data;
};

// GET ALL BOOKINGS
export const getAllBookings = async () => {
  const res = await api.get("/superadmin/api/admin/bookings");
  return res.data;
};

export const getBookingsByEvent = async (eventId) => {
  const res = await api.get(`/superadmin/api/admin/bookings/event/${eventId}`);
  return res.data;
};

// UPDATE STATUS
export const updateBookingStatus = async (id, status) => {
  const res = await api.put(
    `/superadmin/api/admin/update-booking-status/${id}`,
    {
      status,
    },
  );
  return res.data;
};

export const getapprovalBookingById = async (id) => {
  const res = await api.get(`/superadmin/api/admin/booking/${id}`);
  return res.data;
};

// GET ALL EVENTS
export const getAllEvents = async () => {
  const res = await api.get("/superuser/get-events");
  return res.data;
};

export const updateEventStatus = async (id, status) => {
  const res = await api.put(`/superuser/update-status/${id}`, { status });
  return res.data;
};

export const getFullEventDetails = async (id) => {
  const res = await api.get(`/superuser/event-full-details/${id}`);
  return res.data;
};

export const getHomeEventshow = async () => {
  const res = await api.get("/superadmin/home/get-events");
  return res.data;
};

export const resetsendOtp = async (data) => {
  const res = await api.post("/otp/reset/send-otp", data);
  return res.data;
};

export const resetverifyOtp = async (data) => {
  const res = await api.post("/otp/reset/verify-otp", data);
  return res.data;
};

export const resetresendOtp = async (data) => {
  const res = await api.post("/otp/reset/resend-otp", data);
  return res.data;
};

export const resetPassword = async (data) => {
  const res = await api.post("/otp/reset-password", data);
  return res.data;
};

// Get all sponsors
export const getSponsors = async (organizerId) => {
  const url = organizerId
    ? `/superadmin/api/sponsors?organizer_id=${organizerId}`
    : "/superadmin/api/sponsors";
  const res = await api.get(url);
  return res.data;
};

// Create sponsor
export const createSponsor = async (formData) => {
  const res = await api.post("/superadmin/api/create_sponsor", formData);
  return res.data;
};

// Get single sponsor by ID
export const getSponsorById = async (id) => {
  const res = await api.get(`/superadmin/api/sponsor/${id}`);
  return res.data;
};

// Delete sponsor
export const deleteSponsor = async (id) => {
  const res = await api.delete(`/superadmin/api/delete_sponsor/${id}`);
  return res.data;
};

// Update sponsor
export const updateSponsor = async (id, data) => {
  const res = await api.put(`/superadmin/api/update_sponsor/${id}`, data);
  return res.data;
};

export const exportSponsorsExcel = async () => {
  const res = await api.get("/superadmin/api/sponsors/export/excel", {
    responseType: "blob",
  });
  return res;
};

export const exportSponsorsPdf = async () => {
  const res = await api.get("/superadmin/api/sponsors/export/pdf", {
    responseType: "blob",
  });
  return res;
};

// QR Validation
export const validateQr = async (id) => {
  const res = await api.get(`/user/validate-qr/${id}`);
  return res.data;
};

export const getTasks = async () => {
  const res = await api.get("/superadmin/api/get-tasks");
  return res.data;
};

export const createTasks = async (data) => {
  const res = await api.post("/superadmin/api/create-tasks", data);
  return res.data;
};

export const getAddOnEvents = async () => {
  const res = await api.get("/superadmin/api/add-on-spot-events");
  return res.data;
};

export const getEventscheckin = async () => {
  const res = await api.get("/superadmin/api/events-check-in");
  return res.data;
};

export const getProgramVerificationEvents = async () => {
  const res = await api.get("/superadmin/api/program-verification/events");
  return res.data;
};

export const getMessageGreetings = async () => {
  const res = await api.get("/superadmin/api/message-greetings");
  return res.data;
};

// GET messages
export const getMessagesByEventId = async (eventId) => {
  const res = await api.get(
    `/superadmin/api/message-greetings/${eventId}/messages`,
  );
  return res.data;
};

// CREATE message
export const createMessage = async (eventId, payload) => {
  const res = await api.post(
    `/superadmin/api/message-greetings/${eventId}/messages`,
    payload,
  );
  return res.data;
};

// DELETE message
export const deleteMessage = async (id) => {
  const res = await api.delete(
    `/superadmin/api/message-greetings/messages/${id}`,
  );
  return res.data;
};

// UPDATE message
export const updateMessage = async (id, payload) => {
  const res = await api.put(
    `/superadmin/api/message-greetings/messages/${id}`,
    payload,
  );
  return res.data;
};

// UPDATE Event
export const updateEvent = async (id, formData) => {
  const res = await api.put(`/superadmin/api/update-event/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// IMAGE upload
export const uploadImage = async (formData) => {
  const res = await api.post(`/api/upload-image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getEventFullDetails = async (id) => {
  const res = await api.get(`/superadmin/api/event-full-details/${id}`);
  return res.data;
};

// get abstract verification
export const getAbstract = async () => {
  const res = await api.get("/superadmin/api/abstract");
  return res.data;
};

export const getEventBulkDetails = async () => {
  const res = await api.get("/superadmin/api/event-bulk-details");
  return res.data;
};

export const getEventPasses = async () => {
  const res = await api.get("/superadmin/api/event-passes");
  return res.data;
};

export const getMyContacts = async () => {
  const res = await api.get("/superadmin/api/contacts");
  return res.data;
};

export const createMyContact = async (data) => {
  const res = await api.post("/superadmin/api/contacts", data);
  return res.data;
};

export const deleteMyContact = async (id) => {
  const res = await api.delete(`/superadmin/api/contacts/${id}`);
  return res.data;
};

export const updateMyContact = async (id, data) => {
  const res = await api.put(`/superadmin/api/contacts/${id}`, data);
  return res.data;
};

export const getExhibitorBookings = async () => {
  const res = await api.get("/superadmin/api/exhibitor/bookings_details");
  return res.data;
};

// Complaint Module
export const getComplaints = async () => {
  const res = await api.get("/superadmin/api/complaints");
  return res.data;
};

export const createComplaint = async (complaintData) => {
  const res = await api.post("/superadmin/api/complaints", complaintData);
  return res.data;
};

export const getApprovedEvents = async () => {
  const res = await api.get("/superadmin/api/approved-events");
  return res.data;
};

export const createProgram = async (data) => {
  const res = await api.post("/superadmin/api/programs", data);
  return res.data;
};

export const getProgramEvents = async (organizerId) => {
  const url = organizerId
    ? `/superadmin/api/program-events?organizer_id=${organizerId}`
    : "/superadmin/api/program-events";
  const res = await api.get(url);
  return res.data;
};

export const getProgramsByEvent = async (eventId) => {
  const res = await api.get(`/superadmin/api/program-list/${eventId}`);
  return res.data;
};

export const deleteComplaint = async (complaintId) => {
  const res = await api.delete(`/superadmin/api/complaints/${complaintId}`);
  return res.data;
};

// Chatbot API
export const chatWithBot = async (message, userId) => {
  const res = await api.post("/chatbot/chat", { message, user_id: userId });
  return res.data;
};

// USER PROFILE APIs
export const getUserProfile = async (userId) => {
  const res = await api.get(`/superadmin/api/user/profile/${userId}`);
  return res.data;
};

export const updateUserProfile = async (formData) => {
  const res = await api.post("/superadmin/api/user/update_profile", formData);
  return res.data;
};

// Feedback APIs
export const getFeedbacks = async () => {
  const res = await api.get("/superadmin/api/feedbacks");
  return res.data;
};

export const getFeedbackById = async (id) => {
  const res = await api.get(`/superadmin/api/feedbacks/${id}`);
  return res.data;
};

export const createFeedback = async (data) => {
  const res = await api.post("/superadmin/api/feedbacks", data);
  return res.data;
};

export const updateFeedback = async (id, data) => {
  const res = await api.put(`/superadmin/api/feedbacks/${id}`, data);
  return res.data;
};

export const deleteFeedback = async (id) => {
  const res = await api.delete(`/superadmin/api/feedbacks/${id}`);
  return res.data;
};

// RAZORPAY PAYMENT APIs
export const createPaymentOrder = async (payload) => {
  const res = await api.post("/api/payments/create-order", payload);
  return res.data;
};

export const verifyPaymentSignature = async (payload) => {
  const res = await api.post("/api/payments/verify-signature", payload);
  return res.data;
};

export const requestPaymentRefund = async (payload) => {
  const res = await api.post("/api/payments/refund", payload);
  return res.data;
};

export default api;

