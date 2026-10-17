import API from "./axios";

export const quotationAPI = {
  getAll: (params) => API.get("/quotations", { params }),
  getById: (id) => API.get(`/quotations/${id}`),
  create: (data) => API.post("/quotations", data),
  update: (id, data) => API.put(`/quotations/${id}`, data),
  delete: (id) => API.delete(`/quotations/${id}`),
  updateStatus: (id, status) => API.patch(`/quotations/${id}/status`, { status }),
  sendEmail: (id) => API.post(`/quotations/${id}/send-email`),
  convertToInvoice: (id) => API.post("/invoices/from-quotation", { quotationId: id }),
  getStats: () => API.get("/quotations/stats"),
  getClients: () => API.get("/clients", { params: { limit: 200 } }),
  getCompanySettings: () => API.get("/settings/company"),
};
