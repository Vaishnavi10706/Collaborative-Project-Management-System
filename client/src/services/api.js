// src/services/api.js
// This file handles ALL communication with our backend server
// Instead of writing fetch() calls everywhere, we put them all here
// 
// Think of this as a "phone book" for our backend API

import axios from "axios";

// In production this will be your Render backend URL (set in .env)
// In development it falls back to localhost
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// axios interceptor: automatically add the token to every request
// So we don't have to manually write the token in every API call
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token"); // get saved token
  if (token) {
    req.headers.Authorization = `Bearer ${token}`; // attach to every request
  }
  return req;
});

// Response interceptor: if server says token is invalid, clear it
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ---- AUTH ----
export const loginUser = (data) => API.post("/auth/login", data);
export const registerUser = (data) => API.post("/auth/register", data);
export const getMe = () => API.get("/auth/me");

// ---- PROJECTS ----
export const getProjects = () => API.get("/projects");
export const getProject = (id) => API.get(`/projects/${id}`);
export const createProject = (data) => API.post("/projects", data);
export const updateProject = (id, data) => API.put(`/projects/${id}`, data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);
export const addMember = (id, email) => API.post(`/projects/${id}/members`, { email });

// ---- TASKS ----
export const getTasks = (projectId, filters = {}) =>
  API.get(`/tasks/project/${projectId}`, { params: filters });
export const createTask = (data) => API.post("/tasks", data);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
export const getTaskStats = (projectId) => API.get(`/tasks/stats/${projectId}`);

// ---- ACTIVITY ----
export const getActivity = (projectId) => API.get(`/activity/project/${projectId}`);
