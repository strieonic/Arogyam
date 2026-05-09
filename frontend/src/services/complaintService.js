import api from "./api";

// Use FormData for creating a complaint with file attachments
export const createComplaint = (formData) => api.post("/complaints", formData, {
  headers: { "Content-Type": "multipart/form-data" }
});

export const getMyComplaints = () => api.get("/complaints/my-tickets");

export const getComplaintById = (id) => api.get(`/complaints/${id}`);

export const replyToComplaint = (id, data) => api.post(`/complaints/${id}/reply`, data);

export const getAllComplaints = () => api.get("/complaints/admin/all");

export const updateComplaintStatus = (id, data) => api.put(`/complaints/admin/${id}/status`, data);
