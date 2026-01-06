import { create } from "zustand";
import { INITIALIZED, LOADING, LOADED, FAILED } from "./const";
const API_URL = import.meta.env.VITE_API_URL || "http://25.16.201.205:3000";

export const useShopStore = create((set, get) => ({
  allItems: [],
  items: [],
  loading: INITIALIZED,
  error: null,

  getShop: async () => {
    try {
      set({ loading: LOADING, error: null });

      const res = await fetch(`${API_URL}/shop`);
      if (!res.ok) throw new Error("Failed to fetch shop");

      const data = await res.json();
      set({ allItems: data, items: data, loading: LOADED });
    } catch (err) {
      set({ loading: FAILED, error: err.message });
    }
  },

  searchShop: async (keyword) => {
    try {
      set({ loading: LOADING });

      const res = await fetch(
        `${API_URL}/searchShop/${encodeURIComponent(keyword)}`
      );
      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      set({ items: data, loading: LOADED });
    } catch (err) {
      set({ loading: FAILED, error: err.message });
    }
  },

  clearShop: () => {
    set({ items: get().allItems });
  },
}));
