import axios from "axios";

const API_URL = "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect for admin routes, not employee PIN verification
      const url = error.config?.url || "";
      if (
        !url.includes("/employees/verify-pin") &&
        !url.includes("/time-entries/employee")
      ) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_data");
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

export default {
  // Admin
  checkAdminExists() {
    return api.get("/admin/exists");
  },
  // Admin
  adminSignup(data) {
    return api.post("/admin/signup", data);
  },
  adminSignin(data) {
    return api.post("/admin/signin", data);
  },
  getAdminProfile() {
    return api.get("/admin/profile");
  },

  // Employees
  createEmployee(data) {
    return api.post("/employees", data);
  },
  getEmployees() {
    return api.get("/employees");
  },
  getEmployee(id) {
    return api.get(`/employees/${id}`);
  },
  updateEmployee(id, data) {
    return api.put(`/employees/${id}`, data);
  },
  deleteEmployee(id) {
    return api.delete(`/employees/${id}`);
  },
  verifyPin(pin) {
    return api.post("/employees/verify-pin", { pin });
  },

  // Time Entries
  clockIn(pin) {
    return api.post("/time-entries/clock-in", { pin });
  },
  clockOut(pin, notes = "") {
    return api.post("/time-entries/clock-out", { pin, notes });
  },
  getStatus(pin) {
    return api.post("/time-entries/status", { pin });
  },
  getMyEntries(pin, filters = {}) {
    return api.post("/time-entries/my-entries", { pin, ...filters });
  },
  getAllTimeEntries(filters = {}) {
    return api.get("/time-entries", { params: filters });
  },
  updateTimeEntry(id, data) {
    return api.put(`/time-entries/${id}`, data);
  },
  deleteTimeEntry(id) {
    return api.delete(`/time-entries/${id}`);
  },
  createManualEntry(data) {
    return api.post("/time-entries/manual", data);
  },
  getSummaryReport(filters = {}) {
    return api.get("/time-entries/reports/summary", { params: filters });
  },

  // Employee self-service endpoints
  createEmployeeEntry(pin, data) {
    return api.post("/time-entries/employee-entry", { pin, ...data });
  },
  updateEmployeeEntry(pin, entryId, data) {
    return api.put(`/time-entries/employee-entry/${entryId}`, { pin, ...data });
  },
  deleteEmployeeEntry(pin, entryId) {
    return api.delete(`/time-entries/employee-entry/${entryId}`, {
      data: { pin },
    });
  },
};
