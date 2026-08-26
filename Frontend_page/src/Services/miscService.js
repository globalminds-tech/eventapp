import apiClient from "./client";

export const validateQr = async (id) => {
  const res = await apiClient.get(`/user/validate-qr/${id}`);
  return res.data;
};

export const getTasks = async () => {
  const res = await apiClient.get("/superadmin/api/get-tasks");
  return res.data;
};

export const createTasks = async (data) => {
  const res = await apiClient.post("/superadmin/api/create-tasks", data);
  return res.data;
};

export const getAddOnEvents = async () => {
  const res = await apiClient.get("/superadmin/api/add-on-spot-events");
  return res.data;
};

export const getEventscheckin = async () => {
  const res = await apiClient.get("/superadmin/api/events-check-in");
  return res.data;
};

export const getProgramVerificationEvents = async () => {
  const res = await apiClient.get("/superadmin/api/program-verification/events");
  return res.data;
};

export const getMessageGreetings = async () => {
  const res = await apiClient.get("/superadmin/api/message-greetings");
  return res.data;
};

export const getMessagesByEventId = async (eventId) => {
  const res = await apiClient.get(`/superadmin/api/message-greetings/${eventId}/messages`);
  return res.data;
};

export const createMessage = async (eventId, payload) => {
  const res = await apiClient.post(`/superadmin/api/message-greetings/${eventId}/messages`, payload);
  return res.data;
};

export const deleteMessage = async (id) => {
  const res = await apiClient.delete(`/superadmin/api/message-greetings/messages/${id}`);
  return res.data;
};

export const updateMessage = async (id, payload) => {
  const res = await apiClient.put(`/superadmin/api/message-greetings/messages/${id}`, payload);
  return res.data;
};

export const uploadImage = async (formData) => {
  const res = await apiClient.post(`/api/upload-image`, formData, {
    headers: { "Content-Type": undefined },
  });
  return res.data;
};

export const getAbstract = async () => {
  const res = await apiClient.get("/superadmin/api/abstract");
  return res.data;
};

export const getEventPasses = async () => {
  const res = await apiClient.get("/superadmin/api/event-passes");
  return res.data;
};

export const getMyContacts = async () => {
  const res = await apiClient.get("/superadmin/api/contacts");
  return res.data;
};

export const createMyContact = async (data) => {
  const res = await apiClient.post("/superadmin/api/contacts", data);
  return res.data;
};

export const deleteMyContact = async (id) => {
  const res = await apiClient.delete(`/superadmin/api/contacts/${id}`);
  return res.data;
};

export const updateMyContact = async (id, data) => {
  const res = await apiClient.put(`/superadmin/api/contacts/${id}`, data);
  return res.data;
};

export const getComplaints = async () => {
  const res = await apiClient.get("/superadmin/api/complaints");
  return res.data;
};

export const createComplaint = async (complaintData) => {
  const res = await apiClient.post("/superadmin/api/complaints", complaintData);
  return res.data;
};

export const deleteComplaint = async (complaintId) => {
  const res = await apiClient.delete(`/superadmin/api/complaints/${complaintId}`);
  return res.data;
};

export const createProgram = async (data) => {
  const res = await apiClient.post("/superadmin/api/programs", data);
  return res.data;
};

export const getProgramEvents = async (organizerId) => {
  const url = organizerId ? `/superadmin/api/program-events?organizer_id=${organizerId}` : "/superadmin/api/program-events";
  const res = await apiClient.get(url);
  return res.data;
};

export const getProgramsByEvent = async (eventId) => {
  const res = await apiClient.get(`/superadmin/api/program-list/${eventId}`);
  return res.data;
};

export const chatWithBot = async (message, userId) => {
  const res = await apiClient.post("/chatbot/chat", { message, user_id: userId });
  return res.data;
};

export const getFeedbacks = async () => {
  const res = await apiClient.get("/superadmin/api/feedbacks");
  return res.data;
};

export const getFeedbackById = async (id) => {
  const res = await apiClient.get(`/superadmin/api/feedbacks/${id}`);
  return res.data;
};

export const createFeedback = async (data) => {
  const res = await apiClient.post("/superadmin/api/feedbacks", data);
  return res.data;
};

export const updateFeedback = async (id, data) => {
  const res = await apiClient.put(`/superadmin/api/feedbacks/${id}`, data);
  return res.data;
};

export const deleteFeedback = async (id) => {
  const res = await apiClient.delete(`/superadmin/api/feedbacks/${id}`);
  return res.data;
};

export const getAdminCategories = async () => {
  try {
    const res = await apiClient.get("/api/admin/categories");
    return res.data;
  } catch {
    return { success: false, categories: [] };
  }
};

export const createAdminCategory = async (payload) => {
  const res = await apiClient.post("/api/admin/categories", payload);
  return res.data;
};

export const getPendingOrganizers = async () => {
  try {
    const res = await apiClient.get("/api/admin/organizers/kyc-pending");
    return res.data;
  } catch {
    return { success: false, organizers: [] };
  }
};

export const updateOrganizerKycStatus = async (userId, status) => {
  const res = await apiClient.put(`/api/admin/organizers/${userId}/kyc-status`, { status });
  return res.data;
};

export const getUsers = async () => {
  const response = await apiClient.get("/admin/users");
  return response.data;
};
