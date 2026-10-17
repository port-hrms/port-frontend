// client/src/api/superadminAxios.js
import axios from "axios";
import { config } from "../config";

const SuperAdminAPI = axios.create({
  baseURL: config.apiBaseUrl,
});

SuperAdminAPI.interceptors.request.use(
  (cfg) => {
    const token = localStorage.getItem("sa_token");
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  },
  (error) => Promise.reject(error)
);

SuperAdminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("sa_token");
      localStorage.removeItem("sa_user");
      window.location.href = "/superadmin/login";
    }
    return Promise.reject(error);
  }
);

export default SuperAdminAPI;
