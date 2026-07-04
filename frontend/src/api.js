import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/tasks",
});

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }

  return config;
});

export const authAPI = axios.create({
  baseURL: "http://localhost:5000/api/auth",
});

export default API;