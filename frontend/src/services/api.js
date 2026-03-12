import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

/**
 * Response interceptor — ONLY normalises error messages.
 * It does NOT fire any toast. Pages decide how to surface errors:
 *   - GET / background fetches  → inline error state, no toast
 *   - POST / DELETE mutations   → caller fires toast on success/failure
 */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      "An unexpected error occurred.";
    return Promise.reject(new Error(message));
  }
);

export const employeeAPI = {
  getAll:  ()     => api.get("/employees/").then((r) => r.data),
  create:  (data) => api.post("/employees/", data).then((r) => r.data),
  delete:  (id)   => api.delete(`/employees/${id}`).then((r) => r.data),
};

export const attendanceAPI = {
  mark:          (data)       => api.post("/attendance/", data).then((r) => r.data),
  getByEmployee: (id, date)   => {
    const params = date ? { date } : {};
    return api.get(`/attendance/${id}`, { params }).then((r) => r.data);
  },
};

export const dashboardAPI = {
  getStats:         () => api.get("/dashboard/stats").then((r) => r.data),
  getRecentEmployees: () => api.get("/employees/").then((r) => r.data.slice(0, 5)),
};

export default api;
