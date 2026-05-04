import { create } from "zustand";
import api from "../utils/api";

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem("mm_user") || "null"),
  token: localStorage.getItem("mm_token") || null,
  loading: false,
  error: null,

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/auth/register", data);
      localStorage.setItem("mm_token", res.data.token);
      localStorage.setItem("mm_user", JSON.stringify(res.data.user));
      set({ user: res.data.user, token: res.data.token, loading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || "Registration failed";
      set({ error: msg, loading: false });
      return { success: false, error: msg };
    }
  },

  login: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/auth/login", data);
      localStorage.setItem("mm_token", res.data.token);
      localStorage.setItem("mm_user", JSON.stringify(res.data.user));
      set({ user: res.data.user, token: res.data.token, loading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || "Login failed";
      set({ error: msg, loading: false });
      return { success: false, error: msg };
    }
  },

  logout: () => {
    localStorage.removeItem("mm_token");
    localStorage.removeItem("mm_user");
    set({ user: null, token: null });
  },

  updateUser: async (data) => {
    set({ loading: true });
    try {
      const res = await api.put("/auth/profile", data);
      localStorage.setItem("mm_user", JSON.stringify(res.data));
      set({ user: res.data, loading: false });
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return { success: false, error: err.response?.data?.error };
    }
  },

  fetchMe: async () => {
    try {
      const res = await api.get("/auth/me");
      localStorage.setItem("mm_user", JSON.stringify(res.data));
      set({ user: res.data });
    } catch (err) {
      get().logout();
    }
  },
}));

export default useAuthStore;