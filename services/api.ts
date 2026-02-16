import axios from "axios";
import { router } from "expo-router";
import {
  getRefreshToken,
  getToken,
  removeToken,
  saveToken,
} from "../utils/authStorage";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/* =========================
   RESPONSE INTERCEPTOR
   (AUTO REFRESH TOKEN)
========================= */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const res = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken },
        );

        const newAccessToken = res.data.accessToken;

        await saveToken(newAccessToken, refreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (err) {
        await removeToken();
        router.replace("/login");
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
